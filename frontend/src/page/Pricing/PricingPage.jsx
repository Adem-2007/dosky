// src/page/Pricing/PricingPage.jsx

import React from 'react';
// The PricingSection is now imported from the Home components folder, as it's a shared, primary component.
import PricingSection from '../Home/components/PricingSection';
import FAQ from './components/FAQ';

const PricingPage = () => {
  return (
    // The page background is dark to match the new PricingSection theme for a fully immersive experience.
    <div className="min-h-screen overflow-x-hidden antialiased text-white">
      <main className="relative z-10 ">
        <PricingSection />
        <div className="bg-[#F7F4EF]"> {/* Add a light background for the FAQ to create contrast */}
          <FAQ />
        </div>
      </main>
      
      <footer className="text-center py-8 text-slate-500 bg-[#F7F4EF]">
        <p>&copy; 2025 CogniPDF. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default PricingPage;