import React from 'react';
import { useNavigate } from 'react-router-dom';

export const GENRE_TILES = [
  { name: 'Action' },
  { name: 'Adventure' },
  { name: 'Fantasy' },
  { name: 'Romance' },
  { name: 'Isekai' },
  { name: 'Thriller' },
  { name: 'Comedy' },
  { name: 'Sci-Fi' },
  { name: 'Supernatural' },
  { name: 'Sports' },
  { name: 'Slice of Life' }
];

export const GENRES = ['All', ...GENRE_TILES.map((t) => t.name)];

export default function GenreChips({ selectedGenre = 'All', onSelectGenre }) {
  const navigate = useNavigate();

  const handleChipClick = (genreName) => {
    if (onSelectGenre) {
      onSelectGenre(genreName);
    } else {
      navigate(`/search?genre=${encodeURIComponent(genreName)}`);
    }
  };

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2">
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-max px-1">
        {GENRES.map((genre) => {
          const isSelected = selectedGenre === genre;
          return (
            <button
              key={genre}
              onClick={() => handleChipClick(genre)}
              className={`chip-enma cursor-pointer ${
                isSelected
                  ? 'chip-enma-active'
                  : ''
              }`}
            >
              {genre}
            </button>
          );
        })}
      </div>
    </div>
  );
}
