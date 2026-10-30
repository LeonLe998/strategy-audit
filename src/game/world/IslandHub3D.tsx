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
import { glassMaterial, glow as glowSprite, rimMaterial, studioEnv } from './glassKit';
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

/** Mỗi đảo một màu nhấn (theo thứ tự HUB.islands): Bắt đầu · Vì sao · Sáu ô · Thư viện · Lộ trình · Thành viên */
const ACCENTS = [0x2bffea, 0x4da3ff, 0x9b8cff, 0xffc857, 0x4edea3, 0xff7eb6];
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
function makeLayout(aspect: number) {
  const wide = aspect >= 1;
  // Màn rất ngang (máy tính màn rộng): giãn khoảng cách cột để cụm đảo không dồn giữa, hai bên trống
  const sv = aspect > 1.9 ? 15.5 : aspect > 1.5 ? 13.5 : 12;
  const grid = wide
    ? [[12, -sv], [12, 0], [12, sv], [0, sv], [0, 0], [0, -sv]]
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

/** Vật liệu hướng kính (Leon chọn 29/10): mặt đảo là phiến kính xanh, đáy là pha lê tối có viền sáng */
const glassTop = () =>
  new THREE.MeshPhysicalMaterial({ color: 0x174f5e, roughness: 0.14, metalness: 0.12, clearcoat: 1, clearcoatRoughness: 0.1, flatShading: true, transparent: true, opacity: 0.88, envMapIntensity: 0.85 });
const crystal = (color = 0x123a52, opacity = 0.9) =>
  new THREE.MeshPhysicalMaterial({ color, emissive: 0x00384f, emissiveIntensity: 0.35, roughness: 0.16, metalness: 0.1, clearcoat: 1, flatShading: true, transparent: true, opacity, envMapIntensity: 1.3 });
const shard = (accent: number = COLOR.line) =>
  new THREE.MeshPhysicalMaterial({ color: 0x9fe9ff, emissive: accent, emissiveIntensity: 0.3, roughness: 0.08, clearcoat: 1, flatShading: true, transparent: true, opacity: 0.75, envMapIntensity: 1.6 });

/** Khối phát sáng (bloom làm loé) */
function lit(mats: THREE.Material[], geo: THREE.BufferGeometry, color: number, intensity = 1) {
  const m = glow(color, intensity);
  mats.push(m);
  const mesh = new THREE.Mesh(geo, m);
  mesh.castShadow = true;
  return mesh;
}

/**
 * Vật mốc kiểu kính: mỗi đảo một khối điêu khắc lớn, một hình rõ, nói đúng trang nó dẫn tới, theo màu nhấn của đảo.
 * Bắt đầu = phễu · Vì sao = quả cầu bi · Sáu ô = sáu khối · Thư viện = tủ kính tường kết quả · Lộ trình = cột thang xoắn · Thành viên = cổng vòm.
 * Quay 45° để mặt chính hướng về máy quay.
 */
function buildLandmark(id: StageId, group: THREE.Group, mats: THREE.Material[], library: { current: THREE.InstancedMesh | null }, A: number): Spin {
  group.rotation.y = Math.PI / 4;
  group.scale.setScalar(1.3);
  // Kính nhuộm màu nhấn của đảo (pha sáng) để vật mốc có màu, không nhạt như bóng ma
  const tint = new THREE.Color(A).lerp(new THREE.Color(0xffffff), 0.35).getHex();
  /** Khối kính: thân nhuộm màu + viền sáng màu nhấn */
  const shape = (geo: THREE.BufferGeometry, opacity = 0.34, amp = 1.5) => {
    const body = glassMaterial(tint, Math.min(opacity * 2.1, 0.6));
    body.emissive.setHex(A);
    body.emissiveIntensity = 0.12;
    const edge = rimMaterial(A, amp * 1.4, 2);
    mats.push(body, edge);
    const g = new THREE.Group();
    g.add(new THREE.Mesh(geo, body), new THREE.Mesh(geo, edge));
    return g;
  };
  const light = (geo: THREE.BufferGeometry, k = 1.3) => lit(mats, geo, A, k);
  const bead = (r: number, k = 1.6) => light(new THREE.SphereGeometry(r, 12, 10), k);

  // Bệ chung: đĩa kính tối thấp, vành sáng màu nhấn (tối để không lấn vật mốc)
  const plinthMat = new THREE.MeshPhysicalMaterial({ color: 0x0b2232, roughness: 0.15, metalness: 0.3, clearcoat: 1, transparent: true, opacity: 0.92, envMapIntensity: 0.8 });
  mats.push(plinthMat);
  const plinth = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.2, 0.16, 32), plinthMat);
  plinth.position.y = 0.09;
  const plinthRing = light(new THREE.TorusGeometry(1.12, 0.022, 6, 64), 1.2);
  plinthRing.rotation.x = Math.PI / 2;
  plinthRing.position.y = 0.17;
  group.add(plinth, plinthRing);

  switch (id) {
    case 'khai-niem': {
      // Phễu kính trên chân mảnh, bi sáng xoáy rơi qua cổ phễu
      const prof = [
        [1.05, 2.7],
        [0.92, 2.35],
        [0.6, 1.85],
        [0.24, 1.42],
        [0.15, 1.05],
      ].map(([r, y]) => new THREE.Vector2(r, y));
      const funnel = shape(new THREE.LatheGeometry(prof, 48), 0.18, 0.8);
      const stem = shape(new THREE.CylinderGeometry(0.07, 0.12, 0.88, 12), 0.2, 0.8);
      stem.position.y = 0.62;
      group.add(funnel, stem);
      [[1.05, 2.7], [0.6, 1.85]].forEach(([r, y]) => {
        const ring = light(new THREE.TorusGeometry(r, 0.03, 6, 48), 0.8);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = y;
        group.add(ring);
      });
      const radiusAt = (y: number) => THREE.MathUtils.clamp(0.15 + ((y - 1.05) / 1.65) * 0.9, 0.15, 1.05);
      const beads = Array.from({ length: 7 }, () => bead(0.07, 1));
      beads.forEach((b) => group.add(b));
      return (t) =>
        beads.forEach((b, k) => {
          const p = (t * 0.32 + k / beads.length) % 1;
          const y = THREE.MathUtils.lerp(3.0, 1.05, Math.pow(p, 1.4));
          const a = k * 0.9 + p * 9;
          const rr = radiusAt(y) * 0.6;
          b.position.set(Math.cos(a) * rr, y, Math.sin(a) * rr);
          b.scale.setScalar(p > 0.9 ? (1 - p) * 10 : 1);
        });
    }
    case 'vi-sao-kiem-dinh': {
      // Quả cầu kính trên chân, vòng bi bay quanh: đa số xám, vài viên sáng (như số chiến lược đạt)
      const stem = shape(new THREE.CylinderGeometry(0.1, 0.16, 0.75, 12), 0.2, 0.8);
      stem.position.y = 0.55;
      const orbGeo = new THREE.IcosahedronGeometry(0.72, 1);
      const orb = shape(orbGeo, 0.16, 1.3);
      orb.position.y = 1.65;
      const coreMat = new THREE.LineBasicMaterial({ color: A, transparent: true, opacity: 0.9 });
      mats.push(coreMat);
      const core = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.4, 0)), coreMat);
      core.position.y = 1.65;
      const ring = new THREE.Group();
      ring.position.y = 1.65;
      ring.rotation.set(0.45, 0, 0.2);
      const greyMat = flat(0x6b7684, { roughness: 0.4, metalness: 0.4 });
      mats.push(greyMat);
      const N = 26;
      for (let k = 0; k < N; k++) {
        const a = (k / N) * Math.PI * 2;
        const b = k % 9 === 0 ? bead(0.07, 2) : new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), greyMat);
        b.position.set(Math.cos(a) * 1.15, 0, Math.sin(a) * 1.15);
        ring.add(b);
      }
      group.add(stem, orb, core, ring);
      return (t) => {
        orb.rotation.set(t * 0.2, t * 0.3, 0);
        core.rotation.set(-t * 0.4, -t * 0.5, 0);
        ring.rotation.y = t * 0.5;
      };
    }
    case 'sau-o': {
      // Sáu khối kính xếp 3 × 2, lõi sáng bật lần lượt như khi trả lời từng ô
      const cores: { core: THREE.Mesh; cube: THREE.Group; m: THREE.MeshStandardMaterial }[] = [];
      for (let k = 0; k < 6; k++) {
        const x = ((k % 3) - 1) * 0.66;
        const z = (Math.floor(k / 3) - 0.5) * 0.66;
        const cube = shape(new THREE.BoxGeometry(0.52, 0.52, 0.52), 0.14, 1.1);
        cube.position.set(x, 0.48, z);
        const core = light(new THREE.BoxGeometry(0.3, 0.3, 0.3), 0.2);
        core.position.copy(cube.position);
        group.add(cube, core);
        cores.push({ core, cube, m: core.material as THREE.MeshStandardMaterial });
      }
      return (t) => {
        const on = Math.floor(t * 1.1) % 8;
        cores.forEach(({ core, cube, m }, i) => {
          const lit = i < on;
          m.emissiveIntensity = THREE.MathUtils.lerp(m.emissiveIntensity, lit ? 1.8 : 0.15, 0.12);
          const y = lit ? 0.62 : 0.48;
          cube.position.y = THREE.MathUtils.lerp(cube.position.y, y, 0.12);
          core.position.y = cube.position.y;
        });
      };
    }
    case 'thu-vien': {
      // Tủ kính: bên trong là bức tường ô màu theo kết quả thư viện thật (tô khi dữ liệu về)
      const caseBox = shape(new THREE.BoxGeometry(2.15, 1.35, 0.8), 0.12, 0.9);
      caseBox.position.y = 0.95;
      const lid = light(new THREE.BoxGeometry(2.25, 0.05, 0.9), 0.7);
      lid.position.y = 1.66;
      const sill = light(new THREE.BoxGeometry(2.25, 0.05, 0.9), 0.5);
      sill.position.y = 0.26;
      const m = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x0a2230, roughness: 0.3, transparent: true });
      mats.push(m);
      const wall = new THREE.InstancedMesh(new THREE.BoxGeometry(0.068, 0.068, 0.03), m, 300);
      wall.count = 0;
      wall.position.set(0, 0.95, 0.05);
      library.current = wall;
      group.add(caseBox, lid, sill, wall);
      return (t) => (m.emissiveIntensity = 0.8 + Math.sin(t * 1.5) * 0.2);
    }
    case 'kiem-diem': {
      // Hồ sơ nghiên cứu: chồng tấm hồ sơ kính trên giá, tấm trên cùng nâng lên và lật chậm, có dòng chữ sáng
      const sheet = () => {
        const g = shape(new THREE.BoxGeometry(1.15, 0.05, 1.5), 0.3, 1.2);
        // Các dòng chữ trên mặt hồ sơ
        [-0.45, -0.22, 0.01, 0.24, 0.47].forEach((z, k) => {
          const line = light(new THREE.BoxGeometry(k === 0 ? 0.55 : 0.85, 0.012, 0.06), k === 0 ? 1.6 : 0.8);
          line.position.set(k === 0 ? -0.15 : 0, 0.035, z);
          g.add(line);
        });
        return g;
      };
      const stack = [0, 1, 2, 3].map((k) => {
        const g = sheet();
        g.position.set((k % 2 ? 0.05 : -0.04), 0.3 + k * 0.14, k * 0.03);
        g.rotation.y = (k - 1.5) * 0.09;
        group.add(g);
        return g;
      });
      const top = sheet();
      group.add(top);
      // Kính lúp nhỏ: vòng sáng + cán
      const lens = light(new THREE.TorusGeometry(0.28, 0.035, 8, 32), 1.5);
      const handle = light(new THREE.CylinderGeometry(0.035, 0.035, 0.42, 8), 1);
      handle.position.set(0.3, -0.3, 0);
      handle.rotation.z = Math.PI / 4;
      const loupe = new THREE.Group();
      loupe.add(lens, handle);
      loupe.position.set(0.75, 1.15, 0.45);
      group.add(loupe);
      return (t) => {
        const u = (Math.sin(t * 0.7) + 1) / 2;
        top.position.set(0, 0.95 + u * 0.55, 0);
        top.rotation.set(-0.35 * u, t * 0.25, 0.1 * u);
        stack.forEach((g, k) => (g.position.y = 0.3 + k * 0.14 + Math.sin(t * 1.2 + k) * 0.01));
        loupe.rotation.set(0, Math.sin(t * 0.8) * 0.4, 0);
        loupe.position.y = 1.15 + Math.sin(t * 1.1) * 0.08;
      };
    }
    case 'chuyen-doi': {
      // Cổng vòm kính, màn sáng màu nhấn lung linh bên trong
      [-0.82, 0.82].forEach((x) => {
        const p = shape(new THREE.BoxGeometry(0.24, 1.6, 0.3), 0.2, 1.1);
        p.position.set(x, 1.0, 0);
        group.add(p);
      });
      const arch = shape(new THREE.TorusGeometry(0.82, 0.13, 10, 28, Math.PI), 0.2, 1.2);
      arch.position.y = 1.8;
      group.add(arch);
      const veilMat = glow(A, 1);
      veilMat.opacity = 0.35;
      veilMat.side = THREE.DoubleSide;
      veilMat.depthWrite = false;
      mats.push(veilMat);
      const veilRect = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.6), veilMat);
      veilRect.position.y = 1.0;
      const veilTop = new THREE.Mesh(new THREE.CircleGeometry(0.7, 28, 0, Math.PI), veilMat);
      veilTop.position.y = 1.8;
      group.add(veilRect, veilTop);
      const sparks = Array.from({ length: 5 }, () => bead(0.05, 2));
      sparks.forEach((s) => group.add(s));
      return (t) => {
        veilMat.opacity = 0.3 + Math.sin(t * 2) * 0.08;
        sparks.forEach((s, k) => {
          const p = (t * 0.25 + k / sparks.length) % 1;
          s.position.set(Math.sin(k * 2.1) * 0.5, 0.3 + p * 2, 0.05);
          s.scale.setScalar(Math.sin(Math.PI * p));
        });
      };
    }
  }
}


/** Đảo nổi low-poly: mặt cỏ, lớp đất, khối đá nhọn phía dưới, cây và tinh thể quanh mép (tránh hướng có cầu) */
function buildIsland(isle: Isle, i: number, bridgeAngles: number[], scene: THREE.Scene, pickables: THREE.Object3D[]) {
  const root = new THREE.Group();
  root.position.set(isle.c.x, isle.y, isle.c.y);
  const A = ACCENTS[i % ACCENTS.length];

  const topGeo = jitter(new THREE.CylinderGeometry(ISLAND_R, ISLAND_R - 0.2, 0.6, 12), 0.18, (y) => y > 0);
  const top = new THREE.Mesh(topGeo, glassTop());
  top.receiveShadow = true;
  // Lõi sáng nằm trong phiến kính: nhìn xuyên mặt đảo thấy ánh xanh từ bên trong
  const heart = new THREE.Mesh(new THREE.CylinderGeometry(ISLAND_R - 0.55, ISLAND_R - 0.7, 0.12, 12), glow(A, 0.45));
  heart.material.opacity = 0.3;
  const dirtGeo = jitter(new THREE.CylinderGeometry(ISLAND_R - 0.15, ISLAND_R - 0.45, 0.5, 12), 0.25, () => false);
  const dirt = new THREE.Mesh(dirtGeo, crystal(0x0d2a3b, 0.95));
  dirt.position.y = -0.52;
  const seam = new THREE.Mesh(new THREE.TorusGeometry(ISLAND_R - 0.17, 0.035, 6, 48), glow(A, 1.1));
  seam.rotation.x = Math.PI / 2;
  seam.position.y = -0.3;
  const rockGeo = jitter(new THREE.ConeGeometry(ISLAND_R - 0.4, 3.8, 10, 3), 0.5, () => false);
  const rock = new THREE.Mesh(rockGeo, crystal());
  rock.add(new THREE.Mesh(rockGeo, rimMaterial(A, 0.55, 2.2)));
  rock.rotation.x = Math.PI;
  rock.position.y = -2.7;
  const under = glowSprite(A, 7, 0.22);
  under.position.y = -3.2;
  root.add(top, heart, dirt, seam, rock, under);

  // Vệt sáng dưới đáy đá
  const vein = new THREE.Mesh(new THREE.ConeGeometry(0.08, 2.6, 4), glow(A, 1.2));
  vein.rotation.x = Math.PI;
  vein.position.set(0.6, -2.4, 0.9);
  root.add(vein);
  root.add(new THREE.LineSegments(new THREE.EdgesGeometry(topGeo, 30), new THREE.LineBasicMaterial({ color: A, transparent: true, opacity: 0.8 })));

  // Vòng phù văn lục giác quanh vật mốc, sáng lên khi đảo được chọn
  const rune = new THREE.MeshBasicMaterial({ color: A, transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false });
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
      const c = new THREE.Mesh(new THREE.OctahedronGeometry(0.18 + r() * 0.1), glow(A, 0.9));
      c.position.set(x, TOP + 0.3, z);
      c.scale.y = 1.8;
      root.add(c);
    } else {
      const h = 0.7 + r() * 0.6;
      const tree = new THREE.Mesh(new THREE.ConeGeometry(0.26, h, 5), shard(A));
      tree.position.set(x, TOP + h / 2, z);
      tree.rotation.set((r() - 0.5) * 0.3, r() * Math.PI, (r() - 0.5) * 0.3);
      tree.castShadow = true;
      root.add(tree);
    }
  }
  root.traverse((o) => (o.userData.isle = i));
  pickables.push(root);
  scene.add(root);
  return rune;
}

/** Cầu ván treo có tay vịn sáng và đèn ở bốn góc đầu cầu */
function buildBridge(b: Bridge, scene: THREE.Scene): Spin {
  const len = b.s.distanceTo(b.e);
  const n = Math.ceil(len / 0.34);
  const yaw = Math.atan2(b.e.x - b.s.x, b.e.y - b.s.y);
  const group = new THREE.Group();
  const plankGeo = new THREE.BoxGeometry(1.15, 0.08, 0.26);
  const plankMat = new THREE.MeshPhysicalMaterial({ color: 0x8fe3f0, roughness: 0.1, clearcoat: 1, flatShading: true, transparent: true, opacity: 0.6, envMapIntensity: 1.5 });
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
  const curves = railPts.map((pts) => new THREE.CatmullRomCurve3(pts));
  curves.forEach((c) => group.add(new THREE.Mesh(new THREE.TubeGeometry(c, n * 2, 0.028, 5, false), railMat)));
  // Đốm sáng chạy dọc hai tay vịn, ngược chiều nhau
  const pulses = curves.map(() => glowSprite(COLOR.accent, 0.7, 0.9));
  pulses.forEach((p) => group.add(p));
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
  const phase = (b.s.x + b.s.y) * 0.13;
  return (t) => {
    pulses.forEach((p, k) => {
      const u = (((t * 0.28 + phase) % 1) + 1) % 1;
      p.position.copy(curves[k].getPointAt(k ? 1 - u : u));
    });
  };
}

/** SA bot: robot low-poly lơ lửng trước cụm đảo, mắt và lõi là dải sáng. Mọi khối gắn userData.bot để bấm được. */
function buildBot(scene: THREE.Scene, at: THREE.Vector3): Spin {
  const g = new THREE.Group();
  g.position.copy(at);
  g.rotation.y = Math.PI / 4;
  g.scale.setScalar(1.7);
  const shell = new THREE.MeshPhysicalMaterial({ color: 0xe6f3fa, roughness: 0.25, metalness: 0.08, clearcoat: 1, clearcoatRoughness: 0.08, flatShading: true, envMapIntensity: 1.4 });
  const dark = new THREE.MeshPhysicalMaterial({ color: 0x06121c, roughness: 0.05, metalness: 0.5, clearcoat: 1, envMapIntensity: 1.8 });
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
  const halo = glowSprite(COLOR.accent, 2.4, 0.3);
  halo.position.y = 0.15;
  g.add(body, head, face, ...eyes, antenna, tip, core, ...hands, pad, halo);
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

    const { isles, bridges, bot } = makeLayout(mount.clientWidth / mount.clientHeight);
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
      // Tinh vân: vài mảng màu mờ để nền có chiều sâu, khớp màu nhấn của các đảo
      [
        [90, 140, 200, 'rgba(77,163,255,0.22)'],
        [430, 120, 190, 'rgba(155,140,255,0.18)'],
        [420, 420, 220, 'rgba(255,126,182,0.10)'],
        [110, 420, 200, 'rgba(78,222,163,0.12)'],
      ].forEach(([x, y, rad, col]) => {
        const g = ctx.createRadialGradient(+x, +y, 0, +x, +y, +rad);
        g.addColorStop(0, String(col));
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 512, 512);
      });
    }
    const skyTex = new THREE.CanvasTexture(sky);
    skyTex.colorSpace = THREE.SRGBColorSpace;
    scene.background = skyTex;
    scene.fog = new THREE.Fog(COLOR.bg, 40, 95);
    scene.environment = studioEnv(renderer);
    scene.environmentIntensity = 0.55;

    // Lưới mờ phía dưới, như mặt sàn dữ liệu
    const floor = new THREE.GridHelper(260, 130, COLOR.glow, COLOR.glow);
    (floor.material as THREE.Material).transparent = true;
    (floor.material as THREE.Material).opacity = 0.22;
    floor.position.set(center.x, -12, center.z);
    scene.add(floor);

    // Phông nền: đảo pha lê xa + cột pha lê, rải theo chiều ngang màn hình (trục phải của góc nhìn isometric = (1,0,-1))
    // để màn rộng không còn hai mảng trống. Đặt thấp và xa nên sương mù làm mờ, không tranh với 6 đảo chính.
    const far = rng(41);
    const screenRight = new THREE.Vector3(S2, 0, -S2);
    const screenDeep = new THREE.Vector3(-S2, 0, -S2);
    for (let k = 0; k < 16; k++) {
      const side = k % 2 ? 1 : -1;
      const sx = side * (15 + far() * 30);
      const sd = 6 + far() * 26;
      const pos = center.clone().addScaledVector(screenRight, sx).addScaledVector(screenDeep, sd);
      const rr = 0.6 + far() * 1.1;
      const fy = -6 - far() * 8;
      const tint = ACCENTS[Math.floor(far() * ACCENTS.length)];
      const capGeo = jitter(new THREE.CylinderGeometry(rr, rr * 0.9, 0.35, 8), 0.12, (yy) => yy > 0);
      const cap = new THREE.Mesh(capGeo, crystal(0x164a5a, 0.8));
      cap.position.set(pos.x, fy, pos.z);
      const capEdge = new THREE.LineSegments(new THREE.EdgesGeometry(capGeo, 30), new THREE.LineBasicMaterial({ color: tint, transparent: true, opacity: 0.3 }));
      capEdge.position.copy(cap.position);
      const underGeo = jitter(new THREE.ConeGeometry(rr * 0.9, rr * 2.4, 8, 2), 0.25, () => false);
      const under = new THREE.Mesh(underGeo, crystal(0x0e2636, 0.8));
      under.add(new THREE.Mesh(underGeo, rimMaterial(tint, 0.28, 2.2)));
      under.rotation.x = Math.PI;
      under.position.set(pos.x, fy - 0.2 - rr * 1.2, pos.z);
      const halo = glowSprite(tint, rr * 3, 0.07);
      halo.position.set(pos.x, fy - rr, pos.z);
      scene.add(cap, capEdge, under, halo);
      // Vài mảnh pha lê nhỏ trên mặt đảo xa
      for (let q = 0; q < 2; q++) {
        const h = 0.3 + far() * 0.5;
        const sh = new THREE.Mesh(new THREE.ConeGeometry(0.13, h, 5), shard(tint));
        sh.position.set(pos.x + (far() - 0.5) * rr, fy + 0.15 + h / 2, pos.z + (far() - 0.5) * rr);
        scene.add(sh);
      }
    }
    // Cột pha lê cao mọc từ dưới sương lên ở hai bên
    for (let k = 0; k < 6; k++) {
      const side = k % 2 ? 1 : -1;
      const pos = center.clone().addScaledVector(screenRight, side * (26 + far() * 20)).addScaledVector(screenDeep, 18 + far() * 14);
      const h = 6 + far() * 6;
      const tint = ACCENTS[Math.floor(far() * ACCENTS.length)];
      const geo = new THREE.ConeGeometry(0.35 + far() * 0.35, h, 6);
      const spire = new THREE.Mesh(geo, crystal(0x123a52, 0.6));
      spire.add(new THREE.Mesh(geo, rimMaterial(tint, 0.3, 2)));
      spire.position.set(pos.x, -13 + h / 2, pos.z);
      spire.rotation.set(0, far() * Math.PI, 0);
      scene.add(spire);
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
      const m = new THREE.Mesh(jitter(new THREE.DodecahedronGeometry(0.3 + dr() * 0.5, 0), 0.15, () => false), crystal());
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
      spins.push(buildLandmark(HUB.islands[i].landmark, group, [], libraryWall, ACCENTS[i % ACCENTS.length]));
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
    bridges.forEach((b) => spins.push(buildBridge(b, scene)));
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
    const bloom = new UnrealBloomPass(new THREE.Vector2(mount.clientWidth / 2, mount.clientHeight / 2), 0.5, 0.5, 0.86);
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
            className={`sa-glass-dark absolute left-0 top-0 rounded-lg border px-2 py-1 text-center opacity-0 transition-[opacity,border-color] duration-300 hover:border-[#2BFFEA] data-[hover=true]:border-[#2BFFEA] sm:rounded-xl sm:px-3 sm:py-1.5 ${
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
      <header className="absolute inset-x-0 top-0 flex h-16 items-center justify-between gap-3 bg-gradient-to-b from-[#040914]/95 via-[#040914]/60 to-transparent px-3 sm:px-5">
        <img src="/assets/strategy-audit-logo.png" alt="Strategy Audit" className="h-8 w-auto max-w-[150px] object-contain object-left" />
        <nav data-hub-menu className="hidden items-center gap-1 lg:flex">
          {HUB.menu.map((m) => (
            <button key={m.tab} type="button" onClick={() => menuGo(m.tab)} className="rounded-lg border border-transparent px-3 py-2 text-xs font-medium text-gray-300 transition-[background,border-color,box-shadow] hover:border-[#9ff6ff]/30 hover:bg-[linear-gradient(160deg,rgba(43,255,234,0.12),rgba(255,255,255,0.03))] hover:text-white hover:shadow-[0_0_14px_rgba(43,255,234,0.15)]">
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
            className="whitespace-nowrap rounded-lg bg-[linear-gradient(180deg,#3b8bff,#0068FF_60%,#0050c8)] px-3 py-1.5 text-xs font-semibold text-white shadow-[0_0_18px_rgba(0,104,255,0.35),inset_0_1px_0_rgba(255,255,255,0.45)]"
          >
            {CONTACT.title}
          </button>
          {journey.points > 0 && (
            <span data-points className="sa-glass-dark rounded-lg px-2.5 py-1.5 font-mono text-xs font-bold text-[#2BFFEA]">
              ⬡ {journey.points} {POINT_NAME}
            </span>
          )}
          <button
            type="button"
            aria-expanded={menuOpen}
            onClick={() => {
              setMenuOpen((v) => !v);
              setContactOpen(false);
            }} className="sa-glass-dark rounded-lg px-3 py-1.5 text-xs font-semibold lg:hidden">
            {menuOpen ? 'Đóng' : 'Menu'}
          </button>
        </div>
      </header>
      {menuOpen && (
        <nav className="sa-glass-dark absolute right-3 top-14 z-10 flex w-52 flex-col rounded-xl p-1.5 lg:hidden">
          {HUB.menu.map((m) => (
            <button key={m.tab} type="button" onClick={() => menuGo(m.tab)} className="rounded-lg px-3 py-2.5 text-left text-sm text-gray-200 hover:bg-white/5">
              {m.label}
            </button>
          ))}
        </nav>
      )}

      {contactOpen && (
        <div data-hub-contact-panel className="sa-glass-dark absolute right-3 top-14 z-10 w-[min(92vw,22rem)] rounded-xl p-4">
          <p className="text-sm text-gray-200">{CONTACT.ask}</p>
          <ContactLinks from="hub" className="mt-3" />
        </div>
      )}

      {/* SA bot: hỏi một câu, rồi dẫn đường */}
      {ready && tour === null && botOpen && !leaving.current && (
        <div
          ref={bubbleRef}
          data-sa-bot={mode}
          className={`sa-glass-dark sa-glass-dark-lit absolute z-10 rounded-2xl p-4 ${
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
                <button type="button" data-bot-answer="yes" onClick={() => answer('yes')} className="sa-glass-ghost rounded-xl px-4 py-2 text-sm font-semibold text-[#2BFFEA]">
                  {SA_BOT.yes}
                </button>
                <button type="button" data-bot-answer="no" onClick={() => answer('no')} className="sa-glass-btn rounded-xl px-4 py-2 text-sm font-bold">
                  {SA_BOT.no}
                </button>
              </>
            )}
            {mode === 'new' && (
              <>
                <button type="button" onClick={() => go(0, 'bot')} className="sa-glass-btn rounded-xl px-4 py-2 text-sm font-bold">
                  {SA_BOT.enterFirst}
                </button>
                <button type="button" onClick={replay} className="sa-glass-ghost rounded-xl px-4 py-2 text-sm text-gray-200">
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
          <div className="sa-glass-dark sa-glass-dark-lit w-[min(94vw,34rem)] rounded-2xl p-4">
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
                  <button type="button" onClick={() => go(tour, 'caption')} className="sa-glass-ghost whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold text-[#2BFFEA]">
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
          <p className="sa-glass-dark rounded-xl px-4 py-2 text-center text-sm text-gray-200">{HUB.outro}</p>
          <div className="pointer-events-auto flex items-center gap-3 text-xs">
            {!botOpen && (
              <button
                type="button"
                data-bot-chip
                onClick={() => {
                  funnel.hubBot('open');
                  setBotOpen(true);
                }}
                className="sa-glass-dark sa-glass-dark-lit rounded-lg px-3 py-1 font-semibold text-[#2BFFEA]"
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
