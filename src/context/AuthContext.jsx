import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { CURATED_AVATARS } from '../api/mockData';
import { validateUsername, checkUsernameCooldown } from '../utils/usernameValidation';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

const STORAGE_KEY_USER = 'anistra_user_session';
const STORAGE_KEY_ALL_USERNAMES = 'anistra_registered_usernames';

export function AuthProvider({ children }) {
  const { showToast } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [googleLoginOpen, setGoogleLoginOpen] = useState(false);

  console.warn('[AUTH_DIAGNOSTIC]', JSON.stringify({
    hasSupabase: Boolean(supabase),
    isConfigured: isSupabaseConfigured,
    currentUrl: window.location.href,
    localUser: localStorage.getItem(STORAGE_KEY_USER),
    sbToken: localStorage.getItem('sb-qtbrblxilrnhukjqoprz-auth-token') ? 'PRESENT' : 'MISSING',
    rawSbToken: localStorage.getItem('sb-qtbrblxilrnhukjqoprz-auth-token')
  }));


  // Initialize all known registered usernames in storage for uniqueness check
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ALL_USERNAMES);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY_ALL_USERNAMES, JSON.stringify([]));
      }
    } catch (e) {
      // storage error
    }
  }, []);

  // Sync or auto-provision Supabase profile from authenticated user
  const syncUserProfile = async (sessionUser) => {
    if (!sessionUser) return;

    console.warn('[SYNC_USER_PROFILE] Starting for user:', sessionUser.id, sessionUser.email);

    // 1. Compute safe initial user info from Google / session metadata
    const googleAvatar = 
      sessionUser.user_metadata?.avatar_url || 
      sessionUser.user_metadata?.picture || 
      sessionUser.identities?.[0]?.identity_data?.avatar_url || 
      sessionUser.identities?.[0]?.identity_data?.picture || 
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200&auto=format&fit=crop&q=80';
    const rawName = sessionUser.user_metadata?.full_name || sessionUser.user_metadata?.name || sessionUser.email?.split('@')[0] || 'traveler';
    let cleanUsername = rawName.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 16);
    if (cleanUsername.length < 4) {
      cleanUsername = `user_${cleanUsername}_${sessionUser.id.slice(0, 4)}`.replace(/[^a-z0-9_]/g, '');
    }

    // Immediately reflect authenticated user in React state so navbar shows user avatar instantly
    const immediateUser = {
      id: sessionUser.id,
      email: sessionUser.email,
      username: cleanUsername,
      avatar_url: googleAvatar,
      google_avatar: googleAvatar,
      created_at: new Date().toISOString(),
      username_changed_at: null,
      profile_completed: true
    };
    setUser(immediateUser);

    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(immediateUser));
    } catch (e) {}

    // 2. Fetch or provision the profile in Supabase database
    try {
      const { data: profile, error: fetchErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionUser.id)
        .maybeSingle();

      console.warn('[SYNC_USER_PROFILE] Fetched profile:', { profile, fetchErr });

      const hasOnboardedLocal = localStorage.getItem(`anistra_onboarded_${sessionUser.id}`) === 'true';

      if (profile && hasOnboardedLocal) {
        // REPEAT USER: Profile already exists and user has confirmed onboarding
        const u = {
          ...immediateUser,
          username: profile.username || cleanUsername,
          avatar_url: profile.avatar_url || googleAvatar,
          google_avatar: googleAvatar,
          created_at: profile.created_at || immediateUser.created_at,
          username_changed_at: profile.username_changed_at,
          profile_completed: true
        };
        setUser(u);
        try {
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(u));
        } catch (e) {}

        // REPEAT USER -> NEVER show onboarding again
        setNeedsOnboarding(false);
      } else if (profile && !hasOnboardedLocal) {
        // Returning user from another device or existing profile
        const isPlaceholder = !profile.username || (profile.username.startsWith('user_') && profile.username.length > 10);
        if (isPlaceholder) {
          // Incomplete profile -> trigger onboarding modal
          const u = {
            ...immediateUser,
            username: cleanUsername,
            profile_completed: false
          };
          setUser(u);
          setNeedsOnboarding(true);
        } else {
          // Real completed profile on returning user
          const u = {
            ...immediateUser,
            username: profile.username,
            avatar_url: profile.avatar_url || googleAvatar,
            profile_completed: true
          };
          setUser(u);
          try {
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(u));
            localStorage.setItem(`anistra_onboarded_${sessionUser.id}`, 'true');
          } catch (e) {}
          setNeedsOnboarding(false);
        }
      } else {
        // BRAND NEW USER: Profile does not exist in Supabase yet!
        // DO NOT prematurely insert a row into Supabase here!
        // Wait until user confirms their avatar and chooses their username in OnboardingModal.
        const u = {
          ...immediateUser,
          username: cleanUsername,
          profile_completed: false
        };
        setUser(u);
        try {
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(u));
        } catch (e) {}

        // NEW USER -> Prompt onboarding to customize avatar and create unique username
        setNeedsOnboarding(true);
      }
    } catch (err) {
      console.warn('[SYNC_USER_PROFILE] Error syncing profile with database:', err);
    }
  };

  // Initialize session and real-time auth listener
  useEffect(() => {
    let authSubscription = null;

    async function initSession() {
      setLoading(true);

      if (isSupabaseConfigured && supabase) {
        // 1. Immediately subscribe to auth changes FIRST before any async calls
        const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.warn('[AUTH_EVENT]', event, session?.user?.email || 'no-session-user');
          if (session?.user) {
            await syncUserProfile(session.user);
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
            localStorage.removeItem(STORAGE_KEY_USER);
          }
          setLoading(false);
        });
        authSubscription = listener?.subscription;

        // 2. Check for URL redirect errors (from Google OAuth or Supabase)
        const searchParams = new URLSearchParams(window.location.search);
        const hash = window.location.hash.startsWith('#') ? window.location.hash.substring(1) : window.location.hash;
        const hashParams = new URLSearchParams(hash);

        const urlError = searchParams.get('error_description') || 
                         searchParams.get('error') || 
                         hashParams.get('error_description') || 
                         hashParams.get('error');

        if (urlError) {
          const decoded = decodeURIComponent(urlError);
          console.warn('[OAUTH_REDIRECT_ERROR]', decoded);
          showToast(`Google login issue: ${decoded}`, 'error');
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        // Helper to purge non-essential cache from localStorage to guarantee auth session fits
        const ensureStorageQuota = () => {
          try {
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
              const k = localStorage.key(i);
              if (k && (k.startsWith('anistra_cache_') || k.startsWith('anistra_jikan_') || k.startsWith('sb-') && !k.includes('auth-token'))) {
                keysToRemove.push(k);
              }
            }
            keysToRemove.forEach(k => localStorage.removeItem(k));
            console.warn(`[QUOTA_SAFEGUARD] Freed ${keysToRemove.length} bulky items from localStorage.`);
          } catch (e) {}
        };

        ensureStorageQuota();

        // 3. Check for implicit grant tokens in hash (#access_token=...&refresh_token=...)
        const hashAccessToken = hashParams.get('access_token');
        const hashRefreshToken = hashParams.get('refresh_token');

        if (hashAccessToken) {
          console.warn('[OAUTH_HASH_TOKENS_DETECTED] Explicitly setting session from URL hash tokens...');
          try {
            ensureStorageQuota();
            let setData, setErr;
            try {
              const res = await supabase.auth.setSession({
                access_token: hashAccessToken,
                refresh_token: hashRefreshToken || ''
              });
              setData = res.data;
              setErr = res.error;
            } catch (quotaErr) {
              console.warn('[QUOTA_RETRY] setSession threw quota error, purging storage and retrying...', quotaErr);
              ensureStorageQuota();
              const res = await supabase.auth.setSession({
                access_token: hashAccessToken,
                refresh_token: hashRefreshToken || ''
              });
              setData = res.data;
              setErr = res.error;
            }

            console.warn('[OAUTH_SET_SESSION_RESULT]', { hasSession: Boolean(setData?.session), user: setData?.session?.user?.email, setErr });
            if (setData?.session?.user) {
              await syncUserProfile(setData.session.user);
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          } catch (hErr) {
            console.warn('[OAUTH_SET_SESSION_EXCEPTION]', hErr);
          }
        }

        // 4. Check for OAuth PKCE code in query params (?code=...)
        const code = searchParams.get('code');
        if (code) {
          console.warn('[OAUTH_PKCE_CODE_DETECTED] Exchanging code for session...');
          try {
            const { data: exchangeData, error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code);
            console.warn('[OAUTH_CODE_EXCHANGE_RESULT]', { user: exchangeData?.session?.user?.email, exchangeErr });
            if (exchangeData?.session?.user) {
              await syncUserProfile(exchangeData.session.user);
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          } catch (exErr) {
            console.warn('OAuth code exchange notice:', exErr);
          }
        }

        // 5. Fallback session check (cached in storage or retrieved after exchange)
        try {
          const { data: { session }, error: getErr } = await supabase.auth.getSession();
          console.warn('[GET_SESSION_RESULT]', { hasSession: Boolean(session), user: session?.user?.email, getErr });
          if (session?.user) {
            await syncUserProfile(session.user);
          } else if (!code && !hashAccessToken) {
            // Check if we have an immediate stored user session that was already active
            const savedUser = localStorage.getItem(STORAGE_KEY_USER);
            if (savedUser) {
              try {
                setUser(JSON.parse(savedUser));
              } catch (e) {}
            } else {
              setUser(null);
            }
          }
        } catch (err) {
          console.warn('Error reading Supabase session:', err);
        }
      } else {
        // Local Session
        try {
          const savedUser = localStorage.getItem(STORAGE_KEY_USER);
          if (savedUser) {
            const parsed = JSON.parse(savedUser);
            if (parsed.id?.startsWith('usr_demo_')) {
              localStorage.removeItem(STORAGE_KEY_USER);
              setUser(null);
            } else {
              setUser(parsed);
              setNeedsOnboarding(false);
            }
          } else {
            setUser(null);
          }
        } catch (e) {
          setUser(null);
        }
      }

      setLoading(false);
    }

    initSession();

    return () => {
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []);

  /**
   * Real-time username availability check
   */
  const checkUsernameAvailable = (username) => {
    if (!username) return { available: false, message: '' };
    const validation = validateUsername(username);
    if (!validation.isValid) {
      return { available: false, message: validation.error };
    }

    const clean = validation.cleanUsername;

    // If it's the user's current username, it's valid for them
    if (user && user.username && user.username.toLowerCase() === clean) {
      return { available: true, message: 'Current username' };
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY_ALL_USERNAMES);
      const usernames = stored ? JSON.parse(stored) : [];
      const isTaken = usernames.some(u => u.toLowerCase() === clean);
      if (isTaken) {
        return { available: false, message: 'Username already taken' };
      }
      return { available: true, message: 'Username available' };
    } catch (e) {
      return { available: true, message: 'Username available' };
    }
  };

  /**
   * Real Supabase Google OAuth sign in
   */
  const signInWithGoogleOAuth = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent'
            }
          }
        });
        if (error) throw error;
      } catch (err) {
        showToast('Google login error: ' + (err.message || 'Failed to authenticate'), 'error');
      }
    } else {
      // Fallback in demo mode when Supabase credentials are not yet entered in .env
      handleGoogleSuccess({
        name: 'Maxx',
        email: 'maxx.anime@gmail.com',
        avatarUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200&auto=format&fit=crop&q=80'
      });
    }
  };

  /**
   * Open Google Login Popup
   */
  const loginWithGoogle = () => {
    setGoogleLoginOpen(true);
  };

  const closeGoogleLogin = () => {
    setGoogleLoginOpen(false);
  };

  /**
   * Handle Google Login Success (Local/Demo Fallback)
   * Fetches Google profile data and user's Google avatar
   */
  const handleGoogleSuccess = ({ email, name, avatarUrl }) => {
    const rawName = name || (email ? email.split('@')[0] : 'traveler');
    const cleanUsername = rawName.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 16) || 'traveler';
    const finalAvatar = avatarUrl || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200&auto=format&fit=crop&q=80';

    const newUser = {
      id: `usr_${Date.now()}`,
      email: email || 'user@gmail.com',
      username: cleanUsername,
      avatar_url: finalAvatar,
      google_avatar: finalAvatar,
      created_at: new Date().toISOString(),
      username_changed_at: null,
      profile_completed: true // Prevents recurring popup on browser reloads
    };

    setUser(newUser);
    setGoogleLoginOpen(false);
    setNeedsOnboarding(true); // Open Check Avatar / Confirm Profile dialog for this login action
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));
    } catch (e) {}
    showToast(`Signed in with Google as ${email || cleanUsername}!`, 'success');
  };

  /**
   * Dismiss Onboarding Modal without re-prompting on refresh
   */
  const dismissOnboarding = () => {
    setNeedsOnboarding(false);
    if (user?.id) {
      try {
        localStorage.setItem(`anistra_onboarded_${user.id}`, 'true');
      } catch (e) {}
    }
    if (user) {
      const updated = { ...user, profile_completed: true };
      setUser(updated);
      try {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated));
      } catch (e) {}
    }
  };

  /**
   * Complete First-Time Onboarding (Avatar Check & Custom Username Creation)
   */
  const completeOnboarding = async ({ avatarUrl, username } = {}) => {
    let cleanUsername = user?.username;

    // Validate and check username if provided or modified
    if (username && username.trim()) {
      const val = validateUsername(username.trim());
      if (!val.isValid) {
        showToast(val.error, 'error');
        return false;
      }

      if (val.cleanUsername.toLowerCase() !== (user?.username || '').toLowerCase()) {
        const avail = checkUsernameAvailable(username.trim());
        if (!avail.available) {
          showToast(avail.message, 'error');
          return false;
        }
      }
      cleanUsername = val.cleanUsername;
    }

    const finalAvatar = avatarUrl || user?.avatar_url || user?.google_avatar || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200&auto=format&fit=crop&q=80';
    const now = new Date().toISOString();

    const updatedUser = {
      ...(user || {}),
      id: user?.id || `usr_${Date.now()}`,
      username: cleanUsername,
      avatar_url: finalAvatar,
      google_avatar: user?.google_avatar || finalAvatar,
      profile_completed: true,
      created_at: user?.created_at || now
    };

    if (isSupabaseConfigured && supabase && user?.id) {
      try {
        const { error } = await supabase.from('profiles').upsert({
          id: user.id,
          email: user.email,
          username: cleanUsername,
          avatar_url: finalAvatar,
          created_at: user.created_at || now,
          updated_at: now
        }, { onConflict: 'id' });
        if (error) {
          console.warn('[COMPLETE_ONBOARDING] Supabase profile upsert error:', error);
          if (error.code === '23505') {
            showToast('Username is already taken. Please choose another username.', 'error');
            return false;
          }
        }
      } catch (err) {
        console.warn('[COMPLETE_ONBOARDING] Database error:', err);
      }
    }

    // Save in registered usernames
    if (cleanUsername) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_ALL_USERNAMES);
        const usernames = stored ? JSON.parse(stored) : [];
        if (!usernames.includes(cleanUsername)) {
          usernames.push(cleanUsername);
          localStorage.setItem(STORAGE_KEY_ALL_USERNAMES, JSON.stringify(usernames));
        }
      } catch (e) {}
    }

    // Persist onboarding completion in localStorage for this user
    if (user?.id) {
      try {
        localStorage.setItem(`anistra_onboarded_${user.id}`, 'true');
      } catch (e) {}
    }

    setUser(updatedUser);
    setNeedsOnboarding(false);
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updatedUser));
    } catch (e) {}

    showToast(`Welcome to ANISTRA, @${cleanUsername}!`, 'success');
    return true;
  };

  /**
   * Change Username with 14-day rule check
   */
  const changeUsername = async (newUsername) => {
    if (!user) return false;

    // Check cooldown
    const cooldown = checkUsernameCooldown(user.username_changed_at);
    if (!cooldown.canChange) {
      showToast(cooldown.message, 'warning');
      return false;
    }

    const val = validateUsername(newUsername);
    if (!val.isValid) {
      showToast(val.error, 'error');
      return false;
    }

    const avail = checkUsernameAvailable(newUsername);
    if (!avail.available && newUsername.toLowerCase() !== user.username.toLowerCase()) {
      showToast(avail.message, 'error');
      return false;
    }

    const now = new Date().toISOString();
    const updated = {
      ...user,
      username: val.cleanUsername,
      username_changed_at: now
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('profiles').update({
          username: val.cleanUsername,
          username_changed_at: now,
          updated_at: now
        }).eq('id', user.id);

        if (error) {
          showToast(error.message, 'error');
          return false;
        }
      } catch (err) {
        showToast('Failed to update username on server.', 'error');
        return false;
      }
    }

    // Update registered usernames
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ALL_USERNAMES);
      let usernames = stored ? JSON.parse(stored) : [];
      usernames = usernames.filter(u => u.toLowerCase() !== (user.username || '').toLowerCase());
      usernames.push(val.cleanUsername);
      localStorage.setItem(STORAGE_KEY_ALL_USERNAMES, JSON.stringify(usernames));
    } catch (e) {}

    setUser(updated);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated));
    showToast(`Username changed to @${val.cleanUsername}`, 'success');
    return true;
  };

  /**
   * Update Profile Avatar
   */
  const updateAvatar = async (avatarUrl) => {
    if (!user) return false;
    const updated = { ...user, avatar_url: avatarUrl };

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('profiles').update({
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        }).eq('id', user.id);
      } catch (e) {}
    }

    setUser(updated);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated));
    showToast('Profile picture updated', 'success');
    return true;
  };

  /**
   * Logout
   */
  const logout = async () => {
    const currentUid = user?.id;
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {}
    }
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY_USER);
      localStorage.removeItem('anistra_user_watchlist');
      localStorage.removeItem('anistra_watched_episodes');
      if (currentUid) {
        localStorage.removeItem(`anistra_user_watchlist_${currentUid}`);
        localStorage.removeItem(`anistra_watched_episodes_${currentUid}`);
      }
    } catch (e) {}
    showToast('Logged out of ANISTRA', 'info');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        needsOnboarding,
        setNeedsOnboarding,
        dismissOnboarding,
        googleLoginOpen,
        closeGoogleLogin,
        handleGoogleSuccess,
        loginWithGoogle,
        signInWithGoogleOAuth,
        logout,
        completeOnboarding,
        changeUsername,
        updateAvatar,
        checkUsernameAvailable
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
