import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { GoalsTasksView } from './components/GoalsTasksView';
import { HabitsView } from './components/HabitsView';
import { CalendarRemindersView } from './components/CalendarRemindersView';
import { MetricsHealthView } from './components/MetricsHealthView';
import { StatsReportsView } from './components/StatsReportsView';
import { AIAssistantView } from './components/AIAssistantView';
import { AuthView } from './components/AuthView';
import { ProfileModal } from './components/ProfileModal';
import { QuickAddModal } from './components/QuickAddModal';
import { VitalsLoggerModal } from './components/VitalsLoggerModal';
import { 
  initialProfile, 
  initialGoals, 
  initialTasks, 
  initialHabits, 
  initialMetrics, 
  initialEvents, 
  initialLogs,
  initialMeals,
  initialSupplements
} from './data/initialData';
import { 
  UserProfile, 
  HealthGoal, 
  HealthTask, 
  Habit, 
  HealthMetricEntry, 
  CalendarEvent, 
  ActivityLog,
  MealEntry,
  SupplementItem
} from './types';
import { LogOut, AlertCircle, Sparkles, HeartPulse } from 'lucide-react';

export default function App() {
  // Authentication State (PB01, PB02, PB03)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('healthtrack_auth') === 'true';
  });

  // Modal States
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showQuickAddModal, setShowQuickAddModal] = useState<boolean>(false);
  const [showVitalsModal, setShowVitalsModal] = useState<boolean>(false);
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);

  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Application Data States with Persistence
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('dtu_health_user');
    return saved ? JSON.parse(saved) : initialProfile;
  });

  const [goals, setGoals] = useState<HealthGoal[]>(() => {
    const saved = localStorage.getItem('dtu_health_goals');
    return saved ? JSON.parse(saved) : initialGoals;
  });

  const [tasks, setTasks] = useState<HealthTask[]>(() => {
    const saved = localStorage.getItem('dtu_health_tasks');
    return saved ? JSON.parse(saved) : initialTasks;
  });

  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('dtu_health_habits');
    return saved ? JSON.parse(saved) : initialHabits;
  });

  const [metrics, setMetrics] = useState<HealthMetricEntry[]>(() => {
    const saved = localStorage.getItem('dtu_health_metrics');
    return saved ? JSON.parse(saved) : initialMetrics;
  });

  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('dtu_health_events');
    return saved ? JSON.parse(saved) : initialEvents;
  });

  const [logs, setLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('dtu_health_logs');
    return saved ? JSON.parse(saved) : initialLogs;
  });

  const [meals, setMeals] = useState<MealEntry[]>(() => {
    const saved = localStorage.getItem('dtu_health_meals');
    return saved ? JSON.parse(saved) : initialMeals;
  });

  const [supplements, setSupplements] = useState<SupplementItem[]>(() => {
    const saved = localStorage.getItem('dtu_health_supplements');
    return saved ? JSON.parse(saved) : initialSupplements;
  });

  // Helper log addition
  const addLog = (title: string, description: string, type: ActivityLog['type']) => {
    const newLog: ActivityLog = {
      id: 'log_' + Date.now(),
      title,
      description,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' hôm nay',
      type,
    };
    setLogs((prev) => {
      const updated = [newLog, ...prev.slice(0, 49)];
      localStorage.setItem('dtu_health_logs', JSON.stringify(updated));
      return updated;
    });
  };

  // Auth Handlers
  const handleLoginSuccess = (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
    setIsAuthenticated(true);
    localStorage.setItem('healthtrack_auth', 'true');
    localStorage.setItem('dtu_health_user', JSON.stringify(loggedInUser));
    addLog('Đăng nhập thành công', `Chào mừng ${loggedInUser.fullName} trở lại hệ thống`, 'task_completed');
  };

  const handleLogoutConfirm = () => {
    setIsAuthenticated(false);
    setShowLogoutModal(false);
    setShowProfileModal(false);
    localStorage.removeItem('healthtrack_auth');
    addLog('Đăng xuất tài khoản', 'Đã kết thúc phiên làm việc an toàn', 'task_completed');
  };

  const handleUpdateUser = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    localStorage.setItem('dtu_health_user', JSON.stringify(updatedUser));
    addLog('Cập nhật hồ sơ cá nhân', 'Đã lưu thay đổi thông tin thể trạng và chỉ tiêu', 'metric_logged');
  };

  // Goal Handlers (PB06)
  const handleAddGoal = (newGoal: Omit<HealthGoal, 'id'>) => {
    const goal: HealthGoal = {
      ...newGoal,
      id: 'goal_' + Date.now(),
    };
    const updated = [...goals, goal];
    setGoals(updated);
    localStorage.setItem('dtu_health_goals', JSON.stringify(updated));
    addLog(`Đã tạo mục tiêu mới`, goal.title, 'goal_updated');
  };

  const handleUpdateGoal = (id: string, updates: Partial<HealthGoal>) => {
    const updated = goals.map(g => g.id === id ? { ...g, ...updates } : g);
    setGoals(updated);
    localStorage.setItem('dtu_health_goals', JSON.stringify(updated));
  };

  const handleDeleteGoal = (id: string) => {
    const updated = goals.filter(g => g.id !== id);
    setGoals(updated);
    localStorage.setItem('dtu_health_goals', JSON.stringify(updated));
  };

  // Task Handlers (PB07)
  const handleAddTask = (newTask: Omit<HealthTask, 'id'>) => {
    const task: HealthTask = {
      ...newTask,
      id: 'task_' + Date.now(),
    };
    const updated = [...tasks, task];
    setTasks(updated);
    localStorage.setItem('dtu_health_tasks', JSON.stringify(updated));
    addLog(`Đã thêm nhiệm vụ`, `${task.title} (${task.time})`, 'task_completed');
  };

  const handleToggleTask = (taskId: string) => {
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        const isNowCompleted = t.status !== 'completed';
        if (isNowCompleted) {
          addLog(`Hoàn thành nhiệm vụ`, t.title, 'task_completed');
        }
        return {
          ...t,
          status: isNowCompleted ? ('completed' as const) : ('pending' as const),
        };
      }
      return t;
    });
    setTasks(updated);
    localStorage.setItem('dtu_health_tasks', JSON.stringify(updated));

    // Update parent goal progress
    const currentTask = tasks.find(t => t.id === taskId);
    if (currentTask?.goalId) {
      const parentGoalTasks = updated.filter(t => t.goalId === currentTask.goalId);
      if (parentGoalTasks.length > 0) {
        const doneCount = parentGoalTasks.filter(t => t.status === 'completed').length;
        const progressPercent = Math.round((doneCount / parentGoalTasks.length) * 100);
        handleUpdateGoal(currentTask.goalId, { progress: progressPercent });
      }
    }
  };

  const handleSkipTask = (taskId: string) => {
    const updated = tasks.map(t => t.id === taskId ? { ...t, status: 'skipped' as const } : t);
    setTasks(updated);
    localStorage.setItem('dtu_health_tasks', JSON.stringify(updated));
    addLog('Bỏ qua nhiệm vụ', 'Đã chuyển trạng thái sang bỏ qua', 'task_completed');
  };

  const handleDeleteTask = (taskId: string) => {
    const updated = tasks.filter(t => t.id !== taskId);
    setTasks(updated);
    localStorage.setItem('dtu_health_tasks', JSON.stringify(updated));
  };

  // Habit Handlers (PB08)
  const handleToggleHabitToday = (habitId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const updated = habits.map(h => {
      if (h.id === habitId) {
        const isDone = !h.isCompletedToday;
        const newStreak = isDone ? h.streak + 1 : Math.max(0, h.streak - 1);
        const newDays = isDone 
          ? [...h.completedDays, today] 
          : h.completedDays.filter(d => d !== today);

        if (isDone) {
          addLog(`Duy trì chuỗi thói quen`, `${h.title} (Chuỗi ${newStreak} ngày)`, 'habit_streak');
        }

        return {
          ...h,
          isCompletedToday: isDone,
          streak: newStreak,
          bestStreak: Math.max(h.bestStreak, newStreak),
          completedDays: Array.from(new Set(newDays)),
        };
      }
      return h;
    });
    setHabits(updated);
    localStorage.setItem('dtu_health_habits', JSON.stringify(updated));
  };

  const handleAddHabit = (newHabit: Omit<Habit, 'id'>) => {
    const habit: Habit = {
      ...newHabit,
      id: 'habit_' + Date.now(),
    };
    const updated = [...habits, habit];
    setHabits(updated);
    localStorage.setItem('dtu_health_habits', JSON.stringify(updated));
    addLog(`Đã bắt đầu thói quen mới`, habit.title, 'habit_streak');
  };

  const handleDeleteHabit = (habitId: string) => {
    const updated = habits.filter(h => h.id !== habitId);
    setHabits(updated);
    localStorage.setItem('dtu_health_habits', JSON.stringify(updated));
  };

  // Metric Handlers (PB11)
  const handleAddMetric = (newMetric: Omit<HealthMetricEntry, 'id'>) => {
    const metric: HealthMetricEntry = {
      ...newMetric,
      id: 'm_' + Date.now(),
    };
    const updated = [...metrics, metric];
    setMetrics(updated);
    localStorage.setItem('dtu_health_metrics', JSON.stringify(updated));

    // Update user profile weight
    const updatedUser = { ...user, weightKg: metric.weightKg, heightCm: metric.heightCm };
    setUser(updatedUser);
    localStorage.setItem('dtu_health_user', JSON.stringify(updatedUser));

    addLog(`Ghi nhận chỉ số thể chất`, `Cân nặng ${metric.weightKg} kg (BMI: ${metric.bmi})`, 'metric_logged');
  };

  // Quick water logging
  const handleLogWater = (amountMl: number) => {
    const latest = metrics[metrics.length - 1] || initialMetrics[initialMetrics.length - 1];
    const newWater = (latest.waterMl || 0) + amountMl;
    const updatedMetric = { ...latest, waterMl: newWater };
    const updatedMetrics = metrics.map((m, idx) => idx === metrics.length - 1 ? updatedMetric : m);
    setMetrics(updatedMetrics);
    localStorage.setItem('dtu_health_metrics', JSON.stringify(updatedMetrics));
    addLog('Uống nước', `+${amountMl}ml (Tổng ${newWater}/${user.waterTargetMl}ml)`, 'metric_logged');
  };

  // Calendar Event Handlers (PB09 & PB10)
  const handleAddEvent = (newEvent: Omit<CalendarEvent, 'id'>) => {
    const event: CalendarEvent = {
      ...newEvent,
      id: 'evt_' + Date.now(),
    };
    const updated = [...events, event];
    setEvents(updated);
    localStorage.setItem('dtu_health_events', JSON.stringify(updated));
    addLog(`Đã lên lịch hẹn y tế`, `${event.title} lúc ${event.startTime}`, 'task_completed');
  };

  const handleDeleteEvent = (id: string) => {
    const updated = events.filter(e => e.id !== id);
    setEvents(updated);
    localStorage.setItem('dtu_health_events', JSON.stringify(updated));
  };

  // Nutrition & Meal Handlers (PB-Nutrition)
  const handleAddMeal = (newMealData: Omit<MealEntry, 'id'>) => {
    const newMeal: MealEntry = {
      ...newMealData,
      id: 'meal_' + Date.now(),
    };
    setMeals((prev) => {
      const updated = [newMeal, ...prev];
      localStorage.setItem('dtu_health_meals', JSON.stringify(updated));
      return updated;
    });
    addLog('Ghi nhận bữa ăn', `Đã thêm "${newMeal.name}" (+${newMeal.calories} kcal)`, 'task_completed');
  };

  const handleDeleteMeal = (mealId: string) => {
    setMeals((prev) => {
      const updated = prev.filter((m) => m.id !== mealId);
      localStorage.setItem('dtu_health_meals', JSON.stringify(updated));
      return updated;
    });
    addLog('Xóa bữa ăn', 'Đã gỡ bỏ món ăn khỏi nhật ký dinh dưỡng', 'metric_logged');
  };

  // Supplement & Vitamin Handlers (PB-Supplements)
  const handleToggleSupplement = (id: string) => {
    setSupplements((prev) => {
      const updated = prev.map((s) => {
        if (s.id === id) {
          const nextTaken = !s.takenToday;
          return {
            ...s,
            takenToday: nextTaken,
            streakDays: nextTaken ? s.streakDays + 1 : Math.max(0, s.streakDays - 1),
          };
        }
        return s;
      });
      localStorage.setItem('dtu_health_supplements', JSON.stringify(updated));
      return updated;
    });
  };

  const handleAddSupplement = (item: Omit<SupplementItem, 'id' | 'streakDays' | 'takenToday'>) => {
    const newItem: SupplementItem = {
      ...item,
      id: 'supp_' + Date.now(),
      streakDays: 0,
      takenToday: false,
    };
    setSupplements((prev) => {
      const updated = [...prev, newItem];
      localStorage.setItem('dtu_health_supplements', JSON.stringify(updated));
      return updated;
    });
    addLog('Thêm lịch uống thuốc/bổ sung', `Đã thêm "${newItem.name}" (${newItem.dosage})`, 'habit_streak');
  };

  const handleDeleteSupplement = (id: string) => {
    setSupplements((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      localStorage.setItem('dtu_health_supplements', JSON.stringify(updated));
      return updated;
    });
  };

  // Mindfulness Handlers (PB-Breathing)
  const handleLogMindfulness = (minutes: number) => {
    addLog('Hoàn thành bài tập thở', `Đã thực hành thở sinh học trong ${minutes} phút`, 'task_completed');
  };

  // If not authenticated, show standalone Login / Register / Forgot Password screen
  if (!isAuthenticated) {
    return (
      <AuthView
        onLoginSuccess={handleLoginSuccess}
        defaultUser={user}
      />
    );
  }

  const latestMetric = metrics[metrics.length - 1] || {
    id: 'met_default',
    date: new Date().toISOString().split('T')[0],
    weightKg: user.weightKg,
    heightCm: user.heightCm,
    bmi: Number((user.weightKg / Math.pow(user.heightCm / 100, 2)).toFixed(1)),
    waterMl: 1600,
    steps: 5400,
    sleepHours: 7.5,
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* Navigation Header */}
      <Navbar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        user={user} 
        latestMetric={latestMetric}
        onOpenAddModal={() => setShowQuickAddModal(true)}
        onOpenVitalsModal={() => setShowVitalsModal(true)}
        onOpenProfileModal={() => setShowProfileModal(true)}
        onLogoutRequest={() => setShowLogoutModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {activeTab === 'dashboard' && (
          <DashboardView
            user={user}
            goals={goals}
            tasks={tasks}
            habits={habits}
            events={events}
            latestMetric={latestMetric}
            meals={meals}
            supplements={supplements}
            onToggleTask={handleToggleTask}
            onSkipTask={handleSkipTask}
            onLogWater={handleLogWater}
            onNavigate={setActiveTab}
            onOpenQuickTask={() => setShowQuickAddModal(true)}
            onOpenVitalsLogger={() => setShowVitalsModal(true)}
            onAddMetric={handleAddMetric}
            onAddMeal={handleAddMeal}
            onDeleteMeal={handleDeleteMeal}
            onToggleSupplement={handleToggleSupplement}
            onAddSupplement={handleAddSupplement}
            onDeleteSupplement={handleDeleteSupplement}
            onLogMindfulness={handleLogMindfulness}
          />
        )}

        {activeTab === 'goals' && (
          <GoalsTasksView
            goals={goals}
            tasks={tasks}
            onAddGoal={handleAddGoal}
            onUpdateGoal={handleUpdateGoal}
            onDeleteGoal={handleDeleteGoal}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onSkipTask={handleSkipTask}
            onDeleteTask={handleDeleteTask}
            onRequestAITasksForGoal={(goalTitle) => {
              setActiveTab('ai');
            }}
          />
        )}

        {activeTab === 'habits' && (
          <HabitsView
            habits={habits}
            onToggleHabitToday={handleToggleHabitToday}
            onAddHabit={handleAddHabit}
            onDeleteHabit={handleDeleteHabit}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarRemindersView
            events={events}
            onAddEvent={handleAddEvent}
            onDeleteEvent={handleDeleteEvent}
          />
        )}

        {activeTab === 'metrics' && (
          <MetricsHealthView
            metrics={metrics}
            user={user}
            onAddMetric={handleAddMetric}
          />
        )}

        {activeTab === 'stats' && (
          <StatsReportsView
            metrics={metrics}
            logs={logs}
            habits={habits}
            goals={goals}
            tasks={tasks}
          />
        )}

        {activeTab === 'ai' && (
          <AIAssistantView
            user={user}
            goals={goals}
            tasks={tasks}
            habits={habits}
            metrics={metrics}
            meals={meals}
            supplements={supplements}
            onAddTask={handleAddTask}
            onAddMeal={handleAddMeal}
            onAddSupplement={handleAddSupplement}
            onLogWater={handleLogWater}
            onAddEvent={handleAddEvent}
            onAddHabit={handleAddHabit}
            onNavigate={setActiveTab}
            onAddGeneratedHabit={(title, target, time) => {
              handleAddTask({
                goalId: goals[0]?.id || 'g1',
                title,
                category: 'exercise',
                time,
                frequency: 'daily',
                status: 'pending',
                targetValue: target,
              });
            }}
          />
        )}
      </main>

      {/* Global Profile & Account Management Modal (PB04, PB05) */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={user}
        onUpdateUser={handleUpdateUser}
        onLogoutRequest={() => {
          setShowProfileModal(false);
          setShowLogoutModal(true);
        }}
      />

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={showQuickAddModal}
        onClose={() => setShowQuickAddModal(false)}
        goals={goals}
        user={user}
        onAddTask={handleAddTask}
        onAddGoal={handleAddGoal}
        onAddHabit={handleAddHabit}
        onAddEvent={handleAddEvent}
        onAddMetric={handleAddMetric}
      />

      {/* Dedicated Bio-Vitals Logger Modal (Oura / Whoop Style) */}
      <VitalsLoggerModal
        isOpen={showVitalsModal}
        onClose={() => setShowVitalsModal(false)}
        user={user}
        latestMetric={latestMetric}
        onAddMetric={handleAddMetric}
        onLogWater={handleLogWater}
      />

      {/* Floating Vitals Action Button (Always Accessible Quick Input) */}
      <aside aria-label="Nút ghi nhanh chỉ số" className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => setShowVitalsModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white shadow-xl hover:shadow-2xl border border-slate-700 transition-all hover:scale-105 active:scale-95 cursor-pointer group"
          title="Ghi nhận chỉ số thể chất & BMI hôm nay"
        >
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
          <HeartPulse className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold tracking-tight">Ghi chỉ số</span>
        </button>
      </aside>

      {/* Logout Confirmation Modal (PB03) */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Xác nhận đăng xuất</h3>
            <p className="text-xs text-slate-500 mt-2">
              Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không? Dữ liệu sức khỏe của bạn vẫn được lưu trữ an toàn trên trình duyệt này.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                Không, ở lại
              </button>
              <button
                type="button"
                onClick={handleLogoutConfirm}
                className="flex-1 py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs cursor-pointer"
              >
                Có, đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Standalone Web App Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">HealthTrack Pro</span>
            <span>•</span>
            <span>Hệ thống Quản lý Sức khỏe & Thói quen Cá nhân</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className="text-slate-600 hover:text-emerald-600 font-medium cursor-pointer"
            >
              Dashboard
            </button>
            <span>•</span>
            <button 
              onClick={() => setActiveTab('goals')}
              className="text-slate-600 hover:text-emerald-600 font-medium cursor-pointer"
            >
              Mục tiêu & Nhiệm vụ
            </button>
            <span>•</span>
            <button 
              onClick={() => setActiveTab('habits')}
              className="text-slate-600 hover:text-emerald-600 font-medium cursor-pointer"
            >
              Thói quen
            </button>
            <span>•</span>
            <button 
              onClick={() => setActiveTab('ai')}
              className="text-purple-600 hover:text-purple-700 font-semibold cursor-pointer"
            >
              Bác sĩ AI
            </button>
            <span>•</span>
            <button 
              onClick={() => setShowProfileModal(true)}
              className="text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer"
            >
              Hồ sơ ({user.fullName})
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
