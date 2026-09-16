import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => {
    const token = localStorage.getItem('jwtToken') || '';
    const role = localStorage.getItem('authRole') || '';
    const userRaw = localStorage.getItem('authUser');
    const user = userRaw ? JSON.parse(userRaw) : null;
    return { token, role, user };
  });

  useEffect(() => {
    if (authState.token) {
      localStorage.setItem('jwtToken', authState.token);
    } else {
      localStorage.removeItem('jwtToken');
    }

    if (authState.user) {
      localStorage.setItem('authUser', JSON.stringify(authState.user));
    } else {
      localStorage.removeItem('authUser');
    }

    if (authState.role) {
      localStorage.setItem('authRole', authState.role);
    } else {
      localStorage.removeItem('authRole');
    }
  }, [authState]);

  const setAuthData = ({ token = '', user = null, role = '' }) => {
    setAuthState({ token, user, role });
  };

  const logout = () => {
    setAuthState({ token: '', user: null, role: '' });
  };

  return (
    <AuthContext.Provider
      value={{
        token: authState.token,
        user: authState.user,
        role: authState.role,
        isAuthenticated: Boolean(authState.token || authState.user),
        setAuthData,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

export default AuthContext;