// src/components/Navbar/Navbar.jsx (Corrected)

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquareText, 
  LogOut, 
  Crown, 
  LayoutDashboard, 
  Tag, 
  Mail,
  User,
  LogIn,
  Menu,
  X,
  Star // Using a Star for the Starter plan
} from 'lucide-react';
import { useLocation, Link } from 'wouter';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();

  const isFixedPage = location === '/' || location === '/pricing' || location === '/contact';

  const toggleMenu = () => setIsOpen(!isOpen);

  useEffect(() => {
    if (isFixedPage) {
      const handleScroll = () => setScrolled(window.scrollY > 10);
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    } else {
      setScrolled(false);
    }
  }, [isFixedPage]);

  const navLinks = [
    { name: 'Home', href: '/', icon: LayoutDashboard },
    { name: 'Pricing', href: '/pricing', icon: Tag },
    { name: 'Contact', href: '/contact', icon: Mail },
  ];

  const handleLogout = () => {
    logout();
    setLocation('/');
  };

  // --- START OF CORRECTION ---
  // The condition is now simplified to show the badge for ANY active subscription.
  const hasActivePlan = user?.subscription?.status === 'active';
  const isPaidPlan = hasActivePlan && user?.subscription?.planName !== 'Starter';
  // --- END OF CORRECTION ---

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  const iconAnimation = {
      initial: { opacity: 0, rotate: -90, scale: 0.5 },
      animate: { opacity: 1, rotate: 0, scale: 1 },
      exit: { opacity: 0, rotate: 90, scale: 0.5 },
      transition: { type: 'spring', stiffness: 350, damping: 20 }
  };

  return (
    <>
      <motion.nav
        className={`z-40 transition-all duration-300 ${isFixedPage ? 'fixed top-0 left-0 right-0' : 'relative'}`}
        initial={{ y: isFixedPage ? -100 : 0 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          backdropFilter: isFixedPage && (scrolled || isOpen) ? 'blur(10px)' : 'none',
          WebkitBackdropFilter: isFixedPage && (scrolled || isOpen) ? 'blur(10px)' : 'none',
          backgroundColor: isFixedPage 
            ? (scrolled || isOpen ? 'rgba(247, 244, 239, 0.8)' : 'transparent')
            : 'transparent',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="flex justify-between items-center h-20">
            <motion.div
              animate={{ opacity: isOpen ? 0 : 1, transition: { duration: 0.2 } }}
            >
              <Link href="/" className="flex items-center space-x-3">
                <MessageSquareText className="w-8 h-8 text-[#0A7C8A]" />
                <span className="text-2xl font-bold text-[#0A7C8A]">Dosky</span>
              </Link>
            </motion.div>

            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link key={link.name} href={link.href} className="text-[#2C3A47] hover:text-[#0A7C8A] transition-colors duration-300">
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  
                  {/* --- MODIFIED LOGIC FOR BADGE --- */}
                  {hasActivePlan && (
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold shadow-inner-sm ${isPaidPlan ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-700'}`}>
                      {isPaidPlan ? <Crown className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                      <span>{user.subscription.planName}</span>
                    </div>
                  )}
                  
                  <div className="w-10 h-10 bg-[#0A7C8A] rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-semibold text-[#0A7C8A]">{user.name}</span>
                  <button onClick={handleLogout} title="Logout" className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                    <LogOut className="w-5 h-5 text-[#2C3A47]" />
                  </button>
                </div>
              ) : (
                <>
                  <Link href="/auth" className="text-[#0A7C8A] font-medium">Log In</Link>
                  <motion.a
                    href="/auth"
                    className="bg-[#0A7C8A] text-white px-5 py-2 rounded-full font-semibold shadow-lg shadow-[#0A7C8A]/20"
                    whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
                  >
                    Start Free Trial
                  </motion.a>
                </>
              )}
            </div>
            
            <div className="md:hidden z-50">
                <motion.button
                    onClick={toggleMenu}
                    className="w-10 h-10 rounded-full bg-transparent transition-colors hover:bg-gray-200/50 flex items-center justify-center focus:outline-none"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Toggle Menu"
                >
                    <AnimatePresence initial={false} mode="wait">
                    {!isOpen ? (
                        <motion.div key="menu" {...iconAnimation}>
                            <Menu className="w-6 h-6 text-[#0A7C8A]" />
                        </motion.div>
                    ) : (
                        <motion.div key="close" {...iconAnimation}>
                            <X className="w-6 h-6 text-[#0A7C8A]" />
                        </motion.div>
                    )}
                    </AnimatePresence>
                </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/20 z-30"
              onClick={toggleMenu}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-[#F7F4EF] shadow-2xl z-40 flex flex-col p-6"
            >
              <div className="flex items-center justify-between pb-6 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <MessageSquareText className="w-7 h-7 text-[#0A7C8A]" />
                    <span className="text-xl font-bold text-[#0A7C8A]">Dosky</span>
                  </div>
                  <motion.button 
                    onClick={toggleMenu} 
                    className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-200/60 transition-colors"
                    aria-label="Close Menu"
                  >
                    <X className="w-6 h-6 text-[#2C3A47]" />
                  </motion.button>
              </div>
              
              <nav className="flex flex-col space-y-2 mt-8">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0, transition: { delay: 0.2 + i * 0.1 } }}
                  >
                    <Link 
                      href={link.href} 
                      onClick={toggleMenu} 
                      className="flex items-center space-x-4 p-4 rounded-lg text-xl font-semibold text-[#2C3A47] hover:bg-gray-200/60 transition-colors"
                    >
                      <link.icon className="w-6 h-6 text-[#0A7C8A]" />
                      <span>{link.name}</span>
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="mt-auto pt-6 border-t border-gray-200">
                {user ? (
                   <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-3 bg-white/60 rounded-lg">
                        <div className="w-12 h-12 bg-[#0A7C8A] rounded-full flex items-center justify-center text-white font-bold text-xl">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-[#2C3A47]">{user.name}</p>
                          {hasActivePlan && (
                           <p className={`text-sm font-semibold ${isPaidPlan ? 'text-yellow-700' : 'text-gray-600'}`}>
                             {user.subscription.planName} Plan
                           </p>
                          )}
                        </div>
                      </div>
                     <button onClick={() => { handleLogout(); toggleMenu(); }} className="w-full flex items-center justify-center space-x-3 p-3 rounded-lg font-semibold text-[#0A7C8A] bg-gray-200/80 hover:bg-gray-300/80 transition-colors">
                        <LogOut className="w-5 h-5" />
                        <span>Log Out</span>
                     </button>
                   </div>
                ) : (
                  <div className="space-y-4">
                    <Link href="/auth" onClick={toggleMenu} className="w-full flex items-center justify-center space-x-3 p-3 rounded-lg font-semibold text-[#0A7C8A] bg-gray-200/80 hover:bg-gray-300/80 transition-colors">
                      <LogIn className="w-5 h-5"/>
                      <span>Log In</span>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;