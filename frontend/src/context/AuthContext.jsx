// AuthContext.jsx

import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      // Check localStorage first, then fall back to sessionStorage
      const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from storage", error);
      // Clear both just in case of corrupted data
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  // MODIFIED: `login` now accepts a `rememberMe` flag
  const login = (userData, rememberMe = false) => {
    // Decide which storage to use
    if (rememberMe) {
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      sessionStorage.setItem('user', JSON.stringify(userData));
    }
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    // Clear from both storages on logout to be safe
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
  };

  // NEW: Function to fetch the latest user data from the backend
  const refreshUser = async () => {
    const storedUserString = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!storedUserString) {
      return; // No user data, can't refresh
    }
    
    const storedUser = JSON.parse(storedUserString);
    if (!storedUser?.token) {
      return; // No token, can't refresh
    }
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${storedUser.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Could not refresh user data.');
      }

      const updatedUserData = await response.json();
      // Combine with existing token and use the login function to update state.
      // We check if the original session was in localStorage to persist the "remember me" choice.
      const wasRemembered = !!localStorage.getItem('user');
      login({ ...updatedUserData, token: storedUser.token }, wasRemembered);

    } catch (error) {
      console.error(error);
      // Optional: handle token expiration by logging the user out
      // logout();
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