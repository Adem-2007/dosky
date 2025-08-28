import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Mail, Github, Sparkles } from 'lucide-react';

// The toggle is now a tactile, rotating rune.
const RunicToggle = ({ isSignUp, setIsSignUp }) => (
  <button 
    onClick={() => setIsSignUp(!isSignUp)} 
    className="relative w-48 h-10 flex items-center justify-center font-semibold text-[#00F5D4] focus:outline-none"
  >
    <AnimatePresence initial={false}>
      <motion.span
        key={isSignUp ? 'signup' : 'login'}
        className="absolute"
        initial={{ rotateX: 90, opacity: 0 }}
        animate={{ rotateX: 0, opacity: 1 }}
        exit={{ rotateX: -90, opacity: 0 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
      >
        {isSignUp ? "Join the Scribes" : "Consult the Oracle"}
      </motion.span>
    </AnimatePresence>
  </button>
);


// The input field is now an enchanted artifact.
const EnchantedInput = ({ icon, label, type, onFocus, onBlur }) => {
  return (
    <div className="relative group">
      <div className="absolute top-1/2 -translate-y-1/2 left-4 text-[#989FB3] group-focus-within:text-[#00F5D4] transition-colors">
        {icon}
      </div>
      <input 
        type={type}
        placeholder={label}
        onFocus={onFocus}
        onBlur={onBlur}
        className="w-full bg-[#0D1117]/50 text-[#E6E6FA] pl-12 pr-4 py-4 border-2 border-[#989FB3]/20 rounded-lg focus:outline-none placeholder:text-[#989FB3]/60 transition-colors"
      />
      {/* The animated border on focus */}
      <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-[#00F5D4] to-[#FF6B6B] opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm" />
      <div className="absolute inset-0 bg-[#0D1117] rounded-lg" />
      <div className="relative"> {/* Re-stack input on top */}
         <div className="absolute top-1/2 -translate-y-1/2 left-4 text-[#989FB3] group-focus-within:text-[#00F5D4] transition-colors">
            {icon}
        </div>
        <input 
            type={type}
            placeholder={label}
            onFocus={onFocus}
            onBlur={onBlur}
            className="w-full bg-transparent text-[#E6E6FA] pl-12 pr-4 py-4 rounded-lg focus:outline-none placeholder:text-transparent"
        />
      </div>
    </div>
  )
};


const AuthForm = ({ setActiveField }) => {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <motion.div 
      className="w-full max-w-md bg-[#1D2335]/50 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl shadow-[#00F5D4]/10 p-8"
      key={isSignUp ? 'signup' : 'login'}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} // A more dramatic ease
    >
      <div className="text-center mb-8">
        <RunicToggle isSignUp={isSignUp} setIsSignUp={setIsSignUp} />
      </div>

      <form className="space-y-6">
        <AnimatePresence>
          {isSignUp && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: '24px' }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            >
              <EnchantedInput icon={<User size={20} />} label="Your Scribe Name" type="text" onFocus={() => setActiveField('name')} onBlur={() => setActiveField('idle')} />
            </motion.div>
          )}
        </AnimatePresence>

        <EnchantedInput icon={<Mail size={20} />} label="Your Invocation Email" type="email" onFocus={() => setActiveField('email')} onBlur={() => setActiveField('idle')} />
        <EnchantedInput icon={<Lock size={20} />} label="Your Secret Word" type="password" onFocus={() => setActiveField('password')} onBlur={() => setActiveField('idle')} />

        <motion.button 
          type="submit"
          className="w-full py-4 bg-gradient-to-r from-[#FF6B6B] to-[#ff8a80] text-white font-bold rounded-lg shadow-lg shadow-[#FF6B6B]/30 relative overflow-hidden"
          whileHover={{ scale: 1.02, y: -2, boxShadow: '0 10px 20px rgba(255, 107, 107, 0.4)' }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.div 
            className="absolute top-0 left-0 w-full h-full bg-white/20"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          />
          <span className="relative z-10">{isSignUp ? 'Begin Anew' : 'Enter the Sanctum'}</span>
        </motion.button>
      </form>

      <div className="flex items-center my-8">
        <div className="flex-grow border-t border-white/10"></div>
        <span className="flex-shrink mx-4 text-xs text-[#989FB3] uppercase">Or use a conduit</span>
        <div className="flex-grow border-t border-white/10"></div>
      </div>

      <div className="flex justify-center space-x-4">
        {[Github, Sparkles].map((Icon, i) => (
          <motion.button 
            key={i}
            className="p-3 bg-white/5 border border-white/10 rounded-full"
            whileHover={{ scale: 1.1, y: -3, background: 'rgba(255, 255, 255, 0.1)' }}
          >
            <Icon className="text-[#E6E6FA]" />
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default AuthForm;