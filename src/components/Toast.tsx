import React, { useEffect } from 'react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, onClose, duration]);

  if (!message) return null;

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white text-xs sm:text-sm font-medium px-4 py-2.5 rounded-full shadow-2xl shadow-blue-950/80 border border-blue-500/40 z-[100] max-w-xs sm:max-w-md text-center transition-all">
      {message}
    </div>
  );
};
