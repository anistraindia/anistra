import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, CheckCircle2, ChevronRight, Layers, Sparkles, Tv, Database } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import { getAccurateEpisodeGuide } from '../services/episodeGuideService';
import { getTotalEpisodes } from '../utils/animeGrouping';
import confetti from 'canvas-confetti';

export default function EpisodeTrackingModal({ anime, isOpen, onClose }) {
  const {
    toggleEpisodeWatched,
    markAllEpisodesUpTo,
    isEpisodeWatched,
    getWatchedCount,
    getNextEpisode
  } = useWatchlist();

  const [activeSeasonIndex, setActiveSeasonIndex] = useState(0);
  const [guide, setGuide] = useState(null);
  const [loadingGuide, setLoadingGuide] = useState(true);
  const [hoveredEp, setHoveredEp] = useState(null);

  useEffect(() => {
    let isCurrent = true;
    if (isOpen && anime) {
      setLoadingGuide(true);
      getAccurateEpisodeGuide(anime).then((data) => {
        if (isCurrent) {
          setGuide(data);
          setActiveSeasonIndex(0);
          setLoadingGuide(false);
        }
      });
    }
    return () => { isCurrent = false; };
  }, [isOpen, anime]);

  const animeIdStr = anime ? String(anime.id) : '';
  const currentSeason = guide?.seasons?.[activeSeasonIndex] || {
    seasonNumber: 1,
    seasonTitle: 'SEASON 1',
    episodes: anime ? Array.from({ length: anime.episodes || 12 }, (_, i) => ({ number: i + 1 })) : []
  };

  const currentEpisodes = currentSeason?.episodes || [];
  const rawTotal = guide?.totalEpisodes || getTotalEpisodes(anime);
  const rawWatched = animeIdStr ? getWatchedCount(animeIdStr) : 0;
  const totalEpisodes = Math.max(rawTotal, rawWatched, 1);
  const totalWatched = Math.min(rawWatched, totalEpisodes);
  const nextEp = animeIdStr ? getNextEpisode(animeIdStr, totalEpisodes, currentSeason.seasonNumber) : null;

  // Batching: if more than 50 episodes, divide into batches (e.g. 1-50, 51-100, 101-150)
  const BATCH_SIZE = 50;
  const isBatched = currentEpisodes.length > BATCH_SIZE;

  const [activeBatchIndex, setActiveBatchIndex] = useState(0);

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

  if (!isOpen || !anime) return null;

  const handleEpisodeClick = (epNum) => {
    toggleEpisodeWatched(animeIdStr, epNum, currentSeason.seasonNumber);
    
    // Check if season is now completed
    const watchedInSeason = currentEpisodes.filter((e) =>
      isEpisodeWatched(animeIdStr, e.number, currentSeason.seasonNumber)
    ).length;

    if (watchedInSeason + 1 === currentEpisodes.length) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch (e) {}
    }
  };

  const handleMarkAllUpTo = (epNum) => {
    markAllEpisodesUpTo(animeIdStr, epNum, currentSeason.seasonNumber);
  };

  const title = anime.title?.english || anime.title?.romaji || 'Anime';

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Blurred Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
      />

      {/* Modal / Bottom Sheet Container (Angular Chamfered Corners) */}
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 280 }}
        className="relative z-10 w-full sm:max-w-2xl max-h-[85vh] sm:max-h-[80vh] flex flex-col angular-cut bg-[#0b0b0b] border border-white/[0.12] shadow-[0_25px_80px_rgba(0,0,0,0.95)] overflow-hidden text-white"
      >
        {/* iOS Handle Bar for Mobile */}
        <div className="sm:hidden w-12 h-1 bg-white/20 mx-auto mt-2.5 mb-1" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-white/[0.06] flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#1e90ff] uppercase tracking-wider mb-1">
              <Layers className="w-3.5 h-3.5" />
              <span>Episode Tracking</span>
              {guide?.source && (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 angular-cut-sm border border-emerald-500/30">
                  <Database className="w-2.5 h-2.5" /> Canonical Index
                </span>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight font-heading">{title}</h3>
            
            {/* Progress summary */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-[#d8d8d8] mt-2 font-medium">
              <span className="px-2.5 py-0.5 angular-cut-sm bg-[#111111] text-white font-semibold border border-white/[0.08]">
                {totalWatched} / {totalEpisodes} Episodes Completed
              </span>
              {nextEp ? (
                <span className="text-amber-400 font-semibold">
                  Next: Ep {nextEp.toString().padStart(2, '0')}
                </span>
              ) : (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> All Watched
                </span>
              )}
            </div>
          </div>

          <div className="angular-nav-arrow-wrap">
            <button
              onClick={onClose}
              className="angular-nav-arrow w-8 h-8 text-[#d8d8d8] hover:text-white"
              aria-label="Close tracker"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Season Selector Tabs */}
        {guide?.seasons && guide.seasons.length > 1 && (
          <div className="px-5 sm:px-6 pt-3 pb-2 border-b border-white/[0.06] flex items-center gap-2 overflow-x-auto no-scrollbar">
            {guide.seasons.map((s, idx) => (
              <button
                key={s.seasonTitle}
                onClick={() => setActiveSeasonIndex(idx)}
                className={`px-3.5 py-1.5 angular-cut-sm text-xs font-semibold tracking-wide transition-all cursor-pointer shrink-0 ${
                  activeSeasonIndex === idx
                    ? 'bg-[#1e90ff] text-white shadow-[0_0_12px_rgba(30,144,255,0.35)]'
                    : 'bg-[#111111] border border-white/[0.08] text-[#d8d8d8] hover:text-white'
                }`}
              >
                {s.seasonTitle}
              </button>
            ))}
          </div>
        )}

        {/* Episode Grid */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold tracking-wider text-[#d8d8d8] uppercase">
                {currentSeason.seasonTitle} ({currentEpisodes.length} Episodes)
              </span>

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
                        {b.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {nextEp && (
              <button
                onClick={() => handleEpisodeClick(nextEp)}
                className="text-xs font-semibold text-[#1e90ff] hover:underline flex items-center gap-1 transition-colors cursor-pointer self-start sm:self-auto"
              >
                <span>Mark Next ({nextEp.toString().padStart(2, '0')})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {loadingGuide ? (
            <div className="py-12 text-center text-xs text-[#d8d8d8]">
              Syncing canonical episode guide...
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 sm:gap-2.5">
              {displayedEpisodes.map((ep) => {
                const epNum = ep.number;
                const isWatched = isEpisodeWatched(animeIdStr, epNum, currentSeason.seasonNumber);
                const formattedNum = epNum.toString().padStart(2, '0');

                return (
                  <div key={epNum} className="relative group">
                    <button
                      onClick={() => handleEpisodeClick(epNum)}
                      onMouseEnter={() => setHoveredEp(ep)}
                      onMouseLeave={() => setHoveredEp(null)}
                      className={`w-full aspect-square angular-cut-sm flex flex-col items-center justify-center font-mono text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer select-none active:scale-95 border ${
                        isWatched
                          ? 'bg-[#1e90ff] border-[#1e90ff] text-white shadow-[0_0_10px_rgba(30,144,255,0.35)]'
                          : 'bg-[#111111] border border-white/[0.08] text-[#d8d8d8] hover:border-[#1e90ff] hover:text-white'
                      }`}
                    >
                      <span>{formattedNum}</span>
                      {isWatched && <Check className="w-3 h-3 stroke-[3] mt-0.5" />}
                    </button>

                    {/* Quick mark all up to */}
                    {!isWatched && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAllUpTo(epNum);
                        }}
                        className="absolute -top-1.5 -right-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none group-hover:pointer-events-auto p-1 angular-cut-sm bg-[#181818] border border-white/[0.15] text-[9px] font-bold text-white shadow-md cursor-pointer hover:bg-[#222222] z-10"
                        title={`Mark all up to ep ${formattedNum}`}
                      >
                        +{epNum}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Persistent Episode Info Bar (Prevents Layout Shift and Jitter) */}
          <div className="mt-4 min-h-[46px] p-2.5 angular-cut-sm bg-[#111111] border border-white/[0.08] flex items-center justify-between text-xs">
            {hoveredEp ? (
              <div className="flex items-center justify-between w-full">
                <div className="truncate pr-2">
                  <span className="font-bold text-white">Episode {hoveredEp.number.toString().padStart(2, '0')}</span>
                  {hoveredEp.title && <span className="text-[#d8d8d8] ml-2">: {hoveredEp.title}</span>}
                </div>
                {hoveredEp.filler ? (
                  <span className="text-[10px] text-amber-300 bg-amber-500/20 px-2 py-0.5 angular-cut-sm border border-amber-500/30 font-semibold shrink-0">
                    Filler
                  </span>
                ) : (
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 angular-cut-sm border border-emerald-500/20 font-semibold shrink-0">
                    Canonical
                  </span>
                )}
              </div>
            ) : (
              <div className="text-zinc-500 text-[11px] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                <span>Hover or tap any episode number to preview canonical title and track.</span>
              </div>
            )}
          </div>

          <p className="text-[11px] text-zinc-500 text-center mt-6">
            Tap any episode number to toggle watched state. Every watched episode is tracked individually in your ANISTRA profile.
          </p>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/[0.06] bg-[#000000]/40 flex items-center justify-between">
          <div className="text-xs text-[#d8d8d8]">
            Progress: <span className="text-white font-bold">{Math.round((totalWatched / totalEpisodes) * 100)}%</span>
          </div>
          <button
            onClick={onClose}
            className="angular-btn-primary h-[38px] px-6 text-xs"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
}
