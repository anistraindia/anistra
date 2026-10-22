import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function MobileTopHeader({ onOpenSearch }) {
  const navigate = useNavigate();
  const { user, loginWithGoogle } = useAuth();

  const handleSearchClick = () => {
    if (onOpenSearch) {
      onOpenSearch();
    } else {
      navigate('/search');
    }
  };

  return (
    <div className="md:hidden fixed top-3 inset-x-0 z-40 w-full pointer-events-none px-3">
      <div className="pointer-events-auto max-w-md mx-auto p-[1px] bg-white/[0.1] angular-cut">
        <div className="h-[52px] px-4 bg-[#0a0b10]/95 backdrop-blur-[24px] angular-cut flex items-center justify-between">
          
          {/* Left: ANISTRA Logo */}
          <Link 
            to="/" 
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 select-none group" 
            aria-label="ANISTRA Home"
          >
            <img 
              src="/anistra-logo.png" 
              alt="ANISTRA" 
              className="h-7 object-contain drop-shadow-[0_0_10px_rgba(30,144,255,0.4)] transition-transform group-hover:scale-105"
            />
          </Link>

          {/* Right: Search & Profile / Sign In */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSearchClick}
              className="p-2 bg-[#12141d] hover:bg-[#1a1c29] border border-white/[0.08] text-[#d8d8d8] hover:text-white active:scale-95 transition-all cursor-pointer shadow-xs angular-cut-sm"
              aria-label="Search anime"
              title="Search"
            >
              <Search className="w-4 h-4 text-zinc-400" />
            </button>

            {user ? (
              <Link 
                to="/profile" 
                className="p-0.5 border border-white/[0.15] hover:border-[#1e90ff] active:scale-95 transition-all shadow-xs angular-cut-sm"
                aria-label="My Profile"
              >
                <img
                  src={user.avatar_url || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=100&auto=format&fit=crop&q=80'}
                  alt={user.username || 'User'}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=100&auto=format&fit=crop&q=80';
                  }}
                  className="w-7 h-7 object-cover angular-cut-sm bg-[#12141d]"
                />
              </Link>
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
  );
}
