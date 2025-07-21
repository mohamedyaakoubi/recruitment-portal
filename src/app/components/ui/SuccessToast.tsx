import React, { useEffect, useState } from 'react';
import { SuccessToastProps } from '@/types';

const SuccessToast: React.FC<SuccessToastProps & { duration?: number }> = ({ 
  message, 
  isVisible, 
  onClose, 
  duration = 5000 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [countdown, setCountdown] = useState(Math.floor(duration / 1000));

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      setCountdown(Math.floor(duration / 1000));
      
      // Countdown timer
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Auto close timer
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(onClose, 300); // Wait for fade out animation
      }, duration);
      
      return () => {
        clearTimeout(timer);
        clearInterval(countdownInterval);
      };
    }
  }, [isVisible, onClose, duration]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
      {/* Backdrop with subtle blur */}
      <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
      
      {/* Toast Container */}
      <div className={`
        relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-gray-700 
        max-w-md w-full mx-4 transform transition-all duration-500 ease-out
        ${isAnimating 
          ? 'scale-100 opacity-100 translate-y-0' 
          : 'scale-95 opacity-0 translate-y-4'
        }
      `}>
        {/* Success Header with gradient */}
        <div className="bg-gradient-to-r from-[#003A70] to-[#004080] text-white p-6 rounded-t-2xl">
          <div className="flex items-center space-x-4">
            {/* Animated Success Icon */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <svg 
                  className="w-8 h-8 text-white animate-bounce" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2.5} 
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold">Application Submitted!</h3>
              <p className="text-white/90 text-sm mt-1">Redirecting to your dashboard...</p>
            </div>
            {/* Countdown circle */}
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full border-2 border-white/30 flex items-center justify-center">
                <span className="text-white font-bold text-sm">{countdown}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Message Content */}
        <div className="p-6">
          <p className="text-slate-700 dark:text-slate-300 text-base leading-relaxed mb-4">
            {message}
          </p>
          
          {/* Success indicators */}
          <div className="space-y-3">
            <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></div>
              Application received and being processed
            </div>
            <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
              You'll be redirected to your dashboard shortly
            </div>
            <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-3 animate-pulse"></div>
              Our team will review your application
            </div>
          </div>
        </div>

        {/* Bottom section with action */}
        <div className="bg-slate-50 dark:bg-gray-700/50 px-6 py-4 rounded-b-2xl border-t border-slate-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Application ID: #APP{Date.now().toString().slice(-6)}
            </p>
            <button
              onClick={() => {
                setIsAnimating(false);
                setTimeout(onClose, 300);
              }}
              className="text-[#003A70] dark:text-blue-400 hover:text-[#002B54] dark:hover:text-blue-300 text-sm font-semibold transition-colors"
            >
              Close ({countdown}s)
            </button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full"></div>
      </div>
    </div>
  );
};

export default SuccessToast;