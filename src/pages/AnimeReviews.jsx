import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, MessageSquare, ArrowLeft, Filter, ArrowUpDown } from 'lucide-react';
import { getAnimeById } from '../api/anilist';
import { useReviews } from '../context/ReviewsContext';
import ReviewCard from '../components/ReviewCard';
import WriteReviewModal from '../components/WriteReviewModal';
import EmptyState from '../components/EmptyState';

export default function AnimeReviews() {
  const { id } = useParams();
  const { getAnimeReviews, deleteReview } = useReviews();

  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState('All');
  const [sortBy, setSortBy] = useState('latest');
  const [writeModalOpen, setWriteModalOpen] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    async function loadAnime() {
      setLoading(true);
      try {
        const data = await getAnimeById(id);
        if (isCurrent) setAnime(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (isCurrent) setLoading(false);
      }
    }
    loadAnime();
    return () => { isCurrent = false; };
  }, [id]);

  const rawReviews = getAnimeReviews(id);

  // Apply rating filter
  let filtered = [...rawReviews];
  if (ratingFilter !== 'All') {
    const star = parseInt(ratingFilter, 10);
    filtered = filtered.filter((r) => Math.round(r.rating) === star);
  }

  // Apply sorting
  filtered.sort((a, b) => {
    if (sortBy === 'highest') return b.rating - a.rating;
    if (sortBy === 'lowest') return a.rating - b.rating;
    // Default latest
    return new Date(b.created_at) - new Date(a.created_at);
  });

  const title = anime?.title?.english || anime?.title?.romaji || 'Anime';

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 pb-4 sm:pb-12">
      
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.06]">
        <div className="angular-btn-secondary-sm-wrap">
          <Link
            to={`/anime/${id}`}
            className="angular-btn-secondary-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO DETAILS</span>
          </Link>
        </div>

        <button
          onClick={() => setWriteModalOpen(true)}
          className="angular-btn-primary h-[38px] px-5 text-xs font-bold tracking-wider"
        >
          Write Review
        </button>
      </div>

      {/* Header Banner (Angular Chamfered Cut) */}
      <div className="p-6 angular-cut bg-[#0b0b0b] border border-white/[0.08] mb-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#1e90ff]">
            Community Reviews
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1 font-heading">
            {title}
          </h1>
          <p className="text-xs sm:text-[13.5px] text-[#d8d8d8] mt-1 font-normal">
            Total {rawReviews.length} community review{rawReviews.length !== 1 ? 's' : ''} published.
          </p>
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Rating Filter */}
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-3.5 py-2 angular-cut-sm bg-[#111111] border border-white/[0.08] text-xs font-medium text-white shadow-sm cursor-pointer focus:border-[#1e90ff] focus:outline-none"
          >
            <option value="All" className="bg-[#111111] text-white">All Ratings</option>
            <option value="5" className="bg-[#111111] text-white">5 Stars</option>
            <option value="4" className="bg-[#111111] text-white">4 Stars</option>
            <option value="3" className="bg-[#111111] text-white">3 Stars</option>
            <option value="2" className="bg-[#111111] text-white">2 Stars</option>
            <option value="1" className="bg-[#111111] text-white">1 Star</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3.5 py-2 angular-cut-sm bg-[#111111] border border-white/[0.08] text-xs font-medium text-white shadow-sm cursor-pointer focus:border-[#1e90ff] focus:outline-none"
          >
            <option value="latest" className="bg-[#111111] text-white">Sort: Latest</option>
            <option value="highest" className="bg-[#111111] text-white">Sort: Highest Rated</option>
            <option value="lowest" className="bg-[#111111] text-white">Sort: Lowest Rated</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      {filtered.length > 0 ? (
        <div className="flex flex-col gap-5">
          {filtered.map((rev) => (
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
          title="No reviews match your filters"
          description="Try switching the star rating or be the first to post a new review!"
          actionText="Write Review"
          onAction={() => setWriteModalOpen(true)}
        />
      )}

      {/* Write Review Modal */}
      <WriteReviewModal
        anime={anime}
        isOpen={writeModalOpen}
        onClose={() => setWriteModalOpen(false)}
      />

    </div>
  );
}
