/**
 * ANISTRA Anime Franchise & Season Consolidation Engine
 * Ensures every season and episode is unified under a single anime card and details page.
 * Prevents fragmented separate cards for Season 1, Season 2, Season 3, etc.
 */

// Known multi-season metadata lookup for popular anime franchises
export const FRANCHISE_SEASONS_DATABASE = {
  // Jujutsu Kaisen
  'jujutsu kaisen': [
    { seasonNumber: 1, seasonTitle: 'SEASON 1', episodesCount: 24, malId: 40748 },
    { seasonNumber: 2, seasonTitle: 'SEASON 2 (Hidden Inventory & Shibuya)', episodesCount: 23, malId: 51009 }
  ],
  // Demon Slayer
  'demon slayer': [
    { seasonNumber: 1, seasonTitle: 'SEASON 1 (Unwavering Resolve)', episodesCount: 26, malId: 38000 },
    { seasonNumber: 2, seasonTitle: 'SEASON 2 (Mugen Train & Entertainment District)', episodesCount: 18, malId: 47778 },
    { seasonNumber: 3, seasonTitle: 'SEASON 3 (Swordsmith Village Arc)', episodesCount: 11, malId: 51019 },
    { seasonNumber: 4, seasonTitle: 'SEASON 4 (Hashira Training Arc)', episodesCount: 8, malId: 55701 }
  ],
  'kimetsu no yaiba': [
    { seasonNumber: 1, seasonTitle: 'SEASON 1', episodesCount: 26, malId: 38000 },
    { seasonNumber: 2, seasonTitle: 'SEASON 2', episodesCount: 18, malId: 47778 },
    { seasonNumber: 3, seasonTitle: 'SEASON 3', episodesCount: 11, malId: 51019 },
    { seasonNumber: 4, seasonTitle: 'SEASON 4', episodesCount: 8, malId: 55701 }
  ],
  // Attack on Titan
  'attack on titan': [
    { seasonNumber: 1, seasonTitle: 'SEASON 1', episodesCount: 25, malId: 16498 },
    { seasonNumber: 2, seasonTitle: 'SEASON 2', episodesCount: 12, malId: 25777 },
    { seasonNumber: 3, seasonTitle: 'SEASON 3', episodesCount: 22, malId: 35760 },
    { seasonNumber: 4, seasonTitle: 'THE FINAL SEASON', episodesCount: 30, malId: 40028 }
  ],
  'shingeki no kyojin': [
    { seasonNumber: 1, seasonTitle: 'SEASON 1', episodesCount: 25, malId: 16498 },
    { seasonNumber: 2, seasonTitle: 'SEASON 2', episodesCount: 12, malId: 25777 },
    { seasonNumber: 3, seasonTitle: 'SEASON 3', episodesCount: 22, malId: 35760 },
    { seasonNumber: 4, seasonTitle: 'THE FINAL SEASON', episodesCount: 30, malId: 40028 }
  ],
  // Solo Leveling
  'solo leveling': [
    { seasonNumber: 1, seasonTitle: 'SEASON 1 (Arise)', episodesCount: 12, malId: 52299 },
    { seasonNumber: 2, seasonTitle: 'SEASON 2 (Arise from the Shadow)', episodesCount: 13, malId: 58567 }
  ],
  // Oshi no Ko
  'oshi no ko': [
    { seasonNumber: 1, seasonTitle: 'SEASON 1', episodesCount: 11, malId: 54492 },
    { seasonNumber: 2, seasonTitle: 'SEASON 2 (Tokyo Blade)', episodesCount: 13, malId: 55791 }
  ],
  // Spy x Family
  'spy x family': [
    { seasonNumber: 1, seasonTitle: 'SEASON 1', episodesCount: 25, malId: 50265 },
    { seasonNumber: 2, seasonTitle: 'SEASON 2', episodesCount: 12, malId: 53887 }
  ],
  // Vinland Saga
  'vinland saga': [
    { seasonNumber: 1, seasonTitle: 'SEASON 1 (War in England)', episodesCount: 24, malId: 164 },
    { seasonNumber: 2, seasonTitle: 'SEASON 2 (Slave Arc)', episodesCount: 24, malId: 49387 }
  ],
  // Blue Box
  'blue box': [
    { seasonNumber: 1, seasonTitle: 'SEASON 1', episodesCount: 25, malId: 57181 },
    { seasonNumber: 2, seasonTitle: 'SEASON 2', episodesCount: 12, malId: 60234 }
  ],
  // Black Clover
  'black clover': [
    { seasonNumber: 1, seasonTitle: 'SEASON 1', episodesCount: 170, malId: 34572 },
    { seasonNumber: 2, seasonTitle: 'SEASON 2', episodesCount: 26, malId: 58000 }
  ],
  // Overgeared
  'overgeared': [
    { seasonNumber: 1, seasonTitle: 'SEASON 1', episodesCount: 12, malId: 59000 }
  ],
  // Frieren
  'frieren': [
    { seasonNumber: 1, seasonTitle: 'SEASON 1', episodesCount: 28, malId: 52991 }
  ],
  // One Piece
  'one piece': [
    { seasonNumber: 1, seasonTitle: 'EAST BLUE SAGA (Eps 1–61)', episodesCount: 61, malId: 21 },
    { seasonNumber: 2, seasonTitle: 'ALABASTA SAGA (Eps 62–135)', episodesCount: 74, malId: 21 },
    { seasonNumber: 3, seasonTitle: 'SKYPIEA SAGA (Eps 136–206)', episodesCount: 71, malId: 21 },
    { seasonNumber: 4, seasonTitle: 'WATER 7 SAGA (Eps 207–325)', episodesCount: 119, malId: 21 },
    { seasonNumber: 5, seasonTitle: 'SUMMIT WAR SAGA (Eps 385–516)', episodesCount: 132, malId: 21 },
    { seasonNumber: 6, seasonTitle: 'FISH-MAN ISLAND SAGA (Eps 517–574)', episodesCount: 58, malId: 21 },
    { seasonNumber: 7, seasonTitle: 'DRESSROSA SAGA (Eps 575–746)', episodesCount: 172, malId: 21 },
    { seasonNumber: 8, seasonTitle: 'WANO COUNTRY SAGA (Eps 890–1085)', episodesCount: 196, malId: 21 },
    { seasonNumber: 9, seasonTitle: 'EGGHEAD ARC (Eps 1086+)', episodesCount: 45, malId: 21 }
  ]
};

/**
 * Normalize title by stripping season suffixes (e.g. "Jujutsu Kaisen Season 2" -> "Jujutsu Kaisen")
 */
export function getBaseFranchiseTitle(title) {
  if (!title) return '';
  const str = typeof title === 'string'
    ? title
    : (title.english || title.romaji || title.userPreferred || title.name || '');
  return str
    .replace(/:\s*season\s+\d+/gi, '')
    .replace(/\s+season\s+\d+/gi, '')
    .replace(/\s+\d+(st|nd|rd|th)\s+season/gi, '')
    .replace(/\s+part\s+\d+/gi, '')
    .replace(/:\s*the\s+final\s+season/gi, '')
    .replace(/\s+the\s+final\s+season/gi, '')
    .trim();
}

/**
 * Find franchise seasons definition for an anime
 */
export function getFranchiseSeasons(anime) {
  if (!anime) return null;

  if (anime.franchiseSeasons && Array.isArray(anime.franchiseSeasons) && anime.franchiseSeasons.length > 0) {
    return anime.franchiseSeasons;
  }

  const titleStr = typeof anime.title === 'string'
    ? anime.title
    : (anime.title?.english || anime.title?.romaji || anime.title?.userPreferred || anime.name || '');
  const eng = (typeof anime.title === 'string' ? anime.title : (anime.title?.english || '')).toLowerCase();
  const rom = (typeof anime.title === 'string' ? anime.title : (anime.title?.romaji || '')).toLowerCase();
  const normTitle = titleStr.toLowerCase();
  const animeMalId = Number(anime.malId || anime.idMal || 0);

  for (const [key, seasons] of Object.entries(FRANCHISE_SEASONS_DATABASE)) {
    if (normTitle.includes(key) || eng.includes(key) || rom.includes(key)) {
      return seasons;
    }
    if (animeMalId && seasons.some(s => s.malId === animeMalId)) {
      return seasons;
    }
  }

  // Check if anime has relation sequels from AniList
  if (anime.relations && anime.relations.length > 0) {
    const sequels = anime.relations.filter(
      r => r.relationType === 'SEQUEL' && (r.node?.format === 'TV' || r.node?.format === 'ONA')
    );

    if (sequels.length > 0) {
      const generated = [
        {
          seasonNumber: 1,
          seasonTitle: 'SEASON 1',
          episodesCount: anime.episodes || 12,
          malId: anime.malId
        }
      ];

      sequels.forEach((seq, idx) => {
        generated.push({
          seasonNumber: idx + 2,
          seasonTitle: `SEASON ${idx + 2}${seq.node?.title?.english ? ` (${seq.node.title.english.replace(/.*season\s*\d*/i, '').trim() || ''})` : ''}`,
          episodesCount: seq.node?.episodes || 12,
          malId: seq.node?.idMal
        });
      });

      return generated;
    }
  }

  return null;
}

/**
 * Filter out standalone duplicate season cards from an anime list
 * (e.g., if "Jujutsu Kaisen" is present, remove "Jujutsu Kaisen Season 2")
 */
export function consolidateAnimeList(animeList) {
  if (!Array.isArray(animeList)) return [];

  const seenFranchises = new Set();
  const consolidated = [];

  for (const anime of animeList) {
    const rawTitle = anime.title?.english || anime.title?.romaji || (typeof anime.title === 'string' ? anime.title : '');
    const baseTitle = getBaseFranchiseTitle(rawTitle).toLowerCase();

    // Check if this title explicitly says "Season 2", "Season 3", "2nd Season", "3rd Season"
    const isExplicitSequel = /season\s+[2-9]|\d+(nd|rd|th)\s+season|part\s+[2-9]|final\s+season/i.test(rawTitle);

    // If we've already added a card for this base franchise, skip the sequel card
    if (seenFranchises.has(baseTitle) && isExplicitSequel) {
      continue;
    }

    // Check known franchise database to attach full seasons count & total episodes to this card
    const franchiseSeasons = getFranchiseSeasons(anime);
    let enhancedAnime = { ...anime };

    if (franchiseSeasons && franchiseSeasons.length > 1) {
      const totalSeriesEps = franchiseSeasons.reduce((sum, s) => sum + (s.episodesCount || 0), 0);
      enhancedAnime.seasonsCount = franchiseSeasons.length;
      enhancedAnime.totalSeriesEpisodes = totalSeriesEps;
      enhancedAnime.franchiseSeasons = franchiseSeasons;
      // Use clean franchise title
      enhancedAnime.title = typeof anime.title === 'object' && anime.title !== null
        ? {
            ...anime.title,
            english: getBaseFranchiseTitle(anime.title?.english || ''),
            romaji: getBaseFranchiseTitle(anime.title?.romaji || '')
          }
        : getBaseFranchiseTitle(anime.title || '');
    }

    seenFranchises.add(baseTitle);
    consolidated.push(enhancedAnime);
  }

  return consolidated;
}

/**
 * Accurately compute total episodes across all seasons of an anime franchise
 */
export function getTotalEpisodes(anime) {
  if (!anime) return 12;

  // 1. Check known multi-season franchise database first (canonical definition)
  const franchiseSeasons = getFranchiseSeasons(anime);
  if (franchiseSeasons && franchiseSeasons.length > 0) {
    const sum = franchiseSeasons.reduce((acc, s) => acc + (s.episodesCount || 0), 0);
    if (sum > 0) return sum;
  }

  // 2. Check seasonEpisodes breakdown
  if (anime.seasonEpisodes && typeof anime.seasonEpisodes === 'object') {
    const sum = Object.values(anime.seasonEpisodes).reduce((acc, count) => acc + Number(count || 0), 0);
    if (sum > 0) return sum;
  }

  // 3. Check attached totalSeriesEpisodes
  if (anime.totalSeriesEpisodes && anime.totalSeriesEpisodes > 0) {
    return anime.totalSeriesEpisodes;
  }

  return anime.episodes || 12;
}

