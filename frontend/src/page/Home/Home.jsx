// src/page/Home/Home.jsx

import React from 'react';
import Hero from './components/Hero';
import BackgroundGlow from './components/ChatShowcase';
import PricingSection from './components/PricingSection'; // <-- This is our new masterpiece
import ChatShowcase from './components/ChatShowcase';
import UploadShowcase from './components/UploadShowcase';

const Home = () => {
  return (
    // Note: The main background is still light, creating contrast
    <div className="bg-[#F7F4EF] min-h-screen overflow-x-hidden antialiased text-[#2C3A47]">
        
      <main className="relative z-10">
        <Hero />
        <UploadShowcase />
        <ChatShowcase />
        <PricingSection /> 

      </main>
      
      <footer className="text-center py-8 text-[#0A7C8A]/60">
        <p>&copy; 2025 CogniPDF. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default Home;