import React, { useEffect, useState } from 'react';

interface SuccessToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

const SuccessToast: React.FC<SuccessToastProps> = ({ message, isVisible, onClose }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(onClose, 300); // Wait for fade out animation
      }, 4000); // Show for 4 seconds
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
      {/* Backdrop with subtle blur */}
      <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
      
      {/* Toast Container */}
      <div className={`
        relative bg-white rounded-2xl shadow-2xl border border-slate-200 
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
            <div>
              <h3 className="text-xl font-bold">Success!</h3>
              <p className="text-white/90 text-sm mt-1">Your application has been submitted</p>
            </div>
          </div>
        </div>

        {/* Message Content */}
        <div className="p-6">
          <p className="text-slate-700 text-base leading-relaxed mb-4">
            {message}
          </p>
          
          {/* Success indicators */}
          <div className="space-y-3">
            <div className="flex items-center text-sm text-slate-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></div>
              Application received and being processed
            </div>
            <div className="flex items-center text-sm text-slate-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
              Confirmation email will be sent shortly
            </div>
            <div className="flex items-center text-sm text-slate-600">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-3 animate-pulse"></div>
              Our team will review your application
            </div>
          </div>
        </div>

        {/* Bottom section with action */}
        <div className="bg-slate-50 px-6 py-4 rounded-b-2xl border-t border-slate-200">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Application ID: #APP{Date.now().toString().slice(-6)}
            </p>
            <button
              onClick={() => {
                setIsAnimating(false);
                setTimeout(onClose, 300);
              }}
              className="text-[#003A70] hover:text-[#002B54] text-sm font-semibold transition-colors"
            >
              Close
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