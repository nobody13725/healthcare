import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  Trash2, 
  Bell, 
  MapPin, 
  AlertCircle, 
  Check,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { CalendarEvent } from '../types';

interface CalendarRemindersViewProps {
  events: CalendarEvent[];
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  onDeleteEvent: (id: string) => void;
}

export const CalendarRemindersView: React.FC<CalendarRemindersViewProps> = ({
  events,
  onAddEvent,
  onDeleteEvent,
}) => {
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('list');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Event Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CalendarEvent['category']>('appointment');
  const [date, setDate] = useState('2026-09-20');
  const [startTime, setStartTime] = useState('08:30');
  const [endTime, setEndTime] = useState('10:00');
  const [location, setLocation] = useState('Bệnh viện Đa khoa');
  const [notes, setNotes] = useState('');
  const [reminderMinutes, setReminderMinutes] = useState(60);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddEvent({
      title,
      category,
      date,
      startTime,
      endTime,
      location,
      notes,
      reminderMinutes,
    });

    setTitle('');
    setShowAddModal(false);
  };

  const getCategoryBadge = (cat: CalendarEvent['category']) => {
    switch (cat) {
      case 'appointment':
        return { label: 'Lịch khám bệnh', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'medication':
        return { label: 'Lịch uống thuốc', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'exercise':
        return { label: 'Vận động thể thao', bg: 'bg-orange-50 text-orange-700 border-orange-200' };
      case 'checkup':
        return { label: 'Khám sức khỏe', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      default:
        return { label: 'Khác', bg: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Lịch & Nhắc nhở</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi lịch khám bác sĩ, lịch uống thuốc và các mốc chăm sóc sức khỏe
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex p-1 bg-slate-100 rounded-xl text-xs font-medium">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Danh sách
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'month' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Xem theo tháng
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm sự kiện</span>
          </button>
        </div>
      </div>

      {/* Events View */}
      {viewMode === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((evt) => {
            const badge = getCategoryBadge(evt.category);
            return (
              <div
                key={evt.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-purple-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${badge.bg}`}>
                      {badge.label}
                    </span>
                    <button
                      onClick={() => {
                        if (confirm(`Bạn có chắc muốn xóa lịch "${evt.title}"?`)) {
                          onDeleteEvent(evt.id);
                        }
                      }}
                      className="text-slate-300 hover:text-red-500 p-1 cursor-pointer transition-colors"
                      title="Xóa lịch"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mt-2.5">{evt.title}</h3>
                  
                  <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-3.5 h-3.5 text-purple-600" />
                      <span className="font-semibold text-slate-800">{evt.date}</span>
                      <span>•</span>
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{evt.startTime} {evt.endTime ? `- ${evt.endTime}` : ''}</span>
                    </div>

                    {evt.location && (
                      <div className="flex items-center gap-2 text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{evt.location}</span>
                      </div>
                    )}

                    {evt.notes && (
                      <div className="p-2 rounded-lg bg-slate-50 text-slate-600 mt-2 text-xs border border-slate-100">
                        💡 {evt.notes}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1">
                    <Bell className="w-3.5 h-3.5 text-purple-500" />
                    <span>Nhắc trước {evt.reminderMinutes || 60} phút</span>
                  </div>
                  <span className="text-emerald-600 font-medium">Đã kích hoạt nhắc nhở</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Month Visual Matrix */
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Tháng 09 / 2026</h3>
            <span className="text-xs text-slate-500">Hiển thị {events.length} sự kiện y tế</span>
          </div>

          <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-xl overflow-hidden text-center text-xs">
            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (
              <div key={d} className="bg-slate-50 p-2 font-bold text-slate-600">{d}</div>
            ))}
            {Array.from({ length: 30 }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = `2026-09-${dayNum.toString().padStart(2, '0')}`;
              const dayEvents = events.filter(e => e.date === dateStr);

              return (
                <div key={dayNum} className="bg-white p-2 min-h-[75px] text-left hover:bg-purple-50/30 transition-colors">
                  <span className="font-mono text-slate-500 font-medium">{dayNum}</span>
                  <div className="mt-1 space-y-1">
                    {dayEvents.map(e => (
                      <div key={e.id} className="text-[10px] p-1 rounded-md bg-purple-100 text-purple-800 font-semibold truncate" title={e.title}>
                        {e.startTime} {e.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Add Event */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-purple-600" />
                <span>Thêm sự kiện / Nhắc nhở</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Tiêu đề sự kiện *
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Khám tổng quát, Uống thuốc sau ăn..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Loại sự kiện
                  </label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-purple-500"
                  >
                    <option value="appointment">Khám bệnh / Bác sĩ</option>
                    <option value="medication">Uống thuốc theo đơn</option>
                    <option value="exercise">Lịch tập thể dục</option>
                    <option value="checkup">Xét nghiệm / Tái khám</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Ngày diễn ra
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Giờ bắt đầu
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Nhắc trước (Phút)
                  </label>
                  <select
                    value={reminderMinutes}
                    onChange={(e) => setReminderMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-purple-500"
                  >
                    <option value={15}>15 phút</option>
                    <option value={30}>30 phút</option>
                    <option value={60}>1 giờ</option>
                    <option value={1440}>1 ngày (24 giờ)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Địa điểm (Bệnh viện / Phòng khám)
                </label>
                <input
                  type="text"
                  placeholder="VD: Bệnh viện Đa khoa, Trung tâm y tế..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Ghi chú dặn dò
                </label>
                <textarea
                  rows={2}
                  placeholder="VD: Nhịn ăn sáng, mang sổ khám, uống nhiều nước..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:border-purple-500"
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
                  className="px-5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-sm"
                >
                  Lưu lịch hẹn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
