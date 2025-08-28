// src/components/ChatInterface/ConversationPanel.jsx

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { MessageSquare, CheckCircle } from 'lucide-react';
import { containsArabic } from '../../../../../utils/languageUtils';

// MODIFIED: Added messagesEndRef prop
const ConversationPanel = ({ conversation, isGenerating, error, messagesSent, messageLimit, messagesEndRef }) => {
  return (
    <div className="flex flex-col h-full bg-white/70 backdrop-blur-lg overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-[#2C3A47]">Conversation</h2>
        <div className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
          {messageLimit === null ? (
            <div className="flex items-center gap-1.5 text-teal-600">
              <CheckCircle size={14} />
              <span>Unlimited Messages</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <MessageSquare size={14} />
              <span>{messagesSent} / {messageLimit} Messages</span>
            </div>
          )}
        </div>
      </div>

      {/* MODIFIED: Added custom-scrollbar class for consistent styling */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="space-y-6">
          {conversation.map((msg, index) => {
            const isUser = msg.role === 'user';
            const isRtl = containsArabic(msg.content);
            
            // MODIFIED: Changed text to be white on dark backgrounds for mobile
            const userBubbleClasses = isRtl ? 'bg-green-300 text-white rounded-bl-none' : 'bg-green-300 text-white rounded-br-none';
            const aiBubbleClasses = isRtl ? 'bg-gray-100 text-[#2C3A47] rounded-br-none' : 'bg-gray-100 text-[#2C3A47] rounded-bl-none';

            return (
              <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`} dir={isRtl ? 'rtl' : 'ltr'}>
                {/* MODIFIED: Ensured max-width is not overly restrictive on mobile */}
                <div className={`max-w-xl p-4 rounded-2xl shadow-md transition-all duration-300 ${isUser ? userBubbleClasses : aiBubbleClasses}`}>
                  {/* MODIFIED: Added 'prose' and 'prose-sm' for better markdown rendering and made text conditional */}
                  <div className={`markdown-content prose prose-sm ${isRtl ? 'text-right text-wh' : 'text-left'} ${isUser ? 'text-white' : 'text-[#2C3A47]'}`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            );
          })}
          {/* MODIFIED: Added ref to this div */}
          <div ref={messagesEndRef} />
        </div>

        {isGenerating && conversation.length > 0 && conversation[conversation.length - 1].role === 'user' && (
          <div className="flex justify-start mt-4">
            <div className="flex items-center space-x-1.5 p-2 bg-gray-100 rounded-full">
              <span className="w-2.5 h-2.5 bg-[#2C3A47] rounded-full animate-pulse [animation-delay:-0.3s]" />
              <span className="w-2.5 h-2.5 bg-[#2C3A47] rounded-full animate-pulse [animation-delay:-0.15s]" />
              <span className="w-2.5 h-2.5 bg-[#2C3A47] rounded-full animate-pulse" />
            </div>
          </div>
        )}
        {error && <p className="text-red-600 font-bold mt-4 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default ConversationPanel;