import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, MessageSquare, ArrowRight, Layers, Flame, Trophy, Compass } from 'lucide-react';
import Hero from '../components/Hero';
import AnimeCarousel from '../components/AnimeCarousel';
import GenreChips from '../components/GenreChips';
import ThisSeasonSection from '../components/ThisSeasonSection';
import AnimeCard from '../components/AnimeCard';
import ContinueTrackingSection from '../components/ContinueTrackingSection';
import ReviewCard from '../components/ReviewCard';
import EpisodeTrackingModal from '../components/EpisodeTrackingModal';
import { HeroSkeleton, GridSkeleton } from '../components/SkeletonLoader';
import { getTrendingAnime, getPopularAnime, getTopRatedAnime, searchAnime } from '../api/anilist';
import { useReviews } from '../context/ReviewsContext';

export default function Home() {
  const { reviews } = useReviews();

  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [genreAnime, setGenreAnime] = useState([]);
  const [genreLoading, setGenreLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [trackingModalAnime, setTrackingModalAnime] = useState(null);

  // Load discovery data
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const [trendData, popData, topData] = await Promise.all([
          getTrendingAnime(12),
          getPopularAnime(18),
          getTopRatedAnime(12)
        ]);

        if (isMounted) {
          setTrending(trendData);
          setPopular(popData);
          setTopRated(topData);
          setGenreAnime(popData.slice(0, 12));
        }
      } catch (err) {
        console.error('Failed to load home discovery anime:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, []);

  // Update genre-filtered popular anime
  useEffect(() => {
    let isMounted = true;
    async function filterByGenre() {
      if (selectedGenre === 'All') {
        if (popular.length > 0) setGenreAnime(popular.slice(0, 12));
        return;
      }

      setGenreLoading(true);
      try {
        const res = await searchAnime({ genre: selectedGenre, perPage: 12 });
        if (isMounted && res.anime) {
          setGenreAnime(res.anime);
        }
      } catch (err) {
        console.error('Failed to load genre anime:', err);
      } finally {
        if (isMounted) setGenreLoading(false);
      }
    }

    filterByGenre();
    return () => { isMounted = false; };
  }, [selectedGenre, popular]);

  const latestReviews = reviews.slice(0, 4);

  return (
    <div className="w-full pb-4 sm:pb-8">
      
      {/* 1. CINEMATIC HERO SECTION (Full-Bleed Viewport Width) */}
      {loading ? (
        <div className="w-full max-w-[1340px] mx-auto px-3.5 sm:px-6 lg:px-8">
          <HeroSkeleton />
        </div>
      ) : (
        <Hero animeList={trending} />
      )}

      {/* Main Discoveries & Content Grid */}
      <div className="w-full max-w-[1340px] mx-auto px-3.5 sm:px-6 lg:px-8">
        
        {/* 2. TRENDING NOW SECTION */}
        <AnimeCarousel
          title="TRENDING NOW"
          subtitle="The most popular anime right now across global fandoms."
          items={trending}
          showRank={true}
          viewAllLink="/search?sort=TRENDING_DESC"
          onOpenEpisodeTracker={(anime) => setTrackingModalAnime(anime)}
        />

      {/* 3. GENRE CHIPS & DYNAMIC GENRE GRID */}
      <section className="mt-8 sm:mt-10">
        <div className="flex items-end justify-between mb-4 px-1">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 bg-[#1e90ff] shadow-[0_0_8px_#1e90ff]" />
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight uppercase font-heading">
                BROWSE BY GENRE
              </h2>
            </div>
            <p className="text-xs sm:text-[13.5px] text-[#d8d8d8] font-normal">
              Filter current trending worlds and thematic universes.
            </p>
          </div>
          <Link 
            to={selectedGenre === 'All' ? '/search' : `/search?genre=${encodeURIComponent(selectedGenre)}`} 
            className="text-xs font-semibold text-[#d8d8d8] hover:text-[#1e90ff] flex items-center gap-1.5 transition-colors"
          >
            <span>{selectedGenre === 'All' ? 'All Categories' : `More ${selectedGenre}`}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <GenreChips selectedGenre={selectedGenre} onSelectGenre={setSelectedGenre} />

        {/* Dynamic Genre Anime Cards Grid right inside BROWSE BY GENRE */}
        <div className="mt-5">
          {genreLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] angular-card-wrap bg-[#111111] animate-pulse border border-white/[0.06]" />
              ))}
            </div>
          ) : genreAnime.length === 0 ? (
            <div className="py-12 text-center text-zinc-400 text-xs sm:text-sm angular-cut bg-[#0b0c10] border border-white/[0.06]">
              No anime found for {selectedGenre}.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {genreAnime.map((anime) => (
                <AnimeCard
                  key={anime.id}
                  anime={anime}
                  onOpenEpisodeTracker={(a) => setTrackingModalAnime(a)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. THIS SEASON SECTION (Section 17) */}
      <ThisSeasonSection 
        onOpenEpisodeTracker={(anime) => setTrackingModalAnime(anime)} 
      />

      {/* 5. CONTINUE TRACKING SECTION (Section 18) */}
      <ContinueTrackingSection 
        onOpenEpisodeTracker={(anime) => setTrackingModalAnime(anime)} 
      />

      {/* 6. POPULAR ANIME GRID */}
      <section className="mt-8 sm:mt-10">
        <div className="flex items-end justify-between mb-4 px-1">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 bg-[#1e90ff] shadow-[0_0_8px_#1e90ff]" />
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight uppercase font-heading">
                POPULAR DISCOVERIES
              </h2>
            </div>
            <p className="text-xs sm:text-[13.5px] text-[#d8d8d8] font-normal">
              All-time community favorites and seasonal blockbusters.
            </p>
          </div>
          <Link
            to="/search?sort=POPULARITY_DESC"
            className="text-xs font-semibold text-[#d8d8d8] hover:text-[#1e90ff] flex items-center gap-1.5 transition-colors"
          >
            <span>Explore All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <GridSkeleton count={12} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {popular.slice(0, 12).map((anime) => (
              <AnimeCard
                key={anime.id}
                anime={anime}
                onOpenEpisodeTracker={(a) => setTrackingModalAnime(a)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 7. TOP RATED ALL TIME */}
      <AnimeCarousel
        title="CRITICALLY ACCLAIMED"
        subtitle="Masterpieces voted highest by global anime critics and members."
        items={topRated}
        showRank={true}
        viewAllLink="/search?sort=SCORE_DESC"
        onOpenEpisodeTracker={(anime) => setTrackingModalAnime(anime)}
      />

      {/* 8. LATEST COMMUNITY REVIEWS */}
      <section className="mt-8 sm:mt-10">
        <div className="flex items-end justify-between mb-4 px-1">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 bg-[#1e90ff] shadow-[0_0_8px_#1e90ff]" />
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight uppercase font-heading">
                COMMUNITY REVIEWS
              </h2>
            </div>
            <p className="text-xs sm:text-[13.5px] text-[#d8d8d8] font-normal">
              Perspectives and critiques from verified ANISTRA members.
            </p>
          </div>

          <Link
            to="/reviews"
            className="text-xs font-semibold text-[#d8d8d8] hover:text-[#1e90ff] flex items-center gap-1.5 transition-colors"
          >
            <span>All Reviews</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {latestReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </section>

      {/* Global Episode Tracking Modal */}
      <EpisodeTrackingModal
        anime={trackingModalAnime}
        isOpen={Boolean(trackingModalAnime)}
        onClose={() => setTrackingModalAnime(null)}
      />

      </div>
    </div>
  );
}
