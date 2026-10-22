import React, { useState, useEffect } from 'react';
import AnimeCard from './AnimeCard';
import { searchAnime } from '../api/anilist';

const SEASONS = [
  { label: 'Spring 2026', season: 'SPRING', year: 2026 },
  { label: 'Summer 2026', season: 'SUMMER', year: 2026 },
  { label: 'Fall 2025', season: 'FALL', year: 2025 },
  { label: 'Winter 2025', season: 'WINTER', year: 2025 }
];

export default function ThisSeasonSection({ onOpenEpisodeTracker }) {
  const [selectedSeasonIdx, setSelectedSeasonIdx] = useState(0);
  const [seasonalAnime, setSeasonalAnime] = useState([]);
  const [loading, setLoading] = useState(false);

  const activeSeason = SEASONS[selectedSeasonIdx];

  useEffect(() => {
    let isCurrent = true;
    async function loadSeasonal() {
      setLoading(true);
      try {
        const res = await searchAnime({
          season: activeSeason.season,
          seasonYear: activeSeason.year,
          perPage: 6,
          sort: 'POPULARITY_DESC'
        });
        if (isCurrent && res.anime) {
          setSeasonalAnime(res.anime);
        }
      } catch (err) {
        console.error('Failed to load seasonal anime:', err);
      } finally {
        if (isCurrent) setLoading(false);
      }
    }

    loadSeasonal();
    return () => { isCurrent = false; };
  }, [selectedSeasonIdx, activeSeason.season, activeSeason.year]);

  return (
    <section className="mt-8 sm:mt-10">
      {/* Header with Segmented Control */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-5 px-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 bg-[#1e90ff] shadow-[0_0_8px_#1e90ff]" />
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight uppercase font-heading">
              SEASONAL SPOTLIGHT
            </h2>
          </div>
          <p className="text-xs sm:text-[13.5px] text-[#d8d8d8] font-normal">
            Explore major anime premieres broadcast by anime quarter.
          </p>
        </div>

        {/* Segmented Control (Angular Corner Cut Shapes) */}
        <div className="inline-flex p-1 angular-cut-sm bg-[#0b0b0b] border border-white/[0.08] shadow-sm self-start md:self-auto overflow-x-auto no-scrollbar max-w-full">
          {SEASONS.map((item, idx) => {
            const isSelected = selectedSeasonIdx === idx;
            return (
              <button
                key={item.label}
                onClick={() => setSelectedSeasonIdx(idx)}
                className={`px-3.5 sm:px-4 py-1.5 angular-cut-sm text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer shrink-0 select-none ${
                  isSelected
                    ? 'bg-[#1e90ff] text-white shadow-[0_0_12px_rgba(30,144,255,0.35)]'
                    : 'text-[#d8d8d8] hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Seasonal Anime */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] angular-card-wrap bg-[#111111] animate-pulse border border-white/[0.06]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {seasonalAnime.map((anime) => (
            <AnimeCard
              key={anime.id}
              anime={anime}
              onOpenEpisodeTracker={onOpenEpisodeTracker}
            />
          ))}
        </div>
      )}
    </section>
  );
}
