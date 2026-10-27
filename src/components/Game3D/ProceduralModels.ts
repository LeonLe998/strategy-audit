/**
 * Procedural 3D Model Generators for Data Science, Mathematics & Quantitative Finance
 * Creates rich, high-fidelity 3D mathematical surfaces, chaotic attractors, and financial geometries.
 */

import * as THREE from 'three';

export interface Procedural3DObject extends THREE.Group {
  updateAnimation?: (delta: number, elapsed: number) => void;
}

/**
 * 1. 3D Gaussian Normal Distribution Surface (Mặt cong Chuẩn Gauss 3D)
 * Visualizes probability density function f(x, y) = A * exp(-(x^2 + y^2) / (2 * sigma^2))
 * with color gradient from deep cyan at tails to vibrant neon-green at peak.
 */
export function createGaussianSurface(size = 8, segments = 40): Procedural3DObject {
  const group = new THREE.Group() as Procedural3DObject;
  const geo = new THREE.PlaneGeometry(size, size, segments, segments);
  geo.rotateX(-Math.PI / 2);

  const pos = geo.attributes.position;
  const count = pos.count;
  const colors = new Float32Array(count * 3);

  const sigma = 1.8;
  const amplitude = 3.2;

  // Base colors: cyan (0.02, 0.7, 0.95) to neon-green (0.0, 1.0, 0.64)
  for (let i = 0; i < count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const rSq = x * x + z * z;
    const y = amplitude * Math.exp(-rSq / (2 * sigma * sigma));
    pos.setY(i, y);

    const t = THREE.MathUtils.clamp(y / amplitude, 0, 1);
    colors[i * 3] = THREE.MathUtils.lerp(0.02, 0.0, t);
    colors[i * 3 + 1] = THREE.MathUtils.lerp(0.71, 1.0, t);
    colors[i * 3 + 2] = THREE.MathUtils.lerp(0.95, 0.64, t);
  }

  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();

  // Solid shaded surface
  const mat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.25,
    metalness: 0.6,
    side: THREE.DoubleSide,
    wireframe: false
  });
  const mesh = new THREE.Mesh(geo, mat);
  group.add(mesh);

  // Wireframe grid contour overlay
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0x00ffa3,
    wireframe: true,
    transparent: true,
    opacity: 0.35
  });
  const wireMesh = new THREE.Mesh(geo, wireMat);
  wireMesh.position.y = 0.02;
  group.add(wireMesh);

  // Mean center indicator line
  const meanLineGeo = new THREE.CylinderGeometry(0.04, 0.04, amplitude + 0.8, 8);
  const meanLineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const meanLine = new THREE.Mesh(meanLineGeo, meanLineMat);
  meanLine.position.set(0, amplitude / 2, 0);
  group.add(meanLine);

  group.updateAnimation = (_delta: number, elapsed: number) => {
    group.rotation.y = elapsed * 0.35;
    const pulse = 1 + Math.sin(elapsed * 2.0) * 0.08;
    mesh.scale.set(1, pulse, 1);
    wireMesh.scale.set(1, pulse, 1);
  };

  return group;
}

/**
 * 2. 3D Lorenz Strange Attractor (Hệ Hỗn mang Lorenz 3D - Chaos Theory)
 * dx/dt = sigma*(y - x)
 * dy/dt = x*(rho - z) - y
 * dz/dt = x*y - beta*z
 * Iconic mathematical attractor showing non-linear market dynamics & fat-tailed distributions.
 */
export function createLorenzAttractor(pointsCount = 2400): Procedural3DObject {
  const group = new THREE.Group() as Procedural3DObject;

  const sigma = 10;
  const rho = 28;
  const beta = 8 / 3;
  const dt = 0.009;

  let x = 0.1;
  let y = 0.0;
  let z = 0.0;

  const positions = new Float32Array(pointsCount * 3);
  const colors = new Float32Array(pointsCount * 3);

  for (let i = 0; i < pointsCount; i++) {
    const dx = sigma * (y - x) * dt;
    const dy = (x * (rho - z) - y) * dt;
    const dz = (x * y - beta * z) * dt;

    x += dx;
    y += dy;
    z += dz;

    // Scale and center around origin
    positions[i * 3] = x * 0.16;
    positions[i * 3 + 1] = (z - 25) * 0.16;
    positions[i * 3 + 2] = y * 0.16;

    // Color gradient based on progression through attractor loops
    const progress = i / pointsCount;
    colors[i * 3] = Math.sin(progress * Math.PI) * 0.8 + 0.1; // Red
    colors[i * 3 + 1] = progress * 0.8 + 0.2; // Green
    colors[i * 3 + 2] = (1 - progress) * 0.9 + 0.1; // Blue
  }

  const curveGeo = new THREE.BufferGeometry();
  curveGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  curveGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const lineMat = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.9
  });

  const line = new THREE.Line(curveGeo, lineMat);
  group.add(line);

  // Glowing focal points (Equilibrium states)
  const sphereGeo = new THREE.SphereGeometry(0.2, 16, 16);
  const sphereMat = new THREE.MeshStandardMaterial({
    color: 0x00ffa3,
    emissive: 0x00ffa3,
    emissiveIntensity: 0.9
  });
  const focus1 = new THREE.Mesh(sphereGeo, sphereMat);
  const c = Math.sqrt(beta * (rho - 1));
  focus1.position.set(c * 0.16, 0, c * 0.16);
  group.add(focus1);

  const focus2 = new THREE.Mesh(sphereGeo, sphereMat);
  focus2.position.set(-c * 0.16, 0, -c * 0.16);
  group.add(focus2);

  group.updateAnimation = (_delta: number, elapsed: number) => {
    group.rotation.y = elapsed * 0.45;
    group.rotation.x = Math.sin(elapsed * 0.3) * 0.15;
  };

  return group;
}

/**
 * 3. 3D Volatility Surface & Smile (Mặt cong Biến động Black-Scholes)
 * Represents Implied Volatility across Strike Price (Moneyness) & Time-to-Maturity.
 */
export function createVolatilitySurface(size = 8, segments = 32): Procedural3DObject {
  const group = new THREE.Group() as Procedural3DObject;
  const geo = new THREE.PlaneGeometry(size, size, segments, segments);
  geo.rotateX(-Math.PI / 2);

  const pos = geo.attributes.position;
  const count = pos.count;
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const strike = pos.getX(i); // X: Strike (-size/2 to size/2)
    const maturity = pos.getZ(i); // Z: Maturity (-size/2 to size/2)

    // Volatility smile: U-shape across strike, upward slope across time
    const smile = 0.15 * (strike * strike) * 0.1;
    const termStructure = 0.2 * (maturity + size / 2) * 0.3;
    const iv = smile + termStructure + 0.3;

    pos.setY(i, iv);

    const t = THREE.MathUtils.clamp(iv / 2.5, 0, 1);
    colors[i * 3] = THREE.MathUtils.lerp(0.04, 0.9, t);
    colors[i * 3 + 1] = THREE.MathUtils.lerp(0.8, 0.2, t);
    colors[i * 3 + 2] = THREE.MathUtils.lerp(0.9, 0.4, t);
  }

  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();

  const mat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.3,
    metalness: 0.7,
    side: THREE.DoubleSide
  });
  const mesh = new THREE.Mesh(geo, mat);
  group.add(mesh);

  const wireMat = new THREE.MeshBasicMaterial({
    color: 0x4cd7f6,
    wireframe: true,
    transparent: true,
    opacity: 0.4
  });
  const wire = new THREE.Mesh(geo, wireMat);
  wire.position.y = 0.02;
  group.add(wire);

  group.updateAnimation = (_delta: number, elapsed: number) => {
    group.rotation.y = elapsed * 0.3;
  };

  return group;
}

/**
 * 4. Cyber Exploration Drone Avatar
 * Futuristic exploratory probe with headlights, thrusters, and shield ring
 */
export function createCyberDrone(): Procedural3DObject {
  const group = new THREE.Group() as Procedural3DObject;

  // Main chassis (sleek aerodynamic diamond)
  const chassisGeo = new THREE.OctahedronGeometry(0.9, 0);
  chassisGeo.scale(1.2, 0.5, 1.4);
  const chassisMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.1,
    metalness: 0.9
  });
  const chassis = new THREE.Mesh(chassisGeo, chassisMat);
  group.add(chassis);

  // Glowing center visor / core
  const coreGeo = new THREE.SphereGeometry(0.35, 16, 16);
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0x00ffa3,
    emissive: 0x00ffa3,
    emissiveIntensity: 1.2,
    roughness: 0.1
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  core.position.set(0, 0.05, 0.4);
  group.add(core);

  // Thruster rings (left & right)
  const ringGeo = new THREE.TorusGeometry(0.35, 0.06, 8, 24);
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0x06b6d4,
    emissive: 0x06b6d4,
    emissiveIntensity: 0.8
  });

  const thrusterL = new THREE.Mesh(ringGeo, ringMat);
  thrusterL.position.set(-1.1, -0.1, -0.3);
  thrusterL.rotation.x = Math.PI / 2;
  group.add(thrusterL);

  const thrusterR = new THREE.Mesh(ringGeo, ringMat);
  thrusterR.position.set(1.1, -0.1, -0.3);
  thrusterR.rotation.x = Math.PI / 2;
  group.add(thrusterR);

  // Thruster plume particles / glow
  const plumeGeo = new THREE.ConeGeometry(0.2, 0.6, 8);
  plumeGeo.rotateX(Math.PI);
  const plumeMat = new THREE.MeshBasicMaterial({
    color: 0x00ffa3,
    transparent: true,
    opacity: 0.8
  });
  const plumeL = new THREE.Mesh(plumeGeo, plumeMat);
  plumeL.position.set(-1.1, -0.4, -0.3);
  group.add(plumeL);

  const plumeR = new THREE.Mesh(plumeGeo, plumeMat);
  plumeR.position.set(1.1, -0.4, -0.3);
  group.add(plumeR);

  // Directional headlight beam
  const light = new THREE.SpotLight(0x00ffa3, 2.5, 15, Math.PI / 6, 0.4);
  light.position.set(0, 0, 0.6);
  light.target.position.set(0, -0.2, 5);
  group.add(light);
  group.add(light.target);

  group.updateAnimation = (_delta: number, elapsed: number) => {
    // Gentle hovering bob & tilt
    group.position.y = Math.sin(elapsed * 3) * 0.12;
    plumeL.scale.y = 0.8 + Math.sin(elapsed * 15) * 0.3;
    plumeR.scale.y = 0.8 + Math.cos(elapsed * 15) * 0.3;
  };

  return group;
}

/**
 * 5. Quantum Strategy Core / Vault (Lõi Đa diện Định lượng 300 Chiến lược)
 */
export function createQuantumVaultCore(): Procedural3DObject {
  const group = new THREE.Group() as Procedural3DObject;

  // Outer Icosahedron Wireframe
  const outerGeo = new THREE.IcosahedronGeometry(2.2, 1);
  const outerMat = new THREE.MeshStandardMaterial({
    color: 0x8b5cf6,
    wireframe: true,
    emissive: 0x8b5cf6,
    emissiveIntensity: 0.4
  });
  const outer = new THREE.Mesh(outerGeo, outerMat);
  group.add(outer);

  // Inner Dodecahedron Solid
  const innerGeo = new THREE.DodecahedronGeometry(1.4, 0);
  const innerMat = new THREE.MeshStandardMaterial({
    color: 0x07131e,
    roughness: 0.2,
    metalness: 0.9,
    emissive: 0x00ffa3,
    emissiveIntensity: 0.3
  });
  const inner = new THREE.Mesh(innerGeo, innerMat);
  group.add(inner);

  // Center glowing energy spark
  const sparkGeo = new THREE.SphereGeometry(0.6, 16, 16);
  const sparkMat = new THREE.MeshBasicMaterial({
    color: 0x00ffa3,
    wireframe: true
  });
  const spark = new THREE.Mesh(sparkGeo, sparkMat);
  group.add(spark);

  group.updateAnimation = (_delta: number, elapsed: number) => {
    outer.rotation.x = elapsed * 0.3;
    outer.rotation.y = elapsed * 0.5;
    inner.rotation.x = -elapsed * 0.4;
    inner.rotation.z = elapsed * 0.6;
    spark.scale.setScalar(1 + Math.sin(elapsed * 4) * 0.18);
  };

  return group;
}

/**
 * 6. 3D Candlestick & Order Book Matrix
 */
export function create3DCandlestickMatrix(): Procedural3DObject {
  const group = new THREE.Group() as Procedural3DObject;
  const count = 12;

  const greenMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    emissive: 0x10b981,
    emissiveIntensity: 0.4,
    roughness: 0.3
  });
  const redMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: 0xef4444,
    emissiveIntensity: 0.4,
    roughness: 0.3
  });
  const wickGeo = new THREE.CylinderGeometry(0.04, 0.04, 3, 6);

  let currentPrice = 0;

  for (let i = 0; i < count; i++) {
    const isUp = Math.random() > 0.4;
    const bodyHeight = 0.6 + Math.random() * 1.2;
    const delta = isUp ? bodyHeight * 0.6 : -bodyHeight * 0.6;
    currentPrice += delta;

    const bodyGeo = new THREE.BoxGeometry(0.5, bodyHeight, 0.5);
    const mat = isUp ? greenMat : redMat;
    const body = new THREE.Mesh(bodyGeo, mat);

    const x = (i - count / 2) * 1.1;
    const y = currentPrice;
    body.position.set(x, y, 0);
    group.add(body);

    const wick = new THREE.Mesh(wickGeo, mat);
    wick.position.set(x, y, 0);
    wick.scale.y = 1 + Math.random() * 0.5;
    group.add(wick);
  }

  group.updateAnimation = (_delta: number, elapsed: number) => {
    group.rotation.y = Math.sin(elapsed * 0.3) * 0.25;
  };

  return group;
}

/**
 * 7. Procedural DNA Double Helix (Optional Bio-Structural Model)
 */
export function createDNAHelix(length = 24, radius = 2.2, turns = 3): Procedural3DObject {
  const group = new THREE.Group() as Procedural3DObject;
  const numSteps = 70;

  const strandMat1 = new THREE.MeshStandardMaterial({
    color: 0x00ffa3,
    emissive: 0x00ffa3,
    emissiveIntensity: 0.4,
    roughness: 0.2,
    metalness: 0.8
  });

  const strandMat2 = new THREE.MeshStandardMaterial({
    color: 0x06b6d4,
    emissive: 0x06b6d4,
    emissiveIntensity: 0.4,
    roughness: 0.2,
    metalness: 0.8
  });

  const baseMaterials = [
    new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 0.3 }),
    new THREE.MeshStandardMaterial({ color: 0x3b82f6, emissive: 0x3b82f6, emissiveIntensity: 0.3 }),
    new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 0.3 }),
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 0.3 })
  ];

  const sphereGeo = new THREE.SphereGeometry(0.24, 16, 16);
  const rungGeo = new THREE.CylinderGeometry(0.08, 0.08, radius * 2, 8);
  const rungsGroup = new THREE.Group();
  group.add(rungsGroup);

  for (let i = 0; i < numSteps; i++) {
    const t = i / numSteps;
    const angle = t * Math.PI * 2 * turns;
    const y = (t - 0.5) * length;

    const x1 = Math.cos(angle) * radius;
    const z1 = Math.sin(angle) * radius;
    const x2 = -x1;
    const z2 = -z1;

    const node1 = new THREE.Mesh(sphereGeo, strandMat1);
    node1.position.set(x1, y, z1);
    group.add(node1);

    const node2 = new THREE.Mesh(sphereGeo, strandMat2);
    node2.position.set(x2, y, z2);
    group.add(node2);

    if (i % 2 === 0) {
      const rungMat = baseMaterials[(i / 2) % baseMaterials.length];
      const rung = new THREE.Mesh(rungGeo, rungMat);
      rung.position.set(0, y, 0);
      rung.rotation.z = Math.PI / 2;
      rung.rotation.y = -angle;
      rungsGroup.add(rung);
    }
  }

  group.updateAnimation = (_delta: number, elapsed: number) => {
    group.rotation.y = elapsed * 0.5;
    group.position.y = Math.sin(elapsed * 1.2) * 0.4;
  };

  return group;
}

/**
 * 8. Procedural Protein Structure
 */
export function createAlphaFoldProtein(): Procedural3DObject {
  const group = new THREE.Group() as Procedural3DObject;
  const numAtoms = 48;
  const curvePoints: THREE.Vector3[] = [];

  for (let i = 0; i < 16; i++) {
    const phi = i * 0.6;
    const rad = 2.5 + Math.sin(i * 1.2) * 1.2;
    curvePoints.push(
      new THREE.Vector3(
        Math.cos(phi) * rad,
        (i - 8) * 0.5 + Math.sin(phi * 2) * 0.8,
        Math.sin(phi) * rad
      )
    );
  }

  const curve = new THREE.CatmullRomCurve3(curvePoints, true);
  const tubeGeo = new THREE.TubeGeometry(curve, 70, 0.22, 8, true);
  const ribbonMat = new THREE.MeshStandardMaterial({
    color: 0x0ea5e9,
    roughness: 0.3,
    metalness: 0.6,
    emissive: 0x0284c7,
    emissiveIntensity: 0.2
  });
  const ribbonMesh = new THREE.Mesh(tubeGeo, ribbonMat);
  group.add(ribbonMesh);

  const plddtColors = [0x1d4ed8, 0x0284c7, 0xf59e0b, 0xef4444];
  const sphereGeo = new THREE.SphereGeometry(0.35, 16, 16);

  for (let i = 0; i < numAtoms; i++) {
    const t = i / numAtoms;
    const pt = curve.getPoint(t);
    const offset = new THREE.Vector3(
      (Math.random() - 0.5) * 0.8,
      (Math.random() - 0.5) * 0.8,
      (Math.random() - 0.5) * 0.8
    );
    const color = plddtColors[Math.floor(Math.random() * plddtColors.length)];
    const mat = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.35,
      roughness: 0.2,
      metalness: 0.7
    });
    const atom = new THREE.Mesh(sphereGeo, mat);
    atom.position.copy(pt).add(offset);
    group.add(atom);
  }

  group.updateAnimation = (_delta: number, elapsed: number) => {
    group.rotation.x = Math.sin(elapsed * 0.4) * 0.3;
    group.rotation.y = elapsed * 0.4;
    group.rotation.z = Math.cos(elapsed * 0.3) * 0.2;
  };

  return group;
}
