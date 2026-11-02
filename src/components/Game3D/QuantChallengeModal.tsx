/**
 * QuantChallengeModal.tsx
 * Modal tương tác bài học & Thử thách Kiểm định Chiến lược theo Lộ trình Quant Finance
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, CheckCircle, AlertTriangle, Award, Code, BookOpen,
  ArrowRight, ShieldCheck, Sparkles, HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { type RoadmapTopic } from './QuantRoadmapData';
import { MathFormula } from '../MathFormula';
import { SoundFX } from './SoundFX';

export interface QuantChallengeModalProps {
  topic: RoadmapTopic | null;
  onClose: () => void;
  onCompleteTopic: (topicId: string, earnedXp: number) => void;
  isCompleted: boolean;
}

export const QuantChallengeModal: React.FC<QuantChallengeModalProps> = ({
  topic,
  onClose,
  onCompleteTopic,
  isCompleted
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'theory' | 'challenge' | 'code'>('theory');

  if (!topic) return null;

  const handleAnswerSubmit = () => {
    if (selectedOption === null) return;
    const correct = selectedOption === topic.challenge.correctIndex;
    setIsCorrect(correct);
    setHasSubmitted(true);

    if (correct) {
      SoundFX.playSuccess();
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
      if (!isCompleted) {
        onCompleteTopic(topic.id, topic.challenge.xpReward);
      }
    } else {
      SoundFX.playError();
    }
  };

  const handleRetry = () => {
    setSelectedOption(null);
    setHasSubmitted(false);
    setIsCorrect(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-3xl max-h-[90vh] bg-[#07131e] border border-[#20394b] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-gray-200 font-sans"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#1b2f3f] bg-[#091b2b]/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-neon-green/10 border border-neon-green/30 flex items-center justify-center text-neon-green font-mono font-bold text-sm">
                {topic.stageNumber}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {topic.category}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">
                    📍 {topic.landmarkName}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {topic.title}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-[#1b2f3f] bg-[#05101a] px-6">
            <button
              onClick={() => setActiveTab('theory')}
              className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'theory'
                  ? 'border-neon-green text-neon-green'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Nền tảng & Định hướng
            </button>

            <button
              onClick={() => setActiveTab('challenge')}
              className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'challenge'
                  ? 'border-neon-green text-neon-green'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Thử thách Kiểm định
              {isCompleted && (
                <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                  ✓ Đã đạt
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'code'
                  ? 'border-neon-green text-neon-green'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              Mã nguồn Mẫu
            </button>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-sm leading-relaxed">
            {activeTab === 'theory' && (
              <div className="space-y-5">
                {/* Key Equation Callout */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0d2235] to-[#081a29] border border-cyan-500/30 shadow-inner">
                  <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Công thức Cốt lõi (Mathematical Core)
                  </div>
                  <div className="p-3 my-2 bg-black/40 rounded-xl border border-cyan-500/20 text-neon-green text-sm sm:text-base text-center overflow-x-auto">
                    <MathFormula formula={topic.keyEquation} />
                  </div>
                  <p className="text-xs text-gray-300">
                    {topic.equationDescription}
                  </p>
                </div>

                {/* Theoretical Summary */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Bản chất Định lượng (Quant Theory Base)
                  </h4>
                  <p className="text-gray-300">
                    {topic.summary}
                  </p>
                </div>

                {/* Strategy Audit Bridge */}
                <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-100 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                    CẦU NỐI VỚI STRATEGY AUDIT — "ĐO TRƯỚC KHI TIN":
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {topic.strategyAuditBridge}
                  </p>
                </div>

                {/* Call to action to challenge */}
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setActiveTab('challenge')}
                    className="px-5 py-2.5 rounded-xl bg-neon-green text-black font-bold text-xs flex items-center gap-2 hover:bg-emerald-400 shadow-[0_0_15px_rgba(0,255,163,0.3)] transition-all"
                  >
                    Làm bài Thử thách Kiểm định ({topic.challenge.xpReward} XP)
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'challenge' && (
              <div className="space-y-5">
                <div className="p-4 rounded-2xl bg-[#091b2b] border border-[#1d354a]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5" /> Thử thách Tình huống Kiểm định
                    </span>
                    <span className="text-xs font-mono font-bold text-neon-green">
                      +{topic.challenge.xpReward} XP
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-white">
                    {topic.challenge.question}
                  </p>
                </div>

                {/* Options list */}
                <div className="space-y-2.5">
                  {topic.challenge.options.map((opt, idx) => {
                    const isSelected = selectedOption === idx;
                    let optionStyle = 'border-[#1e3447] bg-[#06121d] hover:border-cyan-500/50';

                    if (hasSubmitted) {
                      if (idx === topic.challenge.correctIndex) {
                        optionStyle = 'border-emerald-500 bg-emerald-950/40 text-emerald-200';
                      } else if (isSelected) {
                        optionStyle = 'border-red-500 bg-red-950/40 text-red-200';
                      } else {
                        optionStyle = 'opacity-50 border-[#1e3447]';
                      }
                    } else if (isSelected) {
                      optionStyle = 'border-neon-green bg-neon-green/10 text-white';
                    }

                    return (
                      <button
                        key={idx}
                        disabled={hasSubmitted}
                        onClick={() => setSelectedOption(idx)}
                        className={`w-full text-left p-3.5 rounded-2xl border transition-all text-xs flex items-start gap-3 ${optionStyle}`}
                      >
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                          isSelected ? 'bg-neon-green text-black' : 'bg-[#122230] text-gray-400'
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Result feedback */}
                {hasSubmitted && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-2xl border ${
                      isCorrect
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                        : 'bg-red-950/40 border-red-500/40 text-red-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs mb-1">
                      {isCorrect ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                          <span>CHÍNH XÁC! Bạn đã nhận +{topic.challenge.xpReward} XP</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                          <span>CHƯA ĐÚNG! Hãy đọc giải thích bên dưới:</span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-gray-300">
                      {topic.challenge.explanation}
                    </p>
                    {!isCorrect && (
                      <button
                        onClick={handleRetry}
                        className="mt-3 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors"
                      >
                        Thử chọn lại
                      </button>
                    )}
                  </motion.div>
                )}

                {!hasSubmitted && (
                  <div className="pt-2 flex justify-end">
                    <button
                      disabled={selectedOption === null}
                      onClick={handleAnswerSubmit}
                      className="px-6 py-2.5 rounded-xl bg-neon-green disabled:opacity-40 disabled:hover:bg-neon-green text-black font-bold text-xs flex items-center gap-2 hover:bg-emerald-400 shadow-[0_0_15px_rgba(0,255,163,0.3)] transition-all"
                    >
                      Xác nhận câu trả lời
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'code' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className="font-mono">Python 3.11+ / Quantitative Script</span>
                  <span className="px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-500/20 text-[10px] font-mono">
                    Clean & Causal
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-[#030910] border border-[#1c3042] font-mono text-xs text-emerald-400 overflow-x-auto shadow-inner leading-relaxed">
                  <pre>{topic.pythonSnippet}</pre>
                </div>
                <p className="text-xs text-gray-400">
                  💡 Đoạn mã mẫu được chuẩn hóa theo tiêu chuẩn nghiên cứu lượng hóa độc lập (Research Layer), có thể kiểm thử trực tiếp trên Jupyter Lab hoặc Agent Harness AgenKit.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[#1b2f3f] bg-[#061421] flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-neon-green" />
              <span>Huy hiệu Chặng: <b className="text-white">{topic.badge}</b></span>
            </div>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
            >
              Đóng lại & Tiếp tục bay
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
