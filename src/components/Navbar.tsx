import React from 'react';
import { 
  Activity, 
  CheckSquare, 
  Flame, 
  Calendar, 
  HeartPulse, 
  BarChart3, 
  Bot, 
  Plus, 
  LogOut,
  Sparkles
} from 'lucide-react';
import { UserProfile, HealthMetricEntry } from '../types';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  user: UserProfile;
  latestMetric?: HealthMetricEntry;
  onOpenAddModal: () => void;
  onOpenVitalsModal?: () => void;
  onOpenProfileModal: () => void;
  onLogoutRequest: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  user,
  latestMetric,
  onOpenAddModal,
  onOpenVitalsModal,
  onOpenProfileModal,
  onLogoutRequest,
}) => {
  const navTabs = [
    { id: 'dashboard', label: 'Tổng quan', icon: Activity },
    { id: 'goals', label: 'Mục tiêu & Nhiệm vụ', icon: CheckSquare },
    { id: 'habits', label: 'Thói quen', icon: Flame },
    { id: 'metrics', label: 'Chỉ số & BMI', icon: HeartPulse },
    { id: 'calendar', label: 'Lịch nhắc', icon: Calendar },
    { id: 'stats', label: 'Báo cáo', icon: BarChart3 },
    { id: 'ai', label: 'Trợ lý AI', icon: Bot, isAi: true },
  ];

  const bmiValue = Number((user.weightKg / Math.pow(user.heightCm / 100, 2)).toFixed(1));

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          
          {/* Brand Logo */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer select-none" 
            onClick={() => onTabChange('dashboard')}
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.4]" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-slate-900 text-base sm:text-lg tracking-tight">HealthTrack</span>
              <span className="text-[10px] text-emerald-600 font-semibold tracking-wider uppercase">Pro</span>
            </div>
          </div>

          {/* Center Navigation for Desktop */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 p-1 rounded-xl border border-slate-200/60">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? tab.isAi
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-white text-slate-900 shadow-xs border border-slate-200/50'
                      : tab.isAi
                      ? 'text-purple-700 hover:text-purple-800 hover:bg-purple-50/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? (tab.isAi ? 'text-white' : 'text-emerald-600') : (tab.isAi ? 'text-purple-600' : 'text-slate-400')}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Primary Vitals Log Button - High visibility */}
            {onOpenVitalsModal && (
              <button
                onClick={onOpenVitalsModal}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200/80 rounded-xl transition-all shadow-xs cursor-pointer"
                title="Ghi nhận cân nặng, huyết áp, nhịp tim hôm nay"
              >
                <HeartPulse className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
                <span className="font-semibold">Ghi chỉ số</span>
              </button>
            )}

            {/* Quick Add Button */}
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded-xl transition-all shadow-xs cursor-pointer"
              title="Thêm nhanh mục tiêu hoặc nhiệm vụ"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Thêm việc</span>
            </button>

            {/* Profile Pill */}
            <button
              onClick={onOpenProfileModal}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-xl border border-slate-200/70 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Hồ sơ & Cài đặt"
            >
              <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                {user.fullName.charAt(0) || 'U'}
              </div>
              <div className="text-left hidden lg:block">
                <span className="text-xs font-semibold text-slate-800 block leading-none">{user.fullName.split(' ').pop()}</span>
                <span className="text-[10px] text-slate-400 font-mono leading-none">BMI {bmiValue}</span>
              </div>
            </button>

            {/* Logout Icon */}
            <button
              onClick={onLogoutRequest}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Scrollbar */}
        <div className="md:hidden flex items-center space-x-1 overflow-x-auto scrollbar-none py-1.5 border-t border-slate-100">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? tab.isAi
                      ? 'bg-purple-600 text-white'
                      : 'bg-emerald-600 text-white'
                    : tab.isAi
                    ? 'text-purple-700 bg-purple-50'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
