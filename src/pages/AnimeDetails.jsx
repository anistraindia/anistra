import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Star, Bookmark, Check, Layers, MessageSquare, 
  Calendar, Clock, Tv, Film, Building2, BookOpen, Share2, 
  CheckCircle2, ChevronRight, ArrowLeft, Database, Sparkles, Flame, Trophy 
} from 'lucide-react';
import { getAnimeById } from '../api/anilist';
import { getAccurateEpisodeGuide } from '../services/episodeGuideService';
import { useWatchlist } from '../context/WatchlistContext';
import { useReviews } from '../context/ReviewsContext';
import { useAuth } from '../context/AuthContext';
import ReviewCard from '../components/ReviewCard';
import EpisodeTrackingModal from '../components/EpisodeTrackingModal';
import WriteReviewModal from '../components/WriteReviewModal';
import { HeroSkeleton, EpisodesSkeleton, ReviewSkeleton } from '../components/SkeletonLoader';
import { useToast } from '../context/ToastContext';
import { getBaseFranchiseTitle, getTotalEpisodes } from '../utils/animeGrouping';

export default function AnimeDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { 
    watchlist, 
    addToWatchlist, 
    removeFromWatchlist, 
    updateWatchlistStatus,
    toggleEpisodeWatched,
    isEpisodeWatched,
    getWatchedCount,
    getNextEpisode
  } = useWatchlist();
  const { getAnimeReviews } = useReviews();

  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guide, setGuide] = useState(null);
  const [loadingGuide, setLoadingGuide] = useState(true);
  const [activeSeasonIndex, setActiveSeasonIndex] = useState(0);
  const [activeBatchIndex, setActiveBatchIndex] = useState(0);
  const [viewAllSeasons, setViewAllSeasons] = useState(false);
  const [hoveredEp, setHoveredEp] = useState(null);

  const [trackerModalOpen, setTrackerModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    async function loadDetails() {
      setLoading(true);
      setLoadingGuide(true);
      try {
        const data = await getAnimeById(id);
        if (isCurrent) {
          setAnime(data);
          setLoading(false);

          getAccurateEpisodeGuide(data).then((guideData) => {
            if (isCurrent) {
              setGuide(guideData);
              setActiveSeasonIndex(0);
              setLoadingGuide(false);
            }
          });
        }
      } catch (err) {
        console.error('Anime details load error:', err);
      } finally {
        if (isCurrent) setLoading(false);
      }
    }

    loadDetails();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return () => { isCurrent = false; };
  }, [id]);

  const animeIdStr = anime ? String(anime.id) : '';
  const currentSeason = guide?.seasons?.[activeSeasonIndex] || {
    seasonNumber: 1,
    seasonTitle: 'SEASON 1',
    episodes: anime ? Array.from({ length: anime.episodes || 12 }, (_, i) => ({ number: i + 1 })) : []
  };

  const currentEpisodes = currentSeason?.episodes || [];
  const rawTotal = guide?.totalEpisodes || getTotalEpisodes(anime);
  const rawWatched = animeIdStr ? getWatchedCount(animeIdStr) : 0;
  const isCompleted = currentStatus === 'Completed';
  const totalEpisodes = Math.max(rawTotal, rawWatched, 1);
  const displayWatched = isCompleted ? totalEpisodes : Math.min(rawWatched, totalEpisodes);
  const nextEp = isCompleted ? null : (animeIdStr ? getNextEpisode(animeIdStr, totalEpisodes, currentSeason.seasonNumber) : null);
  const progressPercent = isCompleted ? 100 : Math.min(100, Math.round((displayWatched / totalEpisodes) * 100));

  // Batching: if more than 50 episodes in current season, divide into batches (1-50, 51-100, 101-150...)
  const BATCH_SIZE = 50;
  const isBatched = currentEpisodes.length > BATCH_SIZE;

  const batches = useMemo(() => {
    if (!isBatched) return [];
    const res = [];
    for (let i = 0; i < currentEpisodes.length; i += BATCH_SIZE) {
      const slice = currentEpisodes.slice(i, i + BATCH_SIZE);
      const startNum = slice[0]?.number ?? (i + 1);
      const endNum = slice[slice.length - 1]?.number ?? (i + slice.length);
      res.push({
        index: res.length,
        label: `${startNum}-${endNum}`,
        episodes: slice,
        startNum,
        endNum
      });
    }
    return res;
  }, [currentEpisodes, isBatched]);

  // Auto-switch to batch containing nextEp or reset on season change
  useEffect(() => {
    if (isBatched && nextEp) {
      const foundIdx = batches.findIndex(
        (b) => nextEp >= b.startNum && nextEp <= b.endNum
      );
      if (foundIdx !== -1) {
        setActiveBatchIndex(foundIdx);
        return;
      }
    }
    setActiveBatchIndex(0);
  }, [activeSeasonIndex, isBatched, currentEpisodes.length, nextEp]);

  const displayedEpisodes = isBatched && batches[activeBatchIndex]
    ? batches[activeBatchIndex].episodes
    : currentEpisodes;

  if (loading) {
    return (
      <div className="w-full max-w-[1340px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <HeroSkeleton />
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="w-full max-w-xl mx-auto py-24 px-4 text-center">
        <h2 className="text-2xl font-black text-white font-heading">Anime Not Found</h2>
        <p className="text-sm text-zinc-400 mt-2 mb-6">
          We couldn't retrieve the details for this title right now.
        </p>
        <Link
          to="/search"
          className="angular-btn-primary inline-flex"
        >
          Return to Search
        </Link>
      </div>
    );
  }

  const watchItem = watchlist.find((item) => String(item.anime_id) === animeIdStr);
  const isInList = Boolean(watchItem);
  const currentStatus = watchItem?.status || 'Watching';

  // Canonical Franchise Title (Ensures NO "Season 2" or "2nd Season" duplicates!)
  const rawTitle = anime.title?.english || anime.title?.romaji || 'Anime';
  const title = getBaseFranchiseTitle(rawTitle);
  const nativeTitle = anime.title?.native || '';
  const romajiTitle = getBaseFranchiseTitle(anime.title?.romaji || '');
  const banner = anime.bannerImage || anime.coverImage?.extraLarge || '';
  const cover = anime.coverImage?.extraLarge || anime.coverImage?.large || '';
  const score = anime.rating || (anime.averageScore ? (anime.averageScore / 20).toFixed(1) : '4.8');
  const studio = anime.studio || (anime.studios?.nodes?.[0]?.name) || 'Animation Studio';
  const totalSeasons = guide?.seasons?.length || anime.seasonsCount || 1;

  // Get community reviews (latest 5)
  const allAnimeReviews = getAnimeReviews(animeIdStr);
  const latest5Reviews = allAnimeReviews.slice(0, 5);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${title} on ANISTRA`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard!', 'info');
    }
  };

  return (
    <div className="w-full max-w-[1340px] mx-auto px-3.5 sm:px-6 lg:px-8 pb-4 sm:pb-12">
      
      {/* Top Breadcrumb */}
      <div className="py-3 sm:py-4">
        <div className="angular-btn-secondary-sm-wrap">
          <Link
            to="/search"
            className="angular-btn-secondary-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO EXPLORE</span>
          </Link>
        </div>
      </div>

      {/* Cinematic Hero Box (Angular Chamfered Shapes) */}
      <div className="relative angular-cut-lg overflow-hidden bg-[#0b0b0b] border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
        
        {/* Banner with soft cinematic fade */}
        <div className="relative w-full h-[200px] sm:h-[340px] lg:h-[380px] overflow-hidden">
          <img
            src={banner}
            alt={title}
            className="w-full h-full object-cover object-center filter brightness-[0.78]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0b] via-[#0b0b0b]/60 to-transparent" />
        </div>

        {/* Content Box Overlapping Banner */}
        <div className="p-4 sm:p-7 lg:p-10 -mt-10 sm:-mt-24 relative z-10 flex flex-col lg:flex-row gap-6 sm:gap-8 items-center lg:items-start justify-between">
          
          {/* LEFT: Poster Card & Title & Actions */}
          <div className="flex flex-col sm:flex-row gap-5 sm:gap-7 items-center sm:items-start w-full lg:max-w-[720px]">
            {/* Poster with Angular Corner Cut Shape (Scaled down to balanced proportions) */}
            <div className="relative shrink-0 mx-auto sm:mx-0">
              <div className="relative w-28 sm:w-36 lg:w-40 aspect-[2/3] angular-card-wrap filter drop-shadow-[0_20px_45px_rgba(0,0,0,0.9)]">
                <div className="w-full h-full angular-card bg-[#000000] overflow-hidden">
                  <img src={cover} alt={title} className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            {/* Title, Badges, Genres, Actions */}
            <div className="flex-1 flex flex-col justify-end text-center sm:text-left items-center sm:items-start w-full">
              
              {/* Badges (Angular Corner Cut Shapes) */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2 mb-2">
                <div className="chip-enma">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-white font-semibold">★ {score} / 5</span>
                </div>

                <div className="chip-enma">
                  {anime.format || 'TV'}
                </div>

                <div className="chip-enma">
                  {anime.status === 'RELEASING' ? 'Currently Airing' : 'Completed'}
                </div>

                {totalSeasons > 1 && (
                  <div className="chip-enma text-[#1e90ff] border-[#1e90ff]/30">
                    <Layers className="w-3.5 h-3.5" />
                    <span>{totalSeasons} Seasons</span>
                  </div>
                )}
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight font-heading">
                {title}
              </h1>
              {romajiTitle && romajiTitle !== title && (
                <p className="text-xs sm:text-[13.5px] text-[#d8d8d8] mt-1 font-normal italic">
                  {romajiTitle} {nativeTitle && `• ${nativeTitle}`}
                </p>
              )}

              {/* Genre Pills */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 mt-2.5">
                {anime.genres?.map((g) => (
                  <span
                    key={g}
                    className="chip-enma py-1 px-3 text-[11px]"
                  >
                    {g}
                  </span>
                ))}
              </div>

              {/* Action Buttons Row (Angular Corner Cut Shape System) */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 sm:gap-3 mt-5 w-full">
                {/* Add / Status in My List */}
                {isInList ? (
                  <div className="flex items-center gap-2">
                    <div className="angular-btn-secondary-wrap">
                      <select
                        value={currentStatus}
                        onChange={(e) => updateWatchlistStatus(anime.id, e.target.value)}
                        aria-label="Change status in My List"
                        className="angular-btn-secondary h-[46px] px-5 bg-[#1e90ff] text-white text-xs font-bold uppercase tracking-wider cursor-pointer focus:outline-none"
                      >
                        <option value="Watching" className="text-white bg-[#0b0b0b]">✓ Watching</option>
                        <option value="Completed" className="text-white bg-[#0b0b0b]">✓ Completed</option>
                        <option value="On Hold" className="text-white bg-[#0b0b0b]">✓ On Hold</option>
                        <option value="Dropped" className="text-white bg-[#0b0b0b]">✓ Dropped</option>
                        <option value="Plan to Watch" className="text-white bg-[#0b0b0b]">✓ Plan to Watch</option>
                      </select>
                    </div>

                    <div className="angular-nav-arrow-wrap">
                      <button
                        onClick={() => removeFromWatchlist(anime.id)}
                        className="angular-nav-arrow w-[46px] h-[46px] text-zinc-400 hover:text-[#ff5a5f]"
                        title="Remove from My List"
                        aria-label="Remove from My List"
                      >
                        <Bookmark className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => addToWatchlist(anime, 'Watching')}
                    className="angular-btn-primary"
                  >
                    <Bookmark className="w-4 h-4 text-white" strokeWidth={2.4} />
                    <span>+ ADD TO MY LIST</span>
                  </button>
                )}

                {/* Mark Episodes Button */}
                <div className="angular-btn-secondary-wrap">
                  <button
                    onClick={() => setTrackerModalOpen(true)}
                    className="angular-btn-secondary"
                  >
                    <Layers className="w-4 h-4 text-[#1e90ff]" />
                    <span>TRACK EPISODES</span>
                  </button>
                </div>

                {/* Write Review Button */}
                <div className="angular-btn-secondary-wrap">
                  <button
                    onClick={() => setReviewModalOpen(true)}
                    className="angular-btn-secondary"
                  >
                    <MessageSquare className="w-4 h-4 text-zinc-300" />
                    <span>WRITE REVIEW</span>
                  </button>
                </div>

                {/* Share Button */}
                <div className="angular-nav-arrow-wrap">
                  <button
                    onClick={handleShare}
                    className="angular-nav-arrow w-[46px] h-[46px]"
                    title="Share anime"
                    aria-label="Share anime"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT: High-Density Metrics Panel (Angular Chamfered Shapes) */}
          <div className="w-full lg:w-72 grid grid-cols-2 lg:grid-cols-1 gap-2.5 sm:gap-3 p-3 sm:p-4 angular-cut bg-[#0b0b0b] border border-white/[0.08]">
            {/* Metric 1: Rating (Out of 5) */}
            <div className="p-3.5 angular-cut-sm bg-[#111111] border border-white/[0.06] flex items-center gap-3">
              <div className="w-9 h-9 angular-cut-sm bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-amber-400/90">Community Score</p>
                <p className="text-sm font-extrabold text-white">★ {score} / 5</p>
              </div>
            </div>

            {/* Metric 2: Episodes */}
            <div className="p-3.5 angular-cut-sm bg-[#111111] border border-white/[0.06] flex items-center gap-3">
              <div className="w-9 h-9 angular-cut-sm bg-[#1e90ff]/10 flex items-center justify-center text-[#1e90ff] shrink-0">
                <Film className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-[#1e90ff]">Franchise Scope</p>
                <p className="text-sm font-extrabold text-white">{totalSeasons}S • {totalEpisodes} Ep</p>
              </div>
            </div>

            {/* Metric 3: Studio */}
            <div className="p-3.5 angular-cut-sm bg-[#111111] border border-white/[0.06] flex items-center gap-3">
              <div className="w-9 h-9 angular-cut-sm bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] uppercase font-bold text-cyan-400">Studio</p>
                <p className="text-sm font-extrabold text-white truncate">{studio}</p>
              </div>
            </div>

            {/* Metric 4: Broadcast */}
            <div className="p-3.5 angular-cut-sm bg-[#111111] border border-white/[0.06] flex items-center gap-3">
              <div className="w-9 h-9 angular-cut-sm bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-emerald-400">Broadcast</p>
                <p className="text-sm font-extrabold text-white">{anime.season || 'Current'} {anime.year || 2026}</p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Main Grid: Synopsis + Episode Guide & Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mt-8">
        
        {/* Left Column: Synopsis & Info */}
        <div className="lg:col-span-1 flex flex-col gap-5">
          {/* Synopsis */}
          <div className="p-5 sm:p-6 angular-cut bg-[#0b0b0b] border border-white/[0.06]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#d8d8d8] mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-[#1e90ff] shadow-[0_0_8px_#1e90ff]" />
              <span className="text-white">Synopsis</span>
            </h3>
            <p className="text-xs sm:text-[13.5px] text-[#d8d8d8] leading-[1.65] font-normal whitespace-pre-line">
              {anime.synopsis?.replace(/<[^>]*>?/gm, '') || 'No synopsis provided for this anime.'}
            </p>
          </div>

          {/* Quick Info */}
          <div className="p-5 sm:p-6 angular-cut bg-[#0b0b0b] border border-white/[0.06] flex flex-col gap-2.5 text-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#d8d8d8] mb-1 flex items-center gap-2">
              <span className="w-2 h-2 bg-[#1e90ff] shadow-[0_0_8px_#1e90ff]" />
              <span className="text-white">Series Information</span>
            </h3>

            <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
              <span className="text-[#d8d8d8] flex items-center gap-1.5"><Tv className="w-3.5 h-3.5" /> Format</span>
              <span className="text-white font-semibold">{anime.format || 'TV'}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
              <span className="text-[#d8d8d8] flex items-center gap-1.5"><Layers className="w-3.5 h-3.5" /> Seasons</span>
              <span className="text-[#1e90ff] font-semibold">{totalSeasons} Seasons</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
              <span className="text-[#d8d8d8] flex items-center gap-1.5"><Film className="w-3.5 h-3.5" /> Total Episodes</span>
              <span className="text-white font-semibold">{totalEpisodes} Episodes</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
              <span className="text-[#d8d8d8] flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Duration</span>
              <span className="text-white font-semibold">{anime.duration || 24} min / ep</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
              <span className="text-[#d8d8d8] flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> Studio</span>
              <span className="text-white font-semibold">{studio}</span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-[#d8d8d8] flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> Source</span>
              <span className="text-white font-semibold">{anime.source || 'Manga'}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Episode Guide & Community Reviews */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Episode Guide & Direct Tracking */}
          <div className="p-5 sm:p-7 angular-cut bg-[#0b0b0b] border border-white/[0.06]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.06] gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight uppercase flex items-center gap-2 font-heading">
                  <span className="w-2 h-2 bg-[#1e90ff] shadow-[0_0_8px_#1e90ff]" />
                  <span>EPISODE GUIDE & TRACKING</span>
                </h2>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-[#d8d8d8] font-medium">
                  <span className="font-semibold text-white">
                    {displayWatched} / {totalEpisodes} Episodes Completed
                  </span>
                  <span>•</span>
                  {nextEp ? (
                    <span className="text-amber-400 font-semibold">
                      Next Episode: {nextEp.toString().padStart(2, '0')}
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> All Done
                    </span>
                  )}
                </div>
              </div>

              <div className="angular-btn-secondary-sm-wrap self-start sm:self-auto">
                <button
                  onClick={() => setTrackerModalOpen(true)}
                  className="angular-btn-secondary-sm"
                >
                  <span>Full Tracker</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#1e90ff]" />
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4 mb-5">
              <div className="w-full h-1.5 angular-cut-sm bg-white/[0.08] overflow-hidden">
                <div
                  className="h-full bg-[#1e90ff] angular-cut-sm transition-all duration-500 shadow-[0_0_8px_rgba(30,144,255,0.4)]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Unified Season Selector Tabs */}
            {guide?.seasons && guide.seasons.length > 1 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                  {guide.seasons.map((s, idx) => (
                    <button
                      key={s.seasonTitle}
                      onClick={() => {
                        setActiveSeasonIndex(idx);
                        setViewAllSeasons(false);
                      }}
                      className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 angular-cut-sm ${
                        !viewAllSeasons && activeSeasonIndex === idx
                          ? 'bg-[#1e90ff] text-white shadow-[0_0_12px_rgba(30,144,255,0.35)]'
                          : 'bg-[#111111] border border-white/[0.08] text-[#d8d8d8] hover:text-white'
                      }`}
                    >
                      {s.seasonTitle}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setViewAllSeasons(!viewAllSeasons)}
                  className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider border transition-all self-start sm:self-auto cursor-pointer angular-cut-sm ${
                    viewAllSeasons
                      ? 'bg-[#1e90ff] text-white border-[#1e90ff]'
                      : 'bg-[#111111] border-white/[0.08] text-[#d8d8d8] hover:text-white'
                  }`}
                >
                  {viewAllSeasons ? 'Showing All' : 'Expand All'}
                </button>
              </div>
            )}

            {/* Episode Grid with Angular Cut Shape */}
            {viewAllSeasons && guide?.seasons && guide.seasons.length > 1 ? (
              <div className="flex flex-col gap-4">
                {guide.seasons.map((s) => (
                  <div key={s.seasonTitle} className="p-3.5 angular-cut bg-[#111111] border border-white/[0.06]">
                    <p className="text-xs font-bold uppercase text-white mb-2.5 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-[#1e90ff]" />
                      <span>{s.seasonTitle}</span>
                      <span className="text-[11px] font-normal text-zinc-500">({s.episodes.length} Episodes)</span>
                    </p>

                    <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-1.5 sm:gap-2">
                      {s.episodes.map((ep) => {
                        const epNum = ep.number;
                        const isWatched = isEpisodeWatched(animeIdStr, epNum, s.seasonNumber);
                        const formattedNum = epNum.toString().padStart(2, '0');

                        return (
                          <button
                            key={epNum}
                            onClick={() => toggleEpisodeWatched(animeIdStr, epNum, s.seasonNumber)}
                            onMouseEnter={() => setHoveredEp(ep)}
                            onMouseLeave={() => setHoveredEp(null)}
                            className={`aspect-square angular-cut-sm flex flex-col items-center justify-center font-mono text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer select-none active:scale-95 border ${
                              isWatched
                                ? 'bg-[#1e90ff] border-[#1e90ff] text-white shadow-[0_0_10px_rgba(30,144,255,0.4)]'
                                : 'bg-[#0b0b0b] border-white/[0.08] text-[#d8d8d8] hover:border-[#1e90ff] hover:text-white'
                            }`}
                            title={ep.title ? `Ep ${formattedNum}: ${ep.title}` : `Episode ${formattedNum}`}
                          >
                            <span>{formattedNum}</span>
                            {isWatched && <Check className="w-3 h-3 stroke-[3]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#d8d8d8]">
                      {currentSeason.seasonTitle} ({currentEpisodes.length} Episodes)
                    </p>

                    {/* Episode Batch Dropdown (> 50 episodes) */}
                    {isBatched && (
                      <div className="inline-flex items-center gap-1.5 ml-1">
                        <span className="text-[11px] font-semibold text-zinc-400">Batch:</span>
                        <select
                          value={activeBatchIndex}
                          onChange={(e) => setActiveBatchIndex(Number(e.target.value))}
                          aria-label="Select Episode Batch"
                          className="angular-cut-sm bg-[#131520] border border-white/[0.18] hover:border-[#1e90ff] text-xs font-bold text-white px-2.5 py-1 focus:outline-none focus:border-[#1e90ff] cursor-pointer shadow-xs"
                        >
                          {batches.map((b) => (
                            <option key={b.index} value={b.index} className="bg-[#0e1017] text-white">
                              Episodes {b.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {loadingGuide ? (
                  <div className="py-8 text-center text-xs text-zinc-400">
                    Syncing canonical episode guide...
                  </div>
                ) : (
                  <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-1.5 sm:gap-2">
                    {displayedEpisodes.map((ep) => {
                      const epNum = ep.number;
                      const isWatched = isEpisodeWatched(animeIdStr, epNum, currentSeason.seasonNumber);
                      const formattedNum = epNum.toString().padStart(2, '0');

                      return (
                        <button
                          key={epNum}
                          onClick={() => toggleEpisodeWatched(animeIdStr, epNum, currentSeason.seasonNumber)}
                          onMouseEnter={() => setHoveredEp(ep)}
                          onMouseLeave={() => setHoveredEp(null)}
                          className={`aspect-square angular-cut-sm flex flex-col items-center justify-center font-mono text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer select-none active:scale-95 border ${
                            isWatched
                              ? 'bg-[#1e90ff] border-[#1e90ff] text-white shadow-[0_0_10px_rgba(30,144,255,0.4)]'
                              : 'bg-[#111111] border-white/[0.08] text-[#d8d8d8] hover:border-[#1e90ff] hover:text-white'
                          }`}
                          title={ep.title ? `Ep ${formattedNum}: ${ep.title}` : `Episode ${formattedNum}`}
                        >
                          <span>{formattedNum}</span>
                          {isWatched && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Persistent Episode Info Bar (Prevents Layout Shift and Jitter) */}
            <div className="mt-3.5 min-h-[46px] p-2.5 angular-cut-sm bg-[#111111] border border-white/[0.08] flex items-center justify-between text-xs">
              {hoveredEp ? (
                <div className="flex items-center justify-between w-full">
                  <div className="truncate pr-2">
                    <span className="font-bold text-white">Episode {hoveredEp.number.toString().padStart(2, '0')}</span>
                    {hoveredEp.title && <span className="text-[#d8d8d8] ml-2">: {hoveredEp.title}</span>}
                  </div>
                  {hoveredEp.filler ? (
                    <span className="text-[10px] text-amber-300 bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 angular-cut-sm font-semibold shrink-0">
                      Filler
                    </span>
                  ) : (
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 angular-cut-sm font-semibold shrink-0">
                      Canonical
                    </span>
                  )}
                </div>
              ) : (
                <div className="text-zinc-500 text-[11px] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                  <span>Hover or tap any episode number to preview title and track progress.</span>
                </div>
              )}
            </div>
          </div>

          {/* Reviews Section */}
          <div className="p-5 sm:p-7 angular-cut bg-[#0b0b0b] border border-white/[0.06]">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-5">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight uppercase flex items-center gap-2 font-heading">
                  <span className="w-2 h-2 bg-[#1e90ff] shadow-[0_0_8px_#1e90ff]" />
                  <span>COMMUNITY REVIEWS</span>
                </h2>
                <p className="text-xs text-[#d8d8d8] mt-0.5">
                  Showing verified critiques and reviews for this franchise.
                </p>
              </div>

              <button
                onClick={() => setReviewModalOpen(true)}
                className="angular-btn-primary h-[38px] px-5 text-xs font-bold tracking-wider"
              >
                Write Review
              </button>
            </div>

            {latest5Reviews.length > 0 ? (
              <div className="flex flex-col gap-3.5">
                {latest5Reviews.map((rev) => (
                  <ReviewCard key={rev.id} review={rev} />
                ))}

                <div className="pt-3 text-center">
                  <div className="angular-btn-secondary-wrap">
                    <Link
                      to={`/anime/${anime.id}/reviews`}
                      className="angular-btn-secondary"
                    >
                      <span>VIEW ALL REVIEWS ({allAnimeReviews.length})</span>
                      <ChevronRight className="w-4 h-4 text-[#1e90ff]" />
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm font-bold text-white">No reviews yet for this anime.</p>
                <p className="text-xs text-[#d8d8d8] mt-1 mb-4">Be the first to share your perspective with the community.</p>
                <button
                  onClick={() => setReviewModalOpen(true)}
                  className="angular-btn-primary"
                >
                  Write the First Review
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Episode Tracking Modal */}
      <EpisodeTrackingModal
        anime={anime}
        isOpen={trackerModalOpen}
        onClose={() => setTrackerModalOpen(false)}
      />

      {/* Write Review Modal */}
      <WriteReviewModal
        anime={anime}
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
      />

    </div>
  );
}
