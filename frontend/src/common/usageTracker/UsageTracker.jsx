import React from 'react';
import { motion } from 'framer-motion';

const UsageTracker = ({ uploadCount, limit, planName }) => {
  // --- MODIFIED: The definition of "unlimited" is now based on the plan name. ---
  // This is necessary because your backend now sends a number (500) for the Premium plan, not null.
  const isUnlimited = planName === 'Premium';

  const percentage = isUnlimited ? 100 : Math.min((uploadCount / limit) * 100, 100);

  const getBarColor = () => {
    if (isUnlimited) return 'bg-[#0A7C8A]'; // Green for unlimited
    if (percentage > 90) return 'bg-red-500';
    if (percentage > 70) return 'bg-yellow-500';
    return 'bg-[#0A7C8A]';
  };

  return (
    <motion.div 
      className="w-full max-w-md p-6 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-lg text-[#2C3A47]">Monthly Usage</h3>
        {/* Make plan name dynamic and styled */}
        <span className={`px-3 py-1 text-xs font-semibold ${isUnlimited ? 'text-purple-700 bg-purple-100' : 'text-orange-700 bg-orange-100'} rounded-full`}>
            {planName} Plan
        </span>
      </div>
      
      <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden mt-4">
        <motion.div
          className={`absolute top-0 left-0 h-full rounded-full ${getBarColor()}`}
          initial={{ width: '0%' }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      <div className="flex justify-between items-end mt-2 text-sm text-[#2C3A47]/80">
        <p>Uploaded: <span className="font-bold text-[#2C3A47]">{uploadCount}</span></p>
        <p>Limit: 
          {/* Display "Unlimited" text based on the new logic */}
          {isUnlimited ? (
            <span className="font-bold text-[#0A7C8A] ml-1">Unlimited</span>
          ) : (
            <span className="font-bold text-[#2C3A47]">{limit}</span>
          )}
        </p>
      </div>
    </motion.div>
  );
};

export default UsageTracker;