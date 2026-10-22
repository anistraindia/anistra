import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Star, Compass } from 'lucide-react';
import { useReviews } from '../context/ReviewsContext';
import { useAuth } from '../context/AuthContext';
import ReviewCard from '../components/ReviewCard';
import EmptyState from '../components/EmptyState';

export default function Reviews() {
  const { user } = useAuth();
  const { getUserReviews, deleteReview } = useReviews();

  const userReviews = getUserReviews();

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 pb-4 md:pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-5 border-b border-white/[0.06] gap-4 mb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#1e90ff]">
            Your Contributions
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight uppercase mt-1 font-heading">
            My Reviews
          </h1>
          <p className="text-xs sm:text-[13.5px] text-[#d8d8d8] mt-1 font-normal">
            Manage your anime reviews, critique logs, and community ratings.
          </p>
        </div>

        {userReviews.length > 0 && (
          <div className="px-4 py-1.5 angular-cut-sm bg-[#111111] border border-white/[0.08] text-xs font-semibold text-[#d8d8d8] shadow-sm">
            {userReviews.length} Review{userReviews.length !== 1 ? 's' : ''} Posted
          </div>
        )}
      </div>

      {/* Reviews Content */}
      {userReviews.length > 0 ? (
        <div className="flex flex-col gap-5">
          {userReviews.map((rev) => (
            <ReviewCard
              key={rev.id}
              review={rev}
              onDelete={deleteReview}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          type="reviews"
          title="No Reviews Yet"
          description="You haven't posted any anime reviews. Discover an anime and share your thoughts."
          actionText="Explore Anime"
          actionLink="/search"
        />
      )}

    </div>
  );
}
