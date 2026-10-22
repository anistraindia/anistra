import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { validateReview } from '../utils/moderation';

const ReviewsContext = createContext(null);

const STORAGE_KEY_REVIEWS = 'anistra_community_reviews';

export function ReviewsProvider({ children }) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialize reviews
  useEffect(() => {
    async function loadReviews() {
      setLoading(true);

      // Clean up any legacy demo reviews from localStorage
      try {
        const saved = localStorage.getItem(STORAGE_KEY_REVIEWS);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const purged = parsed.filter(r => !String(r.id).startsWith('rev-'));
            if (purged.length !== parsed.length) {
              localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(purged));
            }
          }
        }
      } catch (e) {}

      if (isSupabaseConfigured && supabase) {
        try {
          let { data, error } = await supabase
            .from('reviews')
            .select('*, profiles(username, avatar_url)')
            .order('created_at', { ascending: false });

          if (error) {
            const fallbackRes = await supabase
              .from('reviews')
              .select('*')
              .order('created_at', { ascending: false });
            data = fallbackRes.data;
          }

          if (data && data.length > 0) {
            const mapped = data.map(r => ({
              id: r.id,
              anime_id: r.anime_id,
              user_id: r.user_id,
              username: r.profiles?.username || 'traveler',
              avatar_url: r.profiles?.avatar_url || '',
              rating: Number(r.rating),
              review_text: r.review_text,
              contains_spoiler: Boolean(r.contains_spoiler),
              created_at: r.created_at
            }));
            setReviews(mapped);
          } else {
            setReviews([]);
          }
        } catch (e) {
          console.warn('Supabase reviews load error:', e);
          setReviews([]);
        }
      } else {
        // Local storage initialization (Real user reviews only, NO demo reviews)
        try {
          const saved = localStorage.getItem(STORAGE_KEY_REVIEWS);
          if (saved) {
            const parsed = JSON.parse(saved);
            const userOnly = Array.isArray(parsed) ? parsed.filter(r => !String(r.id).startsWith('rev-')) : [];
            setReviews(userOnly);
          } else {
            setReviews([]);
          }
        } catch (e) {
          setReviews([]);
        }
      }

      setLoading(false);
    }

    loadReviews();
  }, []);

  const saveReviewsLocal = (newReviews) => {
    setReviews(newReviews);
    try {
      localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(newReviews));
    } catch (e) {}
  };

  /**
   * Post a new review with strict moderation checks
   */
  const addReview = async ({ animeId, animeTitle, rating, reviewText, containsSpoiler = false }) => {
    if (!user) {
      showToast('Please log in to post a review.', 'error');
      return { success: false, error: 'Authentication required' };
    }

    // Run Moderation Engine
    const modResult = validateReview(reviewText);
    if (!modResult.isValid) {
      showToast(modResult.error, 'error', 5000);
      return { success: false, error: modResult.error };
    }

    if (!rating || rating < 1 || rating > 5) {
      showToast('Please select a star rating between 1 and 5.', 'warning');
      return { success: false, error: 'Invalid rating' };
    }

    const newReview = {
      id: `rev_${Date.now()}`,
      anime_id: String(animeId),
      anime_title: animeTitle || 'Anime',
      user_id: user.id,
      username: user.username || 'traveler',
      avatar_url: user.avatar_url || '',
      rating: Number(rating),
      review_text: modResult.sanitizedText,
      contains_spoiler: Boolean(containsSpoiler),
      created_at: new Date().toISOString()
    };

    const updated = [newReview, ...reviews];
    saveReviewsLocal(updated);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('reviews').insert({
          user_id: user.id,
          anime_id: String(animeId),
          rating: Number(rating),
          review_text: modResult.sanitizedText,
          contains_spoiler: Boolean(containsSpoiler),
          created_at: newReview.created_at
        });

        if (error) {
          console.warn('Supabase review insert error:', error);
        }
      } catch (err) {}
    }

    showToast('Your review has been published!', 'success');
    return { success: true };
  };

  /**
   * Delete a review
   */
  const deleteReview = async (reviewId) => {
    const updated = reviews.filter(r => r.id !== reviewId);
    saveReviewsLocal(updated);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('reviews').delete().eq('id', reviewId);
      } catch (e) {}
    }

    showToast('Review removed', 'info');
  };

  /**
   * Get reviews for a specific anime
   */
  const getAnimeReviews = (animeId) => {
    const idStr = String(animeId);
    return reviews.filter(r => String(r.anime_id) === idStr);
  };

  /**
   * Get reviews posted by the current user
   */
  const getUserReviews = () => {
    if (!user) return [];
    return reviews.filter(r => r.user_id === user.id || r.username === user.username);
  };

  return (
    <ReviewsContext.Provider
      value={{
        reviews,
        loading,
        addReview,
        deleteReview,
        getAnimeReviews,
        getUserReviews
      }}
    >
      {children}
    </ReviewsContext.Provider>
  );
}

export function useReviews() {
  const context = useContext(ReviewsContext);
  if (!context) {
    throw new Error('useReviews must be used within a ReviewsProvider');
  }
  return context;
}
