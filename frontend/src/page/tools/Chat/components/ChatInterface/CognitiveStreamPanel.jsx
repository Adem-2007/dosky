// src/components/ChatInterface/CognitiveStreamPanel.jsx

import React from 'react';
import { User, Bot } from 'lucide-react';
import TypingIndicator from './TypingIndicator';
import { containsArabic } from '../../../../../utils/languageUtils';

const CognitiveStreamPanel = ({ conversation, onSelectMessage, selectedIndex, isGenerating, fileName }) => {
  
  const truncateResponse = (content) => {
    if (!content) return "AI is thinking...";
    const firstLine = content.split('\n')[0];
    return firstLine.length > 80 ? `${firstLine.substring(0, 80)}...` : firstLine;
  };

  const dialoguePairs = [];
  for (let i = 0; i < conversation.length; i++) {
    if (conversation[i].role === 'user') {
      dialoguePairs.push({
        user: conversation[i],
        assistant: conversation[i + 1]?.role === 'assistant' ? conversation[i + 1] : null,
        index: i,
      });
    }
  }

  return (
    <div className="h-full glass-effect rounded-2xl shadow-lg p-4 flex flex-col">
      <div className="flex items-center justify-between gap-2 pb-3 mb-4 border-b border-white/30">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#0A7C8A] animate-pulse"></div>
          <h2 className="text-lg font-semibold text-[#2C3A47]">Stream</h2>
        </div>
        <p className="text-xs text-[#2C3A47]/80 truncate font-mono bg-black/5 px-2 py-1 rounded-md">
          {fileName}
        </p>
      </div>
      
      <div className="flex-1 p-2 overflow-y-auto custom-scrollbar space-y-3">
        {dialoguePairs.map((pair) => {
          const isUserRtl = containsArabic(pair.user.content);
          const isAssistantRtl = pair.assistant ? containsArabic(pair.assistant.content) : false;

          return (
            <div
              key={pair.index}
              onClick={() => pair.assistant && onSelectMessage(pair.index + 1)}
              className={`stream-item p-3 rounded-xl transition-all duration-200 ${
                selectedIndex === pair.index + 1
                  ? 'bg-white shadow-md ring-2 ring-[#0A7C8A]/20'
                  : 'bg-white/40 hover:bg-white/70 cursor-pointer'
              }`}
            >
              <div 
                dir={isUserRtl ? 'rtl' : 'ltr'}
                className={`flex items-start gap-2 mb-2 ${isUserRtl ? 'flex-row-reverse' : ''}`}
              >
                <div className="w-6 h-6 bg-[#0A7C8A] rounded-full flex items-center justify-center flex-shrink-0">
                  <User size={14} className="text-white" />
                </div>
                <p className={`text-sm font-medium text-[#2C3A47] leading-snug w-full ${isUserRtl ? 'text-right' : 'text-left'}`}>
                  {pair.user.content}
                </p>
              </div>
              
              {pair.assistant && (
                <div 
                  dir={isAssistantRtl ? 'rtl' : 'ltr'}
                  className={`flex items-start gap-2 ml-2 pl-3 border-l-2 border-[#0A7C8A]/20 ${isAssistantRtl ? 'mr-2 ml-0 pr-3 pl-0 border-r-2 border-l-0 flex-row-reverse' : ''}`}
                >
                  <div className="w-5 h-5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot size={12} className="text-white" />
                  </div>
                  <p className={`text-xs text-[#2C3A47]/80 leading-relaxed italic w-full ${isAssistantRtl ? 'text-right' : 'text-left'}`}>
                    {truncateResponse(pair.assistant.content)}
                  </p>
                </div>
              )}
            </div>
          );
        })}
        
        {isGenerating && (
          <div className="bg-white/60 rounded-xl p-4">
            <TypingIndicator />
          </div>
        )}
      </div>
    </div>
  );
};

export default CognitiveStreamPanel;