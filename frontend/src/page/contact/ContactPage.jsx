import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiMail, FiSend, FiCheck, FiMessageCircle, FiAlertCircle } from 'react-icons/fi'; // Added FiAlertCircle
import AnimatedContactInfo from './components/AnimatedContactInfo';

const PALETTE = {
  background: '#F8F5F2',
  text: '#1a2e3b',
  accent: '#FF6B6B',
  primary: '#008080',
  lightGray: '#d1d5db',
  white: '#FFFFFF',
  success: '#27ae60',
  error: '#e74c3c', // Added error color
};

// SmartTextarea component remains unchanged...
const SmartTextarea = ({ id, placeholder, value, onChange, maxLength }) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value.length > 0;
  const charsLeft = maxLength - value.length;
  const width = 450;
  const height = 168;

  const borderVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { pathLength: 1, opacity: 1, transition: { pathLength: { type: "spring", duration: 1.5, bounce: 0 }, opacity: { duration: 0.1 } } }
  };

  return (
    <div className="relative mt-4">
      <motion.label htmlFor={id} className="absolute left-3 -top-3 px-1" style={{ background: PALETTE.white, color: PALETTE.primary, zIndex: 10 }} animate={{ y: isFocused || hasValue ? 0 : 28, scale: isFocused || hasValue ? 0.85 : 1, x: isFocused || hasValue ? 0 : 10, color: isFocused ? PALETTE.primary : PALETTE.lightGray }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
        {placeholder}
      </motion.label>
      <motion.div className="absolute top-4 right-4 z-10" animate={{ scale: isFocused ? 1.1 : 1, color: isFocused ? PALETTE.primary : PALETTE.lightGray }} transition={{ type: 'spring', stiffness: 400, damping: 10 }}>
        <FiMessageCircle />
      </motion.div>
      <textarea id={id} value={value} onChange={onChange} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} rows="6" maxLength={maxLength} className="w-full bg-transparent p-4 outline-none rounded-xl resize-none relative z-0" style={{ color: PALETTE.text, borderColor: isFocused ? 'transparent' : PALETTE.lightGray, borderWidth: '2px', }} />
      <motion.svg className="absolute top-0 left-0 w-full h-full pointer-events-none" fill="none" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" initial="hidden" animate={isFocused ? "visible" : "hidden"} style={{ zIndex: 5 }}>
        <motion.rect x="1" y="1" width={width - 2} height={height - 2} rx="11" stroke={PALETTE.primary} strokeWidth="2" variants={borderVariants} />
      </motion.svg>
      <AnimatePresence>
        {(isFocused || value.length > 0) && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.3 }} className="absolute -bottom-5 right-1 text-xs" style={{ color: charsLeft < 20 ? PALETTE.accent : PALETTE.text, opacity: 0.8 }}>
            {charsLeft}/{maxLength}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle'); // 'idle', 'sending', 'success', 'error'
  const [feedback, setFeedback] = useState(''); // To hold success or error messages

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };
  
  // --- MODIFIED: handleSubmit now makes a real API call ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    setFeedback('');

    try {
      const response = await fetch('http://localhost:5000/api/contact/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong.');
      }

      setStatus('success');
      setFeedback('Message Sent!');
    } catch (error) {
      setStatus('error');
      setFeedback(error.message);
    }
  };

  useEffect(() => {
    // Reset form after success or error message has been shown
    if (status === 'success' || status === 'error') {
      const timer = setTimeout(() => {
        setStatus('idle');
        if (status === 'success') {
          setFormData({ name: '', email: '', message: '' }); // Clear form only on success
        }
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  return (
    <div className="min-h-screen" style={{ background: PALETTE.background, color: PALETTE.text }}>
      <div className="container mx-auto px-6 py-20 lg:py-32">
        <motion.div initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-serif">Get In Touch</h1>
          <p className="mt-4 text-lg max-w-2xl mx-auto opacity-70">
            Have a question or a project in mind? We'd love to hear from you.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <motion.div className="lg:pt-8" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}>
            <AnimatedContactInfo />
          </motion.div>
          
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }} className="p-8 rounded-xl border border-gray-200" style={{backgroundColor: PALETTE.white}}>
            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="relative">
                    <FiUser className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-400" />
                    <input id="name" type="text" placeholder="Your Name" required value={formData.name} onChange={handleInputChange} className="w-full pl-10 p-3 bg-transparent border-b-2 outline-none focus:border-teal-500" style={{borderColor: PALETTE.lightGray}}/>
                </div>
                <div className="relative">
                    <FiMail className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-400" />
                    <input id="email" type="email" placeholder="Your Email" required value={formData.email} onChange={handleInputChange} className="w-full pl-10 p-3 bg-transparent border-b-2 outline-none focus:border-teal-500" style={{borderColor: PALETTE.lightGray}}/>
                </div>
                
                <SmartTextarea id="message" placeholder="Your Message" required value={formData.message} onChange={handleInputChange} maxLength={500} />
                
                <div className="pt-2">
                  <button type="submit" disabled={status === 'sending'} className="w-full h-16 rounded-xl font-semibold text-lg flex items-center justify-center overflow-hidden relative transition-all duration-300 shadow-lg hover:shadow-xl" style={{ background: status === 'success' ? PALETTE.success : (status === 'error' ? PALETTE.error : PALETTE.accent), color: PALETTE.white }}>
                    <AnimatePresence mode="wait">
                      {status === 'idle' && ( <motion.span key="idle" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="flex items-center gap-2"> <FiSend /> Send Message </motion.span> )}
                      {status === 'sending' && ( <motion.div key="sending" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="absolute"> <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div> </motion.div> )}
                      {status === 'success' && ( <motion.span key="success" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="flex items-center gap-2"> <FiCheck /> {feedback} </motion.span> )}
                      {status === 'error' && ( <motion.span key="error" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="flex items-center gap-2"> <FiAlertCircle /> {feedback} </motion.span> )}
                    </AnimatePresence>
                  </button>
                </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;