import React, { createContext, useContext, useState, useEffect } from 'react';
import { Role, User, SiteConfig } from '../types';
import { storage } from '../db/storage';

interface AuthContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  isAuthenticated: boolean;
  switchRole: (role: Role, classId?: string) => void;
  login: (identifier: string, password?: string) => { success: boolean; message?: string; user?: User };
  logout: () => void;
  siteConfig: SiteConfig;
  updateSiteConfig: (config: SiteConfig) => void;
  updateCurrentUserProfile: (updated: Partial<User>) => void;
  users: User[];
  refreshUsers: () => void;
  isAdmin: boolean;
  isEducator: boolean;
  isClassTeacher: boolean;
  isCafeteria: boolean;
  canAccessClass: (classId: string) => boolean;
  canAccessTab: (tab: string) => boolean;
  userAllowedRoles: Role[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => storage.getUsers());
  const [siteConfig, setSiteConfigState] = useState<SiteConfig>(() => storage.getSiteConfig());

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const authFlag = localStorage.getItem('bil_authenticated');
    return authFlag === 'true';
  });

  const [currentUser, setCurrentUserState] = useState<User>(() => {
    const savedUserId = localStorage.getItem('bil_current_user_id');
    const allUsers = storage.getUsers();
    const found = allUsers.find((u) => u.id === savedUserId);
    return found || allUsers[0]; // defaults to Administrator (Достонбек Тажиханов)
  });

  const refreshUsers = () => {
    const all = storage.getUsers();
    setUsers(all);
    const curr = all.find((u) => u.id === currentUser.id);
    if (curr) setCurrentUserState(curr);
  };

  const setCurrentUser = (user: User) => {
    setCurrentUserState(user);
    localStorage.setItem('bil_current_user_id', user.id);
    localStorage.setItem('bil_authenticated', 'true');
    setIsAuthenticated(true);
  };

  const updateSiteConfig = (newConfig: SiteConfig) => {
    storage.saveSiteConfig(newConfig, currentUser);
    setSiteConfigState(newConfig);
  };

  const updateCurrentUserProfile = (updated: Partial<User>) => {
    const updatedUser: User = { ...currentUser, ...updated };
    storage.saveUser(updatedUser, currentUser.id, currentUser.name);
    setCurrentUser(updatedUser);
    refreshUsers();
  };

  const login = (identifier: string, password?: string): { success: boolean; message?: string; user?: User } => {
    const all = storage.getUsers();
    const cleanId = identifier.trim().toLowerCase();

    // Match by 12-digit IIN, email, or exact ID
    const found = all.find(
      (u) =>
        (u.iin && u.iin.trim() === cleanId) ||
        u.email.toLowerCase() === cleanId ||
        u.id.toLowerCase() === cleanId ||
        u.name.toLowerCase().includes(cleanId)
    );

    if (!found) {
      return { success: false, message: 'Қолданушы табылмады. 12 таңбалы ЖСН (ИИН) енгізіңіз.' };
    }

    // Inactive status check (except for Master Admin)
    if (found.role !== 'ADMINISTRATOR' && (found.isActive === false || found.status === 'inactive')) {
      return {
        success: false,
        message: 'Бұл қызметкердің аккаунты әкімші тарапынан уақытша өшірілген (белсенді емес). Деректер сақталған, бірақ жүйеге кіру үшін жатақхана меңгерушісіне хабарласыңыз.',
      };
    }

    // Password check if provided
    if (password && found.password && found.password.trim() !== password.trim()) {
      return { success: false, message: 'Құпиясөз қате. Қайталап көріңіз.' };
    }

    localStorage.setItem('bil_authenticated', 'true');
    localStorage.setItem('bil_current_user_id', found.id);
    setCurrentUserState(found);
    setIsAuthenticated(true);
    return { success: true, user: found };
  };

  const logout = () => {
    localStorage.setItem('bil_authenticated', 'false');
    localStorage.removeItem('bil_current_user_id');
    setIsAuthenticated(false);
  };

  const ROLE_ALLOWED_TABS: Record<Role, string[]> = {
    ADMINISTRATOR: [
      'dashboard',
      'self_study',
      'attendance',
      'homework',
      'meals',
      'dormitory',
      'students',
      'classes',
      'timetables',
      'educator_performance',
      'analytics',
      'quarterly_reports',
      'academic_years',
      'audit_logs',
      'settings',
    ],
    EDUCATOR: [
      'self_study',
      'attendance',
      'homework',
      'meals',
      'dormitory',
    ],
    CLASS_TEACHER: [
      'dashboard',
      'students',
      'timetables',
      'attendance',
      'homework',
      'analytics',
      'quarterly_reports',
    ],
    CAFETERIA_STAFF: [
      'dashboard',
      'meals',
      'dormitory',
    ],
  };

  const userAllowedRoles: Role[] = React.useMemo(() => {
    if (currentUser.role === 'ADMINISTRATOR') {
      return ['ADMINISTRATOR', 'EDUCATOR', 'CLASS_TEACHER', 'CAFETERIA_STAFF'];
    }
    const roles: Role[] = [currentUser.role];
    if (currentUser.secondaryRole && !roles.includes(currentUser.secondaryRole)) {
      roles.push(currentUser.secondaryRole);
    }
    if (currentUser.allowedRoles) {
      currentUser.allowedRoles.forEach((r) => {
        if (!roles.includes(r)) roles.push(r);
      });
    }
    return roles;
  }, [currentUser]);

  const canAccessTab = (tab: string): boolean => {
    if (currentUser.role === 'ADMINISTRATOR') return true;
    return userAllowedRoles.some((r) => ROLE_ALLOWED_TABS[r]?.includes(tab));
  };

  const switchRole = (role: Role, targetClassId?: string) => {
    // 1. If Administrator, allows switching/previewing
    if (currentUser.role === 'ADMINISTRATOR') {
      const allUsers = storage.getUsers();
      let target = allUsers.find((u) => u.role === role);
      if (role === 'EDUCATOR' && targetClassId) {
        const match = allUsers.find((u) => u.role === 'EDUCATOR' && u.assignedClassIds?.includes(targetClassId));
        if (match) target = match;
      }
      if (target) {
        setCurrentUser(target);
        setIsAuthenticated(true);
      }
      return;
    }

    // 2. Normal employee: CANNOT switch to unauthorized roles or to ADMINISTRATOR
    if (!userAllowedRoles.includes(role)) {
      console.warn(`[Security] Unauthorized attempt by ${currentUser.name} to switch to role ${role}`);
      return;
    }

    // Switch active role within officially allowed roles (same user identity)
    const updatedUser: User = {
      ...currentUser,
      role,
    };
    storage.saveUser(updatedUser, currentUser.id, currentUser.name);
    setCurrentUser(updatedUser);
  };

  const isAdmin = currentUser.role === 'ADMINISTRATOR';
  const isEducator = currentUser.role === 'EDUCATOR';
  const isClassTeacher = currentUser.role === 'CLASS_TEACHER';
  const isCafeteria = currentUser.role === 'CAFETERIA_STAFF';

  const canAccessClass = (classId: string): boolean => {
    if (isAdmin) return true;
    const cls = storage.getClasses().find((c) => c.id === classId);
    if (isEducator) {
      return !!(
        currentUser.assignedClassIds?.includes(classId) ||
        cls?.educatorId === currentUser.id ||
        cls?.assistantEducatorId === currentUser.id ||
        cls?.additionalStaffIds?.includes(currentUser.id)
      );
    }
    if (isClassTeacher) {
      return !!(
        currentUser.assignedClassIds?.includes(classId) ||
        cls?.classTeacherId === currentUser.id ||
        cls?.additionalStaffIds?.includes(currentUser.id)
      );
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isAuthenticated,
        switchRole,
        login,
        logout,
        siteConfig,
        updateSiteConfig,
        updateCurrentUserProfile,
        users,
        refreshUsers,
        isAdmin,
        isEducator,
        isClassTeacher,
        isCafeteria,
        canAccessClass,
        canAccessTab,
        userAllowedRoles,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
