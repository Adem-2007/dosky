// src/page/Pricing/components/PaymentCancelModal.jsx
// (Create a new file for this component)

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};


const PaymentCancelModal = ({ onClose, onRetry }) => {
  return (
    <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring", damping: 15 }}
        className="relative bg-[#F9F7F5] border border-amber-400/50 rounded-2xl shadow-2xl shadow-amber-400/10 w-full max-w-md text-center p-8 overflow-hidden"
      >
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          
          <motion.div variants={itemVariants} className="flex justify-center">
             <div className="w-20 h-20 flex items-center justify-center bg-amber-400/10 rounded-full">
                <AlertTriangle size={40} className="text-amber-500" />
             </div>
          </motion.div>

          <motion.h2 variants={itemVariants} className="text-3xl font-bold text-gray-800 mt-6">
            Payment Issue
          </motion.h2>

          <motion.p variants={itemVariants} className="text-gray-600 mt-2">
            It seems there was a problem with your transaction. Please don't worry, you have not been charged.
          </motion.p>

          <motion.div variants={itemVariants} className="mt-8 flex flex-col sm:flex-row gap-4">
            <button
              onClick={onClose}
              className="w-full bg-gray-200 hover:bg-gray-300 transition-colors text-gray-800 font-bold py-3 rounded-lg"
            >
              Close
            </button>
            <button
              onClick={onRetry}
              className="w-full bg-amber-400 hover:bg-amber-500 text-white font-bold py-3 rounded-lg flex items-center justify-center space-x-2 relative overflow-hidden shadow-lg shadow-amber-500/20"
              whileHover={{ scale: 1.05, boxShadow: '0px 10px 30px rgba(245, 158, 11, 0.25)' }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <RefreshCw size={18} />
              <span>Try Again</span>
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PaymentCancelModal;