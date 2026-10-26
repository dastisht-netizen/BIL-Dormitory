export type Role = 'ADMINISTRATOR' | 'EDUCATOR' | 'CLASS_TEACHER' | 'CAFETERIA_STAFF';

export type Language = 'kk' | 'ru' | 'en';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused' | 'sick';

export type HomeworkStatus = 'completed' | 'partially_completed' | 'not_completed' | 'no_homework' | 'not_checked';

export interface User {
  id: string;
  name: string;
  email: string;
  iin?: string; // 12-digit IIN login (ЖСН)
  password?: string;
  role: Role;
  assignedClassIds?: string[]; // Classes this user is responsible for
  phone?: string;
  avatarUrl?: string;
  isActive?: boolean; // true = белсенді, false = уақытша өшірулі
  status?: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface SiteConfig {
  schoolName: string;
  appTitle: string;
  subtitle: string;
  directorName: string;
  contactPhone: string;
  contactEmail: string;
  studyStartTime: string;
  studyEndTime: string;
  schoolAddress: string;
  announcement: string;
  announcementActive: boolean;
}

export interface AcademicYear {
  id: string;
  name: string; // e.g. "2026–2027"
  isCurrent: boolean;
  startDate: string;
  endDate: string;
  archived: boolean;
  quarters: QuarterConfig[];
}

export interface QuarterConfig {
  id: string;
  name: string; // "I Тоқсан", "II Тоқсан", etc.
  startDate: string;
  endDate: string;
}

export interface SchoolClass {
  id: string;
  name: string; // e.g. "7A", "7B", "8A", "9B", "10A", "11A"
  grade: number; // 7, 8, 9, 10, 11
  academicYearId: string;
  educatorId?: string;
  classTeacherId?: string;
  studentCount?: number;
}

export interface Subject {
  id: string;
  nameKk: string;
  nameRu: string;
  nameEn: string;
  code: string;
  color?: string;
}

export interface TimetableEntry {
  id: string;
  classId: string;
  dayOfWeek: number; // 1 = Monday, 2 = Tuesday, ..., 5 = Friday
  periodNumber: number; // 1 to 7
  subjectId: string;
}

export interface Student {
  id: string; // Unique student ID e.g. "BIL-2026-701"
  fullName: string;
  classId: string;
  academicYearId: string;
  status: 'active' | 'graduated' | 'transferred';
  gender?: 'male' | 'female';
  roomNumber?: string;
  parentPhone?: string;
  notes?: string;
}

export interface SelfStudySession {
  id: string;
  classId: string;
  date: string; // YYYY-MM-DD
  educatorId: string;
  startedAt?: string;
  completedAt?: string;
  isSubmitted: boolean;
  targetDateForHomework: string; // The next school day whose homework is monitored
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  classId: string;
  date: string;
  status: AttendanceStatus;
  comment?: string;
  updatedAt: string;
  updatedBy: string;
}

export interface HomeworkRecord {
  id: string;
  sessionId: string;
  studentId: string;
  subjectId: string;
  classId: string;
  date: string; // Session date
  targetDate: string; // Target school day date
  status: HomeworkStatus;
  comment?: string;
  updatedAt: string;
  updatedBy: string;
}

export type MealPeriod =
  | 'friday_dinner'
  | 'saturday_breakfast'
  | 'saturday_lunch'
  | 'saturday_dinner'
  | 'sunday_breakfast'
  | 'sunday_lunch'
  | 'sunday_dinner'
  | 'monday_breakfast';

export const ALL_MEAL_PERIODS: MealPeriod[] = [
  'friday_dinner',
  'saturday_breakfast',
  'saturday_lunch',
  'saturday_dinner',
  'sunday_breakfast',
  'sunday_lunch',
  'sunday_dinner',
  'monday_breakfast',
];

export interface WeekendMealRecord {
  id: string;
  studentId: string;
  classId: string;
  weekStartDate: string; // Usually Thursday or Friday date of the weekend cycle
  meals: Record<MealPeriod, boolean>;
  updatedAt: string;
  updatedBy: string;
  isFinalized: boolean;
}

export interface DormitoryStayRecord {
  id: string;
  studentId: string;
  classId: string;
  weekStartDate: string;
  isStaying: boolean;
  notes?: string;
  updatedAt: string;
  updatedBy: string;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  userRole: Role;
  action: string;
  entityType: 'attendance' | 'homework' | 'meal' | 'dormitory' | 'student' | 'system' | 'timetable';
  entityId?: string;
  studentId?: string;
  studentName?: string;
  subjectName?: string;
  previousValue?: string;
  newValue?: string;
  timestamp: string;
  details?: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'warning' | 'alert' | 'success';
}

export interface NotificationSettings {
  selfStudyStartReminder: boolean;
  selfStudyStartTime: string; // "19:00"
  selfStudyMidReminder: boolean;
  selfStudyMidTime: string; // "19:30"
  selfStudyEndReminder: boolean;
  selfStudyEndTime: string; // "21:00"
  adminSummaryReminder: boolean;
  adminSummaryTime: string; // "21:05"
  thursdayMealReminder: boolean;
  thursdayMealTime: string; // "16:00"
}
