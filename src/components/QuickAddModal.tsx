import React, { useState } from 'react';
import { 
  X, 
  CheckSquare, 
  Target, 
  Flame, 
  Calendar as CalendarIcon, 
  HeartPulse, 
  Plus, 
  Clock, 
  Droplet,
  Scale
} from 'lucide-react';
import { HealthGoal, HealthTask, Habit, CalendarEvent, HealthMetricEntry, UserProfile } from '../types';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  goals: HealthGoal[];
  user: UserProfile;
  onAddTask: (task: Omit<HealthTask, 'id'>) => void;
  onAddGoal: (goal: Omit<HealthGoal, 'id'>) => void;
  onAddHabit: (habit: Omit<Habit, 'id'>) => void;
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  onAddMetric: (metric: Omit<HealthMetricEntry, 'id'>) => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  goals,
  user,
  onAddTask,
  onAddGoal,
  onAddHabit,
  onAddEvent,
  onAddMetric,
}) => {
  const [activeType, setActiveType] = useState<'task' | 'goal' | 'habit' | 'event' | 'metric'>('task');

  // Task state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskTime, setTaskTime] = useState('07:30');
  const [taskCategory, setTaskCategory] = useState<HealthTask['category']>('exercise');
  const [taskTarget, setTaskTarget] = useState('30 phút');
  const [taskGoalId, setTaskGoalId] = useState(goals[0]?.id || '');

  // Goal state
  const [goalTitle, setGoalTitle] = useState('');
  const [goalCategory, setGoalCategory] = useState<HealthGoal['category']>('exercise');
  const [goalTimeframe, setGoalTimeframe] = useState<HealthGoal['timeframe']>('week');
  const [goalTargetDate, setGoalTargetDate] = useState('2026-10-31');

  // Habit state
  const [habitTitle, setHabitTitle] = useState('');
  const [habitCategory, setHabitCategory] = useState<Habit['category']>('hydrate');
  const [habitTargetUnit, setHabitTargetUnit] = useState('2 lít nước');

  // Event state
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventTime, setEventTime] = useState('09:00');
  const [eventCategory, setEventCategory] = useState<CalendarEvent['category']>('appointment');
  const [eventLocation, setEventLocation] = useState('');

  // Metric state
  const [weightKg, setWeightKg] = useState(user.weightKg);
  const [systolicBp, setSystolicBp] = useState(120);
  const [diastolicBp, setDiastolicBp] = useState(80);
  const [heartRate, setHeartRate] = useState(72);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeType === 'task') {
      if (!taskTitle.trim()) return;
      onAddTask({
        title: taskTitle.trim(),
        time: taskTime,
        category: taskCategory,
        frequency: 'daily',
        status: 'pending',
        targetValue: taskTarget,
        goalId: taskGoalId || undefined,
      });
    } else if (activeType === 'goal') {
      if (!goalTitle.trim()) return;
      onAddGoal({
        title: goalTitle.trim(),
        category: goalCategory,
        timeframe: goalTimeframe,
        targetDate: goalTargetDate,
        progress: 0,
        status: 'active',
      });
    } else if (activeType === 'habit') {
      if (!habitTitle.trim()) return;
      onAddHabit({
        title: habitTitle.trim(),
        category: habitCategory,
        streak: 0,
        bestStreak: 0,
        completedDays: [],
        isCompletedToday: false,
        frequency: 'Hằng ngày',
        targetUnit: habitTargetUnit,
      });
    } else if (activeType === 'event') {
      if (!eventTitle.trim()) return;
      onAddEvent({
        title: eventTitle.trim(),
        date: eventDate,
        startTime: eventTime,
        category: eventCategory,
        location: eventLocation || undefined,
        reminderMinutes: 30,
      });
    } else if (activeType === 'metric') {
      const heightM = user.heightCm / 100;
      const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));
      onAddMetric({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        weightKg: Number(weightKg),
        heightCm: user.heightCm,
        bmi,
        systolicBp: Number(systolicBp),
        diastolicBp: Number(diastolicBp),
        heartRateBpm: Number(heartRate),
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Thêm nhanh hoạt động</h3>
              <p className="text-xs text-slate-500">Tạo mới mục tiêu, nhiệm vụ, thói quen hoặc ghi nhận chỉ số</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Type Selector */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 grid grid-cols-5 gap-1.5">
          <button
            type="button"
            onClick={() => setActiveType('task')}
            className={`py-2 px-1 text-center rounded-xl flex flex-col items-center gap-1 transition-all cursor-pointer ${
              activeType === 'task' ? 'bg-white text-emerald-700 font-bold shadow-xs ring-1 ring-emerald-200' : 'text-slate-600 hover:bg-white/50'
            }`}
          >
            <CheckSquare className="w-4 h-4 text-emerald-600" />
            <span className="text-[11px]">Nhiệm vụ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveType('goal')}
            className={`py-2 px-1 text-center rounded-xl flex flex-col items-center gap-1 transition-all cursor-pointer ${
              activeType === 'goal' ? 'bg-white text-emerald-700 font-bold shadow-xs ring-1 ring-emerald-200' : 'text-slate-600 hover:bg-white/50'
            }`}
          >
            <Target className="w-4 h-4 text-blue-600" />
            <span className="text-[11px]">Mục tiêu</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveType('habit')}
            className={`py-2 px-1 text-center rounded-xl flex flex-col items-center gap-1 transition-all cursor-pointer ${
              activeType === 'habit' ? 'bg-white text-emerald-700 font-bold shadow-xs ring-1 ring-emerald-200' : 'text-slate-600 hover:bg-white/50'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-500" />
            <span className="text-[11px]">Thói quen</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveType('event')}
            className={`py-2 px-1 text-center rounded-xl flex flex-col items-center gap-1 transition-all cursor-pointer ${
              activeType === 'event' ? 'bg-white text-emerald-700 font-bold shadow-xs ring-1 ring-emerald-200' : 'text-slate-600 hover:bg-white/50'
            }`}
          >
            <CalendarIcon className="w-4 h-4 text-purple-600" />
            <span className="text-[11px]">Lịch hẹn</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveType('metric')}
            className={`py-2 px-1 text-center rounded-xl flex flex-col items-center gap-1 transition-all cursor-pointer ${
              activeType === 'metric' ? 'bg-white text-emerald-700 font-bold shadow-xs ring-1 ring-emerald-200' : 'text-slate-600 hover:bg-white/50'
            }`}
          >
            <HeartPulse className="w-4 h-4 text-rose-500" />
            <span className="text-[11px]">Chỉ số</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* TASK FORM */}
          {activeType === 'task' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tên nhiệm vụ sức khỏe *</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Vd: Chạy bộ 30 phút, Uống ly nước ấm..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Thời gian thực hiện</label>
                  <input
                    type="time"
                    value={taskTime}
                    onChange={(e) => setTaskTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Định mức / Mục tiêu</label>
                  <input
                    type="text"
                    value={taskTarget}
                    onChange={(e) => setTaskTarget(e.target.value)}
                    placeholder="30 phút, 500ml..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phân loại</label>
                  <select
                    value={taskCategory}
                    onChange={(e: any) => setTaskCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="exercise">Tập thể dục / Vận động</option>
                    <option value="hydrate">Uống nước</option>
                    <option value="nutrition">Dinh dưỡng / Bữa ăn</option>
                    <option value="sleep">Giấc ngủ / Nghỉ ngơi</option>
                    <option value="medication">Uống thuốc theo đơn</option>
                    <option value="mindfulness">Thiền / Giảm stress</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gắn với Mục tiêu</label>
                  <select
                    value={taskGoalId}
                    onChange={(e) => setTaskGoalId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm truncate"
                  >
                    <option value="">(Không gắn mục tiêu)</option>
                    {goals.map(g => (
                      <option key={g.id} value={g.id}>{g.title}</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          {/* GOAL FORM */}
          {activeType === 'goal' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tiêu đề Mục tiêu Sức khỏe *</label>
                <input
                  type="text"
                  required
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder="Vd: Giảm cân về 65kg, Chạy bộ 5000 bước/ngày..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Chu kỳ thực hiện</label>
                  <select
                    value={goalTimeframe}
                    onChange={(e: any) => setGoalTimeframe(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="day">Trong ngày</option>
                    <option value="week">Theo tuần (Sprint 1 tuần)</option>
                    <option value="month">Theo tháng</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Hạn hoàn thành</label>
                  <input
                    type="date"
                    value={goalTargetDate}
                    onChange={(e) => setGoalTargetDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>
            </>
          )}

          {/* HABIT FORM */}
          {activeType === 'habit' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tên thói quen rèn luyện *</label>
                <input
                  type="text"
                  required
                  value={habitTitle}
                  onChange={(e) => setHabitTitle(e.target.value)}
                  placeholder="Vd: Uống đủ 2L nước, Đọc sách y học 15p..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phân loại</label>
                  <select
                    value={habitCategory}
                    onChange={(e: any) => setHabitCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  >
                    <option value="hydrate">Nước uống</option>
                    <option value="exercise">Vận động</option>
                    <option value="sleep">Giấc ngủ</option>
                    <option value="mindfulness">Tâm trí & Thiền</option>
                    <option value="nutrition">Dinh dưỡng</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Định mức mỗi ngày</label>
                  <input
                    type="text"
                    value={habitTargetUnit}
                    onChange={(e) => setHabitTargetUnit(e.target.value)}
                    placeholder="2 lít nước, 30 phút..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>
            </>
          )}

          {/* EVENT FORM */}
          {activeType === 'event' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tiêu đề lịch hẹn / Sự kiện *</label>
                <input
                  type="text"
                  required
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="Vd: Khám nha khoa, Tiêm vắc-xin, Lịch uống thuốc..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ngày diễn ra</label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Giờ bắt đầu</label>
                  <input
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Địa điểm (nếu có)</label>
                <input
                  type="text"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  placeholder="Phòng khám, Bệnh viện..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>
            </>
          )}

          {/* METRIC FORM */}
          {activeType === 'metric' && (
            <>
              <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-800">
                Ghi nhận chỉ số thể chất hôm nay để theo dõi biến động cân nặng, huyết áp và chỉ số BMI.
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Cân nặng hiện tại (kg) *</label>
                  <input
                    type="number"
                    step={0.1}
                    required
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nhịp tim (BPM)</label>
                  <input
                    type="number"
                    value={heartRate}
                    onChange={(e) => setHeartRate(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Huyết áp tâm thu (mmHg)</label>
                  <input
                    type="number"
                    value={systolicBp}
                    onChange={(e) => setSystolicBp(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Huyết áp tâm trương (mmHg)</label>
                  <input
                    type="number"
                    value={diastolicBp}
                    onChange={(e) => setDiastolicBp(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>
            </>
          )}

          {/* Footer buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs cursor-pointer"
            >
              Lưu hoạt động
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
