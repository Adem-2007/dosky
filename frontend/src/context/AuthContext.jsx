// src/context/AuthContext.jsx (Corrected and Rewritten)

import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      // Check localStorage first for persistent sessions
      const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from storage", error);
      // Clear storage in case of corrupted data
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

  /**
   * Fetches the latest user profile from the backend.
   * This function is now crucial for confirming subscription updates.
   * @returns {Promise<object|null>} The updated user object or null if it fails.
   */
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
        // If the token is expired or invalid, log the user out
        if (response.status === 401) {
          logout();
        }
        throw new Error('Could not refresh user data.');
      }

      const updatedUserData = await response.json();
      
      const wasRemembered = !!localStorage.getItem('user');
      const finalUserData = { ...updatedUserData, token: storedUser.token };
      
      // Update the global state and storage
      login(finalUserData, wasRemembered);
      
      // --- CRITICAL CHANGE: Return the newly fetched user data ---
      // This allows the polling function in PaymentModal to inspect the new data.
      return finalUserData; 
      
    } catch (error) {
      console.error(error);
      return null; // Return null on any failure
    }
  };

  const value = { user, login, logout, loading, refreshUser };

  return (
    <AuthContext.Provider value={value}>
      {/* Render children only when the initial user check is complete */}
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};