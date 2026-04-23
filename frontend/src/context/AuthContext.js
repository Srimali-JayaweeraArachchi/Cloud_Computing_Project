import React, { createContext, useMemo, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('food-ordering-user');

    if (storedUser) {
      return JSON.parse(storedUser);
    }

    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      return null;
    }

    try {
      const decoded = JSON.parse(atob(storedToken.split('.')[1]));
      return {
        id: decoded.id,
        role: decoded.role,
      };
    } catch (error) {
      return null;
    }
  });

  const login = (payload) => {
    localStorage.setItem('token', payload.token);
    localStorage.setItem('food-ordering-user', JSON.stringify(payload.user));
    setToken(payload.token);
    setUser(payload.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('food-ordering-user');
    setToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({
    user,
    token,
    isAuthenticated: Boolean(token),
    login,
    logout,
  }), [token, user]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
