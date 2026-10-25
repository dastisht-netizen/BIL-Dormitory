import {
  AcademicYear,
  ALL_MEAL_PERIODS,
  AttendanceRecord,
  AuditLogEntry,
  DormitoryStayRecord,
  HomeworkRecord,
  SchoolClass,
  SelfStudySession,
  Student,
  Subject,
  TimetableEntry,
  User,
  WeekendMealRecord,
  NotificationSettings,
  SiteConfig,
} from '../types';

const STORAGE_KEYS = {
  USERS: 'bil_users_v1',
  YEARS: 'bil_years_v1',
  CLASSES: 'bil_classes_v1',
  SUBJECTS: 'bil_subjects_v1',
  TIMETABLES: 'bil_timetables_v1',
  STUDENTS: 'bil_students_v1',
  SESSIONS: 'bil_sessions_v1',
  ATTENDANCE: 'bil_attendance_v1',
  HOMEWORK: 'bil_homework_v1',
  MEALS: 'bil_meals_v1',
  DORMITORY: 'bil_dormitory_v1',
  AUDIT: 'bil_audit_v1',
  SETTINGS: 'bil_settings_v1',
  SITE_CONFIG: 'bil_site_config_v1',
};

export const INITIAL_SITE_CONFIG: SiteConfig = {
  schoolName: 'ARYS BIL SCHOOL',
  appTitle: 'ARYS BIL STUDY TRACKER',
  subtitle: 'Арыс БИЛ мектеп-интернатының оқу және жатақхана жүйесі',
  directorName: 'Нұрлан Сейітқалиұлы',
  contactPhone: '+7 701 555 0101',
  contactEmail: 'admin@bil-arys.edu.kz',
  studyStartTime: '19:00',
  studyEndTime: '21:00',
  schoolAddress: 'Түркістан облысы, Арыс қаласы, Білім көшесі, 1',
  announcement: 'Құрметті оқушылар мен тәрбиешілер! Кешкі өзіндік дайындық сағат 19:00-де басталады.',
  announcementActive: true,
};

// Initial Subjects
export const INITIAL_SUBJECTS: Subject[] = [
  { id: 'sub-alg', nameKk: 'Алгебра', nameRu: 'Алгебра', nameEn: 'Algebra', code: 'ALG', color: '#138A62' },
  { id: 'sub-geom', nameKk: 'Геометрия', nameRu: 'Геометрия', nameEn: 'Geometry', code: 'GEOM', color: '#075C42' },
  { id: 'sub-phys', nameKk: 'Физика', nameRu: 'Физика', nameEn: 'Physics', code: 'PHYS', color: '#2563EB' },
  { id: 'sub-chem', nameKk: 'Химия', nameRu: 'Химия', nameEn: 'Chemistry', code: 'CHEM', color: '#7C3AED' },
  { id: 'sub-bio', nameKk: 'Биология', nameRu: 'Биология', nameEn: 'Biology', code: 'BIO', color: '#059669' },
  { id: 'sub-kaz', nameKk: 'Қазақ тілі мен әдебиеті', nameRu: 'Казахский язык и литература', nameEn: 'Kazakh Language & Lit', code: 'KAZ', color: '#D97706' },
  { id: 'sub-eng', nameKk: 'Ағылшын тілі', nameRu: 'Английский язык', nameEn: 'English Language', code: 'ENG', color: '#DC2626' },
  { id: 'sub-hist', nameKk: 'Қазақстан тарихы', nameRu: 'История Казахстана', nameEn: 'History of Kazakhstan', code: 'HIST', color: '#B45309' },
  { id: 'sub-cs', nameKk: 'Информатика', nameRu: 'Информатика', nameEn: 'Computer Science', code: 'CS', color: '#0284C7' },
];

// Initial Academic Years
export const INITIAL_YEARS: AcademicYear[] = [
  {
    id: 'ay-2026-2027',
    name: '2026–2027',
    isCurrent: true,
    startDate: '2026-09-01',
    endDate: '2027-05-25',
    archived: false,
    quarters: [
      { id: 'q1', name: 'I Тоқсан (Q1)', startDate: '2026-09-01', endDate: '2026-10-31' },
      { id: 'q2', name: 'II Тоқсан (Q2)', startDate: '2026-11-10', endDate: '2026-12-30' },
      { id: 'q3', name: 'III Тоқсан (Q3)', startDate: '2027-01-08', endDate: '2027-03-20' },
      { id: 'q4', name: 'IV Тоқсан (Q4)', startDate: '2027-04-01', endDate: '2027-05-25' },
    ],
  },
  {
    id: 'ay-2025-2026',
    name: '2025–2026',
    isCurrent: false,
    startDate: '2025-09-01',
    endDate: '2026-05-25',
    archived: true,
    quarters: [
      { id: 'q1-old', name: 'I Тоқсан', startDate: '2025-09-01', endDate: '2025-10-31' },
      { id: 'q2-old', name: 'II Тоқсан', startDate: '2025-11-10', endDate: '2025-12-30' },
      { id: 'q3-old', name: 'III Тоқсан', startDate: '2026-01-08', endDate: '2026-03-20' },
      { id: 'q4-old', name: 'IV Тоқсан', startDate: '2026-04-01', endDate: '2026-05-25' },
    ],
  },
];

// Initial Users
export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin',
    name: 'Нұрлан Сейітқалиұлы',
    email: 'admin@bil-arys.edu.kz',
    password: 'admin123',
    role: 'ADMINISTRATOR',
    phone: '+7 701 555 0101',
  },
  {
    id: 'user-edu-1',
    name: 'Ерлан Бақытұлы',
    email: 'erlan.b@bil-arys.edu.kz',
    password: 'edu123',
    role: 'EDUCATOR',
    assignedClassIds: ['cls-7a', 'cls-7b'],
    phone: '+7 702 333 4455',
  },
  {
    id: 'user-edu-2',
    name: 'Дәулет Мұратұлы',
    email: 'daulet.m@bil-arys.edu.kz',
    password: 'edu123',
    role: 'EDUCATOR',
    assignedClassIds: ['cls-8a', 'cls-8b'],
    phone: '+7 705 444 6677',
  },
  {
    id: 'user-teacher-7a',
    name: 'Айнұр Серікқызы',
    email: 'ainur.s@bil-arys.edu.kz',
    password: 'teacher123',
    role: 'CLASS_TEACHER',
    assignedClassIds: ['cls-7a'],
    phone: '+7 707 888 9900',
  },
  {
    id: 'user-teacher-8a',
    name: 'Гүлнәр Асқарқызы',
    email: 'gulnar.a@bil-arys.edu.kz',
    password: 'teacher123',
    role: 'CLASS_TEACHER',
    assignedClassIds: ['cls-8a'],
    phone: '+7 775 111 2233',
  },
  {
    id: 'user-cafeteria',
    name: 'Баян Әбдікерімқызы',
    email: 'cafeteria@bil-arys.edu.kz',
    password: 'cafe123',
    role: 'CAFETERIA_STAFF',
    phone: '+7 778 999 0011',
  },
];

// Initial Classes
export const INITIAL_CLASSES: SchoolClass[] = [
  { id: 'cls-7a', name: '7A', grade: 7, academicYearId: 'ay-2026-2027', educatorId: 'user-edu-1', classTeacherId: 'user-teacher-7a' },
  { id: 'cls-7b', name: '7B', grade: 7, academicYearId: 'ay-2026-2027', educatorId: 'user-edu-1' },
  { id: 'cls-8a', name: '8A', grade: 8, academicYearId: 'ay-2026-2027', educatorId: 'user-edu-2', classTeacherId: 'user-teacher-8a' },
  { id: 'cls-8b', name: '8B', grade: 8, academicYearId: 'ay-2026-2027', educatorId: 'user-edu-2' },
  { id: 'cls-9a', name: '9A', grade: 9, academicYearId: 'ay-2026-2027' },
  { id: 'cls-10a', name: '10A', grade: 10, academicYearId: 'ay-2026-2027' },
  { id: 'cls-11a', name: '11A', grade: 11, academicYearId: 'ay-2026-2027' },
];

// Initial Students
export const INITIAL_STUDENTS: Student[] = [
  // 7A Students
  { id: 'BIL-2026-701', fullName: 'Алихан Аманжолұлы', classId: 'cls-7a', academicYearId: 'ay-2026-2027', status: 'active', gender: 'male', roomNumber: '201', parentPhone: '+7 701 111 2233' },
  { id: 'BIL-2026-702', fullName: 'Нұрислам Берікұлы', classId: 'cls-7a', academicYearId: 'ay-2026-2027', status: 'active', gender: 'male', roomNumber: '201', parentPhone: '+7 702 222 3344' },
  { id: 'BIL-2026-703', fullName: 'Санжар Даниярұлы', classId: 'cls-7a', academicYearId: 'ay-2026-2027', status: 'active', gender: 'male', roomNumber: '202', parentPhone: '+7 705 333 4455' },
  { id: 'BIL-2026-704', fullName: 'Мансұр Ержанұлы', classId: 'cls-7a', academicYearId: 'ay-2026-2027', status: 'active', gender: 'male', roomNumber: '202', parentPhone: '+7 707 444 5566' },
  { id: 'BIL-2026-705', fullName: 'Батырхан Жандосұлы', classId: 'cls-7a', academicYearId: 'ay-2026-2027', status: 'active', gender: 'male', roomNumber: '203', parentPhone: '+7 775 555 6677' },
  { id: 'BIL-2026-706', fullName: 'Әділет Қайратұлы', classId: 'cls-7a', academicYearId: 'ay-2026-2027', status: 'active', gender: 'male', roomNumber: '203', parentPhone: '+7 778 666 7788' },
  { id: 'BIL-2026-707', fullName: 'Рамазан Мақсатұлы', classId: 'cls-7a', academicYearId: 'ay-2026-2027', status: 'active', gender: 'male', roomNumber: '204', parentPhone: '+7 708 777 8899' },
  { id: 'BIL-2026-708', fullName: 'Шыңғыс Нұрланұлы', classId: 'cls-7a', academicYearId: 'ay-2026-2027', status: 'active', gender: 'male', roomNumber: '204', parentPhone: '+7 747 888 9900' },

  // 8A Students
  { id: 'BIL-2026-801', fullName: 'Айбол Өмірзақұлы', classId: 'cls-8a', academicYearId: 'ay-2026-2027', status: 'active', gender: 'male', roomNumber: '301', parentPhone: '+7 701 999 1122' },
  { id: 'BIL-2026-802', fullName: 'Бексұлтан Русланұлы', classId: 'cls-8a', academicYearId: 'ay-2026-2027', status: 'active', gender: 'male', roomNumber: '301', parentPhone: '+7 702 888 2233' },
  { id: 'BIL-2026-803', fullName: 'Дінмұхаммед Саматұлы', classId: 'cls-8a', academicYearId: 'ay-2026-2027', status: 'active', gender: 'male', roomNumber: '302', parentPhone: '+7 705 777 3344' },
  { id: 'BIL-2026-804', fullName: 'Елдар Талғатұлы', classId: 'cls-8a', academicYearId: 'ay-2026-2027', status: 'active', gender: 'male', roomNumber: '302', parentPhone: '+7 707 666 4455' },
  { id: 'BIL-2026-805', fullName: 'Жалғас Ұланұлы', classId: 'cls-8a', academicYearId: 'ay-2026-2027', status: 'active', gender: 'male', roomNumber: '303', parentPhone: '+7 775 555 5566' },

  // 7B Students
  { id: 'BIL-2026-711', fullName: 'Арсен Асхатұлы', classId: 'cls-7b', academicYearId: 'ay-2026-2027', status: 'active', gender: 'male', roomNumber: '205', parentPhone: '+7 778 444 3322' },
  { id: 'BIL-2026-712', fullName: 'Диас Ғаниұлы', classId: 'cls-7b', academicYearId: 'ay-2026-2027', status: 'active', gender: 'male', roomNumber: '205', parentPhone: '+7 708 333 2211' },
];

// Initial Timetables
export const INITIAL_TIMETABLES: TimetableEntry[] = [
  // 7A - Mon (1) to Fri (5)
  // Monday: ALG, PHYS, KAZ, ENG, CS, HIST
  { id: 'tt-7a-1-1', classId: 'cls-7a', dayOfWeek: 1, periodNumber: 1, subjectId: 'sub-alg' },
  { id: 'tt-7a-1-2', classId: 'cls-7a', dayOfWeek: 1, periodNumber: 2, subjectId: 'sub-phys' },
  { id: 'tt-7a-1-3', classId: 'cls-7a', dayOfWeek: 1, periodNumber: 3, subjectId: 'sub-kaz' },
  { id: 'tt-7a-1-4', classId: 'cls-7a', dayOfWeek: 1, periodNumber: 4, subjectId: 'sub-eng' },
  { id: 'tt-7a-1-5', classId: 'cls-7a', dayOfWeek: 1, periodNumber: 5, subjectId: 'sub-cs' },

  // Tuesday: GEOM, CHEM, BIO, KAZ, ENG
  { id: 'tt-7a-2-1', classId: 'cls-7a', dayOfWeek: 2, periodNumber: 1, subjectId: 'sub-geom' },
  { id: 'tt-7a-2-2', classId: 'cls-7a', dayOfWeek: 2, periodNumber: 2, subjectId: 'sub-chem' },
  { id: 'tt-7a-2-3', classId: 'cls-7a', dayOfWeek: 2, periodNumber: 3, subjectId: 'sub-bio' },
  { id: 'tt-7a-2-4', classId: 'cls-7a', dayOfWeek: 2, periodNumber: 4, subjectId: 'sub-kaz' },
  { id: 'tt-7a-2-5', classId: 'cls-7a', dayOfWeek: 2, periodNumber: 5, subjectId: 'sub-eng' },

  // Wednesday: ALG, PHYS, HIST, CS, BIO
  { id: 'tt-7a-3-1', classId: 'cls-7a', dayOfWeek: 3, periodNumber: 1, subjectId: 'sub-alg' },
  { id: 'tt-7a-3-2', classId: 'cls-7a', dayOfWeek: 3, periodNumber: 2, subjectId: 'sub-phys' },
  { id: 'tt-7a-3-3', classId: 'cls-7a', dayOfWeek: 3, periodNumber: 3, subjectId: 'sub-hist' },
  { id: 'tt-7a-3-4', classId: 'cls-7a', dayOfWeek: 3, periodNumber: 4, subjectId: 'sub-cs' },
  { id: 'tt-7a-3-5', classId: 'cls-7a', dayOfWeek: 3, periodNumber: 5, subjectId: 'sub-bio' },

  // Thursday: GEOM, CHEM, ENG, KAZ, ALG
  { id: 'tt-7a-4-1', classId: 'cls-7a', dayOfWeek: 4, periodNumber: 1, subjectId: 'sub-geom' },
  { id: 'tt-7a-4-2', classId: 'cls-7a', dayOfWeek: 4, periodNumber: 2, subjectId: 'sub-chem' },
  { id: 'tt-7a-4-3', classId: 'cls-7a', dayOfWeek: 4, periodNumber: 3, subjectId: 'sub-eng' },
  { id: 'tt-7a-4-4', classId: 'cls-7a', dayOfWeek: 4, periodNumber: 4, subjectId: 'sub-kaz' },
  { id: 'tt-7a-4-5', classId: 'cls-7a', dayOfWeek: 4, periodNumber: 5, subjectId: 'sub-alg' },

  // Friday: PHYS, BIO, HIST, ENG, CS
  { id: 'tt-7a-5-1', classId: 'cls-7a', dayOfWeek: 5, periodNumber: 1, subjectId: 'sub-phys' },
  { id: 'tt-7a-5-2', classId: 'cls-7a', dayOfWeek: 5, periodNumber: 2, subjectId: 'sub-bio' },
  { id: 'tt-7a-5-3', classId: 'cls-7a', dayOfWeek: 5, periodNumber: 3, subjectId: 'sub-hist' },
  { id: 'tt-7a-5-4', classId: 'cls-7a', dayOfWeek: 5, periodNumber: 4, subjectId: 'sub-eng' },
  { id: 'tt-7a-5-5', classId: 'cls-7a', dayOfWeek: 5, periodNumber: 5, subjectId: 'sub-cs' },

  // 8A Timetable
  { id: 'tt-8a-1-1', classId: 'cls-8a', dayOfWeek: 1, periodNumber: 1, subjectId: 'sub-alg' },
  { id: 'tt-8a-1-2', classId: 'cls-8a', dayOfWeek: 1, periodNumber: 2, subjectId: 'sub-geom' },
  { id: 'tt-8a-1-3', classId: 'cls-8a', dayOfWeek: 1, periodNumber: 3, subjectId: 'sub-chem' },
  { id: 'tt-8a-2-1', classId: 'cls-8a', dayOfWeek: 2, periodNumber: 1, subjectId: 'sub-phys' },
  { id: 'tt-8a-2-2', classId: 'cls-8a', dayOfWeek: 2, periodNumber: 2, subjectId: 'sub-bio' },
  { id: 'tt-8a-2-3', classId: 'cls-8a', dayOfWeek: 2, periodNumber: 3, subjectId: 'sub-kaz' },
  { id: 'tt-8a-3-1', classId: 'cls-8a', dayOfWeek: 3, periodNumber: 1, subjectId: 'sub-eng' },
  { id: 'tt-8a-3-2', classId: 'cls-8a', dayOfWeek: 3, periodNumber: 2, subjectId: 'sub-cs' },
  { id: 'tt-8a-4-1', classId: 'cls-8a', dayOfWeek: 4, periodNumber: 1, subjectId: 'sub-alg' },
  { id: 'tt-8a-4-2', classId: 'cls-8a', dayOfWeek: 4, periodNumber: 2, subjectId: 'sub-phys' },
  { id: 'tt-8a-5-1', classId: 'cls-8a', dayOfWeek: 5, periodNumber: 1, subjectId: 'sub-chem' },
  { id: 'tt-8a-5-2', classId: 'cls-8a', dayOfWeek: 5, periodNumber: 2, subjectId: 'sub-geom' },
];

export const INITIAL_SETTINGS: NotificationSettings = {
  selfStudyStartReminder: true,
  selfStudyStartTime: '19:00',
  selfStudyMidReminder: true,
  selfStudyMidTime: '19:30',
  selfStudyEndReminder: true,
  selfStudyEndTime: '21:00',
  adminSummaryReminder: true,
  adminSummaryTime: '21:05',
  thursdayMealReminder: true,
  thursdayMealTime: '16:00',
};

// Initial Audit Logs
export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'audit-001',
    userId: 'user-admin',
    userName: 'Нұрлан Сейітқалиұлы',
    userRole: 'ADMINISTRATOR',
    action: 'INIT_ACADEMIC_YEAR',
    entityType: 'system',
    previousValue: 'None',
    newValue: '2026–2027',
    timestamp: '2026-09-01T09:00:00Z',
    details: '2026-2027 оқу жылы сәтті іске қосылды',
  },
  {
    id: 'audit-002',
    userId: 'user-edu-1',
    userName: 'Ерлан Бақытұлы',
    userRole: 'EDUCATOR',
    action: 'SUBMIT_MONITORING',
    entityType: 'attendance',
    studentId: 'BIL-2026-701',
    studentName: 'Алихан Аманжолұлы',
    previousValue: 'in_progress',
    newValue: 'completed',
    timestamp: '2026-10-23T20:48:15Z',
    details: '7А сыныбының кешкі дайындығы бекітілді',
  },
];

class StorageService {
  private getItem<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Failed to write to localStorage for key ${key}`, e);
    }
  }

  // Initialization check
  public initDatabase(): void {
    if (!localStorage.getItem(STORAGE_KEYS.YEARS)) {
      this.setItem(STORAGE_KEYS.YEARS, INITIAL_YEARS);
      this.setItem(STORAGE_KEYS.USERS, INITIAL_USERS);
      this.setItem(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);
      this.setItem(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
      this.setItem(STORAGE_KEYS.TIMETABLES, INITIAL_TIMETABLES);
      this.setItem(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
      this.setItem(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
      this.setItem(STORAGE_KEYS.SITE_CONFIG, INITIAL_SITE_CONFIG);
      this.setItem(STORAGE_KEYS.AUDIT, INITIAL_AUDIT_LOGS);

      // Seed initial attendance & homework for demonstration
      this.seedInitialDailyRecords();
      this.seedInitialWeekendRecords();
    }
    // ensure site config exists even if upgraded
    if (!localStorage.getItem(STORAGE_KEYS.SITE_CONFIG)) {
      this.setItem(STORAGE_KEYS.SITE_CONFIG, INITIAL_SITE_CONFIG);
    }
  }

  // Pre-seed some realistic attendance & homework
  private seedInitialDailyRecords(): void {
    const today = new Date().toISOString().split('T')[0];
    const classId = 'cls-7a';
    const educatorId = 'user-edu-1';

    // Session
    const session: SelfStudySession = {
      id: `session-${classId}-${today}`,
      classId,
      date: today,
      educatorId,
      startedAt: '19:02:10',
      completedAt: '20:49:33',
      isSubmitted: true,
      targetDateForHomework: this.getNextSchoolDay(today).date,
    };
    this.saveSession(session);

    // Students attendance
    const attendance: AttendanceRecord[] = [
      { id: `att-701-${today}`, sessionId: session.id, studentId: 'BIL-2026-701', classId, date: today, status: 'present', updatedAt: `${today}T19:05:00Z`, updatedBy: educatorId },
      { id: `att-702-${today}`, sessionId: session.id, studentId: 'BIL-2026-702', classId, date: today, status: 'present', updatedAt: `${today}T19:05:00Z`, updatedBy: educatorId },
      { id: `att-703-${today}`, sessionId: session.id, studentId: 'BIL-2026-703', classId, date: today, status: 'late', comment: 'Кітапханада болды', updatedAt: `${today}T19:15:00Z`, updatedBy: educatorId },
      { id: `att-704-${today}`, sessionId: session.id, studentId: 'BIL-2026-704', classId, date: today, status: 'present', updatedAt: `${today}T19:05:00Z`, updatedBy: educatorId },
      { id: `att-705-${today}`, sessionId: session.id, studentId: 'BIL-2026-705', classId, date: today, status: 'sick', comment: 'Медпунктте', updatedAt: `${today}T19:06:00Z`, updatedBy: educatorId },
      { id: `att-706-${today}`, sessionId: session.id, studentId: 'BIL-2026-706', classId, date: today, status: 'present', updatedAt: `${today}T19:05:00Z`, updatedBy: educatorId },
      { id: `att-707-${today}`, sessionId: session.id, studentId: 'BIL-2026-707', classId, date: today, status: 'present', updatedAt: `${today}T19:05:00Z`, updatedBy: educatorId },
      { id: `att-708-${today}`, sessionId: session.id, studentId: 'BIL-2026-708', classId, date: today, status: 'present', updatedAt: `${today}T19:05:00Z`, updatedBy: educatorId },
    ];
    this.setItem(STORAGE_KEYS.ATTENDANCE, attendance);

    // Homework for next day's subjects
    const nextDay = this.getNextSchoolDay(today);
    const targetSubjects = this.getSubjectsForClassOnDay(classId, nextDay.dayOfWeek);

    const homework: HomeworkRecord[] = [];
    const students7a = INITIAL_STUDENTS.filter(s => s.classId === classId);

    students7a.forEach((st, idx) => {
      targetSubjects.forEach((sub, subIdx) => {
        let status: HomeworkRecord['status'] = 'completed';
        if (st.id === 'BIL-2026-705') status = 'not_checked'; // sick
        else if (subIdx === 1 && idx % 3 === 0) status = 'partially_completed';
        else if (subIdx === 2 && idx === 1) status = 'not_completed';
        else if (subIdx === 4 && idx % 2 === 0) status = 'no_homework';

        homework.push({
          id: `hw-${st.id}-${sub.id}-${today}`,
          sessionId: session.id,
          studentId: st.id,
          subjectId: sub.id,
          classId,
          date: today,
          targetDate: nextDay.date,
          status,
          updatedAt: `${today}T20:30:00Z`,
          updatedBy: educatorId,
        });
      });
    });

    this.setItem(STORAGE_KEYS.HOMEWORK, homework);
  }

  private seedInitialWeekendRecords(): void {
    const today = new Date();
    // Get closest Thursday/Friday for current weekend
    const weekStartDate = new Date(today.setDate(today.getDate() - today.getDay() + 4)).toISOString().split('T')[0];

    const mealRecords: WeekendMealRecord[] = [];
    const dormRecords: DormitoryStayRecord[] = [];

    INITIAL_STUDENTS.forEach((st, index) => {
      const staying = index % 3 !== 0; // 2/3 stay in dormitory
      dormRecords.push({
        id: `dorm-${st.id}-${weekStartDate}`,
        studentId: st.id,
        classId: st.classId,
        weekStartDate,
        isStaying: staying,
        notes: staying ? 'Жатақханада дайындалады' : 'Ата-анасы үйге алып кетті',
        updatedAt: `${weekStartDate}T15:00:00Z`,
        updatedBy: 'user-edu-1',
      });

      const meals: Record<string, boolean> = {};
      ALL_MEAL_PERIODS.forEach((m) => {
        meals[m] = staying;
      });

      mealRecords.push({
        id: `meal-${st.id}-${weekStartDate}`,
        studentId: st.id,
        classId: st.classId,
        weekStartDate,
        meals: meals as Record<any, boolean>,
        updatedAt: `${weekStartDate}T15:00:00Z`,
        updatedBy: 'user-edu-1',
        isFinalized: true,
      });
    });

    this.setItem(STORAGE_KEYS.MEALS, mealRecords);
    this.setItem(STORAGE_KEYS.DORMITORY, dormRecords);
  }

  // Reset to default sample
  public resetToSample(): void {
    localStorage.removeItem(STORAGE_KEYS.YEARS);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.CLASSES);
    localStorage.removeItem(STORAGE_KEYS.SUBJECTS);
    localStorage.removeItem(STORAGE_KEYS.TIMETABLES);
    localStorage.removeItem(STORAGE_KEYS.STUDENTS);
    localStorage.removeItem(STORAGE_KEYS.SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.ATTENDANCE);
    localStorage.removeItem(STORAGE_KEYS.HOMEWORK);
    localStorage.removeItem(STORAGE_KEYS.MEALS);
    localStorage.removeItem(STORAGE_KEYS.DORMITORY);
    localStorage.removeItem(STORAGE_KEYS.AUDIT);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.SITE_CONFIG);
    this.initDatabase();
  }

  // --- ACADEMIC YEARS ---
  public getAcademicYears(): AcademicYear[] {
    return this.getItem(STORAGE_KEYS.YEARS, INITIAL_YEARS);
  }

  public getCurrentAcademicYear(): AcademicYear {
    const years = this.getAcademicYears();
    return years.find((y) => y.isCurrent) || years[0];
  }

  public createAcademicYear(year: AcademicYear, userId: string, userName: string): void {
    const years = this.getAcademicYears().map((y) => ({ ...y, isCurrent: false }));
    years.unshift(year);
    this.setItem(STORAGE_KEYS.YEARS, years);

    this.addAuditLog({
      userId,
      userName,
      userRole: 'ADMINISTRATOR',
      action: 'CREATE_ACADEMIC_YEAR',
      entityType: 'system',
      newValue: year.name,
      timestamp: new Date().toISOString(),
      details: `Жаңа оқу жылы тіркелді: ${year.name}`,
    });
  }

  public promoteStudents(userId: string, userName: string): { promoted: number; graduated: number } {
    const students = this.getStudents();
    const classes = this.getClasses();
    let promoted = 0;
    let graduated = 0;

    const updatedStudents = students.map((s) => {
      const cls = classes.find((c) => c.id === s.classId);
      if (!cls || s.status !== 'active') return s;

      if (cls.grade >= 11) {
        graduated++;
        return { ...s, status: 'graduated' as const };
      } else {
        const nextGrade = cls.grade + 1;
        const nextClass = classes.find((c) => c.grade === nextGrade && c.name.slice(-1) === cls.name.slice(-1)) ||
                          classes.find((c) => c.grade === nextGrade);
        if (nextClass) {
          promoted++;
          return { ...s, classId: nextClass.id };
        }
      }
      return s;
    });

    this.setItem(STORAGE_KEYS.STUDENTS, updatedStudents);

    this.addAuditLog({
      userId,
      userName,
      userRole: 'ADMINISTRATOR',
      action: 'PROMOTE_STUDENTS',
      entityType: 'student',
      newValue: `Promoted: ${promoted}, Graduated: ${graduated}`,
      timestamp: new Date().toISOString(),
      details: `${promoted} оқушы келесі сыныпқа көшірілді, ${graduated} 11-сынып оқушысы түлектер мұрағатына ауыстырылды.`,
    });

    return { promoted, graduated };
  }

  // --- CLASSES ---
  public getClasses(): SchoolClass[] {
    return this.getItem(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);
  }

  public saveClass(cls: SchoolClass, userId: string, userName: string): void {
    const classes = this.getClasses();
    const idx = classes.findIndex((c) => c.id === cls.id);
    if (idx >= 0) {
      classes[idx] = cls;
    } else {
      classes.push(cls);
    }
    this.setItem(STORAGE_KEYS.CLASSES, classes);
    this.addAuditLog({
      userId,
      userName,
      userRole: 'ADMINISTRATOR',
      action: idx >= 0 ? 'UPDATE_CLASS' : 'CREATE_CLASS',
      entityType: 'system',
      entityId: cls.id,
      newValue: cls.name,
      timestamp: new Date().toISOString(),
    });
  }

  // --- USERS ---
  public getUsers(): User[] {
    return this.getItem(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  public saveUser(user: User, adminId: string, adminName: string): void {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      users[idx] = user;
    } else {
      users.push(user);
    }
    this.setItem(STORAGE_KEYS.USERS, users);
    this.addAuditLog({
      userId: adminId,
      userName: adminName,
      userRole: 'ADMINISTRATOR',
      action: idx >= 0 ? 'UPDATE_USER' : 'CREATE_USER',
      entityType: 'system',
      entityId: user.id,
      newValue: `${user.name} (${user.role})`,
      timestamp: new Date().toISOString(),
    });
  }

  public deleteUser(userId: string, adminId: string, adminName: string): void {
    const users = this.getUsers().filter((u) => u.id !== userId);
    this.setItem(STORAGE_KEYS.USERS, users);
    this.addAuditLog({
      userId: adminId,
      userName: adminName,
      userRole: 'ADMINISTRATOR',
      action: 'DELETE_USER',
      entityType: 'system',
      entityId: userId,
      timestamp: new Date().toISOString(),
    });
  }

  // --- SUBJECTS ---
  public getSubjects(): Subject[] {
    return this.getItem(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
  }

  public saveSubject(subject: Subject, userId: string, userName: string): void {
    const subjects = this.getSubjects();
    const idx = subjects.findIndex((s) => s.id === subject.id);
    if (idx >= 0) {
      subjects[idx] = subject;
    } else {
      subjects.push(subject);
    }
    this.setItem(STORAGE_KEYS.SUBJECTS, subjects);
    this.addAuditLog({
      userId,
      userName,
      userRole: 'ADMINISTRATOR',
      action: idx >= 0 ? 'UPDATE_SUBJECT' : 'CREATE_SUBJECT',
      entityType: 'system',
      newValue: subject.nameKk,
      timestamp: new Date().toISOString(),
    });
  }

  public deleteSubject(subjectId: string, userId: string, userName: string): void {
    const subjects = this.getSubjects().filter((s) => s.id !== subjectId);
    this.setItem(STORAGE_KEYS.SUBJECTS, subjects);
    this.addAuditLog({
      userId,
      userName,
      userRole: 'ADMINISTRATOR',
      action: 'DELETE_SUBJECT',
      entityType: 'system',
      entityId: subjectId,
      timestamp: new Date().toISOString(),
      details: 'Пән жүйеден өшірілді',
    });
  }

  // --- TIMETABLES ---
  public getTimetables(): TimetableEntry[] {
    return this.getItem(STORAGE_KEYS.TIMETABLES, INITIAL_TIMETABLES);
  }

  public saveTimetables(entries: TimetableEntry[], classId: string, userId: string, userName: string): void {
    const current = this.getTimetables().filter((t) => t.classId !== classId);
    const updated = [...current, ...entries];
    this.setItem(STORAGE_KEYS.TIMETABLES, updated);
    this.addAuditLog({
      userId,
      userName,
      userRole: 'ADMINISTRATOR',
      action: 'UPDATE_TIMETABLE',
      entityType: 'timetable',
      entityId: classId,
      newValue: `${entries.length} сабақ бекітілді`,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Determine subjects for a class on a given day of week
   * 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri
   */
  public getSubjectsForClassOnDay(classId: string, dayOfWeek: number): Subject[] {
    const timetables = this.getTimetables().filter((t) => t.classId === classId && t.dayOfWeek === dayOfWeek);
    timetables.sort((a, b) => a.periodNumber - b.periodNumber);
    const subjects = this.getSubjects();
    const uniqueIds = Array.from(new Set(timetables.map((t) => t.subjectId)));
    return uniqueIds
      .map((id) => subjects.find((s) => s.id === id))
      .filter((s): s is Subject => s !== undefined);
  }

  /**
   * Compute the next actual school day.
   * If today is Monday (1), next day is Tuesday (2).
   * If today is Friday (5), Saturday (6), or Sunday (0), next day is Monday (1).
   */
  public getNextSchoolDay(currentDateStr: string): { date: string; dayOfWeek: number; dayName: string } {
    const date = new Date(currentDateStr);
    const day = date.getDay(); // 0 is Sun, 1 is Mon, 5 is Fri, 6 is Sat

    const nextDate = new Date(date);
    let nextDayOfWeek = 1;

    if (day >= 1 && day <= 4) {
      // Mon to Thu -> next calendar day
      nextDate.setDate(date.getDate() + 1);
      nextDayOfWeek = day + 1;
    } else if (day === 5) {
      // Friday evening -> next Monday (+3 days)
      nextDate.setDate(date.getDate() + 3);
      nextDayOfWeek = 1;
    } else if (day === 6) {
      // Saturday -> next Monday (+2 days)
      nextDate.setDate(date.getDate() + 2);
      nextDayOfWeek = 1;
    } else {
      // Sunday -> next Monday (+1 day)
      nextDate.setDate(date.getDate() + 1);
      nextDayOfWeek = 1;
    }

    const dayNames = ['Жексенбі', 'Дүйсенбі', 'Сейсенбі', 'Сәрсенбі', 'Бейсенбі', 'Жұма', 'Сенбі'];

    return {
      date: nextDate.toISOString().split('T')[0],
      dayOfWeek: nextDayOfWeek,
      dayName: dayNames[nextDayOfWeek],
    };
  }

  // --- STUDENTS ---
  public getStudents(): Student[] {
    return this.getItem(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
  }

  public saveStudent(student: Student, userId: string, userName: string): void {
    const students = this.getStudents();
    const idx = students.findIndex((s) => s.id === student.id);
    if (idx >= 0) {
      students[idx] = student;
    } else {
      students.push(student);
    }
    this.setItem(STORAGE_KEYS.STUDENTS, students);
    this.addAuditLog({
      userId,
      userName,
      userRole: 'ADMINISTRATOR',
      action: idx >= 0 ? 'UPDATE_STUDENT' : 'CREATE_STUDENT',
      entityType: 'student',
      studentId: student.id,
      studentName: student.fullName,
      newValue: `${student.fullName} (${student.id})`,
      timestamp: new Date().toISOString(),
    });
  }

  public deleteStudent(studentId: string, userId: string, userName: string): void {
    const students = this.getStudents().filter((s) => s.id !== studentId);
    this.setItem(STORAGE_KEYS.STUDENTS, students);
    this.addAuditLog({
      userId,
      userName,
      userRole: 'ADMINISTRATOR',
      action: 'DELETE_STUDENT',
      entityType: 'student',
      studentId,
      timestamp: new Date().toISOString(),
    });
  }

  public importStudents(newStudents: Student[], userId: string, userName: string): number {
    const students = this.getStudents();
    let imported = 0;
    newStudents.forEach((ns) => {
      const idx = students.findIndex((s) => s.id === ns.id);
      if (idx >= 0) {
        students[idx] = ns;
      } else {
        students.push(ns);
      }
      imported++;
    });
    this.setItem(STORAGE_KEYS.STUDENTS, students);
    this.addAuditLog({
      userId,
      userName,
      userRole: 'ADMINISTRATOR',
      action: 'IMPORT_STUDENTS',
      entityType: 'student',
      newValue: `Imported ${imported} students`,
      timestamp: new Date().toISOString(),
    });
    return imported;
  }

  // --- SESSIONS ---
  public getSessions(): SelfStudySession[] {
    return this.getItem(STORAGE_KEYS.SESSIONS, []);
  }

  public getOrCreateSession(classId: string, date: string, educatorId: string): SelfStudySession {
    const sessions = this.getSessions();
    const found = sessions.find((s) => s.classId === classId && s.date === date);
    if (found) return found;

    const nextSchoolDay = this.getNextSchoolDay(date);
    const newSession: SelfStudySession = {
      id: `session-${classId}-${date}`,
      classId,
      date,
      educatorId,
      startedAt: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      isSubmitted: false,
      targetDateForHomework: nextSchoolDay.date,
    };
    sessions.push(newSession);
    this.setItem(STORAGE_KEYS.SESSIONS, sessions);
    return newSession;
  }

  public saveSession(session: SelfStudySession): void {
    const sessions = this.getSessions();
    const idx = sessions.findIndex((s) => s.id === session.id);
    if (idx >= 0) {
      sessions[idx] = session;
    } else {
      sessions.push(session);
    }
    this.setItem(STORAGE_KEYS.SESSIONS, sessions);
  }

  // --- ATTENDANCE ---
  public getAttendanceRecords(): AttendanceRecord[] {
    return this.getItem(STORAGE_KEYS.ATTENDANCE, []);
  }

  public saveAttendance(record: AttendanceRecord, user: User): void {
    const records = this.getAttendanceRecords();
    const idx = records.findIndex((r) => r.studentId === record.studentId && r.date === record.date);
    const oldStatus = idx >= 0 ? records[idx].status : 'none';

    if (idx >= 0) {
      records[idx] = record;
    } else {
      records.push(record);
    }
    this.setItem(STORAGE_KEYS.ATTENDANCE, records);

    // Audit log
    const students = this.getStudents();
    const st = students.find((s) => s.id === record.studentId);
    this.addAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'UPDATE_ATTENDANCE',
      entityType: 'attendance',
      studentId: record.studentId,
      studentName: st?.fullName,
      previousValue: oldStatus,
      newValue: record.status,
      timestamp: new Date().toISOString(),
      details: record.comment ? `Comment: ${record.comment}` : undefined,
    });
  }

  public bulkSaveAttendance(recordsToSave: AttendanceRecord[], user: User): void {
    const records = this.getAttendanceRecords();
    recordsToSave.forEach((rec) => {
      const idx = records.findIndex((r) => r.studentId === rec.studentId && r.date === rec.date);
      if (idx >= 0) {
        records[idx] = rec;
      } else {
        records.push(rec);
      }
    });
    this.setItem(STORAGE_KEYS.ATTENDANCE, records);

    this.addAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'BULK_ATTENDANCE',
      entityType: 'attendance',
      newValue: `${recordsToSave.length} records updated`,
      timestamp: new Date().toISOString(),
    });
  }

  // --- HOMEWORK ---
  public getHomeworkRecords(): HomeworkRecord[] {
    return this.getItem(STORAGE_KEYS.HOMEWORK, []);
  }

  public saveHomework(record: HomeworkRecord, user: User): void {
    const records = this.getHomeworkRecords();
    const idx = records.findIndex(
      (r) => r.studentId === record.studentId && r.subjectId === record.subjectId && r.date === record.date
    );
    const oldStatus = idx >= 0 ? records[idx].status : 'none';

    if (idx >= 0) {
      records[idx] = record;
    } else {
      records.push(record);
    }
    this.setItem(STORAGE_KEYS.HOMEWORK, records);

    const students = this.getStudents();
    const subjects = this.getSubjects();
    const st = students.find((s) => s.id === record.studentId);
    const sub = subjects.find((s) => s.id === record.subjectId);

    this.addAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'UPDATE_HOMEWORK',
      entityType: 'homework',
      studentId: record.studentId,
      studentName: st?.fullName,
      subjectName: sub?.nameKk,
      previousValue: oldStatus,
      newValue: record.status,
      timestamp: new Date().toISOString(),
    });
  }

  public bulkSaveHomework(recordsToSave: HomeworkRecord[], user: User): void {
    const records = this.getHomeworkRecords();
    recordsToSave.forEach((rec) => {
      const idx = records.findIndex(
        (r) => r.studentId === rec.studentId && r.subjectId === rec.subjectId && r.date === rec.date
      );
      if (idx >= 0) {
        records[idx] = rec;
      } else {
        records.push(rec);
      }
    });
    this.setItem(STORAGE_KEYS.HOMEWORK, records);

    this.addAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'BULK_HOMEWORK',
      entityType: 'homework',
      newValue: `${recordsToSave.length} homework entries updated`,
      timestamp: new Date().toISOString(),
    });
  }

  // --- WEEKEND MEALS ---
  public getWeekendMeals(): WeekendMealRecord[] {
    return this.getItem(STORAGE_KEYS.MEALS, []);
  }

  public saveWeekendMeal(record: WeekendMealRecord, user: User): void {
    const records = this.getWeekendMeals();
    const idx = records.findIndex(
      (r) => r.studentId === record.studentId && r.weekStartDate === record.weekStartDate
    );
    if (idx >= 0) {
      records[idx] = record;
    } else {
      records.push(record);
    }
    this.setItem(STORAGE_KEYS.MEALS, records);

    this.addAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'UPDATE_MEALS',
      entityType: 'meal',
      studentId: record.studentId,
      newValue: `Meal roster updated for week ${record.weekStartDate}`,
      timestamp: new Date().toISOString(),
    });
  }

  public bulkSaveWeekendMeals(recordsToSave: WeekendMealRecord[], user: User): void {
    const records = this.getWeekendMeals();
    recordsToSave.forEach((rec) => {
      const idx = records.findIndex(
        (r) => r.studentId === rec.studentId && r.weekStartDate === rec.weekStartDate
      );
      if (idx >= 0) {
        records[idx] = rec;
      } else {
        records.push(rec);
      }
    });
    this.setItem(STORAGE_KEYS.MEALS, records);

    this.addAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'BULK_MEALS_SUBMITTED',
      entityType: 'meal',
      newValue: `Submitted ${recordsToSave.length} student meal records`,
      timestamp: new Date().toISOString(),
    });
  }

  // --- DORMITORY ---
  public getDormitoryStays(): DormitoryStayRecord[] {
    return this.getItem(STORAGE_KEYS.DORMITORY, []);
  }

  public saveDormitoryStay(record: DormitoryStayRecord, user: User): void {
    const records = this.getDormitoryStays();
    const idx = records.findIndex(
      (r) => r.studentId === record.studentId && r.weekStartDate === record.weekStartDate
    );
    if (idx >= 0) {
      records[idx] = record;
    } else {
      records.push(record);
    }
    this.setItem(STORAGE_KEYS.DORMITORY, records);

    this.addAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'UPDATE_DORMITORY',
      entityType: 'dormitory',
      studentId: record.studentId,
      newValue: record.isStaying ? 'Staying' : 'Not staying',
      timestamp: new Date().toISOString(),
      details: record.notes,
    });
  }

  public bulkSaveDormitoryStays(recordsToSave: DormitoryStayRecord[], user: User): void {
    const records = this.getDormitoryStays();
    recordsToSave.forEach((rec) => {
      const idx = records.findIndex(
        (r) => r.studentId === rec.studentId && r.weekStartDate === rec.weekStartDate
      );
      if (idx >= 0) {
        records[idx] = rec;
      } else {
        records.push(rec);
      }
    });
    this.setItem(STORAGE_KEYS.DORMITORY, records);

    this.addAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'BULK_DORMITORY_SUBMITTED',
      entityType: 'dormitory',
      newValue: `Submitted ${recordsToSave.length} dormitory stay records`,
      timestamp: new Date().toISOString(),
    });
  }

  // --- AUDIT LOGS ---
  public getAuditLogs(): AuditLogEntry[] {
    return this.getItem(STORAGE_KEYS.AUDIT, INITIAL_AUDIT_LOGS);
  }

  public addAuditLog(entry: Omit<AuditLogEntry, 'id'>): void {
    const logs = this.getAuditLogs();
    const newLog: AuditLogEntry = {
      ...entry,
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    logs.unshift(newLog);
    // keep latest 500 entries
    if (logs.length > 500) logs.pop();
    this.setItem(STORAGE_KEYS.AUDIT, logs);
  }

  // --- SETTINGS ---
  public getSettings(): NotificationSettings {
    return this.getItem(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  }

  public saveSettings(settings: NotificationSettings, user: User): void {
    this.setItem(STORAGE_KEYS.SETTINGS, settings);
    this.addAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'UPDATE_SETTINGS',
      entityType: 'system',
      timestamp: new Date().toISOString(),
      details: 'Хабарламалар мен кесте баптаулары өзгертілді',
    });
  }

  // --- SITE CONFIG & SCHOOL CUSTOMIZATION ---
  public getSiteConfig(): SiteConfig {
    return this.getItem(STORAGE_KEYS.SITE_CONFIG, INITIAL_SITE_CONFIG);
  }

  public saveSiteConfig(config: SiteConfig, user: User): void {
    this.setItem(STORAGE_KEYS.SITE_CONFIG, config);
    this.addAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'UPDATE_SITE_CONFIG',
      entityType: 'system',
      newValue: config.schoolName,
      timestamp: new Date().toISOString(),
      details: `Мектеп атауы және сайт баптаулары өзгертілді: ${config.schoolName}`,
    });
  }

  // Export full JSON backup
  public exportBackup(): string {
    const dump = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      siteConfig: this.getSiteConfig(),
      years: this.getAcademicYears(),
      classes: this.getClasses(),
      users: this.getUsers(),
      subjects: this.getSubjects(),
      timetables: this.getTimetables(),
      students: this.getStudents(),
      sessions: this.getSessions(),
      attendance: this.getAttendanceRecords(),
      homework: this.getHomeworkRecords(),
      meals: this.getWeekendMeals(),
      dormitory: this.getDormitoryStays(),
      audit: this.getAuditLogs(),
      settings: this.getSettings(),
    };
    return JSON.stringify(dump, null, 2);
  }

  // Import JSON backup
  public importBackup(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.siteConfig) this.setItem(STORAGE_KEYS.SITE_CONFIG, data.siteConfig);
      if (data.years) this.setItem(STORAGE_KEYS.YEARS, data.years);
      if (data.classes) this.setItem(STORAGE_KEYS.CLASSES, data.classes);
      if (data.users) this.setItem(STORAGE_KEYS.USERS, data.users);
      if (data.subjects) this.setItem(STORAGE_KEYS.SUBJECTS, data.subjects);
      if (data.timetables) this.setItem(STORAGE_KEYS.TIMETABLES, data.timetables);
      if (data.students) this.setItem(STORAGE_KEYS.STUDENTS, data.students);
      if (data.sessions) this.setItem(STORAGE_KEYS.SESSIONS, data.sessions);
      if (data.attendance) this.setItem(STORAGE_KEYS.ATTENDANCE, data.attendance);
      if (data.homework) this.setItem(STORAGE_KEYS.HOMEWORK, data.homework);
      if (data.meals) this.setItem(STORAGE_KEYS.MEALS, data.meals);
      if (data.dormitory) this.setItem(STORAGE_KEYS.DORMITORY, data.dormitory);
      if (data.audit) this.setItem(STORAGE_KEYS.AUDIT, data.audit);
      if (data.settings) this.setItem(STORAGE_KEYS.SETTINGS, data.settings);
      return true;
    } catch (e) {
      console.error('Failed to parse backup', e);
      return false;
    }
  }
}

export const storage = new StorageService();
// Initialize storage
storage.initDatabase();
