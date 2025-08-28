import React from 'react';
import { motion } from 'framer-motion';

// A single, glowing glyph that animates as if being written.
const AnimatedGlyph = ({ delay }) => {
  const pathLength = 1;
  return (
    <motion.path
      d="M10 80 C 40 10, 65 10, 95 80 S 150 150, 180 80" // A sample beautiful curve
      stroke="url(#glyphGradient)"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: pathLength, opacity: [0, 0.7, 0] }}
      transition={{
        pathLength: { delay, duration: 3, ease: "easeInOut" },
        opacity: { delay, duration: 3, ease: "linear" },
        repeat: Infinity,
        repeatDelay: 5
      }}
    />
  );
};

const LivingDocument = ({ activeField }) => {
  const coreColor = {
    idle: '#00F5D4',
    name: '#FF6B6B',
    email: '#4D96FF',
    password: '#F5A623'
  };

  return (
    <div className="relative w-[400px] h-[400px] flex items-center justify-center">
      {/* Core Gradient Definitions */}
      <svg width="0" height="0">
        <defs>
          <linearGradient id="glyphGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00F5D4" stopOpacity="0" />
            <stop offset="50%" stopColor="#00F5D4" stopOpacity="1" />
            <stop offset="100%" stopColor="#00F5D4" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* The pulsing Core */}
      <motion.div
        className="w-48 h-48 rounded-full absolute"
        animate={{ backgroundColor: coreColor[activeField] || coreColor.idle }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="w-full h-full bg-black/50 rounded-full blur-2xl" />
        <motion.div 
          className="w-full h-full rounded-full border-2 border-white/20 absolute top-0 left-0"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* Orbiting Data Rings */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-full h-full border rounded-full border-[#00F5D4]/20"
          style={{ rotate: Math.random() * 180 }}
          animate={{ 
            scale: 1 + i * 0.3,
            rotate: 360 + Math.random() * 180,
          }}
          transition={{
            duration: 20 + i * 15,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
      
      {/* Animated Glyphs being 'written' in the ether */}
      <svg viewBox="0 0 200 100" className="absolute w-full h-full opacity-40">
        {[...Array(5)].map((_, i) => (
          <AnimatedGlyph key={i} delay={i * 1.5} />
        ))}
      </svg>

      <div className="absolute font-mono text-center text-[#00F5D4]/80 text-xs">
        <p>ORACLE.SYS</p>
        <p>STATUS: <span className="font-bold">{activeField === 'idle' ? 'AWAITING INVOCATION' : `PROCESSING_${activeField.toUpperCase()}`}</span></p>
      </div>
    </div>
  );
};

export default LivingDocument;