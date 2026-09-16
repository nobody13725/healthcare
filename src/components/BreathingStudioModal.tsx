import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Wind, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  Check, 
  Heart,
  Moon,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BreathingStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogMindfulness?: (minutes: number) => void;
}

type BreathingTechnique = 'box' | 'relax478' | 'coherence';

interface PhaseConfig {
  name: string;
  duration: number; // in seconds
  instruction: string;
  color: string;
  glowColor: string;
}

export const BreathingStudioModal: React.FC<BreathingStudioModalProps> = ({
  isOpen,
  onClose,
  onLogMindfulness,
}) => {
  const [technique, setTechnique] = useState<BreathingTechnique>('box');
  const [isActive, setIsActive] = useState<boolean>(false);
  const [currentPhaseIdx, setCurrentPhaseIdx] = useState<number>(0);
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState<number>(4);
  const [completedCycles, setCompletedCycles] = useState<number>(0);
  const [totalSeconds, setTotalSeconds] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Audio Context ref for ambient chime
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getPhases = (tech: BreathingTechnique): PhaseConfig[] => {
    switch (tech) {
      case 'box':
        return [
          { name: 'HÍT VÀO', duration: 4, instruction: 'Hít sâu và chậm rãi bằng mũi', color: 'from-teal-400 to-emerald-500', glowColor: 'rgba(20, 184, 166, 0.4)' },
          { name: 'GIỮ HƠI', duration: 4, instruction: 'Giữ lồng ngực mở rộng, thả lỏng vai', color: 'from-emerald-400 to-cyan-500', glowColor: 'rgba(16, 185, 129, 0.4)' },
          { name: 'THỞ RA', duration: 4, instruction: 'Thở ra nhẹ nhàng qua miệng', color: 'from-cyan-400 to-blue-500', glowColor: 'rgba(6, 182, 212, 0.4)' },
          { name: 'GIỮ TRỐNG', duration: 4, instruction: 'Thả lỏng toàn bộ cơ thể trước chu kỳ mới', color: 'from-blue-400 to-indigo-500', glowColor: 'rgba(59, 130, 246, 0.4)' },
        ];
      case 'relax478':
        return [
          { name: 'HÍT VÀO', duration: 4, instruction: 'Hít vào êm dịu bằng mũi', color: 'from-indigo-400 to-purple-500', glowColor: 'rgba(99, 102, 241, 0.4)' },
          { name: 'GIỮ HƠI', duration: 7, instruction: 'Giữ hơi thở, tập trung vào điểm tĩnh tâm', color: 'from-purple-400 to-pink-500', glowColor: 'rgba(168, 85, 247, 0.4)' },
          { name: 'THỞ RA', duration: 8, instruction: 'Thở ra chậm rãi, tạo âm thanh nhẹ qua môi', color: 'from-pink-400 to-rose-500', glowColor: 'rgba(236, 72, 153, 0.4)' },
        ];
      case 'coherence':
        return [
          { name: 'HÍT VÀO', duration: 5, instruction: 'Hít vào êm đềm đồng bộ nhịp tim', color: 'from-emerald-400 to-teal-500', glowColor: 'rgba(16, 185, 129, 0.4)' },
          { name: 'THỞ RA', duration: 5, instruction: 'Thở ra nhịp nhàng, điều hòa huyết áp', color: 'from-teal-400 to-sky-500', glowColor: 'rgba(20, 184, 166, 0.4)' },
        ];
    }
  };

  const phases = getPhases(technique);
  const currentPhase = phases[currentPhaseIdx] || phases[0];

  // Play pleasant ambient sine chime on phase transition
  const playGentleTone = (freq = 432) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch {
      // Ignore audio failure
    }
  };

  // Timer loop
  useEffect(() => {
    if (!isOpen || !isActive) return;

    const interval = setInterval(() => {
      setTotalSeconds((prev) => prev + 1);
      setPhaseSecondsLeft((prev) => {
        if (prev <= 1) {
          // Next phase
          setCurrentPhaseIdx((prevIdx) => {
            const nextIdx = (prevIdx + 1) % phases.length;
            if (nextIdx === 0) {
              setCompletedCycles((c) => c + 1);
            }
            playGentleTone(nextIdx === 0 ? 528 : 432);
            return nextIdx;
          });
          return phases[(currentPhaseIdx + 1) % phases.length].duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isActive, currentPhaseIdx, phases.length]);

  // Reset when changing technique
  const handleSelectTechnique = (tech: BreathingTechnique) => {
    setTechnique(tech);
    setIsActive(false);
    setCurrentPhaseIdx(0);
    const newPhases = getPhases(tech);
    setPhaseSecondsLeft(newPhases[0].duration);
  };

  const handleReset = () => {
    setIsActive(false);
    setCurrentPhaseIdx(0);
    setPhaseSecondsLeft(phases[0].duration);
    setCompletedCycles(0);
    setTotalSeconds(0);
  };

  const handleFinishAndClose = () => {
    const minutes = Math.max(1, Math.round(totalSeconds / 60));
    if (totalSeconds >= 30 && onLogMindfulness) {
      onLogMindfulness(minutes);
      confetti({ particleCount: 40, spread: 60 });
    }
    onClose();
  };

  if (!isOpen) return null;

  // Calculate breathing ring expansion scale
  const isExhale = currentPhase.name.includes('THỞ');
  const isHold = currentPhase.name.includes('GIỮ');
  const isInhale = currentPhase.name.includes('HÍT');

  let ringScale = 1;
  if (isActive) {
    if (isInhale) ringScale = 1.35;
    else if (isHold && currentPhaseIdx === 1) ringScale = 1.35;
    else if (isExhale) ringScale = 0.85;
    else ringScale = 0.85;
  }

  const formatMinSec = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative bg-slate-900 text-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-800 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-teal-500/20 border border-teal-500/40 text-teal-400 flex items-center justify-center">
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <span>Phòng Thở Sinh Học & Thư Giãn</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-900/60 text-teal-300 border border-teal-700">
                  BIO-BREATH
                </span>
              </h3>
              <p className="text-xs text-slate-400">Điều hòa nhịp tim, giảm hormone cortisol và tái tạo năng lượng</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                soundEnabled ? 'text-teal-400 bg-teal-950/60' : 'text-slate-500 hover:text-slate-300'
              }`}
              title={soundEnabled ? 'Tắt âm báo chu kỳ' : 'Bật âm báo chu kỳ'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={handleFinishAndClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Technique Selector Pills */}
        <div className="grid grid-cols-3 gap-1.5 mt-5 p-1 bg-slate-950/70 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => handleSelectTechnique('box')}
            className={`py-2 px-1 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center ${
              technique === 'box'
                ? 'bg-teal-600 text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Box (4-4-4-4)
          </button>
          <button
            type="button"
            onClick={() => handleSelectTechnique('relax478')}
            className={`py-2 px-1 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center ${
              technique === 'relax478'
                ? 'bg-indigo-600 text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Thư giãn (4-7-8)
          </button>
          <button
            type="button"
            onClick={() => handleSelectTechnique('coherence')}
            className={`py-2 px-1 rounded-xl text-xs font-semibold transition-all cursor-pointer text-center ${
              technique === 'coherence'
                ? 'bg-emerald-600 text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Đồng bộ (5-5)
          </button>
        </div>

        {/* Central Pulsing Visual Stage */}
        <div className="relative my-8 flex flex-col items-center justify-center min-h-[260px]">
          
          {/* Animated Glow Rings */}
          <div 
            className="absolute w-56 h-56 rounded-full border-2 border-teal-500/20 transition-transform duration-1000 ease-in-out pointer-events-none"
            style={{
              transform: `scale(${ringScale * 1.15})`,
              boxShadow: isActive ? `0 0 50px ${currentPhase.glowColor}` : 'none',
            }}
          />

          <div 
            className="absolute w-44 h-44 rounded-full border border-teal-400/30 transition-transform duration-1000 ease-in-out pointer-events-none"
            style={{
              transform: `scale(${ringScale})`,
            }}
          />

          {/* Central Sphere */}
          <div 
            className={`w-36 h-36 rounded-full bg-gradient-to-tr ${currentPhase.color} flex flex-col items-center justify-center text-center p-4 transition-transform duration-1000 ease-in-out shadow-2xl relative z-10`}
            style={{
              transform: `scale(${ringScale})`,
            }}
          >
            <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white drop-shadow-md">
              {isActive ? phaseSecondsLeft : phases[0].duration}
            </span>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-white/90 mt-1">
              {isActive ? currentPhase.name : 'SẴN SÀNG'}
            </span>
          </div>

          {/* Phase Guidance Instruction */}
          <div className="mt-8 text-center max-w-xs">
            <p className="text-sm font-bold text-teal-300 transition-opacity duration-300">
              {isActive ? currentPhase.instruction : 'Bấm "Bắt đầu" để khởi động bài tập hơi thở'}
            </p>
            <span className="text-[11px] text-slate-400 block mt-1">
              {technique === 'box' && 'Kỹ thuật Navy SEAL tái tạo sự tập trung cao độ'}
              {technique === 'relax478' && 'Kích hoạt hệ thần kinh đối giao cảm, đưa cơ thể vào trạng thái nghỉ ngơi'}
              {technique === 'coherence' && 'Tối ưu hóa biến thiên nhịp tim (HRV) và huyết áp'}
            </span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3 py-3 px-4 bg-slate-950/60 rounded-2xl border border-slate-800 text-xs text-center mb-6">
          <div>
            <span className="text-slate-400 block text-[11px]">Chu kỳ hoàn tất</span>
            <span className="font-bold text-slate-100 font-mono text-base">{completedCycles} chu kỳ</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Thời gian tĩnh tâm</span>
            <span className="font-bold text-teal-400 font-mono text-base">{formatMinSec(totalSeconds)}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Đặt lại bài tập"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className={`flex-1 py-3 px-6 rounded-2xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
              isActive
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-teal-500 hover:bg-teal-400 text-slate-950 font-black shadow-teal-500/20'
            }`}
          >
            {isActive ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Tạm dừng</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Bắt đầu luyện thở</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleFinishAndClose}
            className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            Hoàn tất
          </button>
        </div>

      </div>
    </div>
  );
};
