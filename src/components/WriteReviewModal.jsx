import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Star, AlertCircle, ShieldAlert } from 'lucide-react';
import { useReviews } from '../context/ReviewsContext';
import { useAuth } from '../context/AuthContext';
import { validateReview } from '../utils/moderation';

export default function WriteReviewModal({ anime, isOpen, onClose, onReviewSubmitted }) {
  const { user, loginWithGoogle } = useAuth();
  const { addReview } = useReviews();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [containsSpoiler, setContainsSpoiler] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !anime) return null;

  const title = anime.title?.english || anime.title?.romaji || 'Anime';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!user) {
      setErrorMsg('Please log in with Google to post your review.');
      return;
    }

    const validation = validateReview(reviewText);
    if (!validation.isValid) {
      setErrorMsg(validation.error);
      return;
    }

    setSubmitting(true);
    const result = await addReview({
      animeId: anime.id,
      animeTitle: title,
      rating,
      reviewText,
      containsSpoiler
    });
    setSubmitting(false);

    if (result.success) {
      setReviewText('');
      setContainsSpoiler(false);
      onClose();
      if (onReviewSubmitted) onReviewSubmitted();
    } else {
      setErrorMsg(result.error);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Dark Blurred Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md"
      />

      {/* Modal / Bottom Sheet (Angular Chamfered Cut) */}
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 280 }}
        className="relative z-10 w-full sm:max-w-xl angular-cut bg-[#0b0b0b] border border-white/[0.12] shadow-[0_25px_80px_rgba(0,0,0,0.95)] p-5 sm:p-7 overflow-hidden max-h-[90vh] flex flex-col text-white"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/[0.06]">
          <div>
            <span className="text-xs font-bold text-[#1e90ff] uppercase tracking-wider">
              Share Your Thoughts
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight mt-0.5 font-heading">
              Review: {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 angular-cut-sm bg-[#111111] border border-white/[0.08] hover:bg-[#181818] text-[#d8d8d8] hover:text-white transition-colors cursor-pointer"
            aria-label="Close review dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4 overflow-y-auto pr-1">
          
          {/* Star Rating Picker */}
          <div>
            <label className="text-xs font-semibold tracking-wider text-[#d8d8d8] uppercase block mb-2">
              Your Rating (out of 5)
            </label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 p-2 angular-cut-sm bg-[#111111] border border-white/[0.08]">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 cursor-pointer transition-transform hover:scale-115 focus:outline-none"
                    aria-label={`Rate ${star} stars`}
                  >
                    <Star
                      className={`w-5 h-5 transition-colors ${
                        star <= (hoverRating || rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-zinc-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs sm:text-sm font-bold text-amber-400 font-mono ml-2">
                {rating}.0 / 5.0
              </span>
            </div>
          </div>

          {/* Review Text Area */}
          <div>
            <label className="text-xs font-semibold tracking-wider text-[#d8d8d8] uppercase block mb-2">
              Review
            </label>
            <textarea
              rows={4}
              value={reviewText}
              onChange={(e) => {
                setReviewText(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="What made this anime remarkable? Discuss pacing, character growth, animation, or music..."
              className="w-full angular-cut-sm bg-[#111111] border border-white/[0.08] p-3.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#1e90ff] transition-colors resize-none shadow-sm"
              required
            />
          </div>

          {/* Spoiler Checkbox */}
          <div className="flex items-center gap-3 p-3 angular-cut-sm bg-[#111111] border border-white/[0.06]">
            <input
              id="spoiler-check"
              type="checkbox"
              checked={containsSpoiler}
              onChange={(e) => setContainsSpoiler(e.target.checked)}
              className="w-4 h-4 text-[#1e90ff] focus:ring-[#1e90ff] border-white/20 cursor-pointer accent-[#1e90ff]"
            />
            <label htmlFor="spoiler-check" className="text-xs font-medium text-[#d8d8d8] cursor-pointer select-none">
              Contains spoilers (will be shielded from community until revealed)
            </label>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3.5 angular-cut-sm bg-[#ff5a5f]/15 border border-[#ff5a5f]/30 flex items-start gap-2.5 text-xs text-[#ff5a5f]">
              <ShieldAlert className="w-4 h-4 text-[#ff5a5f] shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 angular-cut-sm text-xs font-semibold text-[#d8d8d8] hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="angular-btn-primary h-[40px] px-6 text-xs disabled:opacity-50"
            >
              {submitting ? 'Publishing...' : 'Post Review'}
            </button>
          </div>

        </form>
      </motion.div>
    </div>
  );
}
