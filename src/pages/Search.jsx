import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, Filter, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import AnimeCard from '../components/AnimeCard';
import { GridSkeleton } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import EpisodeTrackingModal from '../components/EpisodeTrackingModal';
import { searchAnime } from '../api/anilist';
import { GENRE_TILES } from '../components/GenreChips';

const GENRES = ['All', ...GENRE_TILES.map(g => g.name), 'Fantasy', 'Horror', 'Slice of Life', 'Mystery', 'Psychological'];
const YEARS = ['All Years', '2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018'];
const SEASONS = ['All Seasons', 'WINTER', 'SPRING', 'SUMMER', 'FALL'];
const FORMATS = ['All Formats', 'TV', 'MOVIE', 'OVA', 'ONA', 'SPECIAL'];
const STATUSES = ['All Statuses', 'RELEASING', 'FINISHED', 'NOT_YET_RELEASED'];
const SORTS = [
  { label: 'Popularity', value: 'POPULARITY_DESC' },
  { label: 'Rating', value: 'SCORE_DESC' },
  { label: 'Recently Updated', value: 'UPDATED_AT_DESC' },
  { label: 'Release Date', value: 'START_DATE_DESC' }
];

export default function Search() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [genre, setGenre] = useState('All');
  const [year, setYear] = useState('All Years');
  const [season, setSeason] = useState('All Seasons');
  const [format, setFormat] = useState('All Formats');
  const [status, setStatus] = useState('All Statuses');
  const [sort, setSort] = useState('POPULARITY_DESC');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackingModalAnime, setTrackingModalAnime] = useState(null);

  // Debounce search input (400ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Execute query when parameters change
  useEffect(() => {
    let isCurrent = true;

    async function executeSearch() {
      setLoading(true);
      try {
        const data = await searchAnime({
          search: debouncedQuery,
          genre: genre === 'All' ? '' : genre,
          year: year === 'All Years' ? '' : year,
          season: season === 'All Seasons' ? '' : season,
          format: format === 'All Formats' ? '' : format,
          status: status === 'All Statuses' ? '' : status,
          sort,
          perPage: 24
        });

        if (isCurrent) {
          setResults(data?.anime || []);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        if (isCurrent) setLoading(false);
      }
    }

    executeSearch();
    return () => { isCurrent = false; };
  }, [debouncedQuery, genre, year, season, format, status, sort]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setGenre('All');
    setYear('All Years');
    setSeason('All Seasons');
    setFormat('All Formats');
    setStatus('All Statuses');
    setSort('POPULARITY_DESC');
  };

  const hasActiveFilters = Boolean(
    searchTerm ||
    genre !== 'All' ||
    year !== 'All Years' ||
    season !== 'All Seasons' ||
    format !== 'All Formats' ||
    status !== 'All Statuses'
  );

  return (
    <div className="w-full max-w-[1340px] mx-auto px-3.5 sm:px-8 lg:px-12 py-6 sm:py-8 pb-4 sm:pb-12">
      
      {/* Search Header Banner */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-2 h-2 bg-[#1e90ff] shadow-[0_0_8px_#1e90ff]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#1e90ff]">
            Universal Search
          </span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight uppercase font-heading">
          Explore Database
        </h1>
        <p className="text-xs sm:text-[13.5px] text-[#d8d8d8] mt-1 font-normal">
          Search across 10,000+ anime titles, canonical relations, studios, and genres.
        </p>
      </div>

      {/* Search Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 mb-6">
        
        {/* Main Search Input with Angular Corner Cut Shape */}
        <div className="relative w-full flex-1">
          <div className="p-[1px] bg-white/[0.12] focus-within:bg-[#1e90ff] angular-cut-sm transition-colors shadow-sm">
            <div className="relative w-full h-[46px] bg-[#0b0b0b] angular-cut-sm flex items-center">
              <SearchIcon className="absolute left-4 w-4 h-4 sm:w-4.5 sm:h-4.5 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search anime, franchise, studios, characters..."
                className="w-full h-full pl-11 pr-10 bg-transparent text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3.5 p-1 text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filter Toggle + Sort Container */}
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {/* Filter Toggle Button (Angular Corner Cut) */}
          <div className="p-[1px] bg-white/[0.12] hover:bg-[#1e90ff] angular-cut-sm transition-colors flex-1 sm:flex-initial">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`h-[44px] w-full px-5 text-xs font-semibold tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer select-none active:scale-95 angular-cut-sm ${
                filtersOpen || hasActiveFilters
                  ? 'bg-[#1e90ff] text-white shadow-[0_0_16px_rgba(30,144,255,0.35)]'
                  : 'bg-[#111111] text-[#d8d8d8] hover:text-white'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-1.5 h-1.5 bg-white shadow-[0_0_6px_#ffffff]" />
              )}
            </button>
          </div>

          {/* Sort Select (Angular Corner Cut) */}
          <div className="flex-1 sm:flex-initial relative p-[1px] bg-white/[0.12] hover:bg-[#1e90ff] angular-cut-sm transition-colors">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort search results"
              className="w-full sm:w-44 h-[44px] px-4 bg-[#111111] text-xs font-semibold text-[#d8d8d8] focus:outline-none focus:text-white cursor-pointer appearance-none pr-9 angular-cut-sm"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value} className="bg-[#111111] text-white">
                  Sort: {s.label}
                </option>
              ))}
            </select>
            <ArrowUpDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
          </div>
        </div>

      </div>

      {/* Expandable Filter Drawer (Angular Corner Cut Shape) */}
      {filtersOpen && (
        <div className="p-5 sm:p-6 angular-cut bg-[#0b0b0b] border border-white/[0.08] mb-8 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-white">
              Filter Options
            </span>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="text-xs font-semibold text-[#ff5a5f] hover:underline transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {/* Genre */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#d8d8d8] block mb-1.5">
                Genre
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full p-2.5 angular-cut-sm bg-[#111111] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-[#1e90ff] cursor-pointer"
              >
                {GENRES.map((g) => (
                  <option key={g} value={g} className="bg-[#111111] text-white">
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {/* Year */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#d8d8d8] block mb-1.5">
                Year
              </label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full p-2.5 angular-cut-sm bg-[#111111] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-[#1e90ff] cursor-pointer"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y} className="bg-[#111111] text-white">
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Season */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#d8d8d8] block mb-1.5">
                Season
              </label>
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                className="w-full p-2.5 angular-cut-sm bg-[#111111] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-[#1e90ff] cursor-pointer"
              >
                {SEASONS.map((s) => (
                  <option key={s} value={s} className="bg-[#111111] text-white">
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Format */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#d8d8d8] block mb-1.5">
                Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full p-2.5 angular-cut-sm bg-[#111111] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-[#1e90ff] cursor-pointer"
              >
                {FORMATS.map((f) => (
                  <option key={f} value={f} className="bg-[#111111] text-white">
                    {f}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="col-span-2 sm:col-span-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#d8d8d8] block mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-2.5 angular-cut-sm bg-[#111111] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-[#1e90ff] cursor-pointer"
              >
                {STATUSES.map((st) => (
                  <option key={st} value={st} className="bg-[#111111] text-white">
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Search Results Grid */}
      {loading ? (
        <GridSkeleton count={18} />
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {results.map((anime) => (
            <AnimeCard
              key={anime.id}
              anime={anime}
              onOpenEpisodeTracker={(a) => setTrackingModalAnime(a)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          type="search"
          title="No results discovered"
          description={`No anime matched "${searchTerm || 'your filter criteria'}". Try adjusting your filters or search keywords.`}
          actionText="Clear Filters"
          onAction={handleClearFilters}
        />
      )}

      {/* Global Episode Tracking Modal */}
      <EpisodeTrackingModal
        anime={trackingModalAnime}
        isOpen={Boolean(trackingModalAnime)}
        onClose={() => setTrackingModalAnime(null)}
      />

    </div>
  );
}
