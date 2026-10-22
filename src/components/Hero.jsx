import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Bookmark, Check, ChevronLeft, ChevronRight, Play, Compass, Flame, Layers } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import { getBaseFranchiseTitle } from '../utils/animeGrouping';

export default function Hero({ animeList = [] }) {
  const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Spotlight collection (top 7 trending anime)
  const heroes = animeList.length > 0 ? animeList.slice(0, 7) : [];
  const N = heroes.length;

  // Auto-advance every 8 seconds, paused on hover
  useEffect(() => {
    if (N <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % N);
      setProgressKey((k) => k + 1);
    }, 8000);
    return () => clearInterval(interval);
  }, [N, isPaused, currentIndex]);

  if (N === 0) return null;

  const current = heroes[currentIndex];
  const isInList = watchlist.some((item) => String(item.anime_id) === String(current.id));

  // Canonical franchise details
  const rawTitle = current.title?.english || current.title?.romaji || 'Anime Spotlight';
  const title = getBaseFranchiseTitle(rawTitle);
  const score = current.rating || (current.averageScore ? (current.averageScore / 20).toFixed(1) : null);
  const banner = current.bannerImage || current.coverImage?.extraLarge || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1600&auto=format&fit=crop&q=80';
  const year = current.year || current.seasonYear || null;
  const format = current.format || 'TV';
  const episodes = current.totalSeriesEpisodes || current.episodes || null;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % N);
    setProgressKey((k) => k + 1);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + N) % N);
    setProgressKey((k) => k + 1);
  };

  const handleSelect = (idx) => {
    setCurrentIndex(idx);
    setProgressKey((k) => k + 1);
  };

  const handleBookmarkToggle = () => {
    if (isInList) {
      removeFromWatchlist(current.id);
    } else {
      addToWatchlist(current, 'Watching');
    }
  };

  // Visible offsets in 3D fan carousel (-2, -1, 0, 1, 2)
  const offsets = [-2, -1, 0, 1, 2];

  return (
    <section 
      aria-label="Cinematic Anime Hero Spotlight"
      className="relative w-full overflow-hidden select-none bg-[#030305] min-h-[480px] sm:min-h-[640px] lg:min-h-[690px] flex flex-col justify-start pt-[76px] sm:pt-[96px] pb-6 sm:pb-12"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ==========================================================
          1. CINEMATIC FULL-BLEED ARTWORK BACKDROP
          Smooth crossfade + subtle ambient scale motion (Ken Burns)
          ========================================================== */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <AnimatePresence mode="sync">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <img
              src={banner}
              alt={title}
              className="w-full h-full object-cover object-center filter brightness-[0.55] contrast-[1.15] blur-[1px]"
            />
          </motion.div>
        </AnimatePresence>

        {/* Multi-layered cinematic gradient shadows for deep immersion */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#030305] via-[#030305]/70 to-[#030305]/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#030305]/85 via-transparent to-transparent h-40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(30,144,255,0.06)_0%,transparent_75%)]" />
      </div>

      {/* ==========================================================
          2. WATERMARK SLIDE NUMBER (Bottom-Right Background)
          ========================================================== */}
      <div 
        aria-hidden="true"
        className="absolute right-4 sm:right-12 bottom-6 sm:bottom-12 z-0 text-[110px] sm:text-[200px] lg:text-[260px] font-black font-heading text-white/[0.035] select-none pointer-events-none leading-none tracking-tighter"
      >
        {String(currentIndex + 1).padStart(2, '0')}
      </div>

      {/* ==========================================================
          3. TOP SPOTLIGHT BAR (Indicator & Slide Count)
          ========================================================== */}
      <div className="relative z-20 w-full max-w-[1340px] mx-auto px-3.5 sm:px-8 flex items-center justify-between mb-1.5 sm:mb-3">
        
        {/* Top-Left: Spotlight Badge with animated progress line */}
        <div className="flex flex-col gap-1 sm:gap-1.5">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3.5 sm:py-1.5 angular-cut-sm bg-black/60 backdrop-blur-md border border-white/[0.1] text-[10.5px] sm:text-xs font-bold text-white uppercase tracking-wider shadow-md">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#1e90ff] shadow-[0_0_8px_#1e90ff] animate-pulse" />
            <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#1e90ff] fill-[#1e90ff]" />
            <span>SPOTLIGHT #{String(currentIndex + 1).padStart(2, '0')}</span>
          </div>

          {/* 8-second auto advance progress bar */}
          <div className="w-20 sm:w-32 h-[2px] bg-white/[0.1] overflow-hidden angular-cut-sm">
            <motion.div
              key={progressKey}
              initial={{ width: '0%' }}
              animate={{ width: isPaused ? '0%' : '100%' }}
              transition={{ duration: isPaused ? 0 : 8, ease: 'linear' }}
              className="h-full bg-[#1e90ff] shadow-[0_0_6px_#1e90ff]"
            />
          </div>
        </div>

        {/* Top-Right: Slide Count */}
        <div className="px-2.5 py-1 sm:px-3.5 sm:py-1.5 angular-cut-sm bg-black/50 backdrop-blur-md border border-white/[0.08] text-[10.5px] sm:text-xs font-mono font-semibold text-zinc-300">
          <span className="text-white font-bold">{String(currentIndex + 1).padStart(2, '0')}</span>
          <span className="text-zinc-500 mx-1 sm:mx-1.5">/</span>
          <span className="text-zinc-500">{String(N).padStart(2, '0')}</span>
        </div>
      </div>

      {/* ==========================================================
          4. 3D FLOATING ANIME POSTER FAN CAROUSEL (Centerpiece)
          Adjusted & compact on mobile screens
          ========================================================== */}
      <div className="relative z-20 w-full max-w-[1100px] mx-auto px-2 sm:px-4 mt-1 sm:mt-2 mb-1 sm:mb-3 flex items-center justify-center">
        
        {/* Left Arrow Button (Angular) */}
        <div className="hidden sm:block absolute left-2 lg:left-8 z-40 angular-nav-arrow-wrap">
          <button
            onClick={handlePrev}
            className="angular-nav-arrow"
            aria-label="Previous featured anime"
            title="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* 3D Poster Stack Container */}
        <motion.div 
          className="relative w-full h-[180px] sm:h-[310px] md:h-[370px] flex items-center justify-center touch-pan-y"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={(e, { offset }) => {
            if (offset.x > 40) handlePrev();
            else if (offset.x < -40) handleNext();
          }}
        >
          {offsets.map((offset) => {
            const index = (currentIndex + offset + N) % N;
            const anime = heroes[index];
            if (!anime) return null;

            const isCenter = offset === 0;
            const animePoster = anime.coverImage?.extraLarge || anime.coverImage?.large || anime.bannerImage;
            const animeRawTitle = anime.title?.english || anime.title?.romaji || 'Anime';
            const animeTitle = getBaseFranchiseTitle(animeRawTitle);

            // Responsive horizontal offsets for 3D fan spread
            let xOffset = 0;
            if (isMobile) {
              if (offset === -1) xOffset = -66;
              else if (offset === 1) xOffset = 66;
            } else {
              if (offset === -2) xOffset = -270;
              else if (offset === -1) xOffset = -145;
              else if (offset === 1) xOffset = 145;
              else if (offset === 2) xOffset = 270;
            }

            const rotation = isMobile ? offset * 3.5 : offset * 5.5;
            const scale = isCenter ? 1 : Math.abs(offset) === 1 ? (isMobile ? 0.84 : 0.86) : 0.72;
            const zIndex = isCenter ? 30 : Math.abs(offset) === 1 ? 20 : 10;
            const opacity = isCenter ? 1 : Math.abs(offset) === 1 ? (isMobile ? 0.82 : 0.78) : 0.42;

            return (
              <motion.div
                key={`${anime.id}-${offset}`}
                onClick={() => handleSelect(index)}
                className={`absolute cursor-pointer transition-all ${
                  Math.abs(offset) === 2 ? 'hidden sm:block' : ''
                }`}
                style={{ zIndex }}
                animate={{
                  x: xOffset,
                  y: isCenter ? 0 : Math.abs(offset) * (isMobile ? 8 : 12),
                  scale,
                  rotateZ: rotation,
                  opacity,
                }}
                transition={{
                  duration: 0.55,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={
                  !isCenter
                    ? { scale: scale * 1.05, opacity: 0.95 }
                    : { scale: 1.02 }
                }
              >
                {/* Poster Frame */}
                <div 
                  className={`relative w-[112px] h-[160px] sm:w-[195px] sm:h-[280px] md:w-[230px] md:h-[330px] angular-cut overflow-hidden ${
                    isCenter 
                      ? 'p-[1.5px] sm:p-[2px] bg-gradient-to-b from-[#1e90ff] via-white/30 to-[#1e90ff]/60 filter drop-shadow-[0_16px_35px_rgba(0,0,0,0.95)] drop-shadow-[0_0_16px_rgba(30,144,255,0.35)]'
                      : 'p-[1px] bg-white/[0.15] filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)]'
                  }`}
                >
                  <div className="w-full h-full angular-cut bg-[#0e1017] relative overflow-hidden">
                    <img
                      src={animePoster}
                      alt={animeTitle}
                      className={`w-full h-full object-cover transition-transform duration-500 ${
                        isCenter ? 'contrast-[1.08] brightness-[1]' : 'brightness-[0.7] contrast-[1.05]'
                      }`}
                      loading="eager"
                    />

                    {/* Subtle poster glass gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/20 pointer-events-none" />

                    {/* Format Pill on Poster */}
                    <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 z-10">
                      <span className="angular-cut-sm px-1.5 py-0.5 sm:px-2 bg-black/75 backdrop-blur-md border border-white/10 text-[9px] sm:text-[10px] font-bold text-white uppercase tracking-wider">
                        {anime.format || 'TV'}
                      </span>
                    </div>

                    {/* Center Poster Title Accent */}
                    {isCenter && (
                      <div className="absolute bottom-1.5 inset-x-1.5 sm:bottom-2.5 sm:inset-x-2.5 z-10 pointer-events-none">
                        <p className="text-[9.5px] sm:text-xs font-bold text-white truncate drop-shadow-md text-center">
                          {animeTitle}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Right Arrow Button (Angular) */}
        <div className="hidden sm:block absolute right-2 lg:right-8 z-40 angular-nav-arrow-wrap">
          <button
            onClick={handleNext}
            className="angular-nav-arrow"
            aria-label="Next featured anime"
            title="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

      </div>

      {/* ==========================================================
          5. FEATURED ANIME DETAILS & CENTERED ANGULAR CTAS
          Clean, elegant typography and information hierarchy
          ========================================================== */}
      <div className="relative z-20 w-full max-w-[900px] mx-auto px-3 sm:px-4 text-center mt-2 sm:mt-5 flex flex-col items-center gap-2 sm:gap-3">
        
        {/* Metadata Badge Row */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id + '-meta'}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap"
          >
            {/* Format Badge */}
            <span className="angular-cut-sm px-2.5 py-0.5 sm:px-3 sm:py-1 bg-[#1e90ff] text-white text-[10px] sm:text-[11px] font-bold tracking-wider uppercase shadow-[0_0_12px_rgba(30,144,255,0.4)]">
              {format}
            </span>

            {/* Score / Rating */}
            {score && (
              <div className="angular-cut-sm px-2.5 py-0.5 sm:px-3 sm:py-1 bg-white/[0.08] backdrop-blur-md border border-white/[0.08] flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-white">
                <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400" />
                <span>★ {score} / 5</span>
              </div>
            )}

            {/* Episode Count */}
            {episodes && (
              <div className="angular-cut-sm px-2.5 py-0.5 sm:px-3 sm:py-1 bg-white/[0.08] backdrop-blur-md border border-white/[0.08] text-[11px] sm:text-xs font-semibold text-zinc-300">
                <span>{episodes} EP</span>
              </div>
            )}

            {/* Release Year */}
            {year && (
              <div className="angular-cut-sm px-2.5 py-0.5 sm:px-3 sm:py-1 bg-white/[0.08] backdrop-blur-md border border-white/[0.08] text-[11px] sm:text-xs font-semibold text-zinc-300">
                <span>{year}</span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Featured Anime Title */}
        <AnimatePresence mode="wait">
          <motion.h1
            key={current.id + '-title'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35 }}
            className="text-lg sm:text-3xl md:text-5xl font-black text-white text-center tracking-tight font-heading max-w-3xl leading-[1.14] drop-shadow-lg line-clamp-2 px-1"
          >
            {title}
          </motion.h1>
        </AnimatePresence>

        {/* Compact Uppercase Genres */}
        {current.genres?.length > 0 && (
          <p className="text-[10px] sm:text-[13px] font-semibold tracking-[0.16em] sm:tracking-[0.2em] uppercase text-zinc-400 max-w-xl truncate px-1">
            {current.genres.slice(0, 4).join(' • ')}
          </p>
        )}

        {/* ========================================================
            6. ANGULAR ACTION BUTTONS (Equal Sizes & Placed Side by Side on Mobile)
            ======================================================== */}
        <div className="flex flex-row items-center justify-center gap-1.5 sm:gap-2.5 flex-nowrap w-full max-w-[460px] sm:max-w-[540px] mx-auto px-2 pt-1 sm:pt-2">
          
          {/* Primary CTA: VIEW DETAILS */}
          <Link
            to={`/anime/${current.id}`}
            className="angular-btn-hero-primary flex-1 min-w-0"
            aria-label={`View ${title} details`}
          >
            <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" />
            <span className="truncate">
              <span className="hidden min-[360px]:inline">VIEW </span>DETAILS
            </span>
          </Link>

          {/* Secondary CTA: BROWSE CATALOGUE */}
          <div className="angular-btn-hero-secondary-wrap flex-1 min-w-0">
            <Link
              to="/search"
              className="angular-btn-hero-secondary w-full"
              aria-label="Browse full anime catalogue"
            >
              <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-300 shrink-0" />
              <span className="truncate">
                <span className="hidden min-[390px]:inline">BROWSE </span>CATALOGUE
              </span>
            </Link>
          </div>

          {/* Tertiary CTA: SAVE BUTTON (Equal Size Side-by-Side) */}
          <div className={`angular-btn-hero-secondary-wrap flex-1 min-w-0 ${isInList ? '!bg-[#1e90ff]' : ''}`}>
            <button
              type="button"
              onClick={handleBookmarkToggle}
              className={`angular-btn-hero-secondary w-full ${
                isInList ? 'text-[#1e90ff] bg-[#1e90ff]/15' : ''
              }`}
              title={isInList ? 'In your watchlist (Click to remove)' : 'Add to your watchlist'}
              aria-label={isInList ? 'Remove from watchlist' : 'Save to watchlist'}
            >
              {isInList ? (
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1e90ff] shrink-0" strokeWidth={2.6} />
              ) : (
                <Bookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-300 shrink-0" strokeWidth={2.2} />
              )}
              <span className="truncate">{isInList ? 'SAVED' : 'SAVE'}</span>
            </button>
          </div>

        </div>

        {/* ========================================================
            7. SLIDE PAGINATION BARS (Angular Indicators)
            ======================================================== */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 pt-1.5 sm:pt-3">
          {heroes.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              className={`h-1 sm:h-1.5 angular-cut-sm transition-all duration-300 cursor-pointer ${
                currentIndex === idx
                  ? 'w-5 sm:w-8 bg-[#1e90ff] shadow-[0_0_10px_#1e90ff]'
                  : 'w-1.5 sm:w-2 bg-white/20 hover:bg-white/40'
              }`}
              aria-label={`Navigate to spotlight slide ${idx + 1}`}
            />
          ))}
        </div>

      </div>

    </section>
  );
}
