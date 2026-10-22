import React, { useState } from 'react';
import { 
  User, Bookmark, CheckCircle2, Layers, MessageSquare, 
  Calendar, Edit3, Settings as SettingsIcon, LogOut, Clock, 
  Check, X, Camera 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWatchlist } from '../context/WatchlistContext';
import { useReviews } from '../context/ReviewsContext';
import { checkUsernameCooldown } from '../utils/usernameValidation';
import AvatarPickerModal from '../components/AvatarPickerModal';
import { useToast } from '../context/ToastContext';

export default function Profile() {
  const { user, changeUsername, updateAvatar, logout, checkUsernameAvailable } = useAuth();
  const { watchlist, watchedEpisodes } = useWatchlist();
  const { getUserReviews } = useReviews();
  const { showToast } = useToast();

  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hideSpoilersDefault, setHideSpoilersDefault] = useState(true);

  if (!user) {
    return (
      <div className="w-full max-w-md mx-auto py-24 px-4 text-center">
        <h2 className="text-2xl font-bold text-white font-heading">Not Signed In</h2>
        <p className="text-xs sm:text-[13.5px] text-[#d8d8d8] mt-2">Please sign in to access your ANISTRA profile.</p>
      </div>
    );
  }

  // Calculate stats
  const totalAnime = watchlist.length;
  const completedAnime = watchlist.filter((i) => i.status === 'Completed').length;
  const watchingAnime = watchlist.filter((i) => i.status === 'Watching').length;
  const userReviews = getUserReviews();
  const totalEpisodesTracked = watchedEpisodes.length;

  // 14-day username cooldown check
  const cooldown = checkUsernameCooldown(user.username_changed_at);
  const usernameAvailability = checkUsernameAvailable(newUsername);

  // Format member since date
  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
      })
    : 'Oct 2024';

  const handleSaveUsername = async (e) => {
    e.preventDefault();
    if (!usernameAvailability.available) {
      showToast(usernameAvailability.message, 'error');
      return;
    }

    const success = await changeUsername(newUsername);
    if (success) {
      setEditingUsername(false);
      setNewUsername('');
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6 md:py-8 pb-4 sm:pb-12">
      
      {/* Profile Header Card (Angular Chamfered Cut) */}
      <div className="p-5 sm:p-8 angular-cut bg-[#0b0b0b] border border-white/[0.08] relative overflow-hidden mb-6">
        
        {/* Faint blue cinema accent */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#1e90ff]/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6 text-center sm:text-left relative z-10">
          
          {/* Avatar with edit overlay */}
          <div className="relative group shrink-0">
            <div className="w-22 sm:w-26 h-22 sm:h-26 angular-cut-sm overflow-hidden border-2 border-white/[0.15] group-hover:border-[#1e90ff] transition-all shadow-[0_0_20px_rgba(30,144,255,0.25)]">
              <img
                src={user.avatar_url || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200&auto=format&fit=crop&q=80'}
                alt={user.username}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200&auto=format&fit=crop&q=80';
                }}
                className="w-full h-full object-cover bg-[#12141d]"
              />
            </div>
            
            <button
              onClick={() => setAvatarModalOpen(true)}
              className="absolute inset-0 angular-cut-sm bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold cursor-pointer"
              aria-label="Change profile picture"
            >
              <Camera className="w-5 h-5 mb-1 text-white" />
              <span>Change</span>
            </button>
          </div>

          {/* User Info & Actions */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-heading">
                  @{user.username || 'traveler'}
                </h1>
                <span className="px-2.5 py-0.5 angular-cut-sm bg-[#1e90ff]/15 border border-[#1e90ff]/30 text-[#1e90ff] text-[10px] font-bold uppercase tracking-wider">
                  Verified Member
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 text-xs text-[#d8d8d8]">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" /> Member since {memberSince}
                </span>
                <span>•</span>
                <span>{user.email}</span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 sm:gap-3 mt-4 sm:mt-5">
              <button
                onClick={() => setAvatarModalOpen(true)}
                className="px-4 py-2 angular-cut-sm bg-[#111111] border border-white/[0.08] hover:border-[#1e90ff] text-xs font-semibold text-[#d8d8d8] hover:text-white transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#1e90ff]" />
                <span>Edit Avatar</span>
              </button>

              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="px-4 py-2 angular-cut-sm bg-[#111111] border border-white/[0.08] hover:border-[#1e90ff] text-xs font-semibold text-[#d8d8d8] hover:text-white transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <SettingsIcon className="w-3.5 h-3.5 text-zinc-400" />
                <span>Settings</span>
              </button>

              <button
                onClick={logout}
                className="px-4 py-2 angular-cut-sm bg-[#111111] border border-white/[0.08] text-xs font-semibold text-[#ff5a5f] hover:bg-[#ff5a5f]/10 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Statistics Grid (Angular Chamfered Shapes) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        
        <div className="p-4 sm:p-5 angular-cut-sm bg-[#0b0b0b] border border-white/[0.06] flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Anime</span>
            <Bookmark className="w-4 h-4 text-[#1e90ff]" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{totalAnime}</p>
          <span className="text-[11px] text-[#d8d8d8] mt-1">Total in List</span>
        </div>

        <div className="p-4 sm:p-5 angular-cut-sm bg-[#0b0b0b] border border-white/[0.06] flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Watching</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{watchingAnime}</p>
          <span className="text-[11px] text-[#d8d8d8] mt-1">In Progress</span>
        </div>

        <div className="p-4 sm:p-5 angular-cut-sm bg-[#0b0b0b] border border-white/[0.06] flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{completedAnime}</p>
          <span className="text-[11px] text-[#d8d8d8] mt-1">Finished Series</span>
        </div>

        <div className="p-4 sm:p-5 angular-cut-sm bg-[#0b0b0b] border border-white/[0.06] flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Reviews</span>
            <MessageSquare className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{userReviews.length}</p>
          <span className="text-[11px] text-[#d8d8d8] mt-1">Community Reviews</span>
        </div>

      </div>

      {/* Episode Progress Stat Banner */}
      <div className="p-4 sm:p-5 angular-cut bg-[#0b0b0b] border border-white/[0.06] mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 angular-cut-sm bg-[#1e90ff]/10 border border-[#1e90ff]/20 text-[#1e90ff]">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white font-heading">Episodes Logged</h4>
            <p className="text-xs text-[#d8d8d8]">Total individual episodes tracked across all seasons</p>
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-extrabold text-white font-mono">
          {totalEpisodesTracked} <span className="text-xs font-normal text-[#d8d8d8]">Episodes</span>
        </div>
      </div>

      {/* 14-DAY USERNAME CHANGE MANAGEMENT */}
      <div className="p-5 sm:p-7 angular-cut bg-[#0b0b0b] border border-white/[0.06] mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06] mb-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight font-heading">Username Configuration</h3>
            <p className="text-xs text-[#d8d8d8] mt-0.5">
              Unique handle for your public profile, reviews, and community interactions.
            </p>
          </div>

          <div className="text-xs font-mono font-bold text-white px-3 py-1.5 angular-cut-sm bg-[#111111] border border-white/[0.08] self-start sm:self-auto">
            @{user.username}
          </div>
        </div>

        {/* 14-Day Cooldown Notice / Change Form */}
        {editingUsername ? (
          <form onSubmit={handleSaveUsername} className="mt-4 flex flex-col gap-4 max-w-md">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#d8d8d8] block mb-1.5">
                New Username (Min 4 chars)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-mono text-sm">@</span>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="new_username"
                  maxLength={20}
                  className="w-full h-[46px] pl-9 pr-4 angular-cut-sm bg-[#111111] border border-white/[0.09] text-sm text-white font-mono focus:outline-none focus:border-[#1e90ff] shadow-sm"
                  autoFocus
                />
              </div>

              {newUsername && (
                <p className={`text-xs mt-1.5 flex items-center gap-1 ${
                  usernameAvailability.available ? 'text-emerald-400 font-semibold' : 'text-[#ff5a5f] font-semibold'
                }`}>
                  {usernameAvailability.available ? '✓ Username available' : `✕ ${usernameAvailability.message}`}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={!usernameAvailability.available}
                className="angular-btn-primary h-[40px] px-5 text-xs disabled:opacity-40"
              >
                Save New Username
              </button>
              <button
                type="button"
                onClick={() => setEditingUsername(false)}
                className="h-[40px] px-4 angular-cut-sm bg-[#111111] text-[#d8d8d8] hover:text-white border border-white/[0.08] text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div>
              {cooldown.canChange ? (
                <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>Username change is currently available for your account.</span>
                </p>
              ) : (
                <p className="text-xs text-amber-400 font-semibold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{cooldown.message}</span>
                </p>
              )}
              <p className="text-[11px] text-[#d8d8d8] mt-1">
                Policy: ANISTRA permits username modifications once every 14 days to prevent abuse.
              </p>
            </div>

            {cooldown.canChange ? (
              <button
                onClick={() => setEditingUsername(true)}
                className="angular-btn-primary h-[38px] px-4 text-xs self-start sm:self-auto"
              >
                Change Username
              </button>
            ) : (
              <span className="text-xs font-mono text-[#d8d8d8] px-3 py-1.5 angular-cut-sm bg-[#111111] border border-white/[0.08] self-start sm:self-auto">
                Cooldown Active
              </span>
            )}
          </div>
        )}
      </div>

      {/* Settings Drawer */}
      {settingsOpen && (
        <div className="p-5 sm:p-7 angular-cut bg-[#0b0b0b] border border-white/[0.08] mb-6 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white font-heading">
              Application Preferences
            </h3>
            <button
              onClick={() => setSettingsOpen(false)}
              className="p-1 angular-cut-sm text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col gap-3.5 text-xs">
            <div className="flex items-center justify-between p-3.5 angular-cut-sm bg-[#111111] border border-white/[0.06]">
              <div>
                <p className="font-semibold text-white">Default Spoiler Protection</p>
                <p className="text-[#d8d8d8] text-[11px]">Require explicit tap to reveal spoiler reviews</p>
              </div>
              <input
                type="checkbox"
                checked={hideSpoilersDefault}
                onChange={(e) => setHideSpoilersDefault(e.target.checked)}
                className="w-4 h-4 accent-[#1e90ff] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 angular-cut-sm bg-[#111111] border border-white/[0.06]">
              <div>
                <p className="font-semibold text-white">Haptic Feedback & Sound</p>
                <p className="text-[#d8d8d8] text-[11px]">Micro-animations when marking episodes</p>
              </div>
              <span className="text-emerald-400 font-semibold">Enabled</span>
            </div>
          </div>
        </div>
      )}

      {/* Avatar Picker Modal */}
      <AvatarPickerModal
        isOpen={avatarModalOpen}
        onClose={() => setAvatarModalOpen(false)}
        currentAvatar={user.avatar_url}
        onSelectAvatar={updateAvatar}
      />

    </div>
  );
}
