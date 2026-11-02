/**
 * 3D Game HUD (Heads-Up Display)
 * Features Minimap Radar, 18-Month Quant Roadmap Navigator, Rank progression, and controls.
 */

import React, { useState } from 'react';
import {
  Volume2, VolumeX, Box, RotateCcw,
  Minimize2, Zap, Award, Compass, MapPin, Check
} from 'lucide-react';
import { QUANT_ROADMAP_STAGES, type RoadmapTopic } from './QuantRoadmapData';

export interface GameHUDProps {
  score: number;
  coresCollected: number;
  totalCores: number;
  activeCheckpointName: string | null;
  onOpenModelAddon: () => void;
  onToggleSound: () => void;
  isMuted: boolean;
  onExitGameMode: () => void;
  onResetDrone: () => void;
  playerPos: { x: number; z: number };
  checkpoints: Array<{ id: string; name: string; x: number; z: number; completed: boolean }>;
  completedTopicIds: string[];
  onSelectTopic: (topic: RoadmapTopic) => void;
  onTeleportTo: (coords: { x: number; y: number; z: number }) => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  score,
  coresCollected,
  totalCores,
  activeCheckpointName,
  onOpenModelAddon,
  onToggleSound,
  isMuted,
  onExitGameMode,
  onResetDrone,
  playerPos,
  completedTopicIds,
  onSelectTopic,
  onTeleportTo
}) => {
  const [showRoadmapPanel, setShowRoadmapPanel] = useState(false);

  // Tính danh hiệu Quant theo XP
  const getQuantRank = (xp: number) => {
    if (xp >= 1600) return { title: 'Trưởng ban Kiểm toán Chiến lược', tier: 'CHIEF AUDITOR', color: 'text-neon-green' };
    if (xp >= 1000) return { title: 'Quant Trader Cao cấp', tier: 'SENIOR TRADER', color: 'text-amber-400' };
    if (xp >= 600) return { title: 'Nhà Giao dịch Stat-Arb', tier: 'STAT-ARBITRAGEUR', color: 'text-cyan-400' };
    if (xp >= 300) return { title: 'Chuyên viên Nghiên cứu', tier: 'JUNIOR RESEARCHER', color: 'text-blue-400' };
    return { title: 'Tập sự Lượng hóa', tier: 'NOVICE ANALYST', color: 'text-gray-300' };
  };

  const currentRank = getQuantRank(score);

  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between p-3 sm:p-6 select-none font-sans">
      
      {/* Top Bar: Quest, XP & Quick Actions */}
      <div className="flex items-start justify-between w-full pointer-events-auto gap-3">
        
        {/* Left: Quest, Rank & Objectives */}
        <div className="bg-[#07131e]/90 backdrop-blur-md border border-[#20394b] p-3 sm:p-4 rounded-2xl shadow-xl max-w-xs sm:max-w-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-neon-green flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> Lộ trình Quant Finance 3D
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-neon-green/10 text-neon-green border border-neon-green/30">
              {score} XP
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-neon-green shrink-0" />
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-gray-400">Danh hiệu Quant:</div>
              <div className={`text-xs font-bold ${currentRank.color}`}>
                {currentRank.title}
              </div>
            </div>
          </div>

          <div className="text-xs font-semibold text-white border-t border-[#1a3246] pt-2">
            {activeCheckpointName ? (
              <span className="text-cyan-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                {activeCheckpointName}
              </span>
            ) : (
              <span className="text-gray-300">
                Bay Drone qua các trạm tri thức hoặc mở Menu Lộ trình
              </span>
            )}
          </div>

          {/* Progress bar for cores & stages */}
          <div className="space-y-2 border-t border-[#1a3246] pt-2">
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>Tiến độ Chặng Lộ trình:</span>
                <b className="text-neon-green">{completedTopicIds.length} / {QUANT_ROADMAP_STAGES.length}</b>
              </div>
              <div className="w-full bg-[#112333] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-neon-green to-cyan-400 h-full transition-all duration-500"
                  style={{ width: `${(completedTopicIds.length / QUANT_ROADMAP_STAGES.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex justify-between text-[10px] text-gray-400">
              <span>Lõi Toán học (Math Cores):</span>
              <b className="text-cyan-400">{coresCollected} / {totalCores}</b>
            </div>
          </div>
        </div>

        {/* Right: Actions & Radar */}
        <div className="flex flex-col items-end space-y-2.5">
          {/* Action buttons row */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowRoadmapPanel(prev => !prev)}
              className="px-3 py-2 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-bold text-xs flex items-center gap-1.5 hover:bg-cyan-500/30 transition-all pointer-events-auto shadow-[0_0_12px_rgba(0,217,255,0.2)]"
              title="Mở Hồ Sơ Nghiên Cứu"
            >
              <Compass className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Hồ Sơ Nghiên Cứu</span>
            </button>

            <button
              onClick={onOpenModelAddon}
              className="px-2.5 sm:px-3 py-2 rounded-xl bg-neon-green text-black font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,255,163,0.4)] hover:bg-emerald-400 transition-all pointer-events-auto"
              title="Thêm mô hình 3D"
            >
              <Box className="w-4 h-4" />
              <span className="hidden sm:inline">Add 3D Model</span>
            </button>

            <button
              onClick={onToggleSound}
              className="p-2 rounded-xl bg-[#07131e]/90 border border-[#20394b] text-gray-300 hover:text-white transition-colors pointer-events-auto"
              title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-neon-green" />}
            </button>

            <button
              onClick={onResetDrone}
              className="p-2 rounded-xl bg-[#07131e]/90 border border-[#20394b] text-gray-300 hover:text-white transition-colors pointer-events-auto"
              title="Đặt lại vị trí Drone"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={onExitGameMode}
              className="p-2 rounded-xl bg-[#07131e]/90 border border-[#20394b] text-gray-300 hover:text-white transition-colors pointer-events-auto"
              title="Thu nhỏ về chế độ cuộn web"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Minimap Radar */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-[#061624]/90 border border-[#20394b] overflow-hidden shadow-2xl p-2 flex items-center justify-center pointer-events-auto">
            {/* Concentric radar rings */}
            <div className="absolute inset-2 rounded-full border border-cyan-500/20 animate-ping opacity-20" />
            <div className="absolute w-16 h-16 rounded-full border border-cyan-500/30" />
            <div className="absolute w-8 h-8 rounded-full border border-cyan-500/40" />

            {/* Crosshairs */}
            <div className="absolute w-full h-[1px] bg-cyan-500/20" />
            <div className="absolute h-full w-[1px] bg-cyan-500/20" />

            {/* Checkpoints on radar */}
            {QUANT_ROADMAP_STAGES.map((topic) => {
              const radarX = (topic.coordinates.x / 40) * 45;
              const radarZ = (topic.coordinates.z / 40) * 45;
              const completed = completedTopicIds.includes(topic.id);
              return (
                <div
                  key={topic.id}
                  style={{
                    transform: `translate(${radarX}px, ${radarZ}px)`
                  }}
                  className={`absolute w-2 h-2 rounded-full transition-transform ${
                    completed ? 'bg-cyan-400' : 'bg-amber-400'
                  } shadow-[0_0_6px_currentColor] cursor-pointer`}
                  title={`${topic.stageNumber}. ${topic.title}`}
                  onClick={() => onSelectTopic(topic)}
                />
              );
            })}

            {/* Player marker (Center) */}
            <div className="relative w-3 h-3 bg-neon-green rounded-full shadow-[0_0_10px_#00ffa3] border border-white z-10" />

            {/* Radar Coordinates */}
            <div className="absolute bottom-1 right-2 text-[9px] font-mono text-cyan-400/80">
              {playerPos.x.toFixed(0)}, {playerPos.z.toFixed(0)}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Research Archive Drawer */}
      {showRoadmapPanel && (
        <div className="absolute top-20 right-4 sm:right-6 w-80 sm:w-96 max-h-[75vh] bg-[#07131e]/95 backdrop-blur-xl border border-cyan-500/30 rounded-3xl p-4 shadow-2xl overflow-y-auto pointer-events-auto space-y-3 custom-scrollbar z-40">
          <div className="flex items-center justify-between border-b border-[#1b2f3f] pb-3">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Hồ Sơ Nghiên Cứu & Tài Liệu
              </h4>
            </div>
            <button
              onClick={() => setShowRoadmapPanel(false)}
              className="text-xs text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <p className="text-[11px] text-gray-300 leading-relaxed">
            Học thuyết chuẩn từ <b>agents.surf</b> tích hợp tiêu chuẩn kiểm định <b>Strategy Audit — Đo trước khi tin</b>:
          </p>

          <div className="space-y-2">
            {QUANT_ROADMAP_STAGES.map((stage) => {
              const isCompleted = completedTopicIds.includes(stage.id);
              return (
                <div
                  key={stage.id}
                  className={`p-2.5 rounded-2xl border transition-all ${
                    isCompleted
                      ? 'bg-emerald-950/30 border-emerald-500/40'
                      : 'bg-[#091827] border-[#183147] hover:border-cyan-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold text-neon-green">
                      Stage {stage.stageNumber} · {stage.category}
                    </span>
                    {isCompleted ? (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                        <Check className="w-3 h-3" /> Đã qua
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-gray-400">
                        +{stage.challenge.xpReward} XP
                      </span>
                    )}
                  </div>

                  <h5 className="text-xs font-bold text-white mb-1.5 leading-snug">
                    {stage.title}
                  </h5>

                  <div className="flex items-center gap-2 pt-1 border-t border-[#132838]">
                    <button
                      onClick={() => onSelectTopic(stage)}
                      className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[10px] font-semibold transition-colors"
                    >
                      Mở Học thuyết & Thử thách
                    </button>
                    <button
                      onClick={() => onTeleportTo(stage.coordinates)}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-[10px] font-semibold transition-colors"
                    >
                      Bay tới trạm
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Bar: Roadmap Chapter Quick Switcher & Controls */}
      <div className="w-full flex flex-col items-center gap-2 pointer-events-auto">
        {/* Horizontal Quick-Select Roadmap Pills */}
        <div className="flex items-center gap-1.5 bg-[#061421]/90 backdrop-blur-md border border-[#1b3447] px-3 py-2 rounded-2xl shadow-xl overflow-x-auto max-w-full custom-scrollbar">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-1 shrink-0 hidden sm:inline">
            Chặng:
          </span>
          {QUANT_ROADMAP_STAGES.map((stage) => {
            const isCompleted = completedTopicIds.includes(stage.id);
            return (
              <button
                key={stage.id}
                onClick={() => onSelectTopic(stage)}
                className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                  isCompleted
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-[#0d2133] text-gray-300 border border-[#1e3c54] hover:border-cyan-400/50 hover:text-white'
                }`}
                title={stage.title}
              >
                <span>{stage.stageNumber}</span>
                {isCompleted && <Check className="w-3 h-3 text-emerald-400" />}
              </button>
            );
          })}
        </div>

        {/* Navigation Key Hint */}
        <div className="text-[11px] text-gray-400 font-mono hidden sm:flex items-center gap-4 bg-[#05111b]/80 px-4 py-1 rounded-full border border-white/5">
          <span>Di chuyển: <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-bold">W</kbd><kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-bold">A</kbd><kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-bold">S</kbd><kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-bold">D</kbd> / Phím mũi tên</span>
          <span>•</span>
          <span>Bay lên / hạ xuống: <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-bold">Space</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-bold">Shift</kbd></span>
        </div>
      </div>
    </div>
  );
};
