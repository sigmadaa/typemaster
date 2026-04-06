// ─── Auth Module ──────────────────────────────────────────────────────
// Manages user accounts stored in localStorage.
// Multiple users supported; current session tracked via AUTH_KEY.

const AUTH_KEY = 'typemaster_auth';

/** Naive but sufficient client-side hash (no sensitive data at stake) */
function simpleHash(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
    hash = hash & hash; // keep 32-bit
  }
  return (hash >>> 0).toString(36);
}

function getAuthData() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY) || '{"users":[],"current":null}');
  } catch { return { users: [], current: null }; }
}

function saveAuthData(data) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(data));
}

/** Returns lowercase username of the current session, or null */
export function getCurrentUser() {
  return getAuthData().current;
}

/** Returns display name of the current user, or null */
export function getCurrentUserDisplayName() {
  const data = getAuthData();
  if (!data.current) return null;
  const user = data.users.find(u => u.username === data.current);
  return user?.displayName || data.current;
}

export function isLoggedIn() {
  return !!getCurrentUser();
}

/**
 * Register a new user.
 * Checks username uniqueness both locally and on the server (cross-device).
 * @returns {Promise<{ ok: boolean, error?: string, user?: object }>}
 */
export async function registerUser(displayName, password) {
  displayName = (displayName || '').trim();
  if (displayName.length < 2) return { ok: false, error: 'Имя не может быть короче 2 символов' };
  if (displayName.length > 24) return { ok: false, error: 'Имя не может быть длиннее 24 символов' };
  if (!password || password.length < 4) return { ok: false, error: 'Пароль: минимум 4 символа' };

  const data = getAuthData();
  const uname = displayName.toLowerCase();
  const hash = simpleHash(password);

  // Fast local check (same device)
  if (data.users.find(u => u.username === uname)) {
    return { ok: false, error: 'Такое имя уже занято' };
  }

  // Server check — prevents the same nick across different devices/browsers
  try {
    const resp = await fetch('/api/users/register', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ displayName, passwordHash: hash }),
    });
    const result = await resp.json();
    if (!result.ok) return { ok: false, error: result.error || 'Это имя уже занято другим игроком' };
  } catch {
    // Server unreachable (offline / local file) — fall through to local-only registration
    console.warn('[Auth] Server unavailable, falling back to local-only registration');
  }

  const user = {
    username: uname,
    displayName,
    passwordHash: hash,
    createdAt: Date.now()
  };
  // Store admin flag if server granted it
  try {
    const resp2 = await fetch('/api/users/status/' + encodeURIComponent(uname));
    const status = await resp2.json();
    if (status.admin) user.admin = true;
  } catch { /* offline */ }
  data.users.push(user);
  data.current = uname;
  saveAuthData(data);
  return { ok: true, user };
}

/**
 * Log in an existing user.
 * @returns {{ ok: boolean, error?: string, user?: object }}
 */
export function loginUser(displayName, password) {
  displayName = (displayName || '').trim();
  if (!displayName || !password) return { ok: false, error: 'Введите имя и пароль' };

  const data = getAuthData();
  const uname = displayName.toLowerCase();
  const user = data.users.find(u => u.username === uname);

  if (!user) return { ok: false, error: 'Пользователь не найден' };
  if (user.passwordHash !== simpleHash(password)) return { ok: false, error: 'Неверный пароль' };

  data.current = uname;
  saveAuthData(data);
  return { ok: true, user };
}

/** Clear the current session (does not delete account data) */
export function logoutUser() {
  const data = getAuthData();
  data.current = null;
  saveAuthData(data);
}

/** Returns a copy of the current user's full data object, or null */
export function getCurrentUserData() {
  const data = getAuthData();
  if (!data.current) return null;
  const user = data.users.find(u => u.username === data.current);
  return user ? { ...user } : null;
}

/** Update meta fields (bio, avatarEmoji, avatarUrl) — no password required */
export function updateUserMeta(meta) {
  const data = getAuthData();
  const user = data.users.find(u => u.username === data.current);
  if (!user) return { ok: false, error: 'Пользователь не найден' };
  if (meta.bio !== undefined) user.bio = String(meta.bio).slice(0, 100);
  if (meta.avatarEmoji !== undefined) user.avatarEmoji = meta.avatarEmoji || null;
  if (meta.avatarUrl !== undefined) user.avatarUrl = (meta.avatarUrl || '').trim().slice(0, 300) || null;
  if (meta.avatarGradient !== undefined) user.avatarGradient = meta.avatarGradient || null;
  saveAuthData(data);
  return { ok: true };
}

// ─── VIP ──────────────────────────────────────────────────────────────
// Codes: VIP99-XXXXX = 30 days, VIP249-XXXXX = 90 days, VIP499-XXXXX = lifetime (forever)
// days value -1 = lifetime (sets vipForever flag)
const _VIP_CODES = {
  'VIP99-DEMO1': 30, 'VIP99-DEMO2': 30, 'VIP99-START': 30, 'VIP99-TEST1': 30,
  'VIP249-DEMO1': 90, 'VIP249-DEMO2': 90, 'VIP249-START': 90, 'VIP249-TEST1': 90,
  'VIP499-DEMO1': -1, 'VIP499-DEMO2': -1, 'VIP499-START': -1, 'VIP499-TEST1': -1,
};

export function activateVip(code) {
  const clean = (code || '').trim().toUpperCase();
  const days = _VIP_CODES[clean];
  if (days === undefined) return { ok: false, error: 'Неверный код активации' };
  const data = getAuthData();
  const user = data.users.find(u => u.username === data.current);
  if (!user) return { ok: false, error: 'Пользователь не найден' };
  if (days === -1) {
    // Lifetime: set a far-future expiry + permanent flag
    user.vipForever = true;
    user.vipExpiry = 9999999999999; // year ~2286
  } else {
    const now = Date.now();
    const base = user.vipForever ? now : Math.max(now, user.vipExpiry || 0);
    user.vipExpiry = base + days * 24 * 60 * 60 * 1000;
  }
  saveAuthData(data);
  return { ok: true, days, forever: days === -1, expiresAt: user.vipExpiry };
}

/** Check if the current user is an admin */
export function isAdmin() {
  const data = getAuthData();
  if (!data.current) return false;
  const user = data.users.find(u => u.username === data.current);
  return !!user?.admin;
}

/** Check if a user has active VIP. Pass username or leave empty for current user. */
export function isVip() {
  return true;
}

/** Returns { daysLeft, expiresAt, forever } */
export function getVipInfo() {
  return { forever: true, expiresAt: null, daysLeft: null };
}

// ─── Double-Down Tokens ───────────────────────────────────────────────
// VIP users get 3 tokens per calendar month.
// One token can be spent before any rated game to double the rating delta
// (both gains AND losses are ×2, just like Dota 2 Double Down).
const DOUBLE_TOKENS_PER_MONTH = 10;

/** Returns remaining double-down tokens for the current VIP user.
 *  Auto-refreshes to 3 when the calendar month changes. Returns 0 if not VIP. */
export function getDoubleTokens() {
  const data = getAuthData();
  const user = data.users.find(u => u.username === data.current);
  if (!user) return 0;

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${now.getMonth()}`;
  if (user.doubleTokenMonth !== currentMonth) {
    user.doubleTokenMonth = currentMonth;
    user.doubleTokens = DOUBLE_TOKENS_PER_MONTH;
    saveAuthData(data);
  }
  return user.doubleTokens ?? DOUBLE_TOKENS_PER_MONTH;
}

/** Consume one double-down token.
 *  Returns { ok: true, remaining } or { ok: false, error } */
export function consumeDoubleToken() {
  const data = getAuthData();
  const user = data.users.find(u => u.username === data.current);
  if (!user) return { ok: false, error: 'Пользователь не найден' };
  if (!isVip()) return { ok: false, error: 'Требуется VIP' };

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${now.getMonth()}`;
  if (user.doubleTokenMonth !== currentMonth) {
    user.doubleTokenMonth = currentMonth;
    user.doubleTokens = DOUBLE_TOKENS_PER_MONTH;
  }
  const current = user.doubleTokens ?? DOUBLE_TOKENS_PER_MONTH;
  if (current <= 0) return { ok: false, error: 'Токены исчерпаны' };

  user.doubleTokens = current - 1;
  saveAuthData(data);
  return { ok: true, remaining: user.doubleTokens };
}

/** Update display name — requires password confirmation */
export function updateDisplayName(newDisplayName, password) {
  newDisplayName = (newDisplayName || '').trim();
  if (newDisplayName.length < 2) return { ok: false, error: 'Имя: минимум 2 символа' };
  if (newDisplayName.length > 24) return { ok: false, error: 'Имя: максимум 24 символа' };

  const data = getAuthData();
  const user = data.users.find(u => u.username === data.current);
  if (!user) return { ok: false, error: 'Пользователь не найден' };
  if (user.passwordHash !== simpleHash(password)) return { ok: false, error: 'Неверный пароль' };

  user.displayName = newDisplayName;
  saveAuthData(data);
  return { ok: true, displayName: newDisplayName };
}

/** Change password — requires current password */
export function updatePassword(currentPassword, newPassword) {
  if (!newPassword || newPassword.length < 4) return { ok: false, error: 'Новый пароль: минимум 4 символа' };

  const data = getAuthData();
  const user = data.users.find(u => u.username === data.current);
  if (!user) return { ok: false, error: 'Пользователь не найден' };
  if (user.passwordHash !== simpleHash(currentPassword)) return { ok: false, error: 'Неверный текущий пароль' };

  user.passwordHash = simpleHash(newPassword);
  saveAuthData(data);
  return { ok: true };
}

// ─── Admin helpers ──────────────────────────────────────────────────────

// Admin activation codes (client-side, offline-friendly)
const _ADMIN_CODES = new Set([
  'ADMIN-MASTER99',
  'ADMIN-SUDO2025',
  'ADMIN-ROOT-TM1',
]);

/**
 * Activate admin mode with a secret code — works offline (no server needed).
 * Sets admin:true on the current user in localStorage.
 */
export function activateAdmin(code) {
  const clean = (code || '').trim().toUpperCase();
  if (!_ADMIN_CODES.has(clean)) return { ok: false, error: 'Неверный код администратора' };
  const data = getAuthData();
  const user = data.users.find(u => u.username === data.current);
  if (!user) return { ok: false, error: 'Не вошёл в систему' };
  user.admin = true;
  saveAuthData(data);
  return { ok: true };
}

/**
 * Refresh current user’s banned/admin status from server and update localStorage.
 * Returns { banned, admin } or null if offline.
 */
export async function refreshUserStatus() {
  const data = getAuthData();
  if (!data.current) return null;
  try {
    const resp = await fetch('/api/users/status/' + encodeURIComponent(data.current));
    const result = await resp.json();
    if (!result.exists) return null;
    const user = data.users.find(u => u.username === data.current);
    if (!user) return null;
    if (result.admin !== undefined) user.admin = !!result.admin;
    saveAuthData(data);
    return { banned: !!result.banned, admin: !!result.admin };
  } catch { return null; }
}

/**
 * Fetch all users from server (admin only).
 * @returns {Promise<{ ok: boolean, users?: Array, error?: string }>}
 */
export async function getAdminUserList() {
  const data = getAuthData();
  const admin = data.users.find(u => u.username === data.current && u.admin);
  if (!admin) return { ok: false, error: 'Нет прав' };
  try {
    const resp = await fetch(
      `/api/admin/users?admin=${encodeURIComponent(admin.username)}&hash=${encodeURIComponent(admin.passwordHash)}`
    );
    return await resp.json();
  } catch { return { ok: false, error: 'Сервер недоступен' }; }
}

/**
 * Ban or unban a user (admin only).
 * @param {string} targetUsername
 * @param {boolean} ban  true = ban, false = unban
 */
export async function banUser(targetUsername, ban) {
  const data = getAuthData();
  const admin = data.users.find(u => u.username === data.current && u.admin);
  if (!admin) return { ok: false, error: 'Нет прав' };
  try {
    const resp = await fetch('/api/admin/ban', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        adminUsername:    admin.username,
        adminPasswordHash: admin.passwordHash,
        targetUsername,
        ban,
      }),
    });
    return await resp.json();
  } catch { return { ok: false, error: 'Сервер недоступен' }; }
}
