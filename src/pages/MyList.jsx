import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Star, Layers, CheckCircle2, Trash2, Plus } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import EmptyState from '../components/EmptyState';
import EpisodeTrackingModal from '../components/EpisodeTrackingModal';
import { getBaseFranchiseTitle, getTotalEpisodes } from '../utils/animeGrouping';

const STATUS_FILTERS = ['All', 'Watching', 'Completed', 'On Hold', 'Dropped', 'Plan to Watch'];

export default function MyList() {
  const {
    watchlist,
    updateWatchlistStatus,
    removeFromWatchlist,
    getWatchedCount,
    getNextEpisode
  } = useWatchlist();

  const [activeFilter, setActiveFilter] = useState('All');
  const [trackerModalAnime, setTrackerModalAnime] = useState(null);

  // Filter items
  const filteredList = activeFilter === 'All'
    ? watchlist
    : watchlist.filter((item) => item.status === activeFilter);

  // Count per status
  const counts = STATUS_FILTERS.reduce((acc, status) => {
    acc[status] = status === 'All'
      ? watchlist.length
      : watchlist.filter((i) => i.status === status).length;
    return acc;
  }, {});

  return (
    <div className="w-full max-w-[1340px] mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-8 pb-4 sm:pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-5 border-b border-white/[0.06] gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 bg-[#1e90ff] shadow-[0_0_8px_#1e90ff]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#1e90ff]">
              Personal Library
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight uppercase font-heading">
            My List
          </h1>
          <p className="text-xs sm:text-[13.5px] text-[#d8d8d8] mt-1 font-normal">
            Your personal anime collection, canonical tracking logs, and active status manager.
          </p>
        </div>

        <Link
          to="/search"
          className="angular-btn-primary self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-white" strokeWidth={2.6} />
          <span>ADD MORE ANIME</span>
        </Link>
      </div>

      {/* Segmented Filter Pills (Angular Corner Cut Shapes) */}
      <div className="w-full overflow-x-auto no-scrollbar mb-6 sm:mb-8">
        <div className="inline-flex p-1 angular-cut-sm bg-[#0b0b0b] border border-white/[0.08] shadow-sm min-w-max">
          {STATUS_FILTERS.map((status) => {
            const isSelected = activeFilter === status;
            return (
              <button
                key={status}
                onClick={() => setActiveFilter(status)}
                className={`px-3.5 sm:px-4 py-1.5 angular-cut-sm text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer flex items-center gap-2 select-none ${
                  isSelected
                    ? 'bg-[#1e90ff] text-white shadow-[0_0_12px_rgba(30,144,255,0.35)]'
                    : 'text-[#d8d8d8] hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <span>{status}</span>
                <span className={`px-1.5 py-0.2 angular-cut-sm text-[10px] font-bold ${
                  isSelected ? 'bg-white text-[#1e90ff]' : 'bg-white/[0.08] text-zinc-400'
                }`}>
                  {counts[status] || 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Anime Cards Grid in My List (Angular Corner Cut Shapes) */}
      {filteredList.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {filteredList.map((item) => {
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
            const score = anime.rating || (anime.averageScore ? (anime.averageScore / 20).toFixed(1) : '4.8');
            const percent = isCompleted ? 100 : Math.min(100, Math.round((displayWatched / totalEps) * 100));

            return (
              <div key={item.anime_id} className="angular-card-wrap">
                <div className="angular-card p-3.5 flex flex-col justify-between h-full bg-[#0b0b0f]">
                  <div>
                    {/* Top media & title */}
                    <div className="flex gap-3 items-start">
                      <Link
                        to={`/anime/${item.anime_id}`}
                        className="w-18 sm:w-20 aspect-[2/3] angular-cut-sm overflow-hidden shrink-0 bg-[#000000] border border-white/[0.08] block shadow-xs"
                      >
                        <img
                          src={cover}
                          alt={title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 angular-cut-sm px-1.5 py-0.5 bg-[#141722]">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{score} / 5</span>
                          </span>

                          <button
                            onClick={() => removeFromWatchlist(item.anime_id)}
                            className="p-1 angular-cut-sm text-zinc-500 hover:text-[#ff5a5f] hover:bg-white/[0.06] transition-colors cursor-pointer"
                            title="Remove from list"
                            aria-label="Remove from list"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <Link
                          to={`/anime/${item.anime_id}`}
                          className="text-xs sm:text-[13.5px] font-semibold text-white hover:text-[#1e90ff] transition-colors truncate block tracking-tight"
                          title={title}
                        >
                          {displayTitle}
                        </Link>

                        {/* Status Dropdown */}
                        <div className="mt-2">
                          <select
                            value={item.status}
                            onChange={(e) => updateWatchlistStatus(item.anime_id, e.target.value)}
                            aria-label={`Change status for ${title}`}
                            className="w-full px-2.5 py-1.5 angular-cut-sm bg-[#111116] border border-white/[0.08] text-[11px] font-medium text-white cursor-pointer focus:outline-none focus:border-[#1e90ff]"
                          >
                            <option value="Watching" className="bg-[#111111] text-white">Watching</option>
                            <option value="Completed" className="bg-[#111111] text-white">Completed</option>
                            <option value="On Hold" className="bg-[#111111] text-white">On Hold</option>
                            <option value="Dropped" className="bg-[#111111] text-white">Dropped</option>
                            <option value="Plan to Watch" className="bg-[#111111] text-white">Plan to Watch</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Episode Progress Information */}
                    <div className="mt-3.5 pt-3 border-t border-white/[0.06]">
                      <div className="flex items-center justify-between text-[11px] font-medium text-[#d8d8d8] mb-1">
                        <span>{displayWatched} / {totalEps} Episodes</span>
                        <span className="font-semibold text-white">{percent}%</span>
                      </div>

                      <div className="w-full h-1.5 angular-cut-sm bg-white/[0.08] overflow-hidden mb-2">
                        <div
                          className="h-full bg-[#1e90ff] angular-cut-sm transition-all duration-300 shadow-[0_0_8px_rgba(30,144,255,0.4)]"
                          style={{ width: `${percent}%` }}
                        />
                      </div>

                      {nextEp && !isCompleted ? (
                        <p className="text-[11px] font-medium text-[#d8d8d8]">
                          Next: <span className="text-amber-400 font-semibold">Ep {nextEp.toString().padStart(2, '0')}</span>
                        </p>
                      ) : (
                        <p className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Completed all episodes
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Track Episodes Button */}
                  <div className="angular-btn-secondary-sm-wrap w-full mt-3.5">
                    <button
                      onClick={() => setTrackerModalAnime(anime)}
                      className="angular-btn-secondary-sm w-full h-[38px]"
                    >
                      <Layers className="w-3.5 h-3.5 text-[#1e90ff]" />
                      <span>TRACK EPISODES</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          type="list"
          title={activeFilter === 'All' ? 'Your list is empty' : `No anime in "${activeFilter}"`}
          description={
            activeFilter === 'All'
              ? 'Start discovering anime and build your personal collection.'
              : 'Add anime to this status or switch tabs to see your saved titles.'
          }
          actionText="Explore Anime"
          actionLink="/search"
        />
      )}

      {/* Episode Tracking Modal */}
      <EpisodeTrackingModal
        anime={trackerModalAnime}
        isOpen={Boolean(trackerModalAnime)}
        onClose={() => setTrackerModalAnime(null)}
      />

    </div>
  );
}
