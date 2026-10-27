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
  PasswordResetToken,
} from '../types';

const STORAGE_KEYS = {
  USERS: 'bil_users_v4',
  YEARS: 'bil_years_v4',
  CLASSES: 'bil_classes_v4',
  SUBJECTS: 'bil_subjects_v4',
  TIMETABLES: 'bil_timetables_v4',
  STUDENTS: 'bil_students_v4',
  SESSIONS: 'bil_sessions_v4',
  ATTENDANCE: 'bil_attendance_v4',
  HOMEWORK: 'bil_homework_v4',
  MEALS: 'bil_meals_v4',
  DORMITORY: 'bil_dormitory_v4',
  AUDIT: 'bil_audit_v4',
  SETTINGS: 'bil_settings_v4',
  SITE_CONFIG: 'bil_site_config_v4',
  RESET_TOKENS: 'bil_reset_tokens_v4',
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

export const MAX_STUDENTS_PER_CLASS = 26;

// Initial Users: Тек Жатақхана меңгерушісі (Достонбек Тажиханов). Ешқандай жасанды/бот қызметкер жоқ!
export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin',
    name: 'Достонбек Тажиханов',
    email: 'dostontajihanov26@gmail.com',
    iin: '900101300000',
    password: 'BIL#1234',
    role: 'ADMINISTRATOR',
    phone: '+7 701 555 0101',
    isActive: true,
    status: 'active',
  },
];

// Initial Classes (Бастапқы күйде барлық сыныптар таза, қызметкерлерді әкімші өзі бекітеді)
export const INITIAL_CLASSES: SchoolClass[] = [
  { id: 'cls-7a', name: '7A', grade: 7, academicYearId: 'ay-2026-2027', academicYearName: '2026–2027', educatorId: undefined, classTeacherId: undefined, isActive: true, status: 'active' },
  { id: 'cls-7b', name: '7B', grade: 7, academicYearId: 'ay-2026-2027', academicYearName: '2026–2027', educatorId: undefined, classTeacherId: undefined, isActive: true, status: 'active' },
  { id: 'cls-8a', name: '8A', grade: 8, academicYearId: 'ay-2026-2027', academicYearName: '2026–2027', educatorId: undefined, classTeacherId: undefined, isActive: true, status: 'active' },
  { id: 'cls-8b', name: '8B', grade: 8, academicYearId: 'ay-2026-2027', academicYearName: '2026–2027', educatorId: undefined, classTeacherId: undefined, isActive: true, status: 'active' },
  { id: 'cls-9a', name: '9A', grade: 9, academicYearId: 'ay-2026-2027', academicYearName: '2026–2027', educatorId: undefined, classTeacherId: undefined, isActive: true, status: 'active' },
  { id: 'cls-10a', name: '10A', grade: 10, academicYearId: 'ay-2026-2027', academicYearName: '2026–2027', educatorId: undefined, classTeacherId: undefined, isActive: true, status: 'active' },
  { id: 'cls-11a', name: '11A', grade: 11, academicYearId: 'ay-2026-2027', academicYearName: '2026–2027', educatorId: undefined, classTeacherId: undefined, isActive: true, status: 'active' },
];

// Initial Students (Таза база: алдын ала енгізілген оқушы жоқ, 0 оқушы)
export const INITIAL_STUDENTS: Student[] = [];

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

  // Initialization check (Таза база: ешқандай жасанды оқушы немесе тәрбиеші жоқ)
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
      this.setItem(STORAGE_KEYS.AUDIT, [
        {
          id: 'audit-001',
          userId: 'user-admin',
          userName: 'Достонбек Тажиханов',
          userRole: 'ADMINISTRATOR',
          action: 'INIT_SYSTEM',
          entityType: 'system',
          previousValue: 'None',
          newValue: 'Таза деректер қоры іске қосылды',
          timestamp: new Date().toISOString(),
          details: 'Арыс БІЛ жатақхана жүйесі бастапқы таза күйде сәтті іске қосылды',
        },
      ]);
      this.setItem(STORAGE_KEYS.SESSIONS, []);
      this.setItem(STORAGE_KEYS.ATTENDANCE, []);
      this.setItem(STORAGE_KEYS.HOMEWORK, []);
      this.setItem(STORAGE_KEYS.MEALS, []);
      this.setItem(STORAGE_KEYS.DORMITORY, []);
    }
    // ensure site config exists even if upgraded
    if (!localStorage.getItem(STORAGE_KEYS.SITE_CONFIG)) {
      this.setItem(STORAGE_KEYS.SITE_CONFIG, INITIAL_SITE_CONFIG);
    }
  }

  // Reset to clean zero-state (Таза базаға қайтару)
  public resetToZeroDatabase(): void {
    this.setItem(STORAGE_KEYS.USERS, INITIAL_USERS);
    this.setItem(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);
    this.setItem(STORAGE_KEYS.STUDENTS, []);
    this.setItem(STORAGE_KEYS.TIMETABLES, []);
    this.setItem(STORAGE_KEYS.SESSIONS, []);
    this.setItem(STORAGE_KEYS.ATTENDANCE, []);
    this.setItem(STORAGE_KEYS.HOMEWORK, []);
    this.setItem(STORAGE_KEYS.MEALS, []);
    this.setItem(STORAGE_KEYS.DORMITORY, []);
  }

  // Reset to default sample
  public resetToSample(): void {
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
  public getClasses(onlyActive?: boolean): SchoolClass[] {
    const list = this.getItem<SchoolClass[]>(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);
    let changed = false;

    // Ensure all items have isActive, status, and academicYearName defined
    list.forEach((cls) => {
      if (cls.isActive === undefined) {
        cls.isActive = true;
        changed = true;
      }
      if (!cls.status) {
        cls.status = cls.isActive ? 'active' : 'inactive';
        changed = true;
      }
      if (!cls.academicYearName) {
        cls.academicYearName = '2026–2027';
        changed = true;
      }
    });

    if (changed) {
      this.setItem(STORAGE_KEYS.CLASSES, list);
    }

    if (onlyActive) {
      return list.filter((c) => c.isActive !== false && c.status !== 'inactive');
    }
    return list;
  }

  public saveClass(cls: SchoolClass, userId: string, userName: string): SchoolClass {
    const classes = this.getClasses();
    const idx = classes.findIndex((c) => c.id === cls.id);
    const prevClass = idx >= 0 ? classes[idx] : null;

    const enrichedClass: SchoolClass = {
      ...cls,
      name: cls.name.trim().toUpperCase(),
      isActive: cls.isActive !== undefined ? cls.isActive : true,
      status: cls.isActive === false || cls.status === 'inactive' ? 'inactive' : 'active',
      academicYearName: cls.academicYearName || '2026–2027',
      updatedAt: new Date().toISOString(),
      createdAt: cls.createdAt || (prevClass?.createdAt || new Date().toISOString()),
    };

    if (idx >= 0) {
      classes[idx] = enrichedClass;
    } else {
      classes.push(enrichedClass);
    }
    this.setItem(STORAGE_KEYS.CLASSES, classes);

    // Sync staff assignedClassIds in users
    const users = this.getUsers();
    let usersModified = false;

    // Collect all staff currently assigned to this class
    const newAssignedStaffIds = new Set<string>();
    if (enrichedClass.educatorId) newAssignedStaffIds.add(enrichedClass.educatorId);
    if (enrichedClass.classTeacherId) newAssignedStaffIds.add(enrichedClass.classTeacherId);
    if (enrichedClass.assistantEducatorId) newAssignedStaffIds.add(enrichedClass.assistantEducatorId);
    if (enrichedClass.additionalStaffIds) {
      enrichedClass.additionalStaffIds.forEach((id) => newAssignedStaffIds.add(id));
    }

    // Collect previously assigned staff
    const oldAssignedStaffIds = new Set<string>();
    if (prevClass?.educatorId) oldAssignedStaffIds.add(prevClass.educatorId);
    if (prevClass?.classTeacherId) oldAssignedStaffIds.add(prevClass.classTeacherId);
    if (prevClass?.assistantEducatorId) oldAssignedStaffIds.add(prevClass.assistantEducatorId);
    if (prevClass?.additionalStaffIds) {
      prevClass.additionalStaffIds.forEach((id) => oldAssignedStaffIds.add(id));
    }

    // Unlink old staff who are no longer assigned
    oldAssignedStaffIds.forEach((staffId) => {
      if (!newAssignedStaffIds.has(staffId)) {
        const u = users.find((usr) => usr.id === staffId);
        if (u && u.assignedClassIds) {
          u.assignedClassIds = u.assignedClassIds.filter((cid) => cid !== enrichedClass.id);
          u.updatedAt = new Date().toISOString();
          usersModified = true;
        }
      }
    });

    // Link newly assigned staff
    newAssignedStaffIds.forEach((staffId) => {
      const u = users.find((usr) => usr.id === staffId);
      if (u) {
        if (!u.assignedClassIds) u.assignedClassIds = [];
        if (!u.assignedClassIds.includes(enrichedClass.id)) {
          u.assignedClassIds.push(enrichedClass.id);
          u.updatedAt = new Date().toISOString();
          usersModified = true;
        }
      }
    });

    if (usersModified) {
      this.setItem(STORAGE_KEYS.USERS, users);
    }

    this.addAuditLog({
      userId,
      userName,
      userRole: 'ADMINISTRATOR',
      action: idx >= 0 ? 'UPDATE_CLASS' : 'CREATE_CLASS',
      entityType: 'system',
      entityId: enrichedClass.id,
      newValue: `${enrichedClass.name} (${enrichedClass.status})`,
      timestamp: new Date().toISOString(),
      details: `Сынып «${enrichedClass.name}» сәтті ${idx >= 0 ? 'жаңартылды' : 'қосылды'}. Тәрбиеші: ${enrichedClass.educatorId || 'тағайындалмаған'}, Жетекші: ${enrichedClass.classTeacherId || 'тағайындалмаған'}`,
    });

    return enrichedClass;
  }

  public deleteClass(
    classId: string,
    userId: string,
    userName: string
  ): { success: boolean; message: string } {
    const classes = this.getClasses();
    const target = classes.find((c) => c.id === classId);
    if (!target) {
      return { success: false, message: 'Сынып табылмады' };
    }

    // 1. Remove from classes list
    const updatedClasses = classes.filter((c) => c.id !== classId);
    this.setItem(STORAGE_KEYS.CLASSES, updatedClasses);

    // 2. Unlink from all staff members' assignedClassIds
    const users = this.getUsers();
    let usersModified = false;
    users.forEach((u) => {
      if (u.assignedClassIds && u.assignedClassIds.includes(classId)) {
        u.assignedClassIds = u.assignedClassIds.filter((cid) => cid !== classId);
        u.updatedAt = new Date().toISOString();
        usersModified = true;
      }
    });
    if (usersModified) {
      this.setItem(STORAGE_KEYS.USERS, users);
    }

    // 3. Notice: Оқушылар мен бұрынғы есептер жойылмайды!
    // Students remain intact; historical roll call, homework, and study attendance records are preserved.

    this.addAuditLog({
      userId,
      userName,
      userRole: 'ADMINISTRATOR',
      action: 'DELETE_CLASS',
      entityType: 'system',
      entityId: classId,
      newValue: target.name,
      timestamp: new Date().toISOString(),
      details: `«${target.name}» сыныбы өшірілді. Оқушылар мен барлық бұрынғы есептер толық сақталды.`,
    });

    return {
      success: true,
      message: `«${target.name}» сыныбы өшірілді. Оқушылар мен барлық бұрынғы есептер дерекқорда толық сақталды.`,
    };
  }

  public toggleClassStatus(
    classId: string,
    userId: string,
    userName: string
  ): { success: boolean; newStatus: boolean; message: string } {
    const classes = this.getClasses();
    const target = classes.find((c) => c.id === classId);
    if (!target) {
      return { success: false, newStatus: false, message: 'Сынып табылмады' };
    }

    const currentActive = target.isActive !== false && target.status !== 'inactive';
    const newActiveState = !currentActive;

    target.isActive = newActiveState;
    target.status = newActiveState ? 'active' : 'inactive';
    target.updatedAt = new Date().toISOString();

    this.setItem(STORAGE_KEYS.CLASSES, classes);

    this.addAuditLog({
      userId,
      userName,
      userRole: 'ADMINISTRATOR',
      action: newActiveState ? 'ACTIVATE_CLASS' : 'DEACTIVATE_CLASS',
      entityType: 'system',
      entityId: classId,
      newValue: newActiveState ? 'active' : 'inactive',
      timestamp: new Date().toISOString(),
      details: `«${target.name}» сыныбы ${newActiveState ? 'белсенді етілді' : 'уақытша белсенді емес етілді'}.`,
    });

    return {
      success: true,
      newStatus: newActiveState,
      message: `«${target.name}» сыныбы ${newActiveState ? 'сәтті белсенді етілді!' : 'уақытша өшірілді (белсенді емес).'}`
    };
  }

  // --- USERS ---
  public getUsers(onlyActive?: boolean): User[] {
    const list = this.getItem<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    // Ensure the master administrator is always preserved
    const hasAdmin = list.some((u) => u.id === 'user-admin' || u.role === 'ADMINISTRATOR');
    if (!hasAdmin) {
      const masterAdmin = INITIAL_USERS.find((u) => u.id === 'user-admin') || INITIAL_USERS[0];
      list.unshift(masterAdmin);
      this.setItem(STORAGE_KEYS.USERS, list);
    }
    if (onlyActive) {
      return list.filter((u) => u.isActive !== false && u.status !== 'inactive');
    }
    return list;
  }

  public saveUser(user: User, adminId: string, adminName: string): void {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === user.id);
    const enrichedUser: User = {
      ...user,
      isActive: user.isActive !== undefined ? user.isActive : true,
      status: user.isActive === false || user.status === 'inactive' ? 'inactive' : 'active',
      updatedAt: new Date().toISOString(),
      createdAt: user.createdAt || (idx >= 0 ? users[idx].createdAt : new Date().toISOString()),
    };
    if (idx >= 0) {
      users[idx] = enrichedUser;
    } else {
      users.push(enrichedUser);
    }
    this.setItem(STORAGE_KEYS.USERS, users);
    this.addAuditLog({
      userId: adminId,
      userName: adminName,
      userRole: 'ADMINISTRATOR',
      action: idx >= 0 ? 'UPDATE_USER' : 'CREATE_USER',
      entityType: 'system',
      entityId: user.id,
      newValue: `${user.name} (${user.role}) - ${enrichedUser.status}`,
      timestamp: new Date().toISOString(),
    });
  }

  public toggleUserStatus(
    userId: string,
    adminId: string,
    adminName: string
  ): { success: boolean; newStatus: boolean; message: string } {
    if (userId === 'user-admin') {
      return { success: false, newStatus: true, message: 'Бас әкімшіні (Достонбек Тажиханов) өшіруге болмайды!' };
    }
    const users = this.getUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) {
      return { success: false, newStatus: false, message: 'Қызметкер табылмады' };
    }
    const currentlyActive = user.isActive !== false && user.status !== 'inactive';
    const newActiveState = !currentlyActive;
    user.isActive = newActiveState;
    user.status = newActiveState ? 'active' : 'inactive';
    user.updatedAt = new Date().toISOString();

    this.setItem(STORAGE_KEYS.USERS, users);
    this.addAuditLog({
      userId: adminId,
      userName: adminName,
      userRole: 'ADMINISTRATOR',
      action: 'TOGGLE_USER_STATUS',
      entityType: 'system',
      entityId: userId,
      newValue: newActiveState ? 'active' : 'inactive',
      timestamp: new Date().toISOString(),
      details: `«${user.name}» қызметкері ${newActiveState ? 'қайта белсенді етілді (қосылды)' : 'уақытша өшірілді (тоқтатылды)'}`,
    });

    return {
      success: true,
      newStatus: newActiveState,
      message: `«${user.name}» ${newActiveState ? 'сәтті белсенді етілді!' : 'уақытша өшірілді.'}`,
    };
  }

  public transferStaff(
    userId: string,
    toClassId: string | undefined,
    adminId: string,
    adminName: string
  ): void {
    const users = this.getUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    const classes = this.getClasses();

    // 1. Unlink from all classes
    classes.forEach((cls) => {
      if (cls.educatorId === userId) cls.educatorId = undefined;
      if (cls.classTeacherId === userId) cls.classTeacherId = undefined;
    });

    // 2. Link to new class if provided
    if (toClassId) {
      const targetCls = classes.find((c) => c.id === toClassId);
      if (targetCls) {
        if (user.role === 'EDUCATOR') {
          targetCls.educatorId = userId;
        } else if (user.role === 'CLASS_TEACHER') {
          targetCls.classTeacherId = userId;
        }
      }
    }
    this.setItem(STORAGE_KEYS.CLASSES, classes);

    // 3. Update user's assignedClassIds
    user.assignedClassIds = toClassId ? [toClassId] : [];
    user.updatedAt = new Date().toISOString();
    this.setItem(STORAGE_KEYS.USERS, users);

    this.addAuditLog({
      userId: adminId,
      userName: adminName,
      userRole: 'ADMINISTRATOR',
      action: 'TRANSFER_STAFF',
      entityType: 'system',
      entityId: userId,
      newValue: toClassId || 'none',
      timestamp: new Date().toISOString(),
      details: `«${user.name}» қызметкері ${toClassId ? `${toClassId} сыныбына ауыстырылды` : 'сыныптан босатылды'}`,
    });
  }

  public deleteUser(userId: string, adminId: string, adminName: string): void {
    if (userId === 'user-admin') {
      alert('Бас әкімшіні (Достонбек Тажиханов) өшіруге болмайды!');
      return;
    }

    // 1. Remove from users list permanently
    const users = this.getUsers().filter((u) => u.id !== userId);
    this.setItem(STORAGE_KEYS.USERS, users);

    // 2. Unlink from any classes where this user was assigned as educator or class teacher
    const classes = this.getClasses();
    let classChanged = false;
    classes.forEach((cls) => {
      if (cls.educatorId === userId) {
        cls.educatorId = undefined;
        classChanged = true;
      }
      if (cls.classTeacherId === userId) {
        cls.classTeacherId = undefined;
        classChanged = true;
      }
    });
    if (classChanged) {
      this.setItem(STORAGE_KEYS.CLASSES, classes);
    }

    this.addAuditLog({
      userId: adminId,
      userName: adminName,
      userRole: 'ADMINISTRATOR',
      action: 'DELETE_USER',
      entityType: 'system',
      entityId: userId,
      timestamp: new Date().toISOString(),
      details: `Қызметкер өшірілді және сыныптардан толық босатылды (${userId})`,
    });
  }

  // --- PASSWORD RECOVERY & RESET FLOW ---
  public requestPasswordReset(identifierOrEmail: string): {
    success: boolean;
    message: string;
    resetToken?: string;
    resetLink?: string;
    email?: string;
    userName?: string;
    userId?: string;
  } {
    const clean = identifierOrEmail.trim().toLowerCase();
    if (!clean) {
      return { success: false, message: 'Электрондық поштаны немесе 12 таңбалы ЖСН енгізіңіз.' };
    }

    const users = this.getUsers();
    const user = users.find(
      (u) =>
        (u.email && u.email.toLowerCase() === clean) ||
        (u.iin && u.iin.toLowerCase() === clean) ||
        u.id.toLowerCase() === clean
    );

    if (!user) {
      return {
        success: false,
        message: 'Бұл пошта немесе ЖСН бойынша тіркелген қызметкер табылмады. Деректерді тексеріңіз немесе әкімшіге хабарласыңыз.',
      };
    }

    if (user.role !== 'ADMINISTRATOR' && (user.isActive === false || user.status === 'inactive')) {
      return {
        success: false,
        message: 'Бұл аккаунт әкімші тарапынан уақытша тоқтатылған. Құпиясөзді қалпына келтіру үшін жатақхана меңгерушісіне хабарласыңыз.',
      };
    }

    const resetToken = `tok_rst_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(); // 2 hours

    const tokenEntry: PasswordResetToken = {
      token: resetToken,
      userId: user.id,
      email: user.email,
      userName: user.name,
      createdAt: new Date().toISOString(),
      expiresAt,
    };

    const existingTokens = this.getItem<PasswordResetToken[]>(STORAGE_KEYS.RESET_TOKENS, []);
    const filtered = existingTokens.filter((t) => t.userId !== user.id && new Date(t.expiresAt) > new Date());
    filtered.push(tokenEntry);
    this.setItem(STORAGE_KEYS.RESET_TOKENS, filtered);

    // Secure origin-bound recovery URL
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const resetLink = `${origin}/#type=recovery&token=${resetToken}&email=${encodeURIComponent(user.email)}`;

    this.addAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'REQUEST_PASSWORD_RESET',
      entityType: 'system',
      entityId: user.id,
      newValue: `Reset link generated for ${user.email}`,
      timestamp: new Date().toISOString(),
      details: `Құпиясөзді қалпына келтіру сілтемесі жасалды (${user.email}). Домен: ${origin}`,
    });

    return {
      success: true,
      message: `Құпиясөзді қалпына келтіру сілтемесі ${user.email} электрондық поштасына сәтті жіберілді!`,
      resetToken,
      resetLink,
      email: user.email,
      userName: user.name,
      userId: user.id,
    };
  }

  public getResetTokenInfo(token: string): { valid: boolean; message?: string; user?: User; tokenEntry?: PasswordResetToken } {
    if (!token) return { valid: false, message: 'Сілтеме қате немесе көрсетілмеген.' };
    const tokens = this.getItem<PasswordResetToken[]>(STORAGE_KEYS.RESET_TOKENS, []);
    const entry = tokens.find((t) => t.token === token);
    if (!entry) {
      return { valid: false, message: 'Құпиясөзді қалпына келтіру сілтемесінің мерзімі өткен немесе жарамсыз.' };
    }
    if (new Date(entry.expiresAt) < new Date()) {
      return { valid: false, message: 'Құпиясөзді қалпына келтіру сілтемесінің мерзімі (2 сағат) аяқталған. Қайта сұраныс беріңіз.' };
    }
    const user = this.getUsers().find((u) => u.id === entry.userId);
    if (!user) {
      return { valid: false, message: 'Қолданушы табылмады.' };
    }
    return { valid: true, user, tokenEntry: entry };
  }

  public resetPasswordWithToken(
    token: string,
    newPassword: string
  ): { success: boolean; message: string; user?: User } {
    const cleanPass = newPassword.trim();
    if (cleanPass.length < 6) {
      return { success: false, message: 'Құпиясөз кемінде 6 таңбадан тұруы тиіс.' };
    }

    const check = this.getResetTokenInfo(token);
    if (!check.valid || !check.user) {
      return { success: false, message: check.message || 'Жарамсыз немесе ескірген сілтеме.' };
    }

    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === check.user!.id);
    if (idx < 0) {
      return { success: false, message: 'Қолданушы дерекқордан табылмады.' };
    }

    // Update password securely
    users[idx].password = cleanPass;
    users[idx].updatedAt = new Date().toISOString();
    this.setItem(STORAGE_KEYS.USERS, users);

    // Invalidate used reset token
    const tokens = this.getItem<PasswordResetToken[]>(STORAGE_KEYS.RESET_TOKENS, []);
    const remaining = tokens.filter((t) => t.token !== token);
    this.setItem(STORAGE_KEYS.RESET_TOKENS, remaining);

    this.addAuditLog({
      userId: check.user.id,
      userName: check.user.name,
      userRole: check.user.role,
      action: 'PASSWORD_RESET_SUCCESS',
      entityType: 'system',
      entityId: check.user.id,
      newValue: 'Password updated securely via token',
      timestamp: new Date().toISOString(),
      details: `Қызметкер «${check.user.name}» құпиясөзін сілтеме арқылы сәтті жаңартты. Барлық рөлдері мен сыныптары сақталды.`,
    });

    return {
      success: true,
      message: 'Жаңа құпиясөз сәтті орнатылды! Енді жаңа құпиясөзіңізбен жүйеге кіре аласыз.',
      user: users[idx],
    };
  }

  public adminGenerateStaffResetLink(
    targetUserId: string,
    adminId: string,
    adminName: string
  ): { success: boolean; message: string; resetLink?: string; email?: string } {
    const users = this.getUsers();
    const targetUser = users.find((u) => u.id === targetUserId);
    if (!targetUser) {
      return { success: false, message: 'Қызметкер табылмады.' };
    }

    const resetToken = `tok_rst_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours for admin assistance

    const tokenEntry: PasswordResetToken = {
      token: resetToken,
      userId: targetUser.id,
      email: targetUser.email,
      userName: targetUser.name,
      createdAt: new Date().toISOString(),
      expiresAt,
    };

    const existingTokens = this.getItem<PasswordResetToken[]>(STORAGE_KEYS.RESET_TOKENS, []);
    const filtered = existingTokens.filter((t) => t.userId !== targetUser.id && new Date(t.expiresAt) > new Date());
    filtered.push(tokenEntry);
    this.setItem(STORAGE_KEYS.RESET_TOKENS, filtered);

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const resetLink = `${origin}/#type=recovery&token=${resetToken}&email=${encodeURIComponent(targetUser.email)}`;

    this.addAuditLog({
      userId: adminId,
      userName: adminName,
      userRole: 'ADMINISTRATOR',
      action: 'ADMIN_GENERATED_RESET_LINK',
      entityType: 'system',
      entityId: targetUser.id,
      newValue: `Generated reset link for ${targetUser.name}`,
      timestamp: new Date().toISOString(),
      details: `Әкімші «${targetUser.name}» қызметкеріне құпиясөзді жаңарту сілтемесін жасады. Қазіргі құпиясөз әкімшіге де көрсетілмейді.`,
    });

    return {
      success: true,
      message: `«${targetUser.name}» қызметкеріне құпиясөзді қалпына келтіру сілтемесі жасалды! Сілтеме автоматты көшірілді.`,
      resetLink,
      email: targetUser.email,
    };
  }

  // Assign or unassign educator/teacher to a class
  public assignStaffToClass(
    classId: string,
    role: 'EDUCATOR' | 'CLASS_TEACHER',
    userId: string | undefined,
    adminId: string,
    adminName: string
  ): void {
    const classes = this.getClasses();
    const cls = classes.find((c) => c.id === classId);
    if (!cls) return;

    const previousUserId = role === 'EDUCATOR' ? cls.educatorId : cls.classTeacherId;
    if (role === 'EDUCATOR') {
      cls.educatorId = userId || undefined;
    } else {
      cls.classTeacherId = userId || undefined;
    }
    this.setItem(STORAGE_KEYS.CLASSES, classes);

    // Update users' assignedClassIds
    const users = this.getUsers();
    let usersChanged = false;

    // Unassign previous user if needed
    if (previousUserId && previousUserId !== userId) {
      const prevUser = users.find((u) => u.id === previousUserId);
      if (prevUser && prevUser.assignedClassIds) {
        prevUser.assignedClassIds = prevUser.assignedClassIds.filter((cid) => cid !== classId);
        usersChanged = true;
      }
    }

    // Assign new user
    if (userId) {
      const newUser = users.find((u) => u.id === userId);
      if (newUser) {
        const currentIds = newUser.assignedClassIds || [];
        if (!currentIds.includes(classId)) {
          newUser.assignedClassIds = [...currentIds, classId];
          usersChanged = true;
        }
      }
    }

    if (usersChanged) {
      this.setItem(STORAGE_KEYS.USERS, users);
    }

    this.addAuditLog({
      userId: adminId,
      userName: adminName,
      userRole: 'ADMINISTRATOR',
      action: 'ASSIGN_STAFF',
      entityType: 'system',
      entityId: classId,
      newValue: `${role}: ${userId || 'none'}`,
      timestamp: new Date().toISOString(),
      details: `${cls.name} сыныбына ${role === 'EDUCATOR' ? 'тәрбиеші' : 'сынып жетекшісі'} тағайындалды`,
    });
  }

  // Clear all sample/dummy staff and unassign all classes
  public clearAllSampleStaff(adminId: string, adminName: string): void {
    const users = this.getUsers().filter((u) => u.id === 'user-admin' || u.role === 'ADMINISTRATOR');
    this.setItem(STORAGE_KEYS.USERS, users);

    const classes = this.getClasses().map((c) => ({
      ...c,
      educatorId: undefined,
      classTeacherId: undefined,
    }));
    this.setItem(STORAGE_KEYS.CLASSES, classes);

    this.addAuditLog({
      userId: adminId,
      userName: adminName,
      userRole: 'ADMINISTRATOR',
      action: 'CLEAR_SAMPLE_STAFF',
      entityType: 'system',
      timestamp: new Date().toISOString(),
      details: 'Барлық үлгілік қызметкерлер өшірілді. Бас әкімші (Достонбек Тажиханов) ғана қалды.',
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

  public getClassStudentCount(classId: string): number {
    return this.getStudents().filter((s) => s.classId === classId && s.status === 'active').length;
  }

  public saveStudent(student: Student, userId: string, userName: string): { success: boolean; message?: string } {
    const students = this.getStudents();
    const idx = students.findIndex((s) => s.id === student.id);

    // Enforce strict 26-student limit per class for active students
    const existingInClass = students.filter(
      (s) => s.classId === student.classId && s.status === 'active' && s.id !== student.id
    );
    if (student.status === 'active' && existingInClass.length >= MAX_STUDENTS_PER_CLASS) {
      return {
        success: false,
        message: `Сыныптағы максималды шек — ${MAX_STUDENTS_PER_CLASS} оқушы. Қазір сыныпта ${existingInClass.length} оқушы тіркелген. Жаңа оқушы қосу мүмкін емес!`,
      };
    }

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
    return { success: true };
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
