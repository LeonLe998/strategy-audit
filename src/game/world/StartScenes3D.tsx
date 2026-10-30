/**
 * Ba cảnh 3D của trang Bắt đầu ở đây:
 *  - FilterScene: phễu kính 3 tầng. Ý tưởng gốc + khung nến rơi vào, ghép thành chiến lược có tên thật, đem đi đo rồi rơi thành
 *    viên bi vào bình kính Đạt / Không đạt; bình Không đạt đầy rất nhanh, bình Đạt lèo tèo vài viên.
 *  - ScaleScene: cái cân kính – kim loại, khối thắng nhỏ vs khối thua to, cân dập về phía thua.
 *  - GlassOrbScene (dùng ở trang Vì sao cần đo): quả cầu kính, mỗi viên bi bay quanh là một chiến lược đã đo, bi xanh là đạt.
 *  - CalendarScene: lịch để bàn kính, tờ tháng này sáng 2 ngày giao dịch cuối tháng "Mua", lật sang tờ tháng sau sáng ngày giao dịch thứ 3 "Bán".
 * Không biểu đồ giá, không mũi tên, không đồng xu.
 */
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { startMiniScene, type Frame } from './miniScene';
import { glassLathe, glassMaterial, glow, rimMaterial, studioEnv } from './glassKit';

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
function chip(text: string, o: { bg: string; border: string; color?: string; size?: number; anchor?: [number, number]; k?: number; top?: boolean }) {
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
  // Nhãn cố định vẽ đè lên mọi thứ để viên chữ bay ngang hay khay đáy không che mất
  if (o.top) {
    s.material.depthTest = false;
    s.renderOrder = 10;
  }
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
/** Đổi khi khách bật/tắt chế độ sáng (lớp light trên <html>), để cảnh có chữ vẽ sẵn dựng lại đúng màu */
function useThemeKey() {
  const read = () => (document.documentElement.classList.contains('light') ? 'light' : 'dark');
  const [theme, setTheme] = useState(read);
  useEffect(() => {
    const mo = new MutationObserver(() => setTheme(read()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => mo.disconnect();
  }, []);
  return theme;
}

export function FilterScene({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const theme = useThemeKey();
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
        stop = startMiniScene(mount, (scene, _camera, renderer) => buildFilter(scene, renderer, list, v['CHẤT'] ?? 0, (v['CHÁT'] ?? 0) + (v['TÌNH HUỐNG'] ?? 0), narrow), {
          pos: [0, 0.6, 15],
          look: [0, -0.4, 0],
          fov: 42,
          fitWidth: narrow ? 8.4 : 12.5,
        });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
      stop?.();
    };
  }, [theme]);
  return <div ref={ref} className={className} aria-hidden />;
}

function buildFilter(scene: THREE.Scene, renderer: THREE.WebGLRenderer, list: Strat[], passCount: number, failCount: number, narrow: boolean): Frame {
  const light = document.documentElement.classList.contains('light');
  const W = narrow ? 0.66 : 1;
  const K = narrow ? 0.0135 : 0.0105;
  // Ánh sáng môi trường để kính có vệt phản chiếu thật
  scene.environment = studioEnv(renderer);

  // Phễu kính: đường cong mềm từ miệng xuống cổ, ba vành sáng đánh dấu ba tầng
  const curve = new THREE.SplineCurve(
    [
      [5.3, 3.75],
      [4.3, 2.8],
      [3.4, 1.2],
      [2.5, 0],
      [1.6, -1.2],
      [0.8, -1.85],
      [0.55, -2.4],
    ].map(([r, y]) => new THREE.Vector2(r * W, y)),
  );
  const funnelGlass = glassLathe(curve.getPoints(48), CYAN, 1.2);
  scene.add(funnelGlass);
  const prof = curve.getPoints(120);
  const radiusAt = (y: number) => prof.reduce((a, b) => (Math.abs(b.y - y) < Math.abs(a.y - y) ? b : a)).x;
  // Bảng tra bán kính theo độ cao cho hạt sáng (tính sẵn, không tra mỗi khung hình)
  const R_STEPS = 64;
  const rTable = Array.from({ length: R_STEPS + 1 }, (_, i) => radiusAt(lerp(3.5, -1.8, i / R_STEPS)));
  const TIERS = [
    { y: 3.6, label: '1 · Ý tưởng' },
    { y: 1.2, label: '2 · Ghép thành chiến lược' },
    { y: -1.2, label: '3 · Đem đi đo' },
  ].map((t) => ({ ...t, r: radiusAt(t.y) }));
  const ringMats: THREE.MeshStandardMaterial[] = [];
  TIERS.forEach((t, i) => {
    const mat = new THREE.MeshStandardMaterial({ color: CYAN, emissive: CYAN, emissiveIntensity: i === 2 ? 1.6 : 1.1, toneMapped: false });
    ringMats.push(mat);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(t.r, i === 2 ? 0.06 : 0.035, 8, 96), mat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = t.y;
    scene.add(ring);
    const label = chip(t.label, { bg: 'rgba(8,20,34,0.72)', border: 'rgba(160,240,255,0.55)', size: 26, k: K, anchor: narrow ? [0, 0] : [1, 0.5], top: true });
    // Máy tính: nhãn tầng dưới lùi ra cột ngoài, tránh đường rơi của viên tên chiến lược
    if (narrow) label.position.set(-4.1, t.y + 0.2, 0.5);
    else label.position.set(-Math.max(t.r + 0.35, 3.4), t.y, 0);
    scene.add(label);
  });
  // Vành đo: quầng sáng đổi màu theo kết quả
  const measureGlow = glow(CYAN, 3.2 * W + 1, 0.35);
  measureGlow.position.set(0, TIERS[2].y, 0);
  scene.add(measureGlow);
  // Hạt sáng lơ lửng trôi chậm xuống trong lòng phễu cho cảnh có hơi thở
  const MOTES = 90;
  const moteGeo = new THREE.BufferGeometry();
  const motePos = new Float32Array(MOTES * 3);
  const moteSeed = Array.from({ length: MOTES }, () => [Math.random(), Math.random() * Math.PI * 2, Math.random()]);
  moteGeo.setAttribute('position', new THREE.BufferAttribute(motePos, 3));
  const motes = new THREE.Points(moteGeo, new THREE.PointsMaterial({ color: 0x9ff6ff, size: 0.07, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending }));
  scene.add(motes);

  // Đáy: hai bình kính, Đạt (trái) và Không đạt (phải); mỗi chiến lược đo xong rơi vào thành một viên bi
  const JW = narrow ? 0.8 : 1.22;
  const BIN_Y = -3.95;
  // Thành bình không gồm đáy: đáy phẳng nhìn nghiêng bị viền sáng tô kín, trông như bình đã đầy
  const jarProfile = [
    [0.9, -0.95],
    [1.02, -0.86],
    [1.05, -0.6],
    [1.05, 0.85],
    [1.16, 0.97],
  ].map(([r, y]) => new THREE.Vector2(r * JW, y * JW));
  const BEAD = 0.15 * JW;
  const slotsFor = (cap: number) => {
    const R = 0.98 * JW - BEAD - 0.04;
    const rings: [number, number][] = [
      [0, 1],
      [R * 0.5, 6],
      [R, 12],
    ];
    const out: THREE.Vector3[] = [];
    for (let layer = 0; out.length < cap; layer++) {
      for (const [r, n] of rings) {
        for (let i = 0; i < n && out.length < cap; i++) {
          const a = (i / n) * Math.PI * 2 + layer * 0.55;
          out.push(new THREE.Vector3(Math.cos(a) * r + (Math.random() - 0.5) * 0.04, -0.95 * JW + BEAD + layer * BEAD * 1.75, Math.sin(a) * r));
        }
      }
    }
    return out;
  };
  const jars = [
    { pass: true, x: -3.6 * (narrow ? 0.62 : 1), cap: 15, color: ACCENT, text: `ĐẠT · ${passCount}`, ...(light ? { bg: '#0e7490', border: '#0e7490', fg: '#ffffff' } : { bg: 'rgba(43,255,234,0.16)', border: '#9ff6ff', fg: '#2BFFEA' }) },
    { pass: false, x: 3.6 * (narrow ? 0.62 : 1), cap: 110, color: 0x8794a3, text: `KHÔNG ĐẠT · ${failCount}`, ...(light ? { bg: '#475569', border: '#475569', fg: '#ffffff' } : { bg: 'rgba(120,135,150,0.2)', border: '#a9b6c2', fg: '#d5dee6' }) },
  ].map((j) => {
    const g = glassLathe(jarProfile, j.pass ? ACCENT : 0x9fb0bf, j.pass ? 1.6 : 0.9, 0.08);
    g.position.set(j.x, BIN_Y, 0);
    const floor = new THREE.Mesh(new THREE.CircleGeometry(0.9 * JW, 48), glassMaterial(undefined, 0.12));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.95 * JW;
    g.add(floor);
    const mat = j.pass
      ? new THREE.MeshStandardMaterial({ color: ACCENT, emissive: ACCENT, emissiveIntensity: 1.4, roughness: 0.2, toneMapped: false })
      : new THREE.MeshStandardMaterial({ color: 0x6b7684, roughness: 0.35, metalness: 0.4 });
    const beads = new THREE.InstancedMesh(new THREE.SphereGeometry(BEAD, 16, 12), mat, j.cap);
    beads.count = 0;
    g.add(beads);
    const halo = glow(j.color, 3.4 * JW, j.pass ? 0.12 : 0.05);
    halo.position.set(0, -0.2 * JW, -0.3);
    g.add(halo);
    const label = chip(j.text, { bg: j.bg, border: j.border, color: j.fg, size: narrow ? 24 : 30, k: K, top: true });
    label.position.set(j.x, BIN_Y - 0.95 * JW - 0.75, 0);
    scene.add(g, label);
    return { ...j, beads, halo, slots: slotsFor(j.cap), filled: 0, falling: [] as { slot: number; t: number }[] };
  });
  const JAR_TOP = BIN_Y + 1.3 * JW;
  let drain = 0;
  const m4 = new THREE.Matrix4();
  const v3 = new THREE.Vector3();
  const q = new THREE.Quaternion();
  const one = new THREE.Vector3(1, 1, 1);
  const drop = (pass: boolean) => {
    const j = jars[pass ? 0 : 1];
    if (drain > 0 || j.filled + j.falling.length >= j.cap) return;
    j.falling.push({ slot: j.filled + j.falling.length, t: 0 });
  };

  // Dòng chảy: mỗi lượt là 2 viên ý tưởng (ý tưởng + khung nến) → ghép thành 1 viên tên chiến lược → đo → rơi vào bình
  const order = list.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  let next = 0;
  type Flow = { s: Strat; a: THREE.Sprite; b: THREE.Sprite; c: THREE.Sprite; x: number; z: number; t: number; judged: boolean; dropped: boolean };
  const flows: Flow[] = [];
  const DUR = 6.5;
  const spawn = () => {
    if (!list.length) return;
    const s = list[order[next % order.length]];
    next += 1;
    // Nền sáng: viên chữ đặc, chữ tối; nền tối: viên kính trong, chữ sáng
    const a = chip(IDEA[s.ho] ?? s.ho, light ? { bg: 'rgba(255,255,255,0.95)', border: '#0e7490', color: '#0f172a', size: 26, k: K } : { bg: 'rgba(200,240,255,0.14)', border: 'rgba(160,240,255,0.7)', size: 26, k: K });
    const b = chip(TF[s.tf] ?? s.tf, light ? { bg: 'rgba(255,251,235,0.97)', border: '#b45309', color: '#78350f', size: 26, k: K } : { bg: 'rgba(255,240,180,0.12)', border: 'rgba(255,221,0,0.65)', color: '#fff6cc', size: 26, k: K });
    const name = s.ten.length > (narrow ? 22 : 34) ? `${s.ten.slice(0, narrow ? 21 : 33).trimEnd()}…` : s.ten;
    const c = chip(name, light ? { bg: 'rgba(14,116,144,0.95)', border: '#0e7490', color: '#ffffff', size: 28, k: K } : { bg: 'rgba(61,242,255,0.2)', border: 'rgba(200,250,255,0.9)', color: '#ffffff', size: 28, k: K });
    c.material.opacity = 0;
    const ang = Math.random() * Math.PI * 2;
    const x = Math.cos(ang) * (1 + Math.random() * 2.2) * W;
    const z = Math.sin(ang) * 1.2;
    scene.add(a, b, c);
    flows.push({ s, a, b, c, x, z, t: 0, judged: false, dropped: false });
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
    flash.v = Math.max(0, flash.v - dt * 1.6);
    const failFlash = flash.v > 0 && !flash.pass;
    ringMats[2].color.setHex(failFlash ? 0x8a96a4 : CYAN);
    ringMats[2].emissive.setHex(failFlash ? 0x3a4656 : flash.v > 0 ? ACCENT : CYAN);
    ringMats[2].emissiveIntensity += flash.v * 2;
    measureGlow.material.color.setHex(failFlash ? 0x6b7684 : flash.v > 0 ? ACCENT : CYAN);
    measureGlow.material.opacity = 0.25 + flash.v * 0.55;
    funnelGlass.rotation.y = t * 0.08;

    // Hạt sáng: xoắn nhẹ và trôi xuống theo lòng phễu
    for (let i = 0; i < MOTES; i++) {
      const [h0, a0, rr] = moteSeed[i];
      const h = (h0 + t * 0.04) % 1;
      const y = lerp(3.5, -1.8, h);
      const r = rTable[Math.round(h * R_STEPS)] * (0.25 + rr * 0.6);
      const a = a0 + t * 0.25 + h * 2;
      motePos.set([Math.cos(a) * r, y, Math.sin(a) * r], i * 3);
    }
    moteGeo.attributes.position.needsUpdate = true;

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
      f.a.material.opacity = 1 - m;
      f.b.material.opacity = 1 - m;
      const cAppear = ease(m);
      // Tầng 3: viên chiến lược rơi qua vành đo
      const p3 = ease(seg(u, 0.56, 0.74));
      const cx = lerp(f.x * 0.35, 0, p3);
      const cy = lerp(TIERS[1].y + 0.3, TIERS[2].y - 0.15, p3);
      if (!f.judged && u >= 0.74) {
        f.judged = true;
        flash.v = 1;
        flash.pass = f.s.pass;
        f.c.material.color.setHex(f.s.pass ? 0xc8fff8 : 0x7a8590);
      }
      // Bay sang miệng bình, tan thành một viên bi rơi vào
      const jar = jars[f.s.pass ? 0 : 1];
      const p4 = ease(seg(u, 0.76, 0.94));
      const fx = lerp(cx, jar.x, p4);
      const fy = lerp(cy, JAR_TOP + 0.35, p4) + Math.sin(Math.PI * p4) * 0.6;
      f.c.position.set(fx, fy, f.z * (1 - p3));
      if (!f.dropped && u >= 0.94) {
        f.dropped = true;
        drop(f.s.pass);
      }
      const out = 1 - seg(u, 0.94, 1);
      f.c.material.opacity = Math.min(cAppear, out);
      const grow = (0.6 + 0.4 * cAppear) * (0.5 + 0.5 * out);
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

    // Bi rơi vào bình, nảy nhẹ khi chạm đống; bình Không đạt đầy thì đổ hết, đếm lại từ đầu
    jars.forEach((j) => {
      for (let i = j.falling.length - 1; i >= 0; i--) {
        const b = j.falling[i];
        b.t += dt / 0.7;
        const s = j.slots[b.slot];
        const topY = 1.3 * JW;
        const y = b.t < 1 ? lerp(topY, s.y, b.t * b.t) : s.y + Math.sin(Math.PI * Math.min((b.t - 1) * 3, 1)) * 0.08 * JW;
        v3.set(lerp(0, s.x, Math.min(b.t, 1)), y, lerp(0, s.z, Math.min(b.t, 1)));
        j.beads.setMatrixAt(b.slot, m4.compose(v3, q, one));
        if (b.t >= 1.34) {
          j.falling.splice(i, 1);
          j.filled += 1;
        }
      }
      j.beads.count = j.filled + j.falling.length;
      if (drain > 0) {
        const k = Math.max(drain - dt, 0) / 1.2;
        for (let i = 0; i < j.beads.count; i++) j.beads.setMatrixAt(i, m4.compose(j.slots[i], q, v3.setScalar(k)));
      }
      j.beads.instanceMatrix.needsUpdate = true;
      if (j.pass) j.halo.material.opacity = 0.12 + (j.filled / j.cap) * 0.35 + Math.sin(t * 2) * 0.03;
    });
    if (drain > 0) {
      drain -= dt;
      if (drain <= 0) {
        drain = 0;
        jars.forEach((j) => {
          j.filled = 0;
          j.falling.length = 0;
          j.beads.count = 0;
        });
      }
    } else if (jars[1].filled >= jars[1].cap) drain = 1.2;
  };
}

/** Vẽ một tờ lịch lên canvas: đầu trang có tiêu đề, hàng thứ, lưới ngày bo góc, ô được tô sáng */
function pageTexture(title: string, startDow: number, days: number, lit: number[], litColor: string) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 460;
  const g = c.getContext('2d');
  if (!g) return new THREE.CanvasTexture(c);
  const bg = g.createLinearGradient(0, 0, 0, 460);
  bg.addColorStop(0, '#10283a');
  bg.addColorStop(1, '#081520');
  g.fillStyle = bg;
  g.fillRect(0, 0, 512, 460);
  const head = g.createLinearGradient(0, 0, 512, 0);
  head.addColorStop(0, '#15445e');
  head.addColorStop(1, '#0f2f44');
  g.fillStyle = head;
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
    g.fillStyle = on ? litColor : col >= 5 ? 'rgba(255,255,255,0.025)' : 'rgba(160,220,255,0.07)';
    g.beginPath();
    g.roundRect(x + 2, y + 2, 63, 47, 8);
    g.fill();
    g.strokeStyle = on ? 'rgba(255,255,255,0.7)' : 'rgba(160,220,255,0.12)';
    g.lineWidth = 1.5;
    g.stroke();
    g.fillStyle = on ? '#04131c' : col >= 5 ? '#3b4a58' : '#cfe3ee';
    g.font = on ? 'bold 24px sans-serif' : '20px sans-serif';
    g.fillText(String(d), x + 33, y + 33);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/**
 * Gắn một cảnh 3D vào khung, kèm cờ `reached`: chỉ bật khi khung đã lên tới khoảng giữa màn hình,
 * để chuỗi hiệu ứng không chạy trước lúc người xem cuộn tới. Máy bật giảm chuyển động thì coi như đã tới.
 */
function mountScene(
  mount: HTMLElement,
  build: (scene: THREE.Scene, renderer: THREE.WebGLRenderer, narrow: boolean, reached: () => boolean) => Frame,
  opts: (narrow: boolean) => { fov?: number; pos?: [number, number, number]; look?: [number, number, number]; fitWidth?: number },
) {
  const narrow = mount.clientWidth < 640;
  let hit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const io = new IntersectionObserver(
    ([e]) => {
      if (e.isIntersecting) {
        hit = true;
        io.disconnect();
      }
    },
    { rootMargin: '0px 0px -30% 0px', threshold: 0.4 },
  );
  io.observe(mount);
  const stop = startMiniScene(mount, (scene, _camera, renderer) => build(scene, renderer, narrow, () => hit), opts(narrow));
  return () => {
    io.disconnect();
    stop();
  };
}

const chrome = () => new THREE.MeshStandardMaterial({ color: 0xdfe9f0, metalness: 1, roughness: 0.16 });

/**
 * Cái cân kính – kim loại: 9 khối thắng nhỏ phát sáng rơi vào đĩa trái (cân hơi nghiêng trái),
 * rồi 3 khối thua to sẫm màu rơi vào đĩa phải, cân dập hẳn sang phía thua. Đòn cân chạy theo lò xo nên có nảy.
 */
export function ScaleScene({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const mount = ref.current;
    if (!mount) return;
    return mountScene(mount, buildScale, (narrow) => ({ pos: [0, 1.6, 11], look: [0, -0.2, 0], fov: 36, fitWidth: narrow ? 9.8 : 10 }));
  }, []);
  return <div ref={ref} className={className} aria-hidden />;
}

function buildScale(scene: THREE.Scene, renderer: THREE.WebGLRenderer, _narrow: boolean, reached: () => boolean): Frame {
  scene.environment = studioEnv(renderer);
  // Chân cân: cột kính trên đế kim loại
  const column = glassLathe(
    [
      [1.0, -2.6],
      [0.45, -2.45],
      [0.24, -2.1],
      [0.18, 0.9],
      [0.3, 1.05],
    ].map(([r, y]) => new THREE.Vector2(r, y)),
    CYAN,
    1.1,
    0.14,
  );
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.35, 0.16, 48), chrome());
  base.position.y = -2.68;
  const core = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 3.4, 12), new THREE.MeshBasicMaterial({ color: CYAN, toneMapped: false }));
  core.position.y = -0.8;
  scene.add(column, base, core);

  // Đòn cân quay quanh trục ở đỉnh cột
  const PIV = 1.3;
  const ARM = 3.0;
  const beam = new THREE.Group();
  beam.position.y = PIV;
  const bar = new THREE.Mesh(new THREE.BoxGeometry(ARM * 2 + 0.3, 0.14, 0.2), chrome());
  const glowLine = new THREE.Mesh(new THREE.BoxGeometry(ARM * 2, 0.04, 0.21), new THREE.MeshBasicMaterial({ color: CYAN, toneMapped: false }));
  const hub = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 16), new THREE.MeshStandardMaterial({ color: ACCENT, emissive: ACCENT, emissiveIntensity: 1.3, toneMapped: false }));
  beam.add(bar, glowLine, hub, glow(CYAN, 1.6, 0.35));
  scene.add(beam);

  // Hai đĩa kính treo ở hai đầu đòn, luôn giữ thăng bằng
  const HANG = 2.0;
  const makePan = (x: number) => {
    const pan = new THREE.Group();
    pan.position.x = x;
    const dish = glassLathe(
      [
        [0, -HANG],
        [1.05, -HANG + 0.04],
        [1.2, -HANG + 0.26],
      ].map(([r, y]) => new THREE.Vector2(r, y)),
      CYAN,
      1.3,
      0.16,
    );
    const lip = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.03, 8, 64), chrome());
    lip.rotation.x = Math.PI / 2;
    lip.position.y = -HANG + 0.26;
    pan.add(dish, lip);
    // Ba dây treo từ móc xuống mép đĩa
    [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].forEach((a) => {
      const end = new THREE.Vector3(Math.cos(a) * 1.15, -HANG + 0.26, Math.sin(a) * 1.15);
      const len = end.length();
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, len, 6), new THREE.MeshBasicMaterial({ color: 0x9fe9ff, transparent: true, opacity: 0.55 }));
      rod.position.copy(end).multiplyScalar(0.5);
      rod.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.clone().normalize());
      pan.add(rod);
    });
    const thump = glow(CYAN, 2.6, 0);
    thump.position.y = -HANG + 0.3;
    pan.add(thump);
    beam.add(pan);
    return { pan, thump };
  };
  const left = makePan(-ARM);
  const right = makePan(ARM);

  // Khối: thắng = nhỏ, sáng; thua = to, sẫm, nặng
  const FLOOR = -HANG + 0.05;
  type Block = { mesh: THREE.Mesh; pan: typeof left; at: THREE.Vector3; land: number; weight: number; landed: boolean };
  const blocks: Block[] = [];
  const winMat = new THREE.MeshStandardMaterial({ color: 0x0c5a58, emissive: ACCENT, emissiveIntensity: 0.75, roughness: 0.2, metalness: 0.1, toneMapped: false });
  for (let i = 0; i < 9; i++) {
    const s = 0.3;
    const layer = Math.floor(i / 5);
    const k = i % 5;
    const at = layer === 0 ? new THREE.Vector3([-0.4, 0, 0.4, -0.2, 0.2][k], FLOOR + s / 2, [-0.25, -0.3, -0.25, 0.25, 0.25][k]) : new THREE.Vector3([-0.2, 0.2, 0, 0][k], FLOOR + s * 1.5, [0, 0, -0.1, 0.15][k]);
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(s, s, s), winMat);
    blocks.push({ mesh, pan: left, at, land: 0.35 + i * 0.16, weight: 1, landed: false });
  }
  const lossMat = new THREE.MeshStandardMaterial({ color: 0x4a5868, metalness: 0.6, roughness: 0.3 });
  [
    { s: 0.78, at: new THREE.Vector3(-0.38, FLOOR + 0.39, 0.05) },
    { s: 0.66, at: new THREE.Vector3(0.42, FLOOR + 0.33, -0.05) },
    { s: 0.7, at: new THREE.Vector3(0, FLOOR + 0.78 + 0.35, 0) },
  ].forEach((b, i) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(b.s, b.s, b.s), lossMat);
    blocks.push({ mesh, pan: right, at: b.at, land: 2.4 + i * 0.55, weight: 7, landed: false });
  });
  blocks.forEach((b) => {
    b.mesh.visible = false;
    b.pan.pan.add(b.mesh);
  });

  let t0 = -1;
  let ang = 0;
  let vel = 0;
  const FALL = 0.5;
  return (t, dt) => {
    if (t0 < 0 && reached()) t0 = t;
    const u = t0 < 0 ? -1 : t - t0;
    let winW = 0;
    let lossW = 0;
    blocks.forEach((b) => {
      const k = (u - (b.land - FALL)) / FALL;
      if (k < 0) {
        b.mesh.visible = false;
        return;
      }
      b.mesh.visible = true;
      const bounce = k < 1 ? 0 : Math.sin(Math.PI * Math.min((k - 1) * 2.5, 1)) * 0.12 * (b.weight > 1 ? 0.5 : 1);
      b.mesh.position.set(b.at.x, k < 1 ? lerp(b.at.y + 5, b.at.y, k * k) : b.at.y + bounce, b.at.z);
      b.mesh.rotation.y = k < 1 ? (1 - k) * 1.2 : 0;
      if (k >= 1 && !b.landed) {
        b.landed = true;
        b.pan.thump.material.opacity = b.weight > 1 ? 0.9 : 0.35;
        if (b.weight > 1) b.pan.thump.material.color.setHex(0x9fb0bf);
        vel += (b.weight > 1 ? -0.35 : 0.06) * (b.pan === left ? -1 : 1);
      }
      if (b.landed) (b.pan === left ? (winW += b.weight) : (lossW += b.weight));
    });
    // Đòn cân: lò xo tắt dần về góc do chênh lệch khối lượng (thua nặng hơn → nghiêng phải)
    const target = -THREE.MathUtils.degToRad(THREE.MathUtils.clamp((lossW - winW) * 0.75, -9, 9));
    if (dt === 0) ang = target;
    else {
      vel += ((target - ang) * 26 - vel * 4.5) * dt;
      ang = THREE.MathUtils.clamp(ang + vel * dt, -0.24, 0.24);
    }
    beam.rotation.z = ang + (u < 0 ? Math.sin(t * 0.8) * 0.01 : 0);
    left.pan.rotation.z = -beam.rotation.z;
    right.pan.rotation.z = -beam.rotation.z;
    [left, right].forEach((p) => (p.thump.material.opacity = Math.max(0, p.thump.material.opacity - dt * 1.5)));
    scene.rotation.y = Math.sin(t * 0.3) * 0.12;
  };
}

/**
 * Lịch để bàn bằng kính: tờ "Tháng này" sáng 2 ngày giao dịch cuối tháng (Mua), lật qua gáy
 * sang tờ "Tháng sau" sáng ngày giao dịch thứ 3 (Bán), rồi lật lại. Chỉ bắt đầu lật khi đã cuộn tới.
 */
export function CalendarScene({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const mount = ref.current;
    if (!mount) return;
    return mountScene(mount, buildCalendar, (narrow) => ({ pos: [0, 1.9, 10.5], look: [0, 0.75, 0], fov: 38, fitWidth: narrow ? 6.6 : 8.5 }));
  }, []);
  return <div ref={ref} className={className} aria-hidden />;
}

function buildCalendar(scene: THREE.Scene, renderer: THREE.WebGLRenderer, _narrow: boolean, reached: () => boolean): Frame {
  scene.environment = studioEnv(renderer);
  const PW = 4.2;
  const PH = PW * 0.9;
  const LEAN = -0.22;
  const TOP = PH / 2 + 0.25;
  // Giá đỡ chữ A bằng kính phía sau + thanh gáy kim loại
  const stand = new THREE.Group();
  stand.position.y = TOP;
  [LEAN, -LEAN].forEach((a, i) => {
    const slab = new THREE.Group();
    const geo = new THREE.BoxGeometry(PW + 0.4, PH + 0.5, 0.06);
    slab.add(new THREE.Mesh(geo, glassMaterial(undefined, i ? 0.06 : 0.1)), new THREE.Mesh(geo, rimMaterial(CYAN, 0.9)));
    slab.position.set(0, -(PH + 0.5) / 2, i ? -0.05 : -0.12);
    const hinge = new THREE.Group();
    hinge.rotation.x = i ? 0.42 : a;
    hinge.add(slab);
    stand.add(hinge);
  });
  const spine = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, PW + 0.5, 16), chrome());
  spine.rotation.z = Math.PI / 2;
  stand.add(spine);
  scene.add(stand);

  // Tờ lịch treo ở gáy: nhóm quay quanh mép trên
  const makePage = (tex: THREE.Texture) => {
    const hinge = new THREE.Group();
    const page = new THREE.Group();
    const face = new THREE.Mesh(new THREE.PlaneGeometry(PW, PH), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
    const back = new THREE.Mesh(new THREE.PlaneGeometry(PW, PH), new THREE.MeshStandardMaterial({ color: 0x0b1a28, metalness: 0.2, roughness: 0.4 }));
    back.rotation.y = Math.PI;
    back.position.z = -0.005;
    page.add(face, back);
    page.position.y = -PH / 2 - 0.08;
    hinge.add(page);
    hinge.position.set(0, TOP, 0.02);
    hinge.rotation.x = LEAN;
    // Khoen gáy
    [-0.36, -0.12, 0.12, 0.36].forEach((k) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.025, 8, 20), chrome());
      ring.rotation.y = Math.PI / 2;
      ring.position.set(k * PW, -0.02, 0);
      hinge.add(ring);
    });
    scene.add(hinge);
    return { hinge, page };
  };
  const next = makePage(pageTexture('Tháng sau', 5, 30, [5], '#FFDD00'));
  next.hinge.position.z = -0.02;
  const cur = makePage(pageTexture('Tháng này', 2, 31, [30, 31], '#2BFFEA'));

  // Khối kính sáng nổi lên trên các ô Mua / Bán. Vị trí tính theo lưới của canvas.
  const cell = (startDow: number, d: number) => {
    const idx = startDow + d - 1;
    const u = (4 + (idx % 7) * 73 + 33) / 512;
    const v = (115 + Math.floor(idx / 7) * 57 + 25) / 460;
    return new THREE.Vector3((u - 0.5) * PW, (0.5 - v) * PH, 0);
  };
  const glows = [
    { page: cur.page, at: cell(2, 30), color: ACCENT, phase: 0 },
    { page: cur.page, at: cell(2, 31), color: ACCENT, phase: 0.6 },
    { page: next.page, at: cell(5, 5), color: 0xffdd00, phase: 0 },
  ].map(({ page, at, color, phase }) => {
    const s = PW / 8.6;
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(s, s * 0.72, 0.16),
      new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 1, transparent: true, opacity: 0.85, roughness: 0.15 }),
    );
    m.position.copy(at);
    const halo = glow(color, s * 3, 0.5);
    halo.position.copy(at).setZ(0.05);
    page.add(m, halo);
    return { m, halo, at, phase };
  });

  let t0 = -1;
  const CYCLE = 9;
  // Lật qua đỉnh rồi rơi xuống nằm sau tấm kính sau (nghiêng 0,48 rad về sau)
  const FLIP = LEAN - (0.48 - Math.PI * 2);
  return (t) => {
    if (t0 < 0 && reached()) t0 = t;
    // Một vòng: giữ tờ này 3,2s → lật qua gáy ra nằm sau giá 1,3s → giữ tờ sau 3,4s → lật về 1,3s
    const c = t0 < 0 ? 0 : (t - t0) % CYCLE;
    const flip = c < 3.2 ? 0 : c < 4.5 ? ease((c - 3.2) / 1.3) : c < 7.7 ? 1 : 1 - ease((c - 7.7) / 1.3);
    cur.hinge.rotation.x = LEAN - flip * FLIP;
    glows.forEach((g, i) => {
      // Khối sáng của tờ sau nhô qua tờ trước nếu để hiện, nên chỉ hiện khi tờ của nó đang ở mặt trước
      const onPage = i < 2 ? 1 - flip : flip;
      g.m.visible = g.halo.visible = i < 2 ? flip < 0.35 : flip > 0.65;
      const pop = 0.08 + onPage * (0.18 + Math.sin(t * 2.4 + g.phase) * 0.06);
      g.m.position.z = pop;
      (g.m.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.6 + onPage * (0.8 + Math.sin(t * 2.4 + g.phase) * 0.3);
      g.halo.material.opacity = 0.15 + onPage * 0.45;
    });
    scene.rotation.y = Math.sin(t * 0.35) * 0.1;
  };
}

/**
 * Quả cầu kính của trang Vì sao cần đo: mỗi viên bi bay quanh là một chiến lược đã đo đủ.
 * Bi xám là không đạt, bi xanh phát sáng là đạt; số bi lấy từ thư viện thật.
 */
export function GlassOrbScene({ pass, fail, className = '' }: { pass: number; fail: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const mount = ref.current;
    if (!mount) return;
    return startMiniScene(mount, (scene, _camera, renderer) => buildOrb(scene, renderer, pass, fail), { pos: [0, 1.2, 9.5], look: [0, 0, 0], fov: 38, fitWidth: 7.4 });
  }, [pass, fail]);
  return <div ref={ref} className={className} aria-hidden />;
}

function buildOrb(scene: THREE.Scene, renderer: THREE.WebGLRenderer, pass: number, fail: number): Frame {
  scene.environment = studioEnv(renderer);
  // Lõi: khối kính nhiều mặt + khung sáng bên trong quay ngược chiều
  const shellGeo = new THREE.IcosahedronGeometry(1.45, 1);
  const shell = new THREE.Group();
  shell.add(new THREE.Mesh(shellGeo, glassMaterial(0xcff8ff, 0.14)), new THREE.Mesh(shellGeo, rimMaterial(CYAN, 1.3, 2)));
  const core = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.85, 0)),
    new THREE.LineBasicMaterial({ color: 0x9ff6ff, transparent: true, opacity: 0.8 }),
  );
  scene.add(shell, core, glow(CYAN, 3.4, 0.35));

  // Ba dải bi nghiêng khác nhau (nhóm nghiêng → nhóm quay → bi), bi Đạt rải đều trong cả ba dải
  const total = pass + fail;
  const passAt = new Set(Array.from({ length: pass }, (_, k) => Math.floor(((k + 0.5) * total) / pass)));
  const greyGeo = new THREE.SphereGeometry(0.055, 10, 8);
  const greyMat = new THREE.MeshStandardMaterial({ color: 0x6b7684, metalness: 0.5, roughness: 0.35 });
  const litGeo = new THREE.SphereGeometry(0.09, 14, 10);
  const litMat = new THREE.MeshStandardMaterial({ color: ACCENT, emissive: ACCENT, emissiveIntensity: 1.4, toneMapped: false });
  const spins = [0, 1, 2].map((b) => {
    const greyAt: THREE.Vector3[] = [];
    const litAt: THREE.Vector3[] = [];
    for (let i = b; i < total; i += 3) {
      const a = (i / total) * Math.PI * 2 * 3 + b * 0.7;
      const r = 2.2 + b * 0.38 + Math.sin(i * 12.9898) * 0.12;
      const p = new THREE.Vector3(Math.cos(a) * r, Math.sin(i * 4.1) * 0.08, Math.sin(a) * r);
      (passAt.has(i) ? litAt : greyAt).push(p);
    }
    const spin = new THREE.Group();
    const m4 = new THREE.Matrix4();
    const greyMesh = new THREE.InstancedMesh(greyGeo, greyMat, greyAt.length);
    greyAt.forEach((p, k) => greyMesh.setMatrixAt(k, m4.makeTranslation(p.x, p.y, p.z)));
    const litMesh = new THREE.InstancedMesh(litGeo, litMat, litAt.length);
    litAt.forEach((p, k) => {
      litMesh.setMatrixAt(k, m4.makeTranslation(p.x, p.y, p.z));
      const halo = glow(ACCENT, 0.55, 0.55);
      halo.position.copy(p);
      spin.add(halo);
    });
    spin.add(greyMesh, litMesh);
    const tilt = new THREE.Group();
    tilt.rotation.set(0.35 + b * 0.5, b * 1.1, b * 0.3);
    tilt.add(spin);
    scene.add(tilt);
    return spin;
  });

  return (t) => {
    shell.rotation.set(t * 0.12, t * 0.18, 0);
    core.rotation.set(-t * 0.2, -t * 0.25, 0);
    spins.forEach((s, b) => (s.rotation.y = t * (0.12 + b * 0.05) * (b % 2 ? -1 : 1)));
    scene.rotation.x = Math.sin(t * 0.4) * 0.05;
  };
}
