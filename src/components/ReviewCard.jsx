import React, { useState } from 'react';
import { Star, AlertTriangle, Eye, EyeOff, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ReviewCard({ review, onDelete }) {
  const { user } = useAuth();
  const [revealed, setRevealed] = useState(!review.contains_spoiler);

  if (!review) return null;

  const isAuthor = user && (user.id === review.user_id || user.username === review.username);

  // Time ago formatter
  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return 'Recently';
    const date = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);

    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div 
      className="p-4 sm:p-5 angular-cut bg-[#0b0b0b] border border-white/[0.06] hover:border-white/[0.14] flex flex-col justify-between transition-all duration-200"
    >
      {/* Review Header: Avatar, Username, Date, Rating */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={review.avatar_url || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=100&auto=format&fit=crop&q=80'}
              alt={review.username}
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=100&auto=format&fit=crop&q=80';
              }}
              className="w-10 h-10 angular-cut-sm object-cover border border-white/15 shadow-xs bg-[#12141d]"
            />
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm font-bold text-white tracking-tight">@{review.username}</span>
                {review.anime_title && (
                  <span className="text-xs text-zinc-400">
                    on <span className="text-zinc-200 font-semibold">{review.anime_title}</span>
                  </span>
                )}
              </div>
              <span className="text-[11px] text-zinc-500 font-medium">{formatTimeAgo(review.created_at)}</span>
            </div>
          </div>

          {/* Rating Stars (Amber) */}
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3.5 h-3.5 ${
                  star <= Math.round(review.rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-zinc-700 fill-zinc-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Review Body & Spoiler Shield */}
        <div className="mt-4">
          {review.contains_spoiler && !revealed ? (
            <div className="p-4 angular-cut bg-amber-950/30 border border-amber-500/30 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-amber-300 uppercase tracking-wider">⚠ Contains Spoilers</p>
                  <p className="text-[11px] text-amber-200/80 mt-0.5">This review discusses major plot developments.</p>
                </div>
              </div>
              <button
                onClick={() => setRevealed(true)}
                className="px-4 py-1.5 angular-cut-sm bg-amber-500/20 border border-amber-500/40 text-xs font-bold text-amber-200 hover:bg-amber-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
              >
                <Eye className="w-3.5 h-3.5 text-amber-300" />
                <span>Reveal Review</span>
              </button>
            </div>
          ) : (
            <div className="relative">
              {review.contains_spoiler && (
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 angular-cut-sm bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    ⚠ Spoiler Content
                  </span>
                  <button
                    onClick={() => setRevealed(false)}
                    className="text-[11px] text-[#d8d8d8] hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <EyeOff className="w-3 h-3" />
                    <span>Hide</span>
                  </button>
                </div>
              )}
              <p className="text-xs sm:text-[14px] text-[#d8d8d8] leading-[1.65] font-normal whitespace-pre-line">
                "{review.review_text}"
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer / Delete Action */}
      {isAuthor && onDelete && (
        <div className="mt-4 pt-3 border-t border-white/[0.08] flex justify-end">
          <button
            onClick={() => onDelete(review.id)}
            className="text-xs text-[#ff5a5f] hover:underline flex items-center gap-1 cursor-pointer transition-colors font-medium"
            title="Delete your review"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
}
