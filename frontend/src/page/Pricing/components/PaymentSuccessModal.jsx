// src/page/Pricing/components/PaymentSuccessModal.jsx
// (Create a new file for this component)

import React from 'react';
import { motion } from 'framer-motion';
import { Rocket } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.3 }
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

// A simple, lightweight confetti component
const ConfettiPiece = ({ x, y, rotate, color }) => (
  <motion.div
    className="absolute w-2 h-4 rounded-full"
    style={{ backgroundColor: color, x, y, rotate }}
    initial={{ opacity: 0, y: -20, scale: 0 }}
    animate={{ 
      opacity: [1, 1, 0], 
      y: [0, 100, 150],
      scale: 1,
      transition: { duration: Math.random() * 2 + 1, ease: "linear", delay: 0.5 }
    }}
  />
);

const PaymentSuccessModal = ({ onClose, planName }) => {
  const confettiColors = ['#0D9488', '#5EEAD4', '#99F6E4', '#A3A3A3'];
  const numConfetti = 50;

  return (
    <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring", damping: 15 }}
        className="relative bg-[#F9F7F5] border border-teal-500/30 rounded-2xl shadow-2xl shadow-teal-500/10 w-full max-w-md text-center p-8 overflow-hidden"
      >
        {/* Confetti Explosion */}
        {Array.from({ length: numConfetti }).map((_, i) => (
          <ConfettiPiece
            key={i}
            x={(Math.random() - 0.5) * 400}
            y={(Math.random() - 0.5) * 200}
            rotate={Math.random() * 360}
            color={confettiColors[i % confettiColors.length]}
          />
        ))}

        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <motion.div variants={itemVariants} className="flex justify-center">
            <svg className="w-24 h-24 text-teal-500" viewBox="0 0 52 52">
              <motion.path
                fill="none"
                strokeWidth="3"
                stroke="currentColor"
                d="M14 27l6.5 6.5L38 16"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              />
              <motion.circle
                cx="26" cy="26" r="25"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                initial={{ strokeDasharray: "0, 157", opacity: 0 }}
                animate={{ strokeDasharray: "157, 157", opacity: 1 }}
                transition={{ duration: 1, ease: "easeInOut" }}
              />
            </svg>
          </motion.div>

          <motion.h2 variants={itemVariants} className="text-3xl font-bold text-gray-800 mt-6">
            Upgrade Complete!
          </motion.h2>

          <motion.p variants={itemVariants} className="text-gray-600 mt-2">
            Welcome to the <span className="font-bold text-teal-600">{planName}</span> plan. Your new features are now unlocked.
          </motion.p>

          <motion.div variants={itemVariants}>
            <button
              onClick={onClose}
              className="mt-8 w-full bg-[#0D9488] text-white font-bold py-3 rounded-lg flex items-center justify-center space-x-2 relative overflow-hidden shadow-lg shadow-teal-500/20"
              whileHover={{ scale: 1.05, boxShadow: '0px 10px 30px rgba(13, 148, 136, 0.25)' }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Rocket size={20} />
              <span>Start Exploring</span>
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccessModal;