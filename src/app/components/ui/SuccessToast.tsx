import React, { useEffect, useState, useRef } from 'react';
import { SuccessToastProps } from '@/types';

const SuccessToast: React.FC<SuccessToastProps & { duration?: number }> = ({
  message,
  isVisible,
  onClose,
  duration = 5000,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [countdown, setCountdown] = useState(Math.floor(duration / 1000));
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      setCountdown(Math.floor(duration / 1000));

      // Countdown timer
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Auto close timer
      timerRef.current = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(onClose, 300); // Wait for fade out animation
      }, duration);

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        clearInterval(countdownInterval);
      };
    }
  }, [isVisible, onClose, duration]);

  if (!isVisible) return null;

  const handleClose = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsAnimating(false);
    setTimeout(onClose, 300);
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with subtle blur */}
      <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>

      {/* Toast Container */}
      <div
        className={`
        relative mx-4 w-full max-w-md transform rounded-2xl border border-slate-200 
        bg-white shadow-2xl transition-all duration-500 ease-out dark:border-gray-700 dark:bg-gray-800
        ${isAnimating ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-4 scale-95 opacity-0'}
      `}
      >
        {/* Success Header with gradient */}
        <div className="rounded-t-2xl bg-gradient-to-r from-[#003A70] to-[#004080] p-6 text-white">
          <div className="flex items-center space-x-4">
            {/* Animated Success Icon */}
            <div className="flex-shrink-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                <svg
                  className="h-8 w-8 animate-bounce text-white"
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
              <p className="mt-1 text-sm text-white/90">Redirecting to your dashboard...</p>
            </div>
            {/* Countdown circle */}
            <div className="flex-shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/30">
                <span className="text-sm font-bold text-white">{countdown}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Message Content */}
        <div className="p-6">
          <p className="mb-4 text-base leading-relaxed text-slate-700 dark:text-slate-300">
            {message}
          </p>

          {/* Success indicators */}
          <div className="space-y-3">
            <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
              <div className="mr-3 h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
              Application received and being processed
            </div>
            <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
              <div className="mr-3 h-2 w-2 animate-pulse rounded-full bg-blue-500"></div>
              You'll be redirected to your dashboard shortly
            </div>
            <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
              <div className="mr-3 h-2 w-2 animate-pulse rounded-full bg-purple-500"></div>
              Our team will review your application
            </div>
          </div>
        </div>

        {/* Bottom section with action */}
        <div className="rounded-b-2xl border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-700/50">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Application ID: #APP{Date.now().toString().slice(-6)}
            </p>
            <button
              onClick={handleClose}
              className="text-sm font-semibold text-[#003A70] transition-colors hover:text-[#002B54] dark:text-blue-400 dark:hover:text-blue-300"
            >
              Close ({countdown}s)
            </button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -right-2 -top-2 h-6 w-6 animate-ping rounded-full bg-yellow-400 opacity-75"></div>
        <div className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-yellow-500"></div>
      </div>
    </div>
  );
};

export default SuccessToast;
