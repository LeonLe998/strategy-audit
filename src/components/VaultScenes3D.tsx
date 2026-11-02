/**
 * VaultScenes3D: Bộ Motion Graphics 3D tương tác chân thực (Three.js WebGL)
 * Dành riêng cho 11 Chuyên đề Phân tích & Hồ sơ nghiên cứu (BC-01..03 & HS-01..08)
 * Tuân thủ triệt để AGENTS.md: Màu sắc chuẩn neon cyan/amber/emerald, không biểu đồ nến, không mũi tên lên, không hứa hẹn lợi nhuận.
 */
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { startMiniScene, type Frame } from '../game/world/miniScene';
import { glassMaterial, rimMaterial, glow } from '../game/world/glassKit';

const CYAN = 0x3df2ff;
const ACCENT = 0x2bffea;
const AMBER = 0xffaa00;
const DANGER = 0xff4d6d;
const EMERALD = 0x10b981;

/** Tạo nhãn sprite 3D sắc nét xoay theo camera */
function labelSprite(text: string, color = '#3df2ff', bg = 'rgba(6,22,36,0.85)', border = 'rgba(61,242,255,0.4)', fontSize = 26) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Sprite();

  const font = `700 ${fontSize}px "JetBrains Mono", monospace`;
  ctx.font = font;
  const metrics = ctx.measureText(text);
  const w = Math.ceil(metrics.width) + 28;
  const h = Math.ceil(fontSize * 1.8);

  canvas.width = w;
  canvas.height = h;

  ctx.font = font;
  ctx.fillStyle = bg;
  ctx.strokeStyle = border;
  ctx.lineWidth = 2.5;

  ctx.beginPath();
  ctx.roundRect(2, 2, w - 4, h - 4, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, w / 2, h / 2 + 1);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(mat);
  const scale = 0.012;
  sprite.scale.set(w * scale, h * scale, 1);
  return sprite;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. BC-01: RiskOfRuin3DScene (Vực thẳm phi tuyến & Bờ vực sụp đổ)
// ─────────────────────────────────────────────────────────────────────────────
export function RiskOfRuin3DScene({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = ref.current;
    if (!mount) return;

    return startMiniScene(
      mount,
      (scene): Frame => {
        const root = new THREE.Group();
        scene.add(root);

        // Nền lưới toạ độ isometric
        const grid = new THREE.GridHelper(10, 14, 0x00486b, 0x081b2e);
        grid.position.y = -1.2;
        root.add(grid);

        // Bục phẳng kính an toàn (1% Rủi ro)
        const safeGeo = new THREE.BoxGeometry(3.6, 0.4, 3);
        const safeMesh = new THREE.Mesh(safeGeo, glassMaterial(ACCENT, 0.25));
        safeMesh.position.set(-2, 0.2, 0);
        safeMesh.add(new THREE.Mesh(safeGeo, rimMaterial(ACCENT, 1.4)));
        root.add(safeMesh);

        // Nhãn bục an toàn
        const safeLabel = labelSprite('1% RỦI RO: VÙNG SỐNG', '#2BFFEA', 'rgba(4,25,35,0.9)', 'rgba(43,255,234,0.5)');
        safeLabel.position.set(-2, 1.2, 0);
        root.add(safeLabel);

        // Bờ vực gãy dốc đứng (Cliff drop)
        const cliffGeo = new THREE.CylinderGeometry(0.08, 1.6, 2.8, 4);
        cliffGeo.rotateZ(0.65);
        const cliffMat = new THREE.MeshBasicMaterial({ color: DANGER, wireframe: true, transparent: true, opacity: 0.6 });
        const cliffMesh = new THREE.Mesh(cliffGeo, cliffMat);
        cliffMesh.position.set(0.6, -0.6, 0);
        root.add(cliffMesh);

        // Hố sâu sụp đổ (>5% Rủi ro)
        const abyssGeo = new THREE.BoxGeometry(3.2, 0.3, 3);
        const abyssMesh = new THREE.Mesh(abyssGeo, glassMaterial(DANGER, 0.15));
        abyssMesh.position.set(2.4, -1.8, 0);
        abyssMesh.add(new THREE.Mesh(abyssGeo, rimMaterial(DANGER, 1.6)));
        root.add(abyssMesh);

        const dangerLabel = labelSprite('5% RỦI RO: CHÁY 98%', '#ff5a6a', 'rgba(40,10,18,0.9)', 'rgba(255,90,106,0.5)');
        dangerLabel.position.set(2.4, -0.9, 0);
        root.add(dangerLabel);

        // Viên ngọc đại diện tài khoản an toàn lơ lửng trên bục
        const orbGeo = new THREE.IcosahedronGeometry(0.3, 2);
        const orbMat = new THREE.MeshStandardMaterial({ color: ACCENT, emissive: ACCENT, emissiveIntensity: 0.8, roughness: 0.2 });
        const safeOrb = new THREE.Mesh(orbGeo, orbMat);
        safeOrb.position.set(-2, 0.8, 0);
        safeOrb.add(glow(ACCENT, 1.2, 0.6));
        root.add(safeOrb);

        // Các mảnh vỡ tài khoản rơi xoáy vào hố đen
        const shardCount = 20;
        const shardGeo = new THREE.TetrahedronGeometry(0.12);
        const shardMat = new THREE.MeshBasicMaterial({ color: DANGER, wireframe: true });
        const shards: { mesh: THREE.Mesh; seed: number }[] = [];

        for (let i = 0; i < shardCount; i++) {
          const m = new THREE.Mesh(shardGeo, shardMat);
          root.add(m);
          shards.push({ mesh: m, seed: Math.random() * Math.PI * 2 });
        }

        return (t) => {
          root.rotation.y = Math.sin(t * 0.35) * 0.22;
          safeOrb.position.y = 0.8 + Math.sin(t * 2) * 0.08;

          // Hạt rơi và phân rã qua bờ vực
          shards.forEach((s, idx) => {
            const progress = (t * 0.7 + idx * 0.15) % 1;
            const px = 0.2 + progress * 2.6;
            const py = 0.2 - Math.pow(progress, 2.2) * 2.2;
            const pz = Math.sin(s.seed + t) * 0.8;
            s.mesh.position.set(px, py, pz);
            s.mesh.rotation.x = t * 2 + s.seed;
            s.mesh.rotation.y = t * 3;
            const scale = Math.max(0.01, 1 - progress);
            s.mesh.scale.setScalar(scale);
          });
        };
      },
      { fov: 38, pos: [0, 1.8, 8.5], look: [0.2, -0.4, 0] }
    );
  }, []);

  return <div ref={ref} className={`relative h-56 w-full overflow-hidden ${className}`} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. BC-02: AlphaVsBeta3DScene (Tách biệt Lõi Alpha Độc lập & Vành Beta Nhiễu)
// ─────────────────────────────────────────────────────────────────────────────
export function AlphaVsBeta3DScene({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = ref.current;
    if (!mount) return;

    return startMiniScene(
      mount,
      (scene): Frame => {
        const root = new THREE.Group();
        scene.add(root);

        // 1. Lõi Alpha: Khối đá quý Icosahedron phát sáng ổn định
        const alphaGeo = new THREE.IcosahedronGeometry(0.9, 1);
        const alphaMesh = new THREE.Mesh(alphaGeo, glassMaterial(EMERALD, 0.4));
        alphaMesh.add(new THREE.Mesh(alphaGeo, rimMaterial(EMERALD, 1.8)));
        alphaMesh.add(glow(EMERALD, 2.5, 0.7));
        root.add(alphaMesh);

        // Vành khiên lượng tử bảo vệ Alpha
        const shieldGeo = new THREE.RingGeometry(1.2, 1.25, 48);
        const shieldMat = new THREE.MeshBasicMaterial({ color: EMERALD, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
        const shieldRing = new THREE.Mesh(shieldGeo, shieldMat);
        shieldRing.rotation.x = Math.PI / 2;
        root.add(shieldRing);

        const alphaLabel = labelSprite('ALPHA NGUYÊN BẢN (KHÔNG CHẠY THEO VÀNG)', '#10b981', 'rgba(4,30,20,0.9)', 'rgba(16,185,129,0.5)');
        alphaLabel.position.set(0, 1.6, 0);
        root.add(alphaLabel);

        // 2. Vành ngoài Beta: Torus biến động chao đảo
        const betaTorusGeo = new THREE.TorusGeometry(2.3, 0.12, 12, 64);
        const betaMat = new THREE.MeshBasicMaterial({ color: AMBER, wireframe: true, transparent: true, opacity: 0.45 });
        const betaTorus = new THREE.Mesh(betaTorusGeo, betaMat);
        root.add(betaTorus);

        // Vành phụ thứ 2 lệch góc
        const betaRing2 = new THREE.Mesh(new THREE.TorusGeometry(2.8, 0.08, 12, 64), new THREE.MeshBasicMaterial({ color: 0x9333ea, wireframe: true, transparent: true, opacity: 0.35 }));
        root.add(betaRing2);

        // Thiên thạch Beta bay hỗn loạn xung quanh
        const noiseCount = 14;
        const noiseGeo = new THREE.DodecahedronGeometry(0.14);
        const noiseMat = new THREE.MeshBasicMaterial({ color: AMBER });
        const satellites: { mesh: THREE.Mesh; angle: number; radius: number; speed: number; yOffset: number }[] = [];

        for (let i = 0; i < noiseCount; i++) {
          const m = new THREE.Mesh(noiseGeo, noiseMat);
          root.add(m);
          satellites.push({
            mesh: m,
            angle: (i / noiseCount) * Math.PI * 2,
            radius: 2.1 + (i % 3) * 0.35,
            speed: (Math.random() * 0.4 + 0.3) * (i % 2 === 0 ? 1 : -1),
            yOffset: (Math.random() - 0.5) * 0.8,
          });
        }

        const betaLabel = labelSprite('BETA BIẾN ĐỘNG THỊ TRƯỜNG', '#f59e0b', 'rgba(35,20,4,0.9)', 'rgba(245,158,11,0.5)');
        betaLabel.position.set(0, -2.1, 0);
        root.add(betaLabel);

        return (t) => {
          root.rotation.y = t * 0.15;

          // Lõi Alpha xoay chậm chạp và vững chãi
          alphaMesh.rotation.x = t * 0.4;
          alphaMesh.rotation.y = t * 0.5;

          // Vành Beta chao đảo hỗn loạn
          betaTorus.rotation.x = Math.sin(t * 0.8) * 0.6 + Math.PI / 3;
          betaTorus.rotation.y = t * 0.6;
          betaRing2.rotation.x = Math.cos(t * 0.7) * 0.5 - Math.PI / 4;
          betaRing2.rotation.z = t * 0.4;

          satellites.forEach((s) => {
            const a = s.angle + t * s.speed;
            s.mesh.position.set(Math.cos(a) * s.radius, s.yOffset + Math.sin(t * 2 + s.angle) * 0.3, Math.sin(a) * s.radius);
            s.mesh.rotation.y = t * 2;
          });
        };
      },
      { fov: 40, pos: [0, 1.2, 7.8], look: [0, -0.1, 0] }
    );
  }, []);

  return <div ref={ref} className={`relative h-56 w-full overflow-hidden ${className}`} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. BC-03: CurveFitting3DScene (Con Dấu 3D Đóng Xuống 42 Thước Đo Quá Mức)
// ─────────────────────────────────────────────────────────────────────────────
export function CurveFitting3DScene({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = ref.current;
    if (!mount) return;

    return startMiniScene(
      mount,
      (scene): Frame => {
        const root = new THREE.Group();
        scene.add(root);

        // 3 Vòng radar quét mục tiêu
        for (let r = 1; r <= 3; r++) {
          const ring = new THREE.Mesh(new THREE.RingGeometry(r * 0.9, r * 0.93, 48), new THREE.MeshBasicMaterial({ color: CYAN, side: THREE.DoubleSide, transparent: true, opacity: 0.25 }));
          ring.rotation.x = Math.PI / 2;
          root.add(ring);
        }

        // Tia laser radar quét quét
        const sweepGeo = new THREE.ConeGeometry(2.8, 0.05, 32, 1, true, 0, Math.PI / 3);
        const sweepMat = new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.2, side: THREE.DoubleSide });
        const sweep = new THREE.Mesh(sweepGeo, sweepMat);
        sweep.rotation.x = Math.PI / 2;
        root.add(sweep);

        // 4 Tấm kính chứa 4 chỉ báo phổ biến (RSI, Bollinger, MACD, MA)
        const cards: { mesh: THREE.Group; baseAngle: number }[] = [];
        const cardTitles = ['RSI-14', 'BOLL-20', 'MACD', 'EMA-200'];

        cardTitles.forEach((title, idx) => {
          const grp = new THREE.Group();
          const cardGeo = new THREE.BoxGeometry(1.2, 0.7, 0.08);
          const cardMesh = new THREE.Mesh(cardGeo, glassMaterial(CYAN, 0.3));
          cardMesh.add(new THREE.Mesh(cardGeo, rimMaterial(CYAN, 1.2)));
          grp.add(cardMesh);

          const lbl = labelSprite(title, '#3df2ff', 'rgba(10,24,36,0.85)', 'rgba(61,242,255,0.4)', 22);
          lbl.position.set(0, 0, 0.08);
          grp.add(lbl);

          root.add(grp);
          cards.push({ mesh: grp, baseAngle: (idx / 4) * Math.PI * 2 });
        });

        // Con dấu 3D hình lăng trụ lục giác đỏ chớp tắt uy nghiêm ở giữa
        const stampGrp = new THREE.Group();
        const stampGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.3, 6);
        const stampMesh = new THREE.Mesh(stampGeo, new THREE.MeshBasicMaterial({ color: DANGER, wireframe: true }));
        stampGrp.add(stampMesh);
        stampGrp.add(glow(DANGER, 2.2, 0.5));

        const stampLabel = labelSprite('0/42 QUA KIỂM ĐỊNH', '#ff4d6d', 'rgba(50,8,18,0.95)', 'rgba(255,77,109,0.7)', 28);
        stampLabel.position.set(0, 0.6, 0);
        stampGrp.add(stampLabel);

        root.add(stampGrp);

        return (t) => {
          root.rotation.y = Math.sin(t * 0.2) * 0.3;
          sweep.rotation.z = t * 1.5;

          // Các tấm kính bay quanh radar
          cards.forEach((c) => {
            const a = c.baseAngle + t * 0.4;
            c.mesh.position.set(Math.cos(a) * 2.1, Math.sin(t * 1.5 + c.baseAngle) * 0.2, Math.sin(a) * 2.1);
            c.mesh.lookAt(0, 0, 0);
          });

          // Con dấu dập lên dập xuống nhẹ nhàng cảnh báo
          stampGrp.position.y = 0.2 + Math.abs(Math.sin(t * 1.8)) * 0.4;
          stampGrp.rotation.y = t * 0.5;
        };
      },
      { fov: 42, pos: [0, 2.5, 6.8], look: [0, 0.2, 0] }
    );
  }, []);

  return <div ref={ref} className={`relative h-56 w-full overflow-hidden ${className}`} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. HS-01: Probability3DScene (Mặt Phẳng Chuông Gauss & Dòng Chảy Hội Tụ N Lớn)
// ─────────────────────────────────────────────────────────────────────────────
export function Probability3DScene({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = ref.current;
    if (!mount) return;

    return startMiniScene(
      mount,
      (scene): Frame => {
        const root = new THREE.Group();
        scene.add(root);

        // 1. Dựng mặt cong phân phối chuẩn Gauss (Gaussian Wireframe 3D Surface)
        const res = 28;
        const geom = new THREE.PlaneGeometry(6, 4, res, res);
        geom.rotateX(-Math.PI / 2);
        const pos = geom.attributes.position;

        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i);
          const z = pos.getZ(i);
          const r2 = x * x + z * z;
          const y = 1.6 * Math.exp(-r2 / 2.2);
          pos.setY(i, y - 0.8);
        }
        geom.computeVertexNormals();

        const surfMat = new THREE.MeshBasicMaterial({ color: CYAN, wireframe: true, transparent: true, opacity: 0.35 });
        const surfMesh = new THREE.Mesh(geom, surfMat);
        root.add(surfMesh);

        // Đỉnh kỳ vọng (Mean Expectation Laser)
        const peakLaser = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.2), new THREE.MeshBasicMaterial({ color: ACCENT }));
        peakLaser.position.set(0, 0.3, 0);
        peakLaser.add(glow(ACCENT, 1.4, 0.6));
        root.add(peakLaser);

        const convLabel = labelSprite('HỘI TỤ LUẬT SỐ LỚN (N ≥ 1.000 LỆNH)', '#2BFFEA', 'rgba(4,22,34,0.9)', 'rgba(43,255,234,0.5)');
        convLabel.position.set(0, 1.7, 0);
        root.add(convLabel);

        // 2. Dòng hạt lượng tử phân tán rộng ở bên trái (N nhỏ) và gom tụ sắc nét ở trung tâm
        const partCount = 70;
        const partGeo = new THREE.SphereGeometry(0.06, 6, 6);
        const partMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const particles: { mesh: THREE.Mesh; seed: number; speed: number }[] = [];

        for (let i = 0; i < partCount; i++) {
          const m = new THREE.Mesh(partGeo, partMat);
          root.add(m);
          particles.push({
            mesh: m,
            seed: Math.random() * Math.PI * 2,
            speed: 0.4 + Math.random() * 0.4,
          });
        }

        return (t) => {
          root.rotation.y = Math.sin(t * 0.3) * 0.4 - 0.2;

          particles.forEach((p, idx) => {
            const prog = (t * p.speed + idx / partCount) % 1;
            // X di chuyển từ -3 tới +3
            const px = -3 + prog * 6;
            // Độ phân tán sigma co lại khi lại gần tâm 0
            const sigma = Math.max(0.12, Math.abs(px) * 0.6);
            const pz = Math.sin(p.seed + t * 2) * sigma;
            const r2 = px * px + pz * pz;
            const py = 1.6 * Math.exp(-r2 / 2.2) - 0.7;

            p.mesh.position.set(px, py, pz);
            // Màu chuyển từ xám (chưa hội tụ) sang xanh cyan rực rỡ khi gần tâm
            if (Math.abs(px) < 0.6) {
              p.mesh.scale.setScalar(1.4);
            } else {
              p.mesh.scale.setScalar(0.8);
            }
          });
        };
      },
      { fov: 38, pos: [0, 2.6, 7.2], look: [0, 0.1, 0] }
    );
  }, []);

  return <div ref={ref} className={`relative h-56 w-full overflow-hidden ${className}`} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. HS-02: MultipleTesting3DScene (Bộ Lọc Đa Tầng Lượng Tử White's Reality Check)
// ─────────────────────────────────────────────────────────────────────────────
export function MultipleTesting3DScene({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = ref.current;
    if (!mount) return;

    return startMiniScene(
      mount,
      (scene): Frame => {
        const root = new THREE.Group();
        scene.add(root);

        // 3 Tấm lọc kính trong suốt đặt tại các tầng Z
        const filterPlates: THREE.Group[] = [];
        const stages = [
          { z: -1.6, label: 'LƯỢT 1: 300 Ý TƯỞNG THỬ', color: '#64748b' },
          { z: 0.2, label: 'LƯỢT 2: HIỆU CHỈNH BONFERRONI', color: '#f59e0b' },
          { z: 2.0, label: 'LƯỢT 3: 15 CHIẾN LƯỢC SỐNG SÓT', color: '#10b981' },
        ];

        stages.forEach((st) => {
          const grp = new THREE.Group();
          grp.position.z = st.z;

          const plateGeo = new THREE.BoxGeometry(3.6, 2.2, 0.06);
          const plateMesh = new THREE.Mesh(plateGeo, glassMaterial(CYAN, 0.15));
          plateMesh.add(new THREE.Mesh(plateGeo, rimMaterial(CYAN, 1.2)));
          grp.add(plateMesh);

          // Lưới laser trên mặt tấm
          const gridMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 2.0, 10, 6), new THREE.MeshBasicMaterial({ color: CYAN, wireframe: true, transparent: true, opacity: 0.25 }));
          grp.add(gridMesh);

          const lbl = labelSprite(st.label, st.color, 'rgba(6,18,30,0.9)', 'rgba(61,242,255,0.4)', 20);
          lbl.position.set(0, 1.35, 0);
          grp.add(lbl);

          root.add(grp);
          filterPlates.push(grp);
        });

        // 40 Khối dữ liệu bay xuyên qua 3 tầng lọc
        const cubeCount = 36;
        const cubeGeo = new THREE.BoxGeometry(0.16, 0.16, 0.16);
        const dataCubes: { mesh: THREE.Mesh; offsetZ: number; isTrueEdge: boolean }[] = [];

        for (let i = 0; i < cubeCount; i++) {
          const isEdge = i % 8 === 0; // Chỉ 1 số ít là cạnh thật
          const mat = new THREE.MeshBasicMaterial({ color: isEdge ? ACCENT : DANGER });
          const m = new THREE.Mesh(cubeGeo, mat);
          root.add(m);
          dataCubes.push({
            mesh: m,
            offsetZ: Math.random() * 5.0,
            isTrueEdge: isEdge,
          });
        }

        return (t) => {
          root.rotation.y = Math.sin(t * 0.25) * 0.35 + 0.3;

          dataCubes.forEach((c) => {
            const z = ((c.offsetZ + t * 1.4) % 5.5) - 2.8;
            c.mesh.position.z = z;

            // X và Y phân tán
            const seed = c.offsetZ * 12.3;
            c.mesh.position.x = Math.sin(seed) * 1.3;
            c.mesh.position.y = Math.cos(seed) * 0.8;

            // Nếu không phải là True Edge và vượt qua cổng 2 (z > 0.2) thì tan biến
            if (!c.isTrueEdge && z > 0.2) {
              c.mesh.scale.setScalar(Math.max(0.01, 1 - (z - 0.2) * 1.8));
            } else {
              c.mesh.scale.setScalar(1);
            }
          });
        };
      },
      { fov: 42, pos: [3.4, 2.2, 5.8], look: [0, 0, 0] }
    );
  }, []);

  return <div ref={ref} className={`relative h-56 w-full overflow-hidden ${className}`} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. HS-03: Correlation3DScene (Chòm Sao Ma Trận Tương Quan 5 Đỉnh)
// ─────────────────────────────────────────────────────────────────────────────
export function Correlation3DScene({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = ref.current;
    if (!mount) return;

    return startMiniScene(
      mount,
      (scene): Frame => {
        const root = new THREE.Group();
        scene.add(root);

        // 5 Nút chiến lược trong không gian 3D
        const nodes: { pos: THREE.Vector3; name: string; cluster: number; mesh: THREE.Mesh }[] = [
          { pos: new THREE.Vector3(-1.4, 0.8, -0.6), name: 'RSI-14', cluster: 1, mesh: new THREE.Mesh() },
          { pos: new THREE.Vector3(-0.6, -0.7, -0.8), name: 'STOCH-9', cluster: 1, mesh: new THREE.Mesh() },
          { pos: new THREE.Vector3(-1.8, -0.2, 0.6), name: 'CCI-20', cluster: 1, mesh: new THREE.Mesh() },
          { pos: new THREE.Vector3(-0.8, 1.1, 0.7), name: 'WILLIAMS', cluster: 1, mesh: new THREE.Mesh() },
          // Nút thứ 5: Mùa vụ tháng SEA003 (Độc lập, không tương quan)
          { pos: new THREE.Vector3(2.2, 0.2, 0), name: 'SEA003 (LỊCH)', cluster: 2, mesh: new THREE.Mesh() },
        ];

        const nodeGeo = new THREE.DodecahedronGeometry(0.24);

        nodes.forEach((n) => {
          const color = n.cluster === 1 ? DANGER : ACCENT;
          const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.7, roughness: 0.2 });
          const m = new THREE.Mesh(nodeGeo, mat);
          m.position.copy(n.pos);
          m.add(glow(color, 1.2, 0.6));

          const lbl = labelSprite(n.name, n.cluster === 1 ? '#ff5a6a' : '#2BFFEA', 'rgba(10,18,30,0.85)', n.cluster === 1 ? 'rgba(255,90,106,0.5)' : 'rgba(43,255,234,0.5)', 20);
          lbl.position.set(0, 0.42, 0);
          m.add(lbl);

          n.mesh = m;
          root.add(m);
        });

        // Liên kết laser đỏ chằng chịt giữa cụm 1 (Tương quan > 0.85)
        const lineMatRed = new THREE.LineBasicMaterial({ color: DANGER, transparent: true, opacity: 0.85 });
        for (let i = 0; i < 4; i++) {
          for (let j = i + 1; j < 4; j++) {
            const lineGeo = new THREE.BufferGeometry().setFromPoints([nodes[i].pos, nodes[j].pos]);
            const line = new THREE.Line(lineGeo, lineMatRed);
            root.add(line);
          }
        }

        // Liên kết xanh cyan mảnh nhẹ tới SEA003 (Tương quan < 0.1: Đa dạng hoá thật)
        const lineMatCyan = new THREE.LineDashedMaterial({ color: ACCENT, dashSize: 0.15, gapSize: 0.1, transparent: true, opacity: 0.45 });
        for (let i = 0; i < 4; i++) {
          const lineGeo = new THREE.BufferGeometry().setFromPoints([nodes[i].pos, nodes[4].pos]);
          const line = new THREE.Line(lineGeo, lineMatCyan);
          line.computeLineDistances();
          root.add(line);
        }

        const noteLabel = labelSprite('CỤM ĐỎ: TRÙNG LẶP >85% · SEA003: ĐỘC LẬP ρ < 0.1', '#2BFFEA', 'rgba(4,22,34,0.9)', 'rgba(43,255,234,0.4)');
        noteLabel.position.set(0, -1.6, 0);
        root.add(noteLabel);

        return (t) => {
          root.rotation.y = t * 0.2;
          root.rotation.x = Math.sin(t * 0.3) * 0.15;
        };
      },
      { fov: 40, pos: [0, 1.2, 7.2], look: [0, 0, 0] }
    );
  }, []);

  return <div ref={ref} className={`relative h-56 w-full overflow-hidden ${className}`} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. HS-04: CalendarSeasonality3DScene (Vòng Tròn Hoàng Đạo / Bánh Xe Lịch SEA003)
// ─────────────────────────────────────────────────────────────────────────────
export function CalendarSeasonality3DScene({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = ref.current;
    if (!mount) return;

    return startMiniScene(
      mount,
      (scene): Frame => {
        const root = new THREE.Group();
        scene.add(root);

        // Vành đĩa lịch 12 tháng xoay trong không gian 3D
        const dialGeo = new THREE.TorusGeometry(2.2, 0.15, 16, 64);
        const dialMesh = new THREE.Mesh(dialGeo, glassMaterial(CYAN, 0.3));
        dialMesh.add(new THREE.Mesh(dialGeo, rimMaterial(CYAN, 1.3)));
        root.add(dialMesh);

        // Cung Mua: 2 ngày cuối tháng (T-2, T-1) - Phát sáng Xanh Cyan rực rỡ
        const buyArcGeo = new THREE.TorusGeometry(2.2, 0.22, 16, 32, Math.PI / 4);
        const buyArcMat = new THREE.MeshStandardMaterial({ color: ACCENT, emissive: ACCENT, emissiveIntensity: 1.2 });
        const buyArc = new THREE.Mesh(buyArcGeo, buyArcMat);
        buyArc.rotation.z = Math.PI * 0.85;
        buyArc.add(glow(ACCENT, 1.6, 0.7));
        root.add(buyArc);

        const buyLabel = labelSprite('T-2 & T-1: VÙNG MUA', '#2BFFEA', 'rgba(4,30,40,0.9)', 'rgba(43,255,234,0.6)');
        buyLabel.position.set(-2.0, 1.7, 0);
        root.add(buyLabel);

        // Cung Bán: Ngày thứ 3 của tháng mới (T+3) - Phát sáng Vàng Hổ Phách
        const sellArcGeo = new THREE.TorusGeometry(2.2, 0.22, 16, 32, Math.PI / 4);
        const sellArcMat = new THREE.MeshStandardMaterial({ color: AMBER, emissive: AMBER, emissiveIntensity: 1.2 });
        const sellArc = new THREE.Mesh(sellArcGeo, sellArcMat);
        sellArc.rotation.z = Math.PI * 1.35;
        sellArc.add(glow(AMBER, 1.6, 0.7));
        root.add(sellArc);

        const sellLabel = labelSprite('T+3: VÙNG BÁN', '#ffaa00', 'rgba(40,25,4,0.9)', 'rgba(255,170,0,0.6)');
        sellLabel.position.set(-2.0, -1.7, 0);
        root.add(sellLabel);

        // Con tàu thăm dò thiên văn di chuyển trên quỹ đạo chu kỳ tháng
        const probeGeo = new THREE.ConeGeometry(0.2, 0.5, 5);
        probeGeo.rotateZ(-Math.PI / 2);
        const probeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const probe = new THREE.Mesh(probeGeo, probeMat);
        probe.add(glow(0xffffff, 1.2, 0.8));
        root.add(probe);

        return (t) => {
          root.rotation.x = 0.45;
          root.rotation.y = Math.sin(t * 0.2) * 0.3;

          // Probe di chuyển theo vòng tròn thời gian
          const angle = t * 0.9;
          probe.position.set(Math.cos(angle) * 2.2, Math.sin(angle) * 2.2, 0);
          probe.rotation.z = angle + Math.PI / 2;
        };
      },
      { fov: 42, pos: [0, 0.5, 6.8], look: [0, 0, 0] }
    );
  }, []);

  return <div ref={ref} className={`relative h-56 w-full overflow-hidden ${className}`} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. HS-05: LookaheadShield3DScene (Tường Lửa Thời Gian & Khiên Chắn shift(1))
// ─────────────────────────────────────────────────────────────────────────────
export function LookaheadShield3DScene({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = ref.current;
    if (!mount) return;

    return startMiniScene(
      mount,
      (scene): Frame => {
        const root = new THREE.Group();
        scene.add(root);

        // 1. Trục thời gian 3D
        const axisGeo = new THREE.CylinderGeometry(0.04, 0.04, 6.5);
        axisGeo.rotateZ(Math.PI / 2);
        const axisMesh = new THREE.Mesh(axisGeo, new THREE.MeshBasicMaterial({ color: 0x00486b }));
        root.add(axisMesh);

        // 2. Tấm khiên tường lửa kính chặn giữa t và t+1
        const shieldGeo = new THREE.BoxGeometry(0.12, 2.8, 3.2);
        const shieldMesh = new THREE.Mesh(shieldGeo, glassMaterial(CYAN, 0.35));
        shieldMesh.add(new THREE.Mesh(shieldGeo, rimMaterial(CYAN, 2.0)));
        shieldMesh.add(glow(CYAN, 2.8, 0.5));
        shieldMesh.position.set(0, 0.2, 0);
        root.add(shieldMesh);

        const shieldLabel = labelSprite('TƯỜNG LỬA POINT-IN-TIME [SHIFT(1)]', '#3df2ff', 'rgba(4,25,38,0.95)', 'rgba(61,242,255,0.6)');
        shieldLabel.position.set(0, 1.9, 0);
        root.add(shieldLabel);

        // Quá khứ / Hiện tại (Bên trái: t-1, t)
        const pastLabel = labelSprite('QUÁ KHỨ (t) · DỮ LIỆU ĐÃ ĐÓNG NẾN', '#2BFFEA', 'rgba(4,25,20,0.85)', 'rgba(43,255,234,0.4)');
        pastLabel.position.set(-2.2, -1.5, 0);
        root.add(pastLabel);

        // Tương lai (Bên phải: t+1)
        const futureLabel = labelSprite('TƯƠNG LAI (t+1) · KHÔNG ĐƯỢC NHÌN TRƯỚC', '#ffaa00', 'rgba(35,20,4,0.85)', 'rgba(255,170,0,0.4)');
        futureLabel.position.set(2.2, -1.5, 0);
        root.add(futureLabel);

        // Tia laser rò rỉ dữ liệu cố gắng xuyên qua từ tương lai (t+1 -> t) và bị dội ngược tóe lửa
        const leakCount = 8;
        const sparkGeo = new THREE.SphereGeometry(0.08, 6, 6);
        const sparkMat = new THREE.MeshBasicMaterial({ color: DANGER });
        const sparks: { mesh: THREE.Mesh; seed: number }[] = [];

        for (let i = 0; i < leakCount; i++) {
          const m = new THREE.Mesh(sparkGeo, sparkMat);
          root.add(m);
          sparks.push({ mesh: m, seed: Math.random() * Math.PI * 2 });
        }

        return (t) => {
          root.rotation.y = Math.sin(t * 0.3) * 0.25 + 0.2;

          sparks.forEach((s, idx) => {
            const prog = (t * 1.6 + idx * 0.25) % 1;
            // Di chuyển từ +2.8 về 0 (tấm khiên)
            const x = 2.8 - prog * 2.8;
            s.mesh.position.set(x, Math.sin(s.seed) * 0.8, Math.cos(s.seed) * 1.0);

            // Khi chạm tấm khiên (x < 0.2) thì tóe xung quanh
            if (x < 0.2) {
              s.mesh.scale.setScalar(1.8);
              s.mesh.position.y += (Math.random() - 0.5) * 0.2;
            } else {
              s.mesh.scale.setScalar(0.9);
            }
          });
        };
      },
      { fov: 42, pos: [0, 1.4, 7.4], look: [0, 0, 0] }
    );
  }, []);

  return <div ref={ref} className={`relative h-56 w-full overflow-hidden ${className}`} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. HS-06: WalkForward3DScene (Khối Đoàn Tàu Trượt In-Sample & Embargo 3D)
// ─────────────────────────────────────────────────────────────────────────────
export function WalkForward3DScene({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = ref.current;
    if (!mount) return;

    return startMiniScene(
      mount,
      (scene): Frame => {
        const root = new THREE.Group();
        scene.add(root);

        // Ray trượt thời gian
        const railGeo = new THREE.BoxGeometry(7, 0.08, 0.6);
        const railMesh = new THREE.Mesh(railGeo, new THREE.MeshBasicMaterial({ color: 0x00486b, wireframe: true }));
        railMesh.position.y = -0.6;
        root.add(railMesh);

        // Khối đoàn tàu trượt gồm 3 module
        const train = new THREE.Group();
        root.add(train);

        // 1. Khối Huấn Luyện (In-Sample Glass Block - Xanh Dương Kính)
        const isGeo = new THREE.BoxGeometry(2.4, 0.8, 1.2);
        const isMesh = new THREE.Mesh(isGeo, glassMaterial(0x38bdf8, 0.3));
        isMesh.add(new THREE.Mesh(isGeo, rimMaterial(0x38bdf8, 1.4)));
        isMesh.position.set(-1.8, 0, 0);
        train.add(isMesh);

        const isLabel = labelSprite('IN-SAMPLE (ÔN BÀI)', '#38bdf8', 'rgba(10,25,45,0.9)', 'rgba(56,189,248,0.5)', 20);
        isLabel.position.set(-1.8, 0.75, 0);
        train.add(isLabel);

        // 2. Vùng Đệm Cách Ly (Embargo / Purge Gap - Đỏ Cảnh Báo)
        const embargoGeo = new THREE.BoxGeometry(0.5, 0.8, 1.2);
        const embargoMesh = new THREE.Mesh(embargoGeo, glassMaterial(DANGER, 0.4));
        embargoMesh.add(new THREE.Mesh(embargoGeo, rimMaterial(DANGER, 1.8)));
        embargoMesh.position.set(-0.25, 0, 0);
        train.add(embargoMesh);

        const embargoLabel = labelSprite('EMBARGO', '#ff5a6a', 'rgba(40,10,18,0.9)', 'rgba(255,90,106,0.5)', 18);
        embargoLabel.position.set(-0.25, 0.75, 0);
        train.add(embargoLabel);

        // 3. Khối Kiểm Tra Mới (Out-of-Sample Test Block - Xanh Ngọc Lục Bảo)
        const oosGeo = new THREE.BoxGeometry(1.4, 0.8, 1.2);
        const oosMesh = new THREE.Mesh(oosGeo, glassMaterial(ACCENT, 0.35));
        oosMesh.add(new THREE.Mesh(oosGeo, rimMaterial(ACCENT, 1.6)));
        oosMesh.position.set(0.85, 0, 0);
        train.add(oosMesh);

        const oosLabel = labelSprite('OOS (THI THẬT)', '#2BFFEA', 'rgba(4,30,24,0.9)', 'rgba(43,255,234,0.5)', 20);
        oosLabel.position.set(0.85, 0.75, 0);
        train.add(oosLabel);

        const cycleLabel = labelSprite('BẢN ĐỒ LĂN TIẾP XÚC (WALK-FORWARD ROLLING ANCHOR)', '#2BFFEA', 'rgba(4,22,34,0.9)', 'rgba(43,255,234,0.4)');
        cycleLabel.position.set(0, -1.4, 0);
        root.add(cycleLabel);

        return (t) => {
          root.rotation.y = Math.sin(t * 0.25) * 0.25;

          // Đoàn tàu trượt bước tiến từng chu kỳ
          const cycle = (t * 0.6) % 3.5;
          train.position.x = -1.2 + cycle * 0.8;
        };
      },
      { fov: 42, pos: [0, 1.5, 7.5], look: [0, 0, 0] }
    );
  }, []);

  return <div ref={ref} className={`relative h-56 w-full overflow-hidden ${className}`} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. HS-07: KillSwitch3DScene (Bộ Ngắt Mạch Công Nghiệp Hexagonal Circuit Breaker)
// ─────────────────────────────────────────────────────────────────────────────
export function KillSwitch3DScene({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = ref.current;
    if (!mount) return;

    return startMiniScene(
      mount,
      (scene): Frame => {
        const root = new THREE.Group();
        scene.add(root);

        // Lõi năng lượng lục giác ở tâm
        const coreGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.6, 6);
        const coreMat = new THREE.MeshStandardMaterial({ color: ACCENT, emissive: ACCENT, emissiveIntensity: 0.9 });
        const core = new THREE.Mesh(coreGeo, coreMat);
        core.add(glow(ACCENT, 2.0, 0.6));
        root.add(core);

        // 3 Vành gimbal cơ khí bảo vệ xoay quanh các trục
        const gimbals: THREE.Mesh[] = [];
        const gimbalRadii = [1.3, 1.7, 2.1];

        gimbalRadii.forEach((r, idx) => {
          const gGeo = new THREE.TorusGeometry(r, 0.08, 12, 48);
          const gMesh = new THREE.Mesh(gGeo, new THREE.MeshBasicMaterial({ color: idx === 2 ? AMBER : CYAN, wireframe: true }));
          root.add(gMesh);
          gimbals.push(gMesh);
        });

        // 4 Chốt ngắt thủy lực (Hydraulic Locking Pins)
        const pins: THREE.Mesh[] = [];
        const pinGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.2);

        for (let i = 0; i < 4; i++) {
          const pin = new THREE.Mesh(pinGeo, new THREE.MeshBasicMaterial({ color: DANGER }));
          const a = (i / 4) * Math.PI * 2;
          pin.position.set(Math.cos(a) * 2.2, Math.sin(a) * 2.2, 0);
          pin.rotation.z = a + Math.PI / 2;
          root.add(pin);
          pins.push(pin);
        }

        const stateLabel = labelSprite('KILL-SWITCH: TỰ ĐỘNG KHÓA KHI CHUỖI THUA CHẠM NGƯỠNG', '#ffaa00', 'rgba(35,20,4,0.95)', 'rgba(255,170,0,0.6)');
        stateLabel.position.set(0, 1.8, 0);
        root.add(stateLabel);

        return (t) => {
          root.rotation.y = t * 0.2;

          // Xoay các vành gimbal cơ khí
          gimbals[0].rotation.x = t * 1.2;
          gimbals[1].rotation.y = t * 0.9;
          gimbals[2].rotation.z = t * 0.6;

          // Chốt thủy lực co giãn khóa chặt lõi khi quá tải
          const clamp = Math.abs(Math.sin(t * 1.5));
          pins.forEach((p, idx) => {
            const a = (idx / 4) * Math.PI * 2;
            const dist = 2.2 - clamp * 0.7; // Kẹp vào tâm
            p.position.set(Math.cos(a) * dist, Math.sin(a) * dist, 0);
          });

          // Lõi đổi màu cảnh báo từ xanh sang hổ phách/đỏ khi kẹp
          if (clamp > 0.6) {
            coreMat.color.setHex(DANGER);
            coreMat.emissive.setHex(DANGER);
          } else {
            coreMat.color.setHex(ACCENT);
            coreMat.emissive.setHex(ACCENT);
          }
        };
      },
      { fov: 42, pos: [0, 0.8, 6.8], look: [0, 0, 0] }
    );
  }, []);

  return <div ref={ref} className={`relative h-56 w-full overflow-hidden ${className}`} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. HS-08: OrderBookMicro3DScene (Bậc Thang Sổ Lệnh Chiều Sâu & Trượt Giá Slippage)
// ─────────────────────────────────────────────────────────────────────────────
export function OrderBookMicro3DScene({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = ref.current;
    if (!mount) return;

    return startMiniScene(
      mount,
      (scene): Frame => {
        const root = new THREE.Group();
        scene.add(root);

        // Bậc thang Bid (Xanh Ngọc) ở bên trái
        const bidSteps: THREE.Mesh[] = [];
        const stepWidth = 0.55;

        for (let i = 0; i < 5; i++) {
          const h = (i + 1) * 0.35;
          const geo = new THREE.BoxGeometry(stepWidth, h, 1.8);
          const mesh = new THREE.Mesh(geo, glassMaterial(EMERALD, 0.35));
          mesh.add(new THREE.Mesh(geo, rimMaterial(EMERALD, 1.4)));
          mesh.position.set(-0.6 - i * (stepWidth + 0.08), -1.0 + h / 2, 0);
          root.add(mesh);
          bidSteps.push(mesh);
        }

        const bidLabel = labelSprite('BID QUEUE (CHỜ MUA)', '#10b981', 'rgba(4,30,20,0.9)', 'rgba(16,185,129,0.5)', 20);
        bidLabel.position.set(-1.8, 1.4, 0);
        root.add(bidLabel);

        // Bậc thang Ask (Đỏ Hồng) ở bên phải
        const askSteps: THREE.Mesh[] = [];
        for (let i = 0; i < 5; i++) {
          const h = (i + 1) * 0.35;
          const geo = new THREE.BoxGeometry(stepWidth, h, 1.8);
          const mesh = new THREE.Mesh(geo, glassMaterial(DANGER, 0.35));
          mesh.add(new THREE.Mesh(geo, rimMaterial(DANGER, 1.4)));
          mesh.position.set(0.6 + i * (stepWidth + 0.08), -1.0 + h / 2, 0);
          root.add(mesh);
          askSteps.push(mesh);
        }

        const askLabel = labelSprite('ASK QUEUE (CHỜ BÁN)', '#ff5a6a', 'rgba(40,10,18,0.9)', 'rgba(255,90,106,0.5)', 20);
        askLabel.position.set(1.8, 1.4, 0);
        root.add(askLabel);

        // Khe Spread ở giữa với khối lệnh thị trường (Market Order Cube) rơi xuống gây trượt giá
        const orderCubeGeo = new THREE.BoxGeometry(0.45, 0.45, 0.45);
        const orderCubeMat = new THREE.MeshStandardMaterial({ color: AMBER, emissive: AMBER, emissiveIntensity: 1.0 });
        const orderCube = new THREE.Mesh(orderCubeGeo, orderCubeMat);
        orderCube.add(glow(AMBER, 1.4, 0.6));
        root.add(orderCube);

        const spreadLabel = labelSprite('SPREAD & SLIPPAGE (TRƯỢT GIÁ THỰC TẾ)', '#ffaa00', 'rgba(35,20,4,0.95)', 'rgba(255,170,0,0.6)', 18);
        spreadLabel.position.set(0, -1.6, 0);
        root.add(spreadLabel);

        return (t) => {
          root.rotation.y = Math.sin(t * 0.3) * 0.3;
          root.rotation.x = 0.2;

          // Khối lệnh thị trường rơi xuống ăn xuyên các tầng thanh khoản
          const prog = (t * 0.8) % 1;
          orderCube.position.y = 1.6 - prog * 2.4;
          orderCube.rotation.x = t * 2;
          orderCube.rotation.y = t * 3;
        };
      },
      { fov: 42, pos: [0, 1.4, 7.2], look: [0, -0.1, 0] }
    );
  }, []);

  return <div ref={ref} className={`relative h-56 w-full overflow-hidden ${className}`} />;
}

