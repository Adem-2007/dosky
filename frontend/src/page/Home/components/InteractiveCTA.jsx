import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, FileText, CheckCircle } from 'lucide-react';

const InteractiveCTA = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsHovering(false);
    setIsUploading(true);

    // Simulate upload process
    setTimeout(() => {
      setIsUploading(false);
      setIsComplete(true);
    }, 2000);

    // Reset after a while
    setTimeout(() => {
      setIsComplete(false);
    }, 5000);
  };

  return (
    <section className="py-24">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-[#0A7C8A]">Ready to Start the Conversation?</h2>
        <p className="mt-4 text-lg text-[#2C3A47]/70">
          Drag and drop your PDF below. Your document's new life begins now.
        </p>
      </div>

      <motion.div
        className="mt-12 max-w-3xl mx-auto h-72 rounded-3xl border-2 border-dashed border-[#0A7C8A]/30 flex flex-col justify-center items-center cursor-pointer transition-all duration-300 relative overflow-hidden"
        style={{
          background: isHovering 
            ? 'linear-gradient(to bottom right, rgba(10, 124, 138, 0.1), rgba(10, 124, 138, 0.05))' 
            : 'transparent',
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={() => setIsHovering(true)}
        onDragLeave={() => setIsHovering(false)}
        onDrop={handleFileDrop}
        whileHover={{ borderColor: '#0A7C8A', scale: 1.02 }}
      >
        {isComplete ? (
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <CheckCircle className="w-24 h-24 text-teal-500" />
            <p className="mt-4 text-xl font-medium text-teal-600">Analysis Complete! Ready to Chat.</p>
          </motion.div>
        ) : isUploading ? (
          <>
            <motion.div
              className="w-16 h-16 border-4 border-t-[#FF6F61] border-[#FF6F61]/30 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <p className="mt-4 text-lg text-[#0A7C8A]">AI is reading your document...</p>
          </>
        ) : (
          <>
            <motion.div
              animate={{ y: isHovering ? -10 : 0, scale: isHovering ? 1.1 : 1 }}
            >
              <UploadCloud className={`w-20 h-20 transition-colors duration-300 ${isHovering ? 'text-[#FF6F61]' : 'text-[#0A7C8A]/50'}`} />
            </motion.div>
            <p className={`mt-4 text-lg transition-colors duration-300 ${isHovering ? 'text-[#0A7C8A]' : 'text-[#2C3A47]/60'}`}>
              <span className="font-bold text-[#0A7C8A]">Drag your PDF here</span> or click to upload
            </p>
            <p className="text-sm text-[#2C3A47]/50">Max file size: 25MB</p>
          </>
        )}
      </motion.div>
    </section>
  );
};

export default InteractiveCTA;