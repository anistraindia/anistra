import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Bookmark, MessageSquare, User } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';

export default function MobileNavbar() {
  const { watchlist } = useWatchlist();

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Search', path: '/search', icon: Search },
    { 
      label: 'My List', 
      path: '/my-list', 
      icon: Bookmark, 
      badge: watchlist.length > 0 ? watchlist.length : null 
    },
    { label: 'Reviews', path: '/reviews', icon: MessageSquare },
    { label: 'Profile', path: '/profile', icon: User }
  ];

  return (
    <div className="fixed bottom-3.5 inset-x-3 z-50 md:hidden pointer-events-none pb-safe">
      <div className="pointer-events-auto max-w-sm mx-auto p-[1px] bg-white/[0.1] angular-cut">
        <nav 
          aria-label="Mobile Navigation" 
          className="h-[58px] bg-[#0a0b10]/95 backdrop-blur-[24px] angular-cut flex items-center justify-around px-2"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (item.path === '/') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className={({ isActive }) =>
                  `relative flex flex-col items-center justify-center h-11 px-3.5 angular-cut-sm transition-all duration-200 select-none ${
                    isActive
                      ? 'bg-[#1e90ff] text-white shadow-[0_0_14px_rgba(30,144,255,0.35)]'
                      : 'text-[#d8d8d8] hover:text-white border border-transparent active:scale-95'
                  }`
                }
              >
              {({ isActive }) => (
                <>
                  <div className="relative flex items-center justify-center">
                    <Icon 
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isActive ? 'text-white scale-105' : ''
                      }`} 
                      strokeWidth={isActive ? 2.4 : 1.8}
                    />
                    {item.badge && (
                      <span className={`absolute -top-1.5 -right-2 px-1 py-0.2 text-[8px] font-black angular-cut-sm ${
                        isActive ? 'bg-white text-[#1e90ff]' : 'bg-[#1e90ff] text-white ring-1 ring-[#0b0b0b]'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className={`text-[9.5px] font-semibold tracking-tight mt-0.5 transition-colors ${
                    isActive ? 'text-white' : 'text-[#d8d8d8]'
                  }`}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
        </nav>
      </div>
    </div>
  );
}
