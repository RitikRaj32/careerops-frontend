import React, { createContext, useState, useContext, useEffect } from 'react';
import { useUser, useClerk, useAuth as useClerkAuth } from '@clerk/react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const STORAGE_KEY = 'careerai_user';

export const AuthProvider = ({ children }) => {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const { getToken } = useClerkAuth();
  
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to restore session', e);
    }
    return {
      isAuthenticated: false,
      isNewUser: false,
      appliedJobs: []
    };
  });

  // Sync Clerk with Backend securely using JWT
  useEffect(() => {
    const syncUser = async () => {
      // Prevent Clerk from overwriting an active Institution session
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.role === 'INSTITUTION') return;
        }
      } catch (e) {}

      console.log('--- syncUser started ---');
      console.log('isLoaded:', isLoaded, 'isSignedIn:', isSignedIn, 'clerkUser:', !!clerkUser);
      if (isLoaded && isSignedIn && clerkUser) {
        let email = clerkUser.primaryEmailAddress?.emailAddress || 
                    (clerkUser.emailAddresses && clerkUser.emailAddresses.length > 0 ? clerkUser.emailAddresses[0].emailAddress : null);
        
        // Fallback for phone-only users so they don't break the app
        if (!email) {
          const phone = clerkUser.primaryPhoneNumber?.phoneNumber || clerkUser.phoneNumbers?.[0]?.phoneNumber;
          if (phone) {
            email = `${phone}@phone-user.com`;
          } else {
            email = `${clerkUser.id}@clerk-user.com`;
          }
        }

        console.log('Extracted email:', email);
        if (!email) {
          console.error('SYNC ABORTED: No email found on clerkUser!', clerkUser);
          return;
        }
        
        try {
          const token = await getToken();
          console.log('Got Clerk token:', !!token);
          const res = await fetch((import.meta.env.VITE_API_URL || "") + '/api/auth/sync', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              email,
              firstName: clerkUser.firstName,
              lastName: clerkUser.lastName,
              imageUrl: clerkUser.imageUrl
            })
          });
          const data = await res.json();
          console.log("Sync response from backend:", data); // DEBUG LOG
          
          if (data.success) {
            const dbUser = data.user;
            console.log("Setting user context to:", dbUser); // DEBUG LOG
            setUser(prev => ({
              ...prev,
              ...dbUser,
              isAuthenticated: true,
              isNewUser: !dbUser.isOnboarded
            }));
          }
        } catch (err) {
          console.error("Sync error:", err);
        }
      } else if (isLoaded && !isSignedIn) {
        setUser({ isAuthenticated: false, isNewUser: false, appliedJobs: [] });
      }
    };
    
    syncUser();
  }, [isLoaded, isSignedIn, clerkUser, getToken]);

  useEffect(() => {
    if (user.isAuthenticated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const completeProfile = async (profileData) => {
    try {
      const token = await getToken();
      await fetch((import.meta.env.VITE_API_URL || "") + '/api/users/profile', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: user.email, ...profileData })
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

  const logout = async () => {
    await signOut();
    localStorage.removeItem(STORAGE_KEY);
    setUser({ isAuthenticated: false, isNewUser: false, appliedJobs: [] });
  };

  const loginAsInstitution = (data) => {
    const institutionUser = {
      name: data?.name || 'Admin',
      email: data?.email || 'admin@institution.edu',
      role: 'INSTITUTION',
      isAuthenticated: true,
      isNewUser: false
    };
    setUser(institutionUser);
  };

  return (
    <AuthContext.Provider value={{ user, completeProfile, logout, applyJob, deleteApplication, loginAsInstitution }}>
      {children}
    </AuthContext.Provider>
  );
};
