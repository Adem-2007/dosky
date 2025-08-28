import React, { useState, useEffect } from 'react';
import { Send, FileText, Brain, MessageCircle, User, Bot, Sparkles, CheckCircle, Loader2 } from 'lucide-react';

const ChatShowcase = () => {
  const [currentMessage, setCurrentMessage] = useState('');
  const [showResponse, setShowResponse] = useState(false);
  const [showFullResponse, setShowFullResponse] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [streamedPartialResponse, setStreamedPartialResponse] = useState('');
  const [streamedFullResponse, setStreamedFullResponse] = useState('');

  const messages = [
    "What are the key findings in this financial report?",
    "Can you summarize the main conclusions from page 5?",
    "How does the revenue compare to last quarter?"
  ];

  const partialResponse = "Based on the financial report analysis, I found several key insights: The company's revenue increased by 15% compared to...";
  
  const fullResponse = `Based on the financial report analysis, I found several key insights:

**Revenue Growth**: The company's revenue increased by 15% compared to last quarter, reaching $2.3M

**Profit Margins**: Operating profit margins improved from 12% to 18%

**Cost Optimization**: Administrative costs were reduced by 8% through strategic initiatives

**Market Position**: The company gained 3% market share in the premium segment

**Cash Flow**: Positive cash flow of $450K with strong liquidity position

## Key Recommendations:
1. Continue investment in high-margin products
2. Expand premium segment presence  
3. Maintain cost discipline while scaling operations`;

  // Main animation sequence controller
  useEffect(() => {
    const animationSequence = async () => {
      // 1. Reset state for the new cycle
      setCurrentMessage('');
      setShowResponse(false);
      setShowFullResponse(false);
      setIsTyping(false);
      setStreamedPartialResponse('');
      setStreamedFullResponse('');

      // 2. Wait before starting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 3. Type out the user's message
      const message = messages[animationStep % messages.length];
      for (let i = 0; i <= message.length; i++) {
        setCurrentMessage(message.slice(0, i));
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // 4. Show the "thinking" indicator
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsTyping(true);

      // 5. Start the response process after a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsTyping(false);
      setShowResponse(true); // This will trigger the partial response stream

      // The full response stream is now triggered by the completion of the partial stream
      
      // 6. Wait for a long time before the next loop
      await new Promise(resolve => setTimeout(resolve, 8000));
      setAnimationStep(prev => prev + 1);
    };

    const timeoutId = setTimeout(animationSequence, 1000); // Initial delay
    return () => clearTimeout(timeoutId);
  }, [animationStep]);

  // Effect for streaming the partial response in the left panel
  useEffect(() => {
    if (showResponse) {
      const intervalId = setInterval(() => {
        setStreamedPartialResponse(prev => {
          if (prev.length < partialResponse.length) {
            return partialResponse.slice(0, prev.length + 1);
          }
          // When partial response is complete:
          clearInterval(intervalId);
          setShowFullResponse(true); // *** TRIGGER a full response stream ***
          return prev;
        });
      }, 30); // Adjust speed for partial response
      return () => clearInterval(intervalId);
    }
  }, [showResponse]);

  // Effect for streaming the full response in the right panel
  useEffect(() => {
    if (showFullResponse) {
      const intervalId = setInterval(() => {
        setStreamedFullResponse(prev => {
          if (prev.length < fullResponse.length) {
            return fullResponse.slice(0, prev.length + 1);
          }
          clearInterval(intervalId);
          return prev;
        });
      }, 15); // Adjust speed for full response
      return () => clearInterval(intervalId);
    }
  }, [showFullResponse]);


  return (
    <section className="py-20 bg-gradient-to-br from-[#F7F4EF] to-[#EAE7E1] relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#0A7C8A]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#22A39F]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-[#0A7C8A]/10 px-4 py-2 rounded-full mb-6">
            <Sparkles size={16} className="text-[#0A7C8A]" />
            <span className="text-[#0A7C8A] font-medium">AI-Powered Chat</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#2C3A47] mb-6">
            Your Documents Have Stories.
            <br />
            <span className="text-[#0A7C8A]">Let Them Speak.</span>
          </h2>
          <p className="text-xl text-[#2C3A47]/70 max-w-2xl mx-auto">
            Stop skimming, start conversing. Upload any PDF and ask it anything. Get summaries, find key data, and uncover insights in seconds.
          </p>
        </div>

        {/* Main Chat Interface */}
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-4 h-[600px]">
            
            {/* Left Panel - Stream (4 columns) */}
            <div className="lg:col-span-4 bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-4 flex flex-col">
              <div className="flex items-center justify-between gap-2 pb-3 mb-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#0A7C8A] animate-pulse"></div>
                  <h2 className="text-lg font-semibold text-[#2C3A47]">Stream</h2>
                </div>
                <p className="text-xs text-[#2C3A47]/80 truncate font-mono bg-black/5 px-2 py-1 rounded-md">
                  financial_report.pdf
                </p>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-3">
                {/* Conversation Item */}
                {showResponse && (
                  <div className="bg-white/40 hover:bg-white/70 p-3 rounded-xl transition-all duration-200 cursor-pointer animate-fadeIn">
                    <div className="flex items-start gap-2 mb-2">
                      <div className="w-6 h-6 bg-[#0A7C8A] rounded-full flex items-center justify-center flex-shrink-0">
                        <User size={14} className="text-white" />
                      </div>
                      <p className="text-sm font-medium text-[#2C3A47] leading-snug">
                        {currentMessage}
                      </p>
                    </div>
                    
                    <div className="flex items-start gap-2 ml-2 pl-3 border-l-2 border-[#0A7C8A]/20">
                      <div className="w-5 h-5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Bot size={12} className="text-white" />
                      </div>
                      <p className="text-xs text-[#2C3A47]/80 leading-relaxed italic">
                        {streamedPartialResponse}
                        {streamedPartialResponse.length < partialResponse.length && (
                           <span className="inline-block w-0.5 h-3 bg-[#2C3A47] ml-0.5 animate-pulse"></span>
                        )}
                      </p>
                    </div>
                  </div>
                )}
                
                {isTyping && (
                  <div className="bg-white/60 rounded-xl p-4">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="w-2 h-2 bg-[#2C3A47]/50 rounded-full animate-pulse" style={{animationDelay: '0s'}} />
                      <span className="w-2 h-2 bg-[#2C3A47]/50 rounded-full animate-pulse" style={{animationDelay: '0.2s'}} />
                      <span className="w-2 h-2 bg-[#2C3A47]/50 rounded-full animate-pulse" style={{animationDelay: '0.4s'}} />
                    </div>
                  </div>
                )}
              </div>

              {/* Ask Follow-up Section */}
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-3">
                  <MessageCircle size={16} className="text-[#0A7C8A]" />
                  <h3 className="text-sm font-semibold text-[#2C3A47]">Ask Follow-up</h3>
                </div>
                
                <div className="relative">
                  <textarea
                    value={currentMessage}
                    readOnly
                    placeholder="Ask your question..."
                    rows="3"
                    className="w-full p-3 pr-12 rounded-xl border-2 border-white/50 bg-white/80 text-sm placeholder-gray-500 resize-none"
                  />
                  <button className="absolute bottom-2 right-2 w-8 h-8 rounded-lg bg-[#0A7C8A] text-white flex items-center justify-center transition-all duration-200 hover:bg-[#08616d]">
                    {isTyping ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  </button>
                  {currentMessage && !isTyping && !showResponse && (
                    <div className="absolute right-14 top-3">
                      <div className="w-0.5 h-4 bg-[#0A7C8A] animate-pulse"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Panel - Insights (8 columns) */}
            <div className="lg:col-span-8 bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg flex flex-col">
              <div className="flex items-center justify-between gap-3 p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#0A7C8A] to-[#12a3b6] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Brain size={18} className="text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-[#2C3A47]">Insights</h2>
                  <div className="text-xs font-medium text-gray-600 bg-black/5 px-2 py-1 rounded-md">
                    <div className="flex items-center gap-1.5">
                      <MessageCircle size={12} />
                      <span>1 / 200</span>
                    </div>
                  </div>
                </div>
                <button className="px-4 py-2 bg-[#0A7C8A] text-white text-sm font-medium rounded-lg hover:bg-[#0A7C8A]/90 transition-colors">
                  New Document
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {showResponse ? (
                  <div className="prose prose-sm max-w-none text-[#2C3A47]">
                    <div className="whitespace-pre-line text-sm leading-relaxed">
                      {streamedFullResponse}
                      {showFullResponse && streamedFullResponse.length < fullResponse.length && (
                         <span className="inline-block w-0.5 h-4 bg-[#2C3A47] ml-1 animate-pulse"></span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-[#2C3A47]/60">
                    <div className="relative mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#0A7C8A]/20 to-purple-500/20 rounded-full flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-[#0A7C8A]" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-[#2C3A47]">Hello! I am your expert AI assistant</h3>
                    <p className="text-sm leading-relaxed max-w-md">
                      Specialized in analyzing and answering questions about the provided document. Feel free to ask me anything!
                    </p>
                  </div>
                )}
              </div>
            </div>
            
          </div>

          {/* Feature highlights */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="text-center p-6 bg-white/50 rounded-xl border border-[#0A7C8A]/10">
              <div className="w-12 h-12 bg-[#22A39F]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="text-[#22A39F]" size={24} />
              </div>
              <h3 className="font-semibold text-[#2C3A47] mb-2">Instant Analysis</h3>
              <p className="text-[#2C3A47]/70 text-sm">Get insights from your documents in seconds, not hours</p>
            </div>
            
            <div className="text-center p-6 bg-white/50 rounded-xl border border-[#0A7C8A]/10">
              <div className="w-12 h-12 bg-[#0A7C8A]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="text-[#0A7C8A]" size={24} />
              </div>
              <h3 className="font-semibold text-[#2C3A47] mb-2">Natural Conversation</h3>
              <p className="text-[#2C3A47]/70 text-sm">Ask questions in plain English, get clear answers</p>
            </div>
            
            <div className="text-center p-6 bg-white/50 rounded-xl border border-[#0A7C8A]/10">
              <div className="w-12 h-12 bg-[#22A39F]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="text-[#22A39F]" size={24} />
              </div>
              <h3 className="font-semibold text-[#2C3A47] mb-2">Any Document</h3>
              <p className="text-[#2C3A47]/70 text-sm">Works with PDFs, reports, research papers, and more</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        .prose strong { color: #1E293B; }
        .prose h2 { 
            font-size: 1.1rem;
            font-weight: 600;
            margin-top: 1.5em;
            margin-bottom: 0.5em;
            border-bottom: 1px solid rgba(0,0,0,0.05);
            padding-bottom: 0.3em;
        }
      `}</style>
    </section>
  );
};

export default ChatShowcase;