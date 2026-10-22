import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, Bookmark, MessageSquare, User, LogOut, Settings, Sparkles, Check, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWatchlist } from '../context/WatchlistContext';

export default function Navbar({ onOpenSearch }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, loginWithGoogle } = useAuth();
  const { watchlist } = useWatchlist();

  const [isScrolled, setIsScrolled] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const notifBtnRef = useRef(null);
  const profileBtnRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(e.target) &&
        !profileBtnRef.current?.contains(e.target)
      ) {
        setProfileDropdownOpen(false);
      }
      if (
        notifRef.current && 
        !notifRef.current.contains(e.target) &&
        !notifBtnRef.current?.contains(e.target)
      ) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (onOpenSearch) onOpenSearch();
        else navigate('/search');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, onOpenSearch]);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Search', path: '/search' },
    { label: 'My List', path: '/my-list', badge: watchlist.length > 0 ? watchlist.length : null },
    { label: 'Reviews', path: '/reviews' }
  ];

  return (
    <header className="w-full pointer-events-none transition-all duration-300 px-4 sm:px-6">
      <div className="max-w-[1100px] w-full mx-auto relative pointer-events-auto">
        
        {/* Floating Angular Chamfered Navigation Container */}
        <div className={`angular-navbar-wrap ${isScrolled ? 'scrolled' : ''}`}>
          <div className="angular-navbar">
            
            {/* LEFT: ANISTRA Logo */}
            <Link 
              to="/" 
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-3 group focus:outline-none shrink-0" 
              aria-label="ANISTRA Home"
            >
              <div className="relative flex items-center py-1">
                <img 
                  src="/anistra-logo.png" 
                  alt="ANISTRA" 
                  className="h-7 sm:h-8 object-contain drop-shadow-[0_0_12px_rgba(30,144,255,0.4)] transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            </Link>

          {/* CENTER: Navigation Links (Angular Chamfered Active Pill) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-4 py-2 text-xs lg:text-[13px] font-semibold tracking-wide transition-all duration-200 flex items-center gap-2 select-none ${
                    isActive
                      ? 'angular-nav-item-active'
                      : 'text-[#d8d8d8] hover:text-white hover:bg-white/[0.06] angular-cut-sm'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className={`px-1.5 py-0.2 text-[10px] font-bold ${
                      isActive 
                        ? 'bg-white text-[#1e90ff] angular-cut-sm' 
                        : 'bg-[#1e90ff] text-white shadow-[0_0_8px_rgba(30,144,255,0.4)] angular-cut-sm'
                    }`}>
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* RIGHT: Search, Notification, Profile */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            
            {/* Search Spotlight Button (Angular Shape) */}
            <div className="p-[1px] bg-white/[0.12] hover:bg-[#1e90ff] angular-cut-sm transition-colors">
              <button
                onClick={() => onOpenSearch ? onOpenSearch() : navigate('/search')}
                className="flex items-center gap-2 px-3.5 py-1.5 bg-[#0e1017] hover:bg-[#141722] text-[#d8d8d8] hover:text-white transition-all duration-200 cursor-pointer angular-cut-sm active:scale-95"
                title="Search anime (Ctrl+K)"
                aria-label="Search anime"
              >
                <Search className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#1e90ff]" />
                <span className="hidden sm:inline text-xs font-medium text-[#d8d8d8]">Search</span>
                <kbd className="hidden lg:inline-flex text-[10px] font-mono px-1.5 py-0.5 bg-white/[0.06] text-zinc-400 border border-white/[0.06] angular-cut-sm">
                  ⌘K
                </kbd>
              </button>
            </div>

            {/* Notification Button (Angular Shape) */}
            <div className="relative" ref={notifBtnRef}>
              <div className="p-[1px] bg-white/[0.12] hover:bg-[#1e90ff] angular-cut-sm transition-colors">
                <button
                  onClick={() => {
                    setNotificationsOpen((prev) => !prev);
                    setProfileDropdownOpen(false);
                  }}
                  className="relative p-2 bg-[#0e1017] hover:bg-[#141722] text-[#d8d8d8] hover:text-white transition-all cursor-pointer angular-cut-sm active:scale-95"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#1e90ff] shadow-[0_0_8px_#1e90ff]" />
                </button>
              </div>
            </div>

            {/* Profile Avatar / Sign In */}
            <div className="relative" ref={profileBtnRef}>
              {user ? (
                <button
                  onClick={() => {
                    setProfileDropdownOpen((prev) => !prev);
                    setNotificationsOpen(false);
                  }}
                  className="flex items-center gap-2 p-1 border border-white/[0.1] hover:border-[#1e90ff] transition-all focus:outline-none cursor-pointer group shadow-xs angular-cut-sm"
                  aria-label="User menu"
                >
                  <div className="relative w-8 h-8 overflow-hidden border border-white/[0.15] group-hover:border-[#1e90ff] angular-cut-sm bg-[#12141d]">
                    <img
                      src={user.avatar_url || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=100&auto=format&fit=crop&q=80'}
                      alt={user.username || 'User'}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=100&auto=format&fit=crop&q=80';
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-transform hidden sm:block mr-1" />
                </button>
              ) : (
                <button
                  onClick={loginWithGoogle}
                  className="angular-btn-primary-sm"
                >
                  Sign In
                </button>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* NOTIFICATIONS DROPDOWN (Rendered outside clipped angular-navbar) */}
      {notificationsOpen && (
        <div 
          ref={notifRef}
          className="absolute right-4 sm:right-6 top-[70px] w-80 angular-card-wrap z-[100] animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="angular-card p-4 bg-[#0b0b0e]">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <span className="text-xs font-bold uppercase tracking-wider text-white">Notifications</span>
              <span className="text-[10px] text-white font-bold px-2 py-0.5 bg-[#1e90ff] shadow-[0_0_8px_rgba(30,144,255,0.4)] angular-cut-sm">2 New</span>
            </div>
            <div className="flex flex-col gap-2 mt-3 max-h-64 overflow-y-auto pr-1">
              <div className="p-3 bg-[#111219] hover:bg-[#161824] border border-white/[0.06] transition-colors angular-cut-sm">
                <p className="text-xs font-semibold text-white">Fall 2026 Season Guide Live</p>
                <p className="text-[11px] text-[#d8d8d8] mt-1 leading-relaxed">Explore the highest-rated releases this week on ANISTRA.</p>
                <span className="text-[9px] text-zinc-500 mt-1.5 block">10m ago</span>
              </div>
              <div className="p-3 bg-[#111219] hover:bg-[#161824] border border-white/[0.06] transition-colors angular-cut-sm">
                <p className="text-xs font-semibold text-white">Unified Season Tracking Active</p>
                <p className="text-[11px] text-[#d8d8d8] mt-1 leading-relaxed">All seasons consolidated into single master cards for seamless tracking.</p>
                <span className="text-[9px] text-zinc-500 mt-1.5 block">1h ago</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PROFILE DROPDOWN MENU (Rendered outside clipped angular-navbar) */}
      {profileDropdownOpen && user && (
        <div 
          ref={dropdownRef}
          className="absolute right-4 sm:right-6 top-[70px] w-64 angular-card-wrap z-[100] animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="angular-card p-3.5 bg-[#0b0b0b]">
            <div className="px-3 py-2.5 border-b border-white/[0.08] flex items-center gap-3">
              <img
                src={user.avatar_url || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=100&auto=format&fit=crop&q=80'}
                alt={user.username || 'User'}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=100&auto=format&fit=crop&q=80';
                }}
                className="w-10 h-10 angular-cut-sm object-cover border border-white/[0.15] bg-[#12141d]"
              />
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-white truncate">@{user.username || 'traveler'}</p>
                <p className="text-[11px] text-[#d8d8d8] truncate">{user.email || 'ANISTRA Member'}</p>
              </div>
            </div>

            <div className="mt-2.5 flex flex-col gap-1">
              <Link
                to="/profile"
                onClick={() => setProfileDropdownOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#d8d8d8] hover:text-white hover:bg-white/[0.06] transition-colors angular-cut-sm"
              >
                <User className="w-4 h-4 text-zinc-400" />
                View Profile
              </Link>
              <Link
                to="/my-list"
                onClick={() => setProfileDropdownOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#d8d8d8] hover:text-white hover:bg-white/[0.06] transition-colors angular-cut-sm"
              >
                <Bookmark className="w-4 h-4 text-zinc-400" />
                My List ({watchlist.length})
              </Link>
              <Link
                to="/reviews"
                onClick={() => setProfileDropdownOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#d8d8d8] hover:text-white hover:bg-white/[0.06] transition-colors angular-cut-sm"
              >
                <MessageSquare className="w-4 h-4 text-zinc-400" />
                My Reviews
              </Link>
            </div>

            <div className="mt-2 pt-2 border-t border-white/[0.08]">
              <button
                onClick={() => {
                  setProfileDropdownOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#ff5a5f] hover:bg-[#ff5a5f]/10 transition-colors text-left cursor-pointer angular-cut-sm"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  </header>
  );
}
