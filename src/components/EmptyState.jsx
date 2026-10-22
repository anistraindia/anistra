import React from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, MessageSquare, Search, Compass } from 'lucide-react';

export default function EmptyState({
  type = 'list',
  title,
  description,
  actionText,
  actionLink = '/search',
  onAction
}) {
  const getIcon = () => {
    switch (type) {
      case 'reviews':
        return <MessageSquare className="w-10 h-10 text-[#1e90ff]" strokeWidth={1.5} />;
      case 'search':
        return <Search className="w-10 h-10 text-[#1e90ff]" strokeWidth={1.5} />;
      case 'list':
      default:
        return <Bookmark className="w-10 h-10 text-[#1e90ff]" strokeWidth={1.5} />;
    }
  };

  const defaultTitles = {
    list: 'Your list is empty',
    reviews: 'No reviews yet',
    search: 'No anime found'
  };

  const defaultDescriptions = {
    list: 'Start discovering anime and build your personal collection.',
    reviews: 'Share your thoughts about the anime you love.',
    search: 'Try another title or keyword.'
  };

  const defaultActions = {
    list: 'Explore Anime',
    reviews: 'Discover Anime',
    search: 'Clear Filters'
  };

  const finalTitle = title || defaultTitles[type] || 'No items found';
  const finalDesc = description || defaultDescriptions[type] || '';
  const finalActionText = actionText || defaultActions[type];

  return (
    <div className="py-16 sm:py-20 px-4 flex flex-col items-center justify-center text-center max-w-md mx-auto">
      <div className="w-18 h-18 angular-cut-sm bg-[#0b0b0b] border border-white/[0.08] flex items-center justify-center mb-5 shadow-sm">
        {getIcon()}
      </div>

      <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight mb-1.5 font-heading">
        {finalTitle}
      </h3>

      <p className="text-xs sm:text-[13.5px] text-[#d8d8d8] mb-6 leading-relaxed font-normal">
        {finalDesc}
      </p>

      {finalActionText && (
        onAction ? (
          <button
            onClick={onAction}
            className="angular-btn-primary"
          >
            {finalActionText}
          </button>
        ) : (
          <Link
            to={actionLink}
            className="angular-btn-primary"
          >
            <Compass className="w-4 h-4" />
            <span>{finalActionText}</span>
          </Link>
        )
      )}
    </div>
  );
}
