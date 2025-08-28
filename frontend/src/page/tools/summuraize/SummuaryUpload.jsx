import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

import SmartUploader from './components/SummarayUploader';
import UsageTracker from '../../../common/usageTracker/UsageTracker';

const SummaryUpload = () => {
  const { user } = useAuth();

  // Access the main API URL
  const apiUrl = import.meta.env.VITE_API_URL;

  const [usageStatus, setUsageStatus] = useState({
    uploadCount: 0,
    limit: 0,
    planName: 'loading...',
    isLoading: true,
  });

  const handleNewUpload = () => {
    console.log("Clearing previous summary from session storage.");
    sessionStorage.removeItem('summaryData');
  };

  const fetchUsageStatus = async () => {
    if (!user?.token) return;
    try {
      setUsageStatus(prev => ({...prev, isLoading: true}));
      // MODIFIED: Used the apiUrl environment variable
      const response = await fetch(`${apiUrl}/api/limits/status`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch usage status');
      const data = await response.json();
      setUsageStatus({ ...data, isLoading: false });
    } catch (error) {
      console.error(error);
      setUsageStatus({ uploadCount: 0, limit: 0, planName: 'Error', isLoading: false });
    }
  };
  
  useEffect(() => {
    fetchUsageStatus();
  }, [user, apiUrl]);

  const handleUploadSuccess = async () => {
    if (!user?.token) return;
    try {
      // MODIFIED: Used the apiUrl environment variable
      await fetch(`${apiUrl}/api/limits/increment`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${user.token}`,
        },
      });
      fetchUsageStatus();
    } catch (error)
    {
      console.error("Failed to increment upload count:", error);
    }
  };

  const isLimitedPlan = typeof usageStatus.limit === 'number';
  const hasReachedLimit = !usageStatus.isLoading && isLimitedPlan && usageStatus.uploadCount >= usageStatus.limit;

  return (
    <div className="relative bg-[#F7F4EF] min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40">
            {/* Background motion divs can go here */}
        </div>

        <div className="relative z-10 w-full max-w-2xl flex flex-col items-center text-center gap-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
                <h1 className="text-4xl md:text-5xl font-extrabold text-[#2C3A47] tracking-tight">
                    The Cognitive Core
                </h1>
                <p className="mt-4 text-lg text-[#2C3A47]/80 max-w-xl mx-auto">
                    Feed your document to our AI. It will analyze the content and distill the key information for you.
                </p>
            </motion.div>
            
            {usageStatus.isLoading ? (
                <Loader2 className="w-12 h-12 text-[#0A7C8A] animate-spin" />
            ) : (
                <>
                    <div className="w-full flex justify-center">
                        <UsageTracker 
                            uploadCount={usageStatus.uploadCount}
                            limit={usageStatus.limit}
                            planName={usageStatus.planName}
                        />
                    </div>
                    <SmartUploader 
                        disabled={hasReachedLimit}
                        onUploadSuccess={handleUploadSuccess}
                        onNewUpload={handleNewUpload}
                    />
                </>
            )}
        </div>
    </div>
  );
};

export default SummaryUpload;