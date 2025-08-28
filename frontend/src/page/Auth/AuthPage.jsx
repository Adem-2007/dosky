// AuthPage.jsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiLock, FiMail, FiLogIn, FiUserPlus, FiLoader } from 'react-icons/fi';
import { useLocation } from 'wouter';
import { useAuth } from '../../context/AuthContext';


const PALETTE = {
  background: '#F8F5F2',
  text: '#1a2e3b',
  accent: '#FF6B6B',
  primary: '#008080',
  lightGray: '#d1d5db',
  white: '#FFFFFF',
};

// NEW: A reusable, animated toggle switch component
const CustomToggle = ({ checked }) => {
  return (
    <div
      className="w-10 h-5 flex items-center rounded-full p-0.5 transition-colors"
      style={{
        backgroundColor: checked ? PALETTE.primary : PALETTE.lightGray,
        justifyContent: checked ? 'flex-end' : 'flex-start'
      }}
    >
      <motion.div
        className="w-4 h-4 bg-white rounded-full"
        layout
        transition={{ type: "spring", stiffness: 700, damping: 30 }}
      />
    </div>
  );
};

const AnimatedVisualPanel = () => {
  const shards = Array.from({ length: 15 });
  return (
    <motion.div
      initial={{ clipPath: 'polygon(0 0, 0% 0, 0% 100%, 0 100%)' }}
      animate={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
      transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
      className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-[#008080] to-[#005f5f] relative overflow-hidden"
    >
      <div className="absolute inset-0">
        {shards.map((_, i) => {
          const size = Math.random() * 150 + 50;
          const duration = Math.random() * 10 + 10;
          const delay = Math.random() * 5;
          return (
            <motion.div
              key={i}
              className="absolute rounded-lg bg-white/10"
              initial={{ x: `${Math.random() * 100}vw`, y: `${Math.random() * 100}vh`, opacity: 0, scale: Math.random() * 0.5 + 0.5, rotate: Math.random() * 360 }}
              animate={{ x: `calc(${Math.random() * 100}vw - 50%)`, y: `calc(${Math.random() * 100}vh - 50%)`, opacity: [0, 1, 0], scale: Math.random() * 0.5 + 0.5, rotate: Math.random() * 360 }}
              transition={{ duration, delay, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
              style={{ width: `${size}px`, height: `${size}px` }}
            />
          );
        })}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
        <div className="text-center text-white p-8">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }} className="font-serif text-5xl tracking-tight">
            Unlock the Narrative.
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.7, ease: 'easeOut' }} className="mt-4 text-lg max-w-sm mx-auto opacity-80">
            Your account is the key to transforming static documents into dynamic conversations.
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
};

const AnimatedInput = ({ id, type, placeholder, icon: Icon, value, onChange }) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value.length > 0;
  return (
    <div className="relative">
      <div className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-400">
        <Icon size={20} />
      </div>
      <motion.label htmlFor={id} className="absolute left-10 cursor-text" animate={{ y: isFocused || hasValue ? -22 : 0, scale: isFocused || hasValue ? 0.8 : 1, color: isFocused ? PALETTE.primary : PALETTE.lightGray }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} style={{ originX: 0 }}>
        {placeholder}
      </motion.label>
      <input id={id} type={type} value={value} onChange={onChange} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} className="w-full bg-transparent border-b-2 pl-10 pr-3 py-2 outline-none" style={{ borderColor: PALETTE.lightGray }} />
      <motion.div className="absolute bottom-0 left-0 w-full h-0.5" style={{ background: PALETTE.primary }} initial={{ scaleX: 0 }} animate={{ scaleX: isFocused ? 1 : 0 }} transition={{ duration: 0.3, ease: 'easeOut' }} />
    </div>
  );
};

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const [, setLocation] = useLocation();

  const formVariants = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { staggerChildren: 0.1, duration: 0.5, ease: "easeOut" }},
    exit: { opacity: 0, y: -30, transition: { duration: 0.3, ease: "easeIn" }}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // =================================================================
    // THIS IS THE CORRECTED PART
    // =================================================================
    const API_URL = import.meta.env.VITE_API_URL;
    const url = isSignUp ? `${API_URL}/api/auth/register` : `${API_URL}/api/auth/login`;
    const payload = isSignUp ? { name, email, password } : { email, password };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'An error occurred.');

      if (isSignUp) {
        setLocation(`/verify?email=${email}`);
      } else {
        login(data, rememberMe);
        setLocation('/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen" style={{ background: PALETTE.background }}>
      <AnimatedVisualPanel />
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md">
          <motion.div initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
            <h1 className="text-4xl font-serif mb-2" style={{ color: PALETTE.text }}>
              {isSignUp ? 'Create Your Account' : 'Welcome Back'}
            </h1>
            <p className="text-gray-500 mb-8">
              {isSignUp ? 'Join us to bring your documents to life.' : 'Sign in to continue your work.'}
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.form
              key={isSignUp ? 'signup' : 'signin'}
              variants={formVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-8"
              onSubmit={handleSubmit}
            >
              {isSignUp && ( <motion.div variants={formVariants}><AnimatedInput id="name" type="text" placeholder="Full Name" icon={FiUser} value={name} onChange={(e) => setName(e.target.value)} /></motion.div> )}
              <motion.div variants={formVariants}><AnimatedInput id="email" type="email" placeholder="Email Address" icon={FiMail} value={email} onChange={(e) => setEmail(e.target.value)} /></motion.div>
              <motion.div variants={formVariants}><AnimatedInput id="password" type="password" placeholder="Password" icon={FiLock} value={password} onChange={(e) => setPassword(e.target.value)} /></motion.div>

              {!isSignUp && (
                <motion.div variants={formVariants} className="flex items-center justify-between text-sm">
                   <label
                     className="flex items-center gap-2 text-gray-600 cursor-pointer"
                     onClick={() => setRememberMe(!rememberMe)}
                   >
                     <CustomToggle checked={rememberMe} />
                     Remember Me
                   </label>
                   <a href="#" className="font-semibold hover:underline" style={{ color: PALETTE.primary }}>
                     Forgot password?
                   </a>
                </motion.div>
              )}

              {error && <p className="text-red-500 text-sm text-center -my-4">{error}</p>}
              <motion.div variants={formVariants}>
                <motion.button
                  type="submit"
                  whileHover={{ scale: isLoading ? 1 : 1.02, boxShadow: `0px 10px 20px -5px ${PALETTE.accent}55` }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  className="w-full py-3 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 transition-opacity duration-300"
                  style={{ background: PALETTE.accent, color: PALETTE.white }}
                  disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                            <FiLoader />
                          </motion.div>
                          <span>Processing...</span>
                        </>
                    ) : (
                        <>
                          {isSignUp ? <FiUserPlus/> : <FiLogIn/>}
                          <span>{isSignUp ? 'Sign Up' : 'Sign In'}</span>
                        </>
                    )}
                </motion.button>
              </motion.div>
            </motion.form>
          </AnimatePresence>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 1 }} className="mt-8 text-center">
            <p className="text-gray-600">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button onClick={() => { setIsSignUp(!isSignUp); setError(''); }} className="font-semibold hover:underline" style={{ color: PALETTE.primary }}>
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;