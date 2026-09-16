import React, { useState } from 'react';
import { 
  Flame, 
  Award, 
  Check, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Calendar, 
  Sparkles,
  Zap,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Habit } from '../types';

interface HabitsViewProps {
  habits: Habit[];
  onToggleHabitToday: (habitId: string) => void;
  onAddHabit: (habit: Omit<Habit, 'id'>) => void;
  onDeleteHabit: (habitId: string) => void;
}

export const HabitsView: React.FC<HabitsViewProps> = ({
  habits,
  onToggleHabitToday,
  onAddHabit,
  onDeleteHabit,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Habit['category']>('hydrate');
  const [targetUnit, setTargetUnit] = useState('2 lít nước');

  // Last 7 days helper
  const getPast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  };

  const past7Days = getPast7Days();

  const handleCheckIn = (habitId: string) => {
    onToggleHabitToday(habitId);
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddHabit({
      title,
      category,
      streak: 1,
      bestStreak: 1,
      completedDays: [new Date().toISOString().split('T')[0]],
      isCompletedToday: true,
      frequency: 'Hằng ngày',
      targetUnit,
    });

    setTitle('');
    setShowAddModal(false);
    confetti({ particleCount: 50, spread: 60 });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Thói quen & Chuỗi ngày</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Duy trì chuỗi ngày liên tục (streak) rèn luyện lối sống lành mạnh mỗi ngày
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Thêm thói quen</span>
        </button>
      </div>

      {/* Habits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {habits.map((habit) => {
          const isDoneToday = habit.isCompletedToday;
          const todayISO = new Date().toISOString().split('T')[0];

          return (
            <div
              key={habit.id}
              className={`p-6 rounded-2xl border transition-all ${
                isDoneToday 
                  ? 'bg-orange-50/20 border-orange-200 shadow-xs' 
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shadow-xs ${
                    isDoneToday ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-700'
                  }`}>
                    <Flame className="w-6 h-6 fill-current animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">{habit.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <span>Định mức: <strong>{habit.targetUnit}</strong></span>
                      <span>•</span>
                      <span>Kỷ lục: <strong>{habit.bestStreak} ngày</strong></span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (confirm(`Bạn có chắc muốn xóa thói quen "${habit.title}"?`)) {
                      onDeleteHabit(habit.id);
                    }
                  }}
                  className="text-slate-300 hover:text-red-500 p-1 transition-colors cursor-pointer"
                  title="Xóa thói quen"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Streak Counter Banner */}
              <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-orange-500" />
                  <span className="text-xs font-semibold text-slate-700">Chuỗi hiện tại:</span>
                  <span className="text-base font-mono font-bold text-orange-600">{habit.streak} ngày</span>
                </div>
                <button
                  onClick={() => handleCheckIn(habit.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isDoneToday
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-orange-500 text-white hover:bg-orange-600 shadow-xs'
                  }`}
                >
                  {isDoneToday ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Hôm nay đã xong!</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Điểm danh hôm nay</span>
                    </>
                  )}
                </button>
              </div>

              {/* 7-Day Visual Progress Track */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500">Nhật ký 7 ngày gần nhất</span>
                  <span className="text-xs text-slate-400">
                    {Math.round((habit.completedDays.length / 7) * 100)}% tuần này
                  </span>
                </div>
                <div className="grid grid-cols-7 gap-2 text-center">
                  {past7Days.map((dayStr) => {
                    const d = new Date(dayStr);
                    const dayLabel = d.toLocaleDateString('vi-VN', { weekday: 'narrow' });
                    const isDayDone = habit.completedDays.includes(dayStr);
                    const isToday = dayStr === todayISO;

                    return (
                      <div key={dayStr} className="flex flex-col items-center gap-1">
                        <span className={`text-[10px] uppercase font-semibold ${isToday ? 'text-orange-600 font-bold' : 'text-slate-400'}`}>
                          {dayLabel}
                        </span>
                        <div 
                          className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-mono transition-all ${
                            isDayDone 
                              ? 'bg-orange-500 text-white shadow-xs font-bold' 
                              : isToday
                              ? 'bg-orange-100 text-orange-700 border border-dashed border-orange-400'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {isDayDone ? '✓' : d.getDate()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Habit Science & Milestone Badges */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-amber-500" />
          <span>Huy hiệu Chinh phục Kỷ lục Thói quen</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2 font-bold text-sm">
              3d
            </div>
            <h4 className="text-xs font-bold text-slate-800">Khởi đầu tốt đẹp</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Duy trì liên tục 3 ngày</p>
            <span className="inline-block mt-2 text-[10px] font-bold text-emerald-600 px-2 py-0.5 rounded-full bg-emerald-50">
              ✓ Đã mở khóa
            </span>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-2 font-bold text-sm">
              7d
            </div>
            <h4 className="text-xs font-bold text-slate-800">Chiến binh 1 tuần</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Duy trì 7 ngày không gián đoạn</p>
            <span className="inline-block mt-2 text-[10px] font-bold text-blue-600 px-2 py-0.5 rounded-full bg-blue-50">
              ✓ Đã mở khóa
            </span>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mx-auto mb-2 font-bold text-sm">
              14d
            </div>
            <h4 className="text-xs font-bold text-slate-800">Định hình phản xạ</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Duy trì 14 ngày liên tiếp</p>
            <span className="inline-block mt-2 text-[10px] font-bold text-slate-400 px-2 py-0.5 rounded-full bg-slate-200">
              Cần thêm 5 ngày
            </span>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-2 font-bold text-sm">
              21d
            </div>
            <h4 className="text-xs font-bold text-slate-800">Bậc thầy Thói quen</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Thói quen trở thành tự nhiên</p>
            <span className="inline-block mt-2 text-[10px] font-bold text-slate-400 px-2 py-0.5 rounded-full bg-slate-200">
              Đang thử thách
            </span>
          </div>
        </div>
      </div>

      {/* Modal Create Habit */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                <span>Thêm thói quen mới</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Tên thói quen *
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Chạy bộ buổi sáng, đọc sách sức khỏe..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Danh mục
                </label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-orange-500"
                >
                  <option value="hydrate">Uống nước (Hydrate)</option>
                  <option value="exercise">Tập luyện / Cardio</option>
                  <option value="sleep">Giấc ngủ sinh học</option>
                  <option value="medication">Uống thuốc đúng giờ</option>
                  <option value="mindfulness">Thiền / Hít thở sâu</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Định mức mục tiêu (Target unit)
                </label>
                <input
                  type="text"
                  placeholder="VD: 2 lít, 30 phút, 1 lần..."
                  value={targetUnit}
                  onChange={(e) => setTargetUnit(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-orange-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-sm"
                >
                  Bắt đầu thói quen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
