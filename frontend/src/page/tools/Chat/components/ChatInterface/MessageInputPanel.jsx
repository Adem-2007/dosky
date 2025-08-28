// src/components/ChatInterface/MessageInputPanel.jsx

import React from 'react';
import { Send, Loader2, MessageCircle, XCircle } from 'lucide-react'; // Import XCircle
import { containsArabic } from '../../../../../utils/languageUtils';

// MODIFIED: Added hasReachedLimit prop
const MessageInputPanel = ({ message, onMessageChange, onSendMessage, isGenerating, hasReachedLimit }) => {
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // MODIFIED: Check isGenerating and hasReachedLimit
      if (!isGenerating && !hasReachedLimit && message.trim()) {
        onSendMessage();
      }
    }
  };

  const isRtl = containsArabic(message);

  // Determine the placeholder text based on the current state
  const getPlaceholderText = () => {
    if (hasReachedLimit) return "Message limit reached";
    if (isGenerating) return isRtl ? "الذكاء الاصطناعي يقوم بالرد..." : "AI is responding...";
    return isRtl ? "اكتب سؤالك..." : "Ask your question...";
  };

  return (
    <div className="glass-effect rounded-2xl shadow-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <MessageCircle size={16} className="text-[#0A7C8A]" />
        <h3 className="text-sm font-semibold text-[#2C3A47]">Ask Follow-up</h3>
      </div>
      
      <div className="relative">
        <textarea
          dir={isRtl ? 'rtl' : 'ltr'}
          className={`w-full p-3 pr-12 rounded-xl border-2 border-white/50 bg-white/80 focus:outline-none focus:border-[#0A7C8A] focus:bg-white transition-all duration-200 resize-none text-sm placeholder-gray-500 disabled:bg-gray-100/50 ${
            isRtl ? 'text-right placeholder:text-right' : 'text-left placeholder:text-left'
          }`}
          placeholder={getPlaceholderText()}
          rows="3"
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          onKeyDown={handleKeyDown}
          // MODIFIED: isGenerating also includes hasReachedLimit now from the parent
          disabled={isGenerating} 
        />
        
        <button 
          onClick={onSendMessage}
          // MODIFIED: Also disable button if limit is reached
          disabled={isGenerating || !message.trim() || hasReachedLimit}
          className={`absolute bottom-2 ${isRtl ? 'left-2' : 'right-2'} w-8 h-8 rounded-lg bg-[#0A7C8A] text-white flex items-center justify-center transition-all duration-200 hover:bg-[#08616d] hover:scale-110 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:scale-100`}
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : hasReachedLimit ? (
            <XCircle className="w-4 h-4" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};

export default MessageInputPanel;