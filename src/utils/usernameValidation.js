/**
 * ANISTRA Username validation & cooldown rules
 */

const RESERVED_USERNAMES = [
  'admin', 'administrator', 'anistra', 'anistra_official', 'staff', 'moderator',
  'system', 'support', 'help', 'root', 'security', 'official', 'null', 'undefined', 'api'
];

export function validateUsername(username) {
  if (!username) {
    return { isValid: false, error: 'Username is required.' };
  }

  const clean = username.trim().toLowerCase();

  if (clean.length < 4) {
    return { isValid: false, error: 'Username must be at least 4 characters long.' };
  }

  if (clean.length > 20) {
    return { isValid: false, error: 'Username must not exceed 20 characters.' };
  }

  // Must contain only letters, numbers, and underscores
  if (!/^[a-zA-Z0-9_]+$/.test(clean)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, and underscores.' };
  }

  if (RESERVED_USERNAMES.includes(clean)) {
    return { isValid: false, error: 'This username is reserved by ANISTRA.' };
  }

  return { isValid: true, cleanUsername: clean };
}

/**
 * Check if the 14-day username change cooldown has expired
 * @param {string|Date} lastChangedAt - ISO date string of last username update
 * @returns {{ canChange: boolean, daysRemaining: number, message?: string }}
 */
export function checkUsernameCooldown(lastChangedAt) {
  if (!lastChangedAt) {
    return { canChange: true, daysRemaining: 0 };
  }

  const lastChange = new Date(lastChangedAt).getTime();
  const now = Date.now();
  const cooldownMs = 14 * 24 * 60 * 60 * 1000;
  const elapsed = now - lastChange;

  if (elapsed >= cooldownMs) {
    return { canChange: true, daysRemaining: 0 };
  }

  const remainingMs = cooldownMs - elapsed;
  const daysRemaining = Math.max(1, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));

  return {
    canChange: false,
    daysRemaining,
    message: `Username change available in ${daysRemaining} day${daysRemaining > 1 ? 's' : ''}.`
  };
}
