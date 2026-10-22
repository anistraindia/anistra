import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import { getBaseFranchiseTitle, getTotalEpisodes } from '../utils/animeGrouping';

export default function ContinueTrackingSection({ onOpenEpisodeTracker }) {
  const { getContinueTrackingList, getWatchedCount, getNextEpisode } = useWatchlist();
  const trackingList = getContinueTrackingList();

  if (trackingList.length === 0) {
    return (
      <section className="mt-8 sm:mt-10">
        <div className="flex items-center gap-2 mb-1 px-1">
          <span className="w-2 h-2 bg-[#1e90ff] shadow-[0_0_8px_#1e90ff]" />
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight uppercase font-heading">
            CONTINUE TRACKING
          </h2>
        </div>
        <p className="text-xs sm:text-[13.5px] text-[#d8d8d8] font-normal mb-5 px-1">
          Keep your watched episodes in sync across all seasons.
        </p>

        <div className="p-8 sm:p-10 angular-cut bg-[#0b0b0b] border border-white/[0.06] text-center flex flex-col items-center justify-center max-w-xl mx-auto shadow-sm">
          <div className="w-12 h-12 angular-cut-sm bg-[#1e90ff]/10 border border-[#1e90ff]/25 flex items-center justify-center text-[#1e90ff] mb-3 shadow-[0_0_15px_rgba(30,144,255,0.25)]">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">No Active Tracking</h3>
          <p className="text-xs sm:text-[13.5px] text-[#d8d8d8] mb-5 max-w-sm leading-relaxed font-normal">
            Add anime to your watchlist to track episode progress and pick up right where you left off.
          </p>
          <Link
            to="/search"
            className="angular-btn-primary"
          >
            Explore Anime to Track
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-8 sm:mt-10">
      {/* Section Header */}
      <div className="flex items-end justify-between mb-4 px-1">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="w-2 h-2 bg-[#1e90ff] shadow-[0_0_8px_#1e90ff]" />
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight uppercase font-heading flex items-center gap-2">
              <span>CONTINUE TRACKING</span>
              <span className="text-[10px] font-semibold px-2.5 py-0.5 angular-cut-sm bg-[#1e90ff]/20 border border-[#1e90ff]/30 text-[#1e90ff]">
                {trackingList.length} Active
              </span>
            </h2>
          </div>
          <p className="text-xs sm:text-[13.5px] text-[#d8d8d8] font-normal">
            Your personal anime progress and upcoming episodes.
          </p>
        </div>

        <Link
          to="/my-list"
          className="text-xs font-semibold text-[#d8d8d8] hover:text-[#1e90ff] flex items-center gap-1.5 transition-colors"
        >
          <span>View My List</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Grid of Horizontal Tracking Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
        {trackingList.map((item) => {
          const anime = item.anime || {};
          const rawTitle = anime.title?.english || anime.title?.romaji || (typeof anime.title === 'string' ? anime.title : 'Anime');
          const title = getBaseFranchiseTitle(rawTitle);
          const displayTitle = title.length > 25 ? title.slice(0, 23) + '...' : title;
          const cover = anime.coverImage?.large || anime.coverImage?.extraLarge || anime.coverImage || '';
          const rawTotal = getTotalEpisodes(anime);
          const watchedCount = getWatchedCount(item.anime_id);
          const isCompleted = item.status === 'Completed';
          const totalEps = Math.max(rawTotal, watchedCount, 1);
          const displayWatched = isCompleted ? totalEps : Math.min(watchedCount, totalEps);
          const nextEp = isCompleted ? null : getNextEpisode(item.anime_id, totalEps);
          const percent = isCompleted ? 100 : Math.min(100, Math.round((displayWatched / totalEps) * 100));

          return (
            <div
              key={item.anime_id}
              className="group angular-card-wrap hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-full h-full angular-card !flex-row items-center p-3 sm:p-4 gap-3 sm:gap-4 bg-[#0b0b0f]">
                {/* Compact Poster (2:3 Aspect ratio) */}
                <Link
                  to={`/anime/${item.anime_id}`}
                  className="relative w-15 sm:w-18 aspect-[2/3] angular-cut-sm overflow-hidden shrink-0 bg-[#000000] border border-white/[0.08] block shadow-xs"
                >
                  <img
                    src={cover}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>

                {/* Info & Progress */}
                <div className="flex flex-col flex-1 justify-between min-w-0 py-0.5">
                  <div>
                    <Link
                      to={`/anime/${item.anime_id}`}
                      className="text-xs sm:text-[13px] font-bold text-white hover:text-[#1e90ff] transition-colors truncate block tracking-tight"
                      title={title}
                    >
                      {displayTitle}
                    </Link>

                    <div className="flex items-center gap-1.5 mt-0.5 text-[10.5px] sm:text-[11px] text-[#d8d8d8] font-medium">
                      <span>{anime.seasonsCount && anime.seasonsCount > 1 ? `${anime.seasonsCount} Seasons` : 'Season 1'}</span>
                      <span className="text-zinc-600">•</span>
                      {nextEp ? (
                        <span className="text-amber-300 font-semibold truncate">
                          Next: Ep {nextEp.toString().padStart(2, '0')}
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Completed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-[10px] sm:text-[10.5px] font-medium text-[#d8d8d8] mb-1">
                      <span>
                        {displayWatched} / {totalEps} Ep
                      </span>
                      <span className="font-semibold text-white">{percent}%</span>
                    </div>

                    <div className="w-full h-1.5 angular-cut-sm bg-white/[0.08] overflow-hidden">
                      <div
                        className="h-full bg-[#1e90ff] angular-cut-sm transition-all duration-500 shadow-[0_0_8px_rgba(30,144,255,0.4)]"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  {/* Track Episodes Button */}
                  <div className="mt-2.5">
                    <button
                      onClick={() => onOpenEpisodeTracker && onOpenEpisodeTracker(anime)}
                      className="h-7 sm:h-7.5 px-3 angular-cut-sm bg-[#12141d] hover:bg-[#1a1c29] border border-white/[0.08] hover:border-[#1e90ff] text-[10.5px] sm:text-[11px] font-semibold text-[#d8d8d8] hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Layers className="w-3 h-3 text-[#1e90ff]" />
                      <span>Track Episodes</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
