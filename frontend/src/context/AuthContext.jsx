// src/context/AuthContext.jsx (Corrected and Rewritten)

import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // This loading state is crucial to prevent child components from rendering
  // before we have had a chance to check for a logged-in user.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      // Check both storages (persistent and session) to find the user data
      const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from storage", error);
      // Clear both storages in case of corrupted data
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
    } finally {
      // This ensures we only render the app after the check is complete
      setLoading(false);
    }
  }, []); // The empty dependency array means this runs only once on app startup

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
    // On logout, clear from both storages to be safe
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
        if (response.status === 401) { // Handle expired tokens by logging out
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
      {/* This prevents rendering components that rely on the user being logged in
          before we have confirmed their status. */}
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};