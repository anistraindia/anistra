import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, RotateCcw, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export default function AvatarPickerModal({ isOpen, onClose, onSelectAvatar, currentAvatar }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const defaultAvatar = user?.google_avatar || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200&auto=format&fit=crop&q=80';
  const [selectedUrl, setSelectedUrl] = useState(currentAvatar || defaultAvatar);
  const [uploading, setUploading] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = async (e) => {
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

    setUploading(true);

    // Try Supabase Storage upload if authenticated and configured
    if (isSupabaseConfigured && supabase && user?.id) {
      try {
        const fileExt = file.name.split('.').pop() || 'png';
        const filePath = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file, { upsert: true });

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

          if (publicUrl) {
            setSelectedUrl(publicUrl);
            setUploading(false);
            showToast('Uploaded to cloud storage! Click Save to apply.', 'success');
            return;
          }
        }
      } catch (err) {
        console.warn('Storage upload error, using local preview:', err);
      }
    }

    // Local DataURL fallback
    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedUrl(event.target.result);
      setUploading(false);
      showToast('Custom avatar loaded! Click Save to apply.', 'success');
    };
    reader.onerror = () => {
      setUploading(false);
      showToast('Failed to read image file.', 'error');
    };
    reader.readAsDataURL(file);
  };

  const handleResetDefault = () => {
    setSelectedUrl(defaultAvatar);
    showToast('Reset to default avatar.', 'info');
  };

  const handleConfirm = () => {
    onSelectAvatar(selectedUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4">
      {/* Dark Blurred Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md"
      />

      {/* Modal Dialog (Angular Chamfered Cut) */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        transition={{ type: 'spring', damping: 26, stiffness: 280 }}
        className="relative z-10 w-full max-w-md angular-cut bg-[#0b0b0e] border border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.95)] p-6 sm:p-7 text-white"
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div>
            <span className="text-[10.5px] font-bold text-[#1e90ff] uppercase tracking-wider">
              Profile Customization
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight mt-0.5 font-heading">
              Change Profile Picture
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 angular-cut-sm bg-white/[0.06] hover:bg-white/[0.12] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close avatar modal"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Selected Preview & Custom Upload */}
        <div className="py-5 flex flex-col items-center text-center gap-4">
          <div className="relative w-24 h-24 angular-cut-sm overflow-hidden border-2 border-[#1e90ff] shadow-[0_0_20px_rgba(30,144,255,0.35)] bg-black">
            <img 
              src={selectedUrl} 
              alt="Selected Preview" 
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200&auto=format&fit=crop&q=80';
              }}
              className="w-full h-full object-cover" 
            />
          </div>

          <div>
            <p className="text-xs font-bold text-white">Active Profile Picture</p>
            <p className="text-[11px] text-[#d8d8d8] mt-0.5">
              Upload a custom picture from your device or use your default avatar.
            </p>
          </div>

          <div className="flex items-center gap-2.5 mt-1">
            <label className="px-3.5 py-1.5 angular-cut-sm bg-[#161824] hover:bg-[#1f2233] border border-white/[0.12] hover:border-[#1e90ff] text-xs font-semibold text-zinc-200 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-xs">
              <Upload className="w-3.5 h-3.5 text-[#1e90ff]" />
              <span>{uploading ? 'Loading...' : 'Upload Image'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>

            <button
              type="button"
              onClick={handleResetDefault}
              className="px-3 py-1.5 angular-cut-sm bg-[#161824] hover:bg-[#1f2233] border border-white/[0.12] text-xs font-semibold text-zinc-400 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Default</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="h-8 px-4 angular-cut-sm bg-white/[0.06] hover:bg-white/[0.12] text-xs text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="angular-btn-primary-sm h-8 px-5 flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save Avatar</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
