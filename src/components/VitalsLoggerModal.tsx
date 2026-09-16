import React, { useState } from 'react';
import { 
  HeartPulse, 
  Scale, 
  Droplet, 
  Moon, 
  Footprints, 
  Activity, 
  X, 
  Check, 
  Sparkles,
  ChevronRight,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, HealthMetricEntry } from '../types';
import { calculateBmi } from '../data/initialData';

interface VitalsLoggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  latestMetric?: HealthMetricEntry;
  onAddMetric: (metric: Omit<HealthMetricEntry, 'id'>) => void;
  onLogWater?: (amountMl: number) => void;
}

export const VitalsLoggerModal: React.FC<VitalsLoggerModalProps> = ({
  isOpen,
  onClose,
  user,
  latestMetric,
  onAddMetric,
}) => {
  const currentWeight = latestMetric?.weightKg || user.weightKg;
  const currentHeight = latestMetric?.heightCm || user.heightCm;

  const [weightKg, setWeightKg] = useState<number>(currentWeight);
  const [heightCm, setHeightCm] = useState<number>(currentHeight);
  const [systolicBp, setSystolicBp] = useState<number>(latestMetric?.systolicBp || 118);
  const [diastolicBp, setDiastolicBp] = useState<number>(latestMetric?.diastolicBp || 78);
  const [heartRate, setHeartRate] = useState<number>(latestMetric?.heartRateBpm || 68);
  const [waterMl, setWaterMl] = useState<number>(latestMetric?.waterMl || 1800);
  const [sleepHours, setSleepHours] = useState<number>(latestMetric?.sleepHours || 7.5);
  const [steps, setSteps] = useState<number>(latestMetric?.steps || 6500);
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  // Real-time BMI calculation
  const bmiInfo = calculateBmi(weightKg, heightCm);

  // BP classification helper
  const getBpStatus = (sys: number, dia: number) => {
    if (sys < 120 && dia < 80) return { label: 'Tối ưu', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (sys <= 129 && dia < 80) return { label: 'Bình thường', color: 'text-blue-700 bg-blue-50 border-blue-200' };
    if ((sys >= 130 && sys <= 139) || (dia >= 80 && dia <= 89)) return { label: 'Tiền tăng huyết áp', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    return { label: 'Cần chú ý', color: 'text-rose-700 bg-rose-50 border-rose-200' };
  };

  const bpStatus = getBpStatus(systolicBp, diastolicBp);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (weightKg <= 20 || weightKg >= 300) {
      alert('Vui lòng nhập cân nặng hợp lệ (20kg - 300kg)');
      return;
    }

    const { bmi } = calculateBmi(weightKg, heightCm);

    onAddMetric({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      weightKg: Number(weightKg),
      heightCm: Number(heightCm),
      bmi,
      systolicBp: Number(systolicBp),
      diastolicBp: Number(diastolicBp),
      heartRateBpm: Number(heartRate),
      waterMl: Number(waterMl),
      sleepHours: Number(sleepHours),
      steps: Number(steps),
      notes: notes.trim() || 'Cập nhật chỉ số sinh tồn',
    });

    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200/80 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header - Modern Biohacking SaaS Style (Oura/Whoop) */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
              <HeartPulse className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-white tracking-tight">Ghi nhận Chỉ số Sinh trắc</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-semibold border border-teal-500/30">
                  VITALS LOG
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Cập nhật cân nặng, huyết áp, nhịp tim và đồng bộ tự động vào hồ sơ sức khỏe
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Live BMI Preview Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-50/70 via-emerald-50/50 to-cyan-50/70 border border-teal-100 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Ước tính BMI tức thời (WHO Châu Á)
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-mono font-bold text-slate-900">{bmiInfo.bmi}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg border ${bmiInfo.color}`}>
                  {bmiInfo.classification}
                </span>
              </div>
            </div>
            <div className="text-right text-xs text-slate-500">
              <div>Mục tiêu: <span className="font-semibold text-slate-800">{user.targetWeightKg || 65} kg</span></div>
              <div className="mt-0.5 text-[11px] text-teal-700 font-medium">
                {weightKg > (user.targetWeightKg || 65) 
                  ? `Cần giảm ${(weightKg - (user.targetWeightKg || 65)).toFixed(1)} kg`
                  : `Đạt chuẩn thể trạng`}
              </div>
            </div>
          </div>

          {/* Core Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* 1. Cân nặng */}
            <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all">
              <label className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-teal-600" />
                  <span>Cân nặng (kg)</span>
                </span>
                <span className="text-[11px] font-normal text-slate-400">Gần nhất: {currentWeight}kg</span>
              </label>

              <div className="mt-2.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setWeightKg(prev => Number(Math.max(30, prev - 0.5).toFixed(1)))}
                  className="w-8 h-8 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-sm flex items-center justify-center cursor-pointer transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  step="0.1"
                  min="20"
                  max="250"
                  required
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="flex-1 text-center font-mono font-bold text-xl py-1.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setWeightKg(prev => Number(Math.min(200, prev + 0.5).toFixed(1)))}
                  className="w-8 h-8 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-sm flex items-center justify-center cursor-pointer transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* 2. Chiều cao */}
            <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all">
              <label className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-blue-600" />
                  <span>Chiều cao (cm)</span>
                </span>
                <span className="text-[11px] font-normal text-slate-400">Chuẩn hồ sơ</span>
              </label>

              <div className="mt-2.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setHeightCm(prev => Math.max(100, prev - 1))}
                  className="w-8 h-8 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-sm flex items-center justify-center cursor-pointer transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  min="100"
                  max="240"
                  required
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="flex-1 text-center font-mono font-bold text-xl py-1.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setHeightCm(prev => Math.min(230, prev + 1))}
                  className="w-8 h-8 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-sm flex items-center justify-center cursor-pointer transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* 3. Huyết áp (Systolic / Diastolic) */}
            <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                  <span>Huyết áp (mmHg)</span>
                </label>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold border ${bpStatus.color}`}>
                  {bpStatus.label}
                </span>
              </div>

              <div className="mt-2.5 flex items-center gap-2">
                <input
                  type="number"
                  min="70"
                  max="220"
                  value={systolicBp}
                  onChange={(e) => setSystolicBp(Number(e.target.value))}
                  className="w-1/2 text-center font-mono font-bold text-lg py-1.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
                  placeholder="Tâm thu"
                />
                <span className="text-slate-400 font-bold">/</span>
                <input
                  type="number"
                  min="40"
                  max="140"
                  value={diastolicBp}
                  onChange={(e) => setDiastolicBp(Number(e.target.value))}
                  className="w-1/2 text-center font-mono font-bold text-lg py-1.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
                  placeholder="Tâm trương"
                />
              </div>
            </div>

            {/* 4. Nhịp tim khi nghỉ */}
            <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all">
              <label className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-teal-600" />
                  <span>Nhịp tim nghỉ (BPM)</span>
                </span>
                <span className="text-[11px] font-normal text-slate-400">Nhịp đập/phút</span>
              </label>

              <div className="mt-2.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setHeartRate(prev => Math.max(40, prev - 2))}
                  className="w-8 h-8 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-sm flex items-center justify-center cursor-pointer transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  min="40"
                  max="180"
                  value={heartRate}
                  onChange={(e) => setHeartRate(Number(e.target.value))}
                  className="flex-1 text-center font-mono font-bold text-xl py-1.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setHeartRate(prev => Math.min(180, prev + 2))}
                  className="w-8 h-8 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-sm flex items-center justify-center cursor-pointer transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* 5. Lượng nước đã uống */}
            <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all">
              <label className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Droplet className="w-3.5 h-3.5 text-blue-500" />
                  <span>Nước hôm nay (ml)</span>
                </span>
                <span className="text-[11px] text-blue-600 font-semibold">{waterMl} / {user.waterTargetMl}ml</span>
              </label>

              <div className="mt-2.5 flex items-center gap-2">
                <input
                  type="number"
                  step="50"
                  min="0"
                  max="6000"
                  value={waterMl}
                  onChange={(e) => setWaterMl(Number(e.target.value))}
                  className="flex-1 text-center font-mono font-bold text-lg py-1.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
                />
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setWaterMl(prev => prev + 250)}
                    className="px-2 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    +250
                  </button>
                  <button
                    type="button"
                    onClick={() => setWaterMl(prev => prev + 500)}
                    className="px-2 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    +500
                  </button>
                </div>
              </div>
            </div>

            {/* 6. Giấc ngủ đêm qua */}
            <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all">
              <label className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Giấc ngủ (giờ)</span>
                </span>
                <span className="text-[11px] font-normal text-slate-400">Mục tiêu {user.sleepTargetHours}h</span>
              </label>

              <div className="mt-2.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSleepHours(prev => Number(Math.max(1, prev - 0.5).toFixed(1)))}
                  className="w-8 h-8 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-sm flex items-center justify-center cursor-pointer transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="16"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(Number(e.target.value))}
                  className="flex-1 text-center font-mono font-bold text-xl py-1.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setSleepHours(prev => Number(Math.min(16, prev + 0.5).toFixed(1)))}
                  className="w-8 h-8 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-sm flex items-center justify-center cursor-pointer transition-colors"
                >
                  +
                </button>
              </div>
            </div>

          </div>

          {/* Ghi chú thể trạng */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Ghi chú thể trạng hoặc cảm nhận hôm nay (Tùy chọn)
            </label>
            <input
              type="text"
              placeholder="VD: Đo sau chạy bộ buổi sáng, cảm thấy sảng khoái..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
            />
          </div>

          {/* Action Footer */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs sm:text-sm font-semibold shadow-md transition-all cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Lưu chỉ số vào hồ sơ</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
