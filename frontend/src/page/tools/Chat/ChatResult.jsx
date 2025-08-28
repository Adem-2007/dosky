import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { useAuth } from '../../../context/AuthContext';
import CognitiveStreamPanel from './components/ChatInterface/CognitiveStreamPanel';
import InsightCanvas from './components/ChatInterface/InsightCanvas';
import MessageInputPanel from './components/ChatInterface/MessageInputPanel';
import ConversationPanel from './components/ChatInterface/ConversationPanel';
import './ChatResultStyles.css';

const ChatResult = () => {
  const { user } = useAuth();
  const navState = window.history.state || {};
  const isNewSession = useRef(false);
  const messagesEndRef = useRef(null);

  // Access the environment variable from import.meta.env
  const apiUrl = import.meta.env.VITE_API_URL;

  const [conversation, setConversation] = useState(() => {
    const saved = sessionStorage.getItem('chatSession');
    return saved ? JSON.parse(saved).conversation : [];
  });

  const [documentContext, setDocumentContext] = useState(() => {
    const saved = sessionStorage.getItem('chatSession');
    return saved ? JSON.parse(saved) : { fileName: '', extractedText: '' };
  });

  const [currentMessage, setCurrentMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  
  const [usage, setUsage] = useState({
    messagesSent: 0,
    messageLimit: 10,
    isLoading: true,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation, isGenerating]);
  
  useEffect(() => {
    const fetchUsageStatus = async () => {
      if (!user?.token) return;
      try {
        setUsage(prev => ({ ...prev, isLoading: true }));
        // MODIFIED: Used the apiUrl environment variable
        const response = await fetch(`${apiUrl}/api/limits/status`, {
          headers: { 'Authorization': `Bearer ${user.token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch usage status');
        const data = await response.json();
        setUsage({
          messagesSent: data.chatMessagesCount,
          messageLimit: data.chatLimit,
          isLoading: false,
        });
      } catch (err) {
        setError(err.message);
        setUsage(prev => ({ ...prev, isLoading: false }));
      }
    };
    fetchUsageStatus();
  }, [user, apiUrl]);

  const isLimitedChatPlan = typeof usage.messageLimit === 'number';
  const hasReachedChatLimit = !usage.isLoading && isLimitedChatPlan && usage.messagesSent >= usage.messageLimit;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (navState.extractedText && navState.fileName !== documentContext.fileName) {
      isNewSession.current = true;
      const { extractedText, fileName } = navState;
      const initialContext = { fileName, extractedText };
      setDocumentContext(initialContext);
      setConversation([]);
      setSelectedIndex(null);
      setIsGenerating(true);
      setError('');
      sessionStorage.setItem('chatSession', JSON.stringify({ ...initialContext, conversation: [] }));
      handleSendMessage(true, extractedText);
    }
  }, [navState.extractedText, navState.fileName, documentContext.fileName]);

  useEffect(() => {
    if (conversation.length > 0 && !isNewSession.current) {
      const lastAssistantIndex = conversation.map(m => m.role).lastIndexOf('assistant');
      if (lastAssistantIndex !== -1) { 
        setSelectedIndex(lastAssistantIndex);
      }
    }
    if (isNewSession.current) {
      isNewSession.current = false;
    }
  }, [conversation]);

  const handleSendMessage = async (isInitial = false, contextText = documentContext.extractedText) => {
    if ((!isInitial && !currentMessage.trim()) || hasReachedChatLimit) return;
    
    const userMessage = { role: 'user', content: currentMessage };
    const updatedConversation = isInitial ? [] : [...conversation, userMessage];
    
    if (!isInitial) {
      setConversation(updatedConversation);
      setCurrentMessage('');
    }
    
    setIsGenerating(true);
    setError('');

    if (!isInitial) {
      try {
        // MODIFIED: Used the apiUrl environment variable
        const limitResponse = await fetch(`${apiUrl}/api/limits/increment-chat`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${user.token}` },
        });
        
        if (!limitResponse.ok) {
          const limitError = await limitResponse.json();
          throw new Error(limitError.message || "You have reached your message limit.");
        }
        
        const newUsageData = await limitResponse.json();
        setUsage(prev => ({ ...prev, messagesSent: newUsageData.chatMessagesCount }));

      } catch (err) {
        setError(err.message);
        setIsGenerating(false);
        setConversation(prev => prev.slice(0, -1));
        return;
      }
    }

    try {
      // MODIFIED: Used the apiUrl environment variable
      const response = await fetch(`${apiUrl}/api/chat/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}`},
        body: JSON.stringify({ text: contextText, messages: updatedConversation }),
      });

      if (!response.body) throw new Error("Streaming not supported.");
      
      const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
      let assistantResponse = '';
      const newConvWithPlaceholder = [...updatedConversation, { role: 'assistant', content: '' }];
      setConversation(newConvWithPlaceholder);
      setSelectedIndex(newConvWithPlaceholder.length - 1);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const lines = value.split('\n\n').filter(line => line.trim());
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.substring(6);
            if (data === '[DONE]') {
                const finalConversation = [...updatedConversation, { role: 'assistant', content: assistantResponse }];
                sessionStorage.setItem('chatSession', JSON.stringify({ ...documentContext, conversation: finalConversation }));
                setIsGenerating(false);
                return;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.error) throw new Error(parsed.error);
              assistantResponse += parsed.content;
              setConversation(prev => {
                const newConv = [...prev];
                if(newConv.length > 0) newConv[newConv.length - 1].content = assistantResponse;
                return newConv;
              });
            } catch (e) { console.error("Failed to parse stream data:", data); }
          }
        }
      }
    } catch (err) {
      setError(err.message || "Failed to generate chat.");
      const finalConversation = [...updatedConversation, { role: 'assistant', content: `Sorry, I encountered an error: ${err.message}` }];
      setConversation(finalConversation);
    } finally {
        setIsGenerating(false);
    }
  };

  const NewDocumentButton = () => (
    <Link 
      to="/tools/chat" 
      className="inline-block px-4 py-1.5 rounded-full font-medium text-sm bg-[#0A7C8A] text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
    >
      New Document
    </Link>
  );

  if (!documentContext.fileName) {
    return (
      <div className="bg-gradient-to-br from-[#F7F4EF] to-[#EDE7D9] min-h-screen flex flex-col items-center justify-center p-8 text-center">
        <div className="glass-effect rounded-3xl p-8 shadow-2xl max-w-md">
          <h1 className="text-3xl font-bold text-red-600 mb-4">No Document Found</h1>
          <p className="text-lg text-[#2C3A47]/80 mb-6">Please go back to the upload page to start a new chat.</p>
          <Link to="/tools/chat" className="inline-block px-6 py-3 rounded-full font-bold bg-[#0A7C8A] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            Back to Upload
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-[#F7F4EF] to-[#EDE7D9] min-h-screen ${isMobile ? 'p-0' : 'p-4 sm:p-6'}`}>
      <main className={`flex gap-6 max-w-full mx-auto h-screen ${isMobile ? 'chat-mobile-stack' : 'h-[calc(100vh-2rem)] sm:h-[calc(100vh-3rem)]'}`}>
        {isMobile ? (
          <div className="flex flex-col h-full w-full">
            <ConversationPanel
              conversation={conversation}
              isGenerating={isGenerating}
              error={error}
              messagesSent={usage.messagesSent}
              messageLimit={usage.messageLimit}
              messagesEndRef={messagesEndRef}
            />
            <div className="p-2">
              <MessageInputPanel 
                message={currentMessage}
                onMessageChange={setCurrentMessage}
                onSendMessage={() => handleSendMessage()}
                isGenerating={isGenerating || hasReachedChatLimit}
                hasReachedLimit={hasReachedChatLimit}
              />
              {hasReachedChatLimit && (
                <p className="text-center text-sm text-orange-600 font-semibold mt-2 px-2 py-1 bg-orange-100 rounded-md">
                  You have reached your message limit for this document.
                </p>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="w-96 flex-shrink-0 flex flex-col gap-4">
              <div className="flex-1 min-h-0">
                <CognitiveStreamPanel
                  conversation={conversation}
                  onSelectMessage={setSelectedIndex}
                  selectedIndex={selectedIndex}
                  isGenerating={isGenerating && conversation[conversation.length - 1]?.role !== 'assistant'}
                  fileName={documentContext.fileName}
                />
              </div>
              <div className="flex-shrink-0">
                <MessageInputPanel 
                  message={currentMessage}
                  onMessageChange={setCurrentMessage}
                  onSendMessage={() => handleSendMessage()}
                  isGenerating={isGenerating || hasReachedChatLimit}
                  hasReachedLimit={hasReachedChatLimit}
                />
                {hasReachedChatLimit && (
                  <p className="text-center text-sm text-orange-600 font-semibold mt-2 px-2 py-1 bg-orange-100 rounded-md">
                    You have reached your message limit for this document.
                  </p>
                )}
              </div>
            </div>

            <div className="flex-1 min-h-0">
              <InsightCanvas
                message={selectedIndex !== null ? conversation[selectedIndex] : null}
                error={error}
                NewDocumentButton={NewDocumentButton}
                isGenerating={isGenerating && selectedIndex === conversation.length - 1}
                messagesSent={usage.messagesSent}
                messageLimit={usage.messageLimit}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default ChatResult;