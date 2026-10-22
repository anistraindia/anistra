import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Star, ArrowRight, Layers, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { searchAnime } from '../api/anilist';

export default function QuickSearchModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchAnime({ search: query, perPage: 6 });
        setResults(data?.anime || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (animeId) => {
    onClose();
    navigate(`/anime/${animeId}`);
  };

  const handleFullSearch = () => {
    onClose();
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-start justify-center pt-16 sm:pt-24 px-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-md"
      />

      {/* Spotlight Window (Angular Corner Cut Shape) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{ duration: 0.2 }}
        className="relative z-10 w-full max-w-2xl angular-cut bg-[#0b0b0b] border border-white/[0.12] shadow-[0_25px_80px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col text-white"
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-5 py-4 border-b border-white/[0.08] gap-3">
          <Search className="w-5 h-5 text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query.trim()) {
                handleFullSearch();
              }
            }}
            placeholder="Type to search anime titles, studios, genres..."
            className="w-full bg-transparent text-white placeholder-zinc-500 text-sm sm:text-base focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 angular-cut-sm text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 angular-cut-sm bg-white/[0.06] text-zinc-400 font-bold border border-white/[0.08]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="p-3 max-h-[60vh] overflow-y-auto">
          {loading && (
            <div className="py-8 text-center text-xs text-[#d8d8d8]">
              Searching ANISTRA archives...
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="flex flex-col gap-2">
              {results.map((anime) => {
                const title = anime.title?.english || anime.title?.romaji || 'Anime';
                const score = anime.rating || 4.5;
                const cover = anime.coverImage?.large || anime.coverImage || '';

                return (
                  <button
                    key={anime.id}
                    onClick={() => handleSelect(anime.id)}
                    className="w-full p-2.5 angular-cut-sm bg-[#111111] hover:bg-[#181818] border border-white/[0.06] hover:border-[#1e90ff]/40 shadow-sm transition-all flex items-center justify-between gap-3 text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={cover}
                        alt={title}
                        className="w-10 h-14 object-cover angular-cut-sm shrink-0 border border-white/[0.08]"
                      />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-[13.5px] font-semibold text-white group-hover:text-[#1e90ff] transition-colors truncate font-heading">
                          {title}
                        </p>
                        <p className="text-[11px] text-[#d8d8d8] mt-0.5 truncate">
                          {anime.year || '2026'} • {anime.format || 'TV'} • {anime.genres?.slice(0, 2).join(', ')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-400">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{score} / 5</span>
                      </span>
                      <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="py-10 text-center text-xs text-[#d8d8d8]">
              No matching anime found for "{query}".
            </div>
          )}

          {!query && (
            <div className="p-4 text-center">
              <p className="text-xs text-[#d8d8d8]">
                Quick Search • Press <kbd className="font-mono bg-white/[0.08] px-1.5 py-0.5 angular-cut-sm border border-white/10 text-zinc-300">Enter</kbd> for full filter suite
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {query && results.length > 0 && (
          <div className="p-3 border-t border-white/[0.08] bg-[#000000]/40 flex items-center justify-between">
            <span className="text-[11px] text-[#d8d8d8]">Showing top matches</span>
            <button
              onClick={handleFullSearch}
              className="text-xs font-semibold text-[#1e90ff] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View all results for "{query}"</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
