// src/page/Home/components/Hero.jsx

import React from 'react';

const Hero = () => {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-6 text-center">
        
        {/* Headline & Subheadline */}
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-[#1E293B] leading-tight mb-6">
            Transform Your Documents into Knowledge
          </h1>
          <p className="text-lg md:text-xl text-[#475569] mb-10">
            Chat with any PDF, get instant summaries, and find answers in seconds. CogniPDF is the smartest way to interact with your files.
          </p>
        </div>

        {/* Call-to-Action Buttons */}
        <div className="flex justify-center items-center gap-4 ">
          <a
            href="services" // Or link to your app's upload page
            className="bg-[#0A7C8A] text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:bg-[#08636e] transition-colors duration-300"
          >
            Upload Document for Free
          </a>

        </div>
      </div>
    </section>
  );
};

export default Hero;