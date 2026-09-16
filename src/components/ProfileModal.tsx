import React, { useState } from 'react';
import { 
  X, 
  User, 
  Lock, 
  Heart, 
  Settings, 
  LogOut, 
  Check, 
  AlertCircle, 
  Save, 
  Key, 
  Bell, 
  Moon, 
  Sun, 
  Shield, 
  Droplet, 
  Footprints, 
  Clock, 
  Download,
  Trash2
} from 'lucide-react';
import { UserProfile } from '../types';
import { calculateBmi } from '../data/initialData';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  onLogoutRequest: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onLogoutRequest,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'health_targets' | 'preferences'>('profile');
  
  // Profile form state (PB04)
  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [birthDate, setBirthDate] = useState(user.birthDate);
  const [gender, setGender] = useState(user.gender);
  const [heightCm, setHeightCm] = useState(user.heightCm);
  const [weightKg, setWeightKg] = useState(user.weightKg);
  const [targetWeightKg, setTargetWeightKg] = useState(user.targetWeightKg || 65);
  const [bloodType, setBloodType] = useState(user.bloodType || 'O+');
  const [allergies, setAllergies] = useState(user.allergies || 'Không có dị ứng thuốc đã biết');

  // Health Targets
  const [waterTargetMl, setWaterTargetMl] = useState(user.waterTargetMl);
  const [sleepTargetHours, setSleepTargetHours] = useState(user.sleepTargetHours);
  const [stepTarget, setStepTarget] = useState(user.stepTarget);

  // Security / Password state (PB05)
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status feedback
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const currentBmi = calculateBmi(weightKg, heightCm);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!fullName.trim() || !email.trim()) {
      setErrorMsg('Vui lòng điền họ tên và email hợp lệ.');
      return;
    }

    const updated: UserProfile = {
      ...user,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      birthDate,
      gender,
      heightCm: Number(heightCm),
      weightKg: Number(weightKg),
      targetWeightKg: Number(targetWeightKg),
      bloodType,
      allergies,
      waterTargetMl: Number(waterTargetMl),
      sleepTargetHours: Number(sleepTargetHours),
      stepTarget: Number(stepTarget),
    };

    onUpdateUser(updated);
    setSuccessMsg('Cập nhật thông tin cá nhân thành công!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp.');
      return;
    }

    // Save success
    setSuccessMsg('Đổi mật khẩu thành công!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleExportDataBackup = () => {
    const backup = {
      profile: user,
      goals: localStorage.getItem('dtu_health_goals'),
      tasks: localStorage.getItem('dtu_health_tasks'),
      habits: localStorage.getItem('dtu_health_habits'),
      metrics: localStorage.getItem('dtu_health_metrics'),
      events: localStorage.getItem('dtu_health_events'),
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HealthTrack_Backup_${user.fullName.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setSuccessMsg('Đã sao lưu dữ liệu cá nhân thành công!');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg">
              {user.fullName.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight">{user.fullName}</h2>
              <p className="text-xs text-slate-300">{user.email} • ID: {user.id}</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2 pt-2">
          <button
            onClick={() => { setActiveTab('profile'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex items-center gap-1.5 py-3 px-3.5 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-xl'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Hồ sơ cá nhân</span>
          </button>

          <button
            onClick={() => { setActiveTab('health_targets'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex items-center gap-1.5 py-3 px-3.5 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'health_targets'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-xl'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Mục tiêu sinh hoạt</span>
          </button>

          <button
            onClick={() => { setActiveTab('security'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex items-center gap-1.5 py-3 px-3.5 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'security'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-xl'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Bảo mật & Đổi mật khẩu</span>
          </button>

          <button
            onClick={() => { setActiveTab('preferences'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`flex items-center gap-1.5 py-3 px-3.5 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'preferences'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-xl'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Cài đặt</span>
          </button>
        </div>

        {/* Feedback Message */}
        {successMsg && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-slate-800 text-sm">
          
          {/* TAB 1: PROFILE INFO */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Họ và tên</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Email liên hệ</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Số điện thoại</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Ngày sinh</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Giới tính</label>
                  <select
                    value={gender}
                    onChange={(e: any) => setGender(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white cursor-pointer"
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Nhóm máu</label>
                  <select
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white cursor-pointer"
                  >
                    <option value="A+">Nhóm A+</option>
                    <option value="A-">Nhóm A-</option>
                    <option value="B+">Nhóm B+</option>
                    <option value="B-">Nhóm B-</option>
                    <option value="AB+">Nhóm AB+</option>
                    <option value="AB-">Nhóm AB-</option>
                    <option value="O+">Nhóm O+</option>
                    <option value="O-">Nhóm O-</option>
                  </select>
                </div>
              </div>

              {/* Physical BMI overview */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Chỉ số thể trạng & BMI Hiện tại</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white border ${currentBmi.color}`}>
                    BMI: {currentBmi.bmi} ({currentBmi.classification})
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-1">Chiều cao (cm)</label>
                    <input
                      type="number"
                      value={heightCm}
                      onChange={(e) => setHeightCm(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-1">Cân nặng (kg)</label>
                    <input
                      type="number"
                      step={0.1}
                      value={weightKg}
                      onChange={(e) => setWeightKg(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-1">Cân nặng mục tiêu (kg)</label>
                    <input
                      type="number"
                      step={0.5}
                      value={targetWeightKg}
                      onChange={(e) => setTargetWeightKg(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-semibold text-emerald-700"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Tiền sử dị ứng & Lưu ý y tế</label>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="Dị ứng kháng sinh Penicillin, phấn hoa..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-xs cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu thông tin</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: HEALTH TARGETS */}
          {activeTab === 'health_targets' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <p className="text-xs text-slate-500">
                Thiết lập chỉ tiêu sức khỏe hằng ngày làm thước đo tính toán tỷ lệ hoàn thành trên Dashboard và hệ thống nhắc nhở.
              </p>

              <div className="space-y-3">
                <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center">
                      <Droplet className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Chỉ tiêu nước uống mỗi ngày</h4>
                      <p className="text-xs text-slate-500">Khuyến nghị: 2000 - 2500 ml cho người trưởng thành</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step={100}
                      value={waterTargetMl}
                      onChange={(e) => setWaterTargetMl(Number(e.target.value))}
                      className="w-24 px-2 py-1 bg-white border border-slate-200 rounded-lg text-sm font-bold text-center"
                    />
                    <span className="text-xs font-semibold text-slate-500">ml</span>
                  </div>
                </div>

                <div className="p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
                      <Footprints className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Mục tiêu số bước chân hằng ngày</h4>
                      <p className="text-xs text-slate-500">Khuyến nghị WHO: 6,000 - 10,000 bước/ngày</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step={500}
                      value={stepTarget}
                      onChange={(e) => setStepTarget(Number(e.target.value))}
                      className="w-24 px-2 py-1 bg-white border border-slate-200 rounded-lg text-sm font-bold text-center"
                    />
                    <span className="text-xs font-semibold text-slate-500">bước</span>
                  </div>
                </div>

                <div className="p-3.5 bg-purple-50/70 border border-purple-100 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Thời lượng giấc ngủ mục tiêu</h4>
                      <p className="text-xs text-slate-500">Giấc ngủ sâu để phục hồi hệ thần kinh và cơ bắp</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step={0.5}
                      value={sleepTargetHours}
                      onChange={(e) => setSleepTargetHours(Number(e.target.value))}
                      className="w-20 px-2 py-1 bg-white border border-slate-200 rounded-lg text-sm font-bold text-center"
                    />
                    <span className="text-xs font-semibold text-slate-500">tiếng</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-sm cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Cập nhật chỉ tiêu sinh hoạt</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: SECURITY & CHANGE PASSWORD (PB05) */}
          {activeTab === 'security' && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                <p>Để đảm bảo an toàn, mật khẩu mới cần có ít nhất 6 ký tự. Sau khi đổi mật khẩu, phiên làm việc sẽ được duy trì trên thiết bị này.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Nhập mật khẩu đang dùng"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Mật khẩu mới</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-xs cursor-pointer"
                >
                  <Key className="w-4 h-4" />
                  <span>Cập nhật mật khẩu</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: PREFERENCES & LOGOUT */}
          {activeTab === 'preferences' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-800 text-sm">Dữ liệu & Sao lưu</h4>
                <p className="text-xs text-slate-500">
                  Bạn có thể tải toàn bộ dữ liệu chỉ số sức khỏe, mục tiêu, nhật ký và thói quen về máy định dạng JSON để dự phòng.
                </p>
                <button
                  type="button"
                  onClick={handleExportDataBackup}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>Sao lưu dữ liệu cá nhân (.json)</span>
                </button>
              </div>

              <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-rose-900 text-sm">Đăng xuất tài khoản</h4>
                  <p className="text-xs text-rose-700">Thoát khỏi phiên làm việc hiện tại.</p>
                </div>
                <button
                  type="button"
                  onClick={onLogoutRequest}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
