import { MOCK_ANIME } from './mockData';
import { consolidateAnimeList, getFranchiseSeasons } from '../utils/animeGrouping';

const ANILIST_API_URL = import.meta.env.VITE_ANILIST_API_URL || 'https://graphql.anilist.co';

// In-memory cache for ultra-fast instant UI transitions
const memoryCache = new Map();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

function getCached(key) {
  const cached = memoryCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }
  try {
    const local = sessionStorage.getItem(`anistra_cache_${key}`);
    if (local) {
      const parsed = JSON.parse(local);
      if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
        memoryCache.set(key, parsed);
        return parsed.data;
      }
    }
  } catch (e) {
    // Ignore storage quota or parsing errors
  }
  return null;
}

function setCache(key, data) {
  const payload = { timestamp: Date.now(), data };
  memoryCache.set(key, payload);
  try {
    sessionStorage.setItem(`anistra_cache_${key}`, JSON.stringify(payload));
  } catch (e) {
    // Ignore session storage quota
  }
}

/**
 * Execute GraphQL request against AniList
 */
async function fetchAniList(query, variables = {}) {
  const cacheKey = JSON.stringify({ query, variables });
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(ANILIST_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ query, variables })
    });

    if (!response.ok) {
      throw new Error(`AniList HTTP ${response.status}`);
    }

    const json = await response.json();
    if (json.errors) {
      throw new Error(json.errors[0]?.message || 'GraphQL error');
    }

    const data = json.data;
    setCache(cacheKey, data);
    return data;
  } catch (error) {
    console.warn('AniList API fetch failed or rate limited, using fallback:', error.message);
    return null;
  }
}

/**
 * Normalize AniList media to standard ANISTRA format
 */
export function normalizeAniListMedia(media) {
  if (!media) return null;
  
  const studioName = media.studios?.nodes?.[0]?.name || media.studio || 'Unknown Studio';
  const score = media.averageScore ? (media.averageScore / 20).toFixed(1) : (media.rating || '4.5');

  return {
    id: String(media.id),
    malId: media.idMal || media.malId,
    title: {
      english: media.title?.english || media.title?.romaji || 'Unknown Title',
      romaji: media.title?.romaji || media.title?.english || '',
      native: media.title?.native || ''
    },
    synopsis: media.description ? media.description.replace(/<[^>]*>?/gm, '') : (media.synopsis || ''),
    tagline: media.tagline || (media.genres ? `${media.genres.slice(0, 3).join(' • ')}` : ''),
    coverImage: {
      large: media.coverImage?.extraLarge || media.coverImage?.large || media.coverImage,
      extraLarge: media.coverImage?.extraLarge || media.coverImage?.large || media.coverImage
    },
    bannerImage: media.bannerImage || media.coverImage?.extraLarge || media.coverImage?.large || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1600&auto=format&fit=crop&q=80',
    genres: media.genres || [],
    averageScore: media.averageScore || 85,
    rating: parseFloat(score),
    format: media.format || 'TV',
    status: media.status || 'FINISHED',
    episodes: media.episodes || 12,
    seasonsCount: media.seasonsCount || 1,
    seasonEpisodes: media.seasonEpisodes || { 1: media.episodes || 12 },
    season: media.season || 'FALL',
    seasonYear: media.seasonYear || media.year || 2023,
    year: media.seasonYear || media.year || 2023,
    studio: studioName,
    source: media.source || 'Manga',
    duration: media.duration || 24,
    trailer: media.trailer,
    rankings: media.rankings || [],
    streamingEpisodes: media.streamingEpisodes || [],
    relations: media.relations?.edges || [],
    nextAiringEpisode: media.nextAiringEpisode || null
  };
}

const MEDIA_FRAGMENT = `
  id
  idMal
  title {
    romaji
    english
    native
  }
  description
  coverImage {
    large
    extraLarge
  }
  bannerImage
  genres
  averageScore
  format
  status
  episodes
  season
  seasonYear
  studios(isMain: true) {
    nodes {
      name
    }
  }
  duration
  source
`;

/**
 * Fetch Trending Anime (Consolidated franchises)
 */
export async function getTrendingAnime(perPage = 10) {
  const query = `
    query ($perPage: Int) {
      Page(page: 1, perPage: $perPage) {
        media(sort: TRENDING_DESC, type: ANIME, isAdult: false) {
          ${MEDIA_FRAGMENT}
        }
      }
    }
  `;

  const data = await fetchAniList(query, { perPage: perPage * 2 });
  if (data?.Page?.media && data.Page.media.length > 0) {
    const normalized = data.Page.media.map(normalizeAniListMedia);
    const consolidated = consolidateAnimeList(normalized).slice(0, perPage);
    return consolidated.map((item, idx) => ({
      ...item,
      rank: idx + 1,
      isTrending: true
    }));
  }

  // Fallback to rich curated data
  return consolidateAnimeList(MOCK_ANIME.filter(a => a.isTrending)).slice(0, perPage).map((a, idx) => ({ ...a, rank: idx + 1 }));
}

/**
 * Fetch Popular Anime (Consolidated franchises)
 */
export async function getPopularAnime(perPage = 16) {
  const query = `
    query ($perPage: Int) {
      Page(page: 1, perPage: $perPage) {
        media(sort: POPULARITY_DESC, type: ANIME, isAdult: false) {
          ${MEDIA_FRAGMENT}
        }
      }
    }
  `;

  const data = await fetchAniList(query, { perPage: perPage * 2 });
  if (data?.Page?.media && data.Page.media.length > 0) {
    const normalized = data.Page.media.map(normalizeAniListMedia);
    return consolidateAnimeList(normalized).slice(0, perPage);
  }

  return consolidateAnimeList(MOCK_ANIME).slice(0, perPage);
}

/**
 * Fetch Top Rated Anime (Consolidated franchises)
 */
export async function getTopRatedAnime(perPage = 10) {
  const query = `
    query ($perPage: Int) {
      Page(page: 1, perPage: $perPage) {
        media(sort: SCORE_DESC, type: ANIME, isAdult: false) {
          ${MEDIA_FRAGMENT}
        }
      }
    }
  `;

  const data = await fetchAniList(query, { perPage: perPage * 2 });
  if (data?.Page?.media && data.Page.media.length > 0) {
    const normalized = data.Page.media.map(normalizeAniListMedia);
    const consolidated = consolidateAnimeList(normalized).slice(0, perPage);
    return consolidated.map((item, idx) => ({
      ...item,
      rank: idx + 1
    }));
  }

  return consolidateAnimeList(MOCK_ANIME.filter(a => a.isTopRated)).slice(0, perPage).map((a, idx) => ({ ...a, rank: idx + 1 }));
}

/**
 * Fetch Anime by ID with franchise seasons
 */
export async function getAnimeById(id) {
  const numericId = parseInt(id, 10);
  if (!numericId || isNaN(numericId)) {
    const mock = MOCK_ANIME.find(a => String(a.id) === String(id));
    if (mock) {
      const fSeasons = getFranchiseSeasons(mock);
      if (fSeasons) {
        mock.seasonsCount = fSeasons.length;
        mock.totalSeriesEpisodes = fSeasons.reduce((sum, s) => sum + s.episodesCount, 0);
        mock.franchiseSeasons = fSeasons;
      }
    }
    return mock || null;
  }

  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        ${MEDIA_FRAGMENT}
        streamingEpisodes {
          title
          thumbnail
          url
        }
        nextAiringEpisode {
          episode
          timeUntilAiring
        }
        relations {
          edges {
            relationType
            node {
              id
              idMal
              title {
                english
                romaji
              }
              format
              episodes
              seasonYear
            }
          }
        }
        trailer {
          id
          site
        }
        rankings {
          rank
          type
          allTime
          context
        }
      }
    }
  `;

  const data = await fetchAniList(query, { id: numericId });
  if (data?.Media) {
    const normalized = normalizeAniListMedia(data.Media);
    const fSeasons = getFranchiseSeasons(normalized);
    if (fSeasons && fSeasons.length > 1) {
      normalized.seasonsCount = fSeasons.length;
      normalized.totalSeriesEpisodes = fSeasons.reduce((sum, s) => sum + s.episodesCount, 0);
      normalized.franchiseSeasons = fSeasons;
    }
    return normalized;
  }

  // Fallback
  const fallbackMock = MOCK_ANIME.find(a => String(a.id) === String(id)) || MOCK_ANIME[0];
  const fSeasons = getFranchiseSeasons(fallbackMock);
  if (fSeasons) {
    fallbackMock.seasonsCount = fSeasons.length;
    fallbackMock.totalSeriesEpisodes = fSeasons.reduce((sum, s) => sum + s.episodesCount, 0);
    fallbackMock.franchiseSeasons = fSeasons;
  }
  return fallbackMock;
}


/**
 * Search anime with filters
 */
export async function searchAnime({
  search = '',
  genre = '',
  year = '',
  season = '',
  format = '',
  status = '',
  sort = 'POPULARITY_DESC',
  page = 1,
  perPage = 20
}) {
  const variables = { page, perPage, sort: [sort] };
  if (search.trim()) variables.search = search.trim();
  if (genre && genre !== 'All') variables.genre = genre;
  if (year) variables.seasonYear = parseInt(year, 10);
  if (season) variables.season = season;
  if (format) variables.format = format;
  if (status) variables.status = status;

  const query = `
    query ($page: Int, $perPage: Int, $search: String, $genre: String, $seasonYear: Int, $season: MediaSeason, $format: MediaFormat, $status: MediaStatus, $sort: [MediaSort]) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          total
          currentPage
          lastPage
          hasNextPage
        }
        media(search: $search, genre: $genre, seasonYear: $seasonYear, season: $season, format: $format, status: $status, sort: $sort, type: ANIME, isAdult: false) {
          ${MEDIA_FRAGMENT}
        }
      }
    }
  `;

  const data = await fetchAniList(query, variables);
  if (data?.Page?.media) {
    const normalized = data.Page.media.map(normalizeAniListMedia);
    return {
      anime: consolidateAnimeList(normalized),
      pageInfo: data.Page.pageInfo
    };
  }

  // Filter mock anime
  let filtered = [...MOCK_ANIME];
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(a => 
      a.title.english.toLowerCase().includes(q) ||
      a.title.romaji.toLowerCase().includes(q) ||
      a.studio.toLowerCase().includes(q)
    );
  }
  if (genre && genre !== 'All') {
    filtered = filtered.filter(a => a.genres.includes(genre));
  }
  if (status) {
    filtered = filtered.filter(a => a.status === status);
  }
  if (format) {
    filtered = filtered.filter(a => a.format === format);
  }

  return {
    anime: consolidateAnimeList(filtered),
    pageInfo: {
      total: filtered.length,
      currentPage: 1,
      lastPage: 1,
      hasNextPage: false
    }
  };
}

