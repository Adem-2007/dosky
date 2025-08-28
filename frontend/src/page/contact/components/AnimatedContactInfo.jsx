import React, { useState } from 'react';
import { motion } from 'framer-motion'; // AnimatePresence is no longer needed here
import { FiMail, FiHeadphones, FiBriefcase } from 'react-icons/fi';

const PALETTE = {
  primary: '#008080',
  text: '#1a2e3b',
};

// =================================================================================
// 💡 THE CONTACT ITEM (REVISED): Using the "Interactive Highlight"
// Each item now features a clean, sweeping highlight on hover instead of scrambling text.
// =================================================================================
const ContactItem = ({ icon: Icon, title, detail }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Variants for the highlight div animation
  const highlightVariants = {
    initial: { x: '-101%' }, // Start fully to the left (hidden)
    hover: { x: 0 },         // Move to cover the text
  };

  return (
    <motion.a
      href={detail.startsWith('mailto:') ? detail : '#'}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative block cursor-pointer py-6"
    >
      <div className="flex items-center gap-5">
        <Icon className="w-8 h-8 flex-shrink-0" style={{ color: PALETTE.primary }} />
        <div>
          <h3 className="text-xl font-semibold" style={{ color: PALETTE.text }}>
            {title}
          </h3>
          {/* 
            This is the container for our text. 
            'relative' and 'overflow-hidden' are crucial for the highlight effect.
          */}
          <div className="relative overflow-hidden">
            {/* The actual text, with z-10 to ensure it's on top of the highlight */}
            <p className="relative z-10 text-lg opacity-70 transition-colors duration-300" style={{ color: isHovered ? PALETTE.primary : PALETTE.text }}>
              {detail.replace('mailto:', '')}
            </p>
            
            {/* THE NEW HIGHLIGHT ELEMENT */}
            <motion.div
              className="absolute top-0 left-0 w-full h-full z-0"
              style={{ background: PALETTE.primary, opacity: 0.1 }}
              variants={highlightVariants}
              initial="initial"
              animate={isHovered ? 'hover' : 'initial'}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* The animated underline remains, as it's a great piece of feedback */}
      <motion.div
        className="absolute bottom-0 left-0 h-0.5"
        style={{ background: PALETTE.primary }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isHovered ? 1 : 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      />
    </motion.a>
  );
};


// The main component that assembles the list. No changes needed here.
const AnimatedContactInfo = () => {
  const contactPoints = [
    { icon: FiMail, title: 'General Inquiries', detail: 'mailto:contact@cognipdf.com' },
    { icon: FiHeadphones, title: 'Technical Support', detail: 'mailto:support@cognipdf.com' },
    { icon: FiBriefcase, title: 'Partnerships & Media', detail: 'mailto:partners@cognipdf.com' },
  ];
  
  return (
    <div className="space-y-4">
      {contactPoints.map((item, index) => (
        <ContactItem key={index} {...item} />
      ))}
    </div>
  );
};

export default AnimatedContactInfo;