import { useState, useEffect } from 'react';
import { authService, type UserProfile, type UserRole, type SignUpIdentityData } from '../services/authService';
import { isDemoMode } from '../lib/firebase';

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(() => authService.getCurrentUser());
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = authService.subscribe((profile) => {
      setUser(profile);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginDemoUser = async () => {
    setLoading(true);
    try {
      const profile = await authService.loginDemoUser();
      setUser(profile);
      return profile;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const profile = await authService.login(email, pass);
      setUser(profile);
      return profile;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (
    email: string, 
    pass: string, 
    displayName: string, 
    role?: UserRole, 
    org?: string,
    identityData?: SignUpIdentityData
  ) => {
    setLoading(true);
    try {
      const profile = await authService.signup(email, pass, displayName, role, org, identityData);
      setUser(profile);
      return profile;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (role?: UserRole, org?: string) => {
    setLoading(true);
    try {
      const profile = await authService.loginWithGoogle(role, org);
      setUser(profile);
      return profile;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    role: user?.role || 'CITIZEN',
    isAuthenticated: !!user,
    isDemo: isDemoMode() || user?.dataSource === 'DEMO DATA',
    loading,
    login,
    loginDemoUser,
    signup,
    loginWithGoogle,
    logout,
  };
}
