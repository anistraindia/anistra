import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, FileText } from 'lucide-react';

export default function LegalPopupModal({ type, isOpen, onClose }) {
  if (!isOpen) return null;

  const isPrivacy = type === 'privacy';
  const title = isPrivacy ? 'Privacy Policy' : 'Terms & Conditions';
  const Icon = isPrivacy ? Shield : FileText;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[250] flex items-center justify-center p-3 sm:p-5">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
        />

        {/* Modal Window (Angular Cut) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative z-10 w-full max-w-xl max-h-[82vh] flex flex-col angular-cut bg-[#0c0d14] border border-white/[0.14] shadow-[0_25px_80px_rgba(0,0,0,0.95)] text-white overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between shrink-0 bg-[#0e1019]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 angular-cut-sm bg-[#1e90ff]/15 border border-[#1e90ff]/30 text-[#1e90ff]">
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#1e90ff]">
                  ANISTRA Legal
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight font-heading">
                  {title}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 angular-cut-sm bg-white/[0.06] hover:bg-white/[0.12] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close legal modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Legal Body */}
          <div className="p-5 sm:p-6 overflow-y-auto text-xs sm:text-[13px] text-[#d8d8d8] leading-relaxed space-y-4">
            {isPrivacy ? (
              <>
                <section>
                  <h4 className="font-bold text-white text-sm mb-1.5">1. Overview & Information We Collect</h4>
                  <p>
                    ANISTRA is strictly an anime discovery, personal watchlist tracking, and community critique platform. When you authenticate using Google Sign-In, we receive basic authentication details: your primary email address, display name, and avatar picture. We do not store or have access to your Google account password.
                  </p>
                </section>

                <section>
                  <h4 className="font-bold text-white text-sm mb-1.5">2. Watchlist & Episode Tracking Data</h4>
                  <p>
                    Your personal episode watch logs, status changes (Watching, Completed, Plan to Watch), and ratings are linked to your ANISTRA account ID to ensure seamless synchronization across your devices.
                  </p>
                </section>

                <section>
                  <h4 className="font-bold text-white text-sm mb-1.5">3. Zero Video Hosting or Streaming</h4>
                  <p>
                    ANISTRA is <strong>NOT</strong> a video streaming website. We do not host, store, or stream media video files. All anime metadata, cover art, and episode guides are curated discovery records.
                  </p>
                </section>

                <section>
                  <h4 className="font-bold text-white text-sm mb-1.5">4. Data Deletion & Privacy Controls</h4>
                  <p>
                    You have complete control over your profile data. You can update your username, customize your avatar, or clear your tracking records directly from your Profile settings at any time.
                  </p>
                </section>
              </>
            ) : (
              <>
                <section>
                  <h4 className="font-bold text-white text-sm mb-1.5">1. Acceptance of Terms</h4>
                  <p>
                    By accessing or signing in to ANISTRA, you agree to comply with and be bound by these Terms and Conditions and all applicable laws and regulations.
                  </p>
                </section>

                <section>
                  <h4 className="font-bold text-white text-sm mb-1.5">2. Platform Mandate & Non-Streaming Notice</h4>
                  <p>
                    ANISTRA is purely an informational anime discovery, episode tracking, and review hub. ANISTRA does not provide video streaming, file hosting, or video downloads.
                  </p>
                </section>

                <section>
                  <h4 className="font-bold text-white text-sm mb-1.5">3. Community Standards & Reviews</h4>
                  <p>
                    All member reviews, usernames, and contributions must remain civil and free of harassment. Reviews discussing pivotal plot twists must explicitly toggle the "Contains Spoilers" flag to protect community readers.
                  </p>
                </section>

                <section>
                  <h4 className="font-bold text-white text-sm mb-1.5">4. Account Responsibility</h4>
                  <p>
                    You are responsible for maintaining the security of your authentication sessions. ANISTRA reserves the right to terminate accounts that violate community safety or system integrity.
                  </p>
                </section>
              </>
            )}
          </div>

          {/* Footer with Acknowledge Button */}
          <div className="p-3.5 sm:p-4 border-t border-white/[0.08] bg-[#090a10] flex items-center justify-end">
            <button
              onClick={onClose}
              className="angular-btn-primary !h-9 !px-6 text-xs"
            >
              I Understand
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
