import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, BarChart2, FileText, ArrowRight } from 'lucide-react';
import { Link } from "wouter";

// The "Illuminated Focus" Icon component.
const ServiceIcon = ({ icon: Icon }) => {
  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <motion.div 
        className="absolute w-full h-full rounded-2xl bg-[#0A7C8A]/10"
        variants={{ hover: { scale: 1.2, rotate: -15 } }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      />
      <motion.div 
        className="absolute w-3/4 h-3/4 rounded-lg bg-[#0A7C8A]/20" 
        variants={{ hover: { scale: 0.8, rotate: 15 } }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      />
      <motion.div 
        className="absolute w-full h-full rounded-2xl bg-[#FF6F61]"
        variants={{ hover: { scale: 1.4, opacity: 0 } }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
      <motion.div
        className="relative z-10 text-[#0A7C8A]"
        variants={{ hover: { scale: 1.1 } }}
      >
        <Icon className="w-8 h-8" />
      </motion.div>
    </div>
  );
};

// --- MODIFIED ServiceCard Component ---
const ServiceCard = ({ icon, title, description, delay, linkTo }) => {
  const cardVariants = {
    offscreen: { opacity: 0, y: 50 },
    onscreen: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", bounce: 0.4, duration: 0.8, delay: delay * 0.15 }
    },
    hover: {
      y: -10,
      boxShadow: '0 25px 50px -12px rgba(10, 124, 138, 0.25)',
      transition: { type: "spring", stiffness: 300, damping: 15 }
    }
  };

  return (
    <motion.div
      className="relative p-8 rounded-3xl overflow-hidden bg-white/50 backdrop-blur-xl border border-white/30 shadow-lg group flex flex-col" // Added flex-col to help with layout
      initial="offscreen"
      whileInView="onscreen"
      whileHover="hover"
      viewport={{ once: true, amount: 0.5 }}
      variants={cardVariants}
    >
      <div className="relative z-10 flex-grow"> {/* Added flex-grow */}
        <ServiceIcon icon={icon} />
        <h3 className="mt-6 text-2xl font-bold text-[#2C3A47]">{title}</h3>
        <p className="mt-3 text-[#2C3A47]/70 leading-relaxed">{description}</p>
      </div>
      <div className="mt-8 relative z-10">
        {/* The <Link> component now wraps the visual elements directly */}
        {/* It becomes the single source of the <a> tag */}
        <Link 
          href={linkTo || "#"} 
          className="inline-flex items-center font-semibold text-lg text-[#FF6F61] group cursor-pointer"
        >
          Get Started
          <motion.span
            className="ml-2"
            variants={{ hover: { x: 5 } }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <ArrowRight className="w-5 h-5" />
          </motion.span>
        </Link>
      </div>
    </motion.div>
  );
};


// The background blob component for the self-contained animation.
const AnimatedBlob = ({ color, className, transition }) => (
  <motion.div
    className={`absolute ${className}`}
    animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.1, 1] }}
    transition={transition}
    style={{
      background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      filter: 'blur(30px)',
    }}
  />
);

const ServicesPage = () => {
  const services = [
    { 
      icon: MessageSquare, 
      title: "Chat with PDF", 
      description: "Transform your static documents into dynamic conversation partners. Ask questions, get instant answers, and interact with your files like never before.",
      link: "/tools/chat"
    },
    { 
      icon: FileText, 
      title: "Summarize Documents", 
      description: "Distill lengthy documents into concise summaries. Grasp the core essence of any PDF, from research papers to complex contracts.",
      link: "/tools/summarize"
    }
  ];

  return (
    <div className="relative min-h-screen bg-[#F7F4EF] py-24 sm:py-32 px-4 overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-50">
        <AnimatedBlob 
          color="#0A7C8A" 
          className="top-0 -left-1/4 w-full h-full"
          transition={{ duration: 8, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
        />
        <AnimatedBlob 
          color="#FF6F61" 
          className="bottom-0 -right-1/4 w-full h-full"
          transition={{ duration: 10, repeat: Infinity, repeatType: "mirror", ease: "easeInOut", delay: 2 }}
        />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center">
          <motion.h1 
            className="text-4xl md:text-6xl font-extrabold text-[#2C3A47] tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            A Smarter Way to Work
          </motion.h1>
          <motion.p 
            className="mt-6 max-w-2xl mx-auto text-lg text-[#2C3A47]/80"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          >
            Our intelligent toolkit is designed to streamline your workflow, unlock insights, and transform how you interact with your documents.
          </motion.p>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10">
          {services.map((service, index) => (
            <ServiceCard 
              key={service.title}
              icon={service.icon}
              title={service.title}
              description={service.description}
              delay={index}
              linkTo={service.link}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;