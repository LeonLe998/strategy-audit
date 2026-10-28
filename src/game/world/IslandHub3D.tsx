/**
 * Sảnh bản đồ ở trang chủ: 6 đảo nổi nối bằng cầu, mỗi đảo là cửa vào một trang thật.
 * Lần đầu vào: máy quay lướt qua từng đảo kèm một câu (bỏ qua được), rồi dừng ở toàn cảnh.
 * Bấm vào đảo, bảng tên hoặc menu thì máy quay sà xuống đảo rồi chuyển trang.
 * Hình khối dựng bằng code theo bộ hình LM-01…06 (docs/THANH_PHAN_HINH_ANH.md), có bloom + đổ bóng.
 * Không nến, không mũi tên tăng, không vàng thỏi, không đồng xu.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { useJourney } from '../useJourney';
import { useLibrarySummary } from '../useLibraryCards';
import { POINT_NAME, type StageId } from '../journeyConfig';
import { CONTACT, HUB, SA_BOT } from '../../content/journey';
import ContactLinks from '../../components/ContactLinks';
import { funnel } from '../../lib/analytics';

const COLOR = {
  bg: 0x040914,
  glow: 0x00486b,
  line: 0x3df2ff,
  accent: 0x2bffea,
  grass: 0x145247,
  grassDone: 0x1a6a5c,
  grassLocked: 0x2e3743,
  dirt: 0x46383a,
  rock: 0x2c3446,
  tree: 0x1b5e52,
  locked: 0x3a4656,
  situational: 0x1f6f8b,
  fail: 0x18222f,
};

const ISLAND_R = 3.2;
const TOP = 0.3;
const SAG = 0.35;
const ISO = new THREE.Vector3(14, 16, 14);
const S2 = Math.SQRT1_2;
/** Câu trả lời của khách cho SA bot ('yes' | 'no'), lần sau không hỏi lại */
const VISIT_KEY = 'sa_hub_visited_v1';
const INTRO_MS = 2600;
const SHOT_MS = 3400;
/** Chừa chỗ cho thanh trên và dòng chữ dưới khi canh toàn cảnh (px) */
const TOP_PX = 64;
const BOTTOM_PX = 96;
/** Màn hẹp: bong bóng SA bot nằm sát đáy nên chừa thêm chỗ */
const BUBBLE_PX = 200;

interface Isle {
  c: THREE.Vector2;
  y: number;
}
interface Bridge {
  s: THREE.Vector2;
  e: THREE.Vector2;
  ys: number;
  ye: number;
}

/** Xếp 6 đảo hình rắn theo thứ tự đọc: màn ngang 3 cột × 2 hàng, màn dọc 2 cột × 3 hàng. u = lên trên màn hình, v = sang phải. */
function makeLayout(wide: boolean) {
  const grid = wide
    ? [[12, -12], [12, 0], [12, 12], [0, 12], [0, 0], [0, -12]]
    : [[22, -5.5], [22, 5.5], [11, 5.5], [11, -5.5], [0, -5.5], [0, 5.5]];
  const lift = [0.4, 0.9, 0.2, 1.0, 0.5, 1.3];
  const isles: Isle[] = grid.map(([u, v], i) => ({ c: new THREE.Vector2((-u + v) * S2, (-u - v) * S2), y: lift[i] }));
  const bridges: Bridge[] = isles.slice(1).map((b, i) => {
    const a = isles[i];
    const d = b.c.clone().sub(a.c).normalize();
    return { s: a.c.clone().addScaledVector(d, ISLAND_R - 0.35), e: b.c.clone().addScaledVector(d, -(ISLAND_R - 0.35)), ys: a.y + TOP, ye: b.y + TOP };
  });
  const [bu, bv] = wide ? [-8.5, 0] : [-7, 0];
  const bot = new THREE.Vector3((-bu + bv) * S2, 0.9, (-bu - bv) * S2);
  return { isles, bridges, bot };
}

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

type Spin = (t: number) => void;

const STONE = 0x2b3647;

/** Khối đá có viền sáng mảnh — kiểu bệ đá trong bộ hình vật mốc */
function stone(mats: THREE.Material[], geo: THREE.BufferGeometry, edgeOpacity = 0.35) {
  const m = flat(STONE, { transparent: true });
  const lm = new THREE.LineBasicMaterial({ color: COLOR.line, transparent: true, opacity: edgeOpacity });
  mats.push(m, lm);
  const mesh = new THREE.Mesh(geo, m);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, 25), lm));
  return mesh;
}
/** Khối phát sáng (bloom làm loé) */
function lit(mats: THREE.Material[], geo: THREE.BufferGeometry, color: number, intensity = 1) {
  const m = glow(color, intensity);
  mats.push(m);
  const mesh = new THREE.Mesh(geo, m);
  mesh.castShadow = true;
  return mesh;
}
/** Khung viền sáng quanh một khối (lá bài, bảng) */
function frame(mats: THREE.Material[], geo: THREE.BufferGeometry, color: number) {
  const lm = new THREE.LineBasicMaterial({ color, transparent: true });
  mats.push(lm);
  return new THREE.LineSegments(new THREE.EdgesGeometry(geo), lm);
}

/** Mỗi màn một vật mốc đặt trên mặt đảo, gốc ở mặt cỏ. Quay 45° để mặt chính hướng về máy quay. */
function buildLandmark(id: StageId, group: THREE.Group, mats: THREE.Material[], library: { current: THREE.InstancedMesh | null }): Spin {
  group.rotation.y = Math.PI / 4;
  switch (id) {
    case 'khai-niem': {
      // Trạm khởi hành: ba bệ Học · Đo · Thực hành quanh viên tinh thể câu hỏi
      const pedestal = (x: number, z: number, r: number, h: number) => {
        const p = stone(mats, new THREE.CylinderGeometry(r, r * 1.12, h, 8));
        p.position.set(x, h / 2, z);
        group.add(p);
        return h;
      };
      // Học: cuốn sách mở
      const hb = pedestal(-1.15, 0.35, 0.42, 0.42);
      const pageMat = flat(0xd6e2ee, { emissive: 0x3df2ff, emissiveIntensity: 0.15, transparent: true });
      mats.push(pageMat);
      [-1, 1].forEach((k) => {
        const page = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.03, 0.42), pageMat);
        page.position.set(-1.15 + k * 0.15, hb + 0.05, 0.35);
        page.rotation.z = k * -0.18;
        page.castShadow = true;
        group.add(page);
      });
      // Đo: mặt đồng hồ có kim
      const hg = pedestal(0, -1.0, 0.42, 0.55);
      const dial = stone(mats, new THREE.CylinderGeometry(0.32, 0.32, 0.08, 20));
      dial.rotation.x = Math.PI / 2;
      dial.position.set(0, hg + 0.36, -1.0);
      const face = lit(mats, new THREE.TorusGeometry(0.27, 0.025, 6, 32), COLOR.line, 1.3);
      face.position.set(0, hg + 0.36, -0.95);
      const needle = lit(mats, new THREE.BoxGeometry(0.03, 0.24, 0.02), COLOR.accent, 1.4);
      needle.geometry.translate(0, 0.1, 0);
      needle.position.set(0, hg + 0.33, -0.94);
      group.add(dial, face, needle);
      // Thực hành: bàn nhỏ có đèn
      const hd = pedestal(1.15, 0.35, 0.45, 0.45);
      const desk = stone(mats, new THREE.BoxGeometry(0.62, 0.05, 0.42));
      desk.position.set(1.15, hd + 0.28, 0.35);
      group.add(desk);
      [[-0.26, -0.17], [0.26, -0.17], [-0.26, 0.17], [0.26, 0.17]].forEach(([dx, dz]) => {
        const leg = stone(mats, new THREE.BoxGeometry(0.04, 0.26, 0.04), 0.15);
        leg.position.set(1.15 + dx, hd + 0.13, 0.35 + dz);
        group.add(leg);
      });
      const lamp = lit(mats, new THREE.SphereGeometry(0.06, 10, 8), COLOR.accent, 2);
      lamp.position.set(1.32, hd + 0.42, 0.25);
      group.add(lamp);
      // Giữa: tinh thể câu hỏi trên bệ thấp
      pedestal(0, 0.25, 0.5, 0.22);
      const ring = lit(mats, new THREE.TorusGeometry(0.42, 0.03, 6, 32), COLOR.line, 1.2);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(0, 0.24, 0.25);
      const crystal = lit(mats, new THREE.OctahedronGeometry(0.32), COLOR.accent, 1.6);
      crystal.scale.y = 1.6;
      group.add(ring, crystal);
      return (t) => {
        crystal.position.set(0, 1.05 + Math.sin(t * 1.6) * 0.1, 0.25);
        crystal.rotation.y = t * 0.9;
        needle.rotation.z = Math.sin(t * 0.8) * 0.9;
      };
    }
    case 'vi-sao-kiem-dinh': {
      // Phòng thi: bục đá, ba lá bài viền sáng xoè quạt, con dấu
      const slab = stone(mats, new THREE.BoxGeometry(2.6, 0.28, 1.7));
      slab.position.y = 0.14;
      group.add(slab);
      const cards: THREE.Group[] = [];
      [-1, 0, 1].forEach((k) => {
        const g = new THREE.Group();
        const geo = new THREE.BoxGeometry(0.72, 1.05, 0.05);
        const fill = new THREE.MeshStandardMaterial({ color: 0x0b2236, emissive: COLOR.glow, emissiveIntensity: 0.5, transparent: true });
        mats.push(fill);
        const card = new THREE.Mesh(geo, fill);
        card.castShadow = true;
        g.add(card, frame(mats, geo, k === 1 ? COLOR.accent : COLOR.line));
        g.position.set(k * 0.62, 0.95, -0.25 - Math.abs(k) * 0.08);
        g.rotation.set(0, -k * 0.22, -k * 0.12);
        cards.push(g);
        group.add(g);
      });
      const stampBase = stone(mats, new THREE.CylinderGeometry(0.22, 0.26, 0.14, 16));
      stampBase.position.set(0.8, 0.35, 0.45);
      const stem = stone(mats, new THREE.CylinderGeometry(0.05, 0.05, 0.3, 8), 0.15);
      stem.position.set(0.8, 0.57, 0.45);
      const knob = lit(mats, new THREE.SphereGeometry(0.11, 12, 10), COLOR.line, 0.9);
      knob.position.set(0.8, 0.76, 0.45);
      group.add(stampBase, stem, knob);
      return (t) => cards.forEach((c, i) => (c.position.y = 0.95 + Math.sin(t * 1.4 + i) * 0.06));
    }
    case 'sau-o': {
      // Tổ ong: sáu ô lục giác rỗng có khe sáng, cổng khoá ở mép bệ
      const base = stone(mats, new THREE.CylinderGeometry(1.75, 1.85, 0.24, 6));
      base.position.y = 0.12;
      group.add(base);
      const slots: THREE.MeshStandardMaterial[] = [];
      const cells = [
        [-0.62, -0.32], [0, -0.32], [0.62, -0.32],
        [-0.31, 0.22], [0.31, 0.22], [0.93, 0.22],
      ];
      cells.forEach(([x, z]) => {
        const cell = stone(mats, new THREE.CylinderGeometry(0.33, 0.33, 0.5, 6));
        cell.position.set(x - 0.15, 0.49, z);
        const slotMat = glow(COLOR.line, 0.3);
        mats.push(slotMat);
        slots.push(slotMat);
        const slot = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.02, 6), slotMat);
        slot.position.set(x - 0.15, 0.75, z);
        group.add(cell, slot);
      });
      // Cổng khoá: hai cột + xà + ổ khoá lục giác
      [-0.32, 0.32].forEach((dx) => {
        const post = stone(mats, new THREE.BoxGeometry(0.12, 0.75, 0.12));
        post.position.set(dx - 0.2, 0.6, 1.25);
        group.add(post);
      });
      const lintel = stone(mats, new THREE.BoxGeometry(0.82, 0.12, 0.16));
      lintel.position.set(-0.2, 1.0, 1.25);
      const lock = lit(mats, new THREE.CylinderGeometry(0.13, 0.13, 0.05, 6), COLOR.accent, 1.4);
      lock.rotation.x = Math.PI / 2;
      lock.position.set(-0.2, 0.6, 1.25);
      group.add(lintel, lock);
      return (t) => {
        const on = Math.floor(t * 1.2) % 7;
        slots.forEach((m, i) => (m.emissiveIntensity = i < on ? 1.6 : 0.3));
      };
    }
    case 'thu-vien': {
      // Toà lưu trữ: mặt trước là tường ngăn kéo hồ sơ, tô màu theo kết quả thư viện khi dữ liệu về
      const step = stone(mats, new THREE.BoxGeometry(2.4, 0.12, 1.6), 0.2);
      step.position.y = 0.06;
      const body = stone(mats, new THREE.BoxGeometry(2.1, 1.55, 1.3));
      body.position.y = 0.88;
      const roof = stone(mats, new THREE.BoxGeometry(2.3, 0.14, 1.5));
      roof.position.y = 1.72;
      group.add(step, body, roof);
      const m = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x05121b, roughness: 0.4, transparent: true });
      mats.push(m);
      const wall = new THREE.InstancedMesh(new THREE.BoxGeometry(0.068, 0.068, 0.03), m, 300);
      wall.count = 0;
      wall.position.set(0, 0.9, 0.66);
      library.current = wall;
      group.add(wall);
      return () => undefined;
    }
    case 'kiem-diem': {
      // Trạm nhiệm vụ: cột tín hiệu, vòng sáng xoay, bảng nhiệm vụ
      const base = stone(mats, new THREE.CylinderGeometry(0.62, 0.72, 0.22, 10));
      base.position.y = 0.11;
      const pillar = stone(mats, new THREE.CylinderGeometry(0.16, 0.2, 2.1, 10));
      pillar.position.y = 1.27;
      const orb = lit(mats, new THREE.SphereGeometry(0.24, 16, 12), COLOR.accent, 1.5);
      orb.position.y = 2.5;
      group.add(base, pillar, orb);
      const rings: THREE.Mesh[] = [0.6, 0.48].map((r, i) => {
        const ring = lit(mats, new THREE.TorusGeometry(r, 0.035, 6, 40), COLOR.line, 1.4);
        ring.position.y = 1.55 + i * 0.4;
        group.add(ring);
        return ring;
      });
      const boardGeo = new THREE.BoxGeometry(0.62, 0.46, 0.05);
      const board = stone(mats, boardGeo, 0);
      board.position.set(0.55, 0.8, 0.35);
      board.rotation.y = -0.3;
      board.add(frame(mats, boardGeo, COLOR.line));
      const post = stone(mats, new THREE.BoxGeometry(0.06, 0.6, 0.06), 0.15);
      post.position.set(0.55, 0.3, 0.33);
      group.add(board, post);
      return (t) => {
        rings[0].rotation.set(Math.PI / 2 + Math.sin(t) * 0.25, 0, t * 0.8);
        rings[1].rotation.set(Math.PI / 2 - Math.sin(t) * 0.25, 0, -t * 1.1);
      };
    }
    case 'chuyen-doi': {
      // Cổng cuối: vòm đá, màn sáng, tinh thể quanh chân
      const base = stone(mats, jitter(new THREE.CylinderGeometry(1.5, 1.65, 0.3, 9), 0.12, (y) => y > 0));
      base.position.y = 0.15;
      group.add(base);
      [-0.95, 0.95].forEach((x) => {
        const p = stone(mats, new THREE.BoxGeometry(0.32, 1.9, 0.36));
        p.position.set(x, 1.25, 0);
        group.add(p);
      });
      const arch = stone(mats, new THREE.TorusGeometry(0.95, 0.17, 6, 14, Math.PI));
      arch.position.y = 2.2;
      group.add(arch);
      const veilMat = glow(COLOR.accent, 1.1);
      veilMat.opacity = 0.55;
      veilMat.side = THREE.DoubleSide;
      veilMat.depthWrite = false;
      mats.push(veilMat);
      const veilRect = new THREE.Mesh(new THREE.PlaneGeometry(1.58, 1.9), veilMat);
      veilRect.position.y = 1.25;
      const veilTop = new THREE.Mesh(new THREE.CircleGeometry(0.79, 24, 0, Math.PI), veilMat);
      veilTop.position.y = 2.2;
      group.add(veilRect, veilTop);
      [[-1.25, 0.5, 0.5], [1.2, 0.6, 0.4], [-0.7, 0.9, 0.35], [1.0, -0.6, 0.3]].forEach(([x, z, s]) => {
        const c = lit(mats, new THREE.OctahedronGeometry(s), COLOR.line, 1.1);
        c.scale.y = 1.8;
        c.position.set(x, 0.3 + s * 0.9, z);
        c.rotation.z = x * 0.15;
        group.add(c);
      });
      return (t) => (veilMat.emissiveIntensity = 0.9 + Math.sin(t * 2) * 0.35);
    }
  }
}


/** Đảo nổi low-poly: mặt cỏ, lớp đất, khối đá nhọn phía dưới, cây và tinh thể quanh mép (tránh hướng có cầu) */
function buildIsland(isle: Isle, i: number, bridgeAngles: number[], scene: THREE.Scene, pickables: THREE.Object3D[]) {
  const root = new THREE.Group();
  root.position.set(isle.c.x, isle.y, isle.c.y);

  const topGeo = jitter(new THREE.CylinderGeometry(ISLAND_R, ISLAND_R - 0.2, 0.6, 12), 0.18, (y) => y > 0);
  const top = new THREE.Mesh(topGeo, flat(COLOR.grass));
  top.receiveShadow = true;
  const dirt = new THREE.Mesh(jitter(new THREE.CylinderGeometry(ISLAND_R - 0.15, ISLAND_R - 0.45, 0.5, 12), 0.25, () => false), flat(COLOR.dirt));
  dirt.position.y = -0.52;
  const rock = new THREE.Mesh(jitter(new THREE.ConeGeometry(ISLAND_R - 0.4, 3.8, 10, 3), 0.5, () => false), flat(COLOR.rock));
  rock.rotation.x = Math.PI;
  rock.position.y = -2.7;
  root.add(top, dirt, rock);

  // Vệt sáng dưới đáy đá
  const vein = new THREE.Mesh(new THREE.ConeGeometry(0.08, 2.6, 4), glow(COLOR.line, 1.2));
  vein.rotation.x = Math.PI;
  vein.position.set(0.6, -2.4, 0.9);
  root.add(vein);
  root.add(new THREE.LineSegments(new THREE.EdgesGeometry(topGeo, 30), new THREE.LineBasicMaterial({ color: COLOR.line, transparent: true, opacity: 0.8 })));

  // Vòng phù văn lục giác quanh vật mốc, sáng lên khi đảo được chọn
  const rune = new THREE.MeshBasicMaterial({ color: COLOR.line, transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false });
  const ring = new THREE.Mesh(new THREE.RingGeometry(2.05, 2.15, 6), rune);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = TOP + 0.02;
  root.add(ring);

  const r = rng(i * 17 + 3);
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
      tree.castShadow = true;
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.2, 5), flat(COLOR.dirt));
      trunk.position.set(x, TOP + 0.1, z);
      root.add(tree, trunk);
    }
  }
  root.traverse((o) => (o.userData.isle = i));
  pickables.push(root);
  scene.add(root);
  return rune;
}

/** Cầu ván treo có tay vịn sáng và đèn ở bốn góc đầu cầu */
function buildBridge(b: Bridge, scene: THREE.Scene) {
  const len = b.s.distanceTo(b.e);
  const n = Math.ceil(len / 0.34);
  const yaw = Math.atan2(b.e.x - b.s.x, b.e.y - b.s.y);
  const group = new THREE.Group();
  const plankGeo = new THREE.BoxGeometry(1.15, 0.08, 0.26);
  const plankMat = flat(0x2c3c52);
  const railPts: THREE.Vector3[][] = [[], []];
  const side = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw)).multiplyScalar(0.58);
  for (let k = 0; k <= n; k++) {
    const t = k / n;
    const x = THREE.MathUtils.lerp(b.s.x, b.e.x, t);
    const z = THREE.MathUtils.lerp(b.s.y, b.e.y, t);
    const y = THREE.MathUtils.lerp(b.ys, b.ye, t) - Math.sin(Math.PI * t) * SAG - 0.05;
    const plank = new THREE.Mesh(plankGeo, plankMat);
    plank.position.set(x, y, z);
    plank.rotation.y = yaw;
    plank.receiveShadow = true;
    group.add(plank);
    railPts[0].push(new THREE.Vector3(x, y + 0.45, z).add(side));
    railPts[1].push(new THREE.Vector3(x, y + 0.45, z).sub(side));
  }
  const railMat = glow(COLOR.line, 0.55);
  railPts.forEach((pts) => group.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), n * 2, 0.028, 5, false), railMat)));
  const postMat = flat(0x2b3647);
  const bulbMat = glow(COLOR.accent, 1.3);
  [railPts[0][0], railPts[1][0], railPts[0][n], railPts[1][n]].forEach((p) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.75, 6), postMat);
    post.position.set(p.x, p.y - 0.12, p.z);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), bulbMat);
    bulb.position.set(p.x, p.y + 0.3, p.z);
    group.add(post, bulb);
  });
  scene.add(group);
}

/** SA bot: robot low-poly lơ lửng trước cụm đảo, mắt và lõi là dải sáng. Mọi khối gắn userData.bot để bấm được. */
function buildBot(scene: THREE.Scene, at: THREE.Vector3): Spin {
  const g = new THREE.Group();
  g.position.copy(at);
  g.rotation.y = Math.PI / 4;
  g.scale.setScalar(1.7);
  const shell = flat(0xd3e2ec, { roughness: 0.55 });
  const dark = flat(0x13202e);
  const body = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55, 1), shell);
  body.scale.set(1, 0.9, 0.9);
  body.position.y = 0.9;
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.7, 0.8), shell);
  head.position.y = 1.75;
  const face = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.46, 0.05), dark);
  face.position.set(0, 1.75, 0.41);
  const eyeMat = glow(COLOR.accent, 2);
  const eyes = [-0.18, 0.18].map((x) => {
    const e = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.1, 0.03), eyeMat);
    e.position.set(x, 1.78, 0.44);
    return e;
  });
  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.3, 5), dark);
  antenna.position.y = 2.25;
  const tipMat = glow(COLOR.accent, 2);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), tipMat);
  tip.position.y = 2.42;
  const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.13), glow(COLOR.line, 1.6));
  core.position.set(0, 0.95, 0.5);
  const hands = [-1, 1].map((k) => {
    const h = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), shell);
    h.position.set(k * 0.78, 0.95, 0.05);
    return h;
  });
  const pad = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.035, 6, 32), glow(COLOR.line, 1.2));
  pad.rotation.x = Math.PI / 2;
  pad.position.y = 0.15;
  g.add(body, head, face, ...eyes, antenna, tip, core, ...hands, pad);
  g.traverse((o) => {
    o.castShadow = true;
    o.userData.bot = true;
  });
  scene.add(g);
  return (t) => {
    g.position.y = at.y + Math.sin(t * 1.8) * 0.12;
    hands.forEach((h, k) => (h.position.y = 0.95 + Math.sin(t * 1.8 + k * 1.6) * 0.07));
    tipMat.emissiveIntensity = 1.4 + Math.sin(t * 3) * 0.8;
    // Chớp mắt mỗi 4 giây
    eyes.forEach((e) => (e.scale.y = t % 4 < 0.12 ? 0.15 : 1));
  };
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
    mtx.makeTranslation(((i % cols) - (cols - 1) / 2) * 0.085, ((rows - 1) / 2) * 0.085 - Math.floor(i / cols) * 0.085, 0);
    wall.setMatrixAt(i, mtx);
    wall.setColorAt(i, col.setHex(hex));
  });
  wall.count = list.length;
  wall.instanceMatrix.needsUpdate = true;
  if (wall.instanceColor) wall.instanceColor.needsUpdate = true;
}

type Via = 'island' | 'label' | 'menu' | 'caption' | 'bot';

type Visit = 'yes' | 'no';
/** ask = đang hỏi câu 1 · new = khách mới (sáng đảo đầu + ghi chú) · free = đã từng vào, mở hết */
type BotMode = 'ask' | 'new' | 'free';

const readVisit = (): Visit | null => {
  try {
    const v = localStorage.getItem(VISIT_KEY);
    return v === 'yes' || v === 'no' ? v : null;
  } catch {
    return null;
  }
};
const saveVisit = (v: Visit) => {
  try {
    localStorage.setItem(VISIT_KEY, v);
  } catch {
    /* trình duyệt chặn lưu thì lần sau SA bot hỏi lại */
  }
};

export default function IslandHub3D({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const journey = useJourney();
  const summary = useLibrarySummary();
  const mountRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const libraryWall = useRef<THREE.InstancedMesh | null>(null);
  /** Đặt máy quay: số = sà xuống đảo đó, null = toàn cảnh. `mult` phóng to thêm khi bay vào trang. */
  const shotRef = useRef<(i: number | null, mult?: number) => void>(() => undefined);
  const tourRef = useRef<number | null>(null);
  const leaving = useRef(false);
  const leaveTimer = useRef<number | undefined>(undefined);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  /** -1 = câu mở đầu ở toàn cảnh, 0…5 = đang dừng ở đảo đó, null = xong vòng giới thiệu */
  const [tour, setTour] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [touch] = useState(() => window.matchMedia('(hover: none)').matches);
  const [narrow] = useState(() => window.innerWidth < 640);
  const [mode, setMode] = useState<BotMode>(() => {
    const v = readVisit();
    return v === 'yes' ? 'free' : v === 'no' ? 'new' : 'ask';
  });
  /** Bong bóng SA bot đang mở. Lần đầu (chưa trả lời) thì mở sẵn. */
  const [botOpen, setBotOpen] = useState(() => readVisit() === null);
  /** Đảo đang hiện ghi chú: rê chuột (máy tính) hoặc chạm lần 1 (điện thoại) */
  const [hoverIsle, setHoverIsle] = useState<number | null>(null);
  const [note, setNote] = useState<number | null>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const modeRef = useRef(mode);
  const botOpenRef = useRef(botOpen);
  tourRef.current = tour;
  modeRef.current = mode;
  botOpenRef.current = botOpen;

  const endTour = useCallback((action: 'done' | 'skip') => {
    setTour(null);
    funnel.hubTour(action);
  }, []);

  const go = useCallback(
    (i: number, via: Via) => {
      if (leaving.current) return;
      leaving.current = true;
      const isle = HUB.islands[i];
      funnel.hubIsland(isle.key, via);
      setMenuOpen(false);
      shotRef.current(i, 1.6);
      leaveTimer.current = window.setTimeout(() => onNavigate(isle.tab), 700);
    },
    [onNavigate],
  );
  /** Khách mới trên điện thoại: chạm lần 1 hiện ghi chú, chạm lần 2 mới vào. Đảo đầu tiên vào luôn. */
  const tap = (i: number, via: Via) => {
    if (mode === 'new' && touch && i !== 0 && note !== i) {
      setNote(i);
      return;
    }
    go(i, via);
  };
  const tapRef = useRef(tap);
  tapRef.current = tap;
  const botTapRef = useRef(() => setBotOpen((v) => !v));
  const hoverRef = useRef(setHoverIsle);

  const answer = (v: Visit) => {
    saveVisit(v);
    funnel.hubBot(v === 'yes' ? 'visited_yes' : 'visited_no');
    setMode(v === 'yes' ? 'free' : 'new');
    setNote(null);
  };

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
    const small = window.innerWidth < 640;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, small ? 1.25 : 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.domElement.style.touchAction = 'manipulation';
    mount.appendChild(renderer.domElement);

    const { isles, bridges, bot } = makeLayout(mount.clientWidth >= mount.clientHeight);
    const center = isles.reduce((a, s) => a.add(new THREE.Vector3(s.c.x, s.y, s.c.y)), new THREE.Vector3()).divideScalar(isles.length);

    const scene = new THREE.Scene();
    // Nền trời: quầng xanh ở giữa, tối dần ra mép
    const sky = document.createElement('canvas');
    sky.width = sky.height = 512;
    const ctx = sky.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(256, 200, 20, 256, 256, 380);
      grad.addColorStop(0, '#0d3550');
      grad.addColorStop(0.45, '#071a2c');
      grad.addColorStop(1, '#040914');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);
    }
    const skyTex = new THREE.CanvasTexture(sky);
    skyTex.colorSpace = THREE.SRGBColorSpace;
    scene.background = skyTex;
    scene.fog = new THREE.Fog(COLOR.bg, 40, 95);

    // Lưới mờ phía dưới, như mặt sàn dữ liệu
    const floor = new THREE.GridHelper(260, 130, COLOR.glow, COLOR.glow);
    (floor.material as THREE.Material).transparent = true;
    (floor.material as THREE.Material).opacity = 0.22;
    floor.position.set(center.x, -12, center.z);
    scene.add(floor);

    // Đảo xa làm phông quanh cụm đảo chính
    const far = rng(41);
    for (let k = 0; k < 9; k++) {
      const ang = (k / 9) * Math.PI * 2 + far() * 0.5;
      const rad = 24 + far() * 8;
      const x = center.x + Math.cos(ang) * rad;
      const z = center.z + Math.sin(ang) * rad;
      const r = 1.2 + far() * 1.8;
      const fy = -3.5 - far() * 4;
      const cap = new THREE.Mesh(jitter(new THREE.CylinderGeometry(r, r * 0.9, 0.4, 9), 0.15, (yy) => yy > 0), flat(0x173a36));
      cap.position.set(x, fy, z);
      const under = new THREE.Mesh(jitter(new THREE.ConeGeometry(r * 0.9, r * 2.2, 9, 2), 0.3, () => false), flat(0x1a2030));
      under.rotation.x = Math.PI;
      under.position.set(x, fy - 0.2 - r * 1.1, z);
      scene.add(cap, under);
    }

    // Máy quay chéo kiểu isometric. F = số đơn vị thấy theo chiều dọc khi zoom = 1.
    const F = 20;
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 200);
    const fitFrustum = () => {
      const aspect = mount.clientWidth / mount.clientHeight;
      camera.left = (-F * aspect) / 2;
      camera.right = (F * aspect) / 2;
      camera.top = F / 2;
      camera.bottom = -F / 2;
      camera.updateProjectionMatrix();
    };
    fitFrustum();
    camera.position.copy(ISO);
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();
    const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
    const up = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1);

    scene.add(new THREE.HemisphereLight(0x9fe9ff, 0x0a1020, 0.45));
    scene.add(new THREE.AmbientLight(0xffffff, 0.25));
    const sun = new THREE.DirectionalLight(0xfff4e6, 1.5);
    sun.position.copy(center).add(new THREE.Vector3(10, 18, 6));
    sun.target.position.copy(center);
    sun.castShadow = true;
    sun.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048);
    Object.assign(sun.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, near: 1, far: 80 });
    sun.shadow.bias = -0.0005;
    sun.shadow.normalBias = 0.02;
    scene.add(sun, sun.target);
    // Ánh viền lạnh từ phía sau cho đảo nổi khối
    const back = new THREE.DirectionalLight(0x3df2ff, 0.9);
    back.position.copy(center).add(new THREE.Vector3(-10, 6, -12));
    scene.add(back);

    // Mưa dữ liệu: các hạt sáng rơi chậm
    const RAIN = 500;
    const rainPos = new Float32Array(RAIN * 3);
    const rr = rng(99);
    for (let k = 0; k < RAIN; k++) {
      rainPos[k * 3] = center.x + (rr() - 0.5) * 90;
      rainPos[k * 3 + 1] = rr() * 30 - 12;
      rainPos[k * 3 + 2] = center.z + (rr() - 0.5) * 90;
    }
    const rainGeo = new THREE.BufferGeometry();
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
    const rain = new THREE.Points(rainGeo, new THREE.PointsMaterial({ color: COLOR.line, size: 0.08, transparent: true, opacity: 0.45 }));
    scene.add(rain);

    // Đá vụn lơ lửng
    const debris: THREE.Mesh[] = [];
    const dr = rng(5);
    for (let k = 0; k < 14; k++) {
      const m = new THREE.Mesh(jitter(new THREE.DodecahedronGeometry(0.3 + dr() * 0.5, 0), 0.15, () => false), flat(COLOR.rock));
      const isle = isles[Math.floor(dr() * isles.length)];
      m.position.set(isle.c.x + (dr() - 0.5) * 14, isle.y - 2 - dr() * 4, isle.c.y + (dr() - 0.5) * 14);
      m.userData.phase = dr() * 6;
      debris.push(m);
      scene.add(m);
    }

    const pickables: THREE.Object3D[] = [];
    const spins: Spin[] = [];
    const fx: { rune: THREE.MeshBasicMaterial; beam: THREE.Mesh }[] = [];
    isles.forEach((isle, i) => {
      const angles = bridges
        .flatMap((b, j) => (j === i ? [b.s] : j === i - 1 ? [b.e] : []))
        .map((p) => Math.atan2(p.y - isle.c.y, p.x - isle.c.x));
      const rune = buildIsland(isle, i, angles, scene, pickables);
      const group = new THREE.Group();
      group.position.set(isle.c.x, isle.y + TOP, isle.c.y);
      spins.push(buildLandmark(HUB.islands[i].landmark, group, [], libraryWall));
      group.traverse((o) => (o.userData.isle = i));
      pickables.push(group);
      scene.add(group);

      const beam = new THREE.Mesh(
        new THREE.CylinderGeometry(0.6, 1.8, 12, 24, 1, true),
        new THREE.MeshBasicMaterial({ color: COLOR.accent, transparent: true, opacity: 0.05, side: THREE.DoubleSide, depthWrite: false }),
      );
      beam.position.set(isle.c.x, isle.y + 6, isle.c.y);
      beam.visible = false;
      scene.add(beam);
      fx.push({ rune, beam });
    });
    bridges.forEach((b) => buildBridge(b, scene));
    spins.push(buildBot(scene, bot));
    scene.traverse((o) => o.userData.bot && pickables.push(o));

    // Toàn cảnh: lấy khung bao của mọi đảo (cả đáy đá và bảng tên) theo trục màn hình, canh vừa phần giữa thanh trên và dòng chữ dưới
    const samples: THREE.Vector3[] = [];
    isles.forEach((s) => {
      [[ISLAND_R, 0], [-ISLAND_R, 0], [0, ISLAND_R], [0, -ISLAND_R]].forEach(([dx, dz]) => samples.push(new THREE.Vector3(s.c.x + dx, s.y + TOP, s.c.y + dz)));
      samples.push(new THREE.Vector3(s.c.x, s.y - 4.6, s.c.y), new THREE.Vector3(s.c.x, s.y + 6, s.c.y));
    });
    samples.push(bot.clone().setY(bot.y - 0.3), bot.clone().setY(bot.y + 4.4));
    const bottomPx = () => (narrow && botOpenRef.current && tourRef.current === null ? BUBBLE_PX : BOTTOM_PX);
    const overview = () => {
      let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
      samples.forEach((p) => {
        const x = p.dot(right), y = p.dot(up);
        x0 = Math.min(x0, x);
        x1 = Math.max(x1, x);
        y0 = Math.min(y0, y);
        y1 = Math.max(y1, y);
      });
      const W = mount.clientWidth, H = mount.clientHeight;
      const zoom = Math.min((F * (W - 24)) / (H * (x1 - x0)), (F * (H - TOP_PX - bottomPx())) / (H * (y1 - y0)));
      const ppu = (H * zoom) / F;
      const target = right.clone().multiplyScalar((x0 + x1) / 2).addScaledVector(up, (y0 + y1) / 2 - (bottomPx() - TOP_PX) / 2 / ppu);
      return { target, zoom };
    };
    // Cận cảnh một đảo: khoảng 14 đơn vị theo cạnh ngắn, đẩy lên trên để chừa ô chữ phía dưới
    const closeUp = (i: number) => {
      const s = isles[i];
      const W = mount.clientWidth, H = mount.clientHeight;
      const zoom = (F * Math.min(W / H, 1)) / 14;
      const ppu = (H * zoom) / F;
      return { target: new THREE.Vector3(s.c.x, s.y + 1.2, s.c.y).addScaledVector(up, -(W < 640 ? 95 : 70) / ppu), zoom };
    };

    let goalKind: number | null = null;
    let goalMult = 1;
    let goal = overview();
    const cam = { target: goal.target.clone(), zoom: goal.zoom * (reduceMotion ? 1 : 0.72) };
    const aim = () => {
      goal = goalKind === null ? overview() : closeUp(goalKind);
      goal.zoom *= goalMult;
    };
    shotRef.current = (i, mult = 1) => {
      goalKind = i;
      goalMult = mult;
      aim();
    };

    // Rê chuột: sáng đảo dưới con trỏ. Chạm/bấm (không kéo): vào trang của đảo đó.
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    let hover: number | null = null;
    const pick = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObjects(pickables, true)[0];
      if (hit?.object.userData.bot) return 'bot' as const;
      return (hit?.object.userData.isle as number | undefined) ?? null;
    };
    let downAt: { x: number; y: number } | null = null;
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const hit = pick(e);
      const next = typeof hit === 'number' ? hit : null;
      if (next !== hover) hoverRef.current(next);
      hover = next;
      renderer.domElement.style.cursor = hit !== null ? 'pointer' : '';
    };
    const onPointerDown = (e: PointerEvent) => (downAt = { x: e.clientX, y: e.clientY });
    const onPointerUp = (e: PointerEvent) => {
      if (!downAt || Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) > 8) return;
      const hit = pick(e);
      if (hit === 'bot') botTapRef.current();
      else if (hit !== null) tapRef.current(hit, 'island');
    };
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(mount.clientWidth / 2, mount.clientHeight / 2), 0.6, 0.45, 0.85);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());

    const onResize = () => {
      fitFrustum();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      composer.setSize(mount.clientWidth, mount.clientHeight);
      bloom.resolution.set(mount.clientWidth / 2, mount.clientHeight / 2);
      aim();
    };
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();
    const proj = new THREE.Vector3();
    let frame = 0;
    const tick = () => {
      frame = requestAnimationFrame(tick);
      if (document.hidden) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;

      // Máy quay trôi êm tới khung đang nhắm
      const k = reduceMotion ? 1 : 1 - Math.exp(-dt * 2.4);
      cam.target.lerp(goal.target, k);
      cam.zoom += (goal.zoom - cam.zoom) * k;
      camera.zoom = cam.zoom;
      camera.updateProjectionMatrix();
      camera.position.copy(cam.target).add(ISO);
      camera.lookAt(cam.target);

      const focus = goalKind ?? hover ?? (modeRef.current === 'new' ? 0 : null);
      fx.forEach((f, i) => {
        const on = i === focus;
        f.beam.visible = on;
        if (on) (f.beam.material as THREE.MeshBasicMaterial).opacity = 0.05 + Math.sin(t * 2.5) * 0.02;
        f.rune.opacity = on ? 0.95 : 0.45;
      });

      if (!reduceMotion) {
        spins.forEach((spin) => spin(t));
        debris.forEach((m) => {
          m.position.y += Math.sin(t + m.userData.phase) * 0.003;
          m.rotation.y += 0.002;
        });
        const p = rain.geometry.attributes.position as THREE.BufferAttribute;
        for (let n = 0; n < RAIN; n++) {
          let yy = p.getY(n) - dt * 1.2;
          if (yy < -14) yy = 16;
          p.setY(n, yy);
        }
        p.needsUpdate = true;
      }
      composer.render();

      // Bảng tên bám theo đảo, chỉ hiện khi đã xong vòng giới thiệu
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      const show = tourRef.current === null && !leaving.current;
      isles.forEach((isle, i) => {
        const el = labelRefs.current[i];
        if (!el) return;
        proj.set(isle.c.x, isle.y + 3.3, isle.c.y).project(camera);
        const visible = show && Math.abs(proj.x) < 1.05 && Math.abs(proj.y) < 1.05;
        el.style.opacity = visible ? '1' : '0';
        el.style.pointerEvents = visible ? 'auto' : 'none';
        el.dataset.hover = String(i === hover);
        el.style.transform = `translate(-50%, -100%) translate(${((proj.x + 1) / 2) * w}px, ${((1 - proj.y) / 2) * h}px)`;
      });

      // Bong bóng SA bot (màn rộng) đứng bên phải đầu robot, không tràn mép
      const bubble = bubbleRef.current;
      if (bubble && !narrow) {
        proj.set(bot.x, bot.y + 3, bot.z).project(camera);
        const bx = ((proj.x + 1) / 2) * w + 56;
        const by = ((1 - proj.y) / 2) * h;
        bubble.style.left = `${Math.min(bx, w - bubble.offsetWidth - 12)}px`;
        bubble.style.top = `${Math.min(Math.max(by - bubble.offsetHeight / 2, TOP_PX), h - bubble.offsetHeight - 12)}px`;
      }
    };
    tick();
    setReady(true);


    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        mesh.geometry?.dispose();
        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
        (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((m) => m.dispose());
      });
      skyTex.dispose();
      composer.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      libraryWall.current = null;
    };
  }, []);

  // Vòng giới thiệu: mỗi bước đặt máy quay rồi hẹn giờ sang bước sau
  useEffect(() => {
    if (!ready || leaving.current) return;
    shotRef.current(tour !== null && tour >= 0 ? tour : null);
    if (tour === null) return;
    const id = window.setTimeout(() => {
      if (tour + 1 < HUB.islands.length) setTour(tour + 1);
      else endTour('done');
    }, tour < 0 ? INTRO_MS : SHOT_MS);
    return () => window.clearTimeout(id);
  }, [tour, ready, endTour]);

  useEffect(() => {
    if (ready && summary && libraryWall.current) paintLibrary(libraryWall.current, summary.verdict);
  }, [ready, summary]);

  // Màn hẹp: mở/đóng bong bóng thì canh lại toàn cảnh để chừa chỗ
  useEffect(() => {
    if (ready && narrow && tour === null && !leaving.current) shotRef.current(null);
  }, [botOpen, ready, narrow, tour]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && tourRef.current !== null) endTour('skip');
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
      window.clearTimeout(leaveTimer.current);
    };
  }, [endTour]);

  useEffect(() => {
    if (failed) onNavigate('about');
  }, [failed, onNavigate]);

  const replay = () => {
    funnel.hubTour('replay');
    setTour(-1);
  };
  const menuGo = (tab: string) => {
    const i = HUB.islands.findIndex((s) => s.tab === tab);
    if (i >= 0) go(i, 'menu');
    else onNavigate(tab);
  };

  return (
    <div data-hub className="fixed inset-0 z-[60] select-none overflow-hidden bg-[#040914] text-white">
      <div ref={mountRef} className="absolute inset-0" />

      {/* Bảng tên từng đảo: bấm vào là vào trang */}
      <div className="pointer-events-none absolute inset-0">
        {HUB.islands.map((isle, i) => (
          <button
            key={isle.key}
            ref={(el) => {
              labelRefs.current[i] = el;
            }}
            type="button"
            data-hub-label={isle.key}
            onClick={() => tap(i, 'label')}
            onMouseEnter={() => setHoverIsle(i)}
            onMouseLeave={() => setHoverIsle(null)}
            className={`absolute left-0 top-0 rounded-lg border bg-[#040914]/85 px-2 py-1 text-center opacity-0 transition-[opacity,border-color] duration-300 hover:border-[#2BFFEA] data-[hover=true]:border-[#2BFFEA] sm:rounded-xl sm:px-3 sm:py-1.5 ${
              mode === 'new' && i === 0 ? 'border-[#2BFFEA] shadow-[0_0_18px_rgba(43,255,234,0.35)]' : 'border-[#3df2ff]/40'
            } ${mode === 'new' && (hoverIsle === i || note === i) ? 'w-56 sm:w-64' : 'whitespace-nowrap'}`}
          >
            {mode === 'new' && i === 0 && <span className="block text-[10px] font-bold uppercase tracking-wide text-[#2BFFEA]">{SA_BOT.startHere}</span>}
            <span className="block text-xs font-semibold sm:text-sm">{isle.title}</span>
            <span className="hidden text-[11px] text-gray-400 sm:block">{isle.sub}</span>
            {mode === 'new' && (hoverIsle === i || note === i) && (
              <span data-hub-note className="mt-1 block border-t border-white/10 pt-1 text-left text-[11px] leading-snug text-gray-200 sm:text-xs">{isle.note}</span>
            )}
          </button>
        ))}
      </div>

      {/* Thanh trên: logo · menu tới các trang · điểm */}
      <header className="absolute inset-x-0 top-0 flex h-16 items-center justify-between gap-3 bg-gradient-to-b from-[#040914] to-transparent px-3 sm:px-5">
        <img src="/assets/strategy-audit-logo.png" alt="Strategy Audit" className="h-8 w-auto max-w-[150px] object-contain object-left" />
        <nav data-hub-menu className="hidden items-center gap-1 md:flex">
          {HUB.menu.map((m) => (
            <button key={m.tab} type="button" onClick={() => menuGo(m.tab)} className="rounded-lg px-3 py-2 text-xs font-medium text-gray-300 hover:bg-white/5 hover:text-white">
              {m.label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button
            type="button"
            data-hub-contact
            aria-expanded={contactOpen}
            onClick={() => {
              setContactOpen((v) => !v);
              setMenuOpen(false);
            }}
            className="whitespace-nowrap rounded-lg bg-[#0068FF] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0055D0]"
          >
            {CONTACT.title}
          </button>
          {journey.points > 0 && (
            <span data-points className="rounded-lg border border-[#3df2ff]/30 bg-[#040914]/80 px-2.5 py-1.5 font-mono text-xs font-bold text-[#2BFFEA]">
              ⬡ {journey.points} {POINT_NAME}
            </span>
          )}
          <button
            type="button"
            aria-expanded={menuOpen}
            onClick={() => {
              setMenuOpen((v) => !v);
              setContactOpen(false);
            }} className="rounded-lg border border-white/20 bg-[#040914]/80 px-3 py-1.5 text-xs font-semibold md:hidden">
            {menuOpen ? 'Đóng' : 'Menu'}
          </button>
        </div>
      </header>
      {menuOpen && (
        <nav className="absolute right-3 top-14 z-10 flex w-48 flex-col rounded-xl border border-[#3df2ff]/30 bg-[#040914]/95 p-1.5 md:hidden">
          {HUB.menu.map((m) => (
            <button key={m.tab} type="button" onClick={() => menuGo(m.tab)} className="rounded-lg px-3 py-2.5 text-left text-sm text-gray-200 hover:bg-white/5">
              {m.label}
            </button>
          ))}
        </nav>
      )}

      {contactOpen && (
        <div data-hub-contact-panel className="absolute right-3 top-14 z-10 w-[min(92vw,22rem)] rounded-xl border border-[#3df2ff]/30 bg-[#040914]/95 p-4">
          <p className="text-sm text-gray-200">{CONTACT.ask}</p>
          <ContactLinks from="hub" className="mt-3" />
        </div>
      )}

      {/* SA bot: hỏi một câu, rồi dẫn đường */}
      {ready && tour === null && botOpen && !leaving.current && (
        <div
          ref={bubbleRef}
          data-sa-bot={mode}
          className={`absolute z-10 rounded-2xl border border-[#2BFFEA]/50 bg-[#040914]/92 p-4 shadow-[0_0_28px_rgba(43,255,234,0.18)] backdrop-blur-sm ${
            narrow ? 'inset-x-3 bottom-3' : 'w-[22rem]'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="font-mono text-[11px] font-semibold text-[#2BFFEA]">{SA_BOT.name}</p>
            <button type="button" onClick={() => setBotOpen(false)} className="text-gray-500 hover:text-gray-200" aria-label="Thu nhỏ SA bot">
              ×
            </button>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-gray-100">
            {mode === 'ask' ? SA_BOT.ask : mode === 'new' ? SA_BOT.noReply(touch) : SA_BOT.yesReply}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {mode === 'ask' && (
              <>
                <button type="button" data-bot-answer="yes" onClick={() => answer('yes')} className="rounded-xl border border-[#2BFFEA]/60 px-4 py-2 text-sm font-semibold text-[#2BFFEA]">
                  {SA_BOT.yes}
                </button>
                <button type="button" data-bot-answer="no" onClick={() => answer('no')} className="rounded-xl bg-[#2BFFEA] px-4 py-2 text-sm font-bold text-black">
                  {SA_BOT.no}
                </button>
              </>
            )}
            {mode === 'new' && (
              <>
                <button type="button" onClick={() => go(0, 'bot')} className="rounded-xl bg-[#2BFFEA] px-4 py-2 text-sm font-bold text-black">
                  {SA_BOT.enterFirst}
                </button>
                <button type="button" onClick={replay} className="rounded-xl border border-white/20 px-4 py-2 text-sm text-gray-200">
                  {SA_BOT.tour}
                </button>
              </>
            )}
            {mode !== 'ask' && (
              <button
                type="button"
                onClick={() => {
                  funnel.hubBot('reask');
                  setMode('ask');
                  setNote(null);
                }}
                className="px-1 py-2 text-xs text-gray-400 underline underline-offset-2 hover:text-gray-200"
              >
                {SA_BOT.reask}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Lời dẫn của vòng giới thiệu */}
      {ready && tour !== null && (
        <div data-hub-caption className="absolute inset-x-0 bottom-0 flex justify-center p-3 pb-5 sm:p-4 sm:pb-6">
          <div className="w-[min(94vw,34rem)] rounded-2xl border border-[#3df2ff]/40 bg-[#040914]/90 p-4 backdrop-blur-sm">
            <p className="font-mono text-[11px] font-semibold text-[#3df2ff]">
              {SA_BOT.name}
              {tour >= 0 && ` · ${tour + 1}/${HUB.islands.length} · ${HUB.islands[tour].title}`}
            </p>
            <p key={tour} className="mt-1 text-sm leading-relaxed text-gray-100 sm:text-base">
              {tour < 0 ? HUB.intro : HUB.islands[tour].caption}
            </p>
            <div className="mt-3 flex items-center justify-between gap-2">
              <div className="flex gap-1.5" aria-hidden>
                {HUB.islands.map((s, i) => (
                  <span key={s.key} className={`h-1.5 rounded-full transition-all ${i === tour ? 'w-5 bg-[#2BFFEA]' : i < tour ? 'w-1.5 bg-[#3df2ff]/70' : 'w-1.5 bg-white/20'}`} />
                ))}
              </div>
              <div className="flex gap-2">
                {tour >= 0 && (
                  <button type="button" onClick={() => go(tour, 'caption')} className="whitespace-nowrap rounded-lg border border-[#2BFFEA]/50 px-3 py-1.5 text-xs font-semibold text-[#2BFFEA]">
                    Vào trang này
                  </button>
                )}
                <button type="button" data-hub-skip onClick={() => endTour('skip')} className="whitespace-nowrap rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-gray-200">
                  {HUB.skip}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gợi ý dưới đáy + gọi lại SA bot khi đã thu nhỏ */}
      {ready && tour === null && !(narrow && botOpen) && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-1.5 p-4 pb-5">
          <p className="rounded-xl bg-[#040914]/80 px-4 py-2 text-center text-sm text-gray-200">{HUB.outro}</p>
          <div className="pointer-events-auto flex items-center gap-3 text-xs">
            {!botOpen && (
              <button
                type="button"
                data-bot-chip
                onClick={() => {
                  funnel.hubBot('open');
                  setBotOpen(true);
                }}
                className="rounded-lg border border-[#2BFFEA]/50 px-3 py-1 font-semibold text-[#2BFFEA]"
              >
                {SA_BOT.chip}
              </button>
            )}
            <button type="button" onClick={replay} className="text-gray-400 underline underline-offset-2 hover:text-gray-200">
              {HUB.replay}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
