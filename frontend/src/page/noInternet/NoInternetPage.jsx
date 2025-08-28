import React from 'react';
import { WifiOff, RefreshCw, Zap, AlertCircle } from 'lucide-react';

const NoInternetPage = () => {
  const styles = `
    @keyframes float {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
      100% { transform: translateY(0px); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 1; }
    }
    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-10px); }
      60% { transform: translateY(-5px); }
    }
    .animate-float {
      animation: float 3s ease-in-out infinite;
    }
    .animate-pulse-custom {
      animation: pulse 2s ease-in-out infinite;
    }
    .animate-bounce-custom {
      animation: bounce 2s ease-in-out infinite;
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="min-h-screen bg-[#F7F4EF]  flex items-center justify-center p-4">
        <div className="max-w-2xl mx-auto text-center">
          
          {/* Main Icon Container */}
          <div className="relative mb-12">
            {/* Background decorative circles */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 bg-gradient-to-r from-teal-100 to-cyan-100 rounded-full animate-pulse-custom opacity-30"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 bg-gradient-to-r from-teal-200 to-cyan-200 rounded-full animate-float opacity-40"></div>
            </div>
            
            {/* Main WiFi Off Icon */}
            <div className="relative z-10 flex items-center justify-center">
              <div className="w-32 h-32 bg-white rounded-full shadow-xl flex items-center justify-center border border-gray-100">
                <WifiOff size={64} className="text-teal-600 animate-bounce-custom" />
              </div>
            </div>

            {/* Floating status indicators */}
            <div className="absolute top-4 right-8 animate-float">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shadow-md">
                <AlertCircle size={24} className="text-red-500" />
              </div>
            </div>
            <div className="absolute bottom-8 left-8 animate-float" style={{animationDelay: '1s'}}>
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center shadow-md">
                <Zap size={20} className="text-orange-500" />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 leading-tight">
              Connection Lost
            </h1>
            <p className="text-xl text-gray-600 max-w-lg mx-auto leading-relaxed">
              Looks like your internet connection is taking a break. Let's get you back online.
            </p>

            {/* Status Cards */}
            <div className="grid md:grid-cols-2 gap-4 mt-8 max-w-lg mx-auto">
              <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <WifiOff size={20} className="text-red-500" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-800">Network</p>
                    <p className="text-sm text-gray-500">Disconnected</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                    <RefreshCw size={20} className="text-teal-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-800">Status</p>
                    <p className="text-sm text-gray-500">Reconnecting...</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-8">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-teal-200"
              >
                <RefreshCw size={20} />
                <span>Try Again</span>
              </button>
            </div>

            {/* Additional Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-6 pt-6 text-sm text-gray-500">
              <button 
                onClick={() => window.location.reload()} 
                className="hover:text-teal-600 transition-colors duration-200 font-medium"
              >
                Refresh Page
              </button>
              <span className="hidden sm:inline">•</span>
              <button 
                onClick={() => navigator.onLine && alert('Checking connection...')} 
                className="hover:text-teal-600 transition-colors duration-200 font-medium"
              >
                Check Connection
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NoInternetPage;