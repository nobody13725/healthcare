import React, { useState } from 'react';
import { 
  Target, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Calendar, 
  Sparkles, 
  Check, 
  X,
  Layers,
  Filter
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { HealthGoal, HealthTask } from '../types';

interface GoalsTasksViewProps {
  goals: HealthGoal[];
  tasks: HealthTask[];
  onAddGoal: (goal: Omit<HealthGoal, 'id'>) => void;
  onUpdateGoal: (id: string, updates: Partial<HealthGoal>) => void;
  onDeleteGoal: (id: string) => void;
  onAddTask: (task: Omit<HealthTask, 'id'>) => void;
  onToggleTask: (taskId: string) => void;
  onSkipTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onRequestAITasksForGoal?: (goalTitle: string) => void;
}

export const GoalsTasksView: React.FC<GoalsTasksViewProps> = ({
  goals,
  tasks,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
  onAddTask,
  onToggleTask,
  onSkipTask,
  onDeleteTask,
}) => {
  const [selectedGoalId, setSelectedGoalId] = useState<string>('all');
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  // New Goal Form State
  const [goalTitle, setGoalTitle] = useState('');
  const [goalCategory, setGoalCategory] = useState<HealthGoal['category']>('exercise');
  const [goalTimeframe, setGoalTimeframe] = useState<HealthGoal['timeframe']>('week');
  const [goalTargetDate, setGoalTargetDate] = useState('2026-10-31');
  const [goalNotes, setGoalNotes] = useState('');

  // New Task Form State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskGoalId, setTaskGoalId] = useState(goals[0]?.id || '');
  const [taskCategory, setTaskCategory] = useState<HealthTask['category']>('exercise');
  const [taskTime, setTaskTime] = useState('07:30');
  const [taskFrequency, setTaskFrequency] = useState<HealthTask['frequency']>('daily');
  const [taskTargetValue, setTaskTargetValue] = useState('30 phút');

  // AI Task generation state
  const [isGeneratingAITasks, setIsGeneratingAITasks] = useState(false);

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;

    onAddGoal({
      title: goalTitle,
      category: goalCategory,
      timeframe: goalTimeframe,
      targetDate: goalTargetDate,
      progress: 0,
      status: 'active',
      notes: goalNotes,
    });

    setGoalTitle('');
    setGoalNotes('');
    setShowAddGoalModal(false);
    confetti({ particleCount: 40, spread: 60 });
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    onAddTask({
      goalId: taskGoalId,
      title: taskTitle,
      category: taskCategory,
      time: taskTime,
      frequency: taskFrequency,
      status: 'pending',
      targetValue: taskTargetValue,
    });

    setTaskTitle('');
    setShowAddTaskModal(false);
  };

  const handleGenerateAITasks = async (goal: HealthGoal) => {
    setIsGeneratingAITasks(true);
    try {
      const res = await fetch('/api/ai/generate-habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetGoal: goal.title,
          dailyTimeAvailable: '30-45 phút',
          healthStatus: 'cần cải thiện',
        }),
      });
      const data = await res.json();
      if (data.habits && Array.isArray(data.habits)) {
        data.habits.forEach((h: any) => {
          onAddTask({
            goalId: goal.id,
            title: h.name,
            category: (h.category as any) || 'exercise',
            time: h.time || '08:00',
            frequency: 'daily',
            status: 'pending',
            targetValue: h.target || 'Mục tiêu ngày',
          });
        });
        confetti({ particleCount: 70, spread: 80 });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingAITasks(false);
    }
  };

  const filteredTasks = selectedGoalId === 'all' 
    ? tasks 
    : tasks.filter(t => t.goalId === selectedGoalId);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Mục tiêu & Nhiệm vụ</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Lập kế hoạch thông minh: Chia nhỏ mục tiêu lớn thành các việc cụ thể cần làm mỗi ngày
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddGoalModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm mục tiêu</span>
          </button>
          <button
            onClick={() => setShowAddTaskModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo nhiệm vụ</span>
          </button>
        </div>
      </div>

      {/* Goals Grid (PB06) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-600" />
            <span>Danh sách mục tiêu sức khỏe ({goals.length})</span>
          </h2>
          <span className="text-xs text-slate-500">Bấm vào mục tiêu để lọc nhiệm vụ liên kết</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {goals.map((goal) => {
            const isSelected = selectedGoalId === goal.id;
            const linkedTasksCount = tasks.filter(t => t.goalId === goal.id).length;
            const linkedDoneCount = tasks.filter(t => t.goalId === goal.id && t.status === 'completed').length;

            return (
              <div
                key={goal.id}
                onClick={() => setSelectedGoalId(isSelected ? 'all' : goal.id)}
                className={`relative p-5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected 
                    ? 'border-emerald-500 bg-emerald-50/30 shadow-md ring-2 ring-emerald-200' 
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200">
                    {goal.timeframe === 'day' ? 'Hằng ngày' : goal.timeframe === 'week' ? 'Hằng tuần' : 'Hằng tháng'}
                  </span>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleGenerateAITasks(goal)}
                      disabled={isGeneratingAITasks}
                      className="p-1 rounded-md text-purple-600 hover:bg-purple-50 transition-colors"
                      title="AI tự động phân rã nhiệm vụ"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Bạn có chắc muốn xóa mục tiêu "${goal.title}"?`)) {
                          onDeleteGoal(goal.id);
                        }
                      }}
                      className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Xóa mục tiêu"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-2.5 line-clamp-2 leading-snug">
                  {goal.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-1">{goal.notes || 'Hạn: ' + goal.targetDate}</p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span>{linkedDoneCount}/{linkedTasksCount} nhiệm vụ</span>
                  <span className="font-mono font-bold text-emerald-700">{goal.progress}%</span>
                </div>

                <div className="mt-1.5 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tasks Section */}
      <div className="bg-white rounded-3xl border border-slate-200/70 shadow-xs p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Danh sách nhiệm vụ {selectedGoalId !== 'all' ? `cho mục tiêu đang chọn` : `toàn bộ`}
              </h2>
              <p className="text-xs text-slate-500">
                Đánh dấu hoàn thành hoặc bỏ qua để duy trì tiến độ
              </p>
            </div>
          </div>

          {/* Goal Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs scrollbar-none">
            <button
              onClick={() => setSelectedGoalId('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                selectedGoalId === 'all' 
                  ? 'bg-slate-900 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tất cả ({tasks.length})
            </button>
            {goals.map(g => (
              <button
                key={g.id}
                onClick={() => setSelectedGoalId(g.id)}
                className={`px-3 py-1.5 rounded-lg font-medium truncate max-w-[150px] transition-colors cursor-pointer ${
                  selectedGoalId === g.id 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                title={g.title}
              >
                {g.title}
              </button>
            ))}
          </div>
        </div>

        {/* Task Cards */}
        <div className="mt-4 space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <CheckCircle2 className="w-12 h-12 mx-auto stroke-1 text-slate-300 mb-2" />
              <p className="text-sm font-medium">Chưa có nhiệm vụ nào trong danh mục này.</p>
              <button
                onClick={() => setShowAddTaskModal(true)}
                className="mt-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
              >
                + Bấm vào đây để tạo nhiệm vụ mới
              </button>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const isDone = task.status === 'completed';
              const isSkipped = task.status === 'skipped';
              const parentGoal = goals.find(g => g.id === task.goalId);

              return (
                <div
                  key={task.id}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                    isDone 
                      ? 'bg-emerald-50/40 border-emerald-200 text-slate-600'
                      : isSkipped
                      ? 'bg-slate-50 border-slate-200 text-slate-400 line-through opacity-70'
                      : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <button
                      onClick={() => onToggleTask(task.id)}
                      className="text-emerald-600 hover:text-emerald-700 focus:outline-hidden transition-transform active:scale-95 cursor-pointer"
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 hover:text-emerald-500" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-semibold truncate ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {task.title}
                        </p>
                        {parentGoal && (
                          <span className="hidden md:inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] truncate max-w-[180px]">
                            {parentGoal.title}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="inline-flex items-center gap-1 font-mono">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {task.time}
                        </span>
                        {task.targetValue && (
                          <span className="px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-700 font-medium text-[11px]">
                            {task.targetValue}
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400">
                          {task.frequency === 'daily' ? 'Hằng ngày' : task.frequency}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {!isDone && (
                      <button
                        onClick={() => onSkipTask(task.id)}
                        className="text-xs text-slate-400 hover:text-slate-600 hover:bg-slate-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                      >
                        Bỏ qua
                      </button>
                    )}
                    <button
                      onClick={() => onToggleTask(task.id)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                        isDone 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                      }`}
                    >
                      {isDone ? 'Đã hoàn thành' : 'Hoàn thành'}
                    </button>
                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Xóa nhiệm vụ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal Add Goal */}
      {showAddGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-600" />
                <span>Thêm mục tiêu sức khỏe</span>
              </h3>
              <button 
                onClick={() => setShowAddGoalModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Tên mục tiêu *
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Kiểm soát cân nặng, chạy bộ 10km..."
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Chu kỳ thực hiện
                  </label>
                  <select
                    value={goalTimeframe}
                    onChange={(e: any) => setGoalTimeframe(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-emerald-500"
                  >
                    <option value="day">Hằng ngày</option>
                    <option value="week">Hằng tuần</option>
                    <option value="month">Hằng tháng</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Danh mục
                  </label>
                  <select
                    value={goalCategory}
                    onChange={(e: any) => setGoalCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-emerald-500"
                  >
                    <option value="exercise">Vận động thể chất</option>
                    <option value="weight">Cân nặng & BMI</option>
                    <option value="sleep">Giấc ngủ</option>
                    <option value="nutrition">Dinh dưỡng / Nước</option>
                    <option value="mindfulness">Thiền & Tinh thần</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Hạn hoàn thành (Target Date)
                </label>
                <input
                  type="date"
                  value={goalTargetDate}
                  onChange={(e) => setGoalTargetDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Ghi chú hoặc kế hoạch chi tiết
                </label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú thêm về mục tiêu..."
                  value={goalNotes}
                  onChange={(e) => setGoalNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddGoalModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm"
                >
                  Lưu mục tiêu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Task */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Tạo nhiệm vụ sức khỏe</span>
              </h3>
              <button 
                onClick={() => setShowAddTaskModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Thuộc mục tiêu *
                </label>
                <select
                  value={taskGoalId}
                  onChange={(e) => setTaskGoalId(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-emerald-500"
                >
                  {goals.map(g => (
                    <option key={g.id} value={g.id}>{g.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Tên nhiệm vụ *
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Uống 2L nước mỗi ngày, đi bộ 30 phút..."
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Giờ thực hiện
                  </label>
                  <input
                    type="time"
                    value={taskTime}
                    onChange={(e) => setTaskTime(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Định mức (Target)
                  </label>
                  <input
                    type="text"
                    placeholder="VD: 500ml, 30p..."
                    value={taskTargetValue}
                    onChange={(e) => setTaskTargetValue(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm"
                >
                  Thêm nhiệm vụ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
