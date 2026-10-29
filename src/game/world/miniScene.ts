/**
 * Khung dựng cảnh 3D nhỏ nhúng trong trang (nền trong suốt, máy quay phối cảnh).
 * Chỉ chạy vòng vẽ khi cảnh đang nằm trong khung nhìn; máy bật giảm chuyển động thì vẽ một khung rồi dừng.
 */
import * as THREE from 'three';

export type Frame = (t: number, dt: number) => void;

export function startMiniScene(
  mount: HTMLElement,
  build: (scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) => Frame,
  /** fitWidth: bề ngang (đơn vị cảnh) luôn phải lọt khung; màn hẹp thì lùi máy quay ra xa */
  opts: { fov?: number; pos?: [number, number, number]; look?: [number, number, number]; fitWidth?: number } = {},
) {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch {
    return () => undefined;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.setSize(mount.clientWidth, mount.clientHeight);
  mount.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(opts.fov ?? 40, mount.clientWidth / mount.clientHeight, 0.1, 100);
  const look = new THREE.Vector3(...(opts.look ?? [0, 0.5, 0]));
  const base = new THREE.Vector3(...(opts.pos ?? [0, 2, 11]));
  const place = () => {
    const dir = base.clone().sub(look);
    let dist = dir.length();
    if (opts.fitWidth) {
      const half = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect;
      dist = Math.max(dist, opts.fitWidth / 2 / half);
    }
    camera.position.copy(look).addScaledVector(dir.normalize(), dist);
    camera.lookAt(look);
  };
  place();
  scene.add(new THREE.HemisphereLight(0x9fe9ff, 0x0a1020, 0.9));
  const key = new THREE.DirectionalLight(0xfff4e6, 1.4);
  key.position.set(4, 8, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x3df2ff, 1.1);
  rim.position.set(-6, 3, -6);
  scene.add(rim);

  const frame = build(scene, camera, renderer);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clock = new THREE.Clock();
  let raf = 0;
  let visible = false;
  const loop = () => {
    raf = requestAnimationFrame(loop);
    const dt = Math.min(clock.getDelta(), 0.05);
    frame(clock.elapsedTime, dt);
    renderer.render(scene, camera);
  };
  const io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting === visible) return;
    visible = e.isIntersecting;
    if (visible && !reduce) {
      clock.getDelta();
      loop();
    } else cancelAnimationFrame(raf);
  });
  io.observe(mount);
  frame(reduce ? 30 : 0, 0);
  renderer.render(scene, camera);

  const onResize = () => {
    camera.aspect = mount.clientWidth / mount.clientHeight;
    camera.updateProjectionMatrix();
    place();
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.render(scene, camera);
  };
  window.addEventListener('resize', onResize);

  return () => {
    cancelAnimationFrame(raf);
    io.disconnect();
    window.removeEventListener('resize', onResize);
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      mesh.geometry?.dispose();
      const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
      (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((m) => {
        (m as THREE.MeshBasicMaterial).map?.dispose();
        m.dispose();
      });
    });
    scene.environment?.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  };
}
