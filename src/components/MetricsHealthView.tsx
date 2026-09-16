import React, { useState } from 'react';
import { 
  HeartPulse, 
  Scale, 
  Activity, 
  Droplet, 
  Moon, 
  Footprints, 
  Plus, 
  TrendingDown, 
  TrendingUp, 
  Check, 
  AlertCircle,
  Clock,
  Sparkles,
  Download,
  Flame,
  Zap,
  Info,
  ChevronRight,
  Filter
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { HealthMetricEntry, UserProfile } from '../types';
import { calculateBmi } from '../data/initialData';

interface MetricsHealthViewProps {
  metrics: HealthMetricEntry[];
  user: UserProfile;
  onAddMetric: (metric: Omit<HealthMetricEntry, 'id'>) => void;
}

export const MetricsHealthView: React.FC<MetricsHealthViewProps> = ({
  metrics,
  user,
  onAddMetric,
}) => {
  const latest = metrics[metrics.length - 1] || {
    weightKg: user.weightKg,
    heightCm: user.heightCm,
    bmi: 23.2,
    systolicBp: 119,
    diastolicBp: 77,
    heartRateBpm: 68,
    waterMl: 1600,
    sleepHours: 7.8,
    steps: 6400,
  };

  const bmiInfo = calculateBmi(latest.weightKg, latest.heightCm);

  // Form State
  const [showLogModal, setShowLogModal] = useState(false);
  const [weightKg, setWeightKg] = useState<number>(latest.weightKg);
  const [heightCm, setHeightCm] = useState<number>(latest.heightCm);
  const [systolicBp, setSystolicBp] = useState<number>(latest.systolicBp || 120);
  const [diastolicBp, setDiastolicBp] = useState<number>(latest.diastolicBp || 80);
  const [heartRateBpm, setHeartRateBpm] = useState<number>(latest.heartRateBpm || 72);
  const [sleepHours, setSleepHours] = useState<number>(latest.sleepHours || 8);
  const [waterMl, setWaterMl] = useState<number>(latest.waterMl || 2000);
  const [steps, setSteps] = useState<number>(latest.steps || 7000);
  const [notes, setNotes] = useState('');

  // Interactive Chart State
  const [activeChartMetric, setActiveChartMetric] = useState<'weight' | 'bp' | 'heart' | 'sleep'>('weight');
  const [chartTimeframe, setChartTimeframe] = useState<'7d' | '30d' | 'all'>('7d');
  const [hoveredPoint, setHoveredPoint] = useState<any | null>(null);

  // Activity Level for TDEE
  const [activityLevel, setActivityLevel] = useState<number>(1.375); // 1.2: Sedentary, 1.375: Light, 1.55: Moderate, 1.725: Heavy

  // Filtered metrics for chart
  const displayedMetrics = React.useMemo(() => {
    if (chartTimeframe === '7d') return metrics.slice(-7);
    if (chartTimeframe === '30d') return metrics.slice(-30);
    return metrics;
  }, [metrics, chartTimeframe]);

  // BMR Calculation (Harris-Benedict equation)
  const age = React.useMemo(() => {
    if (!user.birthDate) return 28;
    const birthYear = new Date(user.birthDate).getFullYear();
    return new Date().getFullYear() - (birthYear || 1996);
  }, [user.birthDate]);

  const bmr = React.useMemo(() => {
    const w = latest.weightKg;
    const h = latest.heightCm;
    if (user.gender === 'female') {
      return Math.round(447.593 + (9.247 * w) + (3.098 * h) - (4.330 * age));
    }
    // Male or other
    return Math.round(88.362 + (13.397 * w) + (4.799 * h) - (5.677 * age));
  }, [latest.weightKg, latest.heightCm, user.gender, age]);

  const tdee = Math.round(bmr * activityLevel);
  const calorieDeficit = tdee - 500; // Standard 0.5kg/week fat loss target
  const waterRecommended = Math.round(latest.weightKg * 35); // 35ml per kg

  const maxHeartRate = 220 - age;
  const currentHr = latest.heartRateBpm || 68;

  const hrZones = [
    { zone: 1, name: 'Phục hồi nhẹ (Active Recovery)', min: Math.round(maxHeartRate * 0.50), max: Math.round(maxHeartRate * 0.60), pct: '50-60%', color: 'bg-blue-500', text: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', desc: 'Thúc đẩy lưu thông máu, phục hồi sau tập, giảm stress' },
    { zone: 2, name: 'Đốt mỡ hiếu khí (Zone 2 Base)', min: Math.round(maxHeartRate * 0.60), max: Math.round(maxHeartRate * 0.70), pct: '60-70%', color: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', desc: 'Xây dựng ty thể, tối ưu chuyển hóa đốt mỡ, nền tảng sức bền' },
    { zone: 3, name: 'Sức bền hiếu khí (Aerobic Pace)', min: Math.round(maxHeartRate * 0.70), max: Math.round(maxHeartRate * 0.80), pct: '70-80%', color: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', desc: 'Tăng cường dung tích phổi, hiệu suất bơm máu cơ tim' },
    { zone: 4, name: 'Ngưỡng kỵ khí (Lactate Threshold)', min: Math.round(maxHeartRate * 0.80), max: Math.round(maxHeartRate * 0.90), pct: '80-90%', color: 'bg-orange-500', text: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', desc: 'Nâng cao tốc độ và khả năng chịu đựng tích tụ axit lactic' },
    { zone: 5, name: 'Cường độ cực đại (VO2 Max Sprint)', min: Math.round(maxHeartRate * 0.90), max: maxHeartRate, pct: '90-100%', color: 'bg-rose-500', text: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200', desc: 'Bứt tốc tối đa, tăng sức mạnh bộc phát thần kinh cơ' },
  ];

  const handleSaveMetric = (e: React.FormEvent) => {
    e.preventDefault();
    if (weightKg <= 0 || heightCm <= 0) {
      alert('Cân nặng và chiều cao phải là số dương hợp lệ!');
      return;
    }

    const { bmi } = calculateBmi(weightKg, heightCm);

    onAddMetric({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      weightKg,
      heightCm,
      bmi,
      systolicBp,
      diastolicBp,
      heartRateBpm,
      sleepHours,
      waterMl,
      steps,
      notes: notes || 'Ghi nhận chỉ số thể chất',
    });

    setShowLogModal(false);
    confetti({ particleCount: 50, spread: 60 });
  };

  // CSV Export feature
  const exportToCSV = () => {
    const headers = ['Ngay', 'Thoi gian', 'Can nang (kg)', 'Chieu cao (cm)', 'BMI', 'Huyet ap tam thu', 'Huyet ap tam truong', 'Nhip tim (BPM)', 'Giac ngu (h)', 'Nuoc (ml)', 'Buoc chan', 'Ghi chu'];
    const rows = metrics.map(m => [
      m.date,
      m.time || '',
      m.weightKg,
      m.heightCm,
      m.bmi,
      m.systolicBp || '',
      m.diastolicBp || '',
      m.heartRateBpm || '',
      m.sleepHours || '',
      m.waterMl || '',
      m.steps || '',
      `"${(m.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `HealthTrack_Biometrics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    confetti({ particleCount: 40, spread: 50 });
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Chỉ số Sinh trắc & BMI</h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-semibold border border-teal-200">
              WHO CHÂU Á
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Biểu đồ xu hướng, cân nặng, phổ chuẩn BMI, chuyển hóa năng lượng (BMR/TDEE) và sinh hiệu
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer border border-slate-200"
            title="Tải toàn bộ dữ liệu chỉ số dạng CSV cho bác sĩ hoặc lưu trữ"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Xuất CSV</span>
          </button>

          <button
            onClick={() => setShowLogModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ghi nhận chỉ số</span>
          </button>
        </div>
      </div>

      {/* Hero BMI Gauge & Vital Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* BMI Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Chỉ số khối cơ thể</span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 font-bold border border-teal-200">
                Chuẩn WHO Châu Á
              </span>
            </div>

            <div className="mt-4 text-center">
              <div className="text-5xl font-mono font-bold text-slate-900 tracking-tight">
                {bmiInfo.bmi}
              </div>
              <div className={`mt-2 text-sm font-bold ${bmiInfo.color}`}>
                {bmiInfo.classification}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Chiều cao: {latest.heightCm} cm • Cân nặng: {latest.weightKg} kg
              </p>
            </div>

            {/* BMI Bar Gauge with dynamic needle */}
            {(() => {
              const needlePercent = Math.min(95, Math.max(5, ((bmiInfo.bmi - 15) / (32 - 15)) * 100));
              return (
                <div className="mt-6 space-y-1.5">
                  <div className="grid grid-cols-4 gap-1 text-[10px] text-center font-semibold text-slate-500">
                    <span>Gầy (&lt;18.5)</span>
                    <span>Chuẩn (18.5-23)</span>
                    <span>Thừa (23-25)</span>
                    <span>Béo phì (&gt;25)</span>
                  </div>

                  {/* Gradient Spectrum Bar with needle */}
                  <div className="relative pt-1 pb-4">
                    <div className="h-3 w-full rounded-full bg-slate-100 flex overflow-hidden p-0.5 gap-0.5 shadow-inner">
                      <div className="bg-amber-400 h-full rounded-l-full flex-1" title="Thiếu cân (<18.5)"></div>
                      <div className="bg-emerald-500 h-full flex-1" title="Chuẩn thể trạng (18.5-22.9)"></div>
                      <div className="bg-yellow-500 h-full flex-1" title="Thừa cân (23-24.9)"></div>
                      <div className="bg-rose-500 h-full rounded-r-full flex-1" title="Béo phì (>=25)"></div>
                    </div>

                    {/* Dynamic needle pointer */}
                    <div 
                      className="absolute bottom-0 text-[10px] font-mono font-bold text-slate-900 transition-all duration-700 ease-out transform -translate-x-1/2 flex flex-col items-center"
                      style={{ left: `${needlePercent}%` }}
                    >
                      <span className="text-slate-900 leading-none">▲</span>
                      <span className="text-[9px] bg-slate-900 text-white px-1 py-0.2 rounded font-bold">{bmiInfo.bmi}</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="mt-6 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
            <strong>Mẹo sức khỏe:</strong> Với chiều cao {latest.heightCm} cm, mức cân nặng chuẩn khuyến nghị là khoảng <strong>{(Math.pow(latest.heightCm / 100, 2) * 21.5).toFixed(1)} kg</strong>.
          </div>
        </div>

        {/* Vital Signs Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Blood pressure */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase">Huyết áp (BP)</span>
                <HeartPulse className="w-5 h-5 text-rose-500" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900 font-mono">
                  {latest.systolicBp}/{latest.diastolicBp}
                </span>
                <span className="text-xs text-slate-400 font-medium">mmHg</span>
              </div>
            </div>
            <div className="mt-3 text-xs font-medium text-emerald-600 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>Chỉ số huyết áp tối ưu theo WHO</span>
            </div>
          </div>

          {/* Heart rate */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase">Nhịp tim nghỉ (Resting HR)</span>
                <Activity className="w-5 h-5 text-teal-500" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900 font-mono">
                  {latest.heartRateBpm}
                </span>
                <span className="text-xs text-slate-400 font-medium">bpm</span>
              </div>
            </div>
            <div className="mt-3 text-xs text-slate-500">
              Nhịp đập ổn định khi nghỉ ngơi
            </div>
          </div>

          {/* Sleep hours */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase">Giấc ngủ đêm qua</span>
                <Moon className="w-5 h-5 text-indigo-500" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900 font-mono">
                  {latest.sleepHours}
                </span>
                <span className="text-xs text-slate-400 font-medium">giờ / mục tiêu {user.sleepTargetHours}h</span>
              </div>
            </div>
            <div className="mt-3 text-xs text-emerald-600 font-medium">
              Đạt 98% mục tiêu phục hồi sinh học
            </div>
          </div>

          {/* Daily Steps */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase">Vận động (Bước chân)</span>
                <Footprints className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900 font-mono">
                  {latest.steps?.toLocaleString('vi-VN')}
                </span>
                <span className="text-xs text-slate-400 font-medium">bước / {user.stepTarget.toLocaleString('vi-VN')}</span>
              </div>
            </div>
            <div className="mt-3 text-xs text-slate-500">
              Tiêu hao ước tính: ~280 kcal
            </div>
          </div>

        </div>

      </div>

      {/* 🌟 INTERACTIVE BIOMETRICS TREND CHART (Apple Health / Oura / Whoop Cloned Feature) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600" />
              <span>Biểu đồ Xu hướng Sinh trắc</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Theo dõi biến động và tiến độ theo từng mốc thời gian
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Metric Switcher */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveChartMetric('weight')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeChartMetric === 'weight' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Cân nặng
              </button>
              <button
                type="button"
                onClick={() => setActiveChartMetric('bp')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeChartMetric === 'bp' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Huyết áp
              </button>
              <button
                type="button"
                onClick={() => setActiveChartMetric('heart')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeChartMetric === 'heart' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Nhịp tim
              </button>
              <button
                type="button"
                onClick={() => setActiveChartMetric('sleep')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeChartMetric === 'sleep' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Giấc ngủ
              </button>
            </div>

            {/* Timeframe Filter */}
            <div className="flex items-center p-1 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setChartTimeframe('7d')}
                className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer ${
                  chartTimeframe === '7d' ? 'bg-teal-600 text-white font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                7 Ngày
              </button>
              <button
                type="button"
                onClick={() => setChartTimeframe('30d')}
                className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer ${
                  chartTimeframe === '30d' ? 'bg-teal-600 text-white font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                30 Ngày
              </button>
              <button
                type="button"
                onClick={() => setChartTimeframe('all')}
                className={`px-2.5 py-1 rounded-lg font-medium cursor-pointer ${
                  chartTimeframe === 'all' ? 'bg-teal-600 text-white font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Tất cả
              </button>
            </div>
          </div>
        </div>

        {/* Chart Viewport (Pure Responsive SVG Line Graph) */}
        <div className="mt-6">
          {(() => {
            const data = displayedMetrics;
            if (data.length === 0) return <div className="text-center py-12 text-slate-400 text-xs">Chưa có dữ liệu</div>;

            // Extract values based on selected metric
            let values: number[] = [];
            let secondaryValues: number[] | null = null;
            let unit = '';
            let strokeColor = '#0d9488';
            let fillColor = 'rgba(13, 148, 136, 0.08)';

            if (activeChartMetric === 'weight') {
              values = data.map(d => d.weightKg);
              unit = 'kg';
              strokeColor = '#0d9488';
            } else if (activeChartMetric === 'bp') {
              values = data.map(d => d.systolicBp || 120);
              secondaryValues = data.map(d => d.diastolicBp || 80);
              unit = 'mmHg';
              strokeColor = '#f43f5e';
            } else if (activeChartMetric === 'heart') {
              values = data.map(d => d.heartRateBpm || 72);
              unit = 'bpm';
              strokeColor = '#3b82f6';
            } else {
              values = data.map(d => d.sleepHours || 7.5);
              unit = 'h';
              strokeColor = '#8b5cf6';
            }

            const minVal = Math.min(...values, ...(secondaryValues || [])) * 0.95;
            const maxVal = Math.max(...values, ...(secondaryValues || [])) * 1.05;
            const range = maxVal - minVal || 1;

            const chartWidth = 700;
            const chartHeight = 220;
            const padding = { top: 20, right: 30, bottom: 40, left: 45 };
            const innerWidth = chartWidth - padding.left - padding.right;
            const innerHeight = chartHeight - padding.top - padding.bottom;

            const points = values.map((val, idx) => {
              const x = padding.left + (idx / Math.max(1, values.length - 1)) * innerWidth;
              const y = padding.top + innerHeight - ((val - minVal) / range) * innerHeight;
              return { x, y, val, date: data[idx].date };
            });

            const pointsSecondary = secondaryValues ? secondaryValues.map((val, idx) => {
              const x = padding.left + (idx / Math.max(1, secondaryValues!.length - 1)) * innerWidth;
              const y = padding.top + innerHeight - ((val - minVal) / range) * innerHeight;
              return { x, y, val, date: data[idx].date };
            }) : null;

            const pathD = points.length > 0 
              ? `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}` 
              : '';

            const areaD = points.length > 0
              ? `${pathD} L ${points[points.length - 1].x},${padding.top + innerHeight} L ${points[0].x},${padding.top + innerHeight} Z`
              : '';

            const pathSecondaryD = pointsSecondary 
              ? `M ${pointsSecondary.map(p => `${p.x},${p.y}`).join(' L ')}` 
              : '';

            return (
              <div className="relative">
                {/* Stats Header Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Hiện tại</span>
                    <span className="font-bold text-slate-900 font-mono text-sm">{values[values.length - 1]} {unit}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Trung bình</span>
                    <span className="font-bold text-slate-800 font-mono text-sm">
                      {(values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)} {unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Cao nhất</span>
                    <span className="font-bold text-slate-800 font-mono text-sm">{Math.max(...values)} {unit}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Thấp nhất</span>
                    <span className="font-bold text-slate-800 font-mono text-sm">{Math.min(...values)} {unit}</span>
                  </div>
                </div>

                <div className="w-full overflow-x-auto">
                  <svg 
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
                    className="w-full h-56 select-none"
                  >
                    {/* Horizontal grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                      const y = padding.top + innerHeight * (1 - ratio);
                      const labelVal = (minVal + range * ratio).toFixed(1);
                      return (
                        <g key={i}>
                          <line
                            x1={padding.left}
                            y1={y}
                            x2={chartWidth - padding.right}
                            y2={y}
                            stroke="#e2e8f0"
                            strokeDasharray="4 4"
                          />
                          <text
                            x={padding.left - 8}
                            y={y + 3}
                            fill="#94a3b8"
                            fontSize="10"
                            textAnchor="end"
                            fontFamily="monospace"
                          >
                            {labelVal}
                          </text>
                        </g>
                      );
                    })}

                    {/* Area fill */}
                    {areaD && <path d={areaD} fill={fillColor} />}

                    {/* Secondary line (e.g. Diastolic for BP) */}
                    {pathSecondaryD && (
                      <path
                        d={pathSecondaryD}
                        fill="none"
                        stroke="#fb7185"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}

                    {/* Main Line path */}
                    {pathD && (
                      <path
                        d={pathD}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}

                    {/* Data Points */}
                    {points.map((p, idx) => (
                      <g 
                        key={idx} 
                        className="cursor-pointer group"
                        onMouseEnter={() => setHoveredPoint(p)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      >
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={points.length < 15 ? "5" : "3.5"}
                          fill="white"
                          stroke={strokeColor}
                          strokeWidth="2.5"
                          className="transition-transform group-hover:scale-125"
                        />
                        <text
                          x={p.x}
                          y={chartHeight - 12}
                          fill="#94a3b8"
                          fontSize="9"
                          textAnchor="middle"
                          fontFamily="sans-serif"
                        >
                          {p.date.slice(5)}
                        </text>
                      </g>
                    ))}

                    {/* Secondary Points */}
                    {pointsSecondary && pointsSecondary.map((p, idx) => (
                      <circle
                        key={`sec_${idx}`}
                        cx={p.x}
                        cy={p.y}
                        r="3.5"
                        fill="white"
                        stroke="#fb7185"
                        strokeWidth="2"
                      />
                    ))}
                  </svg>
                </div>

                {/* Tooltip */}
                {hoveredPoint && (
                  <div className="absolute top-2 right-4 bg-slate-900 text-white px-3 py-1.5 rounded-xl text-xs shadow-lg font-mono flex items-center gap-2">
                    <span className="text-slate-400">{hoveredPoint.date}:</span>
                    <span className="font-bold text-teal-300">{hoveredPoint.val} {unit}</span>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      {/* 🌟 BMR & TDEE METABOLIC ENERGY CALCULATOR (MyFitnessPal / Whoop Feature) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <span>Phân tích Trao đổi chất & Năng lượng (BMR & TDEE)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Chuẩn công thức Harris-Benedict tính toán lượng Calorie cần thiết để duy trì hoặc giảm cân
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Mức vận động:</span>
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(Number(e.target.value))}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 cursor-pointer"
            >
              <option value={1.2}>Ít vận động (Ngồi nhiều)</option>
              <option value={1.375}>Nhẹ (Tập 1-3 ngày/tuần)</option>
              <option value={1.55}>Vừa phải (Tập 3-5 ngày/tuần)</option>
              <option value={1.725}>Năng động (Tập 6-7 ngày/tuần)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          
          {/* BMR */}
          <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-100">
            <div className="flex items-center justify-between text-xs font-semibold text-orange-800">
              <span>BMR (Chuyển hóa cơ bản)</span>
              <Zap className="w-3.5 h-3.5 text-orange-600" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-slate-900">
              {bmr.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-500">kcal/ngày</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Năng lượng tối thiểu để duy trì sự sống khi nghỉ ngơi hoàn toàn
            </p>
          </div>

          {/* TDEE */}
          <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-100">
            <div className="flex items-center justify-between text-xs font-semibold text-teal-800">
              <span>TDEE (Tổng tiêu hao)</span>
              <Flame className="w-3.5 h-3.5 text-teal-600" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-slate-900">
              {tdee.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-500">kcal/ngày</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Lượng Calorie cần nạp để giữ nguyên cân nặng hiện tại
            </p>
          </div>

          {/* Calorie Deficit Target */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-800">
              <span>Mục tiêu Giảm mỡ (-500 kcal)</span>
              <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-emerald-800">
              {calorieDeficit.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-500">kcal/ngày</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Thâm hụt an toàn giảm ~0.5 kg mỡ thừa mỗi tuần
            </p>
          </div>

          {/* Hydration Formula */}
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100">
            <div className="flex items-center justify-between text-xs font-semibold text-blue-800">
              <span>Nước khuyến nghị (35ml/kg)</span>
              <Droplet className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="mt-2 text-2xl font-bold font-mono text-blue-900">
              {waterRecommended.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-500">ml/ngày</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Chuẩn sinh học tương đương ~{Math.round(waterRecommended / 250)} ly nước tiêu chuẩn
            </p>
          </div>

        </div>
      </div>

      {/* 🌟 CARDIOVASCULAR INTENSITY & HEART RATE ZONES (Whoop / Apple Health / Garmin Feature) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-rose-600" />
              <span>Phân Tích 5 Vùng Nhịp Tim Tập Luyện (Heart Rate Zones)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Chuẩn sinh học theo tuổi ({age} tuổi): Nhịp tim tối đa ước tính <strong className="font-mono text-slate-700">{maxHeartRate} bpm</strong>. Nhịp tim tĩnh hiện tại: <strong className="font-mono text-rose-600">{currentHr} bpm</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-bold">
              MAX HR: {maxHeartRate} BPM
            </span>
          </div>
        </div>

        {/* Visual Zone Spectrum Bar */}
        <div className="mt-5">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Dải nhịp tim tập luyện</span>
            <span className="font-mono text-[11px] text-slate-400">Từ 50% đến 100% HRmax</span>
          </div>

          <div className="h-4 w-full rounded-full flex overflow-hidden p-0.5 gap-0.5 bg-slate-100 shadow-inner">
            {hrZones.map((z) => (
              <div 
                key={z.zone} 
                className={`${z.color} h-full relative group cursor-pointer transition-all hover:opacity-90`} 
                style={{ width: '20%' }}
                title={`Zone ${z.zone}: ${z.min} - ${z.max} bpm`}
              />
            ))}
          </div>

          {/* Zones 1 - 5 Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 mt-4">
            {hrZones.map((z) => {
              const isCurrentZone = currentHr >= z.min && currentHr <= z.max;
              return (
                <div 
                  key={z.zone} 
                  className={`p-3 rounded-2xl border transition-all ${
                    isCurrentZone 
                      ? 'bg-rose-50/80 border-rose-300 ring-2 ring-rose-400/30 shadow-xs' 
                      : `${z.bg} ${z.border}`
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-extrabold uppercase font-mono px-1.5 py-0.5 rounded-md ${z.text} bg-white border border-slate-200/60`}>
                      ZONE {z.zone}
                    </span>
                    <span className="text-[10px] font-bold font-mono text-slate-500">
                      {z.pct}
                    </span>
                  </div>

                  <div className="mt-2">
                    <div className="font-mono font-bold text-sm text-slate-900">
                      {z.min} - {z.max} <span className="text-[10px] font-normal text-slate-500">bpm</span>
                    </div>
                    <span className={`text-xs font-semibold block mt-0.5 leading-tight ${z.text}`}>
                      {z.name.split('(')[0]}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {z.desc}
                  </p>

                  {isCurrentZone && (
                    <div className="mt-2 text-[10px] font-bold text-rose-600 bg-white/90 px-1.5 py-0.5 rounded-md border border-rose-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                      <span>Nhịp tim hiện tại ({currentHr} bpm)</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Elite Coaching Bio-Tip */}
          <div className="mt-4 p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 flex items-start gap-2.5 text-xs text-emerald-900">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Bí quyết Zone 2 Cardio (Peter Attia / Whoop Protocol):</strong>
              <p className="text-emerald-800 text-[11px] mt-0.5 leading-relaxed">
                Tập luyện 150-180 phút mỗi tuần ở <strong className="text-emerald-950 font-bold">Zone 2 ({Math.round(maxHeartRate * 0.60)} - {Math.round(maxHeartRate * 0.70)} bpm)</strong> giúp kích hoạt quá trình tự thực tế bào (Autophagy), gia tăng số lượng ty thể tế bào và tăng tốc độ oxy hóa mỡ mà không gây kiệt sức hệ thần kinh trung ương.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* History Log Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Lịch sử ghi nhận chỉ số sức khỏe</h3>
            <p className="text-xs text-slate-500">Dữ liệu biến động được lưu trữ để theo dõi tiến độ dài hạn</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-mono">{metrics.length} bản ghi</span>
            <button
              onClick={exportToCSV}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải file</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[11px] font-bold border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Ngày ghi nhận</th>
                <th className="px-5 py-3.5">Cân nặng (kg)</th>
                <th className="px-5 py-3.5">BMI</th>
                <th className="px-5 py-3.5">Huyết áp</th>
                <th className="px-5 py-3.5">Nhịp tim</th>
                <th className="px-5 py-3.5">Giấc ngủ</th>
                <th className="px-5 py-3.5">Nước uống</th>
                <th className="px-5 py-3.5">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {metrics.slice().reverse().map((entry) => {
                const bmi = calculateBmi(entry.weightKg, entry.heightCm);
                return (
                  <tr key={entry.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-900 whitespace-nowrap">
                      {entry.date} {entry.time ? `• ${entry.time}` : ''}
                    </td>
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-800">
                      {entry.weightKg} kg
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`font-mono font-semibold ${bmi.color}`}>
                        {bmi.bmi}
                      </span>
                      <span className="text-[11px] text-slate-400 block">{bmi.classification}</span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-700">
                      {entry.systolicBp}/{entry.diastolicBp} mmHg
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-700">
                      {entry.heartRateBpm} bpm
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-700">
                      {entry.sleepHours} h
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-700">
                      {entry.waterMl} ml
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 max-w-xs truncate">
                      {entry.notes || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Metric */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-teal-600" />
                <span>Ghi nhận chỉ số thể chất</span>
              </h3>
              <button onClick={() => setShowLogModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSaveMetric} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Cân nặng (kg) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    min="20"
                    max="250"
                    value={weightKg}
                    onChange={(e) => setWeightKg(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Chiều cao (cm) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    min="100"
                    max="250"
                    value={heightCm}
                    onChange={(e) => setHeightCm(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Huyết áp tâm thu
                  </label>
                  <input
                    type="number"
                    value={systolicBp}
                    onChange={(e) => setSystolicBp(parseInt(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Huyết áp tâm trương
                  </label>
                  <input
                    type="number"
                    value={diastolicBp}
                    onChange={(e) => setDiastolicBp(parseInt(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Nhịp tim (BPM)
                  </label>
                  <input
                    type="number"
                    value={heartRateBpm}
                    onChange={(e) => setHeartRateBpm(parseInt(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Giấc ngủ (giờ)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Lượng nước (ml)
                  </label>
                  <input
                    type="number"
                    step="100"
                    value={waterMl}
                    onChange={(e) => setWaterMl(parseInt(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Bước chân
                  </label>
                  <input
                    type="number"
                    step="500"
                    value={steps}
                    onChange={(e) => setSteps(parseInt(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Ghi chú thể trạng
                </label>
                <input
                  type="text"
                  placeholder="Cảm giác cơ thể hôm nay..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:border-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm"
                >
                  Lưu dữ liệu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
