/**
 * ANISTRA Content Moderation & Sanitization Engine
 * Blocks abusive, hateful, threatening, and inappropriate content.
 * Detects obfuscation/bypass attempts (l33t speak, spacing, punctuation insertions).
 */

const PROHIBITED_WORDS = [
  'nigger', 'nigga', 'faggot', 'kike', 'chink', 'retard', 'tranny',
  'kill yourself', 'kys', 'die', 'murder', 'rape', 'suicide', 'terrorist',
  'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'cunt', 'whore', 'slut', 'dick',
  'pussy', 'cock', 'blowjob', 'nazi', 'hitler', 'white power'
];

// Normalized leet replacements for bypass detection
const LEET_MAP = {
  '@': 'a',
  '4': 'a',
  '8': 'b',
  '(': 'c',
  '3': 'e',
  '1': 'i',
  '!': 'i',
  '0': 'o',
  '$': 's',
  '5': 's',
  '7': 't',
  '+': 't',
  'v': 'u',
};

/**
 * Sanitize basic HTML/script tags from user input
 */
export function sanitizeInput(text) {
  if (!text) return '';
  return text
    .replace(/<[^>]*>?/gm, '') // Remove HTML tags
    .replace(/javascript:/gi, '')
    .trim();
}

/**
 * Normalize text to detect stealthy bypass attempts
 */
function normalizeForBypassCheck(text) {
  let normalized = text.toLowerCase();
  
  // Replace common leet characters
  normalized = normalized.split('').map(char => LEET_MAP[char] || char).join('');
  
  // Collapse duplicate letters (e.g. fuuuck -> fuck)
  normalized = normalized.replace(/(.)\1{2,}/g, '$1$1');
  
  return normalized;
}

/**
 * Validate a review text against ANISTRA moderation policy
 * @param {string} text - Review text to validate
 * @returns {{ isValid: boolean, error?: string, sanitizedText: string }}
 */
export function validateReview(text) {
  const sanitized = sanitizeInput(text);

  if (!sanitized || sanitized.length < 5) {
    return {
      isValid: false,
      error: 'Review must be at least 5 characters long.',
      sanitizedText: sanitized
    };
  }

  if (sanitized.length > 3000) {
    return {
      isValid: false,
      error: 'Review cannot exceed 3,000 characters.',
      sanitizedText: sanitized
    };
  }

  const rawLower = sanitized.toLowerCase();
  const normalized = normalizeForBypassCheck(sanitized);
  const strippedSpacing = normalized.replace(/[\s\-_.*~+^]/g, '');

  for (const word of PROHIBITED_WORDS) {
    // Exact word or partial match check
    const wordPattern = new RegExp(`\\b${word}\\b`, 'i');
    if (wordPattern.test(rawLower) || wordPattern.test(normalized) || strippedSpacing.includes(word.replace(/\s/g, ''))) {
      return {
        isValid: false,
        error: "Your review contains language that isn't allowed on ANISTRA. Please edit your review and try again.",
        sanitizedText: sanitized
      };
    }
  }

  return {
    isValid: true,
    sanitizedText: sanitized
  };
}
