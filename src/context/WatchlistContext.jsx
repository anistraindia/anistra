import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { MOCK_ANIME } from '../api/mockData';
import { getAnimeById } from '../api/anilist';
import { getFranchiseSeasons, getTotalEpisodes } from '../utils/animeGrouping';

const WatchlistContext = createContext(null);

const STORAGE_KEY_LIST = 'anistra_user_watchlist';
const STORAGE_KEY_WATCHED_EPISODES = 'anistra_watched_episodes';

export function WatchlistProvider({ children }) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [watchlist, setWatchlist] = useState([]);
  const [watchedEpisodes, setWatchedEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper storage keys scoped to user ID
  const getListStorageKey = (uid) => uid ? `anistra_user_watchlist_${uid}` : null;
  const getEpsStorageKey = (uid) => uid ? `anistra_watched_episodes_${uid}` : null;

  // Load initial watchlist and watched episodes
  useEffect(() => {
    async function loadData() {
      setLoading(true);

      // CRITICAL FIX: If user is logged out, clear all watchlist and episodes immediately!
      if (!user?.id) {
        setWatchlist([]);
        setWatchedEpisodes([]);
        setLoading(false);
        return;
      }

      if (isSupabaseConfigured && supabase) {
        try {
          const { data: listData } = await supabase
            .from('anime_list')
            .select('*')
            .eq('user_id', user.id);

          const { data: epsData } = await supabase
            .from('watched_episodes')
            .select('*')
            .eq('user_id', user.id);

          if (listData && listData.length > 0) {
            const enriched = await Promise.all(
              listData.map(async (row) => {
                const foundMock = MOCK_ANIME.find(a => String(a.id) === String(row.anime_id));
                if (foundMock) {
                  return {
                    ...row,
                    anime: {
                      ...foundMock,
                      totalSeriesEpisodes: getTotalEpisodes(foundMock)
                    }
                  };
                }
                try {
                  const fetched = await getAnimeById(row.anime_id);
                  return {
                    ...row,
                    anime: {
                      ...fetched,
                      totalSeriesEpisodes: getTotalEpisodes(fetched)
                    }
                  };
                } catch {
                  return {
                    ...row,
                    anime: {
                      id: row.anime_id,
                      title: { english: 'Anime' },
                      coverImage: '',
                      totalSeriesEpisodes: 12
                    }
                  };
                }
              })
            );
            setWatchlist(enriched);
            saveWatchlistLocal(enriched, user.id);

            // Auto-sync completed titles so all seasons and episodes are always fully marked
            enriched.forEach(item => {
              if (item.status === 'Completed') {
                const rawTotal = getTotalEpisodes(item.anime);
                const count = (epsData || []).filter(e => String(e.anime_id) === String(item.anime_id)).length;
                if (count < rawTotal) {
                  markAllSeasonsEpisodesWatched(item.anime_id, item.anime);
                }
              }
            });
          } else {
            // User has 0 anime in watchlist
            setWatchlist([]);
            saveWatchlistLocal([], user.id);
          }

          if (epsData && epsData.length > 0) {
            setWatchedEpisodes(epsData);
            saveWatchedEpisodesLocal(epsData, user.id);
          } else {
            setWatchedEpisodes([]);
            saveWatchedEpisodesLocal([], user.id);
          }
        } catch (e) {
          console.warn('Supabase watchlist load error:', e);
          // Fallback to local storage for this authenticated user
          loadUserLocalData(user.id);
        }
      } else {
        // Offline mode for this user
        loadUserLocalData(user.id);
      }

      setLoading(false);
    }

    function loadUserLocalData(uid) {
      try {
        const keyList = getListStorageKey(uid);
        const keyEps = getEpsStorageKey(uid);
        const savedList = keyList ? localStorage.getItem(keyList) : null;
        const savedEps = keyEps ? localStorage.getItem(keyEps) : null;
        const parsedList = savedList ? JSON.parse(savedList) : [];
        const parsedEps = savedEps ? JSON.parse(savedEps) : [];

        const enriched = parsedList.map(item => {
          if (item?.anime) {
            return {
              ...item,
              anime: {
                ...item.anime,
                totalSeriesEpisodes: getTotalEpisodes(item.anime)
              }
            };
          }
          return item;
        });

        setWatchlist(enriched);
        setWatchedEpisodes(parsedEps);

        // Auto-sync completed titles so all seasons and episodes are always fully marked
        enriched.forEach(item => {
          if (item.status === 'Completed') {
            const rawTotal = getTotalEpisodes(item.anime);
            const count = parsedEps.filter(e => String(e.anime_id) === String(item.anime_id)).length;
            if (count < rawTotal) {
              markAllSeasonsEpisodesWatched(item.anime_id, item.anime);
            }
          }
        });
      } catch (e) {
        setWatchlist([]);
        setWatchedEpisodes([]);
      }
    }

    loadData();
  }, [user?.id]);

  const saveWatchlistLocal = (newList, uid = user?.id) => {
    setWatchlist(newList);
    if (!uid) return;
    try {
      localStorage.setItem(getListStorageKey(uid), JSON.stringify(newList));
    } catch (e) {
      console.warn('LocalStorage saveWatchlistLocal quota exceeded:', e);
    }
  };

  const saveWatchedEpisodesLocal = (newEps, uid = user?.id) => {
    setWatchedEpisodes(newEps);
    if (!uid) return;
    try {
      localStorage.setItem(getEpsStorageKey(uid), JSON.stringify(newEps));
    } catch (e) {
      console.warn('LocalStorage saveWatchedEpisodesLocal quota exceeded:', e);
    }
  };

  /**
   * Automatically mark all seasons and all episodes of an anime as watched
   */
  const markAllSeasonsEpisodesWatched = async (animeId, animeObj) => {
    const animeIdStr = String(animeId);
    const uid = user?.id || 'guest_user';

    // 1. Resolve anime object
    const targetAnime = animeObj || watchlist.find(item => String(item.anime_id) === animeIdStr)?.anime || MOCK_ANIME.find(a => String(a.id) === animeIdStr);

    // 2. Resolve seasons & episodes
    const franchiseSeasons = getFranchiseSeasons(targetAnime);
    const episodesToMark = [];

    if (franchiseSeasons && franchiseSeasons.length > 0) {
      franchiseSeasons.forEach(s => {
        const sNum = s.seasonNumber || 1;
        const count = s.episodesCount || 12;
        for (let ep = 1; ep <= count; ep++) {
          episodesToMark.push({
            season_number: sNum,
            episode_number: ep
          });
        }
      });
    } else if (targetAnime?.seasonEpisodes && typeof targetAnime.seasonEpisodes === 'object') {
      Object.entries(targetAnime.seasonEpisodes).forEach(([sNumStr, count]) => {
        const sNum = parseInt(sNumStr, 10) || 1;
        for (let ep = 1; ep <= Number(count); ep++) {
          episodesToMark.push({
            season_number: sNum,
            episode_number: ep
          });
        }
      });
    } else {
      const count = getTotalEpisodes(targetAnime) || targetAnime?.totalSeriesEpisodes || targetAnime?.episodes || 12;
      for (let ep = 1; ep <= count; ep++) {
        episodesToMark.push({
          season_number: 1,
          episode_number: ep
        });
      }
    }

    const now = new Date().toISOString();
    const newRecords = episodesToMark.map(ep => ({
      id: `ep_${uid}_${animeIdStr}_s${ep.season_number}_e${ep.episode_number}`,
      user_id: uid,
      anime_id: animeIdStr,
      season_number: ep.season_number,
      episode_number: ep.episode_number,
      watched_at: now
    }));

    setWatchedEpisodes(prev => {
      const otherEps = prev.filter(e => String(e.anime_id) !== animeIdStr);
      const combined = [...otherEps, ...newRecords];
      if (user?.id) {
        try {
          localStorage.setItem(getEpsStorageKey(user.id), JSON.stringify(combined));
        } catch (e) {}
      }
      return combined;
    });

    // Upsert into Supabase in chunks
    if (isSupabaseConfigured && supabase && user?.id) {
      try {
        const rows = newRecords.map(r => ({
          user_id: user.id,
          anime_id: animeIdStr,
          season_number: r.season_number,
          episode_number: r.episode_number,
          watched_at: now
        }));
        for (let i = 0; i < rows.length; i += 50) {
          const chunk = rows.slice(i, i + 50);
          await supabase.from('watched_episodes').upsert(chunk, {
            onConflict: 'user_id, anime_id, season_number, episode_number'
          });
        }
      } catch (err) {
        console.warn('Supabase markAllSeasonsEpisodesWatched error:', err);
      }
    }
  };

  /**
   * Add or update an anime in My List
   */
  const addToWatchlist = async (anime, status = 'Watching') => {
    if (!user) {
      showToast('Please sign in to save anime to your list.', 'warning');
      return;
    }

    const animeIdStr = String(anime.id);
    const existingIndex = watchlist.findIndex(item => String(item.anime_id) === animeIdStr);

    let updatedList;
    if (existingIndex >= 0) {
      updatedList = [...watchlist];
      updatedList[existingIndex] = {
        ...updatedList[existingIndex],
        status,
        updated_at: new Date().toISOString()
      };
      showToast(`Updated status to "${status}"`, 'success');
    } else {
      const newEntry = {
        id: `list_${Date.now()}`,
        user_id: user.id,
        anime_id: animeIdStr,
        status,
        anime: {
          id: animeIdStr,
          title: anime.title,
          coverImage: anime.coverImage,
          bannerImage: anime.bannerImage,
          episodes: anime.episodes || 12,
          totalSeriesEpisodes: getTotalEpisodes(anime),
          rating: anime.rating || 4.5,
          format: anime.format || 'TV',
          seasonYear: anime.seasonYear || anime.year || 2024
        },
        created_at: new Date().toISOString()
      };
      updatedList = [newEntry, ...watchlist];
      showToast(`Added "${anime.title?.english || anime.title?.romaji || 'Anime'}" to My List!`, 'success');
    }

    saveWatchlistLocal(updatedList);

    if (status === 'Completed') {
      await markAllSeasonsEpisodesWatched(animeIdStr, anime);
    }

    if (isSupabaseConfigured && supabase && user?.id) {
      try {
        await supabase.from('anime_list').upsert({
          user_id: user.id,
          anime_id: animeIdStr,
          status,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id, anime_id' });
      } catch (e) {}
    }
  };

  /**
   * Remove anime from My List
   */
  const removeFromWatchlist = async (animeId) => {
    const animeIdStr = String(animeId);
    const updated = watchlist.filter(item => String(item.anime_id) !== animeIdStr);
    saveWatchlistLocal(updated);

    if (isSupabaseConfigured && supabase && user?.id) {
      try {
        await supabase
          .from('anime_list')
          .delete()
          .eq('user_id', user.id)
          .eq('anime_id', animeIdStr);
      } catch (e) {}
    }

    showToast('Removed from My List', 'info');
  };

  /**
   * Update status of an anime in My List
   */
  const updateWatchlistStatus = async (animeId, newStatus) => {
    const animeIdStr = String(animeId);
    let targetAnime = null;
    const updated = watchlist.map(item => {
      if (String(item.anime_id) === animeIdStr) {
        const baseAnime = item.anime || {};
        targetAnime = {
          ...baseAnime,
          totalSeriesEpisodes: getTotalEpisodes(baseAnime)
        };
        return { ...item, status: newStatus, anime: targetAnime, updated_at: new Date().toISOString() };
      }
      return item;
    });

    saveWatchlistLocal(updated);

    if (newStatus === 'Completed') {
      await markAllSeasonsEpisodesWatched(animeIdStr, targetAnime);
      showToast('Marked as Completed! All seasons & episodes marked as watched.', 'success');
    } else {
      showToast(`Status set to "${newStatus}"`, 'success');
    }

    if (isSupabaseConfigured && supabase && user?.id) {
      try {
        await supabase
          .from('anime_list')
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq('user_id', user.id)
          .eq('anime_id', animeIdStr);
      } catch (e) {}
    }
  };

  /**
   * Toggle individual episode watched status
   */
  const toggleEpisodeWatched = async (animeId, episodeNumber, seasonNumber = 1) => {
    if (!user) {
      showToast('Please sign in to track episode progress.', 'warning');
      return;
    }

    const animeIdStr = String(animeId);
    const epNum = parseInt(episodeNumber, 10);
    const sNum = parseInt(seasonNumber, 10);

    const existsIndex = watchedEpisodes.findIndex(
      e => String(e.anime_id) === animeIdStr && e.season_number === sNum && e.episode_number === epNum
    );

    let updatedEps;
    let isNowWatched = false;

    if (existsIndex >= 0) {
      // Unmark
      updatedEps = watchedEpisodes.filter((_, idx) => idx !== existsIndex);
      isNowWatched = false;
      showToast(`Episode ${epNum.toString().padStart(2, '0')} unmarked`, 'info');
    } else {
      // Mark watched
      const newEp = {
        id: `ep_${Date.now()}_${epNum}`,
        user_id: user?.id || 'guest',
        anime_id: animeIdStr,
        season_number: sNum,
        episode_number: epNum,
        watched_at: new Date().toISOString()
      };
      updatedEps = [...watchedEpisodes, newEp];
      isNowWatched = true;
      showToast(`Episode ${epNum.toString().padStart(2, '0')} marked as watched`, 'success');

      // Auto add to My List under 'Watching' if not present
      const inList = watchlist.find(item => String(item.anime_id) === animeIdStr);
      if (!inList) {
        // Find basic info from mock or create entry
        const fallback = MOCK_ANIME.find(a => String(a.id) === animeIdStr);
        if (fallback) {
          addToWatchlist(fallback, 'Watching');
        }
      }
    }

    saveWatchedEpisodesLocal(updatedEps);

    if (isSupabaseConfigured && supabase && user?.id) {
      try {
        if (isNowWatched) {
          await supabase.from('watched_episodes').upsert({
            user_id: user.id,
            anime_id: animeIdStr,
            season_number: sNum,
            episode_number: epNum,
            watched_at: new Date().toISOString()
          }, { onConflict: 'user_id, anime_id, season_number, episode_number' });
        } else {
          await supabase
            .from('watched_episodes')
            .delete()
            .eq('user_id', user.id)
            .eq('anime_id', animeIdStr)
            .eq('season_number', sNum)
            .eq('episode_number', epNum);
        }
      } catch (e) {
        console.warn('Supabase watched episode sync error:', e);
      }
    }
  };

  /**
   * Mark all episodes up to target
   */
  const markAllEpisodesUpTo = async (animeId, targetEpisode, seasonNumber = 1) => {
    const animeIdStr = String(animeId);
    const target = parseInt(targetEpisode, 10);
    const sNum = parseInt(seasonNumber, 10);

    const existingWatched = new Set(
      watchedEpisodes
        .filter(e => String(e.anime_id) === animeIdStr && e.season_number === sNum)
        .map(e => e.episode_number)
    );

    const newEntries = [];
    for (let i = 1; i <= target; i++) {
      if (!existingWatched.has(i)) {
        newEntries.push({
          id: `ep_${Date.now()}_${i}`,
          user_id: user?.id || 'guest',
          anime_id: animeIdStr,
          season_number: sNum,
          episode_number: i,
          watched_at: new Date().toISOString()
        });
      }
    }

    const updated = [...watchedEpisodes, ...newEntries];
    saveWatchedEpisodesLocal(updated);
    showToast(`Marked episodes 01 to ${target.toString().padStart(2, '0')} as watched!`, 'success');

    if (isSupabaseConfigured && supabase && user?.id && newEntries.length > 0) {
      try {
        const rows = newEntries.map(e => ({
          user_id: user.id,
          anime_id: animeIdStr,
          season_number: sNum,
          episode_number: e.episode_number,
          watched_at: e.watched_at
        }));
        await supabase.from('watched_episodes').upsert(rows, {
          onConflict: 'user_id, anime_id, season_number, episode_number'
        });
      } catch (e) {
        console.warn('Supabase batch episode tracking error:', e);
      }
    }
  };

  /**
   * Check if specific episode is watched
   */
  const isEpisodeWatched = (animeId, episodeNumber, seasonNumber = 1) => {
    const animeIdStr = String(animeId);
    const epNum = parseInt(episodeNumber, 10);
    const sNum = parseInt(seasonNumber, 10);

    return watchedEpisodes.some(
      e => String(e.anime_id) === animeIdStr && e.season_number === sNum && e.episode_number === epNum
    );
  };

  /**
   * Get total watched count for an anime
   */
  const getWatchedCount = (animeId, seasonNumber = null) => {
    const animeIdStr = String(animeId);
    return watchedEpisodes.filter(e => {
      const matchAnime = String(e.anime_id) === animeIdStr;
      if (seasonNumber !== null) {
        return matchAnime && e.season_number === parseInt(seasonNumber, 10);
      }
      return matchAnime;
    }).length;
  };

  /**
   * Get next episode to watch
   */
  const getNextEpisode = (animeId, totalEpisodes = 12, seasonNumber = 1) => {
    const animeIdStr = String(animeId);
    const sNum = parseInt(seasonNumber, 10);
    const watchedNums = new Set(
      watchedEpisodes
        .filter(e => String(e.anime_id) === animeIdStr && e.season_number === sNum)
        .map(e => e.episode_number)
    );

    for (let i = 1; i <= totalEpisodes; i++) {
      if (!watchedNums.has(i)) {
        return i;
      }
    }
    return null; // All completed
  };

  /**
   * Get watchlist entry for anime
   */
  const getWatchlistEntry = (animeId) => {
    const animeIdStr = String(animeId);
    return watchlist.find(item => String(item.anime_id) === animeIdStr) || null;
  };

  /**
   * Get Continue Tracking list: items in 'Watching'
   */
  const getContinueTrackingList = () => {
    return watchlist.filter(item => item.status === 'Watching');
  };

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        watchedEpisodes,
        loading,
        addToWatchlist,
        removeFromWatchlist,
        updateWatchlistStatus,
        toggleEpisodeWatched,
        markAllEpisodesUpTo,
        isEpisodeWatched,
        getWatchedCount,
        getNextEpisode,
        getWatchlistEntry,
        getContinueTrackingList,
        markAllSeasonsEpisodesWatched
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
}
