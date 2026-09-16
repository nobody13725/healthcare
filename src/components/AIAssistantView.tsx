import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  Send, 
  RefreshCw, 
  Zap, 
  Activity, 
  Heart, 
  CheckCircle2, 
  BrainCircuit, 
  PlusCircle, 
  MessageSquare,
  ShieldAlert,
  Utensils,
  Droplets,
  Calendar,
  Flame,
  Pill,
  ArrowRight,
  Sliders,
  Check,
  TrendingUp,
  Clock,
  Sparkle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  UserProfile, 
  HealthGoal, 
  HealthTask, 
  Habit, 
  HealthMetricEntry, 
  MealEntry, 
  SupplementItem, 
  CalendarEvent,
  AIActionItem 
} from '../types';

interface AIAssistantViewProps {
  user: UserProfile;
  goals: HealthGoal[];
  tasks: HealthTask[];
  habits: Habit[];
  metrics: HealthMetricEntry[];
  meals?: MealEntry[];
  supplements?: SupplementItem[];
  onAddTask?: (task: Omit<HealthTask, 'id'>) => void;
  onAddMeal?: (meal: Omit<MealEntry, 'id'>) => void;
  onAddSupplement?: (supp: Omit<SupplementItem, 'id' | 'streakDays' | 'takenToday'>) => void;
  onLogWater?: (amountMl: number) => void;
  onAddEvent?: (event: Omit<CalendarEvent, 'id'>) => void;
  onAddHabit?: (habit: Habit) => void;
  onNavigate?: (tab: string) => void;
  onAddGeneratedHabit?: (habitTitle: string, target: string, time: string) => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  actions?: AIActionItem[];
}

interface ProtocolData {
  title: string;
  summary: string;
  actions: AIActionItem[];
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  user,
  goals,
  tasks,
  habits,
  metrics,
  meals = [],
  supplements = [],
  onAddTask,
  onAddMeal,
  onAddSupplement,
  onLogWater,
  onAddEvent,
  onAddHabit,
  onNavigate,
  onAddGeneratedHabit,
}) => {
  const latestMetric = metrics[metrics.length - 1];

  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'meal_scanner' | 'protocol'>('chat');
  const [autoExecute, setAutoExecute] = useState<boolean>(false);

  // Chat States
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Xin chào ${user.fullName}! Tôi là Trợ lý Sức khỏe & Huấn luyện viên Hành động AI của bạn. 
Tôi không chỉ đưa ra lời khuyên mà có thể **tương tác và thực thi trực tiếp vào hệ thống** của bạn:
- Thêm nhiệm vụ bài tập & lịch trình
- Tự động ghi món ăn & tính toán calories/macros
- Ghi nhận lượng nước uống và cập nhật chỉ số
- Lên lịch uống thuốc, vitamin và nhắc khám y tế.

Bạn muốn tôi phân tích điều gì hoặc thực hiện tác vụ nào hôm nay?`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      actions: [
        {
          id: 'init_water',
          type: 'log_water',
          label: 'Ghi nhận 1 ly nước ấm (+300ml)',
          description: 'Cập nhật trực tiếp vào thanh tiến độ nước hôm nay',
          status: 'pending',
          payload: { amountMl: 300 }
        },
        {
          id: 'init_task',
          type: 'add_task',
          label: 'Thêm bài tập: Chạy bộ Zone 2 (30 phút)',
          description: 'Tạo nhiệm vụ vận động chuẩn khoa học vào Dashboard',
          status: 'pending',
          payload: {
            title: 'Chạy bộ nhẹ nhàng giữ nhịp tim Zone 2',
            category: 'exercise',
            time: '17:30',
            frequency: 'daily',
            targetValue: '30 phút'
          }
        }
      ]
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [comprehensiveReport, setComprehensiveReport] = useState<string | null>(null);
  const [isAnalyzingProgress, setIsAnalyzingProgress] = useState(false);

  // Executed Actions tracking
  const [executedActionIds, setExecutedActionIds] = useState<Set<string>>(new Set());

  // AI Meal Scanner State
  const [foodQuery, setFoodQuery] = useState('');
  const [mealTypeSelect, setMealTypeSelect] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [isScanningFood, setIsScanningFood] = useState(false);
  const [foodEstimateResult, setFoodEstimateResult] = useState<any | null>(null);
  const [foodLoggedSuccess, setFoodLoggedSuccess] = useState(false);

  // Protocol Generator State
  const [isGeneratingProtocol, setIsGeneratingProtocol] = useState(false);
  const [activeProtocol, setActiveProtocol] = useState<ProtocolData | null>(null);
  const [protocolApplied, setProtocolApplied] = useState(false);

  // Action Executor
  const handleExecuteAction = (action: AIActionItem) => {
    if (executedActionIds.has(action.id)) return;

    try {
      if (action.type === 'add_task' && onAddTask) {
        onAddTask({
          goalId: goals[0]?.id || 'g1',
          title: action.payload.title || 'Nhiệm vụ sức khỏe',
          category: action.payload.category || 'exercise',
          time: action.payload.time || '08:00',
          frequency: action.payload.frequency || 'daily',
          status: 'pending',
          targetValue: action.payload.targetValue || '1 lần',
        });
      } else if (action.type === 'add_meal' && onAddMeal) {
        onAddMeal({
          name: action.payload.name || 'Bữa ăn dinh dưỡng',
          mealType: action.payload.mealType || 'lunch',
          calories: Number(action.payload.calories) || 400,
          protein: Number(action.payload.protein) || 20,
          carbs: Number(action.payload.carbs) || 50,
          fat: Number(action.payload.fat) || 10,
          time: action.payload.time || new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        });
      } else if (action.type === 'add_supplement' && onAddSupplement) {
        onAddSupplement({
          name: action.payload.name || 'Thực phẩm bổ sung',
          dosage: action.payload.dosage || '1 viên',
          category: action.payload.category || 'vitamin',
          timing: action.payload.timing || 'morning',
          notes: action.payload.notes || '',
        });
      } else if (action.type === 'log_water' && onLogWater) {
        onLogWater(Number(action.payload.amountMl) || 250);
      } else if (action.type === 'add_event' && onAddEvent) {
        onAddEvent({
          title: action.payload.title || 'Lịch khám y tế',
          date: action.payload.date || new Date().toISOString().split('T')[0],
          startTime: action.payload.startTime || '09:00',
          endTime: action.payload.endTime || '10:00',
          location: action.payload.location || 'Bệnh viện / Phòng khám',
          type: action.payload.type || 'checkup',
          doctorNotes: action.payload.doctorNotes || 'Theo dõi định kỳ',
        });
      } else if (action.type === 'add_habit' && onAddHabit) {
        onAddHabit({
          id: 'hab_' + Date.now(),
          title: action.payload.title || 'Thói quen mới',
          category: action.payload.category || 'exercise',
          streak: 0,
          bestStreak: 0,
          completedToday: false,
          history: [],
          targetDays: action.payload.targetDays || 7,
          targetValue: action.payload.targetValue || '1 lần/ngày',
        });
      }

      setExecutedActionIds((prev) => new Set([...prev, action.id]));
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    } catch (err) {
      console.error("Failed to execute AI action:", err);
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputQuery('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role === 'user' ? 'user' : 'model', content: m.content })),
          userContext: {
            name: user.fullName,
            bmi: latestMetric?.bmi,
            weight: latestMetric?.weightKg,
            height: latestMetric?.heightCm || user.heightCm,
            bloodPressure: `${latestMetric?.systolicBp || 120}/${latestMetric?.diastolicBp || 80}`,
            activeGoal: goals[0]?.title,
            habitsCount: habits.length,
            bestStreak: Math.max(...habits.map(h => h.streak), 0),
            waterProgress: `${latestMetric?.waterMl || 1600}/${user.waterTargetMl} ml`,
          },
        }),
      });

      const data = await res.json();
      const newActions: AIActionItem[] = (data.actions || []).map((a: any, idx: number) => ({
        ...a,
        id: a.id || `act_${Date.now()}_${idx}`,
        status: 'pending',
      }));

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply || 'Đã phân tích yêu cầu của bạn.',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        actions: newActions,
      };

      setMessages((prev) => [...prev, botMsg]);

      // If auto-execute is enabled, execute them right away!
      if (autoExecute && newActions.length > 0) {
        newActions.forEach((act) => handleExecuteAction(act));
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Không thể kết nối máy chủ AI. Bạn có thể sử dụng các chức năng tự động trực tiếp trên hệ thống.',
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // AI Meal Estimator
  const handleEstimateMeal = async (presetText?: string) => {
    const text = presetText || foodQuery;
    if (!text.trim() || isScanningFood) return;

    setIsScanningFood(true);
    setFoodLoggedSuccess(false);
    try {
      const res = await fetch('/api/ai/estimate-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mealDescription: text,
          mealType: mealTypeSelect,
        }),
      });
      const data = await res.json();
      setFoodEstimateResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanningFood(false);
    }
  };

  const handleApplyEstimatedFood = () => {
    if (!foodEstimateResult || !onAddMeal) return;
    onAddMeal({
      name: foodEstimateResult.name || foodQuery,
      mealType: foodEstimateResult.mealType || mealTypeSelect,
      calories: Number(foodEstimateResult.calories) || 450,
      protein: Number(foodEstimateResult.protein) || 25,
      carbs: Number(foodEstimateResult.carbs) || 50,
      fat: Number(foodEstimateResult.fat) || 12,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    });
    setFoodLoggedSuccess(true);
    confetti({ particleCount: 60, spread: 70 });
  };

  // 1-Day Protocol Generator
  const handleGenerateProtocol = async () => {
    setIsGeneratingProtocol(true);
    setProtocolApplied(false);
    try {
      const res = await fetch('/api/ai/generate-protocol', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userContext: user,
          goals,
          metrics: latestMetric,
        }),
      });
      const data = await res.json();
      setActiveProtocol(data);
      confetti({ particleCount: 80, spread: 80 });
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingProtocol(false);
    }
  };

  const handleApplyFullProtocol = () => {
    if (!activeProtocol?.actions) return;
    activeProtocol.actions.forEach((act) => {
      handleExecuteAction(act);
    });
    setProtocolApplied(true);
    confetti({ particleCount: 100, spread: 100 });
  };

  const handleAnalyzeAllProgress = async () => {
    setIsAnalyzingProgress(true);
    try {
      const res = await fetch('/api/ai/analyze-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userData: user,
          goals,
          tasks,
          habits,
          metrics: metrics.slice(-5),
        }),
      });
      const data = await res.json();
      setComprehensiveReport(data.analysis || 'Không thể tạo báo cáo phân tích.');
      confetti({ particleCount: 70, spread: 80 });
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzingProgress(false);
    }
  };

  const getActionBadge = (type: AIActionItem['type']) => {
    switch (type) {
      case 'add_task':
        return { icon: Zap, color: 'bg-emerald-500 text-white', label: 'Nhiệm vụ mới' };
      case 'add_meal':
        return { icon: Utensils, color: 'bg-amber-500 text-white', label: 'Dinh dưỡng & Macro' };
      case 'add_supplement':
        return { icon: Pill, color: 'bg-indigo-500 text-white', label: 'Thuốc & Vitamin' };
      case 'log_water':
        return { icon: Droplets, color: 'bg-sky-500 text-white', label: 'Uống nước' };
      case 'add_event':
        return { icon: Calendar, color: 'bg-purple-500 text-white', label: 'Lịch khám' };
      case 'add_habit':
        return { icon: Flame, color: 'bg-rose-500 text-white', label: 'Thói quen mới' };
      default:
        return { icon: Sparkles, color: 'bg-slate-700 text-white', label: 'Hành động' };
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-2 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Trợ lý Sức khỏe & Huấn luyện viên AI</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold border border-purple-200">
              Interactive Copilot
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Không chỉ tư vấn: AI tương tác trực tiếp, tự động thêm nhiệm vụ, ghi nhận dinh dưỡng và lập lịch trên hệ thống.
          </p>
        </div>

        {/* Action Modes */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleAnalyzeAllProgress}
            disabled={isAnalyzingProgress}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {isAnalyzingProgress ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <BrainCircuit className="w-3.5 h-3.5" />
            )}
            <span>Đánh giá toàn diện</span>
          </button>
        </div>
      </div>

      {/* Sub Tab Navigation */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
        <button
          onClick={() => setActiveSubTab('chat')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'chat'
              ? 'bg-white text-purple-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Hội thoại & Thực thi Tác vụ</span>
        </button>

        <button
          onClick={() => setActiveSubTab('meal_scanner')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'meal_scanner'
              ? 'bg-white text-emerald-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Utensils className="w-3.5 h-3.5 text-emerald-600" />
          <span>AI Quét Món Ăn & Macro</span>
        </button>

        <button
          onClick={() => setActiveSubTab('protocol')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'protocol'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Phác Đồ Sức Khỏe 1 Ngày</span>
        </button>
      </div>

      {/* Comprehensive AI Report Card (if generated) */}
      {comprehensiveReport && (
        <div className="bg-gradient-to-br from-purple-50 via-white to-indigo-50/50 p-6 rounded-3xl border-2 border-purple-200 shadow-sm space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Báo cáo Đánh giá Sức khỏe & Thói quen Toàn diện
              </h3>
            </div>
            <button
              onClick={() => setComprehensiveReport(null)}
              className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 cursor-pointer font-medium"
            >
              Đóng
            </button>
          </div>

          <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed whitespace-pre-line text-xs sm:text-sm bg-white/80 p-5 rounded-2xl border border-purple-100 shadow-xs">
            {comprehensiveReport}
          </div>
        </div>
      )}

      {/* VIEW 1: INTERACTIVE CHAT & COPILOT */}
      {activeSubTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Interactive Chat */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col h-[650px]">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Health Copilot AI</h3>
                  <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                    Sẵn sàng thực thi lệnh trực tiếp trên Website
                  </span>
                </div>
              </div>

              {/* Auto-execute Switch */}
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200/80">
                  <input
                    type="checkbox"
                    checked={autoExecute}
                    onChange={(e) => setAutoExecute(e.target.checked)}
                    className="w-3.5 h-3.5 accent-purple-600 rounded cursor-pointer"
                  />
                  <span className="font-semibold text-slate-700">Tự động thực thi</span>
                </label>

                <button
                  onClick={() => setMessages([messages[0]])}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Xóa đoạn chat"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`max-w-[88%] rounded-3xl p-4 text-xs sm:text-sm leading-relaxed ${
                        isUser
                          ? 'bg-purple-600 text-white rounded-br-xs shadow-xs'
                          : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-bl-xs shadow-2xs'
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.content}</p>

                      {/* 🌟 Interactive Action Execution Cards */}
                      {msg.actions && msg.actions.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-slate-200/80 space-y-2">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                            Hành động thực thi trên trang web ({msg.actions.length}):
                          </span>
                          {msg.actions.map((act) => {
                            const badge = getActionBadge(act.type);
                            const IconComponent = badge.icon;
                            const isDone = executedActionIds.has(act.id);

                            return (
                              <div
                                key={act.id}
                                className={`p-3 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                  isDone
                                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                                    : 'bg-white border-purple-200 shadow-xs'
                                }`}
                              >
                                <div className="flex items-start gap-2.5">
                                  <div className={`p-1.5 rounded-xl ${badge.color} shrink-0 mt-0.5`}>
                                    <IconComponent className="w-3.5 h-3.5" />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="font-bold text-xs text-slate-900">{act.label}</span>
                                      <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600 font-semibold">
                                        {badge.label}
                                      </span>
                                    </div>
                                    {act.description && (
                                      <p className="text-[11px] text-slate-500 mt-0.5">{act.description}</p>
                                    )}
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleExecuteAction(act)}
                                  disabled={isDone}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
                                    isDone
                                      ? 'bg-emerald-600 text-white cursor-default opacity-90'
                                      : 'bg-purple-600 hover:bg-purple-700 active:scale-95 text-white shadow-xs'
                                  }`}
                                >
                                  {isDone ? (
                                    <>
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Đã thêm vào hệ thống</span>
                                    </>
                                  ) : (
                                    <>
                                      <PlusCircle className="w-3.5 h-3.5" />
                                      <span>Thực thi ngay</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <span
                        className={`block text-[10px] mt-2 text-right font-mono ${
                          isUser ? 'text-purple-200' : 'text-slate-400'
                        }`}
                      >
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex gap-3 items-center text-slate-500 text-xs italic">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center">
                    <RefreshCw className="w-4 h-4 animate-spin text-purple-600" />
                  </div>
                  <span>AI đang phân tích và chuẩn bị hành động thực thi...</span>
                </div>
              )}
            </div>

            {/* Quick Interactive Command Pills */}
            <div className="px-4 py-2 bg-slate-50/80 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
              <span className="text-slate-400 font-semibold whitespace-nowrap">Lệnh nhanh:</span>
              {[
                '💧 Ghi nhận +350ml nước',
                '🏃 Thêm chạy bộ Zone 2 chiều nay',
                '🥗 Thêm bữa trưa Ức gà nướng 480 calo',
                '💊 Lên lịch uống Omega-3 sau ăn sáng',
                '📅 Đặt lịch khám tổng quát thứ 7',
              ].map((cmd, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(cmd)}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-purple-50 hover:text-purple-700 text-slate-600 border border-slate-200 whitespace-nowrap transition-colors cursor-pointer font-medium"
                >
                  {cmd}
                </button>
              ))}
            </div>

            {/* Input Box */}
            <div className="p-3.5 border-t border-slate-100 bg-white rounded-b-3xl">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Nhập yêu cầu: 'Thêm bài tập...', 'Tôi vừa ăn...', 'Ghi nhận 500ml nước'..."
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-2xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-hidden focus:border-purple-500 focus:ring-1 focus:ring-purple-500 shadow-2xs"
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputQuery.trim()}
                  className="p-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Right 1 Col: Quick Prompts & Health Wisdom */}
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Kịch bản tương tác mẫu
              </h4>
              <div className="space-y-2">
                {[
                  'Tôi vừa uống 500ml nước, hãy cập nhật tiến trình giúp tôi',
                  'Gợi ý bài tập cardio Zone 2 và thêm vào danh sách nhiệm vụ hôm nay',
                  'Tôi ăn 1 đĩa cơm ức gà áp chảo và 1 quả trứng, ghi nhận dinh dưỡng giúp tôi',
                  'Lên lịch nhắc tôi uống Magie Glycinate 400mg trước khi đi ngủ',
                  'Đặt lịch hẹn khám sức khỏe tổng quát vào 9:00 sáng thứ 7 tuần này',
                ].map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q)}
                    className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-purple-50 hover:text-purple-900 border border-slate-100 text-xs text-slate-700 transition-all cursor-pointer font-medium"
                  >
                    ⚡ {q}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-5 text-xs text-emerald-950">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800 mb-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Khả năng tương tác hai chiều</span>
              </div>
              <p className="leading-relaxed text-slate-600">
                Khi AI phản hồi, các nút thao tác tương ứng (thêm việc, nạp nước, ghi calo) sẽ xuất hiện trực tiếp trong khung chat. Dữ liệu được ghi nhận vào hệ thống và đồng bộ ngay tức thì.
              </p>
            </div>

            <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-5 text-xs text-amber-900">
              <div className="flex items-center gap-1.5 font-bold text-amber-800 mb-1">
                <ShieldAlert className="w-4 h-4" />
                <span>Khuyến cáo y khoa</span>
              </div>
              <p className="leading-relaxed">
                Hệ thống đóng vai trò hỗ trợ quản lý lối sống cá nhân và tự động hóa theo dõi thói quen, không thay thế cho chẩn đoán y khoa chuyên nghiệp.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: AI MEAL SCANNER & MACRO ESTIMATOR */}
      {activeSubTab === 'meal_scanner' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">AI Phân Tích Món Ăn & Tự Động Ghi Dinh Dưỡng</h2>
              <p className="text-xs text-slate-500">
                Nhập tên món ăn bằng ngôn ngữ tự nhiên. AI sẽ ước tính Calo, Protein, Carbs, Fat và ghi vào Nhật ký Dinh dưỡng.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-3">
              <label className="text-xs font-bold text-slate-700 mb-1 block">Mô tả món ăn</label>
              <input
                type="text"
                value={foodQuery}
                onChange={(e) => setFoodQuery(e.target.value)}
                placeholder="VD: 1 tô phở bò tái chín, 2 lát bánh mì đen + 2 trứng ốp la, 1 đĩa cơm sườn bì chả..."
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:border-emerald-500 bg-slate-50/50"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1 block">Bữa ăn</label>
              <select
                value={mealTypeSelect}
                onChange={(e: any) => setMealTypeSelect(e.target.value)}
                className="w-full px-3 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold bg-white text-slate-700 focus:outline-hidden focus:border-emerald-500"
              >
                <option value="breakfast">Bữa sáng</option>
                <option value="lunch">Bữa trưa</option>
                <option value="dinner">Bữa tối</option>
                <option value="snack">Bữa phụ</option>
              </select>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400 font-semibold">Gợi ý nhanh:</span>
            {[
              '1 tô Phở bò tái chín + 1 trứng chần',
              'Cơm tấm sườn bì chả',
              'Ức gà áp chảo 150g + Khoai lang luộc',
              'Salad cá hồi sốt mè rang',
              '1 ly Whey Protein Isolate + 1 quả chuối',
            ].map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setFoodQuery(preset);
                  handleEstimateMeal(preset);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-xs text-slate-700 border border-slate-200/80 transition-colors cursor-pointer"
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={() => handleEstimateMeal()}
            disabled={isScanningFood || !foodQuery.trim()}
            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
          >
            {isScanningFood ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>AI đang phân tích thành phần dinh dưỡng...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Phân tích chỉ số Macro món này</span>
              </>
            )}
          </button>

          {/* Results Display */}
          {foodEstimateResult && (
            <div className="p-5 rounded-3xl bg-emerald-50/60 border border-emerald-200/80 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-emerald-950">{foodEstimateResult.name}</h3>
                  <p className="text-xs text-emerald-700 mt-0.5">{foodEstimateResult.healthTip}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xl font-bold text-emerald-900">{foodEstimateResult.calories}</span>
                  <span className="text-[10px] text-emerald-600 block">KCAL</span>
                </div>
              </div>

              {/* Macros Breakdown */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white p-3 rounded-2xl border border-emerald-100 text-center">
                  <span className="text-[10px] text-slate-500 font-bold block">ĐẠM (PROTEIN)</span>
                  <span className="font-mono font-bold text-slate-900 text-base">{foodEstimateResult.protein}g</span>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-emerald-100 text-center">
                  <span className="text-[10px] text-slate-500 font-bold block">TINH BỘT (CARBS)</span>
                  <span className="font-mono font-bold text-slate-900 text-base">{foodEstimateResult.carbs}g</span>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-emerald-100 text-center">
                  <span className="text-[10px] text-slate-500 font-bold block">CHẤT BÉO (FAT)</span>
                  <span className="font-mono font-bold text-slate-900 text-base">{foodEstimateResult.fat}g</span>
                </div>
              </div>

              {/* Confirm Add Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleApplyEstimatedFood}
                  disabled={foodLoggedSuccess}
                  className={`w-full py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    foodLoggedSuccess
                      ? 'bg-emerald-700 text-white cursor-default'
                      : 'bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white shadow-xs'
                  }`}
                >
                  {foodLoggedSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Đã ghi vào Nhật ký Dinh Dưỡng & Macro hôm nay!</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4" />
                      <span>Ghi món này vào Nhật ký Dinh Dưỡng Hôm Nay</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: 1-DAY PERSONALIZED ACTION PROTOCOL */}
      {activeSubTab === 'protocol' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">AI Lập Phác Đồ Hành Động 1 Ngày</h2>
                <p className="text-xs text-slate-500">
                  Tạo kế hoạch cá nhân hóa chuẩn khoa học dựa trên BMI, giấc ngủ và mục tiêu, với 1 nút kích hoạt toàn bộ vào Dashboard.
                </p>
              </div>
            </div>

            <button
              onClick={handleGenerateProtocol}
              disabled={isGeneratingProtocol}
              className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isGeneratingProtocol ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>Tạo phác đồ hôm nay</span>
            </button>
          </div>

          {/* Active Protocol Card */}
          {activeProtocol ? (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-5 rounded-3xl bg-indigo-50/60 border border-indigo-200/80">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-200 text-indigo-900">
                    Phác đồ y khoa khuyến nghị
                  </span>
                </div>
                <h3 className="font-bold text-base text-indigo-950">{activeProtocol.title}</h3>
                <p className="text-xs text-indigo-800/80 mt-1 leading-relaxed">{activeProtocol.summary}</p>
              </div>

              {/* Protocol Actions List */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Các hành động trong phác đồ ({activeProtocol.actions.length}):
                </h4>
                {activeProtocol.actions.map((act) => {
                  const badge = getActionBadge(act.type);
                  const IconComp = badge.icon;
                  const isDone = executedActionIds.has(act.id) || protocolApplied;

                  return (
                    <div
                      key={act.id}
                      className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-xl ${badge.color} shrink-0 mt-0.5`}>
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900">{act.label}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-white border text-slate-600 font-semibold">
                              {badge.label}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{act.description}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleExecuteAction(act)}
                        disabled={isDone}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer ${
                          isDone
                            ? 'bg-emerald-600 text-white cursor-default'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                        }`}
                      >
                        {isDone ? <Check className="w-3.5 h-3.5" /> : <PlusCircle className="w-3.5 h-3.5" />}
                        <span>{isDone ? 'Đã kích hoạt' : 'Kích hoạt'}</span>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Master Button to Apply All */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleApplyFullProtocol}
                  disabled={protocolApplied}
                  className={`w-full py-3.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                    protocolApplied
                      ? 'bg-emerald-600 text-white cursor-default'
                      : 'bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white'
                  }`}
                >
                  {protocolApplied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Đã kích hoạt toàn bộ phác đồ vào Dashboard!</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>Kích hoạt Toàn Bộ Phác Đồ Vào Hệ Thống (Apply All)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-3xl space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Bấm &quot;Tạo phác đồ hôm nay&quot; để AI tổng hợp dữ liệu cân nặng ({latestMetric?.weightKg || user.weightKg} kg, BMI {latestMetric?.bmi || 23.2}) và tự động xây dựng lộ trình hành động 1 ngày cho bạn.
              </p>
              <button
                onClick={handleGenerateProtocol}
                disabled={isGeneratingProtocol}
                className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Sparkles className="w-4 h-4" />
                <span>Bắt đầu phân tích & Lập phác đồ</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
