import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Bookmark, Check, Layers } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import { getBaseFranchiseTitle } from '../utils/animeGrouping';

export default function AnimeCard({ anime, rank, onOpenEpisodeTracker }) {
  const { watchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();

  if (!anime) return null;

  const animeIdStr = String(anime.id);
  const watchItem = watchlist.find((item) => String(item.anime_id) === animeIdStr);
  const isInList = Boolean(watchItem);

  const rawTitle = anime.title?.english || anime.title?.romaji || 'Unknown Title';
  const title = getBaseFranchiseTitle(rawTitle);
  const displayTitle = title.length > 22 ? title.slice(0, 20) + '...' : title;
  const coverUrl = anime.coverImage?.extraLarge || anime.coverImage?.large || anime.coverImage || '';
  const score = anime.rating || (anime.averageScore ? (anime.averageScore / 20).toFixed(1) : '4.5');
  const year = anime.seasonYear || anime.year || '2026';
  const format = anime.format || 'TV';

  // Format rank with leading zero: 01, 02, 03...
  const formattedRank = rank !== undefined ? String(rank).padStart(2, '0') : null;

  const handleBookmarkClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInList) {
      removeFromWatchlist(anime.id);
    } else {
      addToWatchlist(anime, 'Watching');
    }
  };

  const handleTrackClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onOpenEpisodeTracker) {
      onOpenEpisodeTracker(anime);
    }
  };

  return (
    <div className="group relative flex flex-col w-full h-full select-none">
      
      {/* 1px Angular Border Glow Wrapper */}
      <div className="angular-card-wrap">
        <div className="angular-card">
          
          {/* Poster Media Box (Fixed 2:3 Aspect Ratio) */}
          <Link 
            to={`/anime/${anime.id}`} 
            className="relative aspect-[2/3] w-full shrink-0 overflow-hidden block bg-[#0e1017]"
          >
            <img
              src={coverUrl}
              alt={title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
            />

            {/* Soft dark gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d12] via-transparent to-transparent opacity-85 group-hover:opacity-40 transition-opacity duration-300" />

            {/* Ranking Badge (Angular Corner Cut) */}
            {formattedRank && (
              <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 flex items-center justify-center min-w-[26px] h-6 px-2 angular-cut-sm bg-[#0e1017]/90 border border-white/[0.1] text-[10px] sm:text-xs font-bold shadow-md">
                <span className={rank <= 3 ? 'text-[#1e90ff]' : 'text-zinc-200'}>
                  #{formattedRank}
                </span>
              </div>
            )}

            {/* Star Rating Badge (Angular Corner Cut - Out of 5) */}
            <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 flex items-center gap-1 px-2.5 py-1 angular-cut-sm bg-[#0e1017]/90 border border-white/[0.1] text-[10.5px] font-bold text-amber-300 shadow-md">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{score} / 5</span>
            </div>

            {/* Floating Bookmark Button (Angular Corner Cut) */}
            <button
              onClick={handleBookmarkClick}
              aria-label={isInList ? 'Remove from My List' : 'Add to My List'}
              className={`absolute bottom-2 right-2 sm:bottom-2.5 sm:right-2.5 z-20 w-8 h-8 angular-cut-sm flex items-center justify-center transition-all duration-200 cursor-pointer ${
                isInList
                  ? 'opacity-100 bg-[#1e90ff] text-white shadow-[0_0_12px_rgba(30,144,255,0.4)] scale-100'
                  : 'opacity-90 sm:opacity-0 sm:group-hover:opacity-100 bg-[#0e1017]/90 text-zinc-300 hover:text-white hover:border-[#1e90ff] hover:scale-105 scale-95 border border-white/[0.12]'
              }`}
              title={isInList ? 'In My List' : 'Add to My List'}
            >
              {isInList ? (
                <Check className="w-4 h-4 text-white" strokeWidth={2.8} />
              ) : (
                <Bookmark className="w-4 h-4" strokeWidth={2.2} />
              )}
            </button>

            {/* Track Episodes Icon (Angular Corner Cut) */}
            {isInList && onOpenEpisodeTracker && (
              <button
                onClick={handleTrackClick}
                aria-label="Track episodes"
                className="absolute bottom-2 left-2 sm:bottom-2.5 sm:left-2.5 z-20 w-8 h-8 angular-cut-sm flex items-center justify-center bg-[#0e1017]/90 text-zinc-300 hover:text-white border border-white/[0.12] transition-all duration-200 cursor-pointer opacity-90 sm:opacity-0 sm:group-hover:opacity-100 scale-95 hover:scale-105"
                title="Track Episodes"
              >
                <Layers className="w-3.5 h-3.5" />
              </button>
            )}
          </Link>

          {/* Card Info Details (Standardized fixed height for exact uniform card sizing) */}
          <div className="h-[74px] p-3 flex flex-col justify-between shrink-0 bg-[#0c0d12]">
            <div>
              <Link
                to={`/anime/${anime.id}`}
                className="text-xs sm:text-[13px] font-semibold text-white group-hover:text-[#1e90ff] transition-colors truncate block tracking-tight leading-snug"
                title={title}
              >
                {displayTitle}
              </Link>
            </div>

            {/* Metadata: Year • Format / Seasons */}
            <div className="flex items-center justify-between text-[11px] text-[#d8d8d8] font-medium">
              <div className="flex items-center gap-1.5 truncate">
                <span>{year}</span>
                <span className="text-zinc-600">•</span>
                {anime.seasonsCount && anime.seasonsCount > 1 ? (
                  <span className="text-zinc-300 font-semibold">{anime.seasonsCount} Seasons</span>
                ) : (
                  <span className="uppercase text-zinc-400">{format}</span>
                )}
              </div>

              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold shrink-0">
                {anime.status === 'RELEASING' ? 'Airing' : 'Ended'}
              </span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
