import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'wouter';
import { useAuth } from '../../../context/AuthContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Copy, Download, AlertTriangle, Check, PlusCircle } from 'lucide-react';
import './SummaryResultStyles.css';

// --- ADDED: Helper function to determine text direction ---
const isRtl = (lang) => {
  if (!lang) return false;
  // A list of common RTL language codes and names
  const rtlLangs = ['ar', 'he', 'fa', 'ur', 'yi', 'syr', 'arabic', 'hebrew'];
  const langLower = lang.toLowerCase();
  // Check if the provided language string is included in our list
  return rtlLangs.some(rtlLang => langLower.includes(rtlLang));
};

const SummaryResult = () => {
  const { user } = useAuth();
  const generationStarted = useRef(false);
  const apiUrl = import.meta.env.VITE_API_URL;

  const [summaryData, setSummaryData] = useState(() => {
    const savedData = sessionStorage.getItem('summaryData');
    // --- MODIFIED: Include language in the initial state to avoid errors ---
    return savedData ? JSON.parse(savedData) : { summaryContent: '', fileName: '', extractedText: '', language: 'en' };
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const navState = window.history.state || {};

  useEffect(() => {
    // Ensure this runs only once when the component loads with new data
    if (navState.extractedText && !generationStarted.current) {
      generationStarted.current = true;
      // --- MODIFIED: Destructure language from navigation state ---
      const { extractedText, fileName, language = 'en' } = navState;
      const initialData = { summaryContent: '', fileName, extractedText, language };
      
      sessionStorage.setItem('summaryData', JSON.stringify(initialData));
      setSummaryData(initialData);
      setIsGenerating(true);
      setError('');
      // --- MODIFIED: Pass language to the API call function ---
      fetchAndStreamSummary(extractedText, fileName, language);
    }
  }, [user?.token, navState.extractedText]); // Dependencies are correct

  const fetchAndStreamSummary = async (extractedText, fileName, language) => {
    try {
      const response = await fetch(`${apiUrl}/api/summary/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        // --- MODIFIED: Send the chosen language in the request body ---
        body: JSON.stringify({ text: extractedText, language }),
      });

      if (!response.body) throw new Error("Streaming not supported.");
      
      const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
      let currentContent = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const lines = value.split('\n\n').filter(line => line.trim());
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.substring(6);
            if (data === '[DONE]') {
              setIsGenerating(false);
              return;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.error) throw new Error(parsed.error);
              currentContent += parsed.content;
              // --- MODIFIED: Ensure language is preserved in session storage updates ---
              const updatedData = { summaryContent: currentContent, fileName, extractedText, language };
              setSummaryData(updatedData);
              sessionStorage.setItem('summaryData', JSON.stringify(updatedData));
            } catch (e) { console.error("Failed to parse stream data:", data); }
          }
        }
      }
    } catch (err) {
      console.error("Streaming error:", err);
      setError(err.message || "Failed to generate the summary.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(summaryData.summaryContent);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([summaryData.summaryContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // --- MODIFIED: Include language in the download filename ---
    a.download = `${summaryData.fileName.replace(/\.[^/.]+$/, "")}_${summaryData.language}_summary.txt`;
    document.body.appendChild(a);
a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const truncateFileName = (fileName, startLength = 10) => {
    if (!fileName) return "";
    const namePart = fileName.substring(0, fileName.lastIndexOf('.'));
    const extension = fileName.substring(fileName.lastIndexOf('.'));
    if (namePart.length <= startLength) { return fileName; }
    return `${namePart.substring(0, startLength)}....${extension}`;
  };

  if (!summaryData.extractedText && !navState.extractedText) {
    return (
      <div className="bg-[#F7F4EF] min-h-screen flex flex-col items-center justify-center p-8 text-center">
        <AlertTriangle className="w-16 h-16 text-red-500" />
        <h1 className="text-3xl font-bold text-red-600 mt-4">No Document Found</h1>
        <p className="text-lg text-[#2C3A47]/80 mt-2">Please upload a document to generate a summary.</p>
        <Link to="/tools/summarize" className="mt-8 px-6 py-3 rounded-full font-bold bg-[#0A7C8A] text-white shadow-lg">
          Back to Upload
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F4EF] to-[#EAE7E1] p-4 sm:p-6 md:p-8 flex items-center justify-center">
      <motion.div
        className="w-full max-w-4xl h-[85vh] flex flex-col bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl shadow-black/10 overflow-hidden"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-black/10 bg-white/50">
          <div className="flex items-center gap-2 text-[#2C3A47] font-medium text-sm min-w-0">
            <FileText className="w-5 h-5 text-[#0A7C8A] flex-shrink-0" />
            <span className="truncate" title={summaryData.fileName}>
              {truncateFileName(summaryData.fileName)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* ... Copy, Download, New Buttons ... */}
          </div>
        </header>

        {/* --- MODIFIED: Added `dir` attribute for automatic RTL/LTR layout --- */}
        <div 
          className="flex-grow p-6 sm:p-8 overflow-y-auto"
          dir={isRtl(summaryData.language) ? 'rtl' : 'ltr'}
        >
          <div className="markdown-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {summaryData.summaryContent}
            </ReactMarkdown>
            {isGenerating && <span className="inline-block w-2 h-5 bg-[#2C3A47] animate-pulse ml-1" />}
          </div>
          {error && <p className="text-red-600 font-bold mt-4 flex items-center gap-2"><AlertTriangle/>{error}</p>}
        </div>
      </motion.div>
    </div>
  );
};

export default SummaryResult;