import React, { createContext, useContext, useState, useEffect } from 'react';
import { Role, User } from '../types';
import { storage } from '../db/storage';

interface AuthContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: (role: Role, classId?: string) => void;
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
