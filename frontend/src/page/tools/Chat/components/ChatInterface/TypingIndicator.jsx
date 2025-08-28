// src/pages/Tools/Chat/components/ChatInterface/TypingIndicator.jsx
import React from 'react';
import { motion } from 'framer-motion';

const indicatorVariants = {
  initial: { y: 0 },
  animate: {
    y: [0, -8, 0],
    transition: {
      duration: 1.2,
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
};

const TypingIndicator = () => {
  return (
    <motion.div
      className="flex items-center justify-center gap-1.5 p-4"
      initial="initial"
      animate="animate"
    >
      <motion.span
        className="h-2 w-2 rounded-full bg-[#2C3A47]/50"
        variants={indicatorVariants}
        transition={{ ...indicatorVariants.animate.transition, delay: 0 }}
      />
      <motion.span
        className="h-2 w-2 rounded-full bg-[#2C3A47]/50"
        variants={indicatorVariants}
        transition={{ ...indicatorVariants.animate.transition, delay: 0.2 }}
      />
      <motion.span
        className="h-2 w-2 rounded-full bg-[#2C3A47]/50"
        variants={indicatorVariants}
        transition={{ ...indicatorVariants.animate.transition, delay: 0.4 }}
      />
    </motion.div>
  );
};

export default TypingIndicator;