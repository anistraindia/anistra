import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LegalPopupModal from '../components/LegalPopupModal';

export default function Login() {
  const { user, signInWithGoogleOAuth } = useAuth();
  const navigate = useNavigate();
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [legalModalType, setLegalModalType] = useState(null); // 'privacy' | 'terms' | null

  // If already logged in, redirect to home
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleGoogleSignIn = async () => {
    if (!agreedToTerms) return;
    await signInWithGoogleOAuth();
  };

  return (
    <div className="w-full min-h-[calc(100vh-160px)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md angular-cut bg-[#0b0c13] border border-white/[0.12] p-6 sm:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.95)] text-white relative">
        
        {/* Back Link */}
        <div className="mb-4">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Catalog</span>
          </button>
        </div>

        {/* Brand & Heading */}
        <div className="flex flex-col items-center text-center pb-6 border-b border-white/[0.08]">
          <img
            src="/anistra-logo.png"
            alt="ANISTRA"
            className="h-9 sm:h-10 object-contain drop-shadow-[0_0_12px_rgba(30,144,255,0.45)] mb-3"
          />
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-white tracking-tight">
            Sign In to ANISTRA
          </h1>
          <p className="text-xs text-[#d8d8d8] mt-1 max-w-xs">
            Synchronize your anime watchlist, custom ratings, and episode progression across all devices.
          </p>
        </div>

        {/* Login Body */}
        <div className="mt-6 space-y-4">
          
          {/* Single "Sign in with Google" Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={!agreedToTerms}
            className={`w-full h-12 angular-cut flex items-center justify-center gap-3 font-semibold text-xs sm:text-sm tracking-wide transition-all select-none ${
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

          {/* Checkbox: Terms & Privacy (Controls Button Enabled/Disabled State) */}
          <div className="pt-2 flex items-start gap-2.5">
            <input
              type="checkbox"
              id="page-terms-checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded-none accent-[#1e90ff] cursor-pointer shrink-0"
            />
            <label htmlFor="page-terms-checkbox" className="text-xs text-zinc-400 select-none leading-relaxed">
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

        {/* Security Footnote */}
        <div className="mt-8 pt-4 border-t border-white/[0.06] flex items-center justify-center gap-2 text-xs text-zinc-500">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>OAuth Encrypted • No password required</span>
        </div>
      </div>

      {/* Legal Content Popup Modal */}
      <LegalPopupModal
        type={legalModalType}
        isOpen={Boolean(legalModalType)}
        onClose={() => setLegalModalType(null)}
      />
    </div>
  );
}
