import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, AlertTriangle, Loader2, X } from 'lucide-react';
import { useLocation } from 'wouter'; 

// --- ADDED: Language options array for the dropdown ---
const languageOptions = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'ar', name: 'Arabic' },
  { code: 'he', name: 'Hebrew' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ru', name: 'Russian' },
  { code: 'other', name: 'Other...' },
];

const SummarayUploader = ({ disabled, onUploadSuccess, onNewUpload }) => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, processing, ready, error
  const [errorMessage, setErrorMessage] = useState('');
  const [tokenCount, setTokenCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [, setLocation] = useLocation(); 

  // --- ADDED: State management for language selection ---
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [customLanguage, setCustomLanguage] = useState('');

  const handleReset = () => {
    setFile(null);
    setStatus('idle');
    setErrorMessage('');
    setTokenCount(0);
    setPageCount(0);
    setSelectedLanguage('en');
    setCustomLanguage('');
    if (onNewUpload) {
      onNewUpload();
    }
  };
  
  const handleFileProcessing = async (acceptedFile) => {
    setStatus('processing'); 
    const uploadApiUrl = import.meta.env.VITE_UPLOAD_API_URL;
    try {
      const formData = new FormData();
      formData.append('file', acceptedFile);

      const extractionResponse = await fetch(`${uploadApiUrl}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!extractionResponse.ok) {
        const errorData = await extractionResponse.json();
        throw new Error(errorData.error || 'Failed to analyze PDF.');
      }

      const extractionData = await extractionResponse.json();
      const { text, tokenCount, pageCount } = extractionData.data;

      if (!text || text.trim().length === 0) {
        throw new Error('No text could be extracted from this document.');
      }

      setFile({ name: acceptedFile.name, size: acceptedFile.size, extractedText: text });
      setTokenCount(tokenCount); 
      setPageCount(pageCount);
      setStatus('ready');

    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'An unexpected error occurred during file processing.');
      setStatus('error');
    }
  };

  const onDrop = useCallback((acceptedFiles, fileRejections) => {
    if (disabled) return;
    handleReset();

    if (fileRejections.length > 0) {
      const { errors } = fileRejections[0];
      if (errors[0].code === 'file-too-large') {
        setErrorMessage('File is larger than 32MB');
      } else if (errors[0].code === 'file-invalid-type') {
        setErrorMessage('Only PDF documents are accepted');
      } else {
        setErrorMessage('An unknown error occurred with the file.');
      }
      setStatus('error');
      return;
    }

    if (acceptedFiles.length > 0) {
      handleFileProcessing(acceptedFiles[0]);
    }
  }, [disabled]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 32 * 1024 * 1024,
    multiple: false,
    disabled,
  });

  const handleSummarize = () => {
    if (!file || !file.extractedText) return;
    
    // --- MODIFIED: Determine the final language and validate it ---
    const finalLanguage = selectedLanguage === 'other' ? customLanguage : selectedLanguage;
    if (!finalLanguage || finalLanguage.trim() === '') {
      setErrorMessage('Please select or specify a summary language.');
      setStatus('error');
      return;
    }
    
    sessionStorage.removeItem('summaryData');
    onUploadSuccess(); 
  
    setLocation("/tools/summary-result", { 
      state: { 
        extractedText: file.extractedText,
        fileName: file.name,
        language: finalLanguage // Pass the final language to the result page
      } 
    });
  };

  const renderContent = () => {
    switch (status) {
      case 'idle':
        return (
          <div className="text-center">
            <UploadCloud className="mx-auto h-12 w-12 text-[#0A7C8A]/50" />
            <p className="mt-4 font-semibold text-[#2C3A47]">Drag & Drop or Click to Upload</p>
            <p className="text-xs text-[#2C3A47]/60 mt-1">PDF only, max 32MB</p>
          </div>
        );
      case 'processing':
        return (
            <div className="relative flex flex-col items-center justify-center">
                 <Loader2 className="w-12 h-12 text-[#0A7C8A] animate-spin" />
                 <p className="mt-4 text-sm font-semibold text-[#2C3A47]">Analyzing Document...</p>
            </div>
        );
      case 'ready':
        return (
          <div className="w-full text-center flex flex-col h-full">
             <div className="flex-grow">
                <FileText className="mx-auto h-12 w-12 text-[#0A7C8A]" />
                <p className="mt-2 font-semibold text-[#2C3A47] truncate" title={file.name}>{file.name}</p>
                <div className="flex justify-center gap-4 text-xs text-[#2C3A47]/60 mt-1">
                    <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    {pageCount > 0 && (<><span>|</span><span>{pageCount} Pages</span></>)}
                    <span>|</span>
                    <span>{tokenCount.toLocaleString()} Tokens</span>
                </div>

                {/* --- ADDED: Language Selection UI --- */}
                <div className="mt-4 text-left">
                    <label htmlFor="language-select" className="block text-sm font-medium text-gray-700 mb-1">
                        Summary Language
                    </label>
                    <div className="flex items-center gap-2">
                        <select
                            id="language-select"
                            value={selectedLanguage}
                            onClick={(e) => e.stopPropagation()} // Prevent dropzone from opening
                            onChange={(e) => setSelectedLanguage(e.target.value)}
                            className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-[#0A7C8A] focus:border-[#0A7C8A] sm:text-sm"
                        >
                            {languageOptions.map(lang => (
                                <option key={lang.code} value={lang.code}>{lang.name}</option>
                            ))}
                        </select>
                        {selectedLanguage === 'other' && (
                            <motion.input
                                type="text"
                                value={customLanguage}
                                onClick={(e) => e.stopPropagation()} // Prevent dropzone from opening
                                onChange={(e) => setCustomLanguage(e.target.value)}
                                placeholder="e.g., Portuguese"
                                className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#0A7C8A] focus:border-[#0A7C8A] sm:text-sm"
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: '100%' }}
                                transition={{ duration: 0.3 }}
                            />
                        )}
                    </div>
                </div>
             </div>

             <motion.button
                onClick={(e) => { e.stopPropagation(); handleSummarize(); }}
                className="w-full mt-6 py-3 rounded-full font-bold bg-[#0A7C8A] text-white shadow-lg shadow-[#0A7C8A]/30"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
             >
                Summarize Now
             </motion.button>
          </div>
        );
      case 'error':
         return (
          <div className="text-center ">
             <AlertTriangle className="mx-auto h-12 w-12 text-[#FF6F61]" />
             <p className="mt-4 font-semibold text-red-700">{errorMessage}</p>
             <motion.button
                onClick={(e) => { e.stopPropagation(); handleReset(); }}
                className="w-full mt-6 py-3 rounded-full font-bold bg-[#FF6F61] text-white shadow-lg shadow-[#FF6F61]/30"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
             >
                Try Again
             </motion.button>
          </div>
         );
      default: return null;
    }
  };

  return (
    <motion.div 
      className="w-full max-w-md mt-8 relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <div
        {...getRootProps()}
        // --- MODIFIED: Increased height to h-96 for more space ---
        className={`w-full h-96 rounded-3xl border-2 border-dashed flex items-center justify-center p-8
        transition-colors duration-300 ease-in-out cursor-pointer
        ${disabled ? 'bg-gray-200/50 border-gray-300 cursor-not-allowed' :
          isDragActive ? 'bg-[#0A7C8A]/20 border-[#0A7C8A]' :
          status === 'error' ? 'bg-red-500/10 border-red-500/50' :
          'bg-white/60 border-gray-300 hover:border-[#0A7C8A]/50'
        }`}
      >
        <input {...getInputProps()} />
        <AnimatePresence mode="wait">
            <motion.div
                key={status}
                className="w-full h-full flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
                {renderContent()}
            </motion.div>
        </AnimatePresence>
      </div>

       {(status === 'ready' || status === 'processing') && !disabled && (
            <motion.button 
                onClick={(e) => { e.stopPropagation(); handleReset(); }}
                className="absolute -top-4 -right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Cancel"
            >
                <X className="w-5 h-5 text-gray-600" />
            </motion.button>
       )}
    </motion.div>
  );
};

export default SummarayUploader;