import React, { useState } from 'react';
import { 
  Pill, 
  Check, 
  Plus, 
  Flame, 
  Clock, 
  Trash2, 
  Sparkles, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SupplementItem } from '../types';

interface SupplementTrackerCardProps {
  supplements: SupplementItem[];
  onToggleTaken: (id: string) => void;
  onAddSupplement: (item: Omit<SupplementItem, 'id' | 'streakDays' | 'takenToday'>) => void;
  onDeleteSupplement: (id: string) => void;
}

export const SupplementTrackerCard: React.FC<SupplementTrackerCardProps> = ({
  supplements,
  onToggleTaken,
  onAddSupplement,
  onDeleteSupplement,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('1 viên (1000mg)');
  const [timeOfDay, setTimeOfDay] = useState('08:00');
  const [category, setCategory] = useState<SupplementItem['category']>('supplement');
  const [notes, setNotes] = useState('');

  const takenCount = supplements.filter((s) => s.takenToday).length;
  const totalCount = supplements.length;
  const percent = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0;

  const handleToggle = (id: string) => {
    onToggleTaken(id);
    const item = supplements.find((s) => s.id === id);
    if (item && !item.takenToday) {
      if (takenCount + 1 === totalCount) {
        confetti({ particleCount: 50, spread: 70 });
      }
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddSupplement({
      name: name.trim(),
      dosage: dosage.trim() || '1 viên',
      timeOfDay: timeOfDay || '08:00',
      category,
      notes: notes.trim() || undefined,
    });

    setName('');
    setNotes('');
    setShowAddForm(false);
    confetti({ particleCount: 25, spread: 45 });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
            <Pill className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <span>Lịch Uống Thuốc & Vitamin</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                SUPPLEMENTS
              </span>
            </h3>
            <p className="text-xs text-slate-500">Duy trì vi chất và dược phẩm đúng liều lượng, đúng thời điểm</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-indigo-600">
            {takenCount}/{totalCount} ({percent}%)
          </span>
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
            title="Thêm vi chất / thuốc mới"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
        <div 
          className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500" 
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Add Form (Collapsible) */}
      {showAddForm && (
        <form onSubmit={handleAdd} className="mt-4 p-4 rounded-2xl bg-indigo-50/40 border border-indigo-200/60 space-y-3 animate-in fade-in duration-150">
          <h4 className="text-xs font-bold text-indigo-950 uppercase">Thêm Vi chất / Thuốc mới</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-0.5">Tên sản phẩm *</label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Vitamin D3+K2, Omega-3..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-0.5">Liều lượng *</label>
              <input
                type="text"
                required
                placeholder="1 viên 1000mg, 5ml..."
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-0.5">Giờ uống</label>
              <input
                type="time"
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl bg-white border border-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-0.5">Phân loại</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-1.5 text-xs rounded-xl bg-white border border-slate-200"
              >
                <option value="supplement">Thực phẩm bổ sung</option>
                <option value="vitamin">Vitamin / Khoáng chất</option>
                <option value="prescription">Thuốc theo đơn</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-0.5">Lưu ý khi dùng</label>
            <input
              type="text"
              placeholder="Uống sau ăn sáng, không uống lúc đói..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl bg-white border border-slate-200 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-xs text-slate-500 hover:bg-white rounded-xl cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs cursor-pointer"
            >
              Lưu vào lịch
            </button>
          </div>
        </form>
      )}

      {/* List of Supplements */}
      <div className="mt-4 space-y-2">
        {supplements.map((item) => (
          <div
            key={item.id}
            className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
              item.takenToday
                ? 'bg-slate-50/50 border-slate-200/60 opacity-85'
                : 'bg-white border-slate-200 hover:border-indigo-300 shadow-2xs'
            }`}
          >
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleToggle(item.id)}
                className={`w-6 h-6 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  item.takenToday
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'border-2 border-slate-300 hover:border-indigo-500 bg-white'
                }`}
                title={item.takenToday ? 'Bấm để hủy đánh dấu' : 'Bấm để đánh dấu đã uống'}
              >
                {item.takenToday && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <h5 className={`text-xs font-semibold ${item.takenToday ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                    {item.name}
                  </h5>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-500">
                    {item.dosage}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{item.timeOfDay}</span>
                  </span>
                  {item.streakDays > 0 && (
                    <span className="flex items-center gap-0.5 text-orange-600 font-bold font-mono">
                      <Flame className="w-3 h-3 fill-current" />
                      <span>{item.streakDays}d</span>
                    </span>
                  )}
                  {item.notes && (
                    <span className="hidden sm:inline text-slate-400 truncate max-w-[180px]">
                      • {item.notes}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onDeleteSupplement(item.id)}
              className="p-1 text-slate-300 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
              title="Xóa vi chất này"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};
