// src/context/AuthContext.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from storage", error);
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData, rememberMe = false) => {
    if (rememberMe) {
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      sessionStorage.setItem('user', JSON.stringify(userData));
    }
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
  };

  const refreshUser = async () => {
    const storedUserString = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!storedUserString) return null;

    const storedUser = JSON.parse(storedUserString);
    if (!storedUser?.token) return null;

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_URL}/api/auth/profile`, {
        headers: { 'Authorization': `Bearer ${storedUser.token}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
          logout();
        }
        throw new Error('Could not refresh user data.');
      }

      const updatedUserData = await response.json();
      const wasRemembered = !!localStorage.getItem('user');
      const finalUserData = { ...updatedUserData, token: storedUser.token };

      login(finalUserData, wasRemembered);

      return finalUserData;

    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const value = { user, login, logout, loading, refreshUser };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};