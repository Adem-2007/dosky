import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import { useLocation } from 'wouter';
import { Loader2, Zap, Timer } from 'lucide-react';

import SmartUploader from './components/ChatUploader';
import UsageTracker from '../../../common/usageTracker/UsageTracker';

const ChatUpload = () => {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const cooldownIntervalRef = useRef(null);

  // Access the environment variable from import.meta.env
  const apiUrl = import.meta.env.VITE_API_URL;

  const [usageStatus, setUsageStatus] = useState({
    uploadCount: 0,
    limit: 0,
    planName: 'loading...',
    isLoading: true,
  });

  const [extractionResult, setExtractionResult] = useState(null);
  const [isCoolingDown, setIsCoolingDown] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);

  const handleNewUpload = () => {
    sessionStorage.removeItem('chatData');
    setExtractionResult(null);
  };

  const fetchUsageStatus = async () => {
    if (!user?.token) return;
    try {
      setUsageStatus(prev => ({...prev, isLoading: true}));
      // MODIFIED: Used the apiUrl environment variable
      const response = await fetch(`${apiUrl}/api/limits/status`, {
        headers: { 'Authorization': `Bearer ${user.token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch usage status');
      const data = await response.json();
      setUsageStatus({ ...data, isLoading: false });
    } catch (error)
    {
      console.error(error);
      setUsageStatus({ uploadCount: 0, limit: 0, planName: 'Error', isLoading: false });
    }
  };

  const startCooldown = (duration) => {
    clearInterval(cooldownIntervalRef.current);
    setIsCoolingDown(true);
    setCooldownTime(duration);

    cooldownIntervalRef.current = setInterval(() => {
      setCooldownTime(prevTime => {
        if (prevTime <= 1) {
          clearInterval(cooldownIntervalRef.current);
          setIsCoolingDown(false);
          localStorage.removeItem('uploadCooldownEnd');
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };
  
  useEffect(() => {
    const cooldownEndTime = localStorage.getItem('uploadCooldownEnd');
    if (cooldownEndTime) {
      const remainingTime = Math.ceil((parseInt(cooldownEndTime, 10) - Date.now()) / 1000);
      if (remainingTime > 0) {
        startCooldown(remainingTime);
      } else {
        localStorage.removeItem('uploadCooldownEnd');
      }
    }
  }, []);

  useEffect(() => {
    fetchUsageStatus();
    return () => clearInterval(cooldownIntervalRef.current);
  }, [user?.token]);

  const handleExtractionComplete = (result) => {
    setExtractionResult(result);
  };

  const handleStartConversation = async () => {
    if (!extractionResult || !user?.token) return;

    try {
      // MODIFIED: Used the apiUrl environment variable
      const response = await fetch(`${apiUrl}/api/limits/increment`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user.token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to update usage count.");
      }

      const cooldownDuration = 60; // 60 seconds
      const cooldownEndTime = Date.now() + cooldownDuration * 1000;
      localStorage.setItem('uploadCooldownEnd', cooldownEndTime.toString());
      startCooldown(cooldownDuration);
      
      navigate('/tools/chat-result', {
        state: {
          extractedText: extractionResult.text,
          fileName: extractionResult.fileName
        }
      });

    } catch (error) {
      console.error("Failed to start conversation:", error);
    }
  };

  const isLimitedPlan = typeof usageStatus.limit === 'number';
  const hasReachedLimit = !usageStatus.isLoading && isLimitedPlan && usageStatus.uploadCount >= usageStatus.limit;
  const uploaderDisabled = hasReachedLimit || isCoolingDown;

  const BackgroundBlobs = () => (
    <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div 
            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-200/40 rounded-full filter blur-3xl opacity-50"
        />
        <motion.div 
            animate={{ rotate: -360, y: [0, 20, 0] }}
            transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-200/40 rounded-full filter blur-3xl opacity-50"
        />
    </div>
  );

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden">
        <BackgroundBlobs />

        <div className="relative z-10 w-full max-w-3xl flex flex-col items-center text-center">
            <motion.div
              key={extractionResult ? 'result' : 'upload'}
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="p-8 sm:p-12 rounded-3xl w-full"
            >
                <div className="flex items-center justify-center mb-6 gap-3">
                  <Zap className="w-8 h-8 text-teal-500" />
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-800 tracking-tight">
                      {extractionResult ? 'Ready to Dive In?' : 'Cognitive Core'}
                  </h1>
                </div>

                <p className="mt-4 text-lg text-gray-600 max-w-xl mx-auto mb-8">
                    {extractionResult 
                      ? <>Your document <span className="font-semibold text-teal-600">"{extractionResult.fileName}"</span> has been processed. Start the conversation to unlock its insights.</>
                      : 'Upload your document to our AI. Instantly start a conversation and get answers from your content.'
                    }
                </p>
                
                {usageStatus.isLoading ? (
                    <div className="flex justify-center p-10">
                      <Loader2 className="w-12 h-12 text-teal-500 animate-spin" />
                    </div>
                ) : (
                    <>
                        <div className="w-full flex justify-center">
                            <UsageTracker 
                                uploadCount={usageStatus.uploadCount}
                                limit={usageStatus.limit}
                                planName={usageStatus.planName}
                            />
                        </div>

                        {isCoolingDown && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-6 flex items-center justify-center gap-3 bg-orange-100 text-orange-700 p-3 rounded-lg"
                            >
                                <Timer className="w-5 h-5" />
                                <span className="font-medium">
                                    Please wait {cooldownTime} seconds for your next upload.
                                </span>
                            </motion.div>
                        )}

                        <div className="mt-8">
                            <SmartUploader 
                                disabled={uploaderDisabled}
                                onNewUpload={handleNewUpload}
                                onExtractionComplete={handleExtractionComplete}
                                extractionResult={extractionResult}
                                onStartConversation={handleStartConversation}
                            />
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    </div>
  );
};

export default ChatUpload;