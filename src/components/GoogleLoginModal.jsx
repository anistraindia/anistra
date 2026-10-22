import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ShieldCheck } from 'lucide-react';
import LegalPopupModal from './LegalPopupModal';
import { useAuth } from '../context/AuthContext';

export default function GoogleLoginModal({ isOpen, onClose }) {
  const { signInWithGoogleOAuth } = useAuth();
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [legalModalType, setLegalModalType] = useState(null); // 'privacy' | 'terms' | null

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    if (!agreedToTerms) return;
    onClose();
    await signInWithGoogleOAuth();
  };

  return (
    <>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4">
        {/* Blurred Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Google Sign-in Card (Angular Cut) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 14 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative z-10 w-full max-w-[420px] angular-cut bg-[#0d0f17] border border-white/[0.14] shadow-[0_25px_80px_rgba(0,0,0,0.95)] p-6 sm:p-7 text-white overflow-hidden"
        >
          {/* Top Header: Brand Logo & Close */}
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-2.5">
              <img
                src="/anistra-logo.png"
                alt="ANISTRA"
                className="h-7 object-contain drop-shadow-[0_0_8px_rgba(30,144,255,0.4)]"
              />
            </div>

            <button
              onClick={onClose}
              className="w-7 h-7 angular-cut-sm bg-white/[0.06] hover:bg-white/[0.12] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close Login Modal"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Title Area */}
          <div className="mt-4 mb-5 text-left">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight font-heading">
              Welcome to ANISTRA
            </h2>
            <p className="text-xs text-[#d8d8d8] mt-0.5">
              Sign in to sync your canonical anime tracking, reviews, and personalized watchlist.
            </p>
          </div>

          {/* Action: Single "Sign in with Google" Button */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={!agreedToTerms}
              className={`w-full h-11 sm:h-12 angular-cut flex items-center justify-center gap-3 font-semibold text-xs sm:text-sm tracking-wide transition-all select-none ${
                agreedToTerms
                  ? 'bg-white hover:bg-zinc-100 text-[#1f1f1f] shadow-[0_0_20px_rgba(255,255,255,0.25)] cursor-pointer active:scale-[0.98]'
                  : 'bg-white/10 text-white/35 cursor-not-allowed border border-white/[0.06]'
              }`}
            >
              {/* Google G Multi-Color Icon */}
              <svg className={`w-5 h-5 shrink-0 ${!agreedToTerms ? 'opacity-40 grayscale' : ''}`} viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>

            {/* Checkbox: Privacy Policy & Terms & Conditions (Controls Button Disabled State) */}
            <div className="pt-2 flex items-start gap-2.5">
              <input
                type="checkbox"
                id="modal-terms-checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded-none accent-[#1e90ff] cursor-pointer shrink-0"
              />
              <label htmlFor="modal-terms-checkbox" className="text-xs text-zinc-400 select-none leading-relaxed">
                I agree to the{' '}
                <button
                  type="button"
                  onClick={() => setLegalModalType('privacy')}
                  className="text-[#1e90ff] hover:underline font-semibold cursor-pointer"
                >
                  Privacy Policy
                </button>{' '}
                and{' '}
                <button
                  type="button"
                  onClick={() => setLegalModalType('terms')}
                  className="text-[#1e90ff] hover:underline font-semibold cursor-pointer"
                >
                  Terms and Conditions
                </button>
              </label>
            </div>
          </div>

          {/* Privacy Footnote */}
          <div className="mt-5 pt-3.5 border-t border-white/[0.06] flex items-start gap-2 text-[10.5px] text-zinc-500 leading-relaxed">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
            <p>
              Your credentials are safely authenticated through Google OAuth. ANISTRA never accesses your Google password.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Legal Content Popup Modal */}
      <LegalPopupModal
        type={legalModalType}
        isOpen={Boolean(legalModalType)}
        onClose={() => setLegalModalType(null)}
      />
    </>
  );
}
