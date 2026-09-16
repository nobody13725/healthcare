export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  birthDate: string;
  gender: 'male' | 'female' | 'other';
  heightCm: number;
  weightKg: number;
  targetWeightKg?: number;
  bloodType?: string;
  allergies?: string;
  waterTargetMl: number;
  sleepTargetHours: number;
  stepTarget: number;
  avatarUrl?: string;
}

export interface HealthGoal {
  id: string;
  title: string;
  category: 'weight' | 'exercise' | 'sleep' | 'nutrition' | 'mindfulness';
  timeframe: 'day' | 'week' | 'month';
  targetDate: string;
  progress: number; // 0 to 100%
  status: 'active' | 'completed' | 'paused';
  notes?: string;
}

export interface HealthTask {
  id: string;
  goalId?: string;
  title: string;
  category: 'hydrate' | 'exercise' | 'medication' | 'sleep' | 'nutrition' | 'mindfulness';
  time: string; // e.g. "07:30"
  frequency: 'daily' | 'weekdays' | 'weekends' | 'custom';
  status: 'pending' | 'completed' | 'skipped';
  completedAt?: string;
  targetValue?: string; // e.g. "500ml", "30 phút", "1 viên"
  notes?: string;
}

export interface Habit {
  id: string;
  title: string;
  category: 'hydrate' | 'exercise' | 'medication' | 'sleep' | 'nutrition' | 'mindfulness';
  streak: number; // consecutive days
  bestStreak: number;
  completedDays: string[]; // ISO dates
  isCompletedToday: boolean;
  frequency: string;
  targetUnit: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  category: 'appointment' | 'medication' | 'exercise' | 'checkup' | 'other';
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime?: string;
  location?: string;
  notes?: string;
  reminderMinutes?: number;
}

export interface HealthMetricEntry {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string;
  weightKg: number;
  heightCm: number;
  bmi: number;
  systolicBp?: number; // Huyết áp tâm thu
  diastolicBp?: number; // Huyết áp tâm trương
  heartRateBpm?: number;
  waterMl?: number;
  sleepHours?: number;
  steps?: number;
  notes?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  type: 'task_completed' | 'habit_streak' | 'metric_logged' | 'goal_updated' | 'ai_consultation';
  title: string;
  description: string;
}

export interface MealEntry {
  id: string;
  date: string; // YYYY-MM-DD
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface SupplementItem {
  id: string;
  name: string;
  dosage: string;
  timeOfDay: string; // e.g. "08:00"
  category: 'supplement' | 'prescription' | 'vitamin';
  takenToday: boolean;
  streakDays: number;
  notes?: string;
}

export interface ProjectMetadataInfo {
  university: string;
  faculty: string;
  topicTitle: string;
  shortName: string;
  supervisor: string; // GVHD
  teamName: string;
  teamMembers: Array<{ name: string; role: string; email: string; phone: string }>;
  dateCreated: string;
  version: string;
}

export type AIActionType = 
  | 'add_task' 
  | 'add_meal' 
  | 'add_supplement' 
  | 'log_water' 
  | 'add_event' 
  | 'add_habit'
  | 'update_goal';

export interface AIActionItem {
  id: string;
  type: AIActionType;
  label: string;
  description?: string;
  status: 'pending' | 'executed' | 'dismissed';
  payload: any;
}
