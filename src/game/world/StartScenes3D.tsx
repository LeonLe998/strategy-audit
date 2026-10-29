/**
 * Hai cảnh 3D của trang Bắt đầu ở đây:
 *  - FilterScene: phễu 3 tầng. Ý tưởng gốc + khung nến rơi vào, ghép thành chiến lược có tên thật, đem đi đo rồi tách Đạt / Không đạt.
 *  - CalendarScene: tờ lịch có 2 ngày giao dịch cuối tháng sáng "Mua", tờ tháng sau sáng ngày giao dịch thứ 3 "Bán".
 * Không biểu đồ giá, không mũi tên, không đồng xu.
 */
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { startMiniScene, type Frame } from './miniScene';

const CYAN = 0x3df2ff;
const ACCENT = 0x2bffea;
/** Ý tưởng gốc viết bằng lời thường cho người mới (không dùng tên nhóm nội bộ) */
const IDEA: Record<string, string> = {
  'Indicator kinh điển': 'Chỉ báo',
  'Viral & SMC/ICT': 'SMC · ICT',
  'Mẫu nến': 'Mẫu nến',
  'Breakout & phiên': 'Phá vỡ · phiên',
  'Đa khung & lai': 'Nhiều khung nến',
  'Hồi quy trung bình': 'Giá về trung bình',
  'Giờ giấc & mùa vụ': 'Giờ · lịch',
};
const TF: Record<string, string> = { M5: 'Nến 5 phút', M15: 'Nến 15 phút', M30: 'Nến 30 phút', H1: 'Nến 1 giờ', H4: 'Nến 4 giờ', D1: 'Nến ngày', W1: 'Nến tuần' };

interface Strat {
  ten: string;
  ho: string;
  tf: string;
  pass: boolean;
}

/** Nhãn chữ dạng viên thuốc, luôn quay mặt về máy quay */
function chip(text: string, o: { bg: string; border: string; color?: string; size?: number; anchor?: [number, number]; k?: number }) {
  const fs = o.size ?? 30;
  const c = document.createElement('canvas');
  const g = c.getContext('2d');
  const font = `600 ${fs}px "Be Vietnam Pro", system-ui, sans-serif`;
  if (!g) return new THREE.Sprite();
  g.font = font;
  const w = Math.ceil(g.measureText(text).width) + 36;
  const h = Math.ceil(fs * 1.7);
  c.width = w;
  c.height = h;
  g.font = font;
  g.fillStyle = o.bg;
  g.strokeStyle = o.border;
  g.lineWidth = 3;
  g.beginPath();
  g.roundRect(2, 2, w - 4, h - 4, h / 2 - 2);
  g.fill();
  g.stroke();
  g.fillStyle = o.color ?? '#e6f6ff';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(text, w / 2, h / 2 + 1);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false }));
  const k = o.k ?? 0.0105;
  s.scale.set(w * k, h * k, 1);
  s.userData.base = [w * k, h * k];
  if (o.anchor) s.center.set(...o.anchor);
  return s;
}

const lerp = THREE.MathUtils.lerp;
const ease = (x: number) => x * x * (3 - 2 * x);
const seg = (u: number, a: number, b: number) => THREE.MathUtils.clamp((u - a) / (b - a), 0, 1);

/**
 * Phễu 3 tầng: (1) ý tưởng gốc rơi vào · (2) ghép ý tưởng + khung nến thành một chiến lược có tên thật
 * · (3) đem đi đo, rồi tách sang Đạt (trái) hoặc Không đạt (phải). Tên và kết quả lấy từ thư viện thật,
 * nên tỉ lệ lá sang Đạt đúng bằng 15/242.
 */
export function FilterScene({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const mount = ref.current;
    if (!mount) return;
    let stop: (() => void) | undefined;
    let cancelled = false;
    fetch('/data/thuvien_data/thu_vien_index.json')
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        const list: Strat[] = (d.danh_sach as { ten: string; ho: string; tf: string; verdict: string; trang_thai: string }[])
          .filter((x) => x.trang_thai === 'da_kiem_dinh' && ['CHẤT', 'CHÁT', 'TÌNH HUỐNG'].includes(x.verdict))
          .map((x) => ({ ten: x.ten, ho: x.ho, tf: x.tf, pass: x.verdict === 'CHẤT' }));
        const v = d.verdict_da_chay as Record<string, number>;
        // Màn hẹp: phễu thu bề ngang, chữ to hơn, nhãn tầng đặt phía trên vành thay vì bên trái
        const narrow = mount.clientWidth < 640;
        stop = startMiniScene(mount, (scene) => buildFilter(scene, list, v['CHẤT'] ?? 0, (v['CHÁT'] ?? 0) + (v['TÌNH HUỐNG'] ?? 0), narrow), {
          pos: [0, 1.4, 15],
          look: [0, 0.4, 0],
          fov: 42,
          fitWidth: narrow ? 8.4 : 12.5,
        });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
      stop?.();
    };
  }, []);
  return <div ref={ref} className={className} aria-hidden />;
}

function buildFilter(scene: THREE.Scene, list: Strat[], passCount: number, failCount: number, narrow: boolean): Frame {
  const W = narrow ? 0.66 : 1;
  const K = narrow ? 0.0135 : 0.0105;
  // Ba tầng phễu: vành sáng + thân lưới nối giữa các tầng
  const TIERS = [
    { y: 3.6, r: 5.2 * W, label: '1 · Ý tưởng' },
    { y: 1.2, r: 3.4 * W, label: '2 · Ghép thành chiến lược' },
    { y: -1.2, r: 1.6 * W, label: '3 · Đem đi đo' },
  ];
  const ringMats: THREE.MeshStandardMaterial[] = [];
  TIERS.forEach((t, i) => {
    const mat = new THREE.MeshStandardMaterial({ color: CYAN, emissive: CYAN, emissiveIntensity: i === 2 ? 1.6 : 1.1 });
    ringMats.push(mat);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(t.r, 0.05, 8, 72), mat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = t.y;
    scene.add(ring);
    const label = chip(t.label, { bg: 'rgba(4,9,20,0.85)', border: 'rgba(61,242,255,0.5)', size: 26, k: K, anchor: narrow ? [0, 0] : [1, 0.5] });
    if (narrow) label.position.set(-4.1, t.y + 0.2, 0.5);
    else label.position.set(-t.r - 0.35, t.y, 0);
    scene.add(label);
    const next = TIERS[i + 1];
    if (next) {
      const geo = new THREE.CylinderGeometry(t.r, next.r, t.y - next.y, 36, 3, true);
      const body = new THREE.Mesh(
        geo,
        new THREE.MeshStandardMaterial({ color: 0x0b2236, emissive: 0x00486b, emissiveIntensity: 0.5, transparent: true, opacity: 0.32, side: THREE.DoubleSide, depthWrite: false }),
      );
      body.add(new THREE.LineSegments(new THREE.WireframeGeometry(geo), new THREE.LineBasicMaterial({ color: CYAN, transparent: true, opacity: 0.16 })));
      body.position.y = (t.y + next.y) / 2;
      scene.add(body);
    }
  });

  // Đáy: hai máng tách sang Đạt (trái, sáng) và Không đạt (phải, tối)
  const BIN_Y = -4.1;
  const bins = [
    { x: -3.6 * (narrow ? 0.6 : 1), color: ACCENT, text: `ĐẠT · ${passCount}`, bg: 'rgba(43,255,234,0.18)', border: '#2BFFEA', fg: '#2BFFEA' },
    { x: 3.6 * (narrow ? 0.6 : 1), color: 0x5a6676, text: `KHÔNG ĐẠT · ${failCount}`, bg: 'rgba(90,102,118,0.25)', border: '#7a8a9a', fg: '#c5d0da' },
  ];
  bins.forEach((b) => {
    const tray = new THREE.Mesh(
      new THREE.CylinderGeometry(1.5 * W, 1.2 * W, 0.35, 32),
      new THREE.MeshStandardMaterial({ color: b.color, emissive: b.color, emissiveIntensity: b.color === ACCENT ? 0.9 : 0.15, transparent: true, opacity: 0.75 }),
    );
    tray.position.set(b.x, BIN_Y, 0);
    const label = chip(b.text, { bg: b.bg, border: b.border, color: b.fg, size: narrow ? 24 : 30, k: K });
    label.position.set(b.x, BIN_Y - 0.75, 0);
    scene.add(tray, label);
  });
  // Mũi chia đôi ngay dưới tầng đo
  const splitter = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.6, 4), new THREE.MeshStandardMaterial({ color: CYAN, emissive: CYAN, emissiveIntensity: 1 }));
  splitter.position.y = -2.3;
  scene.add(splitter);

  // Dòng chảy: mỗi lượt là 2 viên ý tưởng (ý tưởng + khung nến) → ghép thành 1 viên tên chiến lược → đo → sang máng
  const order = list.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  let next = 0;
  type Flow = { s: Strat; a: THREE.Sprite; b: THREE.Sprite; c: THREE.Sprite; x: number; z: number; t: number; judged: boolean };
  const flows: Flow[] = [];
  const DUR = 6.5;
  const spawn = () => {
    if (!list.length) return;
    const s = list[order[next % order.length]];
    next += 1;
    const a = chip(IDEA[s.ho] ?? s.ho, { bg: 'rgba(11,34,54,0.92)', border: 'rgba(61,242,255,0.6)', size: 26, k: K });
    const b = chip(TF[s.tf] ?? s.tf, { bg: 'rgba(11,34,54,0.92)', border: 'rgba(255,221,0,0.6)', size: 26, k: K });
    const name = s.ten.length > (narrow ? 22 : 34) ? `${s.ten.slice(0, narrow ? 21 : 33).trimEnd()}…` : s.ten;
    const c = chip(name, { bg: 'rgba(214,226,238,0.95)', border: '#3df2ff', color: '#04131c', size: 28, k: K });
    c.material.opacity = 0;
    const ang = Math.random() * Math.PI * 2;
    const x = Math.cos(ang) * (1 + Math.random() * 2.2) * W;
    const z = Math.sin(ang) * 1.2;
    scene.add(a, b, c);
    flows.push({ s, a, b, c, x, z, t: 0, judged: false });
  };
  const flash = { v: 0, pass: false };
  let gap = 0;

  return (t, dt) => {
    gap -= dt;
    if (gap <= 0) {
      spawn();
      gap = 1.15;
    }
    ringMats.forEach((m, i) => (m.emissiveIntensity = (i === 2 ? 1.5 : 1) + Math.sin(t * 2 + i) * 0.2));
    flash.v = Math.max(0, flash.v - dt * 2);
    ringMats[2].color.setHex(flash.v > 0 && !flash.pass ? 0x8a96a4 : CYAN);
    ringMats[2].emissive.setHex(flash.v > 0 && !flash.pass ? 0x3a4656 : flash.v > 0 ? ACCENT : CYAN);
    ringMats[2].emissiveIntensity += flash.v * 2;
    splitter.rotation.y = t;

    for (let k = flows.length - 1; k >= 0; k--) {
      const f = flows[k];
      f.t += dt / DUR;
      const u = f.t;
      // Tầng 1: hai viên rơi từ trên xuống vành tầng 1, mỗi viên một bên
      const p1 = ease(seg(u, 0, 0.3));
      const p2 = ease(seg(u, 0.3, 0.48));
      const ax = lerp(lerp(f.x - 1.4, f.x * 0.8 - 0.8, p1), f.x * 0.35 - 0.05, p2);
      const bx = lerp(lerp(f.x + 1.4, f.x * 0.8 + 0.8, p1), f.x * 0.35 + 0.05, p2);
      const y12 = lerp(lerp(7, TIERS[0].y + 0.3, p1), TIERS[1].y + 0.3, p2);
      f.a.position.set(ax, y12, f.z);
      f.b.position.set(bx, y12 + 0.05, f.z);
      // Tầng 2: hai viên chập lại, hiện viên tên chiến lược
      const m = seg(u, 0.46, 0.56);
      const fadeAB = 1 - m;
      f.a.material.opacity = fadeAB;
      f.b.material.opacity = fadeAB;
      const cAppear = ease(m);
      // Tầng 3: viên chiến lược rơi qua vành đo
      const p3 = ease(seg(u, 0.56, 0.74));
      const cx = lerp(f.x * 0.35, 0, p3);
      const cy = lerp(TIERS[1].y + 0.3, TIERS[2].y - 0.15, p3);
      if (!f.judged && u >= 0.74) {
        f.judged = true;
        flash.v = 1;
        flash.pass = f.s.pass;
        f.c.material.color.setHex(f.s.pass ? 0xb8fff6 : 0x6b7684);
      }
      // Tách sang máng Đạt / Không đạt
      const bin = f.s.pass ? bins[0] : bins[1];
      const p4 = ease(seg(u, 0.76, 0.94));
      const fx = lerp(cx, bin.x, p4);
      const fy = lerp(cy, BIN_Y + 0.45, p4) + Math.sin(Math.PI * p4) * 0.5;
      f.c.position.set(fx, fy, f.z * (1 - p3));
      const out = 1 - seg(u, 0.94, 1);
      f.c.material.opacity = Math.min(cAppear, out);
      const grow = 0.6 + 0.4 * cAppear;
      const [bw, bh] = f.c.userData.base as [number, number];
      f.c.scale.set(bw * grow, bh * grow, 1);
      if (u >= 1) {
        [f.a, f.b, f.c].forEach((sp) => {
          sp.material.map?.dispose();
          sp.material.dispose();
          scene.remove(sp);
        });
        flows.splice(k, 1);
      }
    }
  };
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
