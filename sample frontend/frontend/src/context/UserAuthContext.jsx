import React, { createContext, useContext, useEffect, useState } from 'react';

const UserAuthContext = createContext(null);

export function UserAuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('userToken') || '');
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('userAuthUser');
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem('userToken', token);
    } else {
      localStorage.removeItem('userToken');
    }

    if (user) {
      localStorage.setItem('userAuthUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('userAuthUser');
    }
  }, [token, user]);

  const login = (nextToken, nextUser = null) => {
    setToken(nextToken || '');
    setUser(nextUser);
  };

  const logout = () => {
    setToken('');
    setUser(null);
  };

  return (
    <UserAuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: Boolean(token),
        login,
        logout,
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