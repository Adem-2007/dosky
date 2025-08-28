import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqData = [
  { q: "Can I change my plan later?", a: "Yes, you can upgrade, downgrade, or cancel your plan at any time from your account dashboard. Changes will be prorated." },
  { q: "What types of documents are supported?", a: "Currently, we support all versions of PDF files. We are working on adding support for .docx, .pptx, and other formats soon." },
  { q: "Is there a free trial for Pro features?", a: "The Starter plan is free forever. For Pro and Team features, we offer a 7-day, no-credit-card-required trial when you sign up." },
  { q: "How is my data privacy handled?", a: "We take privacy very seriously. Your documents are encrypted in transit and at rest. We never share your data or use it for training AI models without your explicit consent." },
];

const AccordionItem = ({ q, a }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border-b border-[#0A7C8A]/20">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center py-6 text-left"
      >
        <h3 className="text-lg font-medium text-[#2C3A47]">{q}</h3>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-6 h-6 text-[#0A7C8A]" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-[#2C3A47]/80">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


const FAQ = () => {
  return (
    <div className="py-24 bg-white/40">
      <div className="max-w-3xl mx-auto px-8">
        <h2 className="text-center text-4xl font-bold text-[#0A7C8A]">Frequently Asked Questions</h2>
        <div className="mt-12">
          {faqData.map(item => <AccordionItem key={item.q} q={item.q} a={item.a} />)}
        </div>
      </div>
    </div>
  );
};

export default FAQ;