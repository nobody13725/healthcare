import React, { useState } from 'react';
import { 
  Utensils, 
  Plus, 
  Flame, 
  Trash2, 
  PieChart, 
  Check, 
  Coffee, 
  Sun, 
  Moon, 
  Apple, 
  ChevronDown,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MealEntry } from '../types';

interface NutritionTrackerCardProps {
  meals: MealEntry[];
  targetCalories?: number;
  onAddMeal: (meal: Omit<MealEntry, 'id'>) => void;
  onDeleteMeal: (id: string) => void;
}

const PRESET_MEALS = [
  { name: 'Ức gà áp chảo (180g) + Cơm lứt', calories: 520, proteinG: 46, carbsG: 60, fatG: 8, mealType: 'lunch' as const },
  { name: 'Yến mạch + Sữa hạt + 1 muỗng Whey', calories: 380, proteinG: 30, carbsG: 48, fatG: 6, mealType: 'breakfast' as const },
  { name: '2 quả trứng luộc + 1 lát bánh mì đen', calories: 230, proteinG: 16, carbsG: 18, fatG: 10, mealType: 'breakfast' as const },
  { name: 'Salad cá hồi sốt mè rang', calories: 450, proteinG: 35, carbsG: 22, fatG: 24, mealType: 'dinner' as const },
  { name: 'Sữa chua Hy Lạp + Hạt chia & hạnh nhân', calories: 190, proteinG: 15, carbsG: 14, fatG: 7, mealType: 'snack' as const },
  { name: 'Phở bò tái nạc (ít bánh phở)', calories: 480, proteinG: 38, carbsG: 55, fatG: 10, mealType: 'lunch' as const },
];

export const NutritionTrackerCard: React.FC<NutritionTrackerCardProps> = ({
  meals,
  targetCalories = 2100,
  onAddMeal,
  onDeleteMeal,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [mealType, setMealType] = useState<MealEntry['mealType']>('lunch');
  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState<number>(450);
  const [proteinG, setProteinG] = useState<number>(30);
  const [carbsG, setCarbsG] = useState<number>(50);
  const [fatG, setFatG] = useState<number>(12);

  // Targets
  const targetProtein = Math.round((targetCalories * 0.28) / 4); // ~147g
  const targetCarbs = Math.round((targetCalories * 0.47) / 4);   // ~246g
  const targetFat = Math.round((targetCalories * 0.25) / 9);     // ~58g

  // Totals consumed today
  const totalCalories = meals.reduce((acc, m) => acc + (m.calories || 0), 0);
  const totalProtein = meals.reduce((acc, m) => acc + (m.proteinG || 0), 0);
  const totalCarbs = meals.reduce((acc, m) => acc + (m.carbsG || 0), 0);
  const totalFat = meals.reduce((acc, m) => acc + (m.fatG || 0), 0);

  const calPercent = Math.min(100, Math.round((totalCalories / targetCalories) * 100));

  const handleAddCustomMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealName.trim() || calories <= 0) return;

    onAddMeal({
      date: new Date().toISOString().split('T')[0],
      mealType,
      name: mealName.trim(),
      calories: Number(calories),
      proteinG: Number(proteinG),
      carbsG: Number(carbsG),
      fatG: Number(fatG),
    });

    setMealName('');
    setShowAddForm(false);
    confetti({ particleCount: 30, spread: 50 });
  };

  const handleAddPreset = (preset: typeof PRESET_MEALS[0]) => {
    onAddMeal({
      date: new Date().toISOString().split('T')[0],
      mealType: preset.mealType,
      name: preset.name,
      calories: preset.calories,
      proteinG: preset.proteinG,
      carbsG: preset.carbsG,
      fatG: preset.fatG,
    });
    confetti({ particleCount: 25, spread: 45 });
  };

  const getMealTypeBadge = (type: MealEntry['mealType']) => {
    switch (type) {
      case 'breakfast':
        return { label: 'Bữa sáng', icon: Coffee, color: 'text-amber-700 bg-amber-50 border-amber-200' };
      case 'lunch':
        return { label: 'Bữa trưa', icon: Sun, color: 'text-orange-700 bg-orange-50 border-orange-200' };
      case 'dinner':
        return { label: 'Bữa tối', icon: Moon, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' };
      case 'snack':
        return { label: 'Ăn nhẹ', icon: Apple, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
            <Utensils className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <span>Nhật Ký Dinh Dưỡng & Macro</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold border border-amber-200">
                MACRO TRACKER
              </span>
            </h3>
            <p className="text-xs text-slate-500">Cân đối Calorie, Đạm (Protein), Tinh bột (Carbs) và Chất béo lành mạnh</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Ghi món</span>
        </button>
      </div>

      {/* Hero Calorie Bar */}
      <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
        <div className="flex items-baseline justify-between mb-2">
          <div>
            <span className="text-xs text-slate-400 font-medium">Năng lượng nạp vào hôm nay:</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-black font-mono text-slate-900">{totalCalories.toLocaleString('vi-VN')}</span>
              <span className="text-xs text-slate-500 font-medium">/ {targetCalories.toLocaleString('vi-VN')} kcal</span>
            </div>
          </div>
          <span className="text-xs font-bold font-mono px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-700">
            {calPercent}% TDEE
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
          <div 
            className={`h-2.5 rounded-full transition-all duration-500 ${
              calPercent > 100 ? 'bg-rose-500' : 'bg-gradient-to-r from-amber-500 to-orange-500'
            }`}
            style={{ width: `${Math.min(100, calPercent)}%` }}
          />
        </div>

        {/* Macro Trio Grid */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-200/60">
          
          {/* Protein */}
          <div className="p-2.5 rounded-xl bg-white border border-slate-200/60 shadow-2xs text-center">
            <span className="text-[10px] uppercase font-bold text-rose-600 tracking-wider block">Protein (Đạm)</span>
            <div className="mt-1 font-mono font-bold text-sm text-slate-900">
              {totalProtein}g <span className="text-[10px] font-normal text-slate-400">/ {targetProtein}g</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div 
                className="bg-rose-500 h-full rounded-full" 
                style={{ width: `${Math.min(100, Math.round((totalProtein / targetProtein) * 100))}%` }} 
              />
            </div>
          </div>

          {/* Carbs */}
          <div className="p-2.5 rounded-xl bg-white border border-slate-200/60 shadow-2xs text-center">
            <span className="text-[10px] uppercase font-bold text-amber-600 tracking-wider block">Carbs (Tinh bột)</span>
            <div className="mt-1 font-mono font-bold text-sm text-slate-900">
              {totalCarbs}g <span className="text-[10px] font-normal text-slate-400">/ {targetCarbs}g</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div 
                className="bg-amber-500 h-full rounded-full" 
                style={{ width: `${Math.min(100, Math.round((totalCarbs / targetCarbs) * 100))}%` }} 
              />
            </div>
          </div>

          {/* Fat */}
          <div className="p-2.5 rounded-xl bg-white border border-slate-200/60 shadow-2xs text-center">
            <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider block">Fat (Chất béo)</span>
            <div className="mt-1 font-mono font-bold text-sm text-slate-900">
              {totalFat}g <span className="text-[10px] font-normal text-slate-400">/ {targetFat}g</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div 
                className="bg-blue-500 h-full rounded-full" 
                style={{ width: `${Math.min(100, Math.round((totalFat / targetFat) * 100))}%` }} 
              />
            </div>
          </div>

        </div>
      </div>

      {/* Quick Add Presets Pills */}
      <div className="mt-4">
        <span className="text-[11px] font-semibold text-slate-400 block mb-2">Thực đơn lành mạnh 1-chạm:</span>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
          {PRESET_MEALS.map((preset, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleAddPreset(preset)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-200/80 hover:border-amber-300 text-slate-700 hover:text-amber-800 text-xs font-medium whitespace-nowrap transition-all cursor-pointer shrink-0"
              title={`${preset.calories} kcal • P: ${preset.proteinG}g • C: ${preset.carbsG}g • F: ${preset.fatG}g`}
            >
              <Plus className="w-3 h-3 text-amber-600" />
              <span>{preset.name}</span>
              <span className="font-mono text-[10px] text-slate-400 font-bold">({preset.calories}k)</span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Add Form (Collapsible) */}
      {showAddForm && (
        <form onSubmit={handleAddCustomMeal} className="mt-4 p-4 rounded-2xl bg-amber-50/40 border border-amber-200/60 space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-amber-950 uppercase">Ghi nhận món ăn mới</h4>
            <div className="flex gap-1">
              {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((type) => {
                const b = getMealTypeBadge(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setMealType(type)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                      mealType === type ? 'bg-amber-600 text-white font-bold' : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    {b.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <input
              type="text"
              required
              placeholder="Tên món ăn (ví dụ: Cơm tấm sườn bì nạc, Sinh tố bơ chuối...)"
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-0.5">Calo (kcal) *</label>
              <input
                type="number"
                required
                min="0"
                value={calories}
                onChange={(e) => setCalories(Number(e.target.value))}
                className="w-full px-2 py-1.5 text-xs rounded-xl bg-white border border-slate-200 font-mono font-bold text-center"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-0.5">Protein (g)</label>
              <input
                type="number"
                min="0"
                value={proteinG}
                onChange={(e) => setProteinG(Number(e.target.value))}
                className="w-full px-2 py-1.5 text-xs rounded-xl bg-white border border-slate-200 font-mono text-center"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-0.5">Carbs (g)</label>
              <input
                type="number"
                min="0"
                value={carbsG}
                onChange={(e) => setCarbsG(Number(e.target.value))}
                className="w-full px-2 py-1.5 text-xs rounded-xl bg-white border border-slate-200 font-mono text-center"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-0.5">Fat (g)</label>
              <input
                type="number"
                min="0"
                value={fatG}
                onChange={(e) => setFatG(Number(e.target.value))}
                className="w-full px-2 py-1.5 text-xs rounded-xl bg-white border border-slate-200 font-mono text-center"
              />
            </div>
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
              className="px-4 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs cursor-pointer"
            >
              Lưu món ăn
            </button>
          </div>
        </form>
      )}

      {/* Logged Meals List */}
      <div className="mt-4 space-y-2">
        {meals.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400">
            Chưa có món ăn nào được ghi nhận hôm nay.
          </div>
        ) : (
          meals.map((meal) => {
            const badge = getMealTypeBadge(meal.mealType);
            const Icon = badge.icon;
            return (
              <div 
                key={meal.id} 
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 hover:bg-slate-50 border border-slate-100 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg border ${badge.color}`}>
                    <Icon className="w-3 h-3" />
                    <span>{badge.label}</span>
                  </span>
                  <div>
                    <h5 className="text-xs font-semibold text-slate-900 leading-tight">{meal.name}</h5>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                      <span>P: {meal.proteinG}g</span>
                      <span>•</span>
                      <span>C: {meal.carbsG}g</span>
                      <span>•</span>
                      <span>F: {meal.fatG}g</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-xs text-slate-900">
                    +{meal.calories} kcal
                  </span>
                  <button
                    type="button"
                    onClick={() => onDeleteMeal(meal.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-all cursor-pointer"
                    title="Xóa món này"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
