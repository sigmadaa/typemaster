// ─── Leaderboard ──────────────────────────────────────────────────────
// Reads all users from auth storage and builds a ranking table.
// Data is read-only — no writes to other users' data.

const LB_BASE_KEY = 'typemaster_';
const LB_AUTH_KEY = 'typemaster_auth';
const LEADERBOARD_UNLOCK_LEVEL = 1; // always unlocked

/** Get a value from localStorage for a specific user without changing current user */
function readUserKey(username, key, def = null) {
  try {
    const raw = localStorage.getItem(LB_BASE_KEY + username + '_' + key);
    return raw !== null ? JSON.parse(raw) : def;
  } catch { return def; }
}

/** Collect leaderboard entries from all registered users */
export function getLeaderboardEntries() {
  let authData;
  try {
    authData = JSON.parse(localStorage.getItem(LB_AUTH_KEY) || '{"users":[]}');
  } catch { return []; }

  return authData.users.map(user => {
    const profile = readUserKey(user.username, 'profile', {});
    const stats   = readUserKey(user.username, 'stats',   { sessions: [], dailyStreak: 0 });
    const sessions = stats.sessions || [];
    const bestSpeed = sessions.length ? Math.max(...sessions.map(s => s.speed || 0)) : 0;
    const avgAcc = sessions.length
      ? Math.round(sessions.reduce((s, x) => s + (x.accuracy || 0), 0) / sessions.length)
      : 0;

    const vip = !!(user.vipForever || (user.vipExpiry && user.vipExpiry > Date.now()));
    return {
      username:     user.username,
      displayName:  user.displayName || user.username,
      level:        profile.level        || 1,
      bestSpeed:    bestSpeed,
      totalSessions: sessions.length,
      totalChars:   profile.totalChars   || 0,
      avgAccuracy:  avgAcc,
      streak:       stats.dailyStreak    || 0,
      createdAt:    user.createdAt       || 0,
      ratingPoints: profile.ratingPoints || 1000,
      vip,
      avatarEmoji:  user.avatarEmoji || null,
      avatarUrl:    user.avatarUrl   || null,
    };
  });
}

/** Check if leaderboard is unlocked for the given profile level */
export function isLeaderboardUnlocked(profileLevel) {
  return true; // always unlocked
}

export const LEADERBOARD_UNLOCK_LEVEL_VALUE = LEADERBOARD_UNLOCK_LEVEL;

/**
 * Render the leaderboard into a container element.
 * @param {HTMLElement} container
 * @param {string} currentUsername  — highlight current user row
 * @param {number} profileLevel     — to show locked/unlocked state
 */
export function renderLeaderboard(container, currentUsername, profileLevel) {
  const entries = getLeaderboardEntries();
  if (!entries.length) {
    container.innerHTML = '<p class="text-muted" style="padding:40px;text-align:center">Нет данных</p>';
    return;
  }

  // Sort by rating
  entries.sort((a, b) => b.ratingPoints - a.ratingPoints || b.bestSpeed - a.bestSpeed);

  const medals = ['🥇', '🥈', '🥉'];

  function buildRows(list, startIdx) {
    return list.map((e, i) => {
      const globalIdx = startIdx + i;
      return `
        <tr class="lb-row ${e.username === currentUsername ? 'lb-row-me' : ''}" data-username="${e.username}">
          <td class="lb-rank">${medals[globalIdx] || (globalIdx + 1)}</td>
          <td class="lb-name">
            ${e.avatarUrl
              ? `<span class="lb-avatar lb-avatar-img"><img src="${e.avatarUrl}" onerror="this.parentElement.textContent='${(e.avatarEmoji||e.displayName[0]).toUpperCase()}'" /></span>`
              : `<span class="lb-avatar">${e.avatarEmoji || e.displayName[0].toUpperCase()}</span>`}
            ${e.displayName}
            ${e.username === currentUsername ? '<span class="lb-you">ты</span>' : ''}
          </td>
          <td><span class="lb-level">Ур. ${e.level}</span></td>
          <td class="lb-rating">${e.ratingPoints} <small>⭐</small></td>
          <td class="lb-speed">${e.bestSpeed} <small>зн/мин</small></td>
          <td>${e.avgAccuracy}%</td>
          <td>${e.totalSessions}</td>
          <td>${e.totalChars.toLocaleString()}</td>
          <td>${e.streak}</td>
        </tr>`;
    }).join('');
  }

  const tbodyHtml = buildRows(entries, 0);

  container.innerHTML = `
    <div class="lb-header">
      <h2>🏆 Таблица лидеров</h2>
      <p class="text-muted mt-8">Рейтинг по лучшей скорости среди всех игроков на этом устройстве</p>
    </div>
    <div class="lb-tabs">
      <button class="lb-tab active" data-sort="rating">⭐ Рейтинг</button>
      <button class="lb-tab" data-sort="speed">⚡ Скорость</button>
      <button class="lb-tab" data-sort="level">📈 Уровень</button>
      <button class="lb-tab" data-sort="sessions">🎮 Сессии</button>
      <button class="lb-tab" data-sort="chars">⌨️ Символы</button>
    </div>
    <div class="lb-table-wrap">
      <table class="lb-table" id="lb-table">
        <thead>
          <tr>
            <th>#</th><th>Игрок</th><th>Уровень</th><th>⭐ Рейтинг</th>
            <th>Лучшая скорость</th><th>Точность</th><th>Сессий</th><th>Символов</th><th>Серия 🔥</th>
          </tr>
        </thead>
        <tbody id="lb-tbody">${tbodyHtml}</tbody>
      </table>
    </div>`;

  // Tab sorting — VIP always on top within their tier
  container.querySelectorAll('.lb-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      container.querySelectorAll('.lb-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const sortKey = tab.dataset.sort;
      const sortFns = {
        rating:   (a, b) => b.ratingPoints - a.ratingPoints,
        speed:    (a, b) => b.bestSpeed - a.bestSpeed,
        level:    (a, b) => b.level - a.level,
        sessions: (a, b) => b.totalSessions - a.totalSessions,
        chars:    (a, b) => b.totalChars - a.totalChars,
      };
      const fn = sortFns[sortKey] || sortFns.rating;
      const sorted = [...entries].sort(fn);
      const tbody = container.querySelector('#lb-tbody');
      if (tbody) tbody.innerHTML = buildRows(sorted, 0);
    });
  });
}
