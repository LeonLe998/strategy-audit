/**
 * Hai cảnh 3D của trang Bắt đầu ở đây:
 *  - FilterScene: phễu kính 3 tầng. Ý tưởng gốc + khung nến rơi vào, ghép thành chiến lược có tên thật, đem đi đo rồi rơi thành
 *    viên bi vào bình kính Đạt / Không đạt; bình Không đạt đầy rất nhanh, bình Đạt lèo tèo vài viên.
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
  }, []);
  return <div ref={ref} className={className} aria-hidden />;
}

/** Viền sáng kiểu kính: mép nghiêng so với mắt nhìn thì sáng, mặt chính diện thì trong (rẻ, không cần vẽ thêm lượt) */
function rimMaterial(color: number, amp: number, pow = 2.4) {
  return new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(color) }, uAmp: { value: amp }, uPow: { value: pow } },
    vertexShader: `varying vec3 vN; varying vec3 vV;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vN = normalize(mat3(modelMatrix) * normal);
        vV = normalize(cameraPosition - wp.xyz);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }`,
    fragmentShader: `uniform vec3 uColor; uniform float uAmp; uniform float uPow; varying vec3 vN; varying vec3 vV;
      void main() {
        float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), uPow) * uAmp;
        gl_FragColor = vec4(uColor * f, f);
      }`,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
}

/** Thân kính: gần trong suốt, chỉ hiện vệt phản chiếu của môi trường và đèn */
function glassMaterial(tint = 0xbfefff, opacity = 0.1) {
  return new THREE.MeshPhysicalMaterial({
    color: tint,
    metalness: 0,
    roughness: 0.05,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    envMapIntensity: 1.6,
    transparent: true,
    opacity,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
}

/** Một khối kính tròn xoay từ đường viền (r, y) + lớp viền sáng */
function glassLathe(profile: THREE.Vector2[], rim: number, rimAmp: number, opacity?: number) {
  const geo = new THREE.LatheGeometry(profile, 64);
  const g = new THREE.Group();
  g.add(new THREE.Mesh(geo, glassMaterial(undefined, opacity)), new THREE.Mesh(geo, rimMaterial(rim, rimAmp)));
  return g;
}

/** Phòng sáng dựng tạm: hộp tối với vài tấm đèn, chỉ dùng để kính có vệt phản chiếu */
function studioEnv(renderer: THREE.WebGLRenderer) {
  const room = new THREE.Scene();
  const box = new THREE.BoxGeometry(1, 1, 1);
  const walls = new THREE.Mesh(box, new THREE.MeshBasicMaterial({ color: 0x0a1622, side: THREE.BackSide }));
  walls.scale.setScalar(20);
  room.add(walls);
  [
    { p: [0, 9, 0], s: [12, 0.2, 6], c: 0xffffff },
    { p: [-9, 2, 2], s: [0.2, 6, 3], c: 0x9ff6ff },
    { p: [9, 3, -2], s: [0.2, 4, 6], c: 0xcfe3ee },
    { p: [0, 1, 9], s: [6, 2, 0.2], c: 0x3df2ff },
  ].forEach(({ p, s, c }) => {
    const panel = new THREE.Mesh(box, new THREE.MeshBasicMaterial({ color: c }));
    panel.position.set(p[0], p[1], p[2]);
    panel.scale.set(s[0], s[1], s[2]);
    room.add(panel);
  });
  const pmrem = new THREE.PMREMGenerator(renderer);
  const tex = pmrem.fromScene(room, 0.04).texture;
  pmrem.dispose();
  box.dispose();
  return tex;
}

let glowTex: THREE.CanvasTexture | null = null;
/** Đốm sáng mềm dùng làm quầng sáng (cộng màu, không cần hậu kỳ) */
function glow(color: number, size: number, opacity: number) {
  if (!glowTex) {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d');
    if (g) {
      const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      grd.addColorStop(0, 'rgba(255,255,255,1)');
      grd.addColorStop(0.35, 'rgba(255,255,255,0.35)');
      grd.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = grd;
      g.fillRect(0, 0, 128, 128);
    }
    glowTex = new THREE.CanvasTexture(c);
  }
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending }));
  s.scale.set(size, size, 1);
  return s;
}

function buildFilter(scene: THREE.Scene, renderer: THREE.WebGLRenderer, list: Strat[], passCount: number, failCount: number, narrow: boolean): Frame {
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
    { pass: true, x: -3.6 * (narrow ? 0.62 : 1), cap: 15, color: ACCENT, text: `ĐẠT · ${passCount}`, bg: 'rgba(43,255,234,0.16)', border: '#9ff6ff', fg: '#2BFFEA' },
    { pass: false, x: 3.6 * (narrow ? 0.62 : 1), cap: 110, color: 0x8794a3, text: `KHÔNG ĐẠT · ${failCount}`, bg: 'rgba(120,135,150,0.2)', border: '#a9b6c2', fg: '#d5dee6' },
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
    const a = chip(IDEA[s.ho] ?? s.ho, { bg: 'rgba(200,240,255,0.14)', border: 'rgba(160,240,255,0.7)', size: 26, k: K });
    const b = chip(TF[s.tf] ?? s.tf, { bg: 'rgba(255,240,180,0.12)', border: 'rgba(255,221,0,0.65)', color: '#fff6cc', size: 26, k: K });
    const name = s.ten.length > (narrow ? 22 : 34) ? `${s.ten.slice(0, narrow ? 21 : 33).trimEnd()}…` : s.ten;
    const c = chip(name, { bg: 'rgba(61,242,255,0.2)', border: 'rgba(200,250,255,0.9)', color: '#ffffff', size: 28, k: K });
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
