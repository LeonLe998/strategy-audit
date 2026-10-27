/**
 * Thế giới 3D của hành trình: 6 đảo nổi = 6 màn, nối bằng cầu. Chỉ nạp khi người chơi bấm mở (React.lazy).
 * Trạng thái màn, điểm và nội dung chơi lấy từ useJourney + JourneyStages, giống trang 2D.
 * Cầu tới một đảo chỉ đi được khi màn đó đã mở. Hình khối dựng bằng code; ảnh/model từ Gemini thay dần theo
 * docs/THANH_PHAN_HINH_ANH.md. Không nến, không mũi tên tăng, không vàng thỏi, không đồng xu.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { useJourney } from '../useJourney';
import { useLibrarySummary } from '../useLibraryCards';
import { POINT_NAME, STAGES, type StageId } from '../journeyConfig';
import type { StageStatus } from '../journeyStore';
import { Stage1, Stage2, StagePlaceholder } from '../JourneyStages';
import { STAGE1, STAGE2, WORLD } from '../../content/journey';
import { funnel } from '../../lib/analytics';

const COLOR = {
  bg: 0x040914,
  glow: 0x00486b,
  line: 0x3df2ff,
  accent: 0x2bffea,
  grass: 0x1e6f62,
  grassDone: 0x249080,
  grassLocked: 0x2e3743,
  dirt: 0x3b3230,
  rock: 0x252b38,
  tree: 0x1b5e52,
  locked: 0x3a4656,
  situational: 0x1f6f8b,
  fail: 0x18222f,
};

const ISLAND_R = 3.2;
const WALK_R = 2.75;
const TOP = 0.3;
const SAG = 0.35;
const BRIDGE_HALF_W = 0.55;
const SPEED = 6;
const ISO = new THREE.Vector3(14, 16, 14);
const STATUS_TEXT: Record<StageStatus, string> = { done: 'Đã qua', open: 'Đang mở', locked: 'Đang khoá' };

/** Toạ độ đảo theo trục màn hình: u = đi lên, v = lệch phải. Đổi sang x/z cho góc nhìn chéo. */
const LAYOUT: { u: number; v: number; h: number }[] = [
  { u: 0, v: 0, h: 0 },
  { u: 9, v: 4, h: 0.6 },
  { u: 17, v: -3, h: 0.2 },
  { u: 25.5, v: 3.5, h: 1.0 },
  { u: 33.5, v: -3, h: 0.4 },
  { u: 42, v: 1.5, h: 1.3 },
];
const S2 = Math.SQRT1_2;
const ISLES = STAGES.map((s, i) => {
  const { u, v, h } = LAYOUT[i];
  return { id: s.id, c: new THREE.Vector2((-u + v) * S2, (-u - v) * S2), y: h };
});
const BRIDGES = ISLES.slice(1).map((b, i) => {
  const a = ISLES[i];
  const d = b.c.clone().sub(a.c).normalize();
  return { to: i + 1, s: a.c.clone().addScaledVector(d, ISLAND_R - 0.35), e: b.c.clone().addScaledVector(d, -(ISLAND_R - 0.35)), ys: a.y + TOP, ye: b.y + TOP };
});
const idxOf = (id: StageId) => ISLES.findIndex((i) => i.id === id);

/** Nhiễu cố định theo toạ độ đỉnh để các đỉnh trùng nhau lệch giống nhau (không hở mép) */
const hash = (x: number, y: number, z: number) => {
  const s = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453;
  return s - Math.floor(s) - 0.5;
};
function jitter(geo: THREE.BufferGeometry, amt: number, keepY: (y: number) => boolean) {
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    p.setXYZ(i, x + hash(x, y, z) * amt, keepY(y) ? y : y + hash(z, x, y) * amt * 0.6, z + hash(y, z, x) * amt);
  }
  geo.computeVertexNormals();
  return geo;
}
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}
const flat = (color: number, extra: THREE.MeshStandardMaterialParameters = {}) =>
  new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.85, ...extra });
const glow = (color: number, intensity = 0.6) =>
  new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: intensity, roughness: 0.35, transparent: true });

interface IsleObjects {
  grass: THREE.MeshStandardMaterial;
  rim: THREE.LineBasicMaterial;
  landmark: THREE.MeshStandardMaterial[];
  beam: THREE.Mesh;
}
interface BridgeObjects {
  full: THREE.Group;
  broken: THREE.Group;
}
type Spin = (t: number) => void;

/** Mỗi màn một vật mốc riêng đặt giữa đảo */
function buildLandmark(id: StageId, group: THREE.Group, mats: THREE.MeshStandardMaterial[], library: { current: THREE.InstancedMesh | null }): Spin {
  switch (id) {
    case 'khai-niem': {
      // Viên tinh thể câu hỏi
      const core = glow(COLOR.accent, 0.7);
      const shell = glow(COLOR.line, 0.9);
      shell.wireframe = true;
      mats.push(core, shell);
      const a = new THREE.Mesh(new THREE.OctahedronGeometry(0.55), core);
      const b = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), shell);
      group.add(a, b);
      return (t) => {
        a.rotation.y = t * 0.8;
        b.rotation.set(t * 0.2, -t * 0.4, 0);
        group.position.y = group.userData.baseY + Math.sin(t * 1.5) * 0.12;
      };
    }
    case 'vi-sao-kiem-dinh': {
      // Ba lá bài xoè quạt
      const cards: THREE.Mesh[] = [];
      [-1, 0, 1].forEach((k) => {
        const m = glow(k === 1 ? COLOR.accent : COLOR.line, k === 1 ? 0.75 : 0.35);
        mats.push(m);
        const card = new THREE.Mesh(new THREE.BoxGeometry(0.75, 1.1, 0.04), m);
        card.position.set(k * 0.55, 0, k * -0.05);
        card.rotation.z = -k * 0.25;
        cards.push(card);
        group.add(card);
      });
      group.rotation.y = Math.PI / 4;
      return (t) => cards.forEach((c, i) => (c.position.y = Math.sin(t * 1.5 + i) * 0.08));
    }
    case 'sau-o': {
      // Tổ ong sáu ô lục giác, sáng dần từng ô
      const cells: THREE.Mesh[] = [];
      for (let i = 0; i < 6; i++) {
        const m = glow(COLOR.line, 0.4);
        mats.push(m);
        const cell = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.14, 6), m);
        cell.rotation.x = Math.PI / 2;
        cell.position.set((i % 3) * 0.72 - 0.72 + (i < 3 ? 0 : 0.36), i < 3 ? 0.33 : -0.3, 0);
        cells.push(cell);
        group.add(cell);
      }
      group.rotation.y = Math.PI / 4;
      return (t) => {
        const lit = Math.floor(t * 1.2) % 7;
        cells.forEach((c, i) => ((c.material as THREE.MeshStandardMaterial).emissiveIntensity = i < lit ? 0.95 : 0.25));
      };
    }
    case 'thu-vien': {
      // Bức tường hồ sơ: mỗi khối là một chiến lược đã đo, tô màu theo kết quả khi dữ liệu về
      const m = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x0a1a24, roughness: 0.4, transparent: true });
      mats.push(m);
      const wall = new THREE.InstancedMesh(new THREE.BoxGeometry(0.12, 0.12, 0.12), m, 300);
      wall.count = 0;
      library.current = wall;
      const frame = flat(COLOR.rock);
      const base = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.2, 0.5), frame);
      base.position.y = -1.05;
      group.add(wall, base);
      group.rotation.y = Math.PI / 4;
      return () => undefined;
    }
    case 'kiem-diem': {
      // Các vòng điểm xếp chồng
      const rings: THREE.Mesh[] = [];
      for (let i = 0; i < 3; i++) {
        const m = glow(i === 2 ? COLOR.accent : COLOR.line, 0.55);
        mats.push(m);
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.75 - i * 0.18, 0.05, 8, 40), m);
        ring.position.y = i * 0.38 - 0.38;
        ring.rotation.x = Math.PI / 2;
        rings.push(ring);
        group.add(ring);
      }
      return (t) => rings.forEach((r, i) => (r.rotation.z = t * (0.6 + i * 0.4) * (i % 2 ? -1 : 1)));
    }
    case 'chuyen-doi': {
      // Cổng cuối hành trình
      const frame = glow(COLOR.accent, 0.85);
      const veil = glow(COLOR.glow, 0.9);
      veil.opacity = 0.6;
      veil.side = THREE.DoubleSide;
      mats.push(frame, veil);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.1, 12, 60), frame);
      const disc = new THREE.Mesh(new THREE.CircleGeometry(1.12, 48), veil);
      group.add(ring, disc);
      group.rotation.y = Math.PI / 4;
      group.position.y += 0.4;
      return (t) => (veil.emissiveIntensity = 0.6 + Math.sin(t * 2) * 0.3);
    }
  }
}

/** Đảo nổi low-poly: mặt cỏ phẳng để đi, lớp đất, khối đá nhọn phía dưới, cây và tinh thể quanh mép */
function buildIsland(i: number, scene: THREE.Scene, pickables: THREE.Object3D[]) {
  const isle = ISLES[i];
  const root = new THREE.Group();
  root.position.set(isle.c.x, isle.y, isle.c.y);
  root.userData.isle = i;

  const grassMat = flat(COLOR.grass);
  const topGeo = jitter(new THREE.CylinderGeometry(ISLAND_R, ISLAND_R - 0.2, 0.6, 12), 0.18, (y) => y > 0);
  const top = new THREE.Mesh(topGeo, grassMat);
  top.userData = { isle: i, top: true };
  root.add(top);
  pickables.push(top);

  const dirt = new THREE.Mesh(jitter(new THREE.CylinderGeometry(ISLAND_R - 0.15, ISLAND_R - 0.45, 0.5, 12), 0.25, () => false), flat(COLOR.dirt));
  dirt.position.y = -0.52;
  const rock = new THREE.Mesh(jitter(new THREE.ConeGeometry(ISLAND_R - 0.4, 3.8, 10, 3), 0.5, () => false), flat(COLOR.rock));
  rock.rotation.x = Math.PI;
  rock.position.y = -2.7;
  root.add(dirt, rock);

  // Vệt sáng dưới đáy đá
  const vein = new THREE.Mesh(new THREE.ConeGeometry(0.08, 2.6, 4), glow(COLOR.line, 1.2));
  vein.rotation.x = Math.PI;
  vein.position.set(0.6, -2.4, 0.9);
  root.add(vein);

  const rimMat = new THREE.LineBasicMaterial({ color: COLOR.line, transparent: true, opacity: 0.8 });
  const rim = new THREE.LineSegments(new THREE.EdgesGeometry(topGeo, 30), rimMat);
  root.add(rim);

  // Cây + tinh thể quanh mép, tránh hướng có cầu
  const r = rng(i * 17 + 3);
  const bridgeAngles = BRIDGES.filter((b) => b.to === i || b.to === i + 1).map((b) => {
    const d = (b.to === i ? b.e : b.s).clone().sub(isle.c);
    return Math.atan2(d.y, d.x);
  });
  for (let k = 0; k < 7; k++) {
    const ang = r() * Math.PI * 2;
    if (bridgeAngles.some((b) => Math.abs(Math.atan2(Math.sin(ang - b), Math.cos(ang - b))) < 0.6)) continue;
    const rad = 1.9 + r() * 0.8;
    const x = Math.cos(ang) * rad;
    const z = Math.sin(ang) * rad;
    if (k % 3 === 2) {
      const c = new THREE.Mesh(new THREE.OctahedronGeometry(0.18 + r() * 0.1), glow(COLOR.line, 0.9));
      c.position.set(x, TOP + 0.3, z);
      c.scale.y = 1.8;
      root.add(c);
    } else {
      const h = 0.7 + r() * 0.6;
      const tree = new THREE.Mesh(new THREE.ConeGeometry(0.32, h, 6), flat(COLOR.tree));
      tree.position.set(x, TOP + 0.15 + h / 2, z);
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.2, 5), flat(COLOR.dirt));
      trunk.position.set(x, TOP + 0.1, z);
      root.add(tree, trunk);
    }
  }
  scene.add(root);
  return { grass: grassMat, rim: rimMat };
}

/** Cầu ván treo: bản đủ ván (đã mở) và bản gãy (đang khoá) */
function buildBridge(j: number, scene: THREE.Scene, pickables: THREE.Object3D[]): BridgeObjects {
  const b = BRIDGES[j];
  const len = b.s.distanceTo(b.e);
  const n = Math.ceil(len / 0.34);
  const yaw = Math.atan2(b.e.x - b.s.x, b.e.y - b.s.y);
  const full = new THREE.Group();
  const broken = new THREE.Group();
  const plankGeo = new THREE.BoxGeometry(1.15, 0.08, 0.26);
  const plankMat = flat(0x2c3c52);
  const brokenMat = flat(0x2a303b);
  const railPts: THREE.Vector3[][] = [[], []];
  for (let k = 0; k <= n; k++) {
    const t = k / n;
    const x = THREE.MathUtils.lerp(b.s.x, b.e.x, t);
    const z = THREE.MathUtils.lerp(b.s.y, b.e.y, t);
    const y = bridgeY(j, t) - 0.05;
    const plank = new THREE.Mesh(plankGeo, plankMat);
    plank.position.set(x, y, z);
    plank.rotation.y = yaw;
    plank.userData.bridge = j;
    full.add(plank);
    pickables.push(plank);
    if (t < 0.22 || t > 0.85 || k % 4 === 0) {
      const p = new THREE.Mesh(plankGeo, brokenMat);
      p.position.set(x, y - (t > 0.3 && t < 0.7 ? 0.25 : 0), z);
      p.rotation.set(hash(k, j, 1) * 0.4, yaw, hash(j, k, 2) * 0.4);
      broken.add(p);
    }
    const side = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw)).multiplyScalar(0.58);
    railPts[0].push(new THREE.Vector3(x, y + 0.45, z).add(side));
    railPts[1].push(new THREE.Vector3(x, y + 0.45, z).sub(side));
  }
  const railMat = glow(COLOR.line, 1.1);
  railPts.forEach((pts) => full.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), n * 2, 0.035, 5, false), railMat)));
  broken.visible = false;
  scene.add(full, broken);
  return { full, broken };
}

function bridgeY(j: number, t: number) {
  const b = BRIDGES[j];
  return THREE.MathUtils.lerp(b.ys, b.ye, t) - Math.sin(Math.PI * THREE.MathUtils.clamp(t, 0, 1)) * SAG;
}

/** Rải các khối theo đúng số CHẤT / TÌNH HUỐNG / CHÁT của thư viện, thứ tự cố định */
function paintLibrary(wall: THREE.InstancedMesh, verdict: Record<string, number>) {
  const list: number[] = [
    ...Array(verdict['CHẤT'] ?? 0).fill(COLOR.accent),
    ...Array(verdict['TÌNH HUỐNG'] ?? 0).fill(COLOR.situational),
    ...Array(verdict['CHÁT'] ?? 0).fill(COLOR.fail),
  ].slice(0, 300);
  const r = rng(7);
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  const cols = 22;
  const rows = Math.ceil(list.length / cols);
  const mtx = new THREE.Matrix4();
  const col = new THREE.Color();
  list.forEach((hex, i) => {
    mtx.makeTranslation(((i % cols) - (cols - 1) / 2) * 0.15, ((rows - 1) / 2) * 0.15 - Math.floor(i / cols) * 0.15, 0);
    wall.setMatrixAt(i, mtx);
    wall.setColorAt(i, col.setHex(hex));
  });
  wall.count = list.length;
  wall.instanceMatrix.needsUpdate = true;
  if (wall.instanceColor) wall.instanceColor.needsUpdate = true;
}

/** Nhân vật người chơi low-poly: thân + đầu + kính sáng */
function buildPlayer() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.35, 4, 8), flat(0x1c3550));
  body.position.y = 0.4;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.19, 12, 8), flat(0xd9b99b));
  head.position.y = 0.88;
  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.07, 0.08), glow(COLOR.accent, 1.2));
  visor.position.set(0, 0.9, 0.16);
  const pack = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.3, 0.12), flat(0x2a3d55));
  pack.position.set(0, 0.48, -0.2);
  g.add(body, head, visor, pack);
  return g;
}

export default function JourneyWorld3D({ onExit }: { onExit: () => void }) {
  const journey = useJourney();
  const summary = useLibrarySummary();
  const mountRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<Partial<Record<StageId, HTMLDivElement | null>>>({});
  const isleObjs = useRef<IsleObjects[]>([]);
  const bridgeObjs = useRef<BridgeObjects[]>([]);
  const bridgeOpen = useRef<boolean[]>(BRIDGES.map(() => false));
  const libraryWall = useRef<THREE.InstancedMesh | null>(null);
  const activeRef = useRef<StageId | null>(null);
  const walkTo = useRef<(i: number) => void>(() => undefined);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [onIsle, setOnIsle] = useState<number | null>(null);
  const [active, setActive] = useState<StageId | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [guideOpen, setGuideOpen] = useState(true);
  const [questOpen, setQuestOpen] = useState(() => window.innerWidth >= 640);

  const stageAt = (i: number) => journey.stages[i];

  const enter = useCallback((id: StageId) => {
    activeRef.current = id;
    setActive(id);
    funnel.stageView(id);
  }, []);
  const close = useCallback(() => {
    activeRef.current = null;
    setActive(null);
  }, []);

  const flash = useRef<number | undefined>(undefined);
  const showNotice = useCallback((msg: string) => {
    setNotice(msg);
    window.clearTimeout(flash.current);
    flash.current = window.setTimeout(() => setNotice(null), 3200);
  }, []);
  const noticeRef = useRef(showNotice);
  noticeRef.current = showNotice;

  // Dựng cảnh một lần
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    funnel.worldOpen();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    } catch {
      setFailed(true);
      return;
    }
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.domElement.style.touchAction = 'none';
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(COLOR.bg);
    scene.fog = new THREE.Fog(COLOR.bg, 30, 62);

    // Góc nhìn chéo kiểu isometric
    const frustum = () => (mount.clientWidth < 640 ? 24 : 19);
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 200);
    const fitCamera = () => {
      const f = frustum();
      const aspect = mount.clientWidth / mount.clientHeight;
      camera.left = (-f * aspect) / 2;
      camera.right = (f * aspect) / 2;
      camera.top = f / 2;
      camera.bottom = -f / 2;
      camera.updateProjectionMatrix();
    };
    fitCamera();

    scene.add(new THREE.HemisphereLight(0x9fe9ff, 0x0a1020, 0.9));
    scene.add(new THREE.AmbientLight(0xffffff, 0.25));
    const sun = new THREE.DirectionalLight(0xffffff, 1.1);
    sun.position.set(8, 14, 4);
    scene.add(sun);

    // Mưa dữ liệu: các hạt sáng rơi chậm phía sau
    const RAIN = 500;
    const rainPos = new Float32Array(RAIN * 3);
    const rr = rng(99);
    for (let k = 0; k < RAIN; k++) {
      rainPos[k * 3] = (rr() - 0.5) * 90 - 15;
      rainPos[k * 3 + 1] = rr() * 30 - 12;
      rainPos[k * 3 + 2] = (rr() - 0.5) * 90 - 15;
    }
    const rainGeo = new THREE.BufferGeometry();
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
    const rain = new THREE.Points(rainGeo, new THREE.PointsMaterial({ color: COLOR.line, size: 0.08, transparent: true, opacity: 0.45 }));
    scene.add(rain);

    // Đá vụn lơ lửng trang trí
    const debris: THREE.Mesh[] = [];
    const dr = rng(5);
    for (let k = 0; k < 14; k++) {
      const m = new THREE.Mesh(jitter(new THREE.DodecahedronGeometry(0.3 + dr() * 0.5, 0), 0.15, () => false), flat(COLOR.rock));
      const isle = ISLES[Math.floor(dr() * ISLES.length)];
      m.position.set(isle.c.x + (dr() - 0.5) * 14, isle.y - 2 - dr() * 4, isle.c.y + (dr() - 0.5) * 14);
      m.userData.phase = dr() * 6;
      debris.push(m);
      scene.add(m);
    }

    const pickables: THREE.Object3D[] = [];
    const spins: Spin[] = [];
    ISLES.forEach((isle, i) => {
      const { grass, rim } = buildIsland(i, scene, pickables);
      const group = new THREE.Group();
      group.position.set(isle.c.x, isle.y + TOP + 1.5, isle.c.y);
      group.userData.baseY = group.position.y;
      const mats: THREE.MeshStandardMaterial[] = [];
      spins.push(buildLandmark(isle.id, group, mats, libraryWall));
      mats.forEach((m) => (m.userData.baseOpacity = m.opacity));
      scene.add(group);
      group.traverse((o) => (o.userData.isle = i));
      pickables.push(group);

      const beam = new THREE.Mesh(
        new THREE.CylinderGeometry(0.6, 1.8, 12, 24, 1, true),
        new THREE.MeshBasicMaterial({ color: COLOR.accent, transparent: true, opacity: 0.09, side: THREE.DoubleSide, depthWrite: false }),
      );
      beam.position.set(isle.c.x, isle.y + 6, isle.c.y);
      beam.visible = false;
      scene.add(beam);
      isleObjs.current[i] = { grass, rim, landmark: mats, beam };
    });
    pickables.forEach((o) => o.traverse((c) => c.userData.isle === undefined && (c.userData.isle = o.userData.isle)));
    BRIDGES.forEach((_, j) => (bridgeObjs.current[j] = buildBridge(j, scene, pickables)));

    const player = buildPlayer();
    const halo = new THREE.Mesh(new THREE.RingGeometry(0.4, 0.5, 32), new THREE.MeshBasicMaterial({ color: COLOR.accent, transparent: true, opacity: 0.7, side: THREE.DoubleSide }));
    halo.rotation.x = -Math.PI / 2;
    const playerLight = new THREE.PointLight(COLOR.line, 4, 6);
    scene.add(player, halo, playerLight);

    // Đứng sẵn trên đảo của màn đang mở, phía gần máy quay
    const startIdx = Math.max(0, idxOf(journey.current.id));
    const pos = new THREE.Vector3(ISLES[startIdx].c.x + 1.3, ISLES[startIdx].y + TOP, ISLES[startIdx].c.y + 1.3);
    const camTarget = pos.clone();
    camera.position.copy(camTarget).add(ISO);
    camera.lookAt(camTarget);

    /** Mặt đi được tại (x, z): trên đảo, hoặc trên cầu đã mở. Trả về độ cao. */
    const surface = (x: number, z: number): number | null => {
      for (const isle of ISLES) if (Math.hypot(x - isle.c.x, z - isle.c.y) < WALK_R) return isle.y + TOP;
      for (let j = 0; j < BRIDGES.length; j++) {
        if (!bridgeOpen.current[j]) continue;
        const b = BRIDGES[j];
        const dx = b.e.x - b.s.x, dz = b.e.y - b.s.y;
        const t = ((x - b.s.x) * dx + (z - b.s.y) * dz) / (dx * dx + dz * dz);
        if (t < -0.1 || t > 1.1) continue;
        const px = b.s.x + dx * t, pz = b.s.y + dz * t;
        if (Math.hypot(x - px, z - pz) < BRIDGE_HALF_W) return bridgeY(j, t);
      }
      return null;
    };
    const isleIdxAt = (x: number, z: number) => {
      let best = 0;
      let d = Infinity;
      ISLES.forEach((isle, i) => {
        const di = Math.hypot(x - isle.c.x, z - isle.c.y);
        if (di < d) {
          d = di;
          best = i;
        }
      });
      return best;
    };

    // Đi theo chuỗi điểm: qua từng cây cầu, dừng trước cầu chưa mở
    let route: THREE.Vector2[] = [];
    const planRoute = (toIdx: number, final: THREE.Vector2) => {
      const from = isleIdxAt(pos.x, pos.z);
      route = [];
      const step = toIdx > from ? 1 : -1;
      for (let i = from; i !== toIdx; i += step) {
        const j = step > 0 ? i : i - 1;
        if (!bridgeOpen.current[j]) {
          route.push(step > 0 ? BRIDGES[j].s.clone() : BRIDGES[j].e.clone());
          noticeRef.current(WORLD.lockedBridge(STAGES[j].title));
          return;
        }
        route.push(...(step > 0 ? [BRIDGES[j].s.clone(), BRIDGES[j].e.clone()] : [BRIDGES[j].e.clone(), BRIDGES[j].s.clone()]));
      }
      route.push(final);
    };
    walkTo.current = (i: number) => planRoute(i, ISLES[i].c.clone().add(new THREE.Vector2(1.3, 1.3)));

    // Điều khiển: phím W A S D theo hướng màn hình, chạm/bấm để đi tới
    const keys = new Set<string>();
    const onKeyDown = (e: KeyboardEvent) => {
      if (!activeRef.current) keys.add(e.key.toLowerCase());
    };
    const onKeyUp = (e: KeyboardEvent) => keys.delete(e.key.toLowerCase());
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    let downAt: { x: number; y: number } | null = null;
    const onPointerDown = (e: PointerEvent) => (downAt = { x: e.clientX, y: e.clientY });
    const onPointerUp = (e: PointerEvent) => {
      if (!downAt || Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) > 8) return;
      const rect = renderer.domElement.getBoundingClientRect();
      ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObjects(pickables, true)[0];
      if (!hit) return;
      const bj = hit.object.userData.bridge as number | undefined;
      if (bj !== undefined) {
        planRoute(isleIdxAt(pos.x, pos.z), new THREE.Vector2(hit.point.x, hit.point.z));
        return;
      }
      const i = hit.object.userData.isle as number | undefined;
      if (i === undefined) return;
      const onTop = hit.object.userData.top === true && Math.hypot(hit.point.x - ISLES[i].c.x, hit.point.z - ISLES[i].c.y) < WALK_R;
      planRoute(i, onTop ? new THREE.Vector2(hit.point.x, hit.point.z) : ISLES[i].c.clone().add(new THREE.Vector2(1.3, 1.3)));
    };
    const onWheel = (e: WheelEvent) => {
      camera.zoom = THREE.MathUtils.clamp(camera.zoom * (e.deltaY > 0 ? 0.92 : 1.08), 0.6, 1.8);
      camera.updateProjectionMatrix();
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: true });
    const onResize = () => {
      fitCamera();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', onResize);

    const UP = new THREE.Vector2(-S2, -S2);
    const RIGHT = new THREE.Vector2(S2, -S2);
    const clock = new THREE.Clock();
    const move = new THREE.Vector2();
    const proj = new THREE.Vector3();
    let lastIsle: number | null = null;
    let frame = 0;

    const tick = () => {
      frame = requestAnimationFrame(tick);
      if (document.hidden) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;

      // Di chuyển
      move.set(0, 0);
      let walking = false;
      if (!activeRef.current) {
        if (keys.has('w') || keys.has('arrowup')) move.add(UP);
        if (keys.has('s') || keys.has('arrowdown')) move.sub(UP);
        if (keys.has('d') || keys.has('arrowright')) move.add(RIGHT);
        if (keys.has('a') || keys.has('arrowleft')) move.sub(RIGHT);
        if (move.lengthSq() > 0) {
          route = [];
          move.normalize().multiplyScalar(SPEED * dt);
          // Trượt dọc mép nếu bước thẳng bị rơi khỏi đảo
          const tries = [move.clone(), new THREE.Vector2(move.x, 0), new THREE.Vector2(0, move.y)];
          const ok = tries.find((m) => surface(pos.x + m.x, pos.z + m.y) !== null);
          if (ok) {
            pos.x += ok.x;
            pos.z += ok.y;
            move.copy(ok);
            walking = true;
          }
        } else if (route.length) {
          const goal = route[0];
          move.set(goal.x - pos.x, goal.y - pos.z);
          const d = move.length();
          if (d < 0.08) route.shift();
          else {
            move.multiplyScalar(Math.min(SPEED * dt, d) / d);
            pos.x += move.x;
            pos.z += move.y;
            walking = true;
          }
        }
      }
      const y = surface(pos.x, pos.z);
      if (y !== null) pos.y = THREE.MathUtils.lerp(pos.y, y, 0.35);
      player.position.set(pos.x, pos.y + (walking ? Math.abs(Math.sin(t * 12)) * 0.06 : 0), pos.z);
      if (walking && move.lengthSq() > 0) player.rotation.y = Math.atan2(move.x, move.y);
      halo.position.set(pos.x, pos.y + 0.02, pos.z);
      halo.scale.setScalar(1 + Math.sin(t * 3) * 0.08);
      playerLight.position.set(pos.x, pos.y + 1.2, pos.z);

      // Đang đứng trên đảo nào
      let here: number | null = null;
      ISLES.forEach((isle, i) => {
        if (Math.hypot(pos.x - isle.c.x, pos.z - isle.c.y) < WALK_R + 0.1) here = i;
      });
      if (here !== lastIsle) {
        lastIsle = here;
        setOnIsle(here);
      }

      // Chuyển động trang trí
      if (!reduceMotion) {
        spins.forEach((spin) => spin(t));
        debris.forEach((m) => {
          m.position.y += Math.sin(t + m.userData.phase) * 0.003;
          m.rotation.y += 0.002;
        });
        const p = rain.geometry.attributes.position as THREE.BufferAttribute;
        for (let k = 0; k < RAIN; k++) {
          let yy = p.getY(k) - dt * 1.2;
          if (yy < -14) yy = 16;
          p.setY(k, yy);
        }
        p.needsUpdate = true;
      }
      isleObjs.current.forEach((o) => {
        if (o.beam.visible) (o.beam.material as THREE.MeshBasicMaterial).opacity = 0.07 + Math.sin(t * 2.5) * 0.04;
      });

      // Máy quay bám theo người chơi
      camTarget.lerp(pos, 0.08);
      camera.position.copy(camTarget).add(ISO);
      camera.lookAt(camTarget);
      renderer.render(scene, camera);

      // Nhãn HTML bám theo vật mốc
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      ISLES.forEach((isle) => {
        const el = labelRefs.current[isle.id];
        if (!el) return;
        proj.set(isle.c.x, isle.y + 4.6, isle.c.y).project(camera);
        const visible = Math.abs(proj.x) < 1.1 && Math.abs(proj.y) < 1.1;
        el.style.opacity = visible ? '1' : '0';
        el.style.transform = `translate(-50%, -100%) translate(${((proj.x + 1) / 2) * w}px, ${((1 - proj.y) / 2) * h}px)`;
      });
    };
    tick();
    setReady(true);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('resize', onResize);
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        mesh.geometry?.dispose();
        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
        (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((m) => m.dispose());
      });
      renderer.dispose();
      renderer.domElement.remove();
      isleObjs.current = [];
      bridgeObjs.current = [];
      libraryWall.current = null;
    };
    // Dựng cảnh đúng một lần; trạng thái màn cập nhật ở effect bên dưới
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tô trạng thái đảo + cầu mỗi khi tiến độ đổi
  useEffect(() => {
    if (!ready) return;
    journey.stages.forEach((s, i) => {
      const o = isleObjs.current[i];
      if (!o) return;
      const locked = s.status === 'locked';
      o.grass.color.setHex(locked ? COLOR.grassLocked : s.status === 'done' ? COLOR.grassDone : COLOR.grass);
      o.rim.color.setHex(locked ? COLOR.locked : s.status === 'done' ? COLOR.accent : COLOR.line);
      o.landmark.forEach((m) => (m.opacity = locked ? 0.2 : (m.userData.baseOpacity ?? 1)));
      o.beam.visible = s.status === 'open';
      if (i > 0) {
        const open = !locked;
        bridgeOpen.current[i - 1] = open;
        const b = bridgeObjs.current[i - 1];
        if (b) {
          b.full.visible = open;
          b.broken.visible = !open;
        }
      }
    });
  }, [journey.stages, ready]);

  useEffect(() => {
    if (ready && summary && libraryWall.current) paintLibrary(libraryWall.current, summary.verdict);
  }, [ready, summary]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
      window.clearTimeout(flash.current);
    };
  }, []);

  const hereStage = onIsle !== null ? stageAt(onIsle) : null;

  // E / Enter vào màn đang đứng, Esc đóng
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeRef.current) close();
        else onExit();
      } else if ((e.key === 'e' || e.key === 'Enter') && !activeRef.current && hereStage && hereStage.status !== 'locked') {
        enter(hereStage.id);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const finish = (id: StageId) => {
    if (journey.completeStage(id)) {
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.7 }, colors: ['#3df2ff', '#2BFFEA', '#ffffff'], zIndex: 220 });
      setGuideOpen(true);
    }
    close();
  };

  const doneCount = journey.stages.filter((s) => s.status === 'done').length;
  const cur = journey.current;
  const quests = useMemo(() => {
    const first: Record<StageId, boolean> = {
      'khai-niem': Boolean(journey.answers[STAGE1.poll.key]),
      'vi-sao-kiem-dinh': STAGE2.cards.every((c) => journey.answers[`card:${c.id}`]),
      'sau-o': false,
      'thu-vien': false,
      'kiem-diem': false,
      'chuyen-doi': false,
    };
    const curStatus = journey.stages.find((s) => s.id === cur.id)?.status;
    return WORLD.quests[cur.id].map((label, k, all) => ({ label, done: k === all.length - 1 ? curStatus === 'done' : first[cur.id] || curStatus === 'done' }));
  }, [journey.answers, journey.stages, cur.id]);

  // Gắn thẳng vào body: khung trang có transform (motion) sẽ làm position:fixed lệch
  return createPortal(
    <div data-world3d className="fixed inset-0 z-[200] select-none bg-[#040914] text-white">
      <div ref={mountRef} className="absolute inset-0" />

      {failed && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
          <p>Máy của bạn chưa chạy được bản 3D.</p>
          <button type="button" onClick={onExit} className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-black">Chơi bản thường</button>
        </div>
      )}

      {/* Bảng tên từng đảo */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {journey.stages.map((s) => (
          <div
            key={s.id}
            ref={(el) => {
              labelRefs.current[s.id] = el;
            }}
            data-world-label={s.id}
            data-status={s.status}
            className="absolute left-0 top-0 whitespace-nowrap rounded-lg border border-[#3df2ff]/30 bg-[#040914]/80 px-2.5 py-1 text-center text-xs opacity-0 transition-opacity"
          >
            <span className="block font-mono text-[10px] text-[#3df2ff]">Màn {s.order}</span>
            <span className={`block font-semibold ${s.status === 'locked' ? 'text-gray-500' : 'text-white'}`}>{s.title}</span>
            <span className="block text-[10px] text-gray-400">
              {STATUS_TEXT[s.status]}
              {s.status === 'open' && s.reward > 0 && ` · +${s.reward} ${POINT_NAME}`}
            </span>
          </div>
        ))}
      </div>

      {/* Thanh trên: điểm · tiến độ · thoát */}
      <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3 sm:p-4">
        <div className="rounded-xl border border-[#3df2ff]/30 bg-[#040914]/80 px-3 py-2">
          <p className="hidden text-[10px] text-gray-400 sm:block">{WORLD.title}</p>
          <p data-points className="font-mono text-sm font-bold text-[#2BFFEA]">
            ⬡ {journey.points} {POINT_NAME}
          </p>
        </div>
        <div data-world-progress className="min-w-0 flex-1 max-w-xs text-center">
          <p className="truncate text-xs font-semibold sm:text-sm">Màn {cur.order}/6 · {cur.title}</p>
          <div className="mt-1 h-2 overflow-hidden rounded-full border border-[#3df2ff]/30 bg-[#040914]/80">
            <div className="h-full bg-gradient-to-r from-[#FFDD00] to-[#2BFFEA] transition-all" style={{ width: `${(doneCount / 6) * 100}%` }} />
          </div>
        </div>
        <button type="button" onClick={onExit} className="rounded-xl border border-white/20 bg-[#040914]/80 px-3 py-2 text-sm">Thoát</button>
      </div>

      {/* Nhiệm vụ */}
      <div data-world-quests className="absolute right-3 top-20 w-56 rounded-xl border border-[#3df2ff]/30 bg-[#040914]/85 text-xs sm:right-4">
        <button type="button" onClick={() => setQuestOpen((v) => !v)} className="flex w-full items-center justify-between px-3 py-2 font-semibold">
          Nhiệm vụ <span className="text-gray-400">{questOpen ? '–' : '+'}</span>
        </button>
        {questOpen && (
          <ul className="space-y-1.5 px-3 pb-3">
            {quests.map((q) => (
              <li key={q.label} data-quest-done={q.done} className="flex items-start gap-2">
                <span className={`mt-0.5 inline-block h-3 w-3 shrink-0 rounded-sm border ${q.done ? 'border-[#2BFFEA] bg-[#2BFFEA]' : 'border-gray-500'}`} />
                <span className={q.done ? 'text-gray-500 line-through' : 'text-gray-200'}>{q.label}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Bản đồ nhỏ */}
      <svg data-world-minimap viewBox="-6 -6 112 72" className="absolute bottom-24 left-3 hidden w-40 rounded-xl border border-[#3df2ff]/30 bg-[#040914]/85 sm:block">
        {journey.stages.map((s, i) => {
          const x = (i % 2 === 0 ? 10 : 30) + i * 13;
          const yy = 55 - i * 10;
          const next = journey.stages[i + 1];
          return (
            <g key={s.id}>
              {next && <line x1={x} y1={yy} x2={(i % 2 === 1 ? 10 : 30) + (i + 1) * 13} y2={yy - 10} stroke={next.status === 'locked' ? '#3a4656' : '#3df2ff'} strokeWidth="1.5" strokeDasharray={next.status === 'locked' ? '3 3' : undefined} />}
              <circle
                cx={x}
                cy={yy}
                r={onIsle === i ? 7 : 5.5}
                fill={s.status === 'locked' ? '#2e3743' : s.status === 'done' ? '#249080' : '#1e6f62'}
                stroke={s.id === cur.id ? '#2BFFEA' : '#00486b'}
                strokeWidth="1.5"
                className="cursor-pointer"
                onClick={() => walkTo.current(i)}
              />
              <text x={x} y={yy + 2.5} textAnchor="middle" fontSize="7" fill="#fff" pointerEvents="none">{s.order}</text>
            </g>
          );
        })}
      </svg>

      {/* Người dẫn đường */}
      {!active && ready && guideOpen && (
        <div data-world-guide className="absolute bottom-24 left-1/2 flex w-[min(92vw,30rem)] -translate-x-1/2 items-end gap-3 sm:bottom-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-[#2BFFEA] bg-[#00486b] font-bold">L</div>
          <div className="relative flex-1 rounded-2xl border border-[#3df2ff]/40 bg-[#040914]/90 p-3 text-sm">
            <p className="text-[10px] font-semibold text-[#3df2ff]">{WORLD.guideName}</p>
            <p className="text-gray-100">{WORLD.guide[cur.id]}</p>
            <button type="button" onClick={() => setGuideOpen(false)} className="absolute right-2 top-1 text-gray-500" aria-label="Đóng lời dẫn">×</button>
          </div>
        </div>
      )}

      {/* Nút vào màn + thông báo */}
      {!active && ready && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 p-4 pb-6">
          {notice && <p className="rounded-xl bg-[#040914]/90 px-4 py-2 text-sm text-gray-200">{notice}</p>}
          {hereStage && hereStage.status !== 'locked' ? (
            <button type="button" data-world-prompt="enter" onClick={() => enter(hereStage.id)} className="pointer-events-auto rounded-xl bg-[#2BFFEA] px-6 py-3 text-sm font-bold text-black shadow-[0_0_24px_rgba(43,255,234,0.45)]">
              {hereStage.status === 'done' ? 'Xem lại' : 'Vào'} Màn {hereStage.order} · {hereStage.title}
            </button>
          ) : (
            !guideOpen && <p className="rounded-xl bg-[#040914]/70 px-4 py-2 text-center text-xs text-gray-400">{WORLD.hint}</p>
          )}
        </div>
      )}

      {/* Thanh công cụ phải dưới (các nhánh phụ, mở ở giai đoạn sau) */}
      {!active && (
        <div data-world-dock className="absolute bottom-24 right-3 hidden gap-2 sm:bottom-6 sm:right-4 sm:flex">
          {WORLD.dock.map((label) => (
            <button key={label} type="button" disabled title="Sắp mở" className="w-20 rounded-xl border border-[#3df2ff]/30 bg-[#040914]/85 px-2 py-2 text-[11px] text-gray-300 disabled:opacity-60">
              {label}
              <span className="block text-[9px] text-gray-500">Sắp mở</span>
            </button>
          ))}
        </div>
      )}

      {/* Bảng chơi của màn */}
      {active && (
        <div data-world-panel={active} className="absolute inset-0 overflow-y-auto bg-[#040914]/92 backdrop-blur-sm">
          <div className="mx-auto max-w-4xl px-4 pb-24 pt-20">
            <button type="button" onClick={close} className="mb-6 rounded-xl border border-white/20 px-4 py-2 text-sm">
              Về bản đồ
            </button>
            {active === 'khai-niem' && <Stage1 onDone={() => finish('khai-niem')} />}
            {active === 'vi-sao-kiem-dinh' && <Stage2 onDone={() => finish('vi-sao-kiem-dinh')} />}
            {active !== 'khai-niem' && active !== 'vi-sao-kiem-dinh' && <StagePlaceholder stage={stageAt(idxOf(active))} />}
          </div>
        </div>
      )}
    </div>,
    document.body,
  );
}
