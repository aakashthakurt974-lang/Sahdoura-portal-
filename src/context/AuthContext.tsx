import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getStoredToken, getStoredUser, setStoredSession, clearStoredSession } from '../services/api.ts';

interface AuthUser {
  userId: string;
  displayName: string;
  mobile?: string;
  mobileMasked?: string;
  role: 'citizen' | 'admin' | 'editor';
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  loginAsCitizen: (token: string, user: AuthUser) => void;
  loginAsAdmin: (token: string, user: AuthUser) => void;
  logout: () => void;
  refreshMe: () => Promise<void>;
  isOtpModalOpen: boolean;
  openOtpModal: () => void;
  closeOtpModal: () => void;
  isAdminModalOpen: boolean;
  openAdminModal: () => void;
  closeAdminModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser());
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [loading, setLoading] = useState(true);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  const refreshMe = async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await api.getMe();
      if (res.authenticated && res.user) {
        setUser(res.user);
        setStoredSession(token, res.user);
      } else {
        logout();
      }
    } catch {
      // In offline or stale session
      // keep local user if present or clear
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshMe();
  }, []);

  const loginAsCitizen = (newToken: string, newUser: AuthUser) => {
    setToken(newToken);
    setUser(newUser);
    setStoredSession(newToken, newUser);
    setIsOtpModalOpen(false);
  };

  const loginAsAdmin = (newToken: string, newUser: AuthUser) => {
    setToken(newToken);
    setUser(newUser);
    setStoredSession(newToken, newUser);
    setIsAdminModalOpen(false);
  };

  const logout = () => {
    clearStoredSession();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role === 'admin' || user?.role === 'editor',
        loading,
        loginAsCitizen,
        loginAsAdmin,
        logout,
        refreshMe,
        isOtpModalOpen,
        openOtpModal: () => setIsOtpModalOpen(true),
        closeOtpModal: () => setIsOtpModalOpen(false),
        isAdminModalOpen,
        openAdminModal: () => setIsAdminModalOpen(true),
        closeAdminModal: () => setIsAdminModalOpen(false)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
