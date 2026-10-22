/**
 * Jikan REST API Client for ANISTRA
 * Connects to Jikan API with optional API Key and caching.
 * Fetches accurate episode guides, titles, numbers, and seasons.
 */

const JIKAN_API_URL = import.meta.env.VITE_JIKAN_API_URL || 'https://api.jikan.moe/v4';
const JIKAN_API_KEY = import.meta.env.VITE_JIKAN_API_KEY || '';

const memoryCache = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour cache

function getHeaders() {
  const headers = {
    'Accept': 'application/json'
  };

  if (JIKAN_API_KEY) {
    // Support RapidAPI or custom proxies
    headers['X-RapidAPI-Key'] = JIKAN_API_KEY;
    headers['X-API-Key'] = JIKAN_API_KEY;
    headers['Authorization'] = `Bearer ${JIKAN_API_KEY}`;
  }

  return headers;
}

function getCached(key) {
  const mem = memoryCache.get(key);
  if (mem && Date.now() - mem.timestamp < CACHE_TTL_MS) {
    return mem.data;
  }
  try {
    const local = sessionStorage.getItem(`anistra_jikan_${key}`);
    if (local) {
      const parsed = JSON.parse(local);
      if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
        memoryCache.set(key, parsed);
        return parsed.data;
      }
    }
  } catch (e) {}
  return null;
}

function setCache(key, data) {
  const payload = { timestamp: Date.now(), data };
  memoryCache.set(key, payload);
  try {
    sessionStorage.setItem(`anistra_jikan_${key}`, JSON.stringify(payload));
  } catch (e) {}
}

/**
 * Fetch a single page of episodes from Jikan
 */
export async function getJikanAnimeEpisodes(malId, page = 1) {
  if (!malId) return { episodes: [], pagination: null };

  const cacheKey = `episodes_${malId}_page_${page}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(`${JIKAN_API_URL}/anime/${malId}/episodes?page=${page}`, {
      headers: getHeaders(),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Jikan HTTP ${res.status}`);
    }

    const json = await res.json();
    const data = {
      episodes: json.data || [],
      pagination: json.pagination || null
    };

    setCache(cacheKey, data);
    return data;
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.warn(`Jikan episode fetch for malId ${malId} page ${page} failed:`, error.message);
    }
    return { episodes: [], pagination: null };
  }
}

/**
 * Fetch all available episodes for an anime (up to maxPages)
 */
export async function getAllJikanAnimeEpisodes(malId, maxPages = 4) {
  if (!malId) return [];

  const cacheKey = `all_episodes_${malId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const firstPage = await getJikanAnimeEpisodes(malId, 1);
    let allEpisodes = [...(firstPage.episodes || [])];
    const lastPage = Math.min(firstPage.pagination?.last_visible_page || 1, maxPages);

    for (let p = 2; p <= lastPage; p++) {
      // Respect rate limit with small delay
      await new Promise((resolve) => setTimeout(resolve, 350));
      const pageData = await getJikanAnimeEpisodes(malId, p);
      if (pageData.episodes && pageData.episodes.length > 0) {
        allEpisodes = allEpisodes.concat(pageData.episodes);
      } else {
        break;
      }
    }

    if (allEpisodes.length > 0) {
      setCache(cacheKey, allEpisodes);
    }
    return allEpisodes;
  } catch (err) {
    console.warn('Error fetching all Jikan episodes:', err);
    return [];
  }
}

/**
 * Search Jikan by title if malId is missing
 */
export async function searchJikanAnime(title) {
  if (!title) return null;

  const cacheKey = `search_${encodeURIComponent(title.toLowerCase().trim())}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`${JIKAN_API_URL}/anime?q=${encodeURIComponent(title)}&limit=1`, {
      headers: getHeaders(),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`Jikan HTTP ${res.status}`);
    const json = await res.json();
    const result = json.data?.[0] || null;

    if (result) setCache(cacheKey, result);
    return result;
  } catch (e) {
    return null;
  }
}
