import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const UserAuthContext = createContext(null);

export function UserAuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('userToken') || '');
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('userAuthUser');
    return raw ? JSON.parse(raw) : null;
  });
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      localStorage.setItem('userToken', token);
    } else {
      localStorage.removeItem('userToken');
      setProfile(null);
    }

    if (user) {
      localStorage.setItem('userAuthUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('userAuthUser');
    }
  }, [token, user]);

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      if (token && user) {
        try {
          const { data } = await api.get('/student-profiles/me');
          if (isMounted) setProfile(data);
        } catch (error) {
          console.error("Failed to fetch profile", error);
          if (error?.response?.status === 401 || error?.response?.status === 403) {
            if (isMounted) {
              setToken('');
              setUser(null);
              setProfile(null);
            }
          }
        }
      } else {
        if (isMounted) setProfile(null);
      }
      if (isMounted) setLoading(false);
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [token, user]);

  const login = (nextToken, nextUser = null) => {
    setToken(nextToken || '');
    setUser(nextUser);
  };

  const logout = () => {
    setToken('');
    setUser(null);
    setProfile(null);
  };

  const updateProfileContext = (updatedProfile) => {
    setProfile(updatedProfile);
  };

  return (
    <UserAuthContext.Provider
      value={{
        token,
        user,
        profile,
        loading,
        isAuthenticated: Boolean(token),
        login,
        logout,
        updateProfileContext
      }}
    >
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUserAuth() {
  const context = useContext(UserAuthContext);

  if (!context) {
    throw new Error('useUserAuth must be used within a UserAuthProvider');
  }

  return context;
}

export default UserAuthContext;