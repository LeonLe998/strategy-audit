/**
 * Sảnh bản đồ ở trang chủ: 6 đảo nổi nối bằng cầu, mỗi đảo là cửa vào một trang thật.
 * Lần đầu vào: máy quay lướt qua từng đảo kèm một câu (bỏ qua được), rồi dừng ở toàn cảnh.
 * Bấm vào đảo, bảng tên hoặc menu thì máy quay sà xuống đảo rồi chuyển trang.
 * Thiết kế theo phong cách Futuristic & Fantasy (Astral Sanctum / Hextech Crystal Citadel):
 * Pha lê tinh vân phát sáng, viền vàng ánh sao (Starlight Gold), đá phù văn lơ lửng và vòng thiên cầu.
 * Không nến, không mũi tên tăng, không vàng thỏi, không đồng xu.
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { glassMaterial, glow as glowSprite, rimMaterial, studioEnv } from './glassKit';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { useLibrarySummary } from '../useLibraryCards';
import { type StageId } from '../journeyConfig';
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

/** Mỗi đảo một màu nhấn (theo thứ tự HUB.islands): Bắt đầu · Vì sao · Sáu ô · Thư viện · Hồ sơ nghiên cứu · Thành viên */
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
function makeLayout(aspect: number, w = 1280) {
  const wide = aspect >= 1.05 && w >= 680;
  // Màn rất ngang (máy tính màn rộng): giãn khoảng cách cột để cụm đảo không dồn giữa, hai bên trống
  const sv = aspect > 1.9 && w >= 1280 ? 15.8 : aspect > 1.5 && w >= 960 ? 13.8 : 12.2;
  // Mở rộng khoảng cách giữa hàng đảo trên và hàng đảo dưới để dành quảng trường trung tâm cho biểu tượng Strategy Audit
  const grid = wide
    ? [[15.2, -sv], [15.2, 0], [15.2, sv], [0, sv], [0, 0], [0, -sv]]
    : [[25.5, -6.4], [25.5, 6.4], [13.5, 6.4], [13.5, -6.4], [0, -6.4], [0, 6.4]];
  const lift = [0.65, 1.35, 0.25, 1.45, 0.55, 1.75];
  const isles: Isle[] = grid.map(([u, v], i) => ({ c: new THREE.Vector2((-u + v) * S2, (-u - v) * S2), y: lift[i] }));
  const bridges: Bridge[] = isles.slice(1).map((b, i) => {
    const a = isles[i];
    const d = b.c.clone().sub(a.c).normalize();
    return { s: a.c.clone().addScaledVector(d, ISLAND_R - 0.35), e: b.c.clone().addScaledVector(d, -(ISLAND_R - 0.35)), ys: a.y + TOP, ye: b.y + TOP };
  });
  const [bu, bv] = wide ? [-8.5, 0] : [-7.5, 0];
  const bot = new THREE.Vector3((-bu + bv) * S2, 0.9, (-bu - bv) * S2);
  // Tọa độ Đài Trung Tâm Strategy Audit nằm chính giữa khoảng trống của cụm đảo (không đè lên cầu nối ở cả màn ngang lẫn màn dọc)
  const [cu, cv] = wide ? [8.5, 0] : [6.75, 0];
  const hubCore = new THREE.Vector3((-cu + cv) * S2, 1.05, (-cu - cv) * S2);
  return { isles, bridges, bot, hubCore, wide, sv };
}

/** Dao động bay lơ lửng cực kỳ êm dịu (gentle anti-gravity breathing), không lắc nghiêng để mắt luôn thư giãn */
const isleBob = (i: number, t: number) => Math.sin(t * 0.72 + i * 1.15) * 0.08;
const isleTiltZ = (_i: number, _t: number) => 0;
const isleTiltX = (_i: number, _t: number) => 0;
const centerBob = (t: number) => Math.sin(t * 0.65) * 0.06;

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
const glow = (color: number, intensity = 0.6) =>
  new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: intensity, roughness: 0.3, transparent: true });

type Spin = (t: number) => void;

/** Vật liệu Pha lê & Satin Sapphire dịu mắt (đồng bộ tông thực tế của SA Bot, không gây loá trắng) */
const glassTop = (accent: number = COLOR.line) =>
  new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0x12384f).lerp(new THREE.Color(accent), 0.14).getHex(),
    emissive: new THREE.Color(0x061a28).lerp(new THREE.Color(accent), 0.15).getHex(),
    emissiveIntensity: 0.14,
    roughness: 0.24,
    metalness: 0.26,
    clearcoat: 0.85,
    clearcoatRoughness: 0.12,
    transparent: true,
    opacity: 0.94,
    envMapIntensity: 1.05,
  });
const crystal = (color = 0x143c54, opacity = 0.92, emissive = 0x072233) =>
  new THREE.MeshPhysicalMaterial({
    color,
    emissive,
    emissiveIntensity: 0.18,
    roughness: 0.2,
    metalness: 0.18,
    clearcoat: 0.9,
    flatShading: true,
    transparent: true,
    opacity,
    envMapIntensity: 1.1,
  });
const shard = (accent: number = COLOR.line) =>
  new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0x246280).lerp(new THREE.Color(accent), 0.45).getHex(),
    emissive: new THREE.Color(0x0c3042).lerp(new THREE.Color(accent), 0.35).getHex(),
    emissiveIntensity: 0.24,
    roughness: 0.16,
    metalness: 0.15,
    clearcoat: 1,
    flatShading: true,
    transparent: true,
    opacity: 0.86,
    envMapIntensity: 1.15,
  });

/** Khối phát sáng (bloom làm loé vừa phải) */
function lit(mats: THREE.Material[], geo: THREE.BufferGeometry, color: number, intensity = 0.6) {
  const m = glow(color, intensity);
  mats.push(m);
  const mesh = new THREE.Mesh(geo, m);
  mesh.castShadow = true;
  return mesh;
}

/**
 * Vật mốc theo phong cách FUTURISTIC & FANTASY (Astral Sanctum / Hextech Crystal Citadel):
 * Đồng bộ hoàn toàn bảng vật liệu thực tế, dịu mắt của SA Bot:
 * Satin Sapphire trầm ấm (`aetherStone`), Vàng Ánh Sao (`starlightGold`) và Pha Lê Bán Trong Suốt (`astralCrystal`).
 */
function buildLandmark(id: StageId, group: THREE.Group, mats: THREE.Material[], library: { current: THREE.InstancedMesh | null }, A: number): Spin {
  group.rotation.y = Math.PI / 4;
  group.scale.setScalar(1.22);
  const tint = new THREE.Color(A).lerp(new THREE.Color(0xffffff), 0.22).getHex();
  const goldHex = new THREE.Color(0xd4b675).lerp(new THREE.Color(A), 0.18).getHex();

  // Satin Sapphire pha màu đảo (cùng công thức vỏ satinSapphire của SA Bot: có chiều sâu, bóng đổ thật, không chói)
  const aetherStone = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0x1e5270).lerp(new THREE.Color(A), 0.26).getHex(),
    emissive: new THREE.Color(0x0b2a3d).lerp(new THREE.Color(A), 0.22).getHex(),
    emissiveIntensity: 0.2,
    roughness: 0.28,
    metalness: 0.28,
    clearcoat: 0.85,
    clearcoatRoughness: 0.15,
    envMapIntensity: 1.1,
  });

  // Vàng Ánh Sao dịu (Champagne Starlight Gold — cùng công thức botGold của SA Bot)
  const starlightGold = new THREE.MeshPhysicalMaterial({
    color: goldHex,
    emissive: new THREE.Color(0x5c471c).lerp(new THREE.Color(A), 0.15).getHex(),
    emissiveIntensity: 0.22,
    roughness: 0.25,
    metalness: 0.38,
    clearcoat: 0.8,
    envMapIntensity: 1.2,
  });

  // Pha lê Tinh Vân Đa Diện (cùng công thức wingCrystal của SA Bot: trong trẻo, sắc cạnh, không loá trắng)
  const astralCrystal = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0x286e8c).lerp(new THREE.Color(A), 0.48).getHex(),
    emissive: new THREE.Color(0x0f3b4f).lerp(new THREE.Color(A), 0.38).getHex(),
    emissiveIntensity: 0.24,
    roughness: 0.16,
    metalness: 0.15,
    clearcoat: 1,
    flatShading: true,
    transparent: true,
    opacity: 0.86,
    envMapIntensity: 1.15,
  });
  mats.push(aetherStone, starlightGold, astralCrystal);

  /** Khối Pha Lê Quang Học trong suốt vừa mắt, giữ chi tiết bên trong luôn sắc nét */
  const holoCrystal = (geo: THREE.BufferGeometry, opacity = 0.42, amp = 0.95) => {
    const body = glassMaterial(new THREE.Color(0x1e5270).lerp(new THREE.Color(A), 0.5).getHex(), Math.min(opacity * 0.52, 0.24));
    body.emissive.setHex(A);
    body.emissiveIntensity = 0.06;
    const edge = rimMaterial(A, amp * 0.4, 2.5);
    const wire = new THREE.LineBasicMaterial({ color: tint, transparent: true, opacity: 0.42 });
    mats.push(body, edge, wire);
    const g = new THREE.Group();
    g.add(
      new THREE.Mesh(geo, body),
      new THREE.Mesh(geo, edge),
      new THREE.LineSegments(new THREE.EdgesGeometry(geo, 22), wire),
    );
    return g;
  };
  // Cường độ phát sáng ngang bằng mắt của SA Bot (0.52 - 0.68), rõ nét mà không bị cháy sáng
  const light = (geo: THREE.BufferGeometry, k = 1.05) => lit(mats, geo, A, k * 0.52);
  const goldLight = (geo: THREE.BufferGeometry, k = 0.95) => lit(mats, geo, goldHex, k * 0.48);
  const bead = (r: number, k = 1.25) => light(new THREE.SphereGeometry(r, 16, 12), k);

  // Đế Thánh Điện Tinh Vân (Astral Sanctum Altar): 2 tầng ngọc phát sáng + vòng phù văn vàng ánh sao
  const altarOuter = new THREE.Mesh(new THREE.CylinderGeometry(1.24, 1.38, 0.12, 8), aetherStone);
  altarOuter.position.y = 0.06;
  const altarInner = new THREE.Mesh(new THREE.CylinderGeometry(0.98, 1.1, 0.12, 8), starlightGold);
  altarInner.position.y = 0.15;
  const runeRingOuter = light(new THREE.TorusGeometry(1.18, 0.022, 8, 64), 1.05);
  runeRingOuter.rotation.x = Math.PI / 2;
  runeRingOuter.position.y = 0.13;
  const runeRingInner = goldLight(new THREE.TorusGeometry(0.92, 0.018, 8, 64), 0.95);
  runeRingInner.rotation.x = Math.PI / 2;
  runeRingInner.position.y = 0.21;
  group.add(altarOuter, altarInner, runeRingOuter, runeRingInner);

  switch (id) {
    case 'khai-niem': {
      // ĐẢO 1: THÁP TINH VÂN HỘI TỤ (Astral Convergence Vortex & Floating Crystal Pylons)
      // Phễu pha lê phát sáng được bao quanh bởi 3 Cánh Pha Lê Lơ Lửng (Arcane Wings) và Lõi Sao Đa Diện
      const prof = [
        [0.98, 2.25],
        [0.82, 1.92],
        [0.52, 1.46],
        [0.24, 1.04],
        [0.16, 0.65],
      ].map(([r, y]) => new THREE.Vector2(r, y));
      const vortex = holoCrystal(new THREE.LatheGeometry(prof, 36), 0.44, 0.95);
      group.add(vortex);

      // 3 Cánh Pha Lê Thần Thoại (Floating Astral Pylons) uốn quanh tháp phễu
      const pylons: THREE.Group[] = [];
      for (let k = 0; k < 3; k++) {
        const ang = (k * Math.PI * 2) / 3 + Math.PI / 6;
        const pGroup = new THREE.Group();
        const wingGeo = new THREE.ConeGeometry(0.16, 1.85, 4);
        const wing = new THREE.Mesh(wingGeo, astralCrystal);
        wing.position.set(Math.cos(ang) * 0.86, 1.38, Math.sin(ang) * 0.86);
        wing.rotation.z = Math.cos(ang) * 0.28;
        wing.rotation.x = -Math.sin(ang) * 0.28;

        const goldCap = new THREE.Mesh(new THREE.OctahedronGeometry(0.12, 0), starlightGold);
        goldCap.position.set(Math.cos(ang) * 1.08, 2.32, Math.sin(ang) * 1.08);
        pGroup.add(wing, goldCap);
        pylons.push(pGroup);
        group.add(pGroup);
      }

      // 3 Vòng Phù Văn Ánh Sao (Counter-Rotating Arcane Rings) quanh phễu
      const haloTop = light(new THREE.TorusGeometry(0.98, 0.026, 10, 48), 1.15);
      haloTop.rotation.x = Math.PI / 2;
      haloTop.position.y = 2.25;
      const haloMid = goldLight(new THREE.TorusGeometry(0.62, 0.024, 10, 48), 1.05);
      haloMid.rotation.x = Math.PI / 2;
      haloMid.position.y = 1.52;
      const haloLow = light(new THREE.TorusGeometry(0.34, 0.022, 10, 40), 1.15);
      haloLow.rotation.x = Math.PI / 2;
      haloLow.position.y = 0.88;

      // Tinh Thể Ngôi Sao Lơ Lửng trên đỉnh phễu + Cột Sáng Hội Tụ ở tâm
      const starCore = new THREE.Group();
      starCore.position.y = 2.28;
      const starInner = light(new THREE.OctahedronGeometry(0.24, 0), 1.25);
      const starOuter = new THREE.Mesh(new THREE.OctahedronGeometry(0.34, 0), starlightGold);
      starOuter.rotation.y = Math.PI / 4;
      starCore.add(starInner, starOuter);

      const coreBeam = light(new THREE.CylinderGeometry(0.08, 0.22, 1.85, 16), 0.95);
      coreBeam.position.y = 1.15;
      group.add(haloTop, haloMid, haloLow, starCore, coreBeam);

      // 10 hạt tinh tú xoáy trôn ốc vào tâm lọc
      const radiusAt = (y: number) => THREE.MathUtils.clamp(0.16 + ((y - 0.65) / 1.6) * 0.82, 0.16, 0.98);
      const beads = Array.from({ length: 10 }, (_, idx) =>
        idx % 2 === 0 ? bead(0.072, 1.3) : new THREE.Mesh(new THREE.OctahedronGeometry(0.075, 0), starlightGold),
      );
      beads.forEach((b) => group.add(b));
      return (t) => {
        starCore.rotation.y = t * 0.9;
        starCore.position.y = 2.28 + Math.sin(t * 2) * 0.07;
        haloMid.rotation.z = t * 0.6;
        pylons.forEach((p, idx) => {
          p.position.y = Math.sin(t * 1.8 + idx * 2.1) * 0.06;
        });
        beads.forEach((b, k) => {
          const p = (t * 0.28 + k / beads.length) % 1;
          const y = THREE.MathUtils.lerp(2.38, 0.68, Math.pow(p, 1.3));
          const a = k * 0.9 + p * 8.2;
          const rr = radiusAt(y) * 0.62;
          b.position.set(Math.cos(a) * rr, y, Math.sin(a) * rr);
          b.scale.setScalar(p > 0.88 ? (1 - p) * 8 : 1);
        });
      };
    }
    case 'vi-sao-kiem-dinh': {
      // ĐẢO 2: THIÊN CẦU NGHI TINH TÚ (Celestial Armillary Astrolabe & Star Core)
      // Đỡ bởi Đôi Cánh Cung Bán Nguyệt Vàng Ánh Sao & Pha Lê Xanh, bên trong là 3 vòng Thiên Cầu xoay đa trục
      const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.52, 0.42, 8), aetherStone);
      pedestal.position.y = 0.36;

      // Vòng Cung Bán Nguyệt Đôi (Twin Crescent Cradle) bằng Vàng Ánh Sao rực rỡ
      const cradle1 = new THREE.Mesh(new THREE.TorusGeometry(1.04, 0.055, 12, 48, Math.PI * 1.15), starlightGold);
      cradle1.rotation.z = Math.PI * 0.92;
      cradle1.position.y = 1.48;
      const cradle2 = new THREE.Mesh(new THREE.TorusGeometry(0.96, 0.032, 10, 48, Math.PI * 1.05), astralCrystal);
      cradle2.rotation.z = Math.PI * 0.97;
      cradle2.rotation.y = Math.PI / 2;
      cradle2.position.y = 1.48;
      group.add(pedestal, cradle1, cradle2);

      // 3 Vòng Thiên Cầu Nghi (Armillary Rings) gắn ngọc tinh tú
      const ringOuter = new THREE.Group();
      ringOuter.position.y = 1.48;
      ringOuter.add(
        new THREE.Mesh(new THREE.TorusGeometry(0.86, 0.038, 10, 56), starlightGold),
        light(new THREE.TorusGeometry(0.86, 0.016, 8, 56), 1.15),
      );
      for (let k = 0; k < 4; k++) {
        const a = (k * Math.PI) / 2;
        const gem = bead(0.065, 1.35);
        gem.position.set(Math.cos(a) * 0.86, Math.sin(a) * 0.86, 0);
        ringOuter.add(gem);
      }

      const ringMid = new THREE.Group();
      ringMid.position.y = 1.48;
      ringMid.add(
        new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.032, 10, 48), astralCrystal),
        goldLight(new THREE.TorusGeometry(0.68, 0.015, 8, 48), 1.1),
      );

      // Lõi Tinh Thể Mặt Trời Đa Diện ở tâm Thiên Cầu
      const coreGroup = new THREE.Group();
      coreGroup.position.y = 1.48;
      const coreShell = holoCrystal(new THREE.IcosahedronGeometry(0.44, 1), 0.48, 1.05);
      const coreStar = light(new THREE.OctahedronGeometry(0.26, 0), 1.35);
      const coreStar2 = goldLight(new THREE.OctahedronGeometry(0.24, 0), 1.2);
      coreStar2.rotation.set(Math.PI / 4, Math.PI / 4, 0);
      coreGroup.add(coreShell, coreStar, coreStar2);

      // Vành Đai Chòm Sao (Constellation Orbit) nghiêng quanh Thiên Cầu
      const orbit = new THREE.Group();
      orbit.position.y = 1.48;
      orbit.rotation.set(0.42, 0, -0.28);
      const trackRing = light(new THREE.TorusGeometry(1.18, 0.014, 8, 64), 0.95);
      trackRing.rotation.x = Math.PI / 2;
      orbit.add(trackRing);
      const N = 18;
      for (let k = 0; k < N; k++) {
        const a = (k / N) * Math.PI * 2;
        const star =
          k % 6 === 0
            ? bead(0.075, 1.45)
            : new THREE.Mesh(new THREE.OctahedronGeometry(0.052, 0), k % 2 === 0 ? starlightGold : astralCrystal);
        star.position.set(Math.cos(a) * 1.18, 0, Math.sin(a) * 1.18);
        orbit.add(star);
      }

      group.add(ringOuter, ringMid, coreGroup, orbit);
      return (t) => {
        ringOuter.rotation.set(Math.sin(t * 0.5) * 0.4, t * 0.5, 0);
        ringMid.rotation.set(t * 0.7, -t * 0.4, Math.cos(t * 0.45) * 0.45);
        coreGroup.rotation.set(-t * 0.35, t * 0.6, 0);
        orbit.rotation.y = t * 0.42;
      };
    }
    case 'sau-o': {
      // ĐẢO 3: TRẬN ĐỒ 6 VIÊN ĐÁ PHÙ VĂN LƠ LỬNG (Sanctum of Six Levitating Arcane Runestones)
      // Bỏ tấm bảng đen; 6 lăng trụ pha lê lục giác lơ lửng giữa không trung theo mặt nghiêng hướng về camera,
      // nối với đàn tế phù văn bên dưới bằng 6 cột tia sáng năng lượng
      const nexusCore = holoCrystal(new THREE.CylinderGeometry(0.85, 1.02, 0.18, 6), 0.45, 0.95);
      nexusCore.position.y = 0.28;
      group.add(nexusCore);

      const formation = new THREE.Group();
      formation.position.set(0, 1.32, 0.06);
      formation.rotation.x = -0.58; // Nghiêng diện mạo 6 viên đá phù văn hướng thẳng về người xem
      group.add(formation);

      // Vòng Ma Trận Lục Giác Vàng Ánh Sao kết nối 6 viên đá phía sau
      const hexFrame = new THREE.Mesh(new THREE.TorusGeometry(0.96, 0.028, 8, 6), starlightGold);
      hexFrame.scale.set(1.22, 0.86, 1);
      hexFrame.position.z = -0.08;
      const innerHexWire = light(new THREE.TorusGeometry(0.72, 0.016, 6, 6), 0.95);
      innerHexWire.scale.set(1.22, 0.86, 1);
      innerHexWire.position.z = -0.06;
      formation.add(hexFrame, innerHexWire);

      const stones: { stone: THREE.Group; crystalMat: THREE.MeshPhysicalMaterial; haloMat: THREE.MeshStandardMaterial; baseZ: number }[] = [];
      for (let k = 0; k < 6; k++) {
        const col = k % 3;
        const row = Math.floor(k / 3);
        const x = (col - 1) * 0.66;
        const y = (0.5 - row) * 0.62;
        const stone = new THREE.Group();
        stone.position.set(x, y, 0);

        // Thân Đá Phù Văn Lục Giác Pha Lê (Faceted Hexagonal Runestone)
        const cMat = astralCrystal.clone();
        mats.push(cMat);
        const prismGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.22, 6);
        const prism = new THREE.Mesh(prismGeo, cMat);
        prism.rotation.x = Math.PI / 2;
        prism.rotation.y = Math.PI / 6;

        // Viền Vàng Ánh Sao bọc quanh viên đá
        const goldCollar = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.024, 8, 6), starlightGold);
        goldCollar.rotation.z = Math.PI / 6;

        // Tinh thể nhân phát sáng ở giữa viên đá
        const gemCore = light(new THREE.OctahedronGeometry(0.11, 0), 1.25);
        gemCore.position.z = 0.12;

        // Vòng hào quang lục giác phía trước mỗi viên đá
        const halo = light(new THREE.TorusGeometry(0.21, 0.016, 6, 6), 0.6);
        halo.rotation.z = Math.PI / 6;
        halo.position.z = 0.14;

        stone.add(prism, goldCollar, gemCore, halo);
        formation.add(stone);
        stones.push({
          stone,
          crystalMat: cMat,
          haloMat: halo.material as THREE.MeshStandardMaterial,
          baseZ: 0,
        });
      }

      return (t) => {
        const on = Math.floor(t * 1.2) % 8;
        stones.forEach(({ stone, crystalMat, haloMat }, i) => {
          const active = i < on;
          const hoverWave = Math.sin(t * 2.2 + i * 0.9) * 0.035;
          crystalMat.emissiveIntensity = THREE.MathUtils.lerp(crystalMat.emissiveIntensity, active ? 0.56 : 0.2, 0.14);
          haloMat.emissiveIntensity = THREE.MathUtils.lerp(haloMat.emissiveIntensity, active ? 0.76 : 0.28, 0.14);
          stone.position.z = THREE.MathUtils.lerp(stone.position.z, (active ? 0.14 : 0.02) + hoverWave, 0.14);
        });
      };
    }
    case 'thu-vien': {
      // ĐẢO 4: THÁNH ĐIỆN LƯU TRỮ 300 TINH THỂ (Grand Solar-Crystal Archive Sanctum)
      // Hai Cột Obelisk Pha Lê Vàng hai bên có chóp kim tự tháp lơ lửng + Khung Tinh Thể Bầu Trời chứa 300 chiến lược
      const tips: THREE.Mesh[] = [];
      [-1.12, 1.12].forEach((x) => {
        // Thân cột Obelisk đa diện phát sáng
        const obelisk = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.2, 1.55, 6), astralCrystal);
        obelisk.position.set(x, 0.98, 0);
        const goldBase = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.18, 6), starlightGold);
        goldBase.position.set(x, 0.28, 0);
        const goldRing = light(new THREE.TorusGeometry(0.2, 0.02, 8, 24), 1.1);
        goldRing.rotation.x = Math.PI / 2;
        goldRing.position.set(x, 1.45, 0);

        // Chóp Kim Tự Tháp Ánh Sao lơ lửng trên đỉnh cột
        const tip = new THREE.Mesh(new THREE.OctahedronGeometry(0.16, 0), starlightGold);
        tip.position.set(x, 1.98, 0);
        tips.push(tip);
        group.add(obelisk, goldBase, goldRing, tip);
      });

      // Mái Vòm Vương Miện Ánh Sao (Celestial Crown Arch) bắc ngang đỉnh Thánh Điện
      const crownArch = new THREE.Mesh(new THREE.BoxGeometry(2.46, 0.14, 0.42), starlightGold);
      crownArch.position.y = 1.76;
      const crownCrest = light(new THREE.OctahedronGeometry(0.2, 0), 1.35);
      crownCrest.position.set(0, 1.98, 0);

      // Tấm Nền Sapphire Trầm làm nổi bật 300 viên tinh thể chiến lược mà không bị chói
      const tabletMat = new THREE.MeshPhysicalMaterial({
        color: 0x0e2c40,
        emissive: 0x051824,
        emissiveIntensity: 0.14,
        roughness: 0.24,
        metalness: 0.3,
        clearcoat: 0.85,
      });
      mats.push(tabletMat);
      const crystalTablet = new THREE.Mesh(new THREE.BoxGeometry(1.98, 1.38, 0.08), tabletMat);
      crystalTablet.position.set(0, 0.99, -0.06);
      const holoVault = holoCrystal(new THREE.BoxGeometry(2.04, 1.44, 0.28), 0.34, 0.9);
      holoVault.position.set(0, 0.99, 0.02);

      const m = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x16384c, roughness: 0.24, metalness: 0.18 });
      mats.push(m);
      const wall = new THREE.InstancedMesh(new THREE.BoxGeometry(0.068, 0.068, 0.045), m, 300);
      wall.count = 0;
      wall.position.set(0, 0.99, 0.04);
      library.current = wall;

      // Dải Sóng Ánh Sao (Solar Light-Wave) quét dọc qua 300 tinh thể
      const scanWave = light(new THREE.BoxGeometry(2.02, 0.026, 0.32), 1.2);
      scanWave.position.set(0, 0.99, 0.04);

      group.add(crownArch, crownCrest, crystalTablet, holoVault, wall, scanWave);
      return (t) => {
        m.emissiveIntensity = 0.62 + Math.sin(t * 1.6) * 0.1;
        scanWave.position.y = 0.99 + Math.sin(t * 1.15) * 0.62;
        crownCrest.rotation.y = t * 0.8;
        tips.forEach((tip, idx) => {
          tip.rotation.y = -t * 1.1;
          tip.position.y = 1.98 + Math.sin(t * 2 + idx) * 0.06;
        });
      };
    }
    case 'kiem-diem': {
      // ĐẢO 5: ĐÀI TRI THỨC HOLOCRON & 3 CỘT PHA LÊ CỔ NGỮ (Sanctum of the Astral Holocron & Floating Codex Spires)
      // Thay 3 tấm bảng đen bằng 3 Cột Bia Pha Lê Ngọc Lục Bảo phát sáng lơ lửng hình cánh cung,
      // bao quanh Khối Tinh Thể 12 Mặt (Astral Holocron) và Đôi Vòng Quỹ Đạo Vàng Ánh Sao
      const steles: THREE.Group[] = [];
      [-0.72, 0, 0.72].forEach((x, idx) => {
        const stele = new THREE.Group();
        const baseY = 1.12 + (idx === 1 ? 0.16 : 0);
        stele.position.set(x, baseY, idx === 1 ? -0.42 : -0.18);
        stele.rotation.y = -x * 0.48;
        stele.userData.baseY = baseY;

        // Thân Bia Pha Lê Ngọc Lục Bảo (Translucent Glowing Emerald Crystal Stele)
        const crystalSlab = holoCrystal(new THREE.BoxGeometry(0.52, 1.26, 0.08), 0.48, 1.0);
        // Đỉnh và Đế Vàng Ánh Sao
        const topCrown = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.22, 4), starlightGold);
        topCrown.rotation.y = Math.PI / 4;
        topCrown.position.y = 0.74;
        const bottomCap = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.08, 0.12), starlightGold);
        bottomCap.position.y = -0.65;
        stele.add(crystalSlab, topCrown, bottomCap);

        // Các dòng Cổ Ngữ Toán Học phát sáng rực rỡ trên mặt bia pha lê
        [-0.38, -0.18, 0.02, 0.22, 0.42].forEach((y, row) => {
          const w = row === 0 ? 0.26 : row === 2 ? 0.36 : 0.32;
          const runeLine = row === 0 ? goldLight(new THREE.BoxGeometry(w, 0.028, 0.1), 1.25) : light(new THREE.BoxGeometry(w, 0.024, 0.1), 1.15);
          runeLine.position.set(0, y, 0);
          stele.add(runeLine);
        });

        steles.push(stele);
        group.add(stele);
      });

      // Đài Sen Tinh Vân chiếu sáng trung tâm
      const lotusBase = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.54, 0.24, 8), starlightGold);
      lotusBase.position.set(0, 0.3, 0.24);
      const lotusRing = light(new THREE.TorusGeometry(0.38, 0.024, 8, 40), 1.2);
      lotusRing.rotation.x = Math.PI / 2;
      lotusRing.position.set(0, 0.44, 0.24);

      // Khối Đa Diện Tri Thức (12-Faceted Astral Holocron) lơ lửng phía trước
      const holocron = new THREE.Group();
      holocron.position.set(0, 1.12, 0.24);
      const crystalShell = holoCrystal(new THREE.DodecahedronGeometry(0.38, 0), 0.52, 1.15);
      const crystalCore = light(new THREE.OctahedronGeometry(0.22, 0), 1.4);
      const goldOrbit1 = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.02, 8, 48), starlightGold);
      const goldOrbit2 = light(new THREE.TorusGeometry(0.58, 0.014, 8, 48), 1.1);
      holocron.add(crystalShell, crystalCore, goldOrbit1, goldOrbit2);

      group.add(lotusBase, lotusRing, holocron);
      return (t) => {
        holocron.position.y = 1.12 + Math.sin(t * 1.5) * 0.07;
        crystalShell.rotation.set(t * 0.4, t * 0.55, 0);
        crystalCore.rotation.set(-t * 0.65, -t * 0.45, 0);
        goldOrbit1.rotation.set(Math.PI / 3 + Math.sin(t * 0.7) * 0.25, t * 0.85, 0);
        goldOrbit2.rotation.set(-Math.PI / 4, -t * 0.65, Math.cos(t * 0.6) * 0.3);
        steles.forEach((s, idx) => {
          s.position.y = (s.userData.baseY as number) + Math.sin(t * 1.6 + idx * 1.3) * 0.05;
        });
      };
    }
    case 'chuyen-doi': {
      // ĐẢO 6: CỔNG TINH KHÔNG STARGATE & VƯƠNG MIỆN PHA LÊ (Celestial Winged Stargate & Rose-Diamond Crown)
      // Thay vòng đen bằng Vòng Cổng Vàng Ánh Sao & Pha Lê Hồng Ngọc, 2 Đôi Cánh Pha Lê Lơ Lửng hai bên
      // và Viên Kim Cương Vương Miện Đa Diện toả sáng ở tâm cổng
      const portalY = 1.32;

      // 6 Lông Vũ Pha Lê (Floating Celestial Crystal Wings - 3 mỗi bên) xoè hai bên cổng Stargate
      const wingFeathers: THREE.Mesh[] = [];
      [-1, 1].forEach((dir) => {
        [0, 1, 2].forEach((lvl) => {
          const feather = new THREE.Mesh(new THREE.OctahedronGeometry(0.16, 0), lvl === 1 ? starlightGold : astralCrystal);
          feather.scale.set(0.55, 2.2 - lvl * 0.25, 0.35);
          const x = dir * (1.18 + lvl * 0.14);
          const y = portalY + (lvl - 1) * 0.38;
          feather.position.set(x, y, 0);
          feather.rotation.z = -dir * (0.35 + lvl * 0.18);
          feather.userData.baseY = y;
          feather.userData.phase = lvl * 0.8 + (dir > 0 ? 0 : Math.PI);
          wingFeathers.push(feather);
          group.add(feather);
        });
      });

      // Vòng Cổng Stargate bằng Vàng Ánh Sao & Pha Lê Hồng Ngọc
      const outerGate = new THREE.Mesh(new THREE.TorusGeometry(0.92, 0.095, 14, 56), starlightGold);
      outerGate.position.y = portalY;
      const innerCrystalGate = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.045, 12, 56), astralCrystal);
      innerCrystalGate.position.y = portalY;
      const innerNeonRing = light(new THREE.TorusGeometry(0.72, 0.024, 10, 56), 1.3);
      innerNeonRing.position.y = portalY;

      // 8 Mũi Sao Pha Lê (Radiant Star-Chevrons) gắn quanh vành cổng Stargate
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2;
        const spike = light(new THREE.OctahedronGeometry(0.11, 0), 1.25);
        spike.scale.set(0.65, 1.35, 0.65);
        spike.position.set(Math.cos(a) * 0.96, portalY + Math.sin(a) * 0.96, 0);
        spike.rotation.z = a - Math.PI / 2;
        group.add(spike);
      }

      // Màn Sương Tinh Vân mờ ảo trong lòng cổng + Vòng Phù Văn xoay ngược chiều
      const portalVeil = new THREE.Mesh(
        new THREE.CircleGeometry(0.7, 36),
        new THREE.MeshBasicMaterial({ color: A, transparent: true, opacity: 0.07, side: THREE.DoubleSide, depthWrite: false }),
      );
      portalVeil.position.y = portalY;
      const rotorRing = goldLight(new THREE.TorusGeometry(0.56, 0.02, 8, 48), 1.05);
      rotorRing.position.y = portalY;

      // Vương Miện Kim Cương Hồng Ngọc 3D ở chính tâm cổng
      const crest = new THREE.Group();
      crest.position.y = portalY;
      const crestBody = holoCrystal(new THREE.OctahedronGeometry(0.36, 0), 0.52, 1.2);
      crestBody.scale.set(0.88, 1.3, 0.58);
      const crestCore = light(new THREE.OctahedronGeometry(0.2, 0), 1.45);
      crestCore.scale.set(0.88, 1.3, 0.58);
      const crestCrown = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.018, 8, 32), starlightGold);
      crestCrown.rotation.x = Math.PI / 2;
      crest.add(crestBody, crestCore, crestCrown);

      group.add(outerGate, innerCrystalGate, innerNeonRing, portalVeil, rotorRing, crest);
      return (t) => {
        crest.rotation.y = t * 0.7;
        crest.position.y = portalY + Math.sin(t * 1.6) * 0.05;
        rotorRing.rotation.set(Math.sin(t * 0.55) * 0.4, -t * 0.5, t * 0.35);
        wingFeathers.forEach((f) => {
          f.position.y = (f.userData.baseY as number) + Math.sin(t * 2 + (f.userData.phase as number)) * 0.055;
        });
      };
    }
  }
}

/**
 * Đảo Thành Trì Pha Lê Lơ Lửng (Floating Astral Citadel Island):
 * Đồng bộ hoàn toàn chất liệu Satin Sapphire & Vàng Ánh Sao dịu mắt của SA Bot,
 * tạo chiều sâu khối thật mà không bị rực loá.
 */
function buildIsland(isle: Isle, i: number, bridgeAngles: number[], scene: THREE.Scene, pickables: THREE.Object3D[], spins: Spin[]) {
  const root = new THREE.Group();
  root.position.set(isle.c.x, isle.y, isle.c.y);
  const A = ACCENTS[i % ACCENTS.length];
  const goldHex = new THREE.Color(0xd4b675).lerp(new THREE.Color(A), 0.18).getHex();

  // Vành Satin Sapphire (cùng chất liệu vỏ SA Bot)
  const astralRimMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0x1e5270).lerp(new THREE.Color(A), 0.24).getHex(),
    emissive: new THREE.Color(0x0b2a3d).lerp(new THREE.Color(A), 0.2).getHex(),
    emissiveIntensity: 0.18,
    roughness: 0.28,
    metalness: 0.28,
    clearcoat: 0.85,
    envMapIntensity: 1.1,
  });
  // Viền Vàng Ánh Sao dịu (cùng chất liệu botGold của SA Bot)
  const starGoldMat = new THREE.MeshPhysicalMaterial({
    color: goldHex,
    emissive: new THREE.Color(0x5c471c).lerp(new THREE.Color(A), 0.15).getHex(),
    emissiveIntensity: 0.2,
    roughness: 0.25,
    metalness: 0.38,
    clearcoat: 0.8,
    envMapIntensity: 1.2,
  });

  // Mặt sàn pha lê Sapphire trầm ấm, tôn nổi công trình phía trên
  const topGeo = new THREE.CylinderGeometry(ISLAND_R, ISLAND_R - 0.16, 0.52, 24);
  const top = new THREE.Mesh(topGeo, glassTop(A));
  top.receiveShadow = true;

  // Vành đai Vàng Ánh Sao & Satin Sapphire bọc mép đảo
  const armorRim = new THREE.Mesh(new THREE.TorusGeometry(ISLAND_R - 0.03, 0.068, 10, 48), astralRimMat);
  armorRim.rotation.x = Math.PI / 2;
  armorRim.position.y = 0.16;
  const goldTrimRim = new THREE.Mesh(new THREE.TorusGeometry(ISLAND_R + 0.01, 0.026, 8, 64), starGoldMat);
  goldTrimRim.rotation.x = Math.PI / 2;
  goldTrimRim.position.y = 0.24;

  // Lõi năng lượng dịu dưới mặt sàn kính
  const heart = new THREE.Mesh(new THREE.CylinderGeometry(ISLAND_R - 0.55, ISLAND_R - 0.75, 0.12, 24), glow(A, 0.32));
  heart.material.opacity = 0.22;

  // Tầng đế pha lê giữa mặt sàn và khối tinh thể đáy
  const midTier = new THREE.Mesh(new THREE.CylinderGeometry(ISLAND_R - 0.2, ISLAND_R - 0.55, 0.48, 16), astralRimMat);
  midTier.position.y = -0.48;
  const seam = new THREE.Mesh(new THREE.TorusGeometry(ISLAND_R - 0.12, 0.032, 8, 64), glow(A, 0.58));
  seam.rotation.x = Math.PI / 2;
  seam.position.y = -0.24;

  // Khối đại tinh thể dưới đáy đảo có gân sáng vừa mắt
  const rockGeo = jitter(new THREE.ConeGeometry(ISLAND_R - 0.42, 3.7, 12, 3), 0.35, () => false);
  const rockTint = new THREE.Color(0x133b52).lerp(new THREE.Color(A), 0.18).getHex();
  const rockEmissive = new THREE.Color(0x071e2c).lerp(new THREE.Color(A), 0.18).getHex();
  const rock = new THREE.Mesh(rockGeo, crystal(rockTint, 0.94, rockEmissive));
  rock.add(new THREE.Mesh(rockGeo, rimMaterial(A, 0.28, 2.5)));
  const rockVeins = new THREE.LineSegments(
    new THREE.EdgesGeometry(rockGeo, 26),
    new THREE.LineBasicMaterial({ color: A, transparent: true, opacity: 0.24 }),
  );
  rock.add(rockVeins);
  rock.rotation.x = Math.PI;
  rock.position.y = -2.55;
  const under = glowSprite(A, 5.8, 0.09);
  under.position.y = -3.0;
  root.add(top, armorRim, goldTrimRim, heart, midTier, seam, rock, under);

  // Giếng Thánh Điện Âm (Recessed Sanctum Well) & Bóng Đổ Tiếp Xúc (Ambient Occlusion) dưới chân vật mốc tạo chiều sâu 3D trên mặt đảo
  const wellBasin = new THREE.Mesh(
    new THREE.RingGeometry(0.95, 1.48, 32),
    new THREE.MeshBasicMaterial({ color: 0x030b14, transparent: true, opacity: 0.58, side: THREE.DoubleSide, depthWrite: false }),
  );
  wellBasin.rotation.x = -Math.PI / 2;
  wellBasin.position.y = TOP + 0.006;
  const wellCenterShadow = new THREE.Mesh(
    new THREE.CircleGeometry(1.05, 32),
    new THREE.MeshBasicMaterial({ color: 0x02070e, transparent: true, opacity: 0.65, side: THREE.DoubleSide, depthWrite: false }),
  );
  wellCenterShadow.rotation.x = -Math.PI / 2;
  wellCenterShadow.position.y = TOP + 0.005;
  const wellStepRing = new THREE.Mesh(new THREE.TorusGeometry(1.48, 0.022, 8, 48), starGoldMat);
  wellStepRing.rotation.x = Math.PI / 2;
  wellStepRing.position.y = TOP + 0.015;
  root.add(wellBasin, wellCenterShadow, wellStepRing);

  // Vòng Neo Vực Thẳm (Abyssal Anchor Ring), 3 Đá Vệ Tinh Quỹ Đạo Dưới Đáy & Dây Năng Lượng Nối Xuống Đáy Vực (Ley-Line Tether)
  const anchorRing = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.024, 8, 32), starGoldMat);
  anchorRing.rotation.x = Math.PI / 2;
  anchorRing.position.y = -4.25;
  const rootGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), glow(A, 0.52));
  rootGem.position.y = -4.45;
  const tetherHeight = Math.max(4, isle.y + 13.2 - 4.45);
  const tetherBeam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.032, 0.14, tetherHeight, 12, 1, true),
    new THREE.MeshBasicMaterial({ color: A, transparent: true, opacity: 0.13, side: THREE.DoubleSide, depthWrite: false }),
  );
  tetherBeam.position.y = -4.45 - tetherHeight / 2;
  root.add(anchorRing, rootGem, tetherBeam);

  // 3 mảnh tinh thể vệ tinh trôi lơ lửng quanh chân đá đáy đảo tạo phân lớp chiều sâu dọc
  const subOrbit = new THREE.Group();
  subOrbit.position.y = -2.8;
  const shardMat = shard(A);
  for (let q = 0; q < 3; q++) {
    const a = (q * Math.PI * 2) / 3 + i * 0.5;
    const rad = 1.65 + (q % 2) * 0.35;
    const sub = new THREE.Mesh(new THREE.OctahedronGeometry(0.16 + q * 0.03, 0), shardMat);
    sub.scale.set(0.65, 1.9, 0.65);
    sub.position.set(Math.cos(a) * rad, (q - 1) * 0.55, Math.sin(a) * rad);
    sub.rotation.z = Math.cos(a) * 0.25;
    subOrbit.add(sub);
  }
  root.add(subOrbit);

  // 2 Vòng Sóng Đệm Phản Trọng Lực (Anti-Gravity Levitation Thruster Rings) lan tỏa dưới đáy đảo khi đảo bay lơ lửng
  const levMat1 = new THREE.MeshBasicMaterial({ color: A, transparent: true, opacity: 0.32, side: THREE.DoubleSide, depthWrite: false });
  const levMat2 = new THREE.MeshBasicMaterial({ color: goldHex, transparent: true, opacity: 0.26, side: THREE.DoubleSide, depthWrite: false });
  const levRing1 = new THREE.Mesh(new THREE.RingGeometry(1.15, 1.28, 36), levMat1);
  levRing1.rotation.x = -Math.PI / 2;
  levRing1.position.y = -3.35;
  const levRing2 = new THREE.Mesh(new THREE.RingGeometry(0.75, 0.86, 36), levMat2);
  levRing2.rotation.x = -Math.PI / 2;
  levRing2.position.y = -3.85;
  root.add(levRing1, levRing2);

  // Vòng Tinh Đồ Kỹ Thuật & Phù Văn Lục Giác dịu mắt trên mặt đảo
  const outerTrack = new THREE.Mesh(
    new THREE.RingGeometry(2.56, 2.64, 48),
    new THREE.MeshBasicMaterial({ color: goldHex, transparent: true, opacity: 0.36, side: THREE.DoubleSide, depthWrite: false }),
  );
  outerTrack.rotation.x = -Math.PI / 2;
  outerTrack.position.y = TOP + 0.012;
  root.add(outerTrack);

  const rune = new THREE.MeshBasicMaterial({ color: A, transparent: true, opacity: 0.52, side: THREE.DoubleSide, depthWrite: false });
  const ring = new THREE.Mesh(new THREE.RingGeometry(1.96, 2.08, 6), rune);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = TOP + 0.018;
  root.add(ring);

  // 6 Tháp Tinh Thể Phù Văn Lơ Lửng (Levitating Astral Crystals) quanh mép đảo — đậm chất Futuristic Fantasy
  const floatingShards: THREE.Group[] = [];
  const numSpires = 6;
  for (let k = 0; k < numSpires; k++) {
    const ang = (k / numSpires) * Math.PI * 2 + Math.PI / 6;
    if (bridgeAngles.some((b) => Math.abs(Math.atan2(Math.sin(ang - b), Math.cos(ang - b))) < 0.55)) continue;
    const rad = ISLAND_R - 0.38;
    const x = Math.cos(ang) * rad;
    const z = Math.sin(ang) * rad;

    // Đế vàng ánh sao trên sàn đảo
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.06, 6), starGoldMat);
    pad.position.set(x, TOP + 0.03, z);
    root.add(pad);

    // Viên pha lê đa diện lơ lửng phía trên đế + vòng nhẫn vàng nhỏ
    const spireGroup = new THREE.Group();
    const baseY = TOP + 0.42 + (k % 2) * 0.08;
    spireGroup.position.set(x, baseY, z);
    spireGroup.userData.baseY = baseY;
    spireGroup.userData.phase = k * 1.1 + i * 0.7;

    const crystalMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.14, 0), shardMat);
    crystalMesh.scale.set(0.72, 1.85, 0.72);
    const miniRing = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.015, 6, 20), starGoldMat);
    miniRing.rotation.x = Math.PI / 2.6;
    spireGroup.add(crystalMesh, miniRing);
    floatingShards.push(spireGroup);
    root.add(spireGroup);
  }

  spins.push((t) => {
    // Hiệu ứng đảo bay lơ lửng (anti-gravity levitation) + nghiêng nhẹ tự nhiên
    const dy = isleBob(i, t);
    root.position.y = isle.y + dy;
    root.rotation.z = isleTiltZ(i, t);
    root.rotation.x = isleTiltX(i, t);

    // Sóng đệm phản trọng lực lan tỏa dưới đáy đảo
    const pulse1 = ((t * 0.65 + i * 0.3) % 1);
    levRing1.position.y = -3.1 - pulse1 * 1.25;
    levRing1.scale.setScalar(1.08 - pulse1 * 0.45);
    levMat1.opacity = (1 - pulse1) * 0.34;

    const pulse2 = ((t * 0.65 + i * 0.3 + 0.5) % 1);
    levRing2.position.y = -3.1 - pulse2 * 1.25;
    levRing2.scale.setScalar(1.08 - pulse2 * 0.45);
    levMat2.opacity = (1 - pulse2) * 0.28;

    subOrbit.rotation.y = t * 0.28 + i * 0.6;
    rootGem.rotation.y = -t * 0.65;
    floatingShards.forEach((sg) => {
      sg.position.y = (sg.userData.baseY as number) + Math.sin(t * 2.1 + (sg.userData.phase as number)) * 0.06;
      sg.rotation.y = t * 0.8 + (sg.userData.phase as number);
    });
  });

  // Khối bao vô hình nhẹ (Low-Poly Bounding Volume) bao trọn thân đảo & vật mốc để Raycast siêu tốc O(1)
  const hitCyl = new THREE.Mesh(
    new THREE.CylinderGeometry(ISLAND_R, ISLAND_R * 0.85, 5.2, 12),
    new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false }),
  );
  hitCyl.position.y = 0.8;
  hitCyl.userData.isle = i;
  root.add(hitCyl);
  pickables.push(hitCyl);
  scene.add(root);
  return rune;
}

/** Cầu Ánh Sao (Astral Light Bridge): ván pha lê xanh ngọc co giãn nhịp nhàng theo nhịp bay lơ lửng của 2 đảo đầu cầu */
function buildBridge(b: Bridge, idx: number, scene: THREE.Scene): Spin {
  const len = b.s.distanceTo(b.e);
  const n = Math.ceil(len / 0.36);
  const yaw = Math.atan2(b.e.x - b.s.x, b.e.y - b.s.y);
  const group = new THREE.Group();
  const plankGeo = new THREE.BoxGeometry(1.18, 0.07, 0.26);
  const plankMat = new THREE.MeshPhysicalMaterial({
    color: 0x1e5c78,
    emissive: 0x0d425c,
    emissiveIntensity: 0.26,
    roughness: 0.2,
    metalness: 0.22,
    clearcoat: 0.9,
    transparent: true,
    opacity: 0.88,
    envMapIntensity: 1.2,
  });
  const planks: { mesh: THREE.Mesh; baseY: number; u: number }[] = [];
  const railPts: THREE.Vector3[][] = [[], []];
  const side = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw)).multiplyScalar(0.6);
  for (let k = 0; k <= n; k++) {
    const u = k / n;
    const x = THREE.MathUtils.lerp(b.s.x, b.e.x, u);
    const z = THREE.MathUtils.lerp(b.s.y, b.e.y, u);
    const y = THREE.MathUtils.lerp(b.ys, b.ye, u) - Math.sin(Math.PI * u) * SAG - 0.05;
    const plank = new THREE.Mesh(plankGeo, plankMat);
    plank.position.set(x, y, z);
    plank.rotation.y = yaw;
    plank.receiveShadow = true;
    group.add(plank);
    planks.push({ mesh: plank, baseY: y, u });
    railPts[0].push(new THREE.Vector3(x, y + 0.42, z).add(side));
    railPts[1].push(new THREE.Vector3(x, y + 0.42, z).sub(side));
  }
  const railMat = glow(COLOR.line, 0.56);
  const curves = railPts.map((pts) => new THREE.CatmullRomCurve3(pts));
  curves.forEach((c) => group.add(new THREE.Mesh(new THREE.TubeGeometry(c, n * 2, 0.024, 6, false), railMat)));
  // Đốm sáng chạy dọc hai tay vịn, ngược chiều nhau
  const pulses = curves.map(() => glowSprite(COLOR.accent, 0.58, 0.65));
  pulses.forEach((p) => group.add(p));
  const postMat = new THREE.MeshPhysicalMaterial({
    color: 0xd4b675,
    emissive: 0x5c471c,
    emissiveIntensity: 0.22,
    roughness: 0.24,
    metalness: 0.36,
  });
  const bulbMat = glow(COLOR.accent, 0.65);
  const endPosts: { post: THREE.Mesh; bulb: THREE.Mesh; baseY: number; isEnd: boolean }[] = [];
  [railPts[0][0], railPts[1][0], railPts[0][n], railPts[1][n]].forEach((p, pk) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.065, 0.72, 6), postMat);
    post.position.set(p.x, p.y - 0.12, p.z);
    const bulb = new THREE.Mesh(new THREE.OctahedronGeometry(0.09, 0), bulbMat);
    bulb.position.set(p.x, p.y + 0.28, p.z);
    group.add(post, bulb);
    endPosts.push({ post, bulb, baseY: p.y, isEnd: pk >= 2 });
  });
  scene.add(group);
  const phase = (b.s.x + b.s.y) * 0.13;
  return (t) => {
    const bobStart = isleBob(idx, t);
    const bobEnd = isleBob(idx + 1, t);
    planks.forEach(({ mesh, baseY, u }) => {
      mesh.position.y = baseY + THREE.MathUtils.lerp(bobStart, bobEnd, u);
    });
    endPosts.forEach(({ post, bulb, baseY, isEnd }) => {
      const dy = isEnd ? bobEnd : bobStart;
      post.position.y = baseY - 0.12 + dy;
      bulb.position.y = baseY + 0.28 + dy;
    });
    pulses.forEach((p, k) => {
      const u = (((t * 0.28 + phase) % 1) + 1) % 1;
      const frac = k ? 1 - u : u;
      p.position.copy(curves[k].getPointAt(frac));
      p.position.y += THREE.MathUtils.lerp(bobStart, bobEnd, frac);
    });
  };
}

/**
 * Đài Trung Tâm STRATEGY AUDIT (Central Astral Sanctuary Nexus):
 * Đặt ngay chính giữa khoảng không của 6 đảo theo đúng ảnh mẫu của Leon:
 * Đài tròn đa tầng phát sáng nhân Vàng Ánh Sao ở tâm, cột hào quang vàng ấm hướng lên đỉnh
 * và 4 dải cầu năng lượng Cyan-Gold uốn cong kết nối trực tiếp từ Đài Trung Tâm ra 4 đảo góc.
 */
function buildCenterNexus(scene: THREE.Scene, hubCore: THREE.Vector3, isles: Isle[], wide = true): Spin {
  const g = new THREE.Group();
  g.position.copy(hubCore);
  g.rotation.y = Math.PI / 4;
  if (!wide) g.scale.setScalar(0.78);

  const satinSapphire = new THREE.MeshPhysicalMaterial({
    color: 0x1a4b66,
    emissive: 0x092536,
    emissiveIntensity: 0.24,
    roughness: 0.24,
    metalness: 0.28,
    clearcoat: 0.88,
    envMapIntensity: 1.15,
  });
  const starlightGold = new THREE.MeshPhysicalMaterial({
    color: 0xd4b675,
    emissive: 0x6b5220,
    emissiveIntensity: 0.28,
    roughness: 0.22,
    metalness: 0.38,
    clearcoat: 0.85,
    envMapIntensity: 1.2,
  });
  const nexusCrystal = new THREE.MeshPhysicalMaterial({
    color: 0x246b88,
    emissive: 0x0d384c,
    emissiveIntensity: 0.24,
    roughness: 0.16,
    metalness: 0.15,
    clearcoat: 1,
    flatShading: true,
    transparent: true,
    opacity: 0.9,
  });

  // Đế Đài Trung Tâm đa tầng (Terraced Circular Astral Platform) như ảnh mẫu
  const outerDeck = new THREE.Mesh(new THREE.CylinderGeometry(1.82, 1.62, 0.28, 24), satinSapphire);
  const midDeck = new THREE.Mesh(new THREE.CylinderGeometry(1.38, 1.48, 0.22, 24), satinSapphire);
  midDeck.position.y = 0.18;
  const goldRimOuter = new THREE.Mesh(new THREE.TorusGeometry(1.82, 0.042, 10, 64), starlightGold);
  goldRimOuter.rotation.x = Math.PI / 2;
  goldRimOuter.position.y = 0.1;
  const cyanRimMid = new THREE.Mesh(new THREE.TorusGeometry(1.42, 0.026, 8, 64), glow(COLOR.line, 0.62));
  cyanRimMid.rotation.x = Math.PI / 2;
  cyanRimMid.position.y = 0.28;
  const innerGoldRing = new THREE.Mesh(new THREE.TorusGeometry(0.96, 0.028, 8, 48), starlightGold);
  innerGoldRing.rotation.x = Math.PI / 2;
  innerGoldRing.position.y = 0.31;

  // Nhân Năng Lượng Vàng Ánh Sao (Golden Core Dome) ở chính giữa mặt đài + Cột hào quang vàng dịu
  const goldenCoreMat = glow(0xffcf5c, 0.68);
  const goldenCore = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.78, 0.14, 32), goldenCoreMat);
  goldenCore.position.y = 0.32;
  const goldenAura = glowSprite(0xffcf5c, 2.8, 0.22);
  goldenAura.position.y = 0.55;
  const goldenPillar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.52, 0.72, 4.6, 24, 1, true),
    new THREE.MeshBasicMaterial({ color: 0xffcf5c, transparent: true, opacity: 0.075, side: THREE.DoubleSide, depthWrite: false }),
  );
  goldenPillar.position.y = 2.45;

  // Khối tinh thể chóp ngược dưới đáy Đài Trung Tâm + Vòng đệm phản trọng lực
  const underCone = new THREE.Mesh(new THREE.ConeGeometry(1.35, 2.15, 12), nexusCrystal);
  underCone.rotation.x = Math.PI;
  underCone.position.y = -1.2;
  const underCyanRing = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.022, 8, 48), glow(COLOR.line, 0.52));
  underCyanRing.rotation.x = Math.PI / 2;
  underCyanRing.position.y = -0.35;
  const underGoldRing = new THREE.Mesh(new THREE.TorusGeometry(0.82, 0.024, 8, 36), starlightGold);
  underGoldRing.rotation.x = Math.PI / 2;
  underGoldRing.position.y = -1.75;

  // Trụ sáng nối từ Đài Trung Tâm xuống thẳng tâm Đại Thiên Cầu dưới đáy vực
  const coreTetherH = hubCore.y + 13.15 - 2.1;
  const coreTether = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.18, coreTetherH, 12, 1, true),
    new THREE.MeshBasicMaterial({ color: COLOR.line, transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false }),
  );
  coreTether.position.y = -2.1 - coreTetherH / 2;

  g.add(
    outerDeck,
    midDeck,
    goldRimOuter,
    cyanRimMid,
    innerGoldRing,
    goldenCore,
    goldenAura,
    goldenPillar,
    underCone,
    underCyanRing,
    underGoldRing,
    coreTether,
  );
  scene.add(g);

  // 4 Dải Cầu Năng Lượng Uốn Cong (Curved Cyan-Gold Energy Conduits) nối từ Đài Trung Tâm ra 4 đảo góc quanh khoảng trống
  const cornerIndices = wide ? [0, 2, 3, 5] : [2, 3, 4, 5];
  const arcPulses: { sprite: THREE.Sprite; curve: THREE.CatmullRomCurve3; phase: number }[] = [];
  const ribbonMat = new THREE.MeshPhysicalMaterial({
    color: 0x1d7896,
    emissive: 0x126480,
    emissiveIntensity: 0.42,
    roughness: 0.18,
    metalness: 0.2,
    transparent: true,
    opacity: 0.78,
  });
  const railGlowMat = glow(COLOR.accent, 0.62);

  cornerIndices.forEach((idx, k) => {
    const isle = isles[idx];
    if (!isle) return;
    const pStart = new THREE.Vector3(hubCore.x, hubCore.y + 0.05, hubCore.z);
    const pEnd = new THREE.Vector3(isle.c.x, isle.y + 0.05, isle.c.y);
    const dir = pEnd.clone().sub(pStart);
    const dist = dir.length();
    dir.normalize();
    const pA = pStart.clone().addScaledVector(dir, 1.75);
    const pB = pEnd.clone().addScaledVector(dir, -(ISLAND_R - 0.25));
    // Điểm uốn giữa hơi võng nhẹ và mở rộng tạo dáng cánh cung mềm mại như ảnh mẫu
    const perp = new THREE.Vector3(-dir.z, 0, dir.x).multiplyScalar((k % 2 === 0 ? 1 : -1) * dist * 0.08);
    const pMid = pA.clone().lerp(pB, 0.5).add(perp);
    pMid.y -= 0.22;

    const curve = new THREE.CatmullRomCurve3([pA, pMid, pB]);
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 32, 0.16, 8, false), ribbonMat);
    tube.scale.y = 0.28;
    const edgeWire = new THREE.Mesh(new THREE.TubeGeometry(curve, 32, 0.032, 6, false), railGlowMat);
    edgeWire.position.y = 0.05;
    scene.add(tube, edgeWire);

    const pulse = glowSprite(k % 2 === 0 ? COLOR.accent : 0xffcf5c, 0.75, 0.7);
    scene.add(pulse);
    arcPulses.push({ sprite: pulse, curve, phase: k * 0.25 });
  });

  return (t) => {
    const cy = centerBob(t);
    g.position.y = hubCore.y + cy;
    goldenCoreMat.emissiveIntensity = 0.62 + Math.sin(t * 1.8) * 0.1;
    arcPulses.forEach(({ sprite, curve, phase }) => {
      const u = (t * 0.22 + phase) % 1;
      sprite.position.copy(curve.getPointAt(u));
    });
  };
}

/**
 * Hai Cánh Phông Nền Định Lượng 3D (Isometric 3D Candlestick Charts, Cube Matrices & Diagonal Grid Flanks):
 * Thiết kế theo đúng ảnh mẫu của Leon:
 * - Bỏ các đảo chóp nhỏ phía sau.
 * - Thay bằng 4 Cụm Thanh Nến & Cột Biểu Đồ 3D (Teal/Cyan & Vàng Ánh Sao) có râu nến, chuyển động sóng nhịp nhàng.
 * - 4 Cụm Ma Trận Khối Lập Phương 3D (Isometric Cube Matrix: khối kính phát sáng + khung dây Wireframe Hologram) nhấp nhô theo pha.
 * - Mặt lưới tọa độ chéo Isometric, cụm tinh thể pha lê điểm xuyết và màn mưa ma trận dọc hai rìa.
 */
function buildQuantFlanks(scene: THREE.Scene, center: THREE.Vector3, wide: boolean, sv = 13.8): Spin {
  const flankGroup = new THREE.Group();
  scene.add(flankGroup);

  const screenRight = new THREE.Vector3(S2, 0, -S2);
  const screenUp = new THREE.Vector3(-S2, 0, -S2);
  // Đẩy hai cánh nến & khối lập phương ra ngoài bán kính của cột đảo ngoài cùng (sv + ISLAND_R) để không bao giờ đè vào đảo khi đổi kích thước màn hình
  const wingShift = wide ? Math.max(0, sv - 11.2) : -3.2;
  const place = (sx: number, su: number, y: number) =>
    center
      .clone()
      .addScaledVector(screenRight, sx + Math.sign(sx) * wingShift)
      .addScaledVector(screenUp, su)
      .setY(y);

  // Vật liệu cho các Thanh Nến 3D & Khối Ma Trận Lập Phương (đồng bộ tông dịu mắt, sắc nét)
  const cyanCandleMat = new THREE.MeshPhysicalMaterial({
    color: 0x1e8ca8,
    emissive: 0x0d5268,
    emissiveIntensity: 0.34,
    roughness: 0.2,
    metalness: 0.22,
    clearcoat: 0.9,
    transparent: true,
    opacity: 0.9,
  });
  const brightCyanMat = new THREE.MeshPhysicalMaterial({
    color: 0x2bffea,
    emissive: 0x148c82,
    emissiveIntensity: 0.46,
    roughness: 0.18,
    metalness: 0.18,
    clearcoat: 0.95,
    transparent: true,
    opacity: 0.92,
  });
  const goldCandleMat = new THREE.MeshPhysicalMaterial({
    color: 0xe6be5a,
    emissive: 0x6e5316,
    emissiveIntensity: 0.38,
    roughness: 0.22,
    metalness: 0.32,
    clearcoat: 0.88,
    transparent: true,
    opacity: 0.92,
  });
  const deepTealMat = new THREE.MeshPhysicalMaterial({
    color: 0x12465e,
    emissive: 0x072436,
    emissiveIntensity: 0.24,
    roughness: 0.25,
    metalness: 0.25,
    clearcoat: 0.85,
    transparent: true,
    opacity: 0.86,
  });
  const wickMat = new THREE.MeshBasicMaterial({ color: 0x5ce6ff, transparent: true, opacity: 0.65 });
  const goldWickMat = new THREE.MeshBasicMaterial({ color: 0xf5d06b, transparent: true, opacity: 0.7 });
  const cubeWireMat = new THREE.LineBasicMaterial({ color: 0x3df2ff, transparent: true, opacity: 0.68 });
  const cubeDimWireMat = new THREE.LineBasicMaterial({ color: 0x1f8aa8, transparent: true, opacity: 0.42 });

  const spreadX = wide ? 1 : 0.72;

  // 1. Lưới tọa độ chéo Isometric hai bên cánh (Diagonal Isometric Wing Grids)
  [-1, 1].forEach((side) => {
    const wingCenter = place(side * 22 * spreadX, 1.5, -3.6);
    const gridPts: THREE.Vector3[] = [];
    const span = 14;
    const step = 1.4;
    for (let d = -span; d <= span; d += step) {
      gridPts.push(
        wingCenter.clone().add(new THREE.Vector3(d, 0, -span)),
        wingCenter.clone().add(new THREE.Vector3(d, 0, span)),
        wingCenter.clone().add(new THREE.Vector3(-span, 0, d)),
        wingCenter.clone().add(new THREE.Vector3(span, 0, d)),
      );
    }
    const gridGeo = new THREE.BufferGeometry().setFromPoints(gridPts);
    const gridLines = new THREE.LineSegments(
      gridGeo,
      new THREE.LineBasicMaterial({ color: 0x1d6885, transparent: true, opacity: 0.26 }),
    );
    flankGroup.add(gridLines);
  });

  // 2. Dựng 4 Cụm Thanh Nến & Biểu Đồ 3D Có Motion (Isometric 3D Candlestick & Bar Clusters)
  const animatedCandles: {
    body: THREE.Mesh;
    wick: THREE.Mesh;
    baseY: number;
    baseH: number;
    phase: number;
    speed: number;
  }[] = [];

  const bodyUnitGeo = new THREE.BoxGeometry(0.56, 1, 0.56);
  const bodyEdgesGeo = new THREE.EdgesGeometry(bodyUnitGeo);
  const wickUnitGeo = new THREE.CylinderGeometry(0.028, 0.028, 1, 6);

  const createCandleCluster = (
    originSX: number,
    originSU: number,
    baseY: number,
    specs: { dx: number; du: number; h: number; style: 'cyan' | 'bright' | 'gold' | 'deep' }[],
  ) => {
    const cluster = new THREE.Group();
    cluster.position.copy(place(originSX * spreadX, originSU, baseY));
    flankGroup.add(cluster);

    specs.forEach((s, idx) => {
      const pos = new THREE.Vector3()
        .addScaledVector(screenRight, s.dx)
        .addScaledVector(screenUp, s.du);
      const mat =
        s.style === 'gold'
          ? goldCandleMat
          : s.style === 'bright'
            ? brightCyanMat
            : s.style === 'deep'
              ? deepTealMat
              : cyanCandleMat;

      const body = new THREE.Mesh(bodyUnitGeo, mat);
      body.position.set(pos.x, s.h / 2, pos.z);
      body.scale.y = s.h;
      const edge = new THREE.LineSegments(bodyEdgesGeo, s.style === 'gold' ? goldWickMat : cubeWireMat);
      body.add(edge);

      // Râu nến (Wick) xuyên dọc tâm thân nến
      const wickH = s.h + 1.15;
      const wick = new THREE.Mesh(wickUnitGeo, s.style === 'gold' ? goldWickMat : wickMat);
      wick.position.set(pos.x, s.h / 2, pos.z);
      wick.scale.y = wickH;

      cluster.add(body, wick);
      animatedCandles.push({
        body,
        wick,
        baseY: 0,
        baseH: s.h,
        phase: idx * 0.65 + (originSX > 0 ? 1.8 : 0) + (originSU > 0 ? 0.9 : 2.4),
        speed: 1.15 + (idx % 3) * 0.2,
      });
    });
  };

  // Cụm Nến 1: Cánh Trái Dưới (Lower-Left Candlestick Series — có cả nến Vàng & Cyan như ảnh mẫu)
  createCandleCluster(-19.5, -1.8, -2.6, [
    { dx: -4.2, du: 3.4, h: 2.2, style: 'gold' },
    { dx: -3.4, du: 2.7, h: 1.5, style: 'deep' },
    { dx: -2.6, du: 2.0, h: 2.8, style: 'gold' },
    { dx: -1.8, du: 1.3, h: 1.9, style: 'cyan' },
    { dx: -1.0, du: 0.6, h: 2.4, style: 'gold' },
    { dx: -0.2, du: -0.1, h: 1.6, style: 'cyan' },
    { dx: 0.6, du: -0.8, h: 2.9, style: 'bright' },
    { dx: 1.4, du: -1.5, h: 2.1, style: 'cyan' },
    { dx: 2.2, du: -2.2, h: 1.4, style: 'deep' },
    { dx: 3.0, du: -2.9, h: 2.3, style: 'bright' },
  ]);

  // Cụm Nến 2: Cánh Trái Trên (Upper-Left Background Candlestick Series)
  createCandleCluster(-21.5, 9.2, -2.2, [
    { dx: -2.4, du: -1.2, h: 1.6, style: 'deep' },
    { dx: -1.5, du: -0.4, h: 2.3, style: 'cyan' },
    { dx: -0.6, du: 0.4, h: 1.8, style: 'cyan' },
    { dx: 0.3, du: 1.2, h: 2.9, style: 'bright' },
    { dx: 1.2, du: 2.0, h: 2.2, style: 'gold' },
    { dx: 2.1, du: 2.8, h: 3.2, style: 'bright' },
  ]);

  // Cụm Nến 3: Cánh Phải Trên (Upper-Right Candlestick & Bar Series như ảnh mẫu)
  createCandleCluster(19.8, 7.6, -2.2, [
    { dx: -2.8, du: 2.6, h: 1.5, style: 'deep' },
    { dx: -2.0, du: 1.9, h: 2.2, style: 'cyan' },
    { dx: -1.2, du: 1.2, h: 1.7, style: 'deep' },
    { dx: -0.4, du: 0.5, h: 2.7, style: 'cyan' },
    { dx: 0.4, du: -0.2, h: 3.4, style: 'bright' },
    { dx: 1.2, du: -0.9, h: 2.5, style: 'cyan' },
    { dx: 2.0, du: -1.6, h: 3.8, style: 'bright' },
    { dx: 2.8, du: -2.3, h: 2.9, style: 'gold' },
    { dx: 3.6, du: -3.0, h: 4.2, style: 'bright' },
  ]);

  // Cụm Nến 4: Cánh Phải Dưới (Lower-Right Candlestick & Histogram Bars như ảnh mẫu)
  createCandleCluster(18.8, -3.6, -2.8, [
    { dx: -3.2, du: -2.2, h: 1.4, style: 'gold' },
    { dx: -2.3, du: -1.5, h: 2.1, style: 'cyan' },
    { dx: -1.4, du: -0.8, h: 1.7, style: 'gold' },
    { dx: -0.5, du: -0.1, h: 2.6, style: 'cyan' },
    { dx: 0.4, du: 0.6, h: 3.1, style: 'bright' },
    { dx: 1.3, du: 1.3, h: 2.4, style: 'cyan' },
    { dx: 2.2, du: 2.0, h: 3.5, style: 'bright' },
    { dx: 3.1, du: 2.7, h: 2.8, style: 'cyan' },
  ]);

  // 3. Dựng 4 Cụm Ma Trận Khối Lập Phương 3D (Isometric 3D Cube Matrix & Wireframe Voxel Clusters)
  const animatedCubes: { obj: THREE.Object3D; baseY: number; phase: number }[] = [];
  const cubeGeo = new THREE.BoxGeometry(0.86, 0.86, 0.86);
  const cubeEdges = new THREE.EdgesGeometry(cubeGeo);

  const createCubeMatrix = (
    originSX: number,
    originSU: number,
    baseY: number,
    voxels: { ix: number; iy: number; iz: number; kind: 'solid' | 'bright' | 'wire' }[],
  ) => {
    const matGroup = new THREE.Group();
    matGroup.position.copy(place(originSX * spreadX, originSU, baseY));
    flankGroup.add(matGroup);

    const step = 0.92;
    voxels.forEach((v, idx) => {
      const yPos = v.iy * step;
      let node: THREE.Object3D;
      if (v.kind === 'wire') {
        node = new THREE.LineSegments(cubeEdges, cubeWireMat);
      } else {
        const mesh = new THREE.Mesh(cubeGeo, v.kind === 'bright' ? brightCyanMat : cyanCandleMat);
        mesh.add(new THREE.LineSegments(cubeEdges, v.kind === 'bright' ? cubeWireMat : cubeDimWireMat));
        node = mesh;
      }
      node.position.set(v.ix * step, yPos, v.iz * step);
      matGroup.add(node);
      animatedCubes.push({
        obj: node,
        baseY: yPos,
        phase: idx * 0.45 + originSX * 0.2,
      });
    });
  };

  // Ma Trận Lập Phương 1: Cánh Trái Trên (Upper-Left Stepped Cube Matrix như ảnh mẫu)
  createCubeMatrix(-19.2, 4.8, -1.8, [
    { ix: 0, iy: 0, iz: 0, kind: 'solid' },
    { ix: 1, iy: 0, iz: 0, kind: 'solid' },
    { ix: 0, iy: 0, iz: 1, kind: 'bright' },
    { ix: 1, iy: 0, iz: 1, kind: 'wire' },
    { ix: -1, iy: 0, iz: 0, kind: 'wire' },
    { ix: 0, iy: 0, iz: -1, kind: 'solid' },
    { ix: 1, iy: 0, iz: -1, kind: 'bright' },
    { ix: 0, iy: 1, iz: 0, kind: 'bright' },
    { ix: 1, iy: 1, iz: 0, kind: 'solid' },
    { ix: 0, iy: 1, iz: 1, kind: 'solid' },
    { ix: 0, iy: 1, iz: -1, kind: 'wire' },
    { ix: 0, iy: 2, iz: 0, kind: 'solid' },
    { ix: 1, iy: 2, iz: 0, kind: 'bright' },
    { ix: 0, iy: 3, iz: 0, kind: 'wire' },
  ]);

  // Ma Trận Lập Phương 2: Cánh Trái Dưới (Lower-Left Cube Matrix Cluster)
  createCubeMatrix(-17.8, -6.4, -2.5, [
    { ix: 0, iy: 0, iz: 0, kind: 'solid' },
    { ix: 1, iy: 0, iz: 0, kind: 'bright' },
    { ix: 0, iy: 0, iz: 1, kind: 'solid' },
    { ix: 1, iy: 0, iz: 1, kind: 'solid' },
    { ix: 2, iy: 0, iz: 1, kind: 'bright' },
    { ix: 0, iy: 1, iz: 0, kind: 'solid' },
    { ix: 1, iy: 1, iz: 0, kind: 'wire' },
    { ix: 0, iy: 1, iz: 1, kind: 'bright' },
    { ix: 0, iy: 2, iz: 0, kind: 'wire' },
  ]);

  // Ma Trận Lập Phương 3: Cánh Phải Dưới (Lower-Right Wireframe & Solid Cube Matrix như ảnh mẫu)
  createCubeMatrix(19.5, -5.8, -2.4, [
    { ix: 0, iy: 0, iz: 0, kind: 'wire' },
    { ix: 1, iy: 0, iz: 0, kind: 'wire' },
    { ix: 2, iy: 0, iz: 0, kind: 'solid' },
    { ix: 0, iy: 0, iz: 1, kind: 'bright' },
    { ix: 1, iy: 0, iz: 1, kind: 'wire' },
    { ix: 2, iy: 0, iz: 1, kind: 'wire' },
    { ix: 0, iy: 1, iz: 0, kind: 'wire' },
    { ix: 1, iy: 1, iz: 0, kind: 'bright' },
    { ix: 1, iy: 1, iz: 1, kind: 'wire' },
    { ix: 2, iy: 1, iz: 0, kind: 'wire' },
    { ix: 1, iy: 2, iz: 0, kind: 'wire' },
  ]);

  // 4. Cụm Tinh Thể Pha Lê Nhỏ điểm xuyết hai bên rìa như ảnh mẫu
  [
    [-23.5, -0.5, -2.4],
    [22.8, 3.8, -2.2],
    [23.2, -1.5, -2.5],
  ].forEach(([sx, su, y]) => {
    const cGroup = new THREE.Group();
    cGroup.position.copy(place(sx * spreadX, su, y));
    for (let q = 0; q < 4; q++) {
      const h = 0.65 + (q % 3) * 0.42;
      const sh = new THREE.Mesh(new THREE.ConeGeometry(0.18, h, 5), shard(0x2bffea));
      sh.position.set((q - 1.5) * 0.32, h / 2, ((q % 2) - 0.5) * 0.28);
      sh.rotation.z = (q - 1.5) * 0.18;
      cGroup.add(sh);
    }
    flankGroup.add(cGroup);
  });

  // 5. Dải Ma Trận Dữ Liệu Dọc (Vertical Matrix Data Streams) ở rìa ngoài cùng hai bên
  const streamNodes: { mesh: THREE.Mesh; baseY: number; speed: number; phase: number }[] = [];
  const bitGeo = new THREE.BoxGeometry(0.08, 0.55, 0.08);
  const bitMat = new THREE.MeshBasicMaterial({ color: 0x3df2ff, transparent: true, opacity: 0.42 });
  [-1, 1].forEach((side) => {
    for (let s = 0; s < 8; s++) {
      const pos = place(side * (24.5 + (s % 3) * 1.4) * spreadX, (s - 3.5) * 3.2, -1 + (s % 4));
      const bit = new THREE.Mesh(bitGeo, bitMat);
      bit.position.copy(pos);
      flankGroup.add(bit);
      streamNodes.push({ mesh: bit, baseY: pos.y, speed: 1.2 + (s % 3) * 0.4, phase: s * 0.9 });
    }
  });

  return (t) => {
    // Motion mượt mà cho các Thanh Nến 3D (co giãn chiều cao nhịp nhàng như sóng dữ liệu sống)
    animatedCandles.forEach((c) => {
      const wave = 1 + Math.sin(t * c.speed + c.phase) * 0.22;
      const h = c.baseH * wave;
      c.body.scale.y = h;
      c.body.position.y = c.baseY + h / 2;
      const wickH = h + 1.15;
      c.wick.scale.y = wickH;
      c.wick.position.y = c.baseY + h / 2;
    });

    // Motion lơ lửng theo làn sóng cho Ma Trận Khối Lập Phương 3D
    animatedCubes.forEach((cb) => {
      cb.obj.position.y = cb.baseY + Math.sin(t * 1.1 + cb.phase) * 0.11;
    });

    // Dòng xung ma trận dọc hai bên rìa
    streamNodes.forEach((sn) => {
      sn.mesh.position.y = sn.baseY + Math.sin(t * sn.speed + sn.phase) * 1.1;
    });
  };
}

/**
 * SA Bot — Linh Vật Hộ Vệ Tinh Vân (Astral Guardian Companion Drone):
 * Không đứng yên một chỗ: bay lượn tuần tra theo quỹ đạo số 8, nghiêng mình khi lượn,
 * quay đầu & chiếu chùm tia Hologram quét đảo khi người dùng rê chuột vào đảo,
 * vẫy cánh chào kèm mắt cười vòng cung và xoay vòng 360° vui nhộn.
 */
function buildBot(
  scene: THREE.Scene,
  at: THREE.Vector3,
  isles: Isle[],
  hoverIsleRef: { current: number | null },
  botPosRef: { current: THREE.Vector3 },
  pickables: THREE.Object3D[],
): Spin {
  const g = new THREE.Group();
  g.position.copy(at);
  g.rotation.y = Math.PI / 4;
  g.scale.setScalar(1.32);

  // Vỏ Satin Sapphire & Lam Ngọc dịu mắt, hoàn toàn không gây loá bloom
  const satinSapphire = new THREE.MeshPhysicalMaterial({
    color: 0x1e5270,
    emissive: 0x0b2a3d,
    emissiveIntensity: 0.22,
    roughness: 0.28,
    metalness: 0.28,
    clearcoat: 0.85,
    clearcoatRoughness: 0.15,
    envMapIntensity: 1.1,
  });
  // Viền Vàng Ánh Sao dịu (Champagne Starlight Gold)
  const botGold = new THREE.MeshPhysicalMaterial({
    color: 0xd4b675,
    emissive: 0x5c471c,
    emissiveIntensity: 0.24,
    roughness: 0.25,
    metalness: 0.38,
    clearcoat: 0.8,
    envMapIntensity: 1.2,
  });
  // Mặt kính Visor Obsidian sâu để đôi mắt hiển thị sắc nét
  const visorMat = new THREE.MeshPhysicalMaterial({
    color: 0x061320,
    roughness: 0.12,
    metalness: 0.4,
    clearcoat: 1,
    envMapIntensity: 1.2,
  });
  // Cánh Pha Lê Tinh Vân bán trong suốt
  const wingCrystal = new THREE.MeshPhysicalMaterial({
    color: 0x3898b8,
    emissive: 0x165e78,
    emissiveIntensity: 0.28,
    roughness: 0.16,
    metalness: 0.15,
    clearcoat: 1,
    flatShading: true,
    transparent: true,
    opacity: 0.86,
  });

  // Thân chính hình giọt nước/hình cầu đa tầng bọc viền vàng ánh sao
  const chassis = new THREE.Mesh(new THREE.SphereGeometry(0.54, 28, 22), satinSapphire);
  chassis.position.y = 1.22;
  const goldBelt = new THREE.Mesh(new THREE.TorusGeometry(0.53, 0.032, 10, 40), botGold);
  goldBelt.rotation.x = Math.PI / 2;
  goldBelt.position.y = 1.02;
  const lowerSkirt = new THREE.Mesh(new THREE.ConeGeometry(0.44, 0.42, 8), botGold);
  lowerSkirt.rotation.x = Math.PI;
  lowerSkirt.position.y = 0.78;

  // Mặt kính Visor phía trước + Đôi mắt xanh ngọc dịu mắt (emissive vừa phải 0.68, không chói)
  const visor = new THREE.Mesh(new THREE.CylinderGeometry(0.555, 0.555, 0.28, 24, 1, false, -0.75, 1.5), visorMat);
  visor.position.y = 1.24;
  const eyeMat = glow(COLOR.accent, 0.68);
  const eyeLeft = new THREE.Mesh(new THREE.CapsuleGeometry(0.048, 0.055, 8, 12), eyeMat);
  eyeLeft.position.set(-0.15, 1.25, 0.54);
  const eyeRight = new THREE.Mesh(new THREE.CapsuleGeometry(0.048, 0.055, 8, 12), eyeMat);
  eyeRight.position.set(0.15, 1.25, 0.54);

  // Chùm Tia Quét Hologram từ Visor (Holographic Radar Scanner) khi SA Bot kiểm định / hướng về đảo
  const scanGroup = new THREE.Group();
  scanGroup.position.set(0, 1.24, 0.56);
  const scanConeMat = new THREE.MeshBasicMaterial({
    color: COLOR.accent,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const scanCone = new THREE.Mesh(new THREE.ConeGeometry(0.52, 1.55, 24, 1, true), scanConeMat);
  scanCone.rotation.x = -Math.PI / 2;
  scanCone.position.z = 0.78;
  const scanRingMat = new THREE.MeshBasicMaterial({
    color: COLOR.line,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const scanRing = new THREE.Mesh(new THREE.RingGeometry(0.28, 0.34, 24), scanRingMat);
  scanRing.position.z = 1.05;
  scanGroup.add(scanCone, scanRing);

  // Vương miện Hào Quang Ánh Sao (Astral Crown Halo) & Viên Ngọc Nhỏ trên đỉnh đầu
  const crownHalo = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.022, 8, 36), botGold);
  crownHalo.rotation.x = Math.PI / 2;
  crownHalo.position.y = 1.86;
  const tipMat = glow(COLOR.accent, 0.65);
  const starGem = new THREE.Mesh(new THREE.OctahedronGeometry(0.1, 0), tipMat);
  starGem.position.y = 2.02;

  // 4 Cánh Lông Vũ Pha Lê Lơ Lửng (Floating Crystal Wing-Feathers, 2 mỗi bên)
  const wings: THREE.Group[] = [];
  [-1, 1].forEach((dir) => {
    const wGroup = new THREE.Group();
    wGroup.position.set(dir * 0.74, 1.26, -0.05);
    const upperWing = new THREE.Mesh(new THREE.OctahedronGeometry(0.14, 0), wingCrystal);
    upperWing.scale.set(0.45, 2.1, 0.7);
    upperWing.position.set(0, 0.12, 0);
    upperWing.rotation.z = -dir * 0.42;

    const lowerWing = new THREE.Mesh(new THREE.OctahedronGeometry(0.11, 0), botGold);
    lowerWing.scale.set(0.45, 1.65, 0.6);
    lowerWing.position.set(dir * 0.08, -0.18, -0.04);
    lowerWing.rotation.z = -dir * 0.68;

    wGroup.add(upperWing, lowerWing);
    wings.push(wGroup);
  });

  // 2 Tinh Linh Vệ Tinh Nhỏ (Orbiting Astral Wisps) bay quanh hộ tống SA Bot
  const wispOrbit = new THREE.Group();
  wispOrbit.position.y = 1.25;
  for (let w = 0; w < 2; w++) {
    const a = w * Math.PI;
    const wisp = new THREE.Mesh(new THREE.OctahedronGeometry(0.065, 0), w === 0 ? botGold : wingCrystal);
    wisp.position.set(Math.cos(a) * 1.05, (w - 0.5) * 0.25, Math.sin(a) * 1.05);
    wispOrbit.add(wisp);
  }

  // Vòng phù văn êm dịu dưới đáy (không loá sáng)
  const padOuter = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.02, 8, 36), botGold);
  padOuter.rotation.x = Math.PI / 2;
  padOuter.position.y = 0.24;
  const padInner = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.015, 8, 28), glow(COLOR.line, 0.52));
  padInner.rotation.x = Math.PI / 2;
  padInner.position.y = 0.36;
  const halo = glowSprite(COLOR.line, 1.35, 0.06);
  halo.position.y = 0.2;

  g.add(
    chassis,
    goldBelt,
    lowerSkirt,
    visor,
    eyeLeft,
    eyeRight,
    scanGroup,
    crownHalo,
    starGem,
    ...wings,
    wispOrbit,
    padOuter,
    padInner,
    halo,
  );
  g.traverse((o) => {
    o.castShadow = true;
  });
  // Khối cầu bao vô hình nhẹ cho SA Bot để Raycast không cần duyệt hàng chục lưới con
  const botHit = new THREE.Mesh(
    new THREE.SphereGeometry(1.15, 8, 8),
    new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false }),
  );
  botHit.position.y = 1.15;
  botHit.userData.bot = true;
  g.add(botHit);
  pickables.push(botHit);
  scene.add(g);

  // Vector ngang màn hình isometric để SA Bot lượn tuần tra số 8 mượt mà
  const patrolRight = new THREE.Vector3(S2, 0, -S2);
  const patrolDepth = new THREE.Vector3(-S2, 0, -S2);
  const baseYaw = Math.PI / 4;
  let curYaw = baseYaw;
  let curPitch = 0;
  let curRoll = 0;

  return (t) => {
    const cycle = t % 12;
    const hovered = hoverIsleRef.current;
    const isScanning = hovered !== null || (cycle >= 3.5 && cycle < 6.5);
    const isWaving = hovered === null && cycle >= 6.5 && cycle < 9.5;
    const isSpinning = hovered === null && cycle >= 9.5 && cycle < 11.4;

    // 1. Quỹ đạo bay tuần tra hình số 8 (Figure-8 Aerial Patrol) + nhún nhảy phản trọng lực
    const patrolX = Math.sin(t * 0.68) * 1.45;
    const patrolZ = Math.sin(t * 1.36) * 0.48;
    const spinHop = isSpinning ? Math.sin(((cycle - 9.5) / 1.9) * Math.PI) * 0.42 : 0;
    const hoverY = Math.sin(t * 2.1) * 0.2 + spinHop;

    g.position
      .copy(at)
      .addScaledVector(patrolRight, patrolX)
      .addScaledVector(patrolDepth, patrolZ);
    g.position.y = at.y + hoverY;
    botPosRef.current.copy(g.position);

    // 2. Hướng nhìn & Nghiêng thân (Dynamic Yaw / Pitch / Roll)
    let targetYaw = baseYaw + Math.sin(t * 0.85) * 0.32;
    let targetPitch = Math.cos(t * 1.36) * 0.08;
    let targetRoll = -Math.cos(t * 0.68) * 0.14;

    if (hovered !== null && isles[hovered]) {
      // Khi khách rê chuột vào đảo: SA Bot lập tức quay về hướng đảo đó để chiếu tia kiểm định
      const isle = isles[hovered];
      const dx = isle.c.x - g.position.x;
      const dz = isle.c.y - g.position.z;
      targetYaw = Math.atan2(dx, dz) * 0.35 + baseYaw * 0.65;
      targetPitch = -0.14;
      targetRoll = 0;
    } else if (isWaving) {
      // Khi vẫy tay chào: hướng thẳng về phía người xem, nghiêng đầu thân thiện
      targetYaw = baseYaw + Math.sin(t * 3.2) * 0.15;
      targetPitch = -0.06;
      targetRoll = Math.sin(t * 3.2) * 0.12;
    } else if (isScanning) {
      // Quét radar tuần tra qua các đảo
      targetYaw = baseYaw + Math.sin((cycle - 3.5) * 2.1) * 0.52;
      targetPitch = -0.1;
    }

    curYaw = THREE.MathUtils.lerp(curYaw, targetYaw, 0.08);
    curPitch = THREE.MathUtils.lerp(curPitch, targetPitch, 0.08);
    curRoll = THREE.MathUtils.lerp(curRoll, targetRoll, 0.08);

    const spinAngle = isSpinning ? ((cycle - 9.5) / 1.9) * Math.PI * 2 : 0;
    g.rotation.set(curPitch, curYaw + spinAngle, curRoll);

    // 3. Cánh Pha Lê vỗ nhịp nhàng (vẫy nhanh vui vẻ khi đang chào hoặc xoay vòng)
    const wingSpeed = isWaving ? 7.5 : isSpinning ? 6.0 : 2.6;
    const wingAmp = isWaving ? 0.28 : isSpinning ? 0.22 : 0.09;
    wings.forEach((w, k) => {
      const dir = k === 0 ? -1 : 1;
      w.position.y = 1.26 + Math.sin(t * wingSpeed + k * 1.1) * (isWaving ? 0.09 : 0.05);
      w.rotation.z = dir * Math.sin(t * wingSpeed) * wingAmp;
    });

    // 4. Hiệu ứng Tia Quét Hologram từ Visor
    const targetScanOpacity = isScanning ? 0.16 : 0;
    scanConeMat.opacity = THREE.MathUtils.lerp(scanConeMat.opacity, targetScanOpacity, 0.12);
    scanRingMat.opacity = THREE.MathUtils.lerp(scanRingMat.opacity, isScanning ? 0.42 : 0, 0.12);
    if (scanConeMat.opacity > 0.01) {
      const pulse = (t * 1.6) % 1;
      scanRing.position.z = 0.35 + pulse * 1.15;
      scanRing.scale.setScalar(0.35 + pulse * 0.95);
    }

    // 5. Biểu cảm Đôi Mắt (Chớp mắt tự nhiên & Mắt cười khi vẫy chào)
    const blink = t % 3.8 < 0.12;
    if (blink) {
      eyeLeft.scale.set(1, 0.12, 1);
      eyeRight.scale.set(1, 0.12, 1);
    } else if (isWaving) {
      // Mắt híp cười thân thiện
      eyeLeft.scale.set(1.25, 0.42, 1);
      eyeRight.scale.set(1.25, 0.42, 1);
    } else {
      eyeLeft.scale.set(1, 1, 1);
      eyeRight.scale.set(1, 1, 1);
    }

    // 6. Vương miện, Tinh thể đỉnh đầu & 2 Tinh Linh vệ tinh xoay quanh
    starGem.rotation.y = t * (isScanning ? 3.2 : 1.5);
    crownHalo.rotation.z = t * (isScanning ? 1.8 : 0.7);
    wispOrbit.rotation.y = -t * 1.35;
    wispOrbit.rotation.z = Math.sin(t * 0.9) * 0.22;
    padOuter.scale.setScalar(1 + Math.sin(t * 2.5) * 0.06);
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

/** Nạp trước (prefetch) gói JS của trang đích ngay khi khách rê chuột vào đảo hoặc menu để bấm vào là mở tức thì */
const prefetchedTabs = new Set<string>();
function prefetchTab(tab: string) {
  if (prefetchedTabs.has(tab)) return;
  prefetchedTabs.add(tab);
  switch (tab) {
    case 'journey':
      void import('../../pages/StartHerePage');
      break;
    case 'about':
      void import('../../components/HomeStitch');
      break;
    case 'sauo':
      void import('../../pages/SauOStitch');
      break;
    case 'viplibrary':
      void import('../../pages/VIPLibrary');
      break;
    case 'vault':
      void import('../../components/Vault');
      break;
    case 'membership':
      void import('../../pages/MembershipPage');
      break;
  }
}

export default function IslandHub3D({ onNavigate }: { onNavigate: (tab: string) => void }) {
  // Bản đồ là cảnh đêm, luôn giữ giao diện tối: chế độ sáng đổi chữ trắng thành chữ tối nên nhãn, menu gần như mất chữ.
  // Lựa chọn sáng/tối của khách vẫn giữ nguyên, rời bản đồ là trả lại.
  useLayoutEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains('light')) return;
    root.classList.remove('light');
    root.classList.add('dark');
    return () => {
      root.classList.remove('dark');
      root.classList.add('light');
    };
  }, []);
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
  const [narrow, setNarrow] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768 || window.innerWidth < window.innerHeight * 1.05;
  });
  const [isWide, setIsWide] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth >= 768 && window.innerWidth / Math.max(window.innerHeight, 1) >= 1.05;
  });
  const narrowRef = useRef(narrow);
  narrowRef.current = narrow;
  const [mode, setMode] = useState<BotMode>(() => {
    const v = readVisit();
    return v === 'yes' ? 'free' : v === 'no' ? 'new' : 'ask';
  });
  /** Bong bóng SA bot luôn hiện sẵn thông báo chào đón và hướng dẫn khi vào bản đồ */
  const [botOpen, setBotOpen] = useState(true);
  /** Đảo đang hiện ghi chú: rê chuột (máy tính) hoặc chạm lần 1 (điện thoại) */
  const [hoverIsle, setHoverIsle] = useState<number | null>(null);
  const [note, setNote] = useState<number | null>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const bubbleSizeRef = useRef<{ w: number; h: number }>({ w: 352, h: 164 });
  const hoverIsleRef = useRef<number | null>(null);
  const botPosRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const modeRef = useRef(mode);
  const botOpenRef = useRef(botOpen);
  tourRef.current = tour;
  modeRef.current = mode;
  botOpenRef.current = botOpen;
  hoverIsleRef.current = hoverIsle;

  // Tự động cập nhật chế độ màn hẹp (narrow) và chỉ re-layout khi chuyển đổi giữa chế độ Ngang/Dọc
  useEffect(() => {
    let timer: number | undefined;
    const handleWindowResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const nextNarrow = w < 768 || w < h * 1.05;
      setNarrow((prev) => (prev === nextNarrow ? prev : nextNarrow));
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const nextWide = window.innerWidth >= 768 && window.innerWidth / Math.max(window.innerHeight, 1) >= 1.05;
        setIsWide((prev) => (prev === nextWide ? prev : nextWide));
      }, 200);
    };
    window.addEventListener('resize', handleWindowResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleWindowResize);
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (hoverIsle !== null && HUB.islands[hoverIsle]) {
      prefetchTab(HUB.islands[hoverIsle].tab);
    }
  }, [hoverIsle]);

  // Đo kích thước bong bóng SA Bot bằng ResizeObserver để không đọc offsetWidth/offsetHeight trong vòng lặp 60fps
  useEffect(() => {
    const el = bubbleRef.current;
    if (!el || narrow) return;
    const updateSize = () => {
      bubbleSizeRef.current.w = el.offsetWidth || 352;
      bubbleSizeRef.current.h = el.offsetHeight || 164;
    };
    updateSize();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, [botOpen, mode, narrow, ready]);

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
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap; // PCFSoft đã bị three bỏ (tự đổi sang PCF, kèm cảnh báo)
    // Cảnh gần như đứng yên: không vẽ lại bóng đổ mỗi khung, chỉ vài khung một lần (xem tick)
    renderer.shadowMap.autoUpdate = false;
    renderer.shadowMap.needsUpdate = true;
    renderer.setSize(mount.clientWidth, mount.clientHeight, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.touchAction = 'manipulation';
    mount.appendChild(renderer.domElement);

    const { isles, bridges, bot, hubCore, wide, sv } = makeLayout(mount.clientWidth / Math.max(mount.clientHeight, 1), mount.clientWidth);
    botPosRef.current.copy(bot);
    const center = isles.reduce((a, s) => a.add(new THREE.Vector3(s.c.x, s.y, s.c.y)), new THREE.Vector3()).divideScalar(isles.length);

    const scene = new THREE.Scene();
    // Nền trời: quầng xanh ở giữa, tối dần ra mép
    const sky = document.createElement('canvas');
    sky.width = sky.height = 512;
    const ctx = sky.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(256, 200, 20, 256, 256, 380);
      grad.addColorStop(0, '#0f3c5c');
      grad.addColorStop(0.45, '#081e33');
      grad.addColorStop(1, '#040914');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);
      // Tinh vân: vài mảng màu mờ để nền có chiều sâu, khớp màu nhấn của các đảo
      [
        [90, 140, 210, 'rgba(77,163,255,0.25)'],
        [430, 120, 200, 'rgba(155,140,255,0.22)'],
        [420, 420, 230, 'rgba(255,126,182,0.14)'],
        [110, 420, 210, 'rgba(78,222,163,0.15)'],
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
    scene.fog = new THREE.Fog(COLOR.bg, 42, 98);
    scene.environment = studioEnv(renderer);
    scene.environmentIntensity = 0.82;

    // Tầng Đáy Vực Tinh Vân (Deep Abyssal Astral Megastructure ở độ sâu y = -13.2):
    // Gồm lưới tọa độ chìm, Đại Thiên Cầu 3 vòng khổng lồ xoay chậm dưới đáy vực và 6 mạch Ley-Line nối thẳng tới 6 chân đảo
    const floor = new THREE.GridHelper(260, 130, COLOR.glow, COLOR.glow);
    (floor.material as THREE.Material).transparent = true;
    (floor.material as THREE.Material).opacity = 0.16;
    floor.position.set(center.x, -13.2, center.z);
    scene.add(floor);

    const abyssGroup = new THREE.Group();
    abyssGroup.position.set(center.x, -13.15, center.z);
    const abyssSapphire = new THREE.MeshPhysicalMaterial({
      color: 0x0e2d42,
      emissive: 0x061a28,
      emissiveIntensity: 0.22,
      roughness: 0.3,
      metalness: 0.3,
      transparent: true,
      opacity: 0.78,
    });
    const abyssGold = new THREE.MeshPhysicalMaterial({
      color: 0x9e8450,
      emissive: 0x3d3014,
      emissiveIntensity: 0.22,
      roughness: 0.28,
      metalness: 0.38,
      transparent: true,
      opacity: 0.72,
    });
    const abyssRingOuter = new THREE.Mesh(new THREE.TorusGeometry(21, 0.18, 10, 96), abyssSapphire);
    abyssRingOuter.rotation.x = Math.PI / 2;
    const abyssRingMid = new THREE.Mesh(new THREE.TorusGeometry(14.5, 0.14, 10, 80), abyssGold);
    abyssRingMid.rotation.x = Math.PI / 2;
    const abyssRingInner = new THREE.Mesh(new THREE.TorusGeometry(8.2, 0.12, 10, 64), abyssSapphire);
    abyssRingInner.rotation.x = Math.PI / 2;
    const abyssHexagram = new THREE.Mesh(
      new THREE.RingGeometry(14.1, 14.3, 6),
      new THREE.MeshBasicMaterial({ color: 0x2b6e8c, transparent: true, opacity: 0.28, side: THREE.DoubleSide, depthWrite: false }),
    );
    abyssHexagram.rotation.x = -Math.PI / 2;
    const abyssCoreHub = new THREE.Mesh(
      new THREE.RingGeometry(2.2, 2.6, 32),
      new THREE.MeshBasicMaterial({ color: COLOR.line, transparent: true, opacity: 0.25, side: THREE.DoubleSide, depthWrite: false }),
    );
    abyssCoreHub.rotation.x = -Math.PI / 2;
    abyssGroup.add(abyssRingOuter, abyssRingMid, abyssRingInner, abyssHexagram, abyssCoreHub);
    scene.add(abyssGroup);

    // 6 Mạch Năng Lượng Đáy Vực (Abyssal Ley-Lines) nối từ tâm vực sâu tới chân dây neo của từng đảo
    isles.forEach((isle, idx) => {
      const A = ACCENTS[idx % ACCENTS.length];
      const p0 = new THREE.Vector3(center.x, -13.12, center.z);
      const p1 = new THREE.Vector3(isle.c.x, -13.12, isle.c.y);
      const lineGeo = new THREE.BufferGeometry().setFromPoints([p0, p1]);
      const leyLine = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: A, transparent: true, opacity: 0.26 }));
      const nodeRing = new THREE.Mesh(
        new THREE.RingGeometry(0.85, 1.15, 24),
        new THREE.MeshBasicMaterial({ color: A, transparent: true, opacity: 0.34, side: THREE.DoubleSide, depthWrite: false }),
      );
      nodeRing.rotation.x = -Math.PI / 2;
      nodeRing.position.copy(p1);
      scene.add(leyLine, nodeRing);
    });

    // Hai cánh phông nền định lượng 3D (Thanh nến biểu đồ & Ma trận khối lập phương có motion theo ảnh mẫu)
    const quantFlanksSpin = buildQuantFlanks(scene, center, wide, sv);

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

    scene.add(new THREE.HemisphereLight(0xb8f0ff, 0x0c1a2c, 0.55));
    scene.add(new THREE.AmbientLight(0xffffff, 0.34));
    const sun = new THREE.DirectionalLight(0xfff5e4, 1.48);
    sun.position.copy(center).add(new THREE.Vector3(10, 18, 6));
    sun.target.position.copy(center);
    sun.castShadow = true;
    sun.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048);
    Object.assign(sun.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, near: 1, far: 80 });
    sun.shadow.bias = -0.0005;
    sun.shadow.normalBias = 0.02;
    scene.add(sun, sun.target);
    // Ánh viền tinh vân từ phía sau cho các khối pha lê nổi rõ
    const back = new THREE.DirectionalLight(0x52f2ff, 1.05);
    back.position.copy(center).add(new THREE.Vector3(-10, 6, -12));
    scene.add(back);

    // Mưa tinh tú: các hạt sáng trôi chậm trong không gian
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
    const rain = new THREE.Points(rainGeo, new THREE.PointsMaterial({ color: COLOR.line, size: 0.085, transparent: true, opacity: 0.5 }));
    scene.add(rain);

    // Đá tinh thể lơ lửng
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
    const spins: Spin[] = [quantFlanksSpin];
    const fx: { rune: THREE.MeshBasicMaterial; beam: THREE.Mesh }[] = [];
    isles.forEach((isle, i) => {
      const angles = bridges
        .flatMap((b, j) => (j === i ? [b.s] : j === i - 1 ? [b.e] : []))
        .map((p) => Math.atan2(p.y - isle.c.y, p.x - isle.c.x));
      const rune = buildIsland(isle, i, angles, scene, pickables, spins);
      const group = new THREE.Group();
      group.position.set(isle.c.x, isle.y + TOP, isle.c.y);
      const A = ACCENTS[i % ACCENTS.length];
      const landmarkSpin = buildLandmark(HUB.islands[i].landmark, group, [], libraryWall, A);
      scene.add(group);

      const beam = new THREE.Mesh(
        new THREE.CylinderGeometry(0.75, 1.95, 12, 24, 1, true),
        new THREE.MeshBasicMaterial({ color: A, transparent: true, opacity: 0.03, side: THREE.DoubleSide, depthWrite: false }),
      );
      beam.position.set(isle.c.x, isle.y + 6, isle.c.y);
      beam.visible = false;
      scene.add(beam);
      fx.push({ rune, beam });

      // Đồng bộ chuyển động bay lơ lửng của vật mốc trên đảo với thân đảo
      spins.push((t) => {
        const dy = isleBob(i, t);
        group.position.y = isle.y + TOP + dy;
        group.rotation.z = isleTiltZ(i, t);
        group.rotation.x = isleTiltX(i, t);
        beam.position.y = isle.y + 6 + dy;
        landmarkSpin(t);
      });
    });
    bridges.forEach((b, idx) => spins.push(buildBridge(b, idx, scene)));
    spins.push(buildCenterNexus(scene, hubCore, isles, wide));
    spins.push(buildBot(scene, bot, isles, hoverIsleRef, botPosRef, pickables));

    // Toàn cảnh: lấy khung bao của mọi đảo (cả đáy đá và bảng tên) theo trục màn hình, canh vừa phần giữa thanh trên và dòng chữ dưới
    const samples: THREE.Vector3[] = [];
    const boundR = ISLAND_R + 1.1;
    isles.forEach((s) => {
      [[boundR, 0], [-boundR, 0], [0, boundR], [0, -boundR]].forEach(([dx, dz]) => samples.push(new THREE.Vector3(s.c.x + dx, s.y + TOP, s.c.y + dz)));
      samples.push(new THREE.Vector3(s.c.x, s.y - 4.6, s.c.y), new THREE.Vector3(s.c.x, s.y + 6.5, s.c.y));
    });
    samples.push(bot.clone().setY(bot.y - 0.3), bot.clone().setY(bot.y + 4.4));
    const bottomPx = () => (narrowRef.current && botOpenRef.current && tourRef.current === null ? BUBBLE_PX : BOTTOM_PX);
    const overview = () => {
      let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
      samples.forEach((p) => {
        const x = p.dot(right), y = p.dot(up);
        x0 = Math.min(x0, x);
        x1 = Math.max(x1, x);
        y0 = Math.min(y0, y);
        y1 = Math.max(y1, y);
      });
      const W = Math.max(mount.clientWidth, 1), H = Math.max(mount.clientHeight, 1);
      const padX = W < 640 ? 28 : W < 1024 ? 56 : 72;
      const availW = Math.max(180, W - padX);
      const availH = Math.max(180, H - TOP_PX - bottomPx());
      const zoom = Math.min((F * availW) / (H * (x1 - x0)), (F * availH) / (H * (y1 - y0)));
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

    // Rê chuột: sáng đảo dưới con trỏ + tạo hiệu ứng Parallax 3D nghiêng góc nhìn đa tầng. Chạm/bấm (không kéo): vào trang của đảo đó.
    // Tối ưu hiệu năng: Raycast chỉ kiểm tra 7 khối bao vô hình (intersectObjects(..., false)) và thực hiện tối đa 1 lần mỗi khung hình (60fps).
    let viewW = mount.clientWidth;
    let viewH = mount.clientHeight;
    let canvasRect = renderer.domElement.getBoundingClientRect();
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const pointerNdc = new THREE.Vector2();
    let pointerDirty = false;
    const parallaxGoal = new THREE.Vector2(0, 0);
    const parallaxCur = new THREE.Vector2(0, 0);
    let hover: number | null = null;
    const pickAtNdc = (targetNdc: THREE.Vector2) => {
      ray.setFromCamera(targetNdc, camera);
      const hit = ray.intersectObjects(pickables, false)[0];
      if (hit?.object.userData.bot) return 'bot' as const;
      return (hit?.object.userData.isle as number | undefined) ?? null;
    };
    const pick = (e: PointerEvent) => {
      ndc.set(((e.clientX - canvasRect.left) / canvasRect.width) * 2 - 1, -((e.clientY - canvasRect.top) / canvasRect.height) * 2 + 1);
      return pickAtNdc(ndc);
    };
    let downAt: { x: number; y: number } | null = null;
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const nx = ((e.clientX - canvasRect.left) / canvasRect.width) * 2 - 1;
      const ny = -((e.clientY - canvasRect.top) / canvasRect.height) * 2 + 1;
      parallaxGoal.set(nx * 0.85, ny * 0.5);
      pointerNdc.set(nx, ny);
      pointerDirty = true;
    };
    const onPointerDown = (e: PointerEvent) => (downAt = { x: e.clientX, y: e.clientY });
    const onPointerUp = (e: PointerEvent) => {
      if (!downAt || Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) > 8) return;
      const hit = pick(e);
      if (hit === 'bot') botTapRef.current();
      else if (hit !== null) tapRef.current(hit, 'island');
    };
    renderer.domElement.addEventListener('pointermove', onPointerMove, { passive: true });
    renderer.domElement.addEventListener('pointerdown', onPointerDown, { passive: true });
    renderer.domElement.addEventListener('pointerup', onPointerUp, { passive: true });

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    // Bloom tinh chỉnh ở ngưỡng cao (threshold 0.92, strength 0.36) để tạo hào quang ma thuật nhưng không bao giờ gây chói mắt
    const bloom = new UnrealBloomPass(new THREE.Vector2(viewW / 2, viewH / 2), 0.36, 0.42, 0.92);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());

    const onResize = () => {
      viewW = mount.clientWidth;
      viewH = mount.clientHeight;
      if (viewW <= 0 || viewH <= 0) return;
      canvasRect = renderer.domElement.getBoundingClientRect();
      fitFrustum();
      renderer.setSize(viewW, viewH, false);
      composer.setSize(viewW, viewH);
      bloom.resolution.set(viewW / 2, viewH / 2);
      renderer.shadowMap.needsUpdate = true;
      aim();
      // Khi kéo thu nhỏ/phóng to cửa sổ trên PC, khớp máy quay ngay lập tức để các nhãn chữ không bị lệch hoặc trễ
      if (tourRef.current === null && !leaving.current) {
        cam.target.copy(goal.target);
        cam.zoom = goal.zoom;
      }
    };
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();
    const proj = new THREE.Vector3();
    let frame = 0;
    // Tự giảm chất lượng khi máy không theo kịp ~45 khung/giây: hạ độ phân giải từng bậc, bậc cuối tắt hậu kỳ phát sáng.
    const dprSteps = [renderer.getPixelRatio(), Math.min(renderer.getPixelRatio(), 1), 0.8];
    let quality = 0;
    let frames = 0;
    let slow = 0;
    const tick = () => {
      frame = requestAnimationFrame(tick);
      if (document.hidden) return;
      const raw = clock.getDelta();
      const dt = Math.min(raw, 0.05);
      const t = clock.elapsedTime;
      frames += 1;
      if (frames > 90 && quality < dprSteps.length - 1) {
        slow = raw > 1 / 45 ? slow + 1 : Math.max(0, slow - 1);
        if (slow > 60) {
          quality += 1;
          slow = 0;
          renderer.setPixelRatio(dprSteps[quality]);
          composer.setPixelRatio(dprSteps[quality]);
          if (quality === dprSteps.length - 1) bloom.enabled = false;
          onResize();
        }
      }

      if (pointerDirty) {
        pointerDirty = false;
        const hit = pickAtNdc(pointerNdc);
        const next = typeof hit === 'number' ? hit : null;
        if (next !== hover) hoverRef.current(next);
        hover = next;
        renderer.domElement.style.cursor = hit !== null ? 'pointer' : '';
      }

      // Máy quay trôi êm tới khung đang nhắm + Parallax 3D rất nhẹ nhàng, tĩnh tại, không gây chóng mặt
      const k = reduceMotion ? 1 : 1 - Math.exp(-dt * 2.4);
      cam.target.lerp(goal.target, k);
      cam.zoom += (goal.zoom - cam.zoom) * k;
      parallaxCur.lerp(parallaxGoal, reduceMotion ? 0 : 1 - Math.exp(-dt * 2.8));
      const breathX = reduceMotion ? 0 : Math.sin(t * 0.3) * 0.08;
      const breathY = reduceMotion ? 0 : Math.cos(t * 0.25) * 0.05;
      camera.zoom = cam.zoom;
      camera.updateProjectionMatrix();
      camera.position
        .copy(cam.target)
        .add(ISO)
        .addScaledVector(right, parallaxCur.x + breathX)
        .addScaledVector(up, parallaxCur.y + breathY);
      camera.lookAt(cam.target);

      const focus = goalKind ?? hover ?? (modeRef.current === 'new' ? 0 : null);
      fx.forEach((f, i) => {
        const on = i === focus;
        f.beam.visible = on;
        if (on) (f.beam.material as THREE.MeshBasicMaterial).opacity = 0.032 + Math.sin(t * 2.5) * 0.01;
        f.rune.opacity = on ? 0.86 : 0.48;
      });

      if (!reduceMotion) {
        spins.forEach((spin) => spin(t));
        abyssRingOuter.rotation.z = t * 0.04;
        abyssRingMid.rotation.z = -t * 0.065;
        abyssHexagram.rotation.z = t * 0.03;
        debris.forEach((m) => {
          m.position.y += Math.sin(t + m.userData.phase) * 0.002;
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

      // Bảng tên bám theo nhịp bay lơ lửng của từng đảo và tự động thu phóng theo tỷ lệ máy quay 3D (không vỡ chi tiết khi kéo thu nhỏ cửa sổ trên PC)
      const w = viewW;
      const h = viewH;
      const ppu = (h * cam.zoom) / F;
      const basePpu = wide ? 38 : 26;
      const uiScale = THREE.MathUtils.clamp(ppu / basePpu, 0.52, 1);
      const scaleStr = uiScale.toFixed(3);
      const show = tourRef.current === null && !leaving.current;
      isles.forEach((isle, i) => {
        const el = labelRefs.current[i];
        if (!el) return;
        const dy = reduceMotion ? 0 : isleBob(i, t);
        const labelLift = i === 4 ? 2.85 : 3.35;
        proj.set(isle.c.x, isle.y + dy + labelLift, isle.c.y).project(camera);
        const visible = show && Math.abs(proj.x) < 1.05 && Math.abs(proj.y) < 1.05;
        el.style.opacity = visible ? '1' : '0';
        el.style.pointerEvents = visible ? 'auto' : 'none';
        el.dataset.hover = String(i === hover);
        const rawX = ((proj.x + 1) / 2) * w;
        const rawY = ((1 - proj.y) / 2) * h;
        const marginX = 54 * uiScale;
        const clampedX = THREE.MathUtils.clamp(rawX, marginX, Math.max(marginX, w - marginX));
        el.style.transform = `translate3d(${clampedX}px, ${rawY}px, 0) translate(-50%, -100%) scale(${scaleStr})`;
      });

      // Huy hiệu Trung Tâm STRATEGY AUDIT lơ lửng ngay giữa khoảng không của 6 đảo
      const centerEl = centerRef.current;
      if (centerEl) {
        const cy = reduceMotion ? 0 : centerBob(t);
        proj.set(hubCore.x, hubCore.y + cy + 0.35, hubCore.z).project(camera);
        const visible = show && Math.abs(proj.x) < 1.05 && Math.abs(proj.y) < 1.05;
        centerEl.style.opacity = visible ? '1' : '0';
        const centerScale = THREE.MathUtils.clamp(uiScale * (w < 900 ? 0.78 : 0.96), 0.48, 1).toFixed(3);
        centerEl.style.transform = `translate3d(${((proj.x + 1) / 2) * w}px, ${((1 - proj.y) / 2) * h}px, 0) translate(-50%, -50%) scale(${centerScale})`;
      }

      // Bong bóng SA bot (màn rộng) bám theo vị trí bay lượn thực tế của SA Bot bằng GPU translate3d
      const bubble = bubbleRef.current;
      if (bubble && !narrowRef.current) {
        const bp = botPosRef.current;
        proj.set(bp.x, bp.y + 3, bp.z).project(camera);
        const bScale = THREE.MathUtils.clamp(uiScale, 0.74, 1);
        const bx = ((proj.x + 1) / 2) * w + 48 * bScale;
        const by = ((1 - proj.y) / 2) * h;
        const bw = bubbleSizeRef.current.w * bScale;
        const bh = bubbleSizeRef.current.h * bScale;
        const tx = Math.max(16, Math.min(bx, w - bw - 16));
        const ty = Math.min(Math.max(by - bh / 2, TOP_PX + 8), h - bh - (w < 960 ? 44 : 16));
        bubble.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${bScale.toFixed(3)})`;
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
  }, [isWide]);

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

      {/* Viền Vignette không gian sâu hút tầm mắt vào cụm đảo trung tâm */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_46%,transparent_54%,rgba(2,6,15,0.68)_100%)]"
      />

      {/* Biểu tượng Trung Tâm STRATEGY AUDIT nổi bật ở chính giữa khoảng không của 6 đảo */}
      <div className="pointer-events-none absolute inset-0">
        <div
          ref={centerRef}
          data-hub-centerpiece
          className="sa-glass-dark absolute left-0 top-0 origin-center flex items-center gap-2.5 whitespace-nowrap rounded-2xl border border-[#d4b675]/55 bg-[linear-gradient(135deg,rgba(14,45,66,0.88),rgba(6,19,32,0.92))] px-3.5 py-2 opacity-0 shadow-[0_18px_42px_rgba(0,0,0,0.88),0_0_24px_rgba(61,242,255,0.18),inset_0_1px_0_rgba(212,182,117,0.35)] transition-opacity duration-300 will-change-transform lg:gap-3.5 lg:px-5 lg:py-2.5 max-lg:rounded-xl max-lg:px-2.5 max-lg:py-1.5"
        >
          <span
            aria-hidden
            className="hidden h-2 w-2 rotate-45 rounded-[1px] bg-[#d4b675] shadow-[0_0_8px_#d4b675] lg:inline-block"
          />
          <img
            src="/assets/strategy-audit-logo.png"
            alt="Strategy Audit"
            className="h-6 w-6 object-cover object-left drop-shadow-[0_0_10px_rgba(43,255,234,0.3)] lg:h-7 lg:w-auto lg:object-contain"
          />
          <div className="hidden border-l border-[#d4b675]/30 pl-2.5 text-left lg:block lg:pl-3">
            <span className="block font-mono text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#2BFFEA] lg:text-xs">
              STRATEGY AUDIT
            </span>
            <span className="block text-[10px] font-medium tracking-wider text-[#d4b675] lg:text-[11px]">
              Cộng đồng Quant Trader
            </span>
          </div>
          <span
            aria-hidden
            className="hidden h-2 w-2 rotate-45 rounded-[1px] bg-[#2BFFEA] shadow-[0_0_8px_#2BFFEA] lg:inline-block"
          />
        </div>
      </div>

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
            onMouseEnter={() => {
              setHoverIsle(i);
              prefetchTab(isle.tab);
            }}
            onMouseLeave={() => setHoverIsle(null)}
            className={`sa-glass-dark absolute left-0 top-0 origin-bottom rounded-lg border px-2 py-1 text-center opacity-0 shadow-[0_14px_34px_rgba(0,0,0,0.82),0_3px_10px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.12)] transition-[opacity,border-color,box-shadow] duration-300 will-change-transform hover:border-[#2BFFEA] data-[hover=true]:border-[#2BFFEA] sm:rounded-xl sm:px-3 sm:py-1.5 ${mode === 'new' && i === 0 ? 'border-[#2BFFEA] shadow-[0_14px_34px_rgba(0,0,0,0.82),0_0_18px_rgba(43,255,234,0.35)]' : 'border-[#3df2ff]/40'
              } ${mode === 'new' && (hoverIsle === i || note === i) ? 'w-56 sm:w-64' : 'whitespace-nowrap'}`}
          >
            {mode === 'new' && i === 0 && <span className="block text-[10px] font-bold uppercase tracking-wide text-[#2BFFEA]">{SA_BOT.startHere}</span>}
            <span className="block text-xs font-semibold sm:text-sm">{isle.title}</span>
            <span className="hidden text-[11px] text-gray-400 md:block">{isle.sub}</span>
            {mode === 'new' && (hoverIsle === i || note === i) && (
              <span data-hub-note className="mt-1 block border-t border-white/10 pt-1 text-left text-[11px] leading-snug text-gray-200 sm:text-xs">{isle.note}</span>
            )}
          </button>
        ))}
      </div>

      {/* Thanh trên: logo (bấm để về toàn cảnh bản đồ) · menu tới các trang */}
      <header className="absolute inset-x-0 top-0 flex h-16 items-center justify-between gap-3 bg-gradient-to-b from-[#040914]/95 via-[#040914]/60 to-transparent px-3 sm:px-5">
        <a
          href="/"
          aria-label="Strategy Audit — Bản đồ trung tâm"
          onClick={(e) => {
            e.preventDefault();
            setContactOpen(false);
            setMenuOpen(false);
            setNote(null);
            if (tour !== null) endTour('skip');
            shotRef.current(null);
            onNavigate('home');
          }}
          className="flex shrink-0 items-center rounded-lg py-1 transition-opacity hover:opacity-90 focus:outline-none"
        >
          <img src="/assets/strategy-audit-logo.png" alt="Strategy Audit" className="h-8 w-auto max-w-[150px] object-contain object-left" />
        </a>
        <nav data-hub-menu className="hidden items-center gap-1 xl:flex">
          {HUB.menu.map((m) => (
            <button
              key={m.tab}
              type="button"
              onMouseEnter={() => prefetchTab(m.tab)}
              onClick={() => menuGo(m.tab)}
              className="whitespace-nowrap rounded-lg border border-transparent px-3 py-2 text-xs font-medium text-gray-300 transition-[background,border-color,box-shadow] hover:border-[#9ff6ff]/30 hover:bg-[linear-gradient(160deg,rgba(43,255,234,0.12),rgba(255,255,255,0.03))] hover:text-white hover:shadow-[0_0_14px_rgba(43,255,234,0.15)]"
            >
              {m.label}
            </button>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
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
          <button
            type="button"
            aria-expanded={menuOpen}
            onClick={() => {
              setMenuOpen((v) => !v);
              setContactOpen(false);
            }} className="sa-glass-dark whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold xl:hidden">
            {menuOpen ? 'Đóng' : 'Menu'}
          </button>
        </div>
      </header>
      {menuOpen && (
        <nav className="sa-glass-dark absolute right-3 top-14 z-10 flex w-52 flex-col rounded-xl p-1.5 xl:hidden">
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

      {/* SA bot: luôn hiện thông báo chào đón và có nút ẩn */}
      {ready && tour === null && botOpen && !leaving.current && (
        <div
          ref={bubbleRef}
          data-sa-bot={mode}
          className={`sa-glass-dark sa-glass-dark-lit absolute z-10 rounded-2xl p-4 shadow-[0_16px_36px_rgba(0,0,0,0.85),0_0_24px_rgba(43,255,234,0.18)] ${narrow ? 'inset-x-3 bottom-3 mx-auto max-w-lg' : 'left-0 top-0 w-[22rem] origin-top-left will-change-transform'
            }`}
        >
          <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2BFFEA] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#2BFFEA]" />
              </span>
              <p className="font-mono text-xs font-bold text-[#2BFFEA]">{SA_BOT.name}</p>
              <span className="rounded bg-[#2BFFEA]/15 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-[#2BFFEA]">
                Trợ lý
              </span>
            </div>
            <button
              type="button"
              onClick={() => setBotOpen(false)}
              className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-gray-300 transition-colors hover:border-[#2BFFEA]/50 hover:bg-white/10 hover:text-white"
              title="Ẩn SA bot để ngắm toàn cảnh bản đồ"
              aria-label="Ẩn SA bot"
            >
              <span>Ẩn bot</span>
              <span className="text-sm leading-none">×</span>
            </button>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-gray-100">
            {mode === 'ask' ? SA_BOT.ask : mode === 'new' ? SA_BOT.noReply(touch) : SA_BOT.yesReply}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
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
            {mode === 'free' && (
              <>
                <button type="button" onClick={() => go(0, 'bot')} className="sa-glass-btn rounded-xl px-3.5 py-2 text-xs font-bold">
                  {SA_BOT.enterFirst}
                </button>
                <button type="button" onClick={replay} className="sa-glass-ghost rounded-xl px-3.5 py-2 text-xs text-gray-200">
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
                className="px-1 py-1.5 text-xs text-gray-400 underline underline-offset-2 hover:text-gray-200"
              >
                {SA_BOT.reask}
              </button>
            )}
            <button
              type="button"
              onClick={() => setBotOpen(false)}
              className="ml-auto rounded-lg px-2.5 py-1 text-xs text-gray-400 hover:text-white"
            >
              Ẩn đi
            </button>
          </div>
        </div>
      )}

      {/* Nút nổi luôn hiển thị khi SA Bot đang ẩn để khách luôn biết có SA Bot và có thể gọi lại bất cứ lúc nào */}
      {ready && tour === null && !botOpen && !leaving.current && (
        <div className="absolute bottom-4 left-4 z-20">
          <button
            type="button"
            onClick={() => setBotOpen(true)}
            aria-label="Mở trợ lý SA Bot"
            className="sa-glass-dark sa-glass-dark-lit group flex items-center gap-2.5 rounded-full border border-[#2BFFEA]/50 bg-[linear-gradient(135deg,rgba(14,45,66,0.92),rgba(6,19,32,0.96))] px-3.5 py-2 text-xs font-semibold text-white shadow-[0_0_20px_rgba(43,255,234,0.35)] transition-all duration-200 hover:scale-105 hover:border-[#2BFFEA] hover:shadow-[0_0_28px_rgba(43,255,234,0.55)]"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2BFFEA] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#2BFFEA]" />
            </span>
            <span className="font-mono text-[11px] font-bold text-[#2BFFEA]">🤖 {SA_BOT.name}</span>
            <span className="text-gray-300 group-hover:text-white">· Hiện trợ lý</span>
          </button>
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
