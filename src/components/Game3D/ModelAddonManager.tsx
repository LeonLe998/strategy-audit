/**
 * 3D Model Add-on Manager
 * Enables adding, uploading (.glb, .gltf, .obj), previewing, and spawning 3D models into the Web Game arena.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import {
  Upload, X, Box, Eye, Sparkles, Check, RefreshCw, Cpu
} from 'lucide-react';
import {
  createGaussianSurface,
  createLorenzAttractor,
  createVolatilitySurface,
  createCyberDrone,
  createQuantumVaultCore,
  create3DCandlestickMatrix,
  type Procedural3DObject
} from './ProceduralModels';

export interface ModelAddonManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSpawnModelToWorld: (modelGroup: THREE.Group, metadata: { name: string; type: string }) => void;
}

export const ModelAddonManager: React.FC<ModelAddonManagerProps> = ({
  isOpen,
  onClose,
  onSpawnModelToWorld
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'upload'>('presets');
  const [selectedPreset, setSelectedPreset] = useState<string>('gauss');
  const [scale, setScale] = useState<number>(1.0);
  const [wireframe, setWireframe] = useState<boolean>(false);
  const [glowColor, setGlowColor] = useState<string>('#00ffa3');
  const [modelStats, setModelStats] = useState<{ vertices: number; faces: number; meshes: number }>({
    vertices: 0,
    faces: 0,
    meshes: 0
  });
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSpawning, setIsSpawning] = useState<boolean>(false);

  const previewMountRef = useRef<HTMLDivElement>(null);
  const currentModelRef = useRef<Procedural3DObject | THREE.Group | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Initialize preview 3D Canvas
  useEffect(() => {
    if (!isOpen || !previewMountRef.current) return;

    const width = previewMountRef.current.clientWidth;
    const height = previewMountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x061624);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 2, 7);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    previewMountRef.current.replaceChildren(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.8;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00ffa3, 1.8);
    dirLight1.position.set(5, 8, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x06b6d4, 1.2);
    dirLight2.position.set(-5, -4, -5);
    scene.add(dirLight2);

    // Grid helper
    const grid = new THREE.GridHelper(10, 10, 0x1f2937, 0x111827);
    grid.position.y = -2;
    scene.add(grid);

    // Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      controls.update();

      if (currentModelRef.current && (currentModelRef.current as Procedural3DObject).updateAnimation) {
        (currentModelRef.current as Procedural3DObject).updateAnimation!(delta, elapsed);
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      renderer.dispose();
    };
  }, [isOpen]);

  // Compute model stats (vertices, faces, meshes)
  const calculateStats = useCallback((group: THREE.Group) => {
    let vertices = 0;
    let faces = 0;
    let meshes = 0;

    group.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        meshes++;
        const mesh = child as THREE.Mesh;
        if (mesh.geometry) {
          const geo = mesh.geometry;
          if (geo.attributes.position) {
            vertices += geo.attributes.position.count;
          }
          if (geo.index) {
            faces += geo.index.count / 3;
          } else if (geo.attributes.position) {
            faces += geo.attributes.position.count / 3;
          }
        }
      }
    });

    setModelStats({
      vertices: Math.round(vertices),
      faces: Math.round(faces),
      meshes
    });
  }, []);

  // Load Preset 3D Model into Preview
  const loadPreset = useCallback(
    (key: string) => {
      if (!sceneRef.current) return;
      if (currentModelRef.current) {
        sceneRef.current.remove(currentModelRef.current);
      }

      let model: Procedural3DObject;
      switch (key) {
        case 'gauss':
          model = createGaussianSurface(7, 36);
          break;
        case 'lorenz':
          model = createLorenzAttractor(2600);
          break;
        case 'volatility':
          model = createVolatilitySurface(7, 28);
          break;
        case 'drone':
          model = createCyberDrone();
          break;
        case 'vault':
          model = createQuantumVaultCore();
          break;
        case 'candlestick':
          model = create3DCandlestickMatrix();
          break;
        default:
          model = createGaussianSurface();
      }

      model.scale.setScalar(scale);
      sceneRef.current.add(model);
      currentModelRef.current = model;
      calculateStats(model);
      setSelectedPreset(key);
      setUploadError(null);
    },
    [scale, calculateStats]
  );

  // Reload preset when tab opens or changes
  useEffect(() => {
    if (isOpen && activeTab === 'presets') {
      loadPreset(selectedPreset);
    }
  }, [isOpen, activeTab, selectedPreset, loadPreset]);

  // Handle custom 3D model file upload (.glb, .gltf, .obj)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !sceneRef.current) return;

    setUploadError(null);
    const fileName = file.name.toLowerCase();
    const url = URL.createObjectURL(file);

    if (currentModelRef.current) {
      sceneRef.current.remove(currentModelRef.current);
    }

    if (fileName.endsWith('.glb') || fileName.endsWith('.gltf')) {
      const loader = new GLTFLoader();
      loader.load(
        url,
        (gltf) => {
          const root = gltf.scene;
          // Auto center & scale
          const box = new THREE.Box3().setFromObject(root);
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const autoScale = 3 / (maxDim || 1);
          root.scale.setScalar(autoScale * scale);
          box.setFromObject(root);
          const center = box.getCenter(new THREE.Vector3());
          root.position.sub(center);

          sceneRef.current?.add(root);
          currentModelRef.current = root;
          calculateStats(root);
          URL.revokeObjectURL(url);
        },
        undefined,
        (err) => {
          setUploadError(`Lỗi tải GLTF/GLB: ${(err as Error).message || 'Không thể đọc tệp'}`);
          URL.revokeObjectURL(url);
        }
      );
    } else if (fileName.endsWith('.obj')) {
      const loader = new OBJLoader();
      loader.load(
        url,
        (obj) => {
          const box = new THREE.Box3().setFromObject(obj);
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const autoScale = 3 / (maxDim || 1);
          obj.scale.setScalar(autoScale * scale);
          box.setFromObject(obj);
          const center = box.getCenter(new THREE.Vector3());
          obj.position.sub(center);

          sceneRef.current?.add(obj);
          currentModelRef.current = obj;
          calculateStats(obj);
          URL.revokeObjectURL(url);
        },
        undefined,
        (err) => {
          setUploadError(`Lỗi tải OBJ: ${(err as Error).message || 'Không thể đọc tệp'}`);
          URL.revokeObjectURL(url);
        }
      );
    } else {
      setUploadError('Định dạng không được hỗ trợ. Vui lòng tải lên tệp .glb, .gltf hoặc .obj.');
      URL.revokeObjectURL(url);
    }
  };

  // Apply Wireframe toggle
  useEffect(() => {
    if (!currentModelRef.current) return;
    currentModelRef.current.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => {
            if ('wireframe' in m) (m as THREE.MeshStandardMaterial).wireframe = wireframe;
          });
        } else if (mesh.material && 'wireframe' in mesh.material) {
          (mesh.material as THREE.MeshStandardMaterial).wireframe = wireframe;
        }
      }
    });
  }, [wireframe]);

  // Apply Scale
  useEffect(() => {
    if (!currentModelRef.current) return;
    currentModelRef.current.scale.setScalar(scale);
  }, [scale]);

  // Spawn into active 3D World
  const handleSpawn = () => {
    if (!currentModelRef.current) return;
    setIsSpawning(true);

    // Clone the model to spawn
    const clone = currentModelRef.current.clone(true);
    const name = activeTab === 'presets' ? `Preset: ${selectedPreset.toUpperCase()}` : 'Custom 3D Model';
    onSpawnModelToWorld(clone, { name, type: activeTab });

    setTimeout(() => {
      setIsSpawning(false);
      onClose();
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-[#07131e] border border-[#20394b] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#20394b] bg-[#0a1a29]">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-neon-green/10 border border-neon-green/30 text-neon-green">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                3D Model Add-on Manager
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  WebGL Three.js
                </span>
              </h3>
              <p className="text-xs text-gray-400">
                Thêm, tải lên và đưa mô hình 3D vào không gian Game 3D Strategy Audit
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Grid: Left Controls / Right 3D Interactive View */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-y-auto">
          {/* Left Panel: Tabs & Controls */}
          <div className="md:col-span-6 p-6 border-b md:border-b-0 md:border-r border-[#20394b] space-y-5 bg-[#061624]">
            {/* Mode Tabs */}
            <div className="flex rounded-xl bg-[#0d1e2e] p-1 border border-[#1f2937]">
              <button
                onClick={() => setActiveTab('presets')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'presets'
                    ? 'bg-neon-green text-black shadow-lg font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Mô hình có sẵn (Presets)
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'upload'
                    ? 'bg-neon-green text-black shadow-lg font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Tải lên tệp 3D (.glb, .obj)
              </button>
            </div>

            {/* Tab 1: Presets Selection */}
            {activeTab === 'presets' ? (
              <div className="space-y-3">
                <label className="text-xs font-medium text-gray-300">Chọn mô hình toán học & dữ liệu 3D:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'gauss', label: '📐 Mặt cong Gauss 3D', desc: 'Hàm mật độ phân phối xác suất' },
                    { id: 'lorenz', label: '🦋 Lorenz Chaos Attractor', desc: 'Hệ hỗn mang phi tuyến tính' },
                    { id: 'volatility', label: '📈 Volatility Surface 3D', desc: 'Mặt cong biến động Black-Scholes' },
                    { id: 'vault', label: '🔮 Quantum Strategy Core', desc: 'Lõi đa diện 300 chiến lược' },
                    { id: 'drone', label: '🛸 Cyber Drone Avatar', desc: 'Drone thám hiểm không gian' },
                    { id: 'candlestick', label: '📊 3D Candlestick Matrix', desc: 'Ma trận nến tài chính 3D' }
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => loadPreset(preset.id)}
                      className={`text-left p-3 rounded-xl border transition-all text-xs ${
                        selectedPreset === preset.id
                          ? 'border-neon-green bg-neon-green/10 text-white'
                          : 'border-[#1f2937] bg-[#0c1b29] text-gray-400 hover:border-gray-500'
                      }`}
                    >
                      <div className="font-semibold text-white">{preset.label}</div>
                      <div className="text-[10px] text-gray-400 mt-1">{preset.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Tab 2: Upload 3D File */
              <div className="space-y-4">
                <label className="text-xs font-medium text-gray-300">Tải lên tệp 3D tùy chỉnh:</label>
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#20394b] rounded-xl hover:border-neon-green/60 bg-[#0d1e2e]/50 cursor-pointer transition-colors group">
                  <Upload className="w-8 h-8 text-gray-400 group-hover:text-neon-green mb-2 transition-colors" />
                  <span className="text-xs text-white font-medium">Kéo thả hoặc nhấp để chọn tệp 3D</span>
                  <span className="text-[10px] text-gray-500 mt-1">Hỗ trợ .GLB, .GLTF, .OBJ (Tối đa 50MB)</span>
                  <input
                    type="file"
                    accept=".glb,.gltf,.obj"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>

                {uploadError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                    {uploadError}
                  </div>
                )}
              </div>
            )}

            {/* Model Customization Parameters */}
            <div className="pt-3 border-t border-[#1f2937] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-300">Kích thước (Scale: {scale.toFixed(1)}x)</span>
                <input
                  type="range"
                  min="0.3"
                  max="3.0"
                  step="0.1"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="w-32 accent-neon-green cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-300">Chế độ khung lưới (Wireframe)</span>
                <button
                  type="button"
                  onClick={() => setWireframe(!wireframe)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    wireframe ? 'bg-neon-green' : 'bg-gray-700'
                  }`}
                >
                  <div
                    className={`bg-black w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      wireframe ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Color Preset */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-gray-300">Điểm sáng Emissive</span>
                <div className="flex space-x-2">
                  {['#00ffa3', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setGlowColor(color)}
                      style={{ backgroundColor: color }}
                      className={`w-5 h-5 rounded-full border ${
                        glowColor === color ? 'border-white scale-110 shadow-lg' : 'border-transparent'
                      } transition-all`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Interactive 3D Preview Canvas */}
          <div className="md:col-span-6 relative flex flex-col bg-[#05111c] min-h-[300px]">
            {/* Canvas Mount */}
            <div ref={previewMountRef} className="w-full flex-1 min-h-[320px] cursor-grab active:cursor-grabbing" />

            {/* Floating Overlay Hint */}
            <div className="absolute top-3 left-3 bg-[#07131e]/90 backdrop-blur border border-[#1f2937] px-3 py-1.5 rounded-lg text-[10px] text-gray-300 flex items-center gap-1.5">
              <Eye className="w-3 h-3 text-neon-green" />
              <span>Xoay & Zoom tự do bằng chuột / cảm ứng</span>
            </div>

            {/* Model Telemetry Box */}
            <div className="p-4 border-t border-[#20394b] bg-[#07131e]/95 flex items-center justify-between text-xs">
              <div className="flex space-x-4 text-[11px] text-gray-400 font-mono">
                <div>
                  <span className="text-gray-500">Đỉnh:</span>{' '}
                  <b className="text-white">{modelStats.vertices.toLocaleString()}</b>
                </div>
                <div>
                  <span className="text-gray-500">Mặt:</span>{' '}
                  <b className="text-white">{modelStats.faces.toLocaleString()}</b>
                </div>
                <div>
                  <span className="text-gray-500">Mesh:</span>{' '}
                  <b className="text-white">{modelStats.meshes}</b>
                </div>
              </div>

              <button
                onClick={() => loadPreset(selectedPreset)}
                className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1"
                title="Khôi phục góc nhìn"
              >
                <RefreshCw className="w-3 h-3" /> Reset
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#20394b] bg-[#0a1a29]">
          <div className="text-xs text-gray-400 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Mô hình sẽ tự động kích hoạt ánh sáng và cơ chế chuyển động trong thế giới 3D.</span>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white border border-[#20394b] hover:bg-white/5 transition-colors"
            >
              Hủy
            </button>

            <button
              onClick={handleSpawn}
              disabled={isSpawning}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-neon-green text-black hover:bg-emerald-400 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(0,255,163,0.3)] disabled:opacity-50"
            >
              {isSpawning ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" /> Đang đưa vào thế giới 3D...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" /> Đưa vào Game 3D
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
