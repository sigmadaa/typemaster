// localStorage persistence layer
const BASE_KEY = 'typemaster_';
let _userPrefix = '';

/** Call once after login/register to namespace all storage under the user's account */
export function setUserStorage(username) {
  _userPrefix = username ? username + '_' : '';
}

const getKey = k => BASE_KEY + _userPrefix + k;

export const storage = {
  get(k, def = null) {
    try {
      const v = localStorage.getItem(getKey(k));
      return v !== null ? JSON.parse(v) : def;
    } catch { return def; }
  },
  set(k, v) {
    try { localStorage.setItem(getKey(k), JSON.stringify(v)); } catch {}
  },
  update(k, fn, def = {}) {
    const cur = this.get(k, def);
    const next = fn(cur);
    this.set(k, next);
    return next;
  }
};

export function loadProfile() {
  return storage.get('profile', {
    name: 'Игрок',
    lang: 'ru',
    level: 1,
    totalChars: 0,
    totalErrors: 0,
    totalSessions: 0,
    bestSpeed: 0,
    createdAt: Date.now()
  });
}

export function saveProfile(patch) {
  storage.update('profile', cur => ({ ...cur, ...patch }));
}

export function loadStats() {
  return storage.get('stats', {
    sessions: [],         // [{date, speed, accuracy, chars, errors, mode}]
    heatmap: {},          // {key: {hits, errors}}
    dailyStreak: 0,
    lastSessionDate: null
  });
}

export function saveSession(session) {
  storage.update('stats', cur => {
    const sessions = [...(cur.sessions || []), { ...session, date: Date.now() }];
    // keep last 500
    if (sessions.length > 500) sessions.splice(0, sessions.length - 500);
    // heatmap
    const heatmap = { ...(cur.heatmap || {}) };
    if (session.keyStats) {
      Object.entries(session.keyStats).forEach(([k, v]) => {
        if (!heatmap[k]) heatmap[k] = { hits: 0, errors: 0 };
        heatmap[k].hits += v.hits || 0;
        heatmap[k].errors += v.errors || 0;
      });
    }
    // streak
    const today = new Date().toDateString();
    const last = cur.lastSessionDate;
    let streak = cur.dailyStreak || 0;
    if (last !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      streak = (last === yesterday) ? streak + 1 : 1;
    }
    return { ...cur, sessions, heatmap, dailyStreak: streak, lastSessionDate: today };
  }, { sessions: [], heatmap: {}, dailyStreak: 0, lastSessionDate: null });
}

export function loadAchievements() {
  return storage.get('achievements', {});
}

export function unlockAchievement(id) {
  storage.update('achievements', cur => ({ ...cur, [id]: { date: Date.now() } }), {});
}

export function loadSettings() {
  return storage.get('settings', {
    blindMode: false,
    sound: true,
    musicVolume: 0.2,
    sfxVolume: 0.5,
    theme: 'dark',
    lang: 'ru',
    showFingerHints: true,
    colorZones: true
  });
}

export function saveSettings(patch) {
  storage.update('settings', cur => ({ ...cur, ...patch }), {});
}
