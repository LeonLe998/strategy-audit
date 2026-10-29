/**
 * Bộ vật liệu kính dùng chung cho các cảnh 3D (trang Bắt đầu ở đây, Vì sao cần đo, bản đồ đảo).
 * Không cần vẽ thêm lượt: kính = vật liệu trong + viền sáng fresnel + phòng sáng để có vệt phản chiếu.
 */
import * as THREE from 'three';

/** Viền sáng kiểu kính: mép nghiêng so với mắt nhìn thì sáng, mặt chính diện thì trong (rẻ, không cần vẽ thêm lượt) */
export function rimMaterial(color: number, amp: number, pow = 2.4) {
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
export function glassMaterial(tint = 0xbfefff, opacity = 0.1) {
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
export function glassLathe(profile: THREE.Vector2[], rim: number, rimAmp: number, opacity?: number) {
  const geo = new THREE.LatheGeometry(profile, 64);
  const g = new THREE.Group();
  g.add(new THREE.Mesh(geo, glassMaterial(undefined, opacity)), new THREE.Mesh(geo, rimMaterial(rim, rimAmp)));
  return g;
}

/** Phòng sáng dựng tạm: hộp tối với vài tấm đèn, chỉ dùng để kính có vệt phản chiếu */
export function studioEnv(renderer: THREE.WebGLRenderer) {
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
export function glow(color: number, size: number, opacity: number) {
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

