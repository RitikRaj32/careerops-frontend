import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const STORAGE_KEY = 'careerai_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.isAuthenticated) return parsed;
      }
    } catch (e) {
      console.error('Failed to restore session', e);
    }
    return {
      name: '',
      phone: '',
      targetRole: '',
      isAuthenticated: false,
      isNewUser: false
    };
  });

  // Persist user to localStorage whenever it changes
  useEffect(() => {
    if (user.isAuthenticated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  /**
   * Send OTP to a phone number via the backend.
   */
  const sendOtp = async (phone) => {
    const res = await fetch('https://good-files-lead.loca.lt/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send OTP');

    if (data.skipOtp && data.user) {
      setUser({
        name: data.user.name || '',
        phone: data.user.phone || phone,
        isAuthenticated: true,
        isNewUser: false,
        ...data.user
      });
    }

    return data;
  };

  const magicLogin = async (phone) => {
    const res = await fetch('https://good-files-lead.loca.lt/api/auth/magic-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    
    setUser({
      name: data.user?.name || '',
      phone: data.user?.phone || phone,
      isAuthenticated: true,
      isNewUser: !data.user?.isOnboarded,
      ...data.user
    });
    
    return data;
  };

  /**
   * Verify OTP and log the user in.
   * Returns { isNewUser: boolean } so the caller can navigate accordingly.
   */
  const verifyOtp = async (phone, otp) => {
    const res = await fetch('https://good-files-lead.loca.lt/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Verification failed');

    const isNewUser = !data.user.isOnboarded;
    const userData = {
      name: data.user.name || '',
      phone: data.user.phone || phone,
      isAuthenticated: !isNewUser,
      isNewUser,
      ...data.user
    };
    setUser(userData);
    return { isNewUser };
  };

  const completeProfile = async (profileData) => {
    try {
      await fetch('https://good-files-lead.loca.lt/api/users/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: user.phone, ...profileData })
      });
    } catch (error) {
      console.error('Failed to update profile via backend:', error);
    }
    setUser(prev => ({ 
      ...prev, 
      ...profileData,
      name: `${profileData.firstName} ${profileData.lastName}`.trim(),
      isAuthenticated: true, 
      isNewUser: false 
    }));
  };

  const applyJob = (job) => {
    setUser(prev => {
      const existing = prev.appliedJobs || [];
      // Prevent duplicate applications
      if (existing.some(j => j.id === job.id)) return prev;
      return {
        ...prev,
        appliedJobs: [...existing, { ...job, appliedAt: new Date().toISOString(), status: 'Applied' }]
      };
    });
  };

  const deleteApplication = (jobId) => {
    setUser(prev => {
      const existing = prev.appliedJobs || [];
      return {
        ...prev,
        appliedJobs: existing.filter(job => job.id !== jobId)
      };
    });
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser({ name: '', phone: '', targetRole: '', isAuthenticated: false, isNewUser: false, appliedJobs: [] });
  };

  const loginAsInstitution = (data) => {
    const institutionUser = {
      name: data?.name || 'Admin',
      phone: data?.email || 'admin@institution.edu',
      role: 'INSTITUTION',
      isAuthenticated: true,
      isNewUser: false
    };
    setUser(institutionUser);
  };

  return (
    <AuthContext.Provider value={{ user, sendOtp, verifyOtp, completeProfile, logout, magicLogin, applyJob, deleteApplication, loginAsInstitution }}>
      {children}
    </AuthContext.Provider>
  );
};
