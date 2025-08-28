// src/components/ChatInterface/InsightCanvas.jsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, MessageSquare, CheckCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { containsArabic } from '../../../../../utils/languageUtils';

const InsightCanvas = ({ message, error, NewDocumentButton, isGenerating, messagesSent, messageLimit }) => {
  const isRtl = message ? containsArabic(message.content) : false;

  const streamingCursor = (
    <span className="inline-block w-0.5 h-5 bg-[#2C3A47] ml-1 animate-pulse" style={{ animationDuration: '1s' }}></span>
  );

  return (
    <div className="h-full glass-effect-strong rounded-2xl shadow-xl flex flex-col overflow-hidden">
      <div 
        className="flex items-center justify-between gap-3 p-4 border-b border-white/30 bg-gradient-to-r from-white/50 to-transparent"
      >
        <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <div className="w-8 h-8 bg-gradient-to-br from-[#0A7C8A] to-[#12a3b6] rounded-lg flex items-center justify-center flex-shrink-0">
            <Brain size={18} className="text-white" />
          </div>
          <h2 className="text-lg font-semibold text-[#2C3A47]">
            Insights
          </h2>
          <div className="text-xs font-medium text-gray-600 bg-black/5 px-2 py-1 rounded-md">
            {/* --- MODIFIED LINE --- */}
            {messageLimit === null ? (
              <div className="flex items-center gap-1.5 text-teal-600">
                <CheckCircle size={14} />
                <span>Unlimited</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <MessageSquare size={14} />
                <span>{messagesSent} / {messageLimit}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex-shrink-0">
          <NewDocumentButton />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key={message ? message.content.substring(0, 20) : 'empty'}
            dir={isRtl ? 'rtl' : 'ltr'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="h-full"
          >
            {message ? (
              <div className="p-6">
                <div className="markdown-content text-[#2C3A47]">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                  </ReactMarkdown>
                  {isGenerating && streamingCursor}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-[#2C3A47]/60 p-8">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#0A7C8A]/20 to-purple-500/20 rounded-full flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-[#0A7C8A]" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-[#2C3A47]">Ready for Insights</h3>
                <p className="text-sm leading-relaxed max-w-sm">
                  Select a conversation from the stream to view the AI's detailed response and analysis.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-t border-red-200 rounded-b-2xl">
          <p className="text-red-600 text-sm font-medium text-center">{error}</p>
        </div>
      )}
    </div>
  );
};

export default InsightCanvas;