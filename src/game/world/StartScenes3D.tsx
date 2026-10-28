/**
 * Hai cảnh 3D của trang Bắt đầu ở đây:
 *  - FilterScene: lá bài chiến lược rơi vào phễu lọc, cứ 300 lá thì 15 lá lọt qua (đúng tỉ lệ thư viện), số còn lại tắt màu văng ra.
 *  - CalendarScene: tờ lịch có 2 ngày giao dịch cuối tháng sáng "Mua", tờ tháng sau sáng ngày giao dịch thứ 3 "Bán".
 * Không biểu đồ giá, không mũi tên, không đồng xu.
 */
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { startMiniScene } from './miniScene';

const CYAN = 0x3df2ff;
const ACCENT = 0x2bffea;
const PASS_RATE = 15 / 300;

export function FilterScene({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const mount = ref.current;
    if (!mount) return;
    return startMiniScene(
      mount,
      (scene) => {
        // Phễu: mặt lưới sáng + vành miệng phễu
        const funnelGeo = new THREE.CylinderGeometry(3, 0.45, 2.6, 24, 4, true);
        const funnel = new THREE.Mesh(
          funnelGeo,
          new THREE.MeshStandardMaterial({ color: 0x0b2236, emissive: 0x00486b, emissiveIntensity: 0.6, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false }),
        );
        funnel.add(new THREE.LineSegments(new THREE.WireframeGeometry(funnelGeo), new THREE.LineBasicMaterial({ color: CYAN, transparent: true, opacity: 0.35 })));
        funnel.position.y = 0.3;
        const lip = new THREE.Mesh(new THREE.TorusGeometry(3, 0.06, 8, 64), new THREE.MeshStandardMaterial({ color: CYAN, emissive: CYAN, emissiveIntensity: 1.4 }));
        lip.rotation.x = Math.PI / 2;
        lip.position.y = 1.6;
        // Đáy: vũng sáng nơi lá lọt qua rơi xuống
        const pool = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.08, 32), new THREE.MeshStandardMaterial({ color: ACCENT, emissive: ACCENT, emissiveIntensity: 1.2 }));
        pool.position.y = -2.6;
        const poolRing = new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.03, 6, 48), new THREE.MeshStandardMaterial({ color: CYAN, emissive: CYAN, emissiveIntensity: 1.5 }));
        poolRing.rotation.x = Math.PI / 2;
        poolRing.position.y = -2.55;
        scene.add(funnel, lip, pool, poolRing);

        // Lá bài: tái sử dụng một nhóm cố định
        const N = 46;
        const cardGeo = new THREE.BoxGeometry(0.42, 0.58, 0.03);
        type Card = { m: THREE.Mesh; mat: THREE.MeshStandardMaterial; v: THREE.Vector3; spin: THREE.Vector3; pass: boolean; judged: boolean; delay: number };
        const cards: Card[] = [];
        let seed = 7;
        const rnd = () => {
          seed = (seed * 9301 + 49297) % 233280;
          return seed / 233280;
        };
        // Đúng 15/300: dùng bộ đếm thay vì ngẫu nhiên để tỉ lệ luôn khớp
        let dealt = 0;
        const reset = (c: Card, first: boolean) => {
          const a = rnd() * Math.PI * 2;
          const r = rnd() * 2.4;
          c.m.position.set(Math.cos(a) * r, 5 + rnd() * (first ? 6 : 1.5), Math.sin(a) * r);
          c.v.set(0, -(1.6 + rnd() * 0.8), 0);
          c.spin.set((rnd() - 0.5) * 3, (rnd() - 0.5) * 3, (rnd() - 0.5) * 3);
          dealt += 1;
          c.pass = dealt % Math.round(1 / PASS_RATE) === 0;
          c.judged = false;
          c.mat.color.setHex(0xd6e2ee);
          c.mat.emissive.setHex(0x00486b);
          c.mat.emissiveIntensity = 0.5;
          c.mat.opacity = 1;
          c.delay = first ? 0 : rnd() * 0.6;
        };
        for (let k = 0; k < N; k++) {
          const mat = new THREE.MeshStandardMaterial({ color: 0xd6e2ee, transparent: true, roughness: 0.5 });
          const m = new THREE.Mesh(cardGeo, mat);
          scene.add(m);
          const c: Card = { m, mat, v: new THREE.Vector3(), spin: new THREE.Vector3(), pass: false, judged: false, delay: 0 };
          reset(c, true);
          cards.push(c);
        }

        return (t, dt) => {
          lip.material.emissiveIntensity = 1.2 + Math.sin(t * 2) * 0.3;
          funnel.rotation.y = t * 0.15;
          cards.forEach((c) => {
            if (c.delay > 0) {
              c.delay -= dt;
              return;
            }
            const p = c.m.position;
            if (!c.judged && p.y < 1.7) {
              c.judged = true;
              if (c.pass) {
                c.mat.color.setHex(ACCENT);
                c.mat.emissive.setHex(ACCENT);
                c.mat.emissiveIntensity = 1.6;
                c.v.set(-p.x * 1.2, -2.2, -p.z * 1.2);
              } else {
                // Rớt: tắt màu, văng ra ngoài miệng phễu
                c.mat.color.setHex(0x2a3341);
                c.mat.emissive.setHex(0x000000);
                const out = new THREE.Vector3(p.x, 0, p.z).normalize().multiplyScalar(2.2 + Math.random());
                if (!isFinite(out.x)) out.set(2.4, 0, 0);
                c.v.set(out.x, 1.2, out.z);
              }
            }
            if (c.judged && !c.pass) {
              c.v.y -= 6 * dt;
              c.mat.opacity = Math.max(0, c.mat.opacity - dt * 0.7);
            }
            if (c.judged && c.pass && p.y < -2.4) {
              c.v.set(0, 0, 0);
              c.mat.opacity = Math.max(0, c.mat.opacity - dt * 0.8);
            }
            p.addScaledVector(c.v, dt);
            c.m.rotation.x += c.spin.x * dt;
            c.m.rotation.y += c.spin.y * dt;
            c.m.rotation.z += c.spin.z * dt;
            if (p.y < -8 || c.mat.opacity <= 0) reset(c, false);
          });
        };
      },
      { pos: [0, 3.2, 11], look: [0, 0.2, 0], fov: 42, fitWidth: 7.4 },
    );
  }, []);
  return <div ref={ref} className={className} aria-hidden />;
}

/** Vẽ một tờ lịch lên canvas: hàng thứ, lưới ngày, ô được tô sáng */
function pageTexture(title: string, startDow: number, days: number, lit: number[], litColor: string) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 460;
  const g = c.getContext('2d');
  if (!g) return new THREE.CanvasTexture(c);
  g.fillStyle = '#0b1a28';
  g.fillRect(0, 0, 512, 460);
  g.fillStyle = '#123247';
  g.fillRect(0, 0, 512, 70);
  g.fillStyle = '#e6f6ff';
  g.font = 'bold 30px sans-serif';
  g.textAlign = 'center';
  g.fillText(title, 256, 46);
  const dows = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  g.font = '600 18px sans-serif';
  dows.forEach((d, i) => {
    g.fillStyle = i >= 5 ? '#4a5a6a' : '#8fb3c6';
    g.fillText(d, 37 + i * 73, 100);
  });
  for (let d = 1; d <= days; d++) {
    const idx = startDow + d - 1;
    const col = idx % 7;
    const row = Math.floor(idx / 7);
    const x = 4 + col * 73;
    const y = 115 + row * 57;
    const on = lit.includes(d);
    g.fillStyle = on ? litColor : col >= 5 ? '#0f1b26' : '#132636';
    g.fillRect(x, y, 67, 51);
    g.fillStyle = on ? '#04131c' : col >= 5 ? '#3b4a58' : '#cfe3ee';
    g.font = on ? 'bold 24px sans-serif' : '20px sans-serif';
    g.fillText(String(d), x + 33, y + 33);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export function CalendarScene({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const mount = ref.current;
    if (!mount) return;
    return startMiniScene(
      mount,
      (scene) => {
        // Tháng này: 31 ngày, ngày 1 là thứ Tư → 30 (T5), 31 (T6) là 2 ngày giao dịch cuối.
        // Tháng sau: ngày 1 là thứ Bảy → ngày giao dịch thứ 3 là ngày 5 (T4).
        const makePage = (tex: THREE.Texture, w: number) => {
          const g = new THREE.Group();
          const board = new THREE.Mesh(new THREE.BoxGeometry(w, w * 0.9, 0.12), new THREE.MeshStandardMaterial({ color: 0x1b2a3a, roughness: 0.8 }));
          const face = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.96, w * 0.86), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
          face.position.z = 0.065;
          g.add(board, face);
          // Khoen gáy lịch
          [-0.3, 0, 0.3].forEach((k) => {
            const ring = new THREE.Mesh(new THREE.TorusGeometry(w * 0.05, w * 0.012, 6, 16), new THREE.MeshStandardMaterial({ color: CYAN, emissive: CYAN, emissiveIntensity: 0.8 }));
            ring.position.set(k * w, w * 0.45, 0);
            g.add(ring);
          });
          return g;
        };
        const thisMonth = makePage(pageTexture('Tháng này', 2, 31, [30, 31], '#2BFFEA'), 4.4);
        thisMonth.position.set(-1.1, 0.2, 0);
        thisMonth.rotation.y = 0.22;
        const nextMonth = makePage(pageTexture('Tháng sau', 5, 30, [5], '#FFDD00'), 3.2);
        nextMonth.position.set(2.6, -0.3, -1.2);
        nextMonth.rotation.y = -0.28;
        scene.add(thisMonth, nextMonth);

        // Khối sáng nổi lên trên các ô Mua / Bán. Vị trí tính theo lưới của canvas.
        const cellPos = (page: THREE.Group, w: number, startDow: number, d: number) => {
          const idx = startDow + d - 1;
          const col = idx % 7;
          const row = Math.floor(idx / 7);
          const fw = w * 0.96;
          const fh = w * 0.86;
          const u = (4 + col * 73 + 33) / 512;
          const v = (115 + row * 57 + 25) / 460;
          const local = new THREE.Vector3((u - 0.5) * fw, (0.5 - v) * fh, 0.2);
          return { page, local };
        };
        const glows = [
          { ...cellPos(thisMonth, 4.4, 2, 30), color: ACCENT, size: 0.52 },
          { ...cellPos(thisMonth, 4.4, 2, 31), color: ACCENT, size: 0.52 },
          { ...cellPos(nextMonth, 3.2, 5, 5), color: 0xffdd00, size: 0.38 },
        ].map(({ page, local, color, size }, i) => {
          const m = new THREE.Mesh(
            new THREE.BoxGeometry(size, size * 0.75, 0.12),
            new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 1.2, transparent: true, opacity: 0.85 }),
          );
          m.position.copy(local);
          page.add(m);
          return { m, base: local.z, phase: i * 0.6 };
        });

        return (t) => {
          thisMonth.rotation.y = 0.22 + Math.sin(t * 0.5) * 0.06;
          nextMonth.rotation.y = -0.28 + Math.sin(t * 0.5 + 1) * 0.05;
          thisMonth.position.y = 0.2 + Math.sin(t * 0.9) * 0.06;
          nextMonth.position.y = -0.3 + Math.sin(t * 0.9 + 1.2) * 0.06;
          glows.forEach((g) => {
            g.m.position.z = g.base + 0.12 + Math.sin(t * 2 + g.phase) * 0.08;
            (g.m.material as THREE.MeshStandardMaterial).emissiveIntensity = 1 + Math.sin(t * 2 + g.phase) * 0.4;
          });
        };
      },
      { pos: [0.6, 0.6, 9], look: [0.5, -0.1, 0], fov: 40, fitWidth: 9 },
    );
  }, []);
  return <div ref={ref} className={className} aria-hidden />;
}
