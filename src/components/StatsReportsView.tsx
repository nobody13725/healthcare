import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Download, 
  Printer, 
  Filter, 
  CheckCircle2, 
  Flame, 
  Clock, 
  FileText
} from 'lucide-react';
import { HealthMetricEntry, ActivityLog, Habit, HealthGoal, HealthTask } from '../types';
import { exportToCSV } from '../utils/exportUtils';

interface StatsReportsViewProps {
  metrics: HealthMetricEntry[];
  logs: ActivityLog[];
  habits: Habit[];
  goals: HealthGoal[];
  tasks: HealthTask[];
}

export const StatsReportsView: React.FC<StatsReportsViewProps> = ({
  metrics,
  logs,
  habits,
  goals,
  tasks,
}) => {
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('week');
  const [logFilter, setLogFilter] = useState<string>('all');

  // Calculate statistics
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const skippedTasks = tasks.filter(t => t.status === 'skipped').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;

  const handleExportCSV = () => {
    const rows = [
      ['Ngày', 'Cân nặng (kg)', 'Chiều cao (cm)', 'BMI', 'Huyết áp', 'Nhịp tim', 'Nước (ml)', 'Giấc ngủ (h)', 'Bước chân'],
      ...metrics.map(m => [
        m.date,
        m.weightKg,
        m.heightCm,
        m.bmi,
        `${m.systolicBp || ''}/${m.diastolicBp || ''}`,
        m.heartRateBpm || '',
        m.waterMl || '',
        m.sleepHours || '',
        m.steps || ''
      ])
    ];
    exportToCSV(`Bao_cao_chi_so_suc_khoe_${new Date().toISOString().split('T')[0]}`, rows);
  };

  const filteredLogs = logFilter === 'all' 
    ? logs 
    : logs.filter(l => l.type === logFilter);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Báo cáo & Thống kê</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Phân tích dữ liệu theo chu kỳ, đánh giá hiệu quả thực hiện mục tiêu và xuất dữ liệu báo cáo
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In báo cáo</span>
          </button>
        </div>
      </div>

      {/* Top 3 Analytical Summary Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Tỷ lệ hoàn thành nhiệm vụ</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900">
              {tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0}%
            </span>
            <span className="text-xs text-emerald-600 font-semibold">+12% so với tuần trước</span>
          </div>
          <div className="mt-3 flex gap-1 h-2 rounded-full overflow-hidden bg-slate-100">
            <div className="bg-emerald-500 h-full" style={{ width: `${(completedTasks / (tasks.length || 1)) * 100}%` }}></div>
            <div className="bg-amber-400 h-full" style={{ width: `${(pendingTasks / (tasks.length || 1)) * 100}%` }}></div>
            <div className="bg-slate-300 h-full" style={{ width: `${(skippedTasks / (tasks.length || 1)) * 100}%` }}></div>
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-slate-500">
            <span className="text-emerald-700 font-medium">✓ {completedTasks} xong</span>
            <span className="text-amber-700 font-medium">⏳ {pendingTasks} chờ</span>
            <span className="text-slate-400">✕ {skippedTasks} bỏ qua</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Xu hướng cân nặng</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 font-mono">
              -1.3 kg
            </span>
            <span className="text-xs text-emerald-600 font-semibold font-mono">Đạt 45% lộ trình</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Từ 69.8 kg xuống 68.5 kg trong 7 ngày qua. Tốc độ giảm mỡ bền vững an toàn.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Chỉ số kiên trì (Habit Streak)</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-orange-600 font-mono">
              9 ngày
            </span>
            <span className="text-xs text-slate-500">Kỷ lục cao nhất: 14 ngày</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Thói quen uống nước 2L đạt 100% tỷ lệ check-in liên tục cả tuần.
          </p>
        </div>
      </div>

      {/* SVG Trend Chart: Weight & BMI Dynamics */}
      <div className="bg-white rounded-3xl border border-slate-200/70 shadow-xs p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-emerald-600" />
              <span>Biểu đồ biến động Cân nặng & Chỉ số BMI</span>
            </h3>
            <p className="text-xs text-slate-500">Dữ liệu ghi nhận từ hệ thống qua từng mốc kiểm tra</p>
          </div>

          <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
              <span>Cân nặng (kg)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span>
              <span>BMI</span>
            </div>
          </div>
        </div>

        {/* Visual Chart Bars / Plot */}
        <div className="mt-6">
          <div className="h-56 w-full flex items-end justify-between gap-3 px-4 pt-6 pb-2 bg-slate-50/70 rounded-xl border border-slate-100">
            {metrics.map((m, idx) => {
              // Normalize weight between 65kg and 72kg for visual bar
              const weightHeightPercent = Math.max(20, Math.min(95, ((m.weightKg - 65) / 7) * 100));
              const bmiHeightPercent = Math.max(20, Math.min(95, ((m.bmi - 21) / 4) * 100));

              return (
                <div key={m.id} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <div className="flex items-end justify-center gap-1 w-full h-full pb-2">
                    {/* Weight Bar */}
                    <div 
                      className="w-4 sm:w-6 bg-emerald-500 hover:bg-emerald-600 rounded-t-md transition-all relative group-hover:scale-105"
                      style={{ height: `${weightHeightPercent}%` }}
                    >
                      <span className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-mono py-0.5 px-1.5 rounded-md whitespace-nowrap transition-opacity pointer-events-none z-10">
                        {m.weightKg} kg
                      </span>
                    </div>

                    {/* BMI Bar */}
                    <div 
                      className="w-4 sm:w-6 bg-blue-400 hover:bg-blue-500 rounded-t-md transition-all relative group-hover:scale-105"
                      style={{ height: `${bmiHeightPercent}%` }}
                    >
                      <span className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-mono py-0.5 px-1.5 rounded-md whitespace-nowrap transition-opacity pointer-events-none z-10">
                        BMI: {m.bmi}
                      </span>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-slate-500 mt-2 whitespace-nowrap">
                    {m.date.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Activity Log Feed */}
      <div className="bg-white rounded-3xl border border-slate-200/70 shadow-xs p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <span>Nhật ký & Lịch sử hoạt động</span>
            </h3>
            <p className="text-xs text-slate-500">Ghi nhận toàn bộ tác vụ, cập nhật chỉ số và chuỗi thói quen</p>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setLogFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
                logFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setLogFilter('task_completed')}
              className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
                logFilter === 'task_completed' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              Nhiệm vụ
            </button>
            <button
              onClick={() => setLogFilter('metric_logged')}
              className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
                logFilter === 'metric_logged' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              Chỉ số
            </button>
          </div>
        </div>

        <div className="mt-4 divide-y divide-slate-100">
          {filteredLogs.map((log) => (
            <div key={log.id} className="py-3.5 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 mt-0.5 shrink-0">
                {log.type === 'task_completed' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                {log.type === 'habit_streak' && <Flame className="w-4 h-4 text-orange-600" />}
                {log.type === 'metric_logged' && <TrendingUp className="w-4 h-4 text-teal-600" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{log.title}</h4>
                  <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap">{log.timestamp}</span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">{log.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
