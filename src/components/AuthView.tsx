import React, { useState } from 'react';
import { 
  Activity, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  Sparkles, 
  ArrowRight, 
  Check, 
  AlertCircle,
  Zap,
  ShieldCheck,
  Flame,
  Droplet,
  Moon,
  HeartPulse
} from 'lucide-react';
import { UserProfile } from '../types';
import { initialProfile } from '../data/initialData';

interface AuthViewProps {
  onLoginSuccess: (user: UserProfile) => void;
  defaultUser: UserProfile;
}

type AuthTab = 'quick' | 'login' | 'ai_onboard' | 'register' | 'forgot';

export const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess, defaultUser }) => {
  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Standard Login State
  const [loginEmail, setLoginEmail] = useState(defaultUser.email || 'an.nguyen@healthtrack.app');
  const [loginPassword, setLoginPassword] = useState('password123');

  // Minimal Register State (Only 3 essential fields)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // AI Smart Onboarding State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiSelectedGoal, setAiSelectedGoal] = useState<'weight_loss' | 'better_sleep' | 'desk_worker' | 'fitness'>('weight_loss');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');

  // 1-Click Instant Demo Login
  const handleQuickLogin = () => {
    setErrorMsg('');
    setSuccessMsg('Đang đăng nhập nhanh vào tài khoản trải nghiệm...');
    setTimeout(() => {
      onLoginSuccess(defaultUser);
    }, 400);
  };

  // Standard Login
  const handleStandardLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMsg('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    // Check localStorage registered users
    const saved = localStorage.getItem('healthtrack_custom_users');
    const customUsers: Array<{ email: string; pass: string; profile: UserProfile }> = saved ? JSON.parse(saved) : [];
    const matched = customUsers.find(u => u.email.toLowerCase() === loginEmail.trim().toLowerCase());

    const loggedInUser: UserProfile = matched ? matched.profile : {
      ...defaultUser,
      email: loginEmail.trim(),
      fullName: loginEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, c => c.toUpperCase()) || defaultUser.fullName,
    };

    setSuccessMsg('Đăng nhập thành công!');
    setTimeout(() => {
      onLoginSuccess(loggedInUser);
    }, 300);
  };

  // Simple Register
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setErrorMsg('Vui lòng điền họ tên, email và mật khẩu.');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMsg('Mật khẩu cần tối thiểu 6 ký tự.');
      return;
    }

    const newUser: UserProfile = {
      ...defaultUser,
      id: 'usr_' + Date.now(),
      fullName: regName.trim(),
      email: regEmail.trim(),
    };

    // Save to local registry
    const saved = localStorage.getItem('healthtrack_custom_users');
    const list = saved ? JSON.parse(saved) : [];
    list.push({ email: regEmail.trim(), pass: regPassword, profile: newUser });
    localStorage.setItem('healthtrack_custom_users', JSON.stringify(list));

    setSuccessMsg('Tạo tài khoản thành công! Đang chuyển hướng...');
    setTimeout(() => {
      onLoginSuccess(newUser);
    }, 500);
  };

  // AI Smart Setup & Instant Onboarding
  const handleAiSetup = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsAiGenerating(true);
    setErrorMsg('');

    setTimeout(() => {
      let customName = 'Người dùng Sức Khỏe';
      let customWeight = 68;
      let targetWeight = 63;
      let water = 2200;
      let sleep = 7.5;
      let steps = 8000;

      if (aiSelectedGoal === 'weight_loss') {
        customWeight = 72;
        targetWeight = 65;
        water = 2500;
        sleep = 7.5;
        steps = 10000;
      } else if (aiSelectedGoal === 'better_sleep') {
        customWeight = 62;
        targetWeight = 62;
        water = 2000;
        sleep = 8.5;
        steps = 6500;
      } else if (aiSelectedGoal === 'desk_worker') {
        customWeight = 66;
        targetWeight = 64;
        water = 2400;
        sleep = 8.0;
        steps = 7000;
      } else if (aiSelectedGoal === 'fitness') {
        customWeight = 70;
        targetWeight = 72;
        water = 2800;
        sleep = 8.0;
        steps = 10000;
      }

      // Check if user entered custom text prompt
      if (aiPrompt.trim()) {
        const lower = aiPrompt.toLowerCase();
        if (lower.includes('giảm cân') || lower.includes('béo') || lower.includes('mỡ')) {
          targetWeight = customWeight - 5;
          steps = 9000;
        }
        if (lower.includes('ngủ') || lower.includes('mất ngủ')) {
          sleep = 8.5;
        }
        if (lower.includes('nước')) {
          water = 2500;
        }
      }

      const generatedUser: UserProfile = {
        ...defaultUser,
        id: 'usr_ai_' + Date.now(),
        fullName: aiPrompt.trim().length > 0 && aiPrompt.length < 25 ? aiPrompt.trim() : 'Thành viên Tinh Gọn',
        email: 'member@healthtrack.app',
        weightKg: customWeight,
        targetWeightKg: targetWeight,
        waterTargetMl: water,
        sleepTargetHours: sleep,
        stepTarget: steps,
      };

      setIsAiGenerating(false);
      setSuccessMsg('AI đã cá nhân hóa hồ sơ của bạn thành công!');
      setTimeout(() => {
        onLoginSuccess(generatedUser);
      }, 500);
    }, 1000);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setErrorMsg('Vui lòng nhập địa chỉ email.');
      return;
    }
    setSuccessMsg(`Liên kết đặt lại mật khẩu đã gửi tới ${forgotEmail}.`);
    setTimeout(() => {
      setActiveTab('login');
      setSuccessMsg('');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-800 selection:bg-emerald-500 selection:text-white">
      
      {/* Background Subtle Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-40">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-200/40 blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-teal-200/40 blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20 mb-3">
            <Activity className="w-6 h-6 stroke-[2.4]" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">HealthTrack</h1>
          <p className="text-xs text-slate-500 mt-1">Quản lý sức khỏe & thói quen tối giản</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/60 border border-slate-100 backdrop-blur-sm">
          
          {/* Quick Access Top Pill */}
          <div className="mb-5 p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Zap className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-emerald-950">Vào nhanh không cần mật khẩu</p>
                <p className="text-[11px] text-emerald-700">Dùng ngay tài khoản mẫu với đầy đủ tính năng</p>
              </div>
            </div>
            <button
              onClick={handleQuickLogin}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shrink-0 shadow-xs"
            >
              Vào ngay
            </button>
          </div>

          {/* Tab Switcher */}
          <div className="flex border-b border-slate-100 mb-6 gap-2">
            <button
              type="button"
              onClick={() => { setActiveTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`pb-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'login'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('ai_onboard'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`pb-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors flex items-center gap-1 cursor-pointer ${
                activeTab === 'ai_onboard'
                  ? 'border-purple-600 text-purple-700'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>AI Đăng nhập thông minh</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('register'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`pb-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                activeTab === 'register'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              Đăng ký
            </button>
          </div>

          {/* Messages */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: STANDARD LOGIN */}
          {activeTab === 'login' && (
            <form onSubmit={handleStandardLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email hoặc Số điện thoại</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-600">Mật khẩu</label>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('forgot'); setErrorMsg(''); setSuccessMsg(''); }}
                    className="text-[11px] text-emerald-600 hover:underline cursor-pointer"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-sm rounded-xl shadow-xs transition-all cursor-pointer mt-2"
              >
                Đăng nhập
              </button>
            </form>
          )}

          {/* TAB 2: AI SMART SETUP / ONBOARDING */}
          {activeTab === 'ai_onboard' && (
            <div className="space-y-4">
              <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-2xl text-xs text-purple-900 leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold mb-1 text-purple-800">
                  <Sparkles className="w-4 h-4" />
                  <span>Trợ lý AI thiết lập hồ sơ tức thì</span>
                </div>
                Chọn định hướng sức khỏe hoặc miêu tả mong muốn của bạn. AI sẽ tự động tính toán chỉ số và đưa bạn vào không gian theo dõi cá nhân hóa.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Chọn nhanh mục tiêu của bạn:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAiSelectedGoal('weight_loss')}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      aiSelectedGoal === 'weight_loss'
                        ? 'border-purple-500 bg-purple-50/60 font-semibold text-purple-900 ring-1 ring-purple-400'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50/50'
                    }`}
                  >
                    <span className="font-bold block">Giảm cân lành mạnh</span>
                    <span className="text-[11px] text-slate-500">Giảm 5kg & 10,000 bước</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAiSelectedGoal('better_sleep')}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      aiSelectedGoal === 'better_sleep'
                        ? 'border-purple-500 bg-purple-50/60 font-semibold text-purple-900 ring-1 ring-purple-400'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50/50'
                    }`}
                  >
                    <span className="font-bold block">Giấc ngủ & Thư giãn</span>
                    <span className="text-[11px] text-slate-500">Ngủ sâu 8.5h & thiền định</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAiSelectedGoal('desk_worker')}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      aiSelectedGoal === 'desk_worker'
                        ? 'border-purple-500 bg-purple-50/60 font-semibold text-purple-900 ring-1 ring-purple-400'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50/50'
                    }`}
                  >
                    <span className="font-bold block">Dân văn phòng</span>
                    <span className="text-[11px] text-slate-500">Giãn cơ & 2.4L nước/ngày</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAiSelectedGoal('fitness')}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      aiSelectedGoal === 'fitness'
                        ? 'border-purple-500 bg-purple-50/60 font-semibold text-purple-900 ring-1 ring-purple-400'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50/50'
                    }`}
                  >
                    <span className="font-bold block">Tập luyện & Tăng cơ</span>
                    <span className="text-[11px] text-slate-500">Tăng thể lực & 2.8L nước</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hoặc miêu tả ngắn mong muốn (tùy chọn):
                </label>
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Vd: Minh, 25 tuổi, muốn chạy bộ mỗi sáng..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:bg-white"
                />
              </div>

              <button
                type="button"
                disabled={isAiGenerating}
                onClick={() => handleAiSetup()}
                className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 disabled:opacity-60 text-white font-semibold text-sm rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isAiGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>AI đang phân tích & tạo hồ sơ...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>AI Khởi tạo & Đăng nhập ngay</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 3: MINIMAL REGISTER */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Họ và tên</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Mật khẩu</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-sm rounded-xl shadow-xs transition-all cursor-pointer mt-2"
              >
                Tạo tài khoản & Đăng nhập
              </button>
            </form>
          )}

          {/* TAB 4: FORGOT PASSWORD */}
          {activeTab === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Nhập email của bạn. Hệ thống sẽ gửi đường dẫn khôi phục mật khẩu trong tích tắc.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email tài khoản</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => { setActiveTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
                  className="flex-1 py-2 px-3 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Gửi liên kết
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Minimal Footer */}
        <div className="text-center mt-6 text-[11px] text-slate-400 flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Dữ liệu sức khỏe được bảo mật và lưu trữ an toàn</span>
        </div>
      </div>
    </div>
  );
};
