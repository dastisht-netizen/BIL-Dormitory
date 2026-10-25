import React, { createContext, useContext, useState, useEffect } from 'react';
import { Role, User, SiteConfig } from '../types';
import { storage } from '../db/storage';

interface AuthContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: (role: Role, classId?: string) => void;
  login: (identifier: string, password?: string) => { success: boolean; message?: string };
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => storage.getUsers());
  const [siteConfig, setSiteConfigState] = useState<SiteConfig>(() => storage.getSiteConfig());
  const [currentUser, setCurrentUserState] = useState<User>(() => {
    const savedUserId = localStorage.getItem('bil_current_user_id');
    const allUsers = storage.getUsers();
    const found = allUsers.find((u) => u.id === savedUserId);
    return found || allUsers[0]; // defaults to Administrator
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

  const login = (identifier: string, password?: string): { success: boolean; message?: string } => {
    const all = storage.getUsers();
    const cleanId = identifier.trim().toLowerCase();

    // Match by email, username prefix, or role
    const found = all.find(
      (u) =>
        u.email.toLowerCase() === cleanId ||
        u.id.toLowerCase() === cleanId ||
        u.name.toLowerCase().includes(cleanId) ||
        (cleanId === 'admin' && u.role === 'ADMINISTRATOR') ||
        (cleanId === 'educator' && u.role === 'EDUCATOR') ||
        (cleanId === 'teacher' && u.role === 'CLASS_TEACHER') ||
        (cleanId === 'cafeteria' && u.role === 'CAFETERIA_STAFF')
    );

    if (!found) {
      return { success: false, message: 'Қолданушы табылмады. Email немесе логинді дұрыс енгізіңіз.' };
    }

    // Password check if provided
    if (password && found.password && found.password !== password.trim()) {
      return { success: false, message: 'Құпиясөз қате. Қайталап көріңіз.' };
    }

    setCurrentUser(found);
    return { success: true };
  };

  const logout = () => {
    // Switch to first educator or non-admin, or keep current
    const all = storage.getUsers();
    const guestOrEdu = all.find((u) => u.role === 'EDUCATOR') || all[0];
    setCurrentUser(guestOrEdu);
  };

  const switchRole = (role: Role, targetClassId?: string) => {
    const allUsers = storage.getUsers();
    let target = allUsers.find((u) => u.role === role);
    if (role === 'EDUCATOR' && targetClassId) {
      const match = allUsers.find((u) => u.role === 'EDUCATOR' && u.assignedClassIds?.includes(targetClassId));
      if (match) target = match;
    }
    if (target) {
      setCurrentUser(target);
    }
  };

  const isAdmin = currentUser.role === 'ADMINISTRATOR';
  const isEducator = currentUser.role === 'EDUCATOR';
  const isClassTeacher = currentUser.role === 'CLASS_TEACHER';
  const isCafeteria = currentUser.role === 'CAFETERIA_STAFF';

  const canAccessClass = (classId: string): boolean => {
    if (isAdmin) return true;
    if (isEducator) {
      return !!currentUser.assignedClassIds?.includes(classId);
    }
    if (isClassTeacher) {
      return !!currentUser.assignedClassIds?.includes(classId);
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
