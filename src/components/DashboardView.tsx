import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Flame, 
  Droplet, 
  Clock, 
  Target, 
  TrendingUp, 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  Calendar, 
  Plus, 
  ArrowRight,
  Check,
  HeartPulse,
  Scale,
  Activity,
  Moon,
  Footprints,
  ShieldCheck,
  Zap,
  ChevronRight,
  Wind,
  Pill,
  Utensils
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, HealthGoal, HealthTask, Habit, CalendarEvent, HealthMetricEntry, MealEntry, SupplementItem } from '../types';
import { calculateBmi } from '../data/initialData';
import { NutritionTrackerCard } from './NutritionTrackerCard';
import { SupplementTrackerCard } from './SupplementTrackerCard';
import { BreathingStudioModal } from './BreathingStudioModal';

interface DashboardViewProps {
  user: UserProfile;
  goals: HealthGoal[];
  tasks: HealthTask[];
  habits: Habit[];
  events: CalendarEvent[];
  latestMetric: HealthMetricEntry;
  meals?: MealEntry[];
  supplements?: SupplementItem[];
  onToggleTask: (taskId: string) => void;
  onSkipTask: (taskId: string) => void;
  onLogWater: (amountMl: number) => void;
  onNavigate: (tabId: string) => void;
  onOpenQuickTask: () => void;
  onOpenVitalsLogger?: () => void;
  onAddMetric?: (metric: Omit<HealthMetricEntry, 'id'>) => void;
  onAddMeal?: (meal: Omit<MealEntry, 'id'>) => void;
  onDeleteMeal?: (id: string) => void;
  onToggleSupplement?: (id: string) => void;
  onAddSupplement?: (item: Omit<SupplementItem, 'id' | 'streakDays' | 'takenToday'>) => void;
  onDeleteSupplement?: (id: string) => void;
  onLogMindfulness?: (minutes: number) => void;
}

// Circular SVG Progress Ring Component (Oura / Whoop Style)
const CircularDial: React.FC<{
  score: number;
  maxScore?: number;
  label: string;
  sublabel: string;
  colorClass: string;
  strokeColor: string;
  icon: React.ElementType;
}> = ({ score, maxScore = 100, label, sublabel, colorClass, strokeColor, icon: Icon }) => {
  const percentage = Math.min(100, Math.max(0, (score / maxScore) * 100));
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex items-center gap-4">
      <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
        <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 96 96">
          <circle
            cx="48"
            cy="48"
            r={radius}
            className="stroke-slate-100"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke={strokeColor}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xl font-bold font-mono text-slate-900 leading-none">{score}</span>
          <span className="text-[9px] text-slate-400 font-medium mt-0.5">/ {maxScore}</span>
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <Icon className={`w-3.5 h-3.5 ${colorClass}`} />
          <span>{label}</span>
        </div>
        <div className="mt-1 text-sm font-bold text-slate-900 truncate">
          {sublabel}
        </div>
        <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div 
            className="h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%`, backgroundColor: strokeColor }}
          />
        </div>
      </div>
    </div>
  );
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  goals,
  tasks,
  habits,
  events,
  latestMetric,
  meals = [],
  supplements = [],
  onToggleTask,
  onSkipTask,
  onLogWater,
  onNavigate,
  onOpenQuickTask,
  onOpenVitalsLogger,
  onAddMetric,
  onAddMeal,
  onDeleteMeal,
  onToggleSupplement,
  onAddSupplement,
  onDeleteSupplement,
  onLogMindfulness,
}) => {
  // Focus Timer state
  const [timerMode, setTimerMode] = useState<'stretch' | 'mindfulness' | 'workout'>('stretch');
  const [timeLeft, setTimeLeft] = useState<number>(10 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [showBreathingModal, setShowBreathingModal] = useState<boolean>(false);

  // Quick In-line Vitals adjustment state
  const [quickWeight, setQuickWeight] = useState<number>(latestMetric?.weightKg || user.weightKg);
  const [quickBpSys, setQuickBpSys] = useState<number>(latestMetric?.systolicBp || 118);
  const [quickBpDia, setQuickBpDia] = useState<number>(latestMetric?.diastolicBp || 78);
  const [quickHr, setQuickHr] = useState<number>(latestMetric?.heartRateBpm || 68);
  const [quickSavedToast, setQuickSavedToast] = useState(false);

  useEffect(() => {
    setQuickWeight(latestMetric?.weightKg || user.weightKg);
    setQuickBpSys(latestMetric?.systolicBp || 118);
    setQuickBpDia(latestMetric?.diastolicBp || 78);
    setQuickHr(latestMetric?.heartRateBpm || 68);
  }, [latestMetric, user]);

  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const setMode = (mode: 'stretch' | 'mindfulness' | 'workout', mins: number) => {
    setTimerMode(mode);
    setIsRunning(false);
    setTimeLeft(mins * 60);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const bmiInfo = calculateBmi(quickWeight, latestMetric?.heightCm || user.heightCm);

  // Statistics
  const completedTasksCount = tasks.filter(t => t.status === 'completed').length;
  const totalTasksCount = tasks.length;
  const completionRate = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;
  const currentWater = latestMetric?.waterMl || 1600;
  const waterPercent = Math.min(100, Math.round((currentWater / user.waterTargetMl) * 100));

  // Quick save in-line vitals
  const handleQuickSaveVitals = () => {
    if (onAddMetric) {
      const { bmi } = calculateBmi(quickWeight, latestMetric?.heightCm || user.heightCm);
      onAddMetric({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        weightKg: Number(quickWeight),
        heightCm: latestMetric?.heightCm || user.heightCm,
        bmi,
        systolicBp: Number(quickBpSys),
        diastolicBp: Number(quickBpDia),
        heartRateBpm: Number(quickHr),
        waterMl: currentWater,
        sleepHours: latestMetric?.sleepHours || 7.5,
        steps: latestMetric?.steps || 6500,
        notes: 'Cập nhật nhanh từ thanh Vitals Dock',
      });

      setQuickSavedToast(true);
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
      setTimeout(() => setQuickSavedToast(false), 3000);
    } else if (onOpenVitalsLogger) {
      onOpenVitalsLogger();
    }
  };

  const handleTaskClick = (taskId: string) => {
    onToggleTask(taskId);
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.7 }
    });
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Top Greeting & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Xin chào, {user.fullName}! 👋
            </h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
              ĐÃ ĐỒNG BỘ
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} • Hoàn thành {completedTasksCount}/{totalTasksCount} việc hôm nay
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Primary CTA: Open Vitals Logger Modal */}
          <button
            onClick={() => onOpenVitalsLogger ? onOpenVitalsLogger() : onNavigate('metrics')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Nhập cân nặng, huyết áp, nhịp tim ngay"
          >
            <HeartPulse className="w-4 h-4" />
            <span>Ghi chỉ số sức khỏe</span>
          </button>

          <button
            onClick={() => onNavigate('ai')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200/80 text-purple-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span className="hidden sm:inline">Hỏi AI</span>
          </button>

          <button
            onClick={onOpenQuickTask}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm việc</span>
          </button>
        </div>
      </div>

      {/* 🌟 HERO BIOMETRICS & VITALS QUICK-DOCK (Oura / Whoop Style) */}
      {/* This directly answers: "Chỗ để nhập liệu chỉ số sức khỏe đâu" right at the top! */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-800/80 relative overflow-hidden">
        
        {/* Ambient Glow FX */}
        <div className="absolute top-0 right-1/4 w-72 h-32 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
              <HeartPulse className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">Thanh Ghi Nhanh Chỉ Số Sinh Tồn</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-400/20 text-teal-300 font-semibold border border-teal-400/30">
                  VITALS DOCK
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Chạm để điều chỉnh nhanh hoặc bấm nút &quot;Ghi chỉ số chi tiết&quot; để mở biểu mẫu đầy đủ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {quickSavedToast && (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 animate-in fade-in">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                Đã lưu chỉ số!
              </span>
            )}

            <button
              type="button"
              onClick={handleQuickSaveVitals}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 active:bg-teal-600 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Lưu nhanh</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenVitalsLogger ? onOpenVitalsLogger() : onNavigate('metrics')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              <span>Mở form đầy đủ</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* 4 Interactive Quick Input Counters */}
        <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-5">
          
          {/* 1. Cân nặng & BMI */}
          <div className="bg-slate-800/80 hover:bg-slate-800 p-3.5 rounded-2xl border border-slate-700/80 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-teal-400" />
                <span>Cân nặng</span>
              </span>
              <span className="text-[10px] font-mono text-teal-300 font-bold">BMI {bmiInfo.bmi}</span>
            </div>

            <div className="mt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setQuickWeight(prev => Number(Math.max(30, prev - 0.5).toFixed(1)))}
                className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs flex items-center justify-center cursor-pointer transition-colors"
              >
                -
              </button>
              <div className="text-center font-mono">
                <span className="text-xl font-bold text-white">{quickWeight}</span>
                <span className="text-xs text-slate-400 ml-1">kg</span>
              </div>
              <button
                type="button"
                onClick={() => setQuickWeight(prev => Number(Math.min(200, prev + 0.5).toFixed(1)))}
                className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs flex items-center justify-center cursor-pointer transition-colors"
              >
                +
              </button>
            </div>
            
            <div className="mt-2 text-[10px] text-center text-teal-400 font-medium truncate">
              {bmiInfo.classification} (Mục tiêu: {user.targetWeightKg || 65}kg)
            </div>
          </div>

          {/* 2. Huyết áp (Blood Pressure) */}
          <div className="bg-slate-800/80 hover:bg-slate-800 p-3.5 rounded-2xl border border-slate-700/80 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
                <span>Huyết áp (BP)</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold">Tối ưu</span>
            </div>

            <div className="mt-2 flex items-center justify-center gap-1.5 font-mono">
              <input
                type="number"
                value={quickBpSys}
                onChange={(e) => setQuickBpSys(Number(e.target.value))}
                className="w-12 text-center bg-slate-700/90 rounded-lg text-lg font-bold text-white py-0.5 border border-slate-600 focus:outline-none focus:border-teal-400"
              />
              <span className="text-slate-400 font-bold">/</span>
              <input
                type="number"
                value={quickBpDia}
                onChange={(e) => setQuickBpDia(Number(e.target.value))}
                className="w-12 text-center bg-slate-700/90 rounded-lg text-lg font-bold text-white py-0.5 border border-slate-600 focus:outline-none focus:border-teal-400"
              />
              <span className="text-[11px] text-slate-400">mmHg</span>
            </div>

            <div className="mt-2 text-[10px] text-center text-slate-400">
              Chuẩn WHO &lt;120/80 mmHg
            </div>
          </div>

          {/* 3. Nhịp tim khi nghỉ */}
          <div className="bg-slate-800/80 hover:bg-slate-800 p-3.5 rounded-2xl border border-slate-700/80 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-teal-400" />
                <span>Nhịp tim nghỉ</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Resting HR</span>
            </div>

            <div className="mt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setQuickHr(prev => Math.max(40, prev - 2))}
                className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs flex items-center justify-center cursor-pointer transition-colors"
              >
                -
              </button>
              <div className="text-center font-mono">
                <span className="text-xl font-bold text-white">{quickHr}</span>
                <span className="text-xs text-slate-400 ml-1">bpm</span>
              </div>
              <button
                type="button"
                onClick={() => setQuickHr(prev => Math.min(180, prev + 2))}
                className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs flex items-center justify-center cursor-pointer transition-colors"
              >
                +
              </button>
            </div>

            <div className="mt-2 text-[10px] text-center text-emerald-400">
              Nhịp đập ổn định lý tưởng
            </div>
          </div>

          {/* 4. Lượng nước đã uống */}
          <div className="bg-slate-800/80 hover:bg-slate-800 p-3.5 rounded-2xl border border-slate-700/80 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Droplet className="w-3.5 h-3.5 text-blue-400" />
                <span>Nước uống</span>
              </span>
              <span className="text-[10px] text-blue-300 font-mono">{waterPercent}%</span>
            </div>

            <div className="mt-2 flex items-center justify-between">
              <div className="font-mono">
                <span className="text-xl font-bold text-white">{currentWater}</span>
                <span className="text-xs text-slate-400">/{user.waterTargetMl}ml</span>
              </div>
              <button
                type="button"
                onClick={() => onLogWater(250)}
                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                +250ml
              </button>
            </div>

            <div className="mt-2 w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-blue-400 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${waterPercent}%` }}
              />
            </div>
          </div>

        </div>

      </div>

      {/* 🌟 3 HERO TELEMETRY DIALS (Oura Ring & Whoop Cloned Aesthetic) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Dial 1: Điểm Thể trạng & Hồi phục (Readiness Score) */}
        <CircularDial
          score={88}
          maxScore={100}
          label="Điểm Sẵn sàng & Thể trạng"
          sublabel="Tối ưu • Sẵn sàng tập luyện"
          colorClass="text-teal-600"
          strokeColor="#0d9488"
          icon={ShieldCheck}
        />

        {/* Dial 2: Năng lượng & Vận động (Active Strain) */}
        <CircularDial
          score={completionRate || 75}
          maxScore={100}
          label="Năng lượng & Vận động"
          sublabel={`${completedTasksCount}/${totalTasksCount} việc • 6,500 bước`}
          colorClass="text-amber-500"
          strokeColor="#f59e0b"
          icon={Zap}
        />

        {/* Dial 3: Phục hồi & Giấc ngủ (Sleep Performance) */}
        <CircularDial
          score={85}
          maxScore={100}
          label="Chất lượng Giấc ngủ"
          sublabel={`${latestMetric?.sleepHours || 7.5}h ngủ • 95% mục tiêu`}
          colorClass="text-indigo-600"
          strokeColor="#6366f1"
          icon={Moon}
        />

      </div>

      {/* 🌟 DAILY READINESS & BIOMETRIC ADVISORY (Oura Readiness Insights Clone) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900">Khuyến nghị Phục hồi Sinh học Hôm nay</h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-bold border border-teal-200">
                READINESS ADVISORY
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-3xl">
              Chỉ số phục hồi của bạn đạt <strong>88/100 (Tối ưu)</strong>. Nhịp tim nghỉ <strong>{latestMetric?.heartRateBpm || 68} bpm</strong> và giấc ngủ <strong>{latestMetric?.sleepHours || 7.8}h</strong> cho thấy hệ thần kinh tự chủ đã hồi phục hoàn toàn. Cơ thể sẵn sàng cho các bài tập thể lực cường độ cao (Cardio Zone 3 hoặc rèn luyện sức bền).
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('metrics')}
          className="shrink-0 text-xs font-bold text-teal-700 hover:text-teal-800 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 transition-colors cursor-pointer flex items-center gap-1 self-end sm:self-center"
        >
          <span>Xem phân tích chi tiết</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Grid: Tasks & Health Sidebars */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Today Tasks & Goals */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Today Tasks Protocol */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>Việc cần làm hôm nay</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                    {completedTasksCount}/{totalTasksCount}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Tích chọn để cập nhật tiến độ tự động</p>
              </div>

              <button
                onClick={() => onNavigate('goals')}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer"
              >
                Xem chi tiết →
              </button>
            </div>

            {/* Tasks list */}
            <div className="mt-4 space-y-2">
              {tasks.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Chưa có nhiệm vụ nào hôm nay. Bấm &quot;Thêm việc&quot; để bắt đầu!
                </div>
              ) : (
                tasks.map((task) => {
                  const isDone = task.status === 'completed';
                  return (
                    <div
                      key={task.id}
                      className={`group flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                        isDone 
                          ? 'bg-slate-50/70 border-slate-100 text-slate-400' 
                          : 'bg-white border-slate-200/70 hover:border-slate-300 text-slate-800 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          type="button"
                          onClick={() => handleTaskClick(task.id)}
                          className={`w-5 h-5 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                            isDone 
                              ? 'bg-emerald-600 text-white' 
                              : 'border-2 border-slate-300 hover:border-emerald-500'
                          }`}
                        >
                          {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>
                        
                        <div className="min-w-0">
                          <p className={`text-sm font-medium truncate ${isDone ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                            <span>{task.time}</span>
                            <span>•</span>
                            <span>{task.targetValue}</span>
                          </div>
                        </div>
                      </div>

                      {!isDone && (
                        <button
                          onClick={() => onSkipTask(task.id)}
                          className="opacity-0 group-hover:opacity-100 text-[11px] text-slate-400 hover:text-slate-600 px-2 py-1 rounded-lg hover:bg-slate-100 transition-all cursor-pointer shrink-0"
                        >
                          Bỏ qua
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 🌟 NUTRITION & MACRO TRACKER CARD (MyFitnessPal / MacroFactor Cloned Feature) */}
          {onAddMeal && onDeleteMeal && (
            <NutritionTrackerCard
              meals={meals}
              targetCalories={2100}
              onAddMeal={onAddMeal}
              onDeleteMeal={onDeleteMeal}
            />
          )}

          {/* Active Goals */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-emerald-600" />
                  <span>Mục tiêu đang thực hiện</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Tiến độ theo tuần và tháng</p>
              </div>

              <button
                onClick={() => onNavigate('goals')}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer"
              >
                Tất cả mục tiêu →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {goals.slice(0, 4).map((goal) => (
                <div key={goal.id} className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 transition-all">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-500">
                      {goal.timeframe === 'day' ? 'Hôm nay' : goal.timeframe === 'week' ? 'Tuần này' : 'Tháng này'}
                    </span>
                    <span className="font-bold font-mono text-emerald-700">{goal.progress}%</span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-800 mt-1.5 truncate">{goal.title}</h4>
                  <div className="mt-2.5 w-full bg-slate-200/70 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500" 
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right 1 Col: Focus Timer, Hydration Station, Sleep Architecture, Energy Balance, Upcoming Events */}
        <div className="space-y-6">

          {/* 🌟 HYDRATION STATION (Waterllama / MyFitnessPal Clone) */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Droplet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Trạm Nước Uống</h3>
                  <span className="text-[10px] text-slate-400 font-mono">HYDRATION TRACKER</span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-blue-600">
                {currentWater} / {user.waterTargetMl} ml
              </span>
            </div>

            {/* Visual Glass Counter (8 glasses standard) */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span>Tiến độ ({waterPercent}%)</span>
                <span className="font-semibold text-slate-700 font-mono">
                  {Math.min(8, Math.round(currentWater / 250))} / 8 ly chuẩn (250ml)
                </span>
              </div>

              {/* 8 visual glass icons */}
              <div className="grid grid-cols-8 gap-1.5 py-1">
                {Array.from({ length: 8 }).map((_, idx) => {
                  const glassWaterNeeded = (idx + 1) * 250;
                  const isFilled = currentWater >= glassWaterNeeded;
                  const isPartial = !isFilled && currentWater > (idx * 250);
                  return (
                    <div
                      key={idx}
                      className={`h-8 rounded-lg flex items-end p-0.5 justify-center transition-all ${
                        isFilled 
                          ? 'bg-blue-500 text-white shadow-xs' 
                          : isPartial 
                            ? 'bg-blue-100 text-blue-500 border border-blue-200' 
                            : 'bg-slate-100 text-slate-300'
                      }`}
                      title={`Ly ${idx + 1}: ${glassWaterNeeded}ml`}
                    >
                      <Droplet className={`w-3.5 h-3.5 mb-1 ${isFilled ? 'fill-white' : isPartial ? 'fill-blue-400' : ''}`} />
                    </div>
                  );
                })}
              </div>

              {/* Main Progress Bar */}
              <div className="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, waterPercent)}%` }}
                />
              </div>
            </div>

            {/* Quick-tap Presets */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 block mb-2">Ghi nhanh lượng nước nạp:</span>
              <div className="grid grid-cols-4 gap-1.5">
                <button
                  type="button"
                  onClick={() => onLogWater(150)}
                  className="py-1.5 px-1 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200/80 hover:border-blue-200 text-slate-700 hover:text-blue-700 text-[11px] font-semibold transition-all cursor-pointer text-center"
                >
                  +150ml
                </button>
                <button
                  type="button"
                  onClick={() => onLogWater(250)}
                  className="py-1.5 px-1 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-[11px] font-bold transition-all cursor-pointer text-center shadow-xs"
                >
                  +250ml
                </button>
                <button
                  type="button"
                  onClick={() => onLogWater(500)}
                  className="py-1.5 px-1 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200/80 hover:border-blue-200 text-slate-700 hover:text-blue-700 text-[11px] font-semibold transition-all cursor-pointer text-center"
                >
                  +500ml
                </button>
                <button
                  type="button"
                  onClick={() => onLogWater(-250)}
                  className="py-1.5 px-1 rounded-xl bg-slate-50 hover:bg-rose-50 border border-slate-200/80 hover:border-rose-200 text-slate-500 hover:text-rose-600 text-[11px] font-medium transition-all cursor-pointer text-center"
                  title="Giảm bớt 250ml nếu bấm nhầm"
                >
                  -250ml
                </button>
              </div>
            </div>
          </div>

          {/* 🌟 ENERGY & CALORIE EXPENDITURE (Whoop Strain / MyFitnessPal Clone) */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Cân Bằng Năng Lượng</h3>
                  <span className="text-[10px] text-slate-400 font-mono">ENERGY EXPENDITURE</span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-orange-600">
                ~2,100 kcal
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] text-slate-400 block">Chuyển hóa BMR</span>
                <span className="text-lg font-bold font-mono text-slate-800">1,620</span>
                <span className="text-[10px] text-slate-400 ml-1">kcal</span>
              </div>
              <div className="p-3 rounded-2xl bg-orange-50/60 border border-orange-100">
                <span className="text-[11px] text-orange-600 block font-medium">Vận động (Active)</span>
                <span className="text-lg font-bold font-mono text-orange-800">480</span>
                <span className="text-[10px] text-orange-600 ml-1">kcal</span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100 text-emerald-800 font-medium">
              <span>Mục tiêu nạp calo giữ cân:</span>
              <span className="font-mono font-bold">1,850 kcal/ngày</span>
            </div>
          </div>

          {/* 🌟 SLEEP STAGE ARCHITECTURE (Oura Ring Sleep Breakdown Clone) */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Phân Bổ Giai Đoạn Ngủ</h3>
                  <span className="text-[10px] text-slate-400 font-mono">SLEEP ARCHITECTURE</span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-600">
                {latestMetric?.sleepHours || 7.8}h ngủ
              </span>
            </div>

            {/* Stage Proportional Bar */}
            <div className="mt-4">
              <div className="h-3 w-full rounded-full bg-slate-100 flex overflow-hidden p-0.5 gap-0.5">
                <div className="bg-indigo-700 h-full rounded-l-full" style={{ width: '22%' }} title="Ngủ sâu 22%"></div>
                <div className="bg-purple-500 h-full" style={{ width: '24%' }} title="Ngủ REM 24%"></div>
                <div className="bg-indigo-300 h-full rounded-r-full" style={{ width: '54%' }} title="Ngủ nông 54%"></div>
              </div>

              <div className="grid grid-cols-3 gap-1 mt-3 text-center text-xs">
                <div className="p-2 rounded-xl bg-indigo-50/60 border border-indigo-100">
                  <span className="text-[10px] text-indigo-700 font-bold block">Ngủ sâu (22%)</span>
                  <span className="font-mono font-bold text-slate-800 text-xs">1h 43m</span>
                </div>
                <div className="p-2 rounded-xl bg-purple-50/60 border border-purple-100">
                  <span className="text-[10px] text-purple-700 font-bold block">Ngủ REM (24%)</span>
                  <span className="font-mono font-bold text-slate-800 text-xs">1h 52m</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-600 font-bold block">Ngủ nông (54%)</span>
                  <span className="font-mono font-bold text-slate-800 text-xs">4h 13m</span>
                </div>
              </div>
            </div>
          </div>

          {/* 🌟 SUPPLEMENT & MEDICATION ROUTINE (Apple Health / Whoop Cloned Feature) */}
          {onToggleSupplement && onAddSupplement && onDeleteSupplement && (
            <SupplementTrackerCard
              supplements={supplements}
              onToggleTaken={onToggleSupplement}
              onAddSupplement={onAddSupplement}
              onDeleteSupplement={onDeleteSupplement}
            />
          )}

          {/* Minimalist Focus Health Timer */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md border border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-white">Đồng hồ Tập trung</h3>
              </div>
              <span className="text-[10px] text-emerald-400 uppercase font-mono tracking-wider font-semibold">
                Focus Mode
              </span>
            </div>

            {/* Mode selection buttons */}
            <div className="flex items-center gap-1 mt-4 p-1 bg-slate-800/80 rounded-xl text-xs">
              <button
                onClick={() => setMode('stretch', 10)}
                className={`flex-1 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  timerMode === 'stretch' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Giãn cơ
              </button>
              <button
                onClick={() => setMode('mindfulness', 15)}
                className={`flex-1 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  timerMode === 'mindfulness' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Thiền
              </button>
              <button
                onClick={() => setMode('workout', 25)}
                className={`flex-1 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  timerMode === 'workout' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Cardio
              </button>
            </div>

            {/* Timer countdown display */}
            <div className="my-6 text-center">
              <div className="text-5xl font-mono font-bold tracking-tight text-emerald-400">
                {formatTimer(timeLeft)}
              </div>
              <p className="text-xs text-slate-400 mt-2">
                {timerMode === 'stretch' && 'Nghỉ mắt và giãn cơ vai gáy'}
                {timerMode === 'mindfulness' && 'Hít thở sâu 4-7-8 giúp tĩnh tâm'}
                {timerMode === 'workout' && 'Vận động thể chất kích thích tuần hoàn'}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-sm transition-transform active:scale-95 cursor-pointer"
              >
                {isRunning ? <Pause className="w-3.5 h-3.5 fill-slate-950" /> : <Play className="w-3.5 h-3.5 fill-slate-950" />}
                <span>{isRunning ? 'Tạm dừng' : 'Bắt đầu'}</span>
              </button>
              <button
                onClick={() => {
                  setIsRunning(false);
                  setTimeLeft((timerMode === 'stretch' ? 10 : timerMode === 'mindfulness' ? 15 : 25) * 60);
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Đặt lại"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 🌟 Quick Launch Bio-Breath Studio */}
            <div className="mt-4 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowBreathingModal(true)}
                className="w-full py-2.5 px-3 rounded-2xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/40 text-teal-300 hover:text-teal-200 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Wind className="w-4 h-4 text-teal-400" />
                <span>Mở Phòng Thở Sinh Học (Bio-Breath Studio)</span>
              </button>
            </div>
          </div>

          {/* Upcoming Schedule */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-purple-600" />
                <h3 className="font-bold text-sm text-slate-900">Lịch khám & Nhắc nhở</h3>
              </div>
              <button 
                onClick={() => onNavigate('calendar')}
                className="text-xs text-purple-600 hover:text-purple-700 font-semibold cursor-pointer"
              >
                Mở lịch →
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {events.slice(0, 3).map((evt) => (
                <div key={evt.id} className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 shrink-0"></div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{evt.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {evt.date} • {evt.startTime}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Tip */}
          <div className="bg-purple-50/60 border border-purple-100 rounded-3xl p-5">
            <div className="flex items-center gap-1.5 text-purple-800 font-bold text-xs">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Gợi ý hôm nay từ AI</span>
            </div>
            <p className="text-xs text-purple-900 mt-2 leading-relaxed">
              &quot;Duy trì thói quen với nguyên tắc <strong>2 phút</strong>: Bắt đầu bài tập bằng 2 phút khởi động nhẹ giúp giảm sức ỳ tâm lý.&quot;
            </p>
            <button
              onClick={() => onNavigate('ai')}
              className="mt-2.5 text-xs font-bold text-purple-700 hover:text-purple-900 inline-flex items-center gap-1 cursor-pointer"
            >
              Hỏi bác sĩ AI lời khuyên chi tiết →
            </button>
          </div>

        </div>

      </div>

      {/* 🌟 Bio-Breath Studio Modal */}
      {showBreathingModal && (
        <BreathingStudioModal
          isOpen={showBreathingModal}
          onClose={() => setShowBreathingModal(false)}
          onLogMindfulness={onLogMindfulness}
        />
      )}

    </div>
  );
};
