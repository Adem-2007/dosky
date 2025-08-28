// VerifyPage.jsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext'; // Make sure this path is correct
import { useLocation } from 'wouter';
import { FiKey } from 'react-icons/fi';

const PALETTE = {
  background: '#F8F5F2',
  text: '#1a2e3b',
  accent: '#FF6B6B',
  primary: '#008080',
  white: '#FFFFFF',
};

const VerifyPage = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const { login } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Extract email from URL query parameter
    const searchParams = new URLSearchParams(window.location.search);
    const userEmail = searchParams.get('email');
    if (userEmail) {
      setEmail(userEmail);
    } else {
      setError('Email not found. Please try registering again.');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Could not find user email. Please go back and register again.');
      return;
    }

    try {
      // =================================================================
      // THIS IS THE CORRECTED PART
      // =================================================================
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_URL}/api/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, verificationCode: code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      login(data); // Log the user in
      setLocation('/'); // Redirect to home page

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: PALETTE.background }}>
      <motion.div
        className="w-full max-w-md p-8 sm:p-12 bg-white rounded-2xl shadow-xl"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 className="text-4xl font-serif mb-2" style={{ color: PALETTE.text }}>
          Verify Your Account
        </h1>
        <p className="text-gray-500 mb-8">
          A 6-digit code has been sent to <strong>{email}</strong>.
        </p>

        <form className="space-y-8" onSubmit={handleSubmit}>
          <div className="relative">
            <FiKey size={20} className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-400" />
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter verification code"
              className="w-full bg-transparent border-b-2 pl-10 pr-3 py-2 outline-none focus:border-teal-500"
              style={{ borderColor: '#d1d5db' }}
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <motion.button
            whileHover={{ scale: 1.02, boxShadow: `0px 10px 20px -5px ${PALETTE.accent}55` }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 rounded-lg font-semibold text-lg flex items-center justify-center gap-2"
            style={{ background: PALETTE.accent, color: PALETTE.white }}
            type="submit"
          >
            <span>Verify & Sign In</span>
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default VerifyPage;