import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {/* Toast Notification Container */}
      <div 
        role="region" 
        aria-live="polite" 
        className="fixed top-6 right-6 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => {
            const isSuccess = toast.type === 'success';
            const isError = toast.type === 'error';
            const isWarning = toast.type === 'warning';

            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.9, transition: { duration: 0.2 } }}
                className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3.5 angular-cut-sm bg-[#0b0b0b] border shadow-2xl ${
                  isSuccess
                    ? 'border-emerald-500/30 text-white'
                    : isError
                    ? 'border-[#ff5a5f]/50 text-white shadow-[0_0_20px_rgba(255,90,95,0.2)]'
                    : isWarning
                    ? 'border-amber-500/30 text-white'
                    : 'border-[#1e90ff]/30 text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                  {isError && <AlertCircle className="w-5 h-5 text-[#ff5a5f] shrink-0" />}
                  {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />}
                  {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-[#1e90ff] shrink-0" />}
                  <p className="text-sm font-medium tracking-wide text-zinc-100">{toast.message}</p>
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="p-1 angular-cut-sm hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                  aria-label="Dismiss toast"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
