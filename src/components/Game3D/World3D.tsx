/**
 * World3D: Core WebGL 3D Quant Game & Scrollytelling Engine powered by Three.js
 * Combines:
 * 1. Base Quant Roadmap from agents.surf (10 Essential Stages from Probability to HFT & AI Agents)
 * 2. Strategy Audit orientation ("Đo trước khi tin", Sáu Ô, Overfitting Detection)
 * 3. 3D Mathematical Topology Visualizations (Gaussian, Lorenz Attractor, Volatility Surface, Candlestick Matrix)
 * 4. Interactive Challenges, XP, Ranks, SoundFX, and Custom 3D Model Addons.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import confetti from 'canvas-confetti';
import {
  createGaussianSurface,
  createLorenzAttractor,
  createVolatilitySurface,
  createCyberDrone,
  createQuantumVaultCore,
  create3DCandlestickMatrix,
  type Procedural3DObject
} from './ProceduralModels';
import { SoundFX } from './SoundFX';
import { GameHUD } from './GameHUD';
import { ModelAddonManager } from './ModelAddonManager';
import { QUANT_ROADMAP_STAGES, type RoadmapTopic } from './QuantRoadmapData';
import { QuantChallengeModal } from './QuantChallengeModal';

export interface World3DProps {
  isGameMode: boolean;
  onExitGameMode?: () => void;
  scrollProgress?: number;
  activeSectionIndex?: number;
  onSelectSection?: (sectionId: string) => void;
}

export const World3D: React.FC<World3DProps> = ({
  isGameMode,
  onExitGameMode,
  scrollProgress: _scrollProgress = 0,
  activeSectionIndex = 0,
  onSelectSection: _onSelectSection
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isAddonOpen, setIsAddonOpen] = useState(false);
  const [score, setScore] = useState(200); // Khởi đầu với điểm thưởng ban đầu
  const [coresCollected, setCoresCollected] = useState(0);
  const [activeCheckpointName, setActiveCheckpointName] = useState<string | null>(null);
  const [nearbyTopic, setNearbyTopic] = useState<RoadmapTopic | null>(null);
  const [activeModalTopic, setActiveModalTopic] = useState<RoadmapTopic | null>(null);
  const [completedTopicIds, setCompletedTopicIds] = useState<string[]>(['probability-foundations']);
  const [isMuted, setIsMuted] = useState(false);

  // Player state
  const playerPosRef = useRef({ x: 0, y: 0.8, z: 6 });
  const playerVelRef = useRef({ x: 0, z: 0 });
  const [hudPlayerPos, setHudPlayerPos] = useState({ x: 0, z: 6 });

  // Input keys
  const keysRef = useRef<{ [key: string]: boolean }>({});

  // Three.js instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const playerMeshRef = useRef<Procedural3DObject | null>(null);
  const animatedObjectsRef = useRef<Procedural3DObject[]>([]);
  const spawnedAddonsRef = useRef<THREE.Group[]>([]);
  const animFrameRef = useRef<number | null>(null);

  // Camera targets for smooth scrollytelling lerp
  const camTargetPos = useRef(new THREE.Vector3(0, 5, 14));
  const camTargetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));

  // Data Science Math collectible cores
  const mathCoresRef = useRef<Array<{ mesh: THREE.Mesh; x: number; z: number; collected: boolean }>>([]);

  // Scrollytelling Camera Presets
  const cameraPresets = useRef([
    { pos: new THREE.Vector3(0, 6, 16), look: new THREE.Vector3(0, 0, 0) },        // Hero
    { pos: new THREE.Vector3(12, 5, 6), look: new THREE.Vector3(10, 0, -2) },       // Học - Đo - Hành (Sáu Ô)
    { pos: new THREE.Vector3(-12, 4, 8), look: new THREE.Vector3(-12, 0, -2) },     // Data Science Hub
    { pos: new THREE.Vector3(0, 9, -8), look: new THREE.Vector3(0, 0, -18) },       // 300 Chiến lược
    { pos: new THREE.Vector3(0, 6, 8), look: new THREE.Vector3(0, 0, 14) },        // Custom Instructions
    { pos: new THREE.Vector3(0, 12, 12), look: new THREE.Vector3(0, 0, 0) }         // Thành viên
  ]);

  // Update target camera position based on scroll or active section
  useEffect(() => {
    if (isGameMode) return;
    const presets = cameraPresets.current;
    const index = Math.min(Math.max(activeSectionIndex, 0), presets.length - 1);
    const preset = presets[index];
    if (preset) {
      camTargetPos.current.copy(preset.pos);
      camTargetLookAt.current.copy(preset.look);
    }
  }, [isGameMode, activeSectionIndex]);

  // Initialize Scene, Lighting, Environment, and Models
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x061624);
    scene.fog = new THREE.FogExp2(0x061624, 0.022);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 150);
    camera.position.set(0, 6, 16);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    mountRef.current.replaceChildren(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambient);

    const dirLight1 = new THREE.DirectionalLight(0x00ffa3, 1.8);
    dirLight1.position.set(12, 18, 12);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x06b6d4, 1.6);
    dirLight2.position.set(-12, 15, -12);
    scene.add(dirLight2);

    const centerPointLight = new THREE.PointLight(0x00ffa3, 2.5, 35);
    centerPointLight.position.set(0, 4, 0);
    scene.add(centerPointLight);

    // Cyberpunk Grid Floor
    const gridHelper = new THREE.GridHelper(80, 40, 0x00ffa3, 0x152838);
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    // Glowing Platform Circle at Center
    const platformGeo = new THREE.CylinderGeometry(8, 8.5, 0.4, 32);
    const platformMat = new THREE.MeshStandardMaterial({
      color: 0x07131e,
      roughness: 0.2,
      metalness: 0.9,
      emissive: 0x00ffa3,
      emissiveIntensity: 0.15
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.y = -0.2;
    scene.add(platform);

    // Platform Outer Glow Ring
    const ringGeo = new THREE.TorusGeometry(8.5, 0.15, 12, 48);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00ffa3 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -0.05;
    scene.add(ring);

    // Floating Stardust Particles
    const particleCount = 450;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 70;
      particlePos[i + 1] = Math.random() * 20;
      particlePos[i + 2] = (Math.random() - 0.5) * 70;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x00ffa3,
      size: 0.18,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Central Landmark: Quantum Strategy Core
    const centralCore = createQuantumVaultCore();
    centralCore.position.set(0, 2.8, 0);
    scene.add(centralCore);
    animatedObjectsRef.current.push(centralCore);

    // 1. Stage 01: Probability Sanctuary (Gaussian Surface 3D)
    const gaussian = createGaussianSurface(6, 28);
    gaussian.position.set(-16, 0.2, -8);
    scene.add(gaussian);
    animatedObjectsRef.current.push(gaussian);

    // 2. Stage 04: Black-Scholes Volatility Surface (Mặt cong Biến động Volatility Smile 3D)
    const volSurface = createVolatilitySurface(7, 30);
    volSurface.position.set(18, 0.2, -6);
    scene.add(volSurface);
    animatedObjectsRef.current.push(volSurface);

    // 3. Stage 05: Lorenz Chaotic Attractor (Stat-Arb & Cointegration Nexus 3D)
    const lorenz = createLorenzAttractor(2200);
    lorenz.position.set(14, 3.8, 8);
    scene.add(lorenz);
    animatedObjectsRef.current.push(lorenz);

    // 4. Stage 07: Strategy Audit Arena (3D Candlestick Matrix)
    const candlestick = create3DCandlestickMatrix();
    candlestick.position.set(-14, 1.8, 8);
    scene.add(candlestick);
    animatedObjectsRef.current.push(candlestick);

    // 5. Stage 03: Covariance Matrix Monoliths (PCA Pillars)
    const monolithGroup = new THREE.Group();
    for (let i = -2; i <= 2; i++) {
      const h = 3.5 + Math.abs(i) * 1.2;
      const mGeo = new THREE.BoxGeometry(0.8, h, 0.8);
      const mMat = new THREE.MeshStandardMaterial({
        color: 0x0a1928,
        roughness: 0.15,
        metalness: 0.85,
        emissive: i === 0 ? 0x00ffa3 : 0x06b6d4,
        emissiveIntensity: 0.4
      });
      const mMesh = new THREE.Mesh(mGeo, mMat);
      mMesh.position.set(8 + i * 1.8, h / 2, -18);
      monolithGroup.add(mMesh);
    }
    scene.add(monolithGroup);

    // 6. Stage 06: Data Sins Clean Citadel (Clean Data Tower)
    const dataPillarGeo = new THREE.CylinderGeometry(1.2, 1.4, 4.5, 8);
    const dataPillarMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      wireframe: true,
      emissive: 0x06b6d4,
      emissiveIntensity: 0.6
    });
    const dataPillar = new THREE.Mesh(dataPillarGeo, dataPillarMat);
    dataPillar.position.set(0, 2.2, 18);
    scene.add(dataPillar);

    // Glowing Checkpoint Rings for all 10 Roadmap Stages
    QUANT_ROADMAP_STAGES.forEach((stage) => {
      const padGeo = new THREE.CylinderGeometry(2.0, 2.0, 0.08, 24);
      const padMat = new THREE.MeshBasicMaterial({
        color: 0x00ffa3,
        transparent: true,
        opacity: 0.35,
        wireframe: true
      });
      const pad = new THREE.Mesh(padGeo, padMat);
      pad.position.set(stage.coordinates.x, 0.04, stage.coordinates.z);
      scene.add(pad);

      // Vertical beacon beam
      const beamGeo = new THREE.CylinderGeometry(0.04, 0.04, 8, 8);
      const beamMat = new THREE.MeshBasicMaterial({
        color: 0x00ffa3,
        transparent: true,
        opacity: 0.25
      });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.set(stage.coordinates.x, 4, stage.coordinates.z);
      scene.add(beam);
    });

    // Player Drone Avatar
    const playerDrone = createCyberDrone();
    playerDrone.position.set(playerPosRef.current.x, playerPosRef.current.y, playerPosRef.current.z);
    scene.add(playerDrone);
    playerMeshRef.current = playerDrone;
    animatedObjectsRef.current.push(playerDrone);

    // Collectible Quantum Math Cores
    const coreGeo = new THREE.OctahedronGeometry(0.45, 0);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x00ffa3,
      emissive: 0x00ffa3,
      emissiveIntensity: 0.9,
      roughness: 0.1
    });

    const coreLocations = [
      { x: -7, z: -8 },
      { x: 8, z: -8 },
      { x: 0, z: 8 }
    ];

    mathCoresRef.current = coreLocations.map((loc) => {
      const mesh = new THREE.Mesh(coreGeo, coreMat.clone());
      mesh.position.set(loc.x, 1.2, loc.z);
      scene.add(mesh);
      return { mesh, x: loc.x, z: loc.z, collected: false };
    });

    // Resize Handler
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Keyboard Listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysRef.current[key] = true;
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        SoundFX.playThruster();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Mouse / Tap to Move via Raycasting
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

    const handlePointerDown = (e: PointerEvent) => {
      if (!mountRef.current || !cameraRef.current) return;
      const rect = mountRef.current.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, cameraRef.current);
      const intersectionPoint = new THREE.Vector3();
      raycaster.ray.intersectPlane(groundPlane, intersectionPoint);

      if (intersectionPoint && isGameMode) {
        const dx = intersectionPoint.x - playerPosRef.current.x;
        const dz = intersectionPoint.z - playerPosRef.current.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist > 0.5) {
          playerVelRef.current.x = (dx / dist) * 0.18;
          playerVelRef.current.z = (dz / dist) * 0.18;
          SoundFX.playThruster();
        }
      }
    };
    mountRef.current.addEventListener('pointerdown', handlePointerDown);

    // Animation & Physics Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      // Update procedural objects
      animatedObjectsRef.current.forEach((obj) => {
        if (obj.updateAnimation) obj.updateAnimation(delta, elapsed);
      });

      // Update spawned 3D model addons
      spawnedAddonsRef.current.forEach((model) => {
        model.rotation.y += delta * 0.5;
      });

      // Rotate particles slowly
      particles.rotation.y = elapsed * 0.02;

      // Animate collectible cores
      mathCoresRef.current.forEach((core, i) => {
        if (!core.collected) {
          core.mesh.rotation.x = elapsed * 1.5;
          core.mesh.rotation.y = elapsed * 2.0;
          core.mesh.position.y = 1.2 + Math.sin(elapsed * 3 + i) * 0.25;
        }
      });

      // Player Movement Logic (Playable Mode)
      if (playerMeshRef.current) {
        const moveSpeed = 8.5 * delta;
        let moveX = 0;
        let moveZ = 0;

        if (keysRef.current['w'] || keysRef.current['arrowup']) moveZ -= moveSpeed;
        if (keysRef.current['s'] || keysRef.current['arrowdown']) moveZ += moveSpeed;
        if (keysRef.current['a'] || keysRef.current['arrowleft']) moveX -= moveSpeed;
        if (keysRef.current['d'] || keysRef.current['arrowright']) moveX += moveSpeed;

        // Apply friction to mouse-click velocity
        playerVelRef.current.x *= 0.92;
        playerVelRef.current.z *= 0.92;

        playerPosRef.current.x += moveX + playerVelRef.current.x;
        playerPosRef.current.z += moveZ + playerVelRef.current.z;

        // Boundary Clamp (-32 to 32)
        playerPosRef.current.x = THREE.MathUtils.clamp(playerPosRef.current.x, -32, 32);
        playerPosRef.current.z = THREE.MathUtils.clamp(playerPosRef.current.z, -32, 32);

        // Update player mesh
        playerMeshRef.current.position.x = playerPosRef.current.x;
        playerMeshRef.current.position.z = playerPosRef.current.z;

        // Tilt drone on movement
        const targetRotY = Math.atan2(moveX + playerVelRef.current.x, moveZ + playerVelRef.current.z) + Math.PI;
        if (Math.abs(moveX) > 0.001 || Math.abs(moveZ) > 0.001 || Math.abs(playerVelRef.current.x) > 0.01) {
          playerMeshRef.current.rotation.y = THREE.MathUtils.lerp(playerMeshRef.current.rotation.y, targetRotY, 0.15);
          playerMeshRef.current.rotation.z = THREE.MathUtils.lerp(playerMeshRef.current.rotation.z, -(moveX + playerVelRef.current.x) * 4, 0.15);
        } else {
          playerMeshRef.current.rotation.z = THREE.MathUtils.lerp(playerMeshRef.current.rotation.z, 0, 0.1);
        }

        // Update HUD position
        setHudPlayerPos({ x: playerPosRef.current.x, z: playerPosRef.current.z });

        // Collectible detection
        mathCoresRef.current.forEach((core) => {
          if (!core.collected) {
            const dist = Math.hypot(playerPosRef.current.x - core.x, playerPosRef.current.z - core.z);
            if (dist < 2.0) {
              core.collected = true;
              core.mesh.visible = false;
              SoundFX.playCollect();
              setCoresCollected((prev) => {
                const next = prev + 1;
                setScore((s) => s + 100);
                if (next === 3) {
                  SoundFX.playVictory();
                  confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
                }
                return next;
              });
            }
          }
        });

        // 10 Roadmap Stations Proximity Detection
        let foundNearby: RoadmapTopic | null = null;
        for (const stage of QUANT_ROADMAP_STAGES) {
          const dist = Math.hypot(
            playerPosRef.current.x - stage.coordinates.x,
            playerPosRef.current.z - stage.coordinates.z
          );
          if (dist < 3.8) {
            foundNearby = stage;
            break;
          }
        }

        if (foundNearby) {
          setActiveCheckpointName(`Trạm ${foundNearby.stageNumber}: ${foundNearby.title}`);
          setNearbyTopic(foundNearby);
        } else {
          setActiveCheckpointName(null);
          setNearbyTopic(null);
        }
      }

      // Camera Handling
      if (cameraRef.current) {
        if (isGameMode && playerMeshRef.current) {
          // Third-person smooth camera chase
          const targetCamX = playerPosRef.current.x;
          const targetCamY = playerPosRef.current.y + 4.8;
          const targetCamZ = playerPosRef.current.z + 8.5;

          cameraRef.current.position.lerp(new THREE.Vector3(targetCamX, targetCamY, targetCamZ), 0.08);
          currentLookAt.current.lerp(
            new THREE.Vector3(playerPosRef.current.x, playerPosRef.current.y + 0.5, playerPosRef.current.z),
            0.1
          );
          cameraRef.current.lookAt(currentLookAt.current);
        } else {
          // Scrollytelling cinematic glide
          cameraRef.current.position.lerp(camTargetPos.current, 0.05);
          currentLookAt.current.lerp(camTargetLookAt.current, 0.05);
          cameraRef.current.lookAt(currentLookAt.current);
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      renderer.dispose();
    };
  }, [isGameMode]);

  // Handle Spawning 3D Add-on into the scene
  const handleSpawnModel = useCallback((modelGroup: THREE.Group, _metadata: { name: string; type: string }) => {
    if (!sceneRef.current) return;
    modelGroup.position.set(0, 1.2, 3);
    sceneRef.current.add(modelGroup);
    spawnedAddonsRef.current.push(modelGroup);
    SoundFX.playCheckpoint();
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.5 } });
  }, []);

  const handleResetDrone = useCallback(() => {
    playerPosRef.current = { x: 0, y: 0.8, z: 6 };
    playerVelRef.current = { x: 0, z: 0 };
    SoundFX.playClick();
  }, []);

  const handleToggleSound = useCallback(() => {
    const muted = SoundFX.toggleMute();
    setIsMuted(muted);
  }, []);

  const handleTeleportTo = useCallback((coords: { x: number; y: number; z: number }) => {
    playerPosRef.current = { x: coords.x, y: 0.8, z: coords.z + 2.5 };
    playerVelRef.current = { x: 0, z: 0 };
    SoundFX.playThruster();
  }, []);

  const handleCompleteTopic = useCallback((topicId: string, earnedXp: number) => {
    setCompletedTopicIds((prev) => {
      if (prev.includes(topicId)) return prev;
      return [...prev, topicId];
    });
    setScore((s) => s + earnedXp);
  }, []);

  return (
    <div
      className={`relative w-full transition-all duration-700 overflow-hidden ${
        isGameMode ? 'fixed inset-0 z-50 h-screen' : 'h-[500px] sm:h-[600px] md:h-[700px]'
      }`}
    >
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-crosshair" />

      {/* Proximity Interaction Prompt Banner */}
      {isGameMode && nearbyTopic && !activeModalTopic && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-40 bg-[#07131e]/95 backdrop-blur-md border border-neon-green/60 px-5 py-3 rounded-2xl shadow-[0_0_25px_rgba(0,255,163,0.3)] flex items-center gap-3 animate-bounce">
          <div className="w-2.5 h-2.5 rounded-full bg-neon-green animate-ping" />
          <div className="text-xs">
            <span className="text-gray-400 font-mono">Đã đến:</span>{' '}
            <b className="text-white">{nearbyTopic.landmarkName}</b>
          </div>
          <button
            onClick={() => setActiveModalTopic(nearbyTopic)}
            className="px-3 py-1.5 rounded-xl bg-neon-green text-black font-bold text-xs hover:bg-emerald-400 transition-all shadow-md"
          >
            Mở Thử thách Kiểm định
          </button>
        </div>
      )}

      {/* Playable Mode HUD */}
      {isGameMode && (
        <GameHUD
          score={score}
          coresCollected={coresCollected}
          totalCores={3}
          activeCheckpointName={activeCheckpointName}
          onOpenModelAddon={() => setIsAddonOpen(true)}
          onToggleSound={handleToggleSound}
          isMuted={isMuted}
          onExitGameMode={onExitGameMode || (() => {})}
          onResetDrone={handleResetDrone}
          playerPos={hudPlayerPos}
          checkpoints={QUANT_ROADMAP_STAGES.map((s) => ({
            id: s.id,
            name: `${s.stageNumber}. ${s.title}`,
            x: s.coordinates.x,
            z: s.coordinates.z,
            completed: completedTopicIds.includes(s.id)
          }))}
          completedTopicIds={completedTopicIds}
          onSelectTopic={(topic) => setActiveModalTopic(topic)}
          onTeleportTo={handleTeleportTo}
        />
      )}

      {/* Scrollytelling Overlay Controls (when in normal web scroll mode) */}
      {!isGameMode && (
        <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between pointer-events-none select-none">
          {/* 3D Scene Telemetry Badge */}
          <div className="bg-[#07131e]/90 backdrop-blur-md border border-[#20394b] px-3.5 py-2 rounded-xl text-xs text-gray-300 flex items-center gap-2 pointer-events-auto">
            <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
            <span className="font-mono text-[11px] text-neon-green font-bold">Quant 3D Arena Active</span>
            <span className="text-gray-500">|</span>
            <span className="text-[11px] text-gray-300">
              Lộ trình Quant Finance 18 Tháng · Cuộn để tham quan
            </span>
          </div>

          {/* Quick Action: Add 3D Model */}
          <div className="flex items-center space-x-2 pointer-events-auto">
            <button
              onClick={() => setIsAddonOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-[#0a1a29]/90 border border-neon-green/40 hover:border-neon-green text-neon-green text-xs font-semibold flex items-center gap-1.5 transition-all shadow-lg hover:shadow-[0_0_15px_rgba(0,255,163,0.3)]"
            >
              <span>+ Add 3D Model</span>
            </button>
          </div>
        </div>
      )}

      {/* Interactive Quant Challenge & Knowledge Dossier Modal */}
      <QuantChallengeModal
        topic={activeModalTopic}
        onClose={() => setActiveModalTopic(null)}
        onCompleteTopic={handleCompleteTopic}
        isCompleted={activeModalTopic ? completedTopicIds.includes(activeModalTopic.id) : false}
      />

      {/* 3D Model Add-on Manager Modal */}
      <ModelAddonManager
        isOpen={isAddonOpen}
        onClose={() => setIsAddonOpen(false)}
        onSpawnModelToWorld={handleSpawnModel}
      />
    </div>
  );
};
