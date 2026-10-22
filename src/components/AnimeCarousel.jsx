import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import AnimeCard from './AnimeCard';

export default function AnimeCarousel({ 
  title, 
  subtitle, 
  items = [], 
  showRank = false, 
  viewAllLink = '/search',
  onOpenEpisodeTracker 
}) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -650 : 650;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <section className="mt-6 sm:mt-10">
      {/* Section Header */}
      <div className="flex items-end justify-between mb-3 sm:mb-4 px-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 bg-[#1e90ff] shadow-[0_0_8px_#1e90ff]" />
            <h2 className="text-base sm:text-xl font-bold text-white tracking-tight uppercase font-heading">
              {title}
            </h2>
          </div>
          {subtitle && (
            <p className="text-[11px] sm:text-[13.5px] text-[#d8d8d8] font-normal">
              {subtitle}
            </p>
          )}
        </div>

        {/* View All & Circular Arrow Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {viewAllLink && (
            <Link
              to={viewAllLink}
              className="inline-flex items-center gap-1 sm:gap-1.5 text-xs font-semibold text-[#d8d8d8] hover:text-[#1e90ff] transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}

          <div className="hidden sm:flex items-center gap-2 ml-1">
            <button
              onClick={() => scroll('left')}
              className="enma-circle-btn w-9 h-9"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="enma-circle-btn w-9 h-9"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div
        ref={scrollRef}
        className="flex items-stretch gap-2.5 sm:gap-5 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-2.5 sm:pb-4 pt-1 px-1 -mx-1"
      >
        {items.map((anime, index) => (
          <div
            key={anime.id}
            className="w-[124px] sm:w-[175px] md:w-[205px] shrink-0 snap-start flex"
          >
            <AnimeCard
              anime={anime}
              rank={showRank ? (anime.rank || index + 1) : undefined}
              onOpenEpisodeTracker={onOpenEpisodeTracker}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
