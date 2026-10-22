import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Upload, ArrowRight, RotateCcw, User, Info, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function OnboardingModal({ isOpen }) {
  const { user, completeOnboarding, dismissOnboarding, checkUsernameAvailable } = useAuth();
  const { showToast } = useToast();

  const defaultAvatar = user?.google_avatar || user?.avatar_url || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200&auto=format&fit=crop&q=80';
  const [selectedAvatar, setSelectedAvatar] = useState(defaultAvatar);
  const [isCustomUploaded, setIsCustomUploaded] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
  const [usernameFeedback, setUsernameFeedback] = useState({ available: true, message: 'Available' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.avatar_url) {
      setSelectedAvatar(user.avatar_url);
    }
    if (user?.username) {
      setUsername(user.username);
      setUsernameFeedback({ available: true, message: 'Default username' });
    }
  }, [user]);

  if (!isOpen) return null;

  const handleCustomUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file (PNG, JPG, WebP).', 'warning');
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      showToast('Image size must be under 4MB.', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedAvatar(event.target.result);
      setIsCustomUploaded(true);
      showToast('Custom avatar loaded successfully!', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleResetToDefault = () => {
    setSelectedAvatar(defaultAvatar);
    setIsCustomUploaded(false);
    showToast('Reset to default Google avatar.', 'info');
  };

  const handleUsernameChange = (e) => {
    let raw = e.target.value;
    if (raw.startsWith('@')) {
      raw = raw.slice(1);
    }
    const val = raw.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 16);
    setUsername(val);

    if (!val) {
      setUsernameFeedback({ available: false, message: 'Username is required' });
    } else if (val.length < 4) {
      setUsernameFeedback({ available: false, message: 'Minimum 4 characters required' });
    } else {
      const res = checkUsernameAvailable(val);
      setUsernameFeedback(res);
    }
  };

  const handleComplete = async () => {
    if (username.length < 4) {
      showToast('Username must be at least 4 characters long.', 'warning');
      return;
    }
    if (usernameFeedback && usernameFeedback.available === false && username !== user?.username) {
      showToast(usernameFeedback.message || 'Please choose an available username.', 'warning');
      return;
    }

    setLoading(true);
    await completeOnboarding({
      avatarUrl: selectedAvatar,
      username: username.trim()
    });
    setLoading(false);
  };

  const isFormValid = username.length >= 4 && (usernameFeedback.available !== false || username === user?.username);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4">
      {/* Blurred Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={dismissOnboarding}
        className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
      />

      {/* Onboarding Dialog (Angular Chamfered Cut) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 280 }}
        className="relative z-10 w-full max-w-md angular-cut bg-[#0b0b0e] border border-white/10 p-6 sm:p-7 shadow-[0_25px_80px_rgba(0,0,0,0.95)] flex flex-col text-white max-h-[92vh] overflow-y-auto no-scrollbar"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <img 
              src="/anistra-logo.png" 
              alt="ANISTRA" 
              className="h-7 object-contain drop-shadow-[0_0_8px_rgba(30,144,255,0.4)]" 
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 angular-cut-sm bg-[#1e90ff]/15 border border-[#1e90ff]/30 text-[10.5px] font-bold text-[#1e90ff] uppercase tracking-wider">
              Google Connected
            </span>
            <button
              onClick={dismissOnboarding}
              className="p-1 angular-cut-sm text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Title */}
        <div className="mt-4 mb-4 text-left">
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight font-heading">
            Set Up Your ANISTRA Profile
          </h2>
          <p className="text-xs text-[#d8d8d8] mt-1">
            Confirm your profile avatar and create your unique username for community tracking and reviews.
          </p>
        </div>

        {/* Section 1: Avatar Check Card */}
        <div className="p-3.5 sm:p-4 angular-cut-sm bg-[#111219] border border-white/[0.08] flex items-center gap-4 mb-4">
          {/* Avatar Preview with no-referrer and error fallback */}
          <div className="relative w-16 h-16 sm:w-18 sm:h-18 angular-cut-sm overflow-hidden border-2 border-[#1e90ff] shadow-[0_0_16px_rgba(30,144,255,0.35)] shrink-0 bg-[#000000]">
            <img 
              src={selectedAvatar} 
              alt="Profile Avatar" 
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200&auto=format&fit=crop&q=80';
              }}
              className="w-full h-full object-cover" 
            />
          </div>

          {/* Avatar Actions */}
          <div className="flex-1 min-w-0 flex flex-col gap-1.5">
            <div>
              <p className="text-xs font-bold text-white">
                {isCustomUploaded ? 'Custom Avatar' : 'Google Avatar'}
              </p>
              <p className="text-[11px] text-zinc-400">
                {isCustomUploaded ? 'Loaded from your device' : 'Synced from your Google account'}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-0.5">
              <label className="px-3 py-1 angular-cut-sm bg-[#181a26] hover:bg-[#202334] border border-white/[0.12] hover:border-[#1e90ff] text-[11px] font-semibold text-zinc-200 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-xs">
                <Upload className="w-3 h-3 text-[#1e90ff]" />
                <span>Upload</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleCustomUpload} 
                  className="hidden" 
                />
              </label>

              {isCustomUploaded && (
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="px-2.5 py-1 angular-cut-sm bg-[#181a26] hover:bg-[#202334] border border-white/[0.12] text-[11px] font-semibold text-zinc-400 hover:text-white transition-all flex items-center gap-1 cursor-pointer"
                  title="Reset to Google avatar"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Create Username Input */}
        <div className="p-3.5 sm:p-4 angular-cut-sm bg-[#111219] border border-white/[0.08] mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="onboarding-username" className="text-xs font-bold text-white flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#1e90ff]" />
              <span>Create Your Username</span>
            </label>

            {username && (
              <span className={`text-[10.5px] font-bold px-2 py-0.5 angular-cut-sm flex items-center gap-1 ${
                usernameFeedback.available
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
              }`}>
                {usernameFeedback.available ? (
                  <>
                    <Check className="w-3 h-3" />
                    <span>Available</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3" />
                    <span>{usernameFeedback.message || 'Invalid'}</span>
                  </>
                )}
              </span>
            )}
          </div>

          {/* Fixed @ prefix badge + username input */}
          <div className="flex items-center mt-2 angular-cut-sm overflow-hidden border border-white/[0.14] focus-within:border-[#1e90ff] focus-within:ring-1 focus-within:ring-[#1e90ff]/50 bg-[#090a0f] transition-all">
            <div className="h-10 px-3.5 bg-[#141624] border-r border-white/[0.1] flex items-center justify-center text-sm font-extrabold text-[#1e90ff] font-mono select-none shrink-0">
              @
            </div>
            <input
              id="onboarding-username"
              type="text"
              value={username}
              onChange={handleUsernameChange}
              placeholder="username"
              maxLength={16}
              className="w-full h-10 px-3 bg-transparent text-white text-xs sm:text-sm font-mono tracking-wide focus:outline-none placeholder:text-zinc-600"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-2">
            <span>4-16 chars (letters, numbers, _)</span>
            {username && (
              <span className="font-mono text-zinc-300">
                Handle: <strong className="text-[#1e90ff]">@{username}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-1">
          <button
            onClick={handleComplete}
            disabled={loading || !isFormValid}
            className={`w-full angular-btn-primary !h-10 text-xs font-bold tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_14px_rgba(30,144,255,0.4)] ${
              !isFormValid ? '!opacity-50 !cursor-not-allowed' : ''
            }`}
          >
            <span>{loading ? 'Creating Profile...' : 'Complete Profile & Enter'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Help Note */}
        <div className="mt-3.5 pt-3 border-t border-white/[0.06] flex items-center justify-center gap-1.5 text-[11px] text-zinc-400 text-center">
          <Info className="w-3.5 h-3.5 text-[#1e90ff] shrink-0" />
          <span>You can update your username and avatar anytime from Profile Settings.</span>
        </div>
      </motion.div>
    </div>
  );
}
