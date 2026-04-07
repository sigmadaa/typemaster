"use strict";

// ===== js/firebase-init.js =====
// Firebase initialization — compat SDK loaded via CDN in index.html
// This file must be first in the bundle (before auth.js and storage.js)
firebase.initializeApp({
  apiKey:            'AIzaSyD5LNHJdg_fv4l--RDZlaWEdiUQ5hk6yPc',
  authDomain:        'typemaster-f1e5a.firebaseapp.com',
  projectId:         'typemaster-f1e5a',
  storageBucket:     'typemaster-f1e5a.firebasestorage.app',
  messagingSenderId: '511707783630',
  appId:             '1:511707783630:web:5f01851c338d1d270f4b9f',
});

const _fbAuth = firebase.auth();
const _fbDb   = firebase.firestore();


// ===== js/data/words.js =====
// Word lists and letter sets for training levels
const WORDS = {
  ru: {
    level1: ['аа', 'оо', 'ао', 'оа', 'аоа', 'оао'],
    level2: ['авва', 'оло', 'ала', 'вол', 'лов', 'вол'],
    level3: ['фол', 'фол', 'ала', 'сол', 'вал'],
    home: ['фыва', 'олдж', 'фол', 'дол', 'вол', 'жало', 'фаол', 'свод', 'слод'],
    common: [
      'год', 'два', 'три', 'раз', 'там', 'тут', 'вот', 'как', 'что', 'все',
      'уже', 'ещё', 'или', 'нет', 'так', 'его', 'её', 'кто', 'над', 'под',
      'для', 'при', 'без', 'про', 'до', 'по', 'из', 'от', 'во', 'со',
      'мир', 'дом', 'сон', 'день', 'ночь', 'путь', 'час', 'свет', 'тень', 'огонь',
      'дело', 'слово', 'место', 'время', 'жизнь', 'люди', 'рука', 'глаз', 'лицо', 'сила',
      'работа', 'город', 'страна', 'человек', 'вопрос', 'система', 'право', 'власть',
      'первый', 'другой', 'новый', 'старый', 'большой', 'малый', 'сам', 'себя',
      'делать', 'знать', 'идти', 'стать', 'дать', 'брать', 'видеть', 'думать',
      'сказать', 'говорить', 'иметь', 'хотеть', 'мочь', 'встать', 'жить', 'писать'
    ],
    code: [
      'function', 'return', 'const', 'let', 'var', 'if', 'else', 'for', 'while',
      'import', 'export', 'class', 'extends', 'async', 'await', 'try', 'catch',
      'null', 'undefined', 'true', 'false', 'typeof', 'new', 'this', 'super',
      'break', 'continue', 'switch', 'case', 'default', 'throw', 'finally',
      'def', 'print', 'range', 'list', 'dict', 'len', 'str', 'int', 'float',
      'pass', 'lambda', 'yield', 'with', 'from', 'not', 'and', 'or', 'in',
      'data', 'result', 'error', 'index', 'count', 'total', 'value', 'key',
      'user', 'token', 'query', 'input', 'output', 'config', 'state', 'type',
      'item', 'items', 'array', 'object', 'string', 'number', 'boolean',
      'response', 'request', 'callback', 'promise', 'resolve', 'reject',
      'get', 'set', 'post', 'put', 'delete', 'update', 'fetch', 'push', 'pop',
      'filter', 'map', 'reduce', 'find', 'sort', 'slice', 'join', 'split',
      'length', 'size', 'width', 'height', 'id', 'src', 'href', 'style',
      'start', 'stop', 'init', 'load', 'save', 'parse', 'format', 'render',
      'create', 'read', 'write', 'open', 'close', 'connect', 'send',
      'path', 'file', 'url', 'host', 'port', 'method', 'status', 'body',
      'sum', 'min', 'max', 'abs', 'sqrt', 'round', 'floor', 'ceil',
      'log', 'warn', 'info', 'debug', 'test', 'assert', 'expect',
      'then', 'done', 'next', 'run', 'build', 'name', 'password', 'email'
    ]
  },
  en: {
    level1: ['aa', 'ff', 'jj', 'aj', 'fa', 'fj'],
    level2: ['add', 'all', 'fall', 'jag', 'had', 'hall'],
    level3: ['glad', 'flag', 'half', 'fail', 'fad', 'lad'],
    home: ['asdf', 'jkl', 'flag', 'glad', 'dash', 'flask', 'flash', 'lash'],
    common: [
      'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had',
      'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his',
      'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy',
      'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use',
      'time', 'year', 'good', 'know', 'take', 'them', 'well', 'also', 'back',
      'after', 'being', 'could', 'every', 'first', 'great', 'group', 'house',
      'large', 'light', 'might', 'never', 'night', 'other', 'place', 'point',
      'right', 'round', 'small', 'sound', 'still', 'study', 'their', 'there',
      'thing', 'think', 'three', 'under', 'water', 'where', 'which', 'while',
      'world', 'would', 'write', 'young', 'about', 'above', 'began', 'begin',
      'black', 'bring', 'carry', 'close', 'color', 'cross', 'don\'t', 'earth',
      'found', 'given', 'going', 'hands', 'horse', 'human', 'leave', 'often',
      'plant', 'power', 'story', 'those', 'watch', 'white',
      'started', 'another', 'because', 'between', 'children', 'country',
      'example', 'follow', 'important', 'mountain', 'problem', 'question',
      'through', 'together', 'without', 'something', 'sometimes', 'different',
      'complete', 'everyone', 'language', 'possible', 'sentence', 'together'
    ],
    code: [
      'function', 'return', 'const', 'let', 'var', 'if', 'else', 'for', 'while',
      'import', 'export', 'class', 'extends', 'async', 'await', 'try', 'catch',
      'null', 'undefined', 'true', 'false', 'typeof', 'new', 'this', 'super',
      'break', 'continue', 'switch', 'case', 'default', 'throw', 'finally',
      'data', 'result', 'error', 'index', 'count', 'total', 'value', 'key',
      'user', 'token', 'query', 'input', 'output', 'config', 'state', 'type',
      'item', 'items', 'array', 'object', 'string', 'number', 'boolean',
      'response', 'request', 'callback', 'promise', 'resolve', 'reject',
      'get', 'set', 'post', 'put', 'delete', 'update', 'fetch', 'push', 'pop',
      'filter', 'map', 'reduce', 'find', 'sort', 'slice', 'join', 'split',
      'length', 'size', 'width', 'height', 'id', 'src', 'href', 'style',
      'start', 'stop', 'init', 'load', 'save', 'parse', 'format', 'render',
      'create', 'read', 'write', 'open', 'close', 'connect', 'send',
      'path', 'file', 'url', 'host', 'port', 'method', 'status', 'body',
      'sum', 'min', 'max', 'abs', 'sqrt', 'round', 'floor', 'ceil',
      'log', 'warn', 'debug', 'test', 'assert', 'expect', 'mock',
      'then', 'done', 'next', 'run', 'build', 'name', 'password', 'email',
      'component', 'module', 'service', 'interface', 'interface', 'props',
      'useState', 'useEffect', 'render', 'mounted', 'computed', 'watch'
    ],
    pangrams: [
      'the quick brown fox jumps over the lazy dog',
      'pack my box with five dozen liquor jugs',
      'how vexingly quick daft zebras jump',
      'the five boxing wizards jump quickly',
      'bright vixens jump dozy fowl quack'
    ]
  }
};

const KEYBOARD_LAYOUTS = {
  ru: {
    rows: [
      ['`','1','2','3','4','5','6','7','8','9','0','-','='],
      ['й','ц','у','к','е','н','г','ш','щ','з','х','ъ'],
      ['ф','ы','в','а','п','р','о','л','д','ж','э'],
      ['я','ч','с','м','и','т','ь','б','ю','.'],
      [' ']
    ],
    shifted: {
      '1':'!','2':'"','3':'№','4':';','5':'%','6':':','7':'?','8':'*','9':'(','0':')','е':'Е'
    }
  },
  en: {
    rows: [
      ['`','1','2','3','4','5','6','7','8','9','0','-','='],
      ['q','w','e','r','t','y','u','i','o','p','[',']'],
      ['a','s','d','f','g','h','j','k','l',';',"'"],
      ['z','x','c','v','b','n','m',',','.','/'],
      [' ']
    ],
    shifted: {
      '`':'~','1':'!','2':'@','3':'#','4':'$','5':'%','6':'^','7':'&','8':'*','9':'(','0':')','-':'_','=':'+',
      '[':'{',']':'}','\\':'|',';':':','\'':'"',',':'<','.':'>','/':'?'
    }
  }
};

// Finger zone assignments: key → finger index (0=L.pinky … 7=R.pinky, 8=thumb)
const FINGER_ZONES = {
  en: buildFingerZones('en'),
  ru: buildFingerZones('ru')
};

function buildFingerZones(lang) {
  const zones = {};
  // Helper: rowIndex, keyIndex → finger
  const map = [
    // Numbers row
    { range: [0,1], finger: 0 }, // ` 1
    { range: [2,2], finger: 1 }, // 2
    { range: [3,3], finger: 2 }, // 3
    { range: [4,5], finger: 3 }, // 4 5
    { range: [6,7], finger: 4 }, // 6 7
    { range: [8,8], finger: 5 }, // 8
    { range: [9,9], finger: 6 }, // 9
    { range: [10,12], finger: 7 }, // 0 - =
  ];

  const layout = KEYBOARD_LAYOUTS[lang];
  layout.rows.forEach((row, ri) => {
    row.forEach((key, ki) => {
      if (key === ' ') { zones[' '] = 8; return; }
      zones[key.toLowerCase()] = getFingerForKey(ri, ki);
    });
  });
  return zones;
}

function getFingerForKey(row, col) {
  // Row 0: numbers
  if (row === 0) {
    if (col <= 1) return 0;       // ` 1 → L.pinky
    if (col === 2) return 1;       // 2 → L.ring
    if (col === 3) return 2;       // 3 → L.middle
    if (col <= 5) return 3;        // 4,5 → L.index
    if (col <= 7) return 4;        // 6,7 → R.index
    if (col === 8) return 5;       // 8 → R.middle
    if (col === 9) return 6;       // 9 → R.ring
    return 7;                      // 0 - = → R.pinky
  }
  // Row 1: QWERTY / ЙЦУКЕН
  if (row === 1) {
    if (col === 0) return 0;
    if (col === 1) return 1;
    if (col === 2) return 2;
    if (col <= 4) return 3;        // r,t / к,е
    if (col <= 6) return 4;        // y,u / н,г
    if (col === 7) return 5;
    if (col === 8) return 6;
    return 7;
  }
  // Row 2: ASDF / ФЫВА
  if (row === 2) {
    if (col === 0) return 0;
    if (col === 1) return 1;
    if (col === 2) return 2;
    if (col <= 4) return 3;        // f,g  / а,п
    if (col <= 6) return 4;        // h,j  / р,о
    if (col === 7) return 5;
    if (col === 8) return 6;
    return 7;
  }
  // Row 3: ZXCV / ЯЧСМ
  if (row === 3) {
    if (col === 0) return 0;
    if (col === 1) return 1;
    if (col === 2) return 2;
    if (col <= 4) return 3;
    if (col <= 6) return 4;
    if (col === 7) return 5;
    if (col === 8) return 6;
    return 7;
  }
  return 8; // space = thumbs
}

const FINGER_NAMES = [
  'Л. мизинец', 'Л. безымянный', 'Л. средний', 'Л. указательный',
  'П. указательный', 'П. средний', 'П. безымянный', 'П. мизинец',
  'Большие пальцы'
];

const FINGER_COLORS = [
  '#e74c3c', // L.pinky   - red
  '#e67e22', // L.ring    - orange
  '#f1c40f', // L.middle  - yellow
  '#2ecc71', // L.index   - green
  '#1abc9c', // R.index   - teal
  '#3498db', // R.middle  - blue
  '#9b59b6', // R.ring    - purple
  '#e91e63', // R.pinky   - pink
  '#95a5a6'  // Thumbs    - gray
];


// ===== js/data/levels.js =====
// Level definitions for the training system
const LEVELS = [
  // Tier 1: Home position basics
  {
    id: 1, name: 'Уровень 1', title: 'Первые пальцы',
    description: 'Клавиши А и О. Позиция рук.',
    chars: { ru: 'ао', en: 'af' },
    minSpeed: 20, minAccuracy: 95, wordCount: 20, duration: 60,
    unlock: 'homeRow'
  },
  {
    id: 2, name: 'Уровень 2', title: 'Левая сторона',
    description: 'Домашний ряд: Ф, Ы, В, А',
    chars: { ru: 'фыва', en: 'asdf' },
    minSpeed: 30, minAccuracy: 95, wordCount: 25, duration: 60,
    unlock: null
  },
  {
    id: 3, name: 'Уровень 3', title: 'Правая сторона',
    description: 'Домашний ряд: П, Р, О, Л, Д',
    chars: { ru: 'фываПРОЛД'.toLowerCase(), en: 'asdfghjkl' },
    minSpeed: 40, minAccuracy: 95, wordCount: 30, duration: 60,
    unlock: null
  },
  {
    id: 4, name: 'Уровень 4', title: 'Полный домашний ряд',
    description: 'Весь домашний ряд плюс пробел',
    chars: { ru: 'фываолдж прл', en: 'asdfghjkl ;' },
    minSpeed: 50, minAccuracy: 95, wordCount: 30, duration: 60,
    unlock: null
  },
  {
    id: 5, name: 'Уровень 5', title: 'Домашний ряд — слова',
    description: 'Простые слова из домашнего ряда',
    chars: { ru: 'фываолджэ', en: 'asdfghjkl' },
    wordMode: true,
    minSpeed: 60, minAccuracy: 95, wordCount: 30, duration: 60,
    unlock: null
  },
  // Tier 2: Upper row
  {
    id: 6, name: 'Уровень 6', title: 'Верхний ряд — левая',
    description: 'Й, Ц, У, К, Е',
    chars: { ru: 'йцукефывао', en: 'qwertasdf' },
    wordMode: true,
    minSpeed: 60, minAccuracy: 94, wordCount: 35, duration: 90,
    unlock: null
  },
  {
    id: 7, name: 'Уровень 7', title: 'Верхний ряд — правая',
    description: 'Н, Г, Ш, Щ, З',
    chars: { ru: 'нгшщзолджэ', en: 'yuiophjkl' },
    wordMode: true,
    minSpeed: 65, minAccuracy: 94, wordCount: 35, duration: 90,
    unlock: null
  },
  {
    id: 8, name: 'Уровень 8', title: 'Весь верхний ряд',
    description: 'Все буквы верхнего и домашнего рядов',
    chars: { ru: 'йцукенгшщзхфываолдж', en: 'qwertyuiopasdfghjkl' },
    wordMode: true,
    minSpeed: 70, minAccuracy: 94, wordCount: 40, duration: 90,
    unlock: null
  },
  // Tier 3: Lower row
  {
    id: 9, name: 'Уровень 9', title: 'Нижний ряд',
    description: 'Я, Ч, С, М, И, Т, Ь, Б, Ю',
    chars: { ru: 'ячсмитьбю', en: 'zxcvbnm' },
    wordMode: true,
    minSpeed: 70, minAccuracy: 93, wordCount: 40, duration: 90,
    unlock: null
  },
  {
    id: 10, name: 'Уровень 10', title: 'Все буквы',
    description: 'Полный алфавит — все три ряда',
    chars: { ru: null, en: null }, // all chars
    wordMode: true,
    minSpeed: 80, minAccuracy: 93, wordCount: 40, duration: 120,
    unlock: null
  },
  // Tier 4: Common words
  {
    id: 11, name: 'Уровень 11', title: 'Слова — начало',
    description: 'Короткие частотные слова',
    wordMode: true, useCommon: true, wordLength: [2, 4],
    minSpeed: 80, minAccuracy: 93, wordCount: 50, duration: 120,
    unlock: null
  },
  {
    id: 12, name: 'Уровень 12', title: 'Слова — средние',
    description: 'Слова 4-6 символов',
    wordMode: true, useCommon: true, wordLength: [4, 6],
    minSpeed: 85, minAccuracy: 93, wordCount: 50, duration: 120,
    unlock: null
  },
  {
    id: 13, name: 'Уровень 13', title: 'Слова — длинные',
    description: 'Слова 6+ символов',
    wordMode: true, useCommon: true, wordLength: [6, 20],
    minSpeed: 90, minAccuracy: 92, wordCount: 50, duration: 120,
    unlock: null
  },
  // Tier 5: Numbers and symbols
  {
    id: 14, name: 'Уровень 14', title: 'Цифры',
    description: 'Числовой ряд 0-9',
    chars: { ru: '1234567890', en: '1234567890' },
    wordMode: true,
    minSpeed: 80, minAccuracy: 92, wordCount: 40, duration: 120,
    unlock: null
  },
  {
    id: 15, name: 'Уровень 15', title: 'Знаки препинания',
    description: 'Пунктуация: . , ! ? ; :',
    chars: { ru: '.,!?;:', en: '.,!?;:' },
    wordMode: true, useCommon: true,
    minSpeed: 80, minAccuracy: 92, wordCount: 40, duration: 120,
    unlock: null
  },
  // Tier 6: Full text
  {
    id: 16, name: 'Уровень 16', title: 'Текст',
    description: 'Полные предложения с пунктуацией',
    wordMode: true, useCommon: true, fullText: true,
    minSpeed: 90, minAccuracy: 92, wordCount: 60, duration: 120,
    unlock: null
  },
  {
    id: 17, name: 'Уровень 17', title: 'Скоростной рывок',
    description: 'Максимальная скорость!',
    wordMode: true, useCommon: true,
    minSpeed: 120, minAccuracy: 95, wordCount: 80, duration: 120,
    unlock: 'speed'
  },
  // Tier 7: Code
  {
    id: 18, name: 'Уровень 18', title: 'Код',
    description: 'Программный код и символы',
    wordMode: true, useCode: true,
    minSpeed: 80, minAccuracy: 92, wordCount: 40, duration: 120,
    unlock: 'code'
  }
];

function getLevelById(id) {
  return LEVELS.find(l => l.id === id) || LEVELS[0];
}

function getMaxLevel() {
  return LEVELS.length;
}


// ===== js/storage.js =====
// localStorage persistence layer
const BASE_KEY = 'typemaster_';
let _userPrefix = '';

/** Call once after login/register to namespace all storage under the user's account */
function setUserStorage(username) {
  _userPrefix = username ? username + '_' : '';
}

const getKey = k => BASE_KEY + _userPrefix + k;

const storage = {
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

function loadProfile() {
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

function saveProfile(patch) {
  const updated = storage.update('profile', cur => ({ ...cur, ...patch }));
  _fbSync('profile', updated);
  _fbSyncUserStats(updated);
}

function loadStats() {
  return storage.get('stats', {
    sessions: [],         // [{date, speed, accuracy, chars, errors, mode}]
    heatmap: {},          // {key: {hits, errors}}
    dailyStreak: 0,
    lastSessionDate: null
  });
}

function saveSession(session) {
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

function loadAchievements() {
  return storage.get('achievements', {});
}

function unlockAchievement(id) {
  storage.update('achievements', cur => ({ ...cur, [id]: { date: Date.now() } }), {});
}

function loadSettings() {
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

function saveSettings(patch) {
  const updated = storage.update('settings', cur => ({ ...cur, ...patch }), {});
  _fbSync('settings', updated);
}

// ─── Firestore sync helpers ───────────────────────────────────────────────

/**
 * Fire-and-forget: write a game data document to Firestore.
 * Safe to call from synchronous code — errors are silently ignored.
 */
function _fbSync(key, data) {
  if (typeof _fbDb === 'undefined' || typeof getCurrentUser !== 'function') return;
  const uid = getCurrentUser();
  if (!uid) return;
  _fbDb.collection('users').doc(uid).collection('gameData').doc(key)
    .set(data)
    .catch(function() {});
}

/**
 * Fire-and-forget: update stats summary on the user's main Firestore document.
 * This allows leaderboard queries without per-user subcollection reads.
 */
function _fbSyncUserStats(profile) {
  if (typeof _fbDb === 'undefined' || typeof getCurrentUser !== 'function') return;
  const uid = getCurrentUser();
  if (!uid) return;
  _fbDb.collection('users').doc(uid).update({
    level:         profile.level         || 1,
    bestSpeed:     profile.bestSpeed     || 0,
    totalSessions: profile.totalSessions || 0,
    totalChars:    profile.totalChars    || 0,
    ratingPoints:  profile.ratingPoints  || 1000,
  }).catch(function() {});
}

/**
 * Load profile and settings from Firestore into localStorage for the given uid.
 * Call this in startApp() before loadProfile() / loadSettings().
 * @param {string} uid  Firebase UID
 */
async function loadDataFromFirestore(uid) {
  if (typeof _fbDb === 'undefined' || !uid) return;
  try {
    const [profileSnap, settingsSnap] = await Promise.all([
      _fbDb.collection('users').doc(uid).collection('gameData').doc('profile').get(),
      _fbDb.collection('users').doc(uid).collection('gameData').doc('settings').get(),
    ]);
    if (profileSnap.exists)  storage.set('profile',  profileSnap.data());
    if (settingsSnap.exists) storage.set('settings', settingsSnap.data());
  } catch { /* offline — use localStorage data */ }
}


// ===== js/quests.js =====
// ─── Daily Quests ─────────────────────────────────────────────────────
const QUEST_TEMPLATES = [
  { id: 'q_speed_50',   type: 'speed',    target: 50,   label: 'Достигни 50+ зн/мин',           reward: 5,  icon: '⚡' },
  { id: 'q_speed_70',   type: 'speed',    target: 70,   label: 'Достигни 70+ зн/мин',           reward: 8,  icon: '⚡' },
  { id: 'q_speed_90',   type: 'speed',    target: 90,   label: 'Достигни 90+ зн/мин',           reward: 12, icon: '🚀' },
  { id: 'q_speed_110',  type: 'speed',    target: 110,  label: 'Достигни 110+ зн/мин',          reward: 18, icon: '🚀' },
  { id: 'q_acc_95',     type: 'accuracy', target: 95,   label: 'Точность 95%+ в одной игре',    reward: 6,  icon: '🎯' },
  { id: 'q_acc_99',     type: 'accuracy', target: 99,   label: 'Точность 99%+ в одной игре',    reward: 12, icon: '🎯' },
  { id: 'q_chars_300',  type: 'chars',    target: 300,  label: 'Напечатай 300 символов',         reward: 4,  icon: '📝' },
  { id: 'q_chars_700',  type: 'chars',    target: 700,  label: 'Напечатай 700 символов',         reward: 8,  icon: '📝' },
  { id: 'q_chars_1500', type: 'chars',    target: 1500, label: 'Напечатай 1500 символов',        reward: 15, icon: '📝' },
  { id: 'q_sessions_3', type: 'sessions', target: 3,    label: 'Сыграй 3 игры',                  reward: 5,  icon: '🎮' },
  { id: 'q_sessions_5', type: 'sessions', target: 5,    label: 'Сыграй 5 игр',                   reward: 10, icon: '🎮' },
  { id: 'q_rated',      type: 'rated',    target: 1,    label: 'Сыграй рейтинговую игру',         reward: 10, icon: '⭐' },
  { id: 'q_no_errors',  type: 'no_errors',target: 1,    label: 'Игра без единой ошибки',          reward: 15, icon: '✨' },
  { id: 'q_falling',    type: 'mode',     mode: 'falling', target: 1, label: 'Сыграй в Падающие слова', reward: 5, icon: '🎮' },
  { id: 'q_zombie',     type: 'mode',     mode: 'zombie',  target: 1, label: 'Сыграй в Зомби-атаку',   reward: 5, icon: '🧟' },
  { id: 'q_osu',        type: 'mode',     mode: 'osu',     target: 1, label: 'Сыграй в Сферы',         reward: 5, icon: '🔮' },
  { id: 'q_code',       type: 'mode',     mode: 'code',    target: 1, label: 'Сыграй в Режим кода',    reward: 8, icon: '💻' },
  { id: 'q_streak',     type: 'streak',   target: 2,    label: 'Серия 2+ дня подряд',             reward: 8,  icon: '🔥' },
];

function _todayStr() { return new Date().toDateString(); }

function _seededPick(seed, arr, count) {
  const s = arr.map((v, i) => ({ v, k: ((seed * 1664525 + i * 22695477 + 1013904223) >>> 0) % 10000 }));
  s.sort((a, b) => a.k - b.k);
  return s.slice(0, count).map(x => x.v);
}

function getDailyQuests() {
  const today = _todayStr();
  const saved = storage.get('daily_quests', null);
  if (saved && saved.date === today) return saved.quests;

  const seed = today.split('').reduce((a, c, i) => a + c.charCodeAt(0) * (i + 1), 0);
  const picked = _seededPick(seed, QUEST_TEMPLATES, 3);
  const quests = picked.map(t => ({ ...t, progress: 0, completed: false }));
  storage.set('daily_quests', { date: today, quests });
  return quests;
}

function updateQuestProgress(result) {
  const today = _todayStr();
  const saved = storage.get('daily_quests', null);
  if (!saved || saved.date !== today) return { quests: getDailyQuests(), newlyCompleted: [] };

  const prev = saved.quests;
  const quests = prev.map(q => {
    if (q.completed) return q;
    let p = q.progress;
    switch (q.type) {
      case 'speed':     if ((result.speed     || 0) >= q.target) p = q.target; break;
      case 'accuracy':  if ((result.accuracy  || 0) >= q.target) p = q.target; break;
      case 'chars':     p = Math.min(q.target, p + (result.chars    || 0)); break;
      case 'sessions':  p = Math.min(q.target, p + 1); break;
      case 'rated':     if (result._isRated)  p = q.target; break;
      case 'no_errors': if ((result.errors || 0) === 0 && (result.chars || 0) >= 20) p = q.target; break;
      case 'mode':      if (result.mode === q.mode || result._modeName === q.mode) p = Math.min(q.target, p + 1); break;
      case 'streak':    if ((result._streak || 0) >= q.target) p = q.target; break;
    }
    return { ...q, progress: p, completed: p >= q.target };
  });

  const newlyCompleted = quests.filter((q, i) => q.completed && !prev[i].completed);
  storage.set('daily_quests', { date: today, quests });
  return { quests, newlyCompleted };
}

function renderQuestsPanel(container) {
  const quests = getDailyQuests();
  const allDone = quests.every(q => q.completed);
  const doneCount = quests.filter(q => q.completed).length;

  container.innerHTML = `
    <div class="quests-panel">
      <div class="quests-header">
        <span class="quests-title">📋 Ежедневные задания</span>
        <span class="quests-counter">${doneCount}/${quests.length} <span class="quests-reset">· обновятся в полночь</span></span>
      </div>
      <div class="quests-list">
        ${quests.map(q => {
          const pct = q.target > 0 ? Math.min(100, Math.round((q.progress / q.target) * 100)) : 0;
          return `<div class="quest-item${q.completed ? ' quest-done' : ''}">
            <span class="quest-icon">${q.icon || '🎯'}</span>
            <div class="quest-body">
              <div class="quest-label">${q.label}</div>
              <div class="quest-progress-wrap">
                <div class="quest-bar"><div class="quest-bar-fill" style="width:${pct}%"></div></div>
                <span class="quest-prog-txt">${q.progress}/${q.target}</span>
              </div>
            </div>
            <div class="quest-reward">${q.completed
              ? '<span class="quest-done-mark">✅</span>'
              : `<span class="quest-rew-val">+${q.reward}⭐</span>`
            }</div>
          </div>`;
        }).join('')}
      </div>
      ${allDone ? `<div class="quests-all-done">🎉 Все задания выполнены! Заходи завтра за новыми.</div>` : ''}
    </div>`;
}


// ===== js/auth.js =====
﻿// ─── Auth Module (Firebase Auth + Firestore) ──────────────────────────────
// Requires: _fbAuth, _fbDb globals from firebase-init.js (CDN compat SDK)

// ─── Internal state ───────────────────────────────────────────────────────
let _fbUser  = null;   // firebase.User object
let _userDoc = null;   // Firestore /users/{uid} document data

let _authReady = false;
let _authReadyResolve;
const _authReadyPromise = new Promise(r => { _authReadyResolve = r; });

/**
 * Convert a display name to a deterministic valid email for Firebase Auth.
 * The user never sees this email — it is purely internal.
 */
function _nameToEmail(name) {
  const s = (name || '').toLowerCase();
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  const prefix = s.replace(/[^a-z0-9]/g, '').slice(0, 8) || 'u';
  return prefix + h.toString(16).padStart(8, '0') + '@typemaster.app';
}

// ─── Auth state listener ──────────────────────────────────────────────────
_fbAuth.onAuthStateChanged(async fbUser => {
  _fbUser = fbUser;
  if (fbUser) {
    try {
      const snap = await _fbDb.collection('users').doc(fbUser.uid).get();
      _userDoc = snap.exists ? snap.data() : null;
    } catch { _userDoc = null; }
    setUserStorage(fbUser.uid);
  } else {
    _userDoc = null;
  }
  if (!_authReady) {
    _authReady = true;
    _authReadyResolve();
  }
});

// ─── Public API ───────────────────────────────────────────────────────────

/** Resolves once Firebase has determined the initial auth state (persisted session) */
function waitForAuth() { return _authReadyPromise; }

/** Returns true if a user is currently signed in */
function isLoggedIn() { return !!_fbUser; }

/** Returns the Firebase UID of the current user, or null */
function getCurrentUser() { return _fbUser ? _fbUser.uid : null; }

/** Returns the current user's display name */
function getCurrentUserDisplayName() {
  return (_userDoc && _userDoc.displayName) || 'Игрок';
}

/** Returns a copy of the current user's data object, or null */
function getCurrentUserData() {
  if (!_fbUser || !_userDoc) return null;
  return Object.assign({}, _userDoc, { uid: _fbUser.uid });
}

/** Returns true if the current user has admin privileges */
function isAdmin() { return !!(_userDoc && _userDoc.admin); }

/** Always returns true — VIP gating removed */
function isVip() { return true; }

// ─── Register ─────────────────────────────────────────────────────────────

/**
 * Register a new user.
 * @param {string} displayName  Shown in the app (2–24 chars)
 * @param {string} password     Minimum 6 characters (Firebase requirement)
 * @returns {Promise<{ok:boolean, error?:string, user?:object}>}
 */
async function registerUser(displayName, password) {
  displayName = (displayName || '').trim();
  if (displayName.length < 2)  return { ok: false, error: 'Имя: минимум 2 символа' };
  if (displayName.length > 24) return { ok: false, error: 'Имя: максимум 24 символа' };
  if (!password || password.length < 6) return { ok: false, error: 'Пароль: минимум 6 символов' };

  const email = _nameToEmail(displayName);
  try {
    const cred = await _fbAuth.createUserWithEmailAndPassword(email, password);
    const uid  = cred.user.uid;
    const doc  = {
      displayName,
      username:  displayName.toLowerCase(),
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      admin:     false,
    };
    await _fbDb.collection('users').doc(uid).set(doc);
    _fbUser  = cred.user;
    _userDoc = Object.assign({}, doc, { createdAt: Date.now() });
    setUserStorage(uid);
    return { ok: true, user: Object.assign({}, _userDoc, { uid }) };
  } catch (e) {
    if (e.code === 'auth/email-already-in-use')
      return { ok: false, error: 'Пользователь с таким именем уже существует' };
    if (e.code === 'auth/weak-password')
      return { ok: false, error: 'Пароль слишком простой (минимум 6 символов)' };
    return { ok: false, error: e.message };
  }
}

// ─── Login ────────────────────────────────────────────────────────────────

/**
 * Log in an existing user.
 * @param {string} displayName
 * @param {string} password
 * @returns {Promise<{ok:boolean, error?:string, user?:object}>}
 */
async function loginUser(displayName, password) {
  displayName = (displayName || '').trim();
  if (!displayName || !password) return { ok: false, error: 'Введите имя и пароль' };

  const email = _nameToEmail(displayName);
  try {
    const cred = await _fbAuth.signInWithEmailAndPassword(email, password);
    const uid  = cred.user.uid;
    _fbUser = cred.user;
    try {
      const snap = await _fbDb.collection('users').doc(uid).get();
      _userDoc = snap.exists ? snap.data() : null;
    } catch { _userDoc = null; }
    setUserStorage(uid);
    return { ok: true, user: Object.assign({}, _userDoc || {}, { uid }) };
  } catch (e) {
    const wrongCreds = [
      'auth/user-not-found', 'auth/wrong-password',
      'auth/invalid-credential', 'auth/invalid-login-credentials',
    ];
    if (wrongCreds.includes(e.code)) return { ok: false, error: 'Неверное имя или пароль' };
    return { ok: false, error: e.message };
  }
}

// ─── Logout ───────────────────────────────────────────────────────────────

/** Sign out the current user */
async function logoutUser() {
  await _fbAuth.signOut();
  _fbUser  = null;
  _userDoc = null;
}

// ─── User meta ────────────────────────────────────────────────────────────

/** Update profile metadata (bio, avatarEmoji, avatarUrl, avatarGradient) */
async function updateUserMeta(meta) {
  if (!_fbUser) return { ok: false, error: 'Не вошёл в систему' };
  const patch = {};
  if (meta.bio             !== undefined) patch.bio             = String(meta.bio).slice(0, 100);
  if (meta.avatarEmoji     !== undefined) patch.avatarEmoji     = meta.avatarEmoji     || null;
  if (meta.avatarUrl       !== undefined) patch.avatarUrl       = (meta.avatarUrl || '').trim().slice(0, 300) || null;
  if (meta.avatarGradient  !== undefined) patch.avatarGradient  = meta.avatarGradient  || null;
  try {
    await _fbDb.collection('users').doc(_fbUser.uid).update(patch);
    _userDoc = Object.assign({}, _userDoc, patch);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

/** Change display name — requires current password for re-authentication */
async function updateDisplayName(newDisplayName, password) {
  newDisplayName = (newDisplayName || '').trim();
  if (newDisplayName.length < 2)  return { ok: false, error: 'Имя: минимум 2 символа' };
  if (newDisplayName.length > 24) return { ok: false, error: 'Имя: максимум 24 символа' };
  if (!_fbUser) return { ok: false, error: 'Не вошёл в систему' };

  const credential = firebase.auth.EmailAuthProvider.credential(_fbUser.email, password);
  try {
    await _fbUser.reauthenticateWithCredential(credential);
  } catch {
    return { ok: false, error: 'Неверный пароль' };
  }
  try {
    await _fbDb.collection('users').doc(_fbUser.uid).update({ displayName: newDisplayName });
    _userDoc = Object.assign({}, _userDoc, { displayName: newDisplayName });
    return { ok: true, displayName: newDisplayName };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

/** Change password — requires current password for re-authentication */
async function updatePassword(currentPassword, newPassword) {
  if (!newPassword || newPassword.length < 6)
    return { ok: false, error: 'Новый пароль: минимум 6 символов' };
  if (!_fbUser) return { ok: false, error: 'Не вошёл в систему' };

  const credential = firebase.auth.EmailAuthProvider.credential(_fbUser.email, currentPassword);
  try {
    await _fbUser.reauthenticateWithCredential(credential);
  } catch {
    return { ok: false, error: 'Неверный текущий пароль' };
  }
  try {
    await _fbUser.updatePassword(newPassword);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// ─── Admin ────────────────────────────────────────────────────────────────

const _ADMIN_CODES = new Set(['ADMIN-MASTER99', 'ADMIN-SUDO2025', 'ADMIN-ROOT-TM1']);

/** Activate admin mode with a secret code */
async function activateAdmin(code) {
  const clean = (code || '').trim().toUpperCase();
  if (!_ADMIN_CODES.has(clean)) return { ok: false, error: 'Неверный код администратора' };
  if (!_fbUser) return { ok: false, error: 'Не вошёл в систему' };
  try {
    await _fbDb.collection('users').doc(_fbUser.uid).update({ admin: true });
    _userDoc = Object.assign({}, _userDoc, { admin: true });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

/**
 * Refresh current user's status from Firestore.
 * @returns {Promise<{banned:boolean, admin:boolean}|null>}
 */
async function refreshUserStatus() {
  if (!_fbUser) return null;
  try {
    const snap = await _fbDb.collection('users').doc(_fbUser.uid).get();
    if (!snap.exists) return null;
    _userDoc = snap.data();
    return { banned: !!_userDoc.banned, admin: !!_userDoc.admin };
  } catch { return null; }
}

/** Fetch all users (admin only) */
async function getAdminUserList() {
  if (!isAdmin()) return { ok: false, error: 'Нет прав' };
  try {
    const snap = await _fbDb.collection('users').get();
    const users = snap.docs.map(d => {
      const data = d.data();
      const ts = data.createdAt;
      return Object.assign({}, data, {
        uid:       d.id,
        createdAt: ts && ts.toDate ? ts.toDate().getTime() : (ts || null),
      });
    });
    return { ok: true, users };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

/**
 * Ban or unban a user by their Firebase UID (admin only).
 * @param {string} targetUid
 * @param {boolean} ban
 */
async function banUser(targetUid, ban) {
  if (!isAdmin()) return { ok: false, error: 'Нет прав' };
  try {
    await _fbDb.collection('users').doc(targetUid).update({ banned: ban });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}


// ===== js/audio.js =====
// Web Audio API synthesized sound engine — no external files needed
let ctx = null;
let musicNode = null;
let musicGain = null;
let sfxGain = null;
let _audioSettings = { sound: true, musicVolume: 0.2, sfxVolume: 0.5 };

function getCtx() {
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      return null;
    }
  }
  return ctx;
}

function updateAudioSettings(s) {
  _audioSettings = { ..._audioSettings, ...s };
  if (musicGain) musicGain.gain.value = s.musicVolume ?? _audioSettings.musicVolume;
  if (sfxGain) sfxGain.gain.value = s.sfxVolume ?? _audioSettings.sfxVolume;
}

// General tone helper with smooth attack + decay envelope
function playTone(freq, type, duration, gain = 0.3, delay = 0, attack = 0.005) {
  if (!_audioSettings.sound) return;
  const ac = getCtx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.connect(g);
  g.connect(sfxGain || ac.destination);
  osc.type = type;
  osc.frequency.value = freq;
  const t = ac.currentTime + delay;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(gain, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.start(t);
  osc.stop(t + duration + 0.02);
}

// Soft pluck: two detuned sines fading out — warm, clean sound
function playPluck(freq, gain = 0.25, delay = 0, duration = 0.18) {
  if (!_audioSettings.sound) return;
  const ac = getCtx();
  if (!ac) return;
  const dest = sfxGain || ac.destination;

  [0, 0.5].forEach(detune => {
    const osc = ac.createOscillator();
    const g   = ac.createGain();
    osc.connect(g);
    g.connect(dest);
    osc.type = 'sine';
    osc.frequency.value = freq + detune;
    const t = ac.currentTime + delay;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.start(t);
    osc.stop(t + duration + 0.02);
  });
}

function initAudio() {
  // Lazy init
}

// ─── Keypress click — soft, quiet "tick" like a low-profile keyboard
function playKeyClick() {
  if (!_audioSettings.sound) return;
  const ac = getCtx();
  if (!ac) return;
  const dest = sfxGain || ac.destination;
  // Short noise burst shaped like a soft click
  const bufLen = Math.floor(ac.sampleRate * 0.025);
  const buf = ac.createBuffer(1, bufLen, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufLen);
  const source = ac.createBufferSource();
  source.buffer = buf;
  const filter = ac.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 2800;
  filter.Q.value = 0.8;
  const g = ac.createGain();
  g.gain.value = 0.08;
  source.connect(filter);
  filter.connect(g);
  g.connect(dest);
  source.start(ac.currentTime);

  // Subtle low "thud"
  playPluck(180, 0.06, 0, 0.06);
}

// ─── Error sound — soft low thud + gentle descending tone, not harsh
function playError() {
  if (!_audioSettings.sound) return;
  playPluck(220, 0.18, 0, 0.25);
  playPluck(160, 0.14, 0.04, 0.22);
  // subtle descend
  const ac = getCtx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const g   = ac.createGain();
  osc.connect(g);
  g.connect(sfxGain || ac.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(260, ac.currentTime);
  osc.frequency.exponentialRampToValueAtTime(130, ac.currentTime + 0.22);
  g.gain.setValueAtTime(0.0001, ac.currentTime);
  g.gain.linearRampToValueAtTime(0.12, ac.currentTime + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.22);
  osc.start(ac.currentTime);
  osc.stop(ac.currentTime + 0.25);
}

// ─── Success — warm major chord arpeggio (C E G C)
function playSuccess() {
  if (!_audioSettings.sound) return;
  const notes   = [523, 659, 784, 1047]; // C5 E5 G5 C6
  const delays  = [0, 0.09, 0.18, 0.30];
  notes.forEach((freq, i) => playPluck(freq, 0.32, delays[i], 0.5));
}

// ─── Achievement — ascending pentatonic sparkle
function playAchievement() {
  if (!_audioSettings.sound) return;
  const notes  = [523, 659, 784, 880, 1047, 1319]; // C E G A C E
  const delays = [0, 0.07, 0.14, 0.21, 0.30, 0.40];
  notes.forEach((freq, i) => playPluck(freq, 0.30, delays[i], 0.55));
}

// ─── Countdown beep — soft sine ping
function playBeep(high = false) {
  if (!_audioSettings.sound) return;
  playPluck(high ? 1047 : 523, 0.28, 0, 0.18);
}

// ─── Background music — gentle ambient pad with slow arpeggio
let musicInterval = null;
let musicBPM = 80;
let musicStep = 0;
// Pentatonic scale — always sounds harmonic
const musicScale = [261, 294, 330, 392, 440, 523, 587, 659];

function playMusicNote(ac) {
  if (!musicGain) return;
  const freq = musicScale[musicStep % musicScale.length] * (musicStep % 16 < 8 ? 1 : 2);

  const osc1 = ac.createOscillator();
  const osc2 = ac.createOscillator();
  const g    = ac.createGain();

  osc1.connect(g);
  osc2.connect(g);
  g.connect(musicGain);

  osc1.type = 'sine';
  osc2.type = 'triangle';
  osc1.frequency.value = freq;
  osc2.frequency.value = freq * 1.003; // slight detune for warmth

  const t = ac.currentTime;
  const noteLen = 0.55;

  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.12, t + 0.03);
  g.gain.exponentialRampToValueAtTime(0.0001, t + noteLen);

  osc1.start(t); osc1.stop(t + noteLen + 0.05);
  osc2.start(t); osc2.stop(t + noteLen + 0.05);

  musicStep++;
}

function startMusic(bpm = 80) {
  if (!_audioSettings.sound) return;
  stopMusic();
  musicBPM = bpm;
  const ac = getCtx();
  if (!ac) return;
  musicInterval = setInterval(() => {
    const c = getCtx();
    if (c) playMusicNote(c);
  }, 60000 / musicBPM);
}

function updateMusicBPM(bpm) {
  if (musicBPM === bpm) return;
  musicBPM = bpm;
  if (musicInterval) { clearInterval(musicInterval); startMusic(bpm); }
}

function stopMusic() {
  if (musicInterval) { clearInterval(musicInterval); musicInterval = null; }
}

function resumeAudioContext() {
  try {
    const ac = getCtx();
    if (!ac) return;
    if (!sfxGain) {
      sfxGain = ac.createGain();
      sfxGain.gain.value = _audioSettings.sfxVolume;
      sfxGain.connect(ac.destination);
    }
    if (!musicGain) {
      musicGain = ac.createGain();
      musicGain.gain.value = _audioSettings.musicVolume;
      musicGain.connect(ac.destination);
    }
    if (ac.state === 'suspended') ac.resume();
  } catch (e) {}
}


// ===== js/keyboard.js =====

let _container = null;
let _lang = 'ru';
let _blindMode = false;
let _colorZones = true;
let _keyElements = {};       // key → DOM element
let _nextKey = null;         // key expected by game
let _activeHints = new Set();

const SPECIAL_KEYS = {
  ' ': { label: 'Space', width: 'w-space' },
  'Backspace': { label: '⌫', width: 'w-bs' },
  'Tab': { label: 'Tab', width: 'w-tab' },
  'CapsLock': { label: 'Caps', width: 'w-caps' },
  'Shift': { label: 'Shift', width: 'w-shift' },
  'Enter': { label: 'Enter', width: 'w-enter' }
};

function initKeyboard(container, lang = 'ru', settings = {}) {
  _container = container;
  _lang = lang;
  _blindMode = settings.blindMode || false;
  _colorZones = settings.colorZones !== false;
  renderKeyboard();
}

function setKbLang(lang) {
  _lang = lang;
  renderKeyboard();
}

function setBlindMode(v) {
  _blindMode = v;
  if (!_container) return;
  _container.querySelectorAll('.key-label').forEach(el => {
    el.style.opacity = v ? '0' : '1';
  });
}

function setColorZones(v) {
  _colorZones = v;
  renderKeyboard();
}

function highlightKey(key, type) {
  if (!_container) return;
  // type: 'next' | 'correct' | 'error' | 'pressed'
  const el = getKeyEl(key);
  if (!el) return;
  el.classList.remove('key-next', 'key-correct', 'key-error', 'key-pressed');
  el.classList.add('key-' + type);
  if (type === 'correct' || type === 'error' || type === 'pressed') {
    setTimeout(() => {
      el.classList.remove('key-' + type);
      if (_nextKey === key) el.classList.add('key-next');
    }, type === 'error' ? 500 : 200);
  }
}

function setNextKey(key) {
  if (!_container) return;
  // Remove previous next highlight
  if (_nextKey) {
    const prev = getKeyEl(_nextKey);
    if (prev) prev.classList.remove('key-next');
  }
  _nextKey = key ? key.toLowerCase() : null;
  if (_nextKey) {
    const el = getKeyEl(_nextKey);
    if (el) el.classList.add('key-next');
  }
}

function clearHighlights() {
  if (!_container) return;
  _container.querySelectorAll('.key').forEach(el => {
    el.classList.remove('key-next', 'key-correct', 'key-error', 'key-pressed');
  });
  _nextKey = null;
}

function getKeyEl(key) {
  if (!key) return null;
  const k = key === ' ' ? 'space' : key.toLowerCase();
  return _keyElements[k];
}

function renderKeyboard() {
  if (!_container) return;
  _keyElements = {};
  _container.innerHTML = '';
  _container.className = 'keyboard ' + _lang;

  const layout = KEYBOARD_LAYOUTS[_lang];
  const zones = FINGER_ZONES[_lang];

  layout.rows.forEach((row, ri) => {
    const rowEl = document.createElement('div');
    rowEl.className = 'key-row row-' + ri;

    // Prefix special keys
    if (ri === 0) addSpecialKey(rowEl, 'Esc', 0, false);
    if (ri === 1) addSpecialKey(rowEl, 'Tab', 0, false);
    if (ri === 2) addSpecialKey(rowEl, 'Caps', 0, false);
    if (ri === 3) addSpecialKey(rowEl, 'Shift', 0, false);

    row.forEach((key, ki) => {
      const el = document.createElement('div');
      const keyLower = key.toLowerCase();
      const isSpace = key === ' ';
      el.className = 'key' + (isSpace ? ' key-space' : '');

      // Finger zone color
      const finger = zones[keyLower] ?? 8;
      if (_colorZones) {
        el.style.setProperty('--zone-color', FINGER_COLORS[finger]);
        el.setAttribute('data-finger', finger);
      }

      // Label
      const labelEl = document.createElement('span');
      labelEl.className = 'key-label';
      labelEl.textContent = isSpace ? '' : key.toUpperCase();
      if (_blindMode) labelEl.style.opacity = '0';
      el.appendChild(labelEl);

      // Store reference
      const refKey = isSpace ? 'space' : keyLower;
      _keyElements[refKey] = el;
      el.setAttribute('data-key', refKey);

      rowEl.appendChild(el);
    });

    // Suffix special keys
    if (ri === 0) addSpecialKey(rowEl, 'BS', 7, true);
    if (ri === 1) addSpecialKey(rowEl, 'Enter', 7, true);
    if (ri === 3) addSpecialKey(rowEl, 'Shift', 7, true);

    _container.appendChild(rowEl);
  });

  // Space row
  const spaceRow = document.createElement('div');
  spaceRow.className = 'key-row row-space';
  ['Ctrl', 'Alt', 'space', 'Alt', 'Ctrl'].forEach(k => {
    const el = document.createElement('div');
    el.className = k === 'space' ? 'key key-spacebar' : 'key key-mod';
    const label = document.createElement('span');
    label.className = 'key-label';
    label.textContent = k === 'space' ? '' : k;
    el.appendChild(label);
    if (k === 'space') {
      el.style.setProperty('--zone-color', FINGER_COLORS[8]);
      _keyElements['space'] = el;
      el.setAttribute('data-key', 'space');
    }
    spaceRow.appendChild(el);
  });
  _container.appendChild(spaceRow);
}

function addSpecialKey(row, label, pos, after) {
  const el = document.createElement('div');
  el.className = 'key key-special key-' + label.toLowerCase().replace(/\s/g, '');
  const labelEl = document.createElement('span');
  labelEl.className = 'key-label';
  labelEl.textContent = label;
  el.appendChild(labelEl);
  if (after) {
    row.appendChild(el);
  } else {
    row.insertBefore(el, row.firstChild);
  }
}

// React to physical keyboard events
function onPhysicalKey(keyEvent, expectedChar) {
  const key = keyEvent.key;
  const keyLower = key === ' ' ? 'space' : key.toLowerCase();
  const expected = expectedChar ? (expectedChar === ' ' ? 'space' : expectedChar.toLowerCase()) : null;

  highlightKey(keyLower === 'space' ? ' ' : keyLower, 'pressed');

  if (expected !== null) {
    if (keyLower === expected || (keyLower === 'space' && expected === 'space')) {
      highlightKey(key === ' ' ? ' ' : key, 'correct');
      return true;
    } else {
      highlightKey(key === ' ' ? ' ' : key, 'error');
      if (expected) highlightKey(expected === 'space' ? ' ' : expected, 'error');
      return false;
    }
  }
  return null;
}


// ===== js/achievements.js =====


const ACHIEVEMENTS = [
  {
    id: 'first_session',
    name: 'Первый шаг',
    desc: 'Завершить первую сессию',
    icon: '🎯'
  },
  {
    id: 'streak_3',
    name: 'Постоянство',
    desc: '3 дня подряд',
    icon: '🔥'
  },
  {
    id: 'streak_7',
    name: 'Неделя',
    desc: '7 дней подряд',
    icon: '📅'
  },
  {
    id: 'speed_100',
    name: 'Быстрые руки',
    desc: 'Скорость 100 зн/мин',
    icon: '⚡'
  },
  {
    id: 'speed_200',
    name: 'Гонщик',
    desc: 'Скорость 200 зн/мин',
    icon: '🏎️'
  },
  {
    id: 'speed_300',
    name: 'Скороход',
    desc: 'Скорость 300 зн/мин',
    icon: '🚀'
  },
  {
    id: 'accuracy_100',
    name: 'Снайпер',
    desc: '100% точность за сессию (≥50 символов)',
    icon: '🎯'
  },
  {
    id: 'chars_1000',
    name: 'Тысячник',
    desc: '1 000 символов всего',
    icon: '📝'
  },
  {
    id: 'chars_10000',
    name: 'Железные пальцы',
    desc: '10 000 нажатий без ошибок подряд',
    icon: '🤖'
  },
  {
    id: 'chars_100000',
    name: 'Легенда',
    desc: '100 000 символов всего',
    icon: '🏆'
  },
  {
    id: 'level_5',
    name: 'Ученик',
    desc: 'Пройти уровень 5',
    icon: '📚'
  },
  {
    id: 'level_10',
    name: 'Опытный',
    desc: 'Пройти уровень 10',
    icon: '🎓'
  },
  {
    id: 'level_18',
    name: 'Мастер',
    desc: 'Пройти все уровни',
    icon: '👑'
  },
  {
    id: 'zombie_50',
    name: 'Истребитель',
    desc: 'Убить 50 слов-зомби за сессию',
    icon: '🧟'
  },
  {
    id: 'no_errors',
    name: 'Чистый забег',
    desc: 'Сессия без единой ошибки (≥30 слов)',
    icon: '✨'
  },
  {
    id: 'programmer',
    name: 'Программист',
    desc: 'Пройти режим Code без ошибок',
    icon: '💻'
  }
];

let _unlocked = {};

function initAchievements() {
  _unlocked = loadAchievements();
}

function isUnlocked(id) {
  return !!_unlocked[id];
}

function getUnlockedList() {
  return ACHIEVEMENTS.filter(a => _unlocked[a.id]).map(a => ({
    ...a,
    unlockedAt: _unlocked[a.id]?.date
  }));
}

function checkAchievements(stats, profile, sessionData) {
  const newUnlocks = [];

  const check = (id, cond) => {
    if (!isUnlocked(id) && cond) {
      unlockAchievement(id);
      _unlocked[id] = { date: Date.now() };
      newUnlocks.push(ACHIEVEMENTS.find(a => a.id === id));
    }
  };

  const sessions = stats.sessions || [];
  const totalChars = sessions.reduce((s, x) => s + (x.chars || 0), 0);

  check('first_session', sessions.length >= 1);
  check('streak_3', (stats.dailyStreak || 0) >= 3);
  check('streak_7', (stats.dailyStreak || 0) >= 7);
  check('speed_100', (sessionData?.speed || 0) >= 100);
  check('speed_200', (sessionData?.speed || 0) >= 200);
  check('speed_300', (sessionData?.speed || 0) >= 300);
  check('accuracy_100', (sessionData?.accuracy === 100) && (sessionData?.chars >= 50));
  check('chars_1000', totalChars >= 1000);
  check('chars_100000', totalChars >= 100000);
  check('level_5', (profile?.level || 0) >= 5);
  check('level_10', (profile?.level || 0) >= 10);
  check('level_18', (profile?.level || 0) >= 18);
  check('zombie_50', (sessionData?.mode === 'zombie') && (sessionData?.killed >= 50));
  check('no_errors', (sessionData?.errors === 0) && (sessionData?.wordCount >= 30));
  check('programmer', (sessionData?.mode === 'code') && (sessionData?.errors === 0));

  if (newUnlocks.length > 0) {
    playAchievement();
    showAchievementToasts(newUnlocks);
  }
  return newUnlocks;
}

function showAchievementToasts(list) {
  list.forEach((ach, i) => {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'achievement-toast';
      el.innerHTML = `
        <span class="ach-icon">${ach.icon}</span>
        <div>
          <strong>Достижение разблокировано!</strong>
          <div>${ach.name} — ${ach.desc}</div>
        </div>`;
      document.body.appendChild(el);
      requestAnimationFrame(() => el.classList.add('visible'));
      setTimeout(() => {
        el.classList.remove('visible');
        setTimeout(() => el.remove(), 400);
      }, 3500);
    }, i * 600);
  });
}


// ===== js/stats.js =====


// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtNum(n) {
  if (n === undefined || n === null) return '0';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace('.0', '') + 'М';
  if (n >= 1_000)     return (n / 1_000).toFixed(1).replace('.0', '') + 'К';
  return String(n);
}

function fmtDuration(ms) {
  if (!ms || ms < 1000) return '0с';
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}ч ${m % 60}м`;
  if (m > 0) return `${m}м ${s % 60}с`;
  return `${s}с`;
}

function plural(n, [one, few, many]) {
  const abs = Math.abs(n) % 100;
  const mod = abs % 10;
  if (abs >= 11 && abs <= 19) return many;
  if (mod === 1) return one;
  if (mod >= 2 && mod <= 4) return few;
  return many;
}

function setupCanvas(id, w, h) {
  const canvas = document.getElementById(id);
  if (!canvas) return null;
  const dpr = window.devicePixelRatio || 1;
  canvas.width  = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width  = w + 'px';
  canvas.style.height = h + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return { ctx, W: w, H: h };
}

// ── Main export ───────────────────────────────────────────────────────────────
function renderStatsPage(container, lang = 'ru', isVip = true, profile = {}) {
  // ── Data ──────────────────────────────────────────────────────
  const stats    = loadStats();
  const sessions = stats.sessions || [];
  const heatmap  = stats.heatmap  || {};
  const streak   = stats.dailyStreak || 0;

  // Cumulative totals — prefer profile fields (never trimmed) over session sum
  const cumChars    = profile.totalChars    ?? sessions.reduce((a, s) => a + (s.chars   || 0), 0);
  const cumErrors   = profile.totalErrors   ?? sessions.reduce((a, s) => a + (s.errors  || 0), 0);
  const cumSessions = profile.totalSessions ?? sessions.length;
  const cumTimeMs   = profile.totalTimeMs   ?? sessions.reduce((a, s) => a + (s.duration || 0), 0);

  const recent   = sessions.slice(-50);
  const bestSpeed = sessions.length ? Math.max(...sessions.map(s => s.speed    || 0)) : 0;
  const bestAcc   = sessions.length ? Math.max(...sessions.map(s => s.accuracy || 0)) : 0;
  const avgSpeed  = sessions.length ? Math.round(sessions.reduce((a, s) => a + (s.speed    || 0), 0) / sessions.length) : 0;
  const avgAcc    = sessions.length ? Math.round(sessions.reduce((a, s) => a + (s.accuracy || 0), 0) / sessions.length) : 0;

  // Overall accuracy from cumulative counters
  const overallAcc = (cumChars + cumErrors) > 0
    ? Math.round(cumChars / (cumChars + cumErrors) * 100) : 0;

  // Trend: compare last 10 vs previous 10 sessions
  let trend = 0;
  if (sessions.length >= 10) {
    const last10 = sessions.slice(-10).reduce((a,s) => a + (s.speed||0), 0) / 10;
    const prev10 = sessions.slice(-20, -10).reduce((a,s) => a + (s.speed||0), 0) / Math.max(sessions.slice(-20,-10).length, 1);
    trend = Math.round(last10 - prev10);
  }

  // Favorite mode
  const modeCount = {};
  sessions.forEach(s => { modeCount[s.mode] = (modeCount[s.mode] || 0) + 1; });
  const favMode = Object.keys(modeCount).sort((a,b) => modeCount[b] - modeCount[a])[0];
  const modeIcons = { classic:'📝', falling:'🎮', zombie:'🧟', osu:'🔮', code:'💻' };
  const modeNames = { classic:'Классика', falling:'Падение', zombie:'Зомби', osu:'Сферы', code:'Код' };

  // Grade
  const grade = bestSpeed >= 300 ? 'S+' : bestSpeed >= 200 ? 'S' : bestSpeed >= 130 ? 'A' : bestSpeed >= 80 ? 'B' : bestSpeed >= 50 ? 'C' : bestSpeed > 0 ? 'D' : '—';
  const gradeColor = { 'S+':'#ff9f43','S':'#f0c040','A':'#3498db','B':'#2ecc71','C':'#e67e22','D':'#e74c3c','—':'#555' }[grade];

  const trendCls  = trend > 0 ? 'trend-pos' : trend < 0 ? 'trend-neg' : '';
  const trendSign = trend > 0 ? '+' : '';

  container.innerHTML = `
    <div class="stats-page">
      <div class="stats-header-row">
        <div>
          <h2 class="stats-title">📊 Статистика</h2>
          <div class="stats-subtitle">${cumSessions} ${plural(cumSessions,['сессия','сессии','сессий'])} · ${fmtNum(cumChars)} символов</div>
        </div>

      </div>

      <!-- Primary cards -->
      <div class="stats-cards">
        <div class="stat-card stat-card--accent">
          <div class="sc-icon">⚡</div>
          <div class="sc-val">${bestSpeed}</div>
          <div class="sc-unit">зн/мин</div>
          <div class="sc-lbl">Рекорд скорости</div>
        </div>
        <div class="stat-card">
          <div class="sc-icon">📈</div>
          <div class="sc-val">${avgSpeed}</div>
          <div class="sc-unit">зн/мин</div>
          <div class="sc-lbl">Средняя скорость</div>
        </div>
        <div class="stat-card">
          <div class="sc-icon">🎯</div>
          <div class="sc-val">${bestAcc}<span class="sc-pct">%</span></div>
          <div class="sc-unit">точность</div>
          <div class="sc-lbl">Рекорд точности</div>
        </div>
        <div class="stat-card">
          <div class="sc-icon">🎯</div>
          <div class="sc-val">${avgAcc}<span class="sc-pct">%</span></div>
          <div class="sc-unit">точность</div>
          <div class="sc-lbl">Средняя точность</div>
        </div>
        <div class="stat-card stat-card--grade" style="--grade-color:${gradeColor}">
          <div class="sc-grade">${grade}</div>
          <div class="sc-lbl">Ранг</div>
        </div>
      </div>

      <!-- Secondary cards -->
      <div class="stats-cards stats-cards--secondary">
        <div class="stat-card stat-card--sm">
          <div class="sc-icon-sm">⌨️</div>
          <div class="sc-val-sm">${fmtNum(cumChars)}</div>
          <div class="sc-lbl-sm">Всего напечатано</div>
        </div>
        <div class="stat-card stat-card--sm">
          <div class="sc-icon-sm">❌</div>
          <div class="sc-val-sm">${fmtNum(cumErrors)}</div>
          <div class="sc-lbl-sm">Всего ошибок</div>
        </div>
        <div class="stat-card stat-card--sm">
          <div class="sc-icon-sm">✅</div>
          <div class="sc-val-sm">${overallAcc}%</div>
          <div class="sc-lbl-sm">Общая точность</div>
        </div>
        <div class="stat-card stat-card--sm">
          <div class="sc-icon-sm">🎮</div>
          <div class="sc-val-sm">${fmtNum(cumSessions)}</div>
          <div class="sc-lbl-sm">Всего сессий</div>
        </div>
        <div class="stat-card stat-card--sm">
          <div class="sc-icon-sm">⏱</div>
          <div class="sc-val-sm">${fmtDuration(cumTimeMs)}</div>
          <div class="sc-lbl-sm">Общее время</div>
        </div>
        <div class="stat-card stat-card--sm">
          <div class="sc-icon-sm">🔥</div>
          <div class="sc-val-sm">${streak}</div>
          <div class="sc-lbl-sm">Стрик (дней)</div>
        </div>
        <div class="stat-card stat-card--sm ${trendCls}">
          <div class="sc-icon-sm">📉</div>
          <div class="sc-val-sm">${trendSign}${trend}</div>
          <div class="sc-lbl-sm">Тренд скорости</div>
        </div>
        <div class="stat-card stat-card--sm">
          <div class="sc-icon-sm">${modeIcons[favMode] || '🎮'}</div>
          <div class="sc-val-sm">${modeNames[favMode] || '—'}</div>
          <div class="sc-lbl-sm">Любимый режим</div>
        </div>
      </div>

      <!-- Speed & accuracy charts -->
      <div class="stats-charts-row">
        <div class="stats-chart-box">
          <div class="scb-header"><span class="scb-label">⚡ Скорость</span><span class="scb-sub">последние ${Math.min(recent.length,50)} игр</span></div>
          <canvas id="speed-chart"></canvas>
        </div>
        <div class="stats-chart-box">
          <div class="scb-header"><span class="scb-label">🎯 Точность</span><span class="scb-sub">последние ${Math.min(recent.length,50)} игр</span></div>
          <canvas id="acc-chart"></canvas>
        </div>
      </div>

      <!-- Speed by day -->
      <div class="stats-chart-box stats-chart-box--wide" style="margin-bottom:24px">
        <div class="scb-header"><span class="scb-label">📅 Средняя скорость по дням</span><span class="scb-sub">последние 14 дней</span></div>
        <canvas id="speed-by-day-chart"></canvas>
      </div>

      <!-- Mode breakdown -->
      <div class="stats-chart-box stats-chart-box--wide" style="margin-bottom:24px">
        <div class="scb-header"><span class="scb-label">🎮 Активность по режимам</span></div>
        <div id="mode-breakdown"></div>
      </div>

      <!-- Top 5 sessions -->
      <div class="stats-chart-box stats-chart-box--wide" style="margin-bottom:24px">
        <div class="scb-header"><span class="scb-label">🏆 Топ-5 сессий</span></div>
        <table class="sessions-table" id="top5-table">
          <thead><tr>
            <th></th><th>Дата</th><th>Режим</th><th>Скорость</th><th>Точность</th><th>Символов</th><th>Время</th>
          </tr></thead>
          <tbody id="top5-tbody"></tbody>
        </table>
      </div>

      <!-- Heatmap -->
      <div class="stats-heatmap-box">
        <div class="scb-header"><span class="scb-label">⌨️ Тепловая карта ошибок</span></div>
        <div id="heatmap-keyboard" class="heatmap-keyboard"></div>
        <div class="heatmap-legend">
          <div class="hml-item"><span class="hml-dot" style="background:#27ae60"></span>Хорошо</div>
          <div class="hml-item"><span class="hml-dot" style="background:#f1c40f"></span>Средне</div>
          <div class="hml-item"><span class="hml-dot" style="background:#c0392b"></span>Много ошибок</div>
          <div class="hml-item"><span class="hml-dot" style="background:#1a2a1a"></span>Нет данных</div>
        </div>
      </div>

      <!-- Session history -->
      <div class="stats-history-box">
        <div class="scb-header">
          <span class="scb-label">🕓 История сессий</span>
          <div class="hist-filter" id="hist-filter">
            <button class="hf-btn active" data-mode="all">Все</button>
            <button class="hf-btn" data-mode="classic">📝</button>
            <button class="hf-btn" data-mode="falling">🎮</button>
            <button class="hf-btn" data-mode="zombie">🧟</button>
            <button class="hf-btn" data-mode="osu">🔮</button>
          </div>
        </div>
        <table class="sessions-table">
          <thead><tr>
            <th>Дата</th><th>Режим</th><th>Скорость</th><th>Точность</th><th>Символов</th><th>Ошибок</th><th>Время</th>
          </tr></thead>
          <tbody id="sessions-tbody"></tbody>
        </table>
      </div>
    </div>`;

  // ── Render ────────────────────────────────────────────────────
  setTimeout(() => {
    const r = setupCanvas('speed-chart', 400, 200);
    if (r) drawLineChart(r, recent.map(s => s.speed || 0), '#3b82f6', 'зн/мин');

    const r2 = setupCanvas('acc-chart', 400, 200);
    if (r2) drawLineChart(r2, recent.map(s => s.accuracy || 0), '#10b981', '%');

    // Speed by day
    const byDay = {};
    sessions.forEach(s => {
      const d = new Date(s.date).toLocaleDateString('ru-RU', { day:'2-digit', month:'2-digit' });
      if (!byDay[d]) byDay[d] = [];
      byDay[d].push(s.speed || 0);
    });
    const dayKeys   = Object.keys(byDay).slice(-14);
    const dayLabels = dayKeys;
    const dayAvgs   = dayKeys.map(d => Math.round(byDay[d].reduce((a,v) => a+v, 0) / byDay[d].length));
    const r3 = setupCanvas('speed-by-day-chart', 700, 190);
    if (r3) drawBarChart(r3, dayLabels, dayAvgs, '#58a6ff', 'зн/мин');

    renderModeBreakdown('mode-breakdown', sessions, modeIcons, modeNames);
    renderTop5('top5-tbody', sessions, modeIcons, modeNames);
    renderHeatmap('heatmap-keyboard', heatmap, lang);
    renderSessionsTable('sessions-tbody', sessions, 'all');

    // Filter buttons
    const filterEl = document.getElementById('hist-filter');
    if (filterEl) {
      filterEl.addEventListener('click', e => {
        const btn = e.target.closest('.hf-btn');
        if (!btn) return;
        filterEl.querySelectorAll('.hf-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderSessionsTable('sessions-tbody', sessions, btn.dataset.mode);
      });
    }
  }, 50);
}

// ── Line chart (HiDPI, smooth Catmull-Rom) ────────────────────────────────────
function drawLineChart({ ctx, W, H }, data, color, label) {
  const pad = { t:20, r:16, b:28, l:38 };
  ctx.clearRect(0, 0, W, H);

  if (!data.length) {
    ctx.fillStyle = '#888'; ctx.font = '13px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('Нет данных', W / 2, H / 2); return;
  }
  if (data.length === 1) {
    ctx.beginPath(); ctx.arc(W/2, H/2, 6, 0, Math.PI*2);
    ctx.fillStyle = color; ctx.fill();
    ctx.fillStyle = '#ccc'; ctx.font = '13px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(data[0] + ' ' + label, W/2, H/2 - 14);
    ctx.fillStyle = '#666'; ctx.font = '11px sans-serif';
    ctx.fillText('Сыграйте ещё', W/2, H - 8); return;
  }

  const cW = W - pad.l - pad.r;
  const cH = H - pad.t - pad.b;
  const max = Math.max(...data, 1);
  const xOf = (i) => pad.l + (i / (data.length - 1)) * cW;
  const yOf = (v) => pad.t + (1 - v / max) * cH;

  // Grid
  ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.t + (cH * i / 4);
    ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke();
    ctx.fillStyle = '#666'; ctx.font = '10px sans-serif'; ctx.textAlign = 'right';
    ctx.fillText(Math.round(max * (1 - i/4)), pad.l - 4, y + 4);
  }

  const pts = data.map((v, i) => ({ x: xOf(i), y: yOf(v) }));

  // Gradient fill
  const grad = ctx.createLinearGradient(0, pad.t, 0, H - pad.b);
  grad.addColorStop(0, color + '55'); grad.addColorStop(1, color + '00');
  ctx.beginPath();
  ctx.moveTo(pts[0].x, H - pad.b);
  ctx.lineTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) {
    const cpx = (pts[i-1].x + pts[i].x) / 2;
    ctx.bezierCurveTo(cpx, pts[i-1].y, cpx, pts[i].y, pts[i].x, pts[i].y);
  }
  ctx.lineTo(pts[pts.length-1].x, H - pad.b);
  ctx.closePath(); ctx.fillStyle = grad; ctx.fill();

  // Line
  ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = 2;
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) {
    const cpx = (pts[i-1].x + pts[i].x) / 2;
    ctx.bezierCurveTo(cpx, pts[i-1].y, cpx, pts[i].y, pts[i].x, pts[i].y);
  }
  ctx.stroke();

  // Dots (only when few points)
  if (data.length <= 30) {
    pts.forEach(p => {
      ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI*2);
      ctx.fillStyle = '#fff'; ctx.fill();
      ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.stroke();
    });
  }

  // Last value label
  const last = pts[pts.length-1];
  ctx.fillStyle = color; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'right';
  ctx.fillText(data[data.length-1] + ' ' + label, W - pad.r, last.y - 6);
}

// ── Bar chart (rounded, HiDPI) ────────────────────────────────────────────────
function drawBarChart({ ctx, W, H }, labels, data, color, unit) {
  const padL = 40, padB = 30, padT = 18, padR = 12;
  ctx.clearRect(0, 0, W, H);

  if (!data.length) {
    ctx.fillStyle = '#888'; ctx.font = '13px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('Нет данных', W/2, H/2); return;
  }

  const max = Math.max(...data, 1);
  const cW = W - padL - padR;
  const cH = H - padT - padB;
  const bw = Math.max(4, Math.floor(cW / data.length) - 6);

  // Grid
  ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padT + cH * i / 4;
    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(W - padR, y); ctx.stroke();
    ctx.fillStyle = '#666'; ctx.font = '10px sans-serif'; ctx.textAlign = 'right';
    ctx.fillText(Math.round(max * (1 - i/4)), padL - 4, y + 4);
  }

  data.forEach((v, i) => {
    const x = padL + (i / data.length) * cW + (cW / data.length - bw) / 2;
    const bh = Math.max(2, (v / max) * cH);
    const y  = padT + cH - bh;
    const r  = Math.min(4, bw / 2);
    const grad = ctx.createLinearGradient(0, y, 0, y + bh);
    grad.addColorStop(0, color); grad.addColorStop(1, color + '88');
    ctx.fillStyle = grad;
    // Rounded top
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + bw - r, y);
    ctx.quadraticCurveTo(x + bw, y, x + bw, y + r);
    ctx.lineTo(x + bw, y + bh); ctx.lineTo(x, y + bh); ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath(); ctx.fill();

    if (labels[i]) {
      ctx.fillStyle = '#888'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(labels[i], x + bw/2, H - padB + 13);
    }
    if (v > 0) {
      ctx.fillStyle = color; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(v, x + bw/2, y - 4);
    }
  });
}

// ── Mode breakdown ────────────────────────────────────────────────────────────
function renderModeBreakdown(containerId, sessions, modeIcons, modeNames) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const counts = {};
  sessions.forEach(s => { counts[s.mode] = (counts[s.mode] || 0) + 1; });
  const total = sessions.length || 1;
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (!sorted.length) { el.innerHTML = '<div class="mbd-empty">Нет данных</div>'; return; }
  el.innerHTML = sorted.map(([mode, cnt]) => {
    const pct = Math.round(cnt / total * 100);
    return `
      <div class="mbd-row">
        <div class="mbd-name">${modeIcons[mode] || '🎮'} ${modeNames[mode] || mode}</div>
        <div class="mbd-bar-wrap"><div class="mbd-bar" style="width:${pct}%"></div></div>
        <div class="mbd-count">${cnt} <small>(${pct}%)</small></div>
      </div>`;
  }).join('');
}

// ── Top 5 sessions ────────────────────────────────────────────────────────────
function renderTop5(tbodyId, sessions, modeIcons, modeNames) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;
  const medals = ['🥇','🥈','🥉','4.','5.'];
  const top = sessions.slice().sort((a, b) => (b.speed||0) - (a.speed||0)).slice(0, 5);
  if (!top.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-row">Сыграйте игру!</td></tr>'; return;
  }
  tbody.innerHTML = top.map((s, i) => `
    <tr>
      <td>${medals[i]}</td>
      <td>${new Date(s.date).toLocaleString('ru-RU', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })}</td>
      <td>${modeIcons[s.mode] || ''} ${modeNames[s.mode] || s.mode}</td>
      <td class="speed-cell"><strong>${s.speed}</strong> <small>зн/мин</small></td>
      <td class="${s.accuracy >= 95 ? 'good' : s.accuracy >= 85 ? 'ok' : 'bad'}">${s.accuracy}%</td>
      <td>${(s.chars || 0).toLocaleString()}</td>
      <td class="dur-cell">${fmtDuration(s.duration)}</td>
    </tr>`).join('');
}

// ── Session history table ─────────────────────────────────────────────────────
function renderSessionsTable(tbodyId, allSessions, filterMode) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;
  const modeIcons = { classic:'📝', falling:'🎮', zombie:'🧟', osu:'🔮', code:'💻' };
  const modeNames = { classic:'Классика', falling:'Падение', zombie:'Зомби', osu:'Сферы', code:'Код' };
  const sessions = (filterMode && filterMode !== 'all')
    ? allSessions.filter(s => s.mode === filterMode)
    : allSessions;
  const rows = sessions.slice(-30).reverse();
  if (!rows.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-row">Нет сессий для этого режима</td></tr>'; return;
  }
  tbody.innerHTML = rows.map(s => `
    <tr class="${s.partial ? 'row-partial' : ''}">
      <td>${new Date(s.date).toLocaleString('ru-RU', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })}${s.partial ? ' <span class="tag-partial" title="Незавершённая">✂</span>' : ''}</td>
      <td>${modeIcons[s.mode] || ''} ${modeNames[s.mode] || s.mode}</td>
      <td class="speed-cell">${s.speed} <small>зн/мин</small></td>
      <td class="${s.accuracy >= 95 ? 'good' : s.accuracy >= 85 ? 'ok' : 'bad'}">${s.accuracy}%</td>
      <td>${(s.chars || 0).toLocaleString()}</td>
      <td class="bad-lite">${(s.errors || 0).toLocaleString()}</td>
      <td class="dur-cell">${fmtDuration(s.duration)}</td>
    </tr>`).join('');
}

// ── Keyboard heatmap ──────────────────────────────────────────────────────────
function renderHeatmap(containerId, heatmap, lang) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const layouts = {
    ru: [
      ['ё','1','2','3','4','5','6','7','8','9','0','-','='],
      ['й','ц','у','к','е','н','г','ш','щ','з','х','ъ'],
      ['ф','ы','в','а','п','р','о','л','д','ж','э'],
      ['я','ч','с','м','и','т','ь','б','ю','.'],
      [' ']
    ],
    en: [
      ['`','1','2','3','4','5','6','7','8','9','0','-','='],
      ['q','w','e','r','t','y','u','i','o','p','[',']'],
      ['a','s','d','f','g','h','j','k','l',';',"'"],
      ['z','x','c','v','b','n','m',',','.','/' ],
      [' ']
    ]
  };

  const rows = layouts[lang] || layouts.en;
  container.innerHTML = '';
  rows.forEach(row => {
    const rowEl = document.createElement('div');
    rowEl.className = 'hm-row';
    row.forEach(key => {
      const el = document.createElement('div');
      el.className = 'hm-key' + (key === ' ' ? ' hm-space' : '');
      const data = heatmap[key.toLowerCase()] || { hits:0, errors:0 };
      const errRate = data.hits > 0 ? data.errors / data.hits : 0;
      let bg = '#1a2a1a';
      if (errRate > 0.3) bg = '#c0392b';
      else if (errRate > 0.15) bg = '#f1c40f';
      else if (data.hits > 0) bg = '#27ae60';
      el.style.background = bg;
      el.title = `${key === ' ' ? '⎵ Пробел' : key.toUpperCase()}: ${data.hits} нажатий, ${data.errors} ошибок (${Math.round(errRate*100)}%)`;
      el.textContent = key === ' ' ? '⎵' : key.toUpperCase();
      rowEl.appendChild(el);
    });
    container.appendChild(rowEl);
  });
}



// ===== js/leaderboard.js =====
// ─── Leaderboard ──────────────────────────────────────────────────────
// Reads all users from Firestore and builds a ranking table.

const LEADERBOARD_UNLOCK_LEVEL = 1; // always unlocked

/** Collect leaderboard entries from Firestore users collection */
async function getLeaderboardEntries() {
  if (typeof _fbDb === 'undefined') return [];
  try {
    const snap = await _fbDb.collection('users').get();
    return snap.docs
      .filter(d => !d.data().banned)
      .map(d => {
        const data = d.data();
        return {
          username:      d.id,
          displayName:   data.displayName   || 'Игрок',
          level:         data.level         || 1,
          bestSpeed:     data.bestSpeed     || 0,
          totalSessions: data.totalSessions || 0,
          totalChars:    data.totalChars    || 0,
          avgAccuracy:   data.avgAccuracy   || 0,
          streak:        data.streak        || 0,
          ratingPoints:  data.ratingPoints  || 1000,
          avatarEmoji:   data.avatarEmoji   || null,
          avatarUrl:     data.avatarUrl     || null,
        };
      });
  } catch { return []; }
}

/** Check if leaderboard is unlocked for the given profile level */
function isLeaderboardUnlocked(profileLevel) {
  return true; // always unlocked
}

const LEADERBOARD_UNLOCK_LEVEL_VALUE = LEADERBOARD_UNLOCK_LEVEL;

/**
 * Render the leaderboard into a container element.
 * @param {HTMLElement} container
 * @param {string} currentUsername  — highlight current user row
 * @param {number} profileLevel     — to show locked/unlocked state
 */
async function renderLeaderboard(container, currentUsername, profileLevel) {
  container.innerHTML = '<p class="text-muted" style="padding:40px;text-align:center">Загрузка…</p>';
  const entries = await getLeaderboardEntries();
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


// ===== js/ws.js =====
// ─── WebSocket Client — Duel / Matchmaking ────────────────────────────
// Connects to the TypeMaster server for real-time online matchmaking.

const WS_URL = (() => {
  const loc = window.location;
  const proto = loc.protocol === 'https:' ? 'wss:' : 'ws:';
  return proto + '//' + loc.host;
})();

let   _ws           = null;
let   _reconnectTimer = null;
const _handlers     = {};   // event type → [callback, ...]
let   _authPayload  = null; // stored to re-send on reconnect
let   _connected    = false;

// ─── Internal ─────────────────────────────────────────────────────────
function _emit(type, data) {
  (_handlers[type] || []).forEach(fn => fn(data));
}

function _send(obj) {
  if (_ws && _ws.readyState === WebSocket.OPEN) {
    _ws.send(JSON.stringify(obj));
  }
}

function _connect() {
  if (_ws && (_ws.readyState === WebSocket.OPEN || _ws.readyState === WebSocket.CONNECTING)) return;

  try {
    _ws = new WebSocket(WS_URL);
  } catch (e) {
    console.warn('[WS] Cannot connect:', e.message);
    _scheduleReconnect();
    return;
  }

  _ws.onopen = () => {
    _connected = true;
    console.log('[WS] Connected');
    if (_reconnectTimer) { clearTimeout(_reconnectTimer); _reconnectTimer = null; }
    if (_authPayload) _send(_authPayload);
    _emit('connected', {});
  };

  _ws.onmessage = e => {
    try {
      const msg = JSON.parse(e.data);
      _emit(msg.type, msg);
      _emit('*', msg);
    } catch {}
  };

  _ws.onclose = () => {
    _connected = false;
    console.log('[WS] Disconnected');
    _emit('disconnected', {});
    _scheduleReconnect();
  };

  _ws.onerror = () => {
    _ws.close();
  };
}

function _scheduleReconnect() {
  if (_reconnectTimer) return;
  _reconnectTimer = setTimeout(() => {
    _reconnectTimer = null;
    _connect();
  }, 3000);
}

// ─── Public API ────────────────────────────────────────────────────────

/** Register a handler for a server message type. */
function onWS(type, fn) {
  if (!_handlers[type]) _handlers[type] = [];
  _handlers[type].push(fn);
}

/** Authenticate with the server (called after login). */
function wsAuth(username, displayName, ratingPoints) {
  _authPayload = { type: 'auth', username, displayName, ratingPoints };
  if (!_ws || _ws.readyState === WebSocket.CLOSED || _ws.readyState === WebSocket.CLOSING) {
    _connect();
  } else {
    _send(_authPayload);
  }
}

/** Enter matchmaking queue and start playing. */
function wsFindMatch(duration) {
  _send({ type: 'find_match', duration });
}

/** Submit local game result to server for matching. */
function wsSubmitResult(result) {
  _send({
    type:     'submit_result',
    speed:    result.speed    || 0,
    accuracy: result.accuracy || 0,
    chars:    result.chars    || 0,
    errors:   result.errors   || 0,
  });
}

/** Leave matchmaking queue. */
function wsCancelQueue() {
  _send({ type: 'cancel_queue' });
}

/** Forfeit a duel (user left mid-game). */
function wsForfeit() {
  _send({ type: 'forfeit' });
}

/** True if socket is open. */
function wsIsConnected() {
  return _connected && _ws && _ws.readyState === WebSocket.OPEN;
}


// ===== js/modes/classic.js =====



// Difficulty presets (used when no level is active)
const CLASSIC_DIFF = {
  easy:   { duration: 90,  wordCount: 30, maxWordLen: 5 },
  medium: { duration: 60,  wordCount: 50, maxWordLen: 999 },
  hard:   { duration: 45,  wordCount: 70, minWordLen: 5 },
};

// Classic monkeytype-style mode
class ClassicMode {
  constructor(opts) {
    this.container = opts.container;
    this.lang = opts.lang || 'ru';
    this.level = opts.level || null;

    this.modeName = 'classic';
    const diff = CLASSIC_DIFF[opts.difficulty || 'medium'];
    this._diff = diff;
    // If duration/wordCount are explicitly passed (e.g. from level or Quick Start), respect them;
    // otherwise fall back to difficulty preset
    this.duration  = opts.duration  ?? diff.duration;   // seconds; 0 = word count mode
    this.wordCount = opts.wordCount ?? diff.wordCount;
    this.onFinish = opts.onFinish || (() => {});
    this.onChange = opts.onChange || (() => {});

    this.words = [];
    this.currentWordIdx = 0;
    this.currentCharIdx = 0;
    this.startTime = null;
    this.endTime = null;
    this.timer = null;
    this.timeLeft = this.duration;
    this.errors = 0;
    this.totalChars = 0;
    this.errorChars = 0;
    this.keyStats = {};
    this.consecutiveCorrect = 0;
    this.running = false;
    this.wordErrors = new Set(); // word indices with errors
    this.codeMode    = opts.codeMode    || false;
    this.customWords = opts.customWords || null;
    this.ghostSpeed  = opts.ghostSpeed  || 0;

    this._keyHandler = this._onKey.bind(this);
  }

  generateWords() {
    if (this.customWords && this.customWords.length > 0) {
      this.words = [...this.customWords];
      this.wordCount = this.words.length;
      return;
    }
    const pool = this._getWordPool();
    this.words = [];
    for (let i = 0; i < this.wordCount; i++) {
      this.words.push(pool[Math.floor(Math.random() * pool.length)]);
    }
  }

  _getWordPool() {
    const data = WORDS[this.lang];
    if (this.level?.useCode || this.codeMode) return data.code;
    if (this.level?.useCommon || !this.level?.chars) {
      // Apply word-length filter when playing without a level (pure difficulty mode)
      if (!this.level) {
        const d = this._diff;
        return data.common.filter(w => {
          if (d.maxWordLen && w.length > d.maxWordLen) return false;
          if (d.minWordLen && w.length < d.minWordLen) return false;
          return true;
        });
      }
      return data.common;
    }
    // Char-based: generate pseudo-words from allowed chars
    const chars = this.level?.chars?.[this.lang];
    if (!chars) return data.common;
    const pool = [];
    for (let i = 0; i < 80; i++) {
      const len = 2 + Math.floor(Math.random() * 4);
      let w = '';
      for (let j = 0; j < len; j++) w += chars[Math.floor(Math.random() * chars.length)];
      pool.push(w);
    }
    return pool;
  }

  mount() {
    this.container.innerHTML = `
      <div class="classic-wrapper">
        <div class="classic-stats-bar">
          <div class="stat-item" id="cl-timer">
            <span class="stat-val" id="cl-time">${this.duration > 0 ? this.duration : '∞'}</span>
            <span class="stat-lbl">сек</span>
          </div>
          <div class="stat-item">
            <span class="stat-val" id="cl-wpm">0</span>
            <span class="stat-lbl">зн/мин</span>
          </div>
          <div class="stat-item">
            <span class="stat-val" id="cl-acc">100</span>
            <span class="stat-lbl">% точность</span>
          </div>
          <div class="stat-item">
            <span class="stat-val" id="cl-errors">0</span>
            <span class="stat-lbl">ошибок</span>
          </div>
          ${this.ghostSpeed > 0 ? `<div class="stat-item cl-ghost-item">
            <span class="stat-val ghost-stat-val" id="cl-ghost">👻 ${this.ghostSpeed}</span>
            <span class="stat-lbl">рекорд</span>
          </div>` : ''}
        </div>
        <div class="classic-text-area" id="cl-text" tabindex="-1"></div>
        <div class="classic-cursor-hint">Начните печатать...</div>
      </div>`;

    this.generateWords();
    this._renderText();
    this._setNextHighlight();

    document.addEventListener('keydown', this._keyHandler);
  }

  unmount() {
    document.removeEventListener('keydown', this._keyHandler);
    clearHighlights();
    if (this.timer) clearInterval(this.timer);
  }

  _renderText() {
    const el = document.getElementById('cl-text');
    if (!el) return;
    el.innerHTML = this.words.map((w, wi) => {
      const isCur = wi === this.currentWordIdx;
      const wordComplete = isCur && this.currentCharIdx >= w.length;

      const chars = w.split('').map((c, ci) => {
        let cls = 'cl-char';
        if (wi < this.currentWordIdx) {
          cls += this.wordErrors.has(wi) ? ' cl-error' : ' cl-done';
        } else if (isCur) {
          if (ci < this.currentCharIdx) {
            cls += ' cl-typed';
          } else if (ci === this.currentCharIdx) {
            cls += ' cl-cursor';
          }
        }
        return `<span class="${cls}">${c}</span>`;
      }).join('');

      // Space separator — rendered as visible dot; cursor sits on it when word is done
      const hasSpace = wi < this.words.length - 1;
      const spaceSpan = hasSpace
        ? `<span class="cl-space${wordComplete ? ' cl-cursor' : ''}">${wordComplete ? '⎵' : '·'}</span>`
        : '';

      return `<span class="cl-word">${chars}${spaceSpan}</span>`;
    }).join('');

    // Scroll current word into view
    const cursorEl = el.querySelector('.cl-cursor');
    if (cursorEl) cursorEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  _setNextHighlight() {
    if (this.currentWordIdx >= this.words.length) return;
    const word = this.words[this.currentWordIdx];
    if (this.currentCharIdx < word.length) {
      setNextKey(word[this.currentCharIdx]);
    } else {
      setNextKey(' '); // next is space
    }
  }

  _onKey(e) {
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    if (['Shift', 'CapsLock', 'Tab', 'Escape', 'F1', 'F2', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
    e.preventDefault();

    if (!this.running) this._start();

    const key = e.key;
    const word = this.words[this.currentWordIdx];
    if (!word) return;

    // ── Backspace ──────────────────────────────────────────
    if (key === 'Backspace') {
      if (this.currentCharIdx > 0) {
        this.currentCharIdx--;
      } else if (this.currentWordIdx > 0) {
        // Jump back to end of previous word (space position)
        this.currentWordIdx--;
        this.currentCharIdx = this.words[this.currentWordIdx].length;
      }
      this._renderText();
      this._setNextHighlight();
      return;
    }

    // ── Space: advance to next word ─────────────────────────
    if (key === ' ') {
      if (this.currentCharIdx >= word.length) {
        // Word fully typed — advance
        playKeyClick();
        this.totalChars++; // count the space itself
        this.currentWordIdx++;
        this.currentCharIdx = 0;
        if (this.currentWordIdx >= this.words.length) {
          this._finish();
          return;
        }
      } else {
        // Space pressed mid-word — error
        playError();
        this.errors++;
        this.errorChars++;
        this.consecutiveCorrect = 0;
        this.wordErrors.add(this.currentWordIdx);
      }
      this._renderText();
      this._setNextHighlight();
      this._updateStats();
      this.onChange({ speed: this._calcSpeed(), accuracy: this._calcAccuracy() });
      return;
    }

    // ── Regular character ───────────────────────────────────
    if (this.currentCharIdx >= word.length) return; // word done, waiting for space

    const expected = word[this.currentCharIdx];
    const correct = key.toLowerCase() === expected.toLowerCase();

    const keyLower = key.toLowerCase();
    if (!this.keyStats[keyLower]) this.keyStats[keyLower] = { hits: 0, errors: 0 };
    this.keyStats[keyLower].hits++;

    onPhysicalKey(e, expected);

    if (correct) {
      playKeyClick();
      this.totalChars++;
      this.consecutiveCorrect++;
      this.currentCharIdx++;
    } else {
      playError();
      this.errors++;
      this.errorChars++;
      this.consecutiveCorrect = 0;
      this.keyStats[keyLower].errors++;
      this.wordErrors.add(this.currentWordIdx);
    }

    this._renderText();
    this._setNextHighlight();
    this._updateStats();
    this.onChange({ speed: this._calcSpeed(), accuracy: this._calcAccuracy() });
  }

  _start() {
    this.running = true;
    this.startTime = Date.now();
    const hint = this.container.querySelector('.classic-cursor-hint');
    if (hint) hint.remove();

    if (this.duration > 0) {
      this.timeLeft = this.duration;
      this.timer = setInterval(() => {
        this.timeLeft--;
        const el = document.getElementById('cl-time');
        if (el) el.textContent = this.timeLeft;
        if (this.timeLeft <= 0) this._finish();
      }, 1000);
    }
  }

  _finish() {
    if (this.timer) clearInterval(this.timer);
    this.running = false;
    this.endTime = Date.now();
    clearHighlights();

    const result = this._buildResult();
    this.onFinish(result);
  }

  _calcSpeed() {
    if (!this.startTime) return 0;
    const mins = (Date.now() - this.startTime) / 60000;
    return mins > 0 ? Math.round(this.totalChars / mins) : 0;
  }

  _calcAccuracy() {
    if (this.totalChars === 0) return 100;
    return Math.round(((this.totalChars - this.errorChars) / this.totalChars) * 100);
  }

  _updateStats() {
    const spd = document.getElementById('cl-wpm');
    const acc = document.getElementById('cl-acc');
    const err = document.getElementById('cl-errors');
    if (spd) spd.textContent = this._calcSpeed();
    if (acc) acc.textContent = this._calcAccuracy();
    if (err) err.textContent = this.errors;
    const ghostEl = document.getElementById('cl-ghost');
    if (ghostEl && this.ghostSpeed > 0) {
      const cur = this._calcSpeed();
      const d = cur - this.ghostSpeed;
      const sign = d >= 0 ? '+' : '';
      ghostEl.innerHTML = `👻 ${this.ghostSpeed} <span class="${d >= 0 ? 'cls-ghost-pos' : 'cls-ghost-neg'}">${sign}${d}</span>`;
    }
  }

  _buildResult() {
    return {
      mode: 'classic',
      speed: this._calcSpeed(),
      accuracy: this._calcAccuracy(),
      chars: this.totalChars,
      errors: this.errors,
      duration: this.endTime - this.startTime,
      wordCount: this.currentWordIdx,
      keyStats: this.keyStats,
      lang: this.lang
    };
  }
}


// ===== js/modes/falling.js =====



// Difficulty presets
const FALLING_DIFF = {
  easy:   { lives: 7, baseSpawn: 3200, minSpawn: 1800, baseSpeed: 0.02, maxSpeed: 0.05 },
  medium: { lives: 5, baseSpawn: 2500, minSpawn: 1200, baseSpeed: 0.03, maxSpeed: 0.08 },
  hard:   { lives: 3, baseSpawn: 1800, minSpawn:  700, baseSpeed: 0.045, maxSpeed: 0.14 },
};

// ZType-style falling words arcade mode
class FallingMode {
  constructor(opts) {
    this.container = opts.container;
    this.lang = opts.lang || 'ru';
    this.onFinish = opts.onFinish || (() => {});
    this.onChange = opts.onChange || (() => {});

    this.modeName = 'falling';
    const diff = FALLING_DIFF[opts.difficulty || 'medium'];
    this._diff = diff;
    this.lives = opts.lives ?? diff.lives;
    this.maxActiveCols = opts.cols || 6;

    this.words = [];         // all word data
    this.activeWords = [];   // currently falling
    this.typingWord = null;  // word currently being typed
    this.typedChars = 0;

    this.score = 0;
    this.combo = 0;
    this.errors = 0;
    this.totalChars = 0;
    this.errorChars = 0;
    this.keyStats = {};
    this.startTime = null;
    this.lastWordTime = 0;
    this.spawnInterval = diff.baseSpawn; // ms between spawns
    this.speed = diff.baseSpeed;         // px per ms
    this.running = false;
    this.raf = null;
    this.livesLeft = this.lives;
    this.wordPool = [];
    this.colPositions = [];

    this._keyHandler = this._onKey.bind(this);
    this._frameHandler = this._frame.bind(this);
  }

  mount() {
    this.container.innerHTML = `
      <div class="falling-wrapper">
        <div class="falling-hud">
          <div class="hud-item">❤️ <span id="fl-lives">${this.lives}</span></div>
          <div class="hud-item">⚡ <span id="fl-score">0</span></div>
          <div class="hud-item">🔥 <span id="fl-combo">x1</span></div>
          <div class="hud-item"><span id="fl-wpm">0</span> зн/мин</div>
          <div class="hud-item"><span id="fl-acc">100</span>%</div>
        </div>
        <div class="falling-field" id="fl-field">
          <div class="falling-input-bar" id="fl-input-bar">
            <span class="fl-typed-text" id="fl-typed"></span>
            <span class="fl-cursor-blink">|</span>
          </div>
        </div>
        <div class="falling-danger-line"></div>
      </div>`;

    this.wordPool = [...WORDS[this.lang].common];
    this.startTime = Date.now();
    this.running = true;
    this._spawnWord();
    this.lastWordTime = Date.now(); // reset after first spawn
    this.raf = requestAnimationFrame(this._frameHandler);
    document.addEventListener('keydown', this._keyHandler);
  }

  unmount() {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    document.removeEventListener('keydown', this._keyHandler);
    clearHighlights();
  }

  _spawnWord() {
    if (!this.running) return;
    const field = document.getElementById('fl-field');
    if (!field) return;

    const word = this.wordPool[Math.floor(Math.random() * this.wordPool.length)];
    const fieldW = field.clientWidth;
    const x = 20 + Math.random() * Math.max(fieldW - 150, 100);

    const el = document.createElement('div');
    el.className = 'falling-word';
    el.style.left = x + 'px';
    el.style.top = '10px';
    el.innerHTML = word.split('').map((c, i) => `<span class="fw-char" data-i="${i}">${c}</span>`).join('');

    const wordObj = {
      word, el, x,
      y: 10,
      typedIdx: 0,
      done: false,
      id: Date.now() + Math.random()
    };
    this.activeWords.push(wordObj);
    field.appendChild(el);
  }

  _frame(ts) {
    if (!this.running) return;
    const now = Date.now();
    const dt = Math.min(50, now - (this._lastFrameTime || now)); // cap dt at 50ms
    this._lastFrameTime = now;
    const elapsed = now - this.startTime;

    const field = document.getElementById('fl-field');
    const fieldH = field ? field.clientHeight : 400;

    // Adaptive spawn interval + speed (scales from diff base values)
    const d = this._diff;
    this.spawnInterval = Math.max(d.minSpawn, d.baseSpawn - elapsed / 2000 * 200);
    this.speed = Math.min(d.maxSpeed, d.baseSpeed + elapsed / 300000);

    // Spawn
    if (now - this.lastWordTime > this.spawnInterval) {
      if (this.activeWords.length < this.maxActiveCols) {
        this._spawnWord();
        this.lastWordTime = now;
      }
    }

    // Move words
    const toRemove = [];
    this.activeWords.forEach(w => {
      if (w.done) { toRemove.push(w); return; }
      w.y += this.speed * dt;
      w.el.style.top = w.y + 'px';

      // Reached danger zone?
      if (w.y > fieldH - 60) {
        // Lost a life
        this.livesLeft--;
        w.el.classList.add('falling-missed');
        if (w === this.typingWord) {
          this.typingWord = null;
          const typed = document.getElementById('fl-typed');
          if (typed) typed.textContent = '';
        }
        setTimeout(() => { if (w.el.parentNode) w.el.parentNode.removeChild(w.el); }, 400);
        w.done = true;
        this._updateHUD();
        if (this.livesLeft <= 0) { this._finish(); return; }
      }
    });
    toRemove.forEach(w => {
      const idx = this.activeWords.indexOf(w);
      if (idx >= 0) this.activeWords.splice(idx, 1);
    });

    this._updateHUD();
    this.raf = requestAnimationFrame(this._frameHandler);
  }

  _onKey(e) {
    if (!this.running) return;
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    if (e.key === 'Backspace') {
      if (this.typingWord) {
        if (this.typingWord.typedIdx > 0) {
          this.typingWord.typedIdx--;
          this._updateWordEl(this.typingWord);
          const typed = document.getElementById('fl-typed');
          if (typed) typed.textContent = this.typingWord.word.slice(0, this.typingWord.typedIdx);
        }
      }
      return;
    }
    if (e.key === 'Escape') {
      this.typingWord = null;
      const typed = document.getElementById('fl-typed');
      if (typed) typed.textContent = '';
      return;
    }
    if (e.key.length !== 1) return;
    e.preventDefault();

    const char = e.key;

    // Not typing any word — find one that starts with this char
    if (!this.typingWord) {
      const match = this.activeWords.find(w => !w.done && w.word[0].toLowerCase() === char.toLowerCase());
      if (match) {
        this.typingWord = match;
        match.el.classList.add('typing-active');
      } else {
        playError();
        this.errors++;
        this.errorChars++;
        return;
      }
    }

    const w = this.typingWord;
    const expected = w.word[w.typedIdx];

    const keyLower = char.toLowerCase();
    if (!this.keyStats[keyLower]) this.keyStats[keyLower] = { hits: 0, errors: 0 };
    this.keyStats[keyLower].hits++;

    if (char.toLowerCase() === expected.toLowerCase()) {
      playKeyClick();
      w.typedIdx++;
      this.totalChars++;
      this.combo++;
      const typed = document.getElementById('fl-typed');
      if (typed) typed.textContent = w.word.slice(0, w.typedIdx);
      this._updateWordEl(w);
      setNextKey(w.word[w.typedIdx] || ' ');

      if (w.typedIdx >= w.word.length) {
        // Word complete!
        playSuccess();
        this.score += w.word.length * this.combo;
        w.done = true;
        w.el.classList.add('falling-complete');
        setTimeout(() => { if (w.el.parentNode) w.el.parentNode.removeChild(w.el); }, 400);
        this.typingWord = null;
        const typed2 = document.getElementById('fl-typed');
        if (typed2) typed2.textContent = '';
        clearHighlights();
      }
    } else {
      playError();
      this.errors++;
      this.errorChars++;
      this.combo = 0;
      this.keyStats[keyLower].errors++;
      w.el.classList.add('falling-error');
      setTimeout(() => w.el.classList.remove('falling-error'), 300);
    }
    this._updateHUD();
  }

  _updateWordEl(w) {
    w.el.querySelectorAll('.fw-char').forEach((el, i) => {
      el.className = 'fw-char' + (i < w.typedIdx ? ' fw-done' : i === w.typedIdx ? ' fw-current' : '');
    });
  }

  _updateHUD() {
    const fl = id => document.getElementById(id);
    const speed = this._calcSpeed();
    const acc = this._calcAccuracy();
    if (fl('fl-lives')) fl('fl-lives').textContent = '❤️'.repeat(Math.max(0, this.livesLeft));
    if (fl('fl-score')) fl('fl-score').textContent = this.score;
    if (fl('fl-combo')) fl('fl-combo').textContent = 'x' + Math.max(1, this.combo);
    if (fl('fl-wpm')) fl('fl-wpm').textContent = speed;
    if (fl('fl-acc')) fl('fl-acc').textContent = acc;
    this.onChange({ speed, accuracy: acc });
  }

  _calcSpeed() {
    if (!this.startTime) return 0;
    const mins = (Date.now() - this.startTime) / 60000;
    return mins > 0 ? Math.round(this.totalChars / mins) : 0;
  }

  _calcAccuracy() {
    if (this.totalChars + this.errorChars === 0) return 100;
    return Math.round((this.totalChars / (this.totalChars + this.errorChars)) * 100);
  }

  _finish() {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    document.removeEventListener('keydown', this._keyHandler);
    clearHighlights();
    this.onFinish({
      mode: 'falling',
      speed: this._calcSpeed(),
      accuracy: this._calcAccuracy(),
      chars: this.totalChars,
      errors: this.errors,
      score: this.score,
      duration: Date.now() - this.startTime,
      keyStats: this.keyStats,
      lang: this.lang
    });
  }
}


// ===== js/modes/zombie.js =====



// Difficulty presets
const ZOMBIE_DIFF = {
  easy:   { lives: 5, baseSpeed: 5,  waveIncrement: 1.0, baseSpawnRate: 3500, minSpawnRate: 1500 },
  medium: { lives: 3, baseSpeed: 6,  waveIncrement: 1.5, baseSpawnRate: 3000, minSpawnRate: 1000 },
  hard:   { lives: 1, baseSpeed: 10, waveIncrement: 2.2, baseSpawnRate: 2200, minSpawnRate:  600 },
};

// Zombie arcade mode — words advance toward the player
class ZombieMode {
  constructor(opts) {
    this.container = opts.container;
    this.lang = opts.lang || 'ru';
    this.onFinish = opts.onFinish || (() => {});
    this.onChange = opts.onChange || (() => {});

    this.modeName = 'zombie';
    const diff = ZOMBIE_DIFF[opts.difficulty || 'medium'];
    this._diff = diff;
    this.lives = opts.lives ?? diff.lives;

    this.zombies = [];
    this.typingZombie = null;
    this.score = 0;
    this.killed = 0;
    this.wave = 1;
    this.errors = 0;
    this.totalChars = 0;
    this.errorChars = 0;
    this.keyStats = {};
    this.startTime = null;
    this.wordPool = [];
    this.spawnTimer = 0;
    this.spawnRate = 3000;  // ms
    this.zombieSpeed = 8;   // px per second
    this.running = false;
    this.raf = null;
    this.lastFrame = null;
    this.livesLeft = this.lives;
    this.waveKills = 0;
    this.waveTarget = 10;

    this._keyHandler = this._onKey.bind(this);
    this._frameHandler = this._frame.bind(this);
  }

  mount() {
    this.container.innerHTML = `
      <div class="zombie-wrapper">
        <div class="zombie-hud">
          <div class="hud-item">❤️ <span id="zm-lives">${'❤'.repeat(this.lives)}</span></div>
          <div class="hud-item">🌊 Волна <span id="zm-wave">1</span></div>
          <div class="hud-item">💀 <span id="zm-score">0</span></div>
          <div class="hud-item"><span id="zm-wpm">0</span> зн/мин</div>
        </div>
        <div class="zombie-field" id="zm-field">
          <div class="zombie-player" id="zm-player">
            <span class="player-icon">🧑‍💻</span>
            <div class="player-gun"></div>
          </div>
        </div>
        <div class="zombie-input-row">
          <span class="zi-label">Печатайте:</span>
          <span id="zm-typed" class="zi-typed"></span>
          <span class="fl-cursor-blink">|</span>
        </div>
      </div>`;

    this.wordPool = [...WORDS[this.lang].common];
    this.startTime = Date.now();
    this.lastFrame = null;  // will be set on first rAF tick
    this.running = true;
    this._spawnZombie();
    this.raf = requestAnimationFrame(this._frameHandler);
    document.addEventListener('keydown', this._keyHandler);
  }

  unmount() {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    document.removeEventListener('keydown', this._keyHandler);
    clearHighlights();
  }

  _spawnZombie() {
    const field = document.getElementById('zm-field');
    if (!field) return;
    const word = this.wordPool[Math.floor(Math.random() * this.wordPool.length)];
    const fieldH = field.clientHeight;
    const y = 30 + Math.random() * (fieldH - 100);

    const el = document.createElement('div');
    el.className = 'zombie-enemy';
    el.style.right = '10px';
    el.style.top = y + 'px';
    el.innerHTML = `
      <span class="zombie-icon">🧟</span>
      <div class="zombie-word">${word.split('').map((c, i) => `<span class="zw-char" data-i="${i}">${c}</span>`).join('')}</div>`;

    const obj = {
      word, el, y,
      x: field.clientWidth - 60,
      typedIdx: 0, done: false, id: Date.now() + Math.random()
    };
    this.zombies.push(obj);
    field.appendChild(el);
  }

  _frame(now) {
    if (!this.running) return;
    if (this.lastFrame === null) {
      this.lastFrame = now;
      this.raf = requestAnimationFrame(this._frameHandler);
      return;
    }
    const dt = Math.min(50, now - this.lastFrame);
    this.lastFrame = now;

    const field = document.getElementById('zm-field');
    const fieldW = field ? field.clientWidth : 800;
    const elapsed = (now - this.startTime) / 1000;

    // Difficulty scaling
    const d = this._diff;
    this.zombieSpeed = d.baseSpeed + this.wave * d.waveIncrement;
    this.spawnRate = Math.max(d.minSpawnRate, d.baseSpawnRate - this.wave * 200);

    // Spawn timer
    this.spawnTimer += dt;
    if (this.spawnTimer >= this.spawnRate && this.zombies.filter(z => !z.done).length < 4 + this.wave) {
      this._spawnZombie();
      this.spawnTimer = 0;
    }

    const toRemove = [];
    this.zombies.forEach(z => {
      if (z.done) { toRemove.push(z); return; }
      // Move left
      z.x -= (this.zombieSpeed * dt) / 1000;
      z.el.style.right = 'auto';
      z.el.style.left = z.x + 'px';

      if (z.x < 50) {
        // Reached player!
        this.livesLeft--;
        z.done = true;
        z.el.classList.add('zombie-reached');
        if (z === this.typingZombie) {
          this.typingZombie = null;
          const typed = document.getElementById('zm-typed');
          if (typed) typed.textContent = '';
        }
        setTimeout(() => { if (z.el.parentNode) z.el.parentNode.removeChild(z.el); }, 500);
        if (this.livesLeft <= 0) { this._finish(); return; }
        this._updateHUD();
      }
    });
    toRemove.forEach(z => {
      const i = this.zombies.indexOf(z);
      if (i >= 0) this.zombies.splice(i, 1);
    });

    // Wave progression
    if (this.waveKills >= this.waveTarget) {
      this.wave++;
      this.waveKills = 0;
      this.waveTarget = 10 + this.wave * 2;
      this._showWaveBanner();
    }

    this._updateHUD();
    this.raf = requestAnimationFrame(this._frameHandler);
  }

  _showWaveBanner() {
    const field = document.getElementById('zm-field');
    if (!field) return;
    const banner = document.createElement('div');
    banner.className = 'wave-banner';
    banner.textContent = `Волна ${this.wave}!`;
    field.appendChild(banner);
    setTimeout(() => banner.remove(), 2000);
  }

  _onKey(e) {
    if (!this.running) return;
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    if (e.key === 'Backspace') {
      if (this.typingZombie) {
        if (this.typingZombie.typedIdx > 0) {
          this.typingZombie.typedIdx--;
          this._updateZombieEl(this.typingZombie);
          const typed = document.getElementById('zm-typed');
          if (typed) typed.textContent = this.typingZombie.word.slice(0, this.typingZombie.typedIdx);
        }
      }
      return;
    }
    if (e.key.length !== 1) return;
    e.preventDefault();

    const char = e.key;

    if (!this.typingZombie) {
      // Find closest zombie starting with this char
      const matches = this.zombies.filter(z => !z.done && z.word[0].toLowerCase() === char.toLowerCase());
      if (matches.length > 0) {
        // Pick closest (smallest x)
        matches.sort((a, b) => a.x - b.x);
        this.typingZombie = matches[0];
        this.typingZombie.el.classList.add('zombie-targeted');
      } else {
        playError();
        this.errors++;
        this.errorChars++;
        return;
      }
    }

    const z = this.typingZombie;
    const expected = z.word[z.typedIdx];
    const keyLower = char.toLowerCase();

    if (!this.keyStats[keyLower]) this.keyStats[keyLower] = { hits: 0, errors: 0 };
    this.keyStats[keyLower].hits++;

    if (char.toLowerCase() === expected.toLowerCase()) {
      playKeyClick();
      z.typedIdx++;
      this.totalChars++;
      const typed = document.getElementById('zm-typed');
      if (typed) typed.textContent = z.word.slice(0, z.typedIdx);
      this._updateZombieEl(z);
      setNextKey(z.word[z.typedIdx] || ' ');

      if (z.typedIdx >= z.word.length) {
        // Zombie killed!
        playSuccess();
        this.killed++;
        this.waveKills++;
        this.score += z.word.length * this.wave;
        z.done = true;
        z.el.classList.add('zombie-dead');
        setTimeout(() => { if (z.el.parentNode) z.el.parentNode.removeChild(z.el); }, 500);
        this.typingZombie = null;
        const typed2 = document.getElementById('zm-typed');
        if (typed2) typed2.textContent = '';
        clearHighlights();
        this._shootEffect(z.x, z.y);
      }
    } else {
      playError();
      this.errors++;
      this.errorChars++;
      this.keyStats[keyLower].errors++;
      z.el.classList.add('zombie-error');
      setTimeout(() => z.el.classList.remove('zombie-error'), 300);
    }
    this._updateHUD();
  }

  _shootEffect(x, y) {
    const field = document.getElementById('zm-field');
    if (!field) return;
    const bullet = document.createElement('div');
    bullet.className = 'bullet-trail';
    bullet.style.left = '80px';
    bullet.style.top = (y + 20) + 'px';
    bullet.style.width = (x - 80) + 'px';
    field.appendChild(bullet);
    setTimeout(() => bullet.remove(), 300);
  }

  _updateZombieEl(z) {
    z.el.querySelectorAll('.zw-char').forEach((el, i) => {
      el.className = 'zw-char' + (i < z.typedIdx ? ' zw-done' : i === z.typedIdx ? ' zw-current' : '');
    });
  }

  _updateHUD() {
    const el = id => document.getElementById(id);
    const speed = this._calcSpeed();
    const acc = this._calcAccuracy();
    if (el('zm-lives')) el('zm-lives').textContent = '❤'.repeat(Math.max(0, this.livesLeft)) + '🖤'.repeat(Math.max(0, this.lives - this.livesLeft));
    if (el('zm-wave')) el('zm-wave').textContent = this.wave;
    if (el('zm-score')) el('zm-score').textContent = this.score;
    if (el('zm-wpm')) el('zm-wpm').textContent = speed;
    this.onChange({ speed, accuracy: acc });
  }

  _calcSpeed() {
    const mins = (Date.now() - this.startTime) / 60000;
    return mins > 0 ? Math.round(this.totalChars / mins) : 0;
  }

  _calcAccuracy() {
    const total = this.totalChars + this.errorChars;
    return total === 0 ? 100 : Math.round((this.totalChars / total) * 100);
  }

  _finish() {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    document.removeEventListener('keydown', this._keyHandler);
    clearHighlights();
    this.onFinish({
      mode: 'zombie',
      speed: this._calcSpeed(),
      accuracy: this._calcAccuracy(),
      chars: this.totalChars,
      errors: this.errors,
      score: this.score,
      killed: this.killed,
      wave: this.wave,
      duration: Date.now() - this.startTime,
      keyStats: this.keyStats,
      lang: this.lang
    });
  }
}


// ===== js/modes/osu.js =====



// Difficulty presets
const SPHERE_DIFF = {
  easy:   { lives: 7, baseLifetime: 8000, minLifetime: 5000, maxCircles: 3, baseSpawn: 3200, minSpawn: 2000, accel: 15 },
  medium: { lives: 5, baseLifetime: 5500, minLifetime: 3000, maxCircles: 4, baseSpawn: 2200, minSpawn: 1300, accel: 28 },
  hard:   { lives: 3, baseLifetime: 3200, minLifetime: 1600, maxCircles: 5, baseSpawn: 1300, minSpawn: 700,  accel: 45 },
};

// Сферы mode: circles appear on screen with countdown, type the word to hit them
class OsuMode {
  constructor(opts) {
    this.container  = opts.container;
    this.lang       = opts.lang || 'ru';
    this.onFinish   = opts.onFinish || (() => {});
    this.onChange   = opts.onChange || (() => {});
    this.duration   = opts.duration || 90; // game time (seconds)
    this.modeName   = 'osu';

    const diff      = SPHERE_DIFF[opts.difficulty || 'medium'];
    this._diff      = diff;
    this.lives      = diff.lives;
    this.maxCircles = diff.maxCircles;

    this.circles    = [];     // active hit-circles
    this.typed      = '';     // current typed buffer
    this.activeId   = null;   // id of circle being typed
    this.score      = 0;
    this.combo      = 0;
    this.maxCombo   = 0;
    this.misses     = 0;
    this.hits       = 0;
    this.totalChars = 0;
    this.errorChars = 0;
    this.keyStats   = {};
    this.livesLeft  = this.lives;
    this.running    = false;
    this.raf        = null;
    this.startTime  = null;
    this.timeLeft   = this.duration;
    this._nextId    = 0;
    this._spawnTimer = null;
    this._clockTimer = null;
    this.wordPool   = [];

    this._keyHandler  = this._onKey.bind(this);
    this._frameHandler = this._frame.bind(this);
  }

  // ─── Lifecycle ──────────────────────────────────────────────
  mount() {
    this.container.innerHTML = `
      <div class="osu-wrapper" id="osu-wrap">
        <div class="osu-hud">
          <div class="osu-hud-left">
            <div class="osu-stat">❤️ <span id="osu-lives">${'♥ '.repeat(this.lives).trim()}</span></div>
            <div class="osu-stat">⚡ <span id="osu-score">0</span></div>
            <div class="osu-stat">🔥 <span id="osu-combo">x1</span></div>
          </div>
          <div class="osu-hud-center">
            <div class="osu-timer-wrap">
              <svg class="osu-game-ring" viewBox="0 0 60 60">
                <circle cx="30" cy="30" r="27" class="osu-game-ring-bg"/>
                <circle cx="30" cy="30" r="27" class="osu-game-ring-fg" id="osu-game-ring-fg"/>
              </svg>
              <div class="osu-time-val" id="osu-time">${this.duration}</div>
            </div>
          </div>
          <div class="osu-hud-right">
            <div class="osu-stat"><span id="osu-acc">100</span>% точность</div>
            <div class="osu-stat"><span id="osu-wpm">0</span> зн/мин</div>
          </div>
        </div>

        <div class="osu-field" id="osu-field"></div>

        <div class="osu-input-bar">
          <span class="osu-input-label">Печатай:</span>
          <span class="osu-typed" id="osu-typed"></span>
          <span class="osu-cursor-blink">▌</span>
        </div>
      </div>`;

    this.wordPool  = [...WORDS[this.lang].common, ...WORDS[this.lang].common];
    this.startTime = Date.now();
    this.running   = true;

    document.addEventListener('keydown', this._keyHandler);
    this._startClock();
    this._scheduleSpawn(0);  // spawn first circle immediately
    this._scheduleSpawn(800);
    this.raf = requestAnimationFrame(this._frameHandler);
  }

  unmount() {
    this.running = false;
    document.removeEventListener('keydown', this._keyHandler);
    clearHighlights();
    if (this.raf)         cancelAnimationFrame(this.raf);
    if (this._spawnTimer) clearTimeout(this._spawnTimer);
    if (this._clockTimer) clearInterval(this._clockTimer);
  }

  // ─── Clock ──────────────────────────────────────────────────
  _startClock() {
    this._clockTimer = setInterval(() => {
      if (!this.running) return;
      this.timeLeft = Math.max(0, this.duration - Math.floor((Date.now() - this.startTime) / 1000));
      const el = document.getElementById('osu-time');
      if (el) el.textContent = this.timeLeft;
      // update ring
      const ringEl = document.getElementById('osu-game-ring-fg');
      if (ringEl) {
        const circ = 2 * Math.PI * 27;
        const pct  = this.timeLeft / this.duration;
        ringEl.style.strokeDashoffset = circ * (1 - pct);
      }
      if (this.timeLeft <= 0) this._finish();
    }, 1000);
  }

  // ─── Spawning ───────────────────────────────────────────────
  _scheduleSpawn(delay = null) {
    if (!this.running) return;
    const d = delay ?? this._spawnDelay();
    this._spawnTimer = setTimeout(() => {
      if (!this.running) return;
      this._spawnCircle();
    }, d);
  }

  _spawnDelay() {
    const elapsed  = (Date.now() - this.startTime) / 1000;
    const baseDelay = Math.max(this._diff.minSpawn, this._diff.baseSpawn - elapsed * this._diff.accel);
    return baseDelay + Math.random() * 600;
  }

  _circleLifetime() {
    const elapsed = (Date.now() - this.startTime) / 1000;
    const base    = Math.max(this._diff.minLifetime, this._diff.baseLifetime - elapsed * this._diff.accel);
    return base;
  }

  _spawnCircle() {
    if (!this.running) return;
    if (this.circles.length >= this.maxCircles) {
      this._scheduleSpawn(500);
      return;
    }

    const field = document.getElementById('osu-field');
    if (!field) return;

    const w = field.clientWidth  || 600;
    const h = field.clientHeight || 400;
    const pad = 90;

    const word     = this.wordPool[Math.floor(Math.random() * this.wordPool.length)];
    const id       = ++this._nextId;
    const lifetime = this._circleLifetime();
    const born     = Date.now();

    // Avoid overlapping existing circles
    let x, y, attempts = 0;
    do {
      x = pad + Math.random() * (w - pad * 2);
      y = pad + Math.random() * (h - pad * 2);
      attempts++;
    } while (attempts < 20 && this.circles.some(c => {
      const dx = c.x - x, dy = c.y - y;
      return Math.sqrt(dx * dx + dy * dy) < 130;
    }));

    const circle = { id, word, x, y, born, lifetime, el: null };
    this.circles.push(circle);
    this._renderCircle(circle, field);
    this._scheduleSpawn();
  }

  _renderCircle(circle, field) {
    const el = document.createElement('div');
    el.className    = 'osu-circle';
    el.id           = 'osu-circle-' + circle.id;
    el.style.left   = circle.x + 'px';
    el.style.top    = circle.y + 'px';

    const circ = 2 * Math.PI * 36;
    el.innerHTML = `
      <svg class="osu-ring" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="36" class="osu-ring-bg"/>
        <circle cx="40" cy="40" r="36" class="osu-ring-fg" id="osu-ring-fg-${circle.id}" style="stroke-dasharray:${circ};stroke-dashoffset:0"/>
      </svg>
      <div class="osu-word" id="osu-word-${circle.id}">${this._wordHtml(circle.word, 0)}</div>`;
    field.appendChild(el);
    circle.el = el;

    // Pop-in animation
    requestAnimationFrame(() => el.classList.add('osu-circle-visible'));
  }

  _wordHtml(word, typedLen) {
    const done    = word.slice(0, typedLen);
    const current = word[typedLen] || '';
    const rest    = word.slice(typedLen + 1);
    return (done    ? `<span class="osu-done">${done}</span>` : '') +
           (current ? `<span class="osu-cur">${current}</span>` : '') +
           (rest    ? `<span class="osu-rest">${rest}</span>` : '');
  }

  // ─── Frame loop ─────────────────────────────────────────────
  _frame(ts) {
    if (!this.running) return;

    const now = Date.now();
    const circ = 2 * Math.PI * 36;

    // iterate over a snapshot so _miss() can safely splice this.circles
    for (const c of [...this.circles]) {
      const frac = Math.min(1, (now - c.born) / c.lifetime);
      const ringEl = document.getElementById(`osu-ring-fg-${c.id}`);
      if (ringEl) ringEl.style.strokeDashoffset = circ * frac;

      // Pulse ring red when < 30% left
      const el = document.getElementById(`osu-circle-${c.id}`);
      if (el) {
        const urgent = frac > 0.7;
        el.classList.toggle('osu-urgent', urgent);
        el.classList.toggle('osu-active', c.id === this.activeId);
      }

      // Expired
      if (frac >= 1) {
        this._miss(c);
      }
    }

    this.raf = requestAnimationFrame(this._frameHandler);
  }

  // ─── Input ──────────────────────────────────────────────────
  _onKey(e) {
    if (!this.running) return;
    if (e.ctrlKey || e.altKey || e.metaKey) return;

    if (e.key === 'Escape') { this._finish(); return; }
    if (e.key === 'Backspace') {
      if (this.typed.length > 0) {
        this.typed = this.typed.slice(0, -1);
        this._updateInput();
        this._matchActive();
      }
      return;
    }
    if (e.key.length !== 1) return;

    e.preventDefault();
    const ch = e.key;

    // Find best matching circle (active has priority, else earliest to expire)
    const target = this._findTarget(ch);
    if (!target) {
      // Wrong key — flash input
      this.errorChars++;
      playError();
      this._flashInput();
      return;
    }

    this.activeId = target.id;
    this.typed   += ch;

    const typedLen = this.typed.length;
    const wordEl   = document.getElementById(`osu-word-${target.id}`);
    if (wordEl) wordEl.innerHTML = this._wordHtml(target.word, typedLen);

    playKeyClick();
    this.totalChars++;

    // Track key stats
    this.keyStats[ch] = this.keyStats[ch] || { correct: 0, wrong: 0 };
    this.keyStats[ch].correct++;

    if (this.typed === target.word) {
      this._hit(target);
    }

    this._updateInput();
    this._updateHUD();
  }

  _findTarget(ch) {
    if (!this.circles.length) return null;

    // Case 1: mid-word on an active circle
    if (this.activeId !== null) {
      const active = this.circles.find(c => c.id === this.activeId);
      if (active) {
        // correct next char?
        if (active.word[this.typed.length] === ch) return active;
        // wrong char → error (still locked on this circle)
        return null;
      }
      // active circle disappeared (missed) → reset and fall through
      this.activeId = null;
      this.typed    = '';
    }

    // Case 2: no active circle — match any circle whose FIRST char equals ch
    const candidates = this.circles.filter(c => c.word[0] === ch);
    if (!candidates.length) return null;
    // pick the most urgent (nearest deadline)
    candidates.sort((a, b) => (a.born + a.lifetime) - (b.born + b.lifetime));
    return candidates[0];
  }

  _matchActive() {
    if (!this.typed) { this.activeId = null; return; }
    const active = this.circles.find(c => c.id === this.activeId);
    if (active) {
      const wordEl = document.getElementById(`osu-word-${active.id}`);
      if (wordEl) wordEl.innerHTML = this._wordHtml(active.word, this.typed.length);
    }
  }

  _updateInput() {
    const el = document.getElementById('osu-typed');
    if (el) el.textContent = this.typed;
  }

  _flashInput() {
    const bar = this.container.querySelector('.osu-input-bar');
    if (!bar) return;
    bar.classList.add('osu-input-error');
    setTimeout(() => bar.classList.remove('osu-input-error'), 300);
  }

  // ─── Hit / Miss ─────────────────────────────────────────────
  _hit(circle) {
    const now     = Date.now();
    const frac    = (now - circle.born) / circle.lifetime;
    const timing  = 1 - frac; // 0=late, 1=perfect
    const pts     = Math.round(100 * timing * (1 + this.combo * 0.05));

    this.score += pts;
    this.combo++;
    this.maxCombo = Math.max(this.maxCombo, this.combo);
    this.hits++;

    // Burst animation
    const el = document.getElementById(`osu-circle-${circle.id}`);
    if (el) {
      el.classList.add('osu-burst');
      setTimeout(() => el.remove(), 400);
    }

    playSuccess();
    this._floatPoints(circle, '+' + pts, timing > 0.6 ? 'perfect' : timing > 0.3 ? 'good' : 'ok');
    this._removeCircle(circle.id);
    this.activeId = null;
    this.typed    = '';
    this._updateInput();
    this._updateHUD();
  }

  _miss(circle) {
    this.misses++;
    this.combo = 0;
    this.livesLeft = Math.max(0, this.livesLeft - 1);

    const el = document.getElementById(`osu-circle-${circle.id}`);
    if (el) {
      el.classList.add('osu-miss');
      setTimeout(() => el.remove(), 500);
    }

    if (circle.id === this.activeId) {
      this.activeId = null;
      this.typed    = '';
      this._updateInput();
    }

    playError();
    this._removeCircle(circle.id);
    this._updateHUD();

    if (this.livesLeft <= 0) {
      setTimeout(() => this._finish(), 600);
    }
  }

  _removeCircle(id) {
    const idx = this.circles.findIndex(c => c.id === id);
    if (idx !== -1) this.circles.splice(idx, 1);
  }

  _floatPoints(circle, text, type) {
    const field = document.getElementById('osu-field');
    if (!field) return;
    const el = document.createElement('div');
    el.className    = `osu-float-pts osu-float-${type}`;
    el.textContent  = text;
    el.style.left   = circle.x + 'px';
    el.style.top    = (circle.y - 30) + 'px';
    field.appendChild(el);
    setTimeout(() => el.remove(), 900);
  }

  // ─── HUD ────────────────────────────────────────────────────
  _updateHUD() {
    const $ = id => document.getElementById(id);
    const speed = this._calcSpeed();
    const acc   = this._calcAccuracy();
    if ($('osu-lives'))  $('osu-lives').textContent  = '♥ '.repeat(Math.max(0, this.livesLeft)).trim() || '☠️';
    if ($('osu-score'))  $('osu-score').textContent  = this.score;
    if ($('osu-combo'))  $('osu-combo').textContent  = 'x' + Math.max(1, this.combo);
    if ($('osu-acc'))    $('osu-acc').textContent    = acc;
    if ($('osu-wpm'))    $('osu-wpm').textContent    = speed;
    this.onChange({ speed, accuracy: acc });
  }

  _calcSpeed() {
    if (!this.startTime) return 0;
    const mins = (Date.now() - this.startTime) / 60000;
    return mins > 0 ? Math.round(this.totalChars / mins) : 0;
  }

  _calcAccuracy() {
    const total = this.totalChars + this.errorChars;
    if (total === 0) return 100;
    return Math.round((this.totalChars / total) * 100);
  }

  // ─── Finish ─────────────────────────────────────────────────
  _finish() {
    if (!this.running) return;
    this.running = false;
    if (this.raf)         cancelAnimationFrame(this.raf);
    if (this._spawnTimer) clearTimeout(this._spawnTimer);
    if (this._clockTimer) clearInterval(this._clockTimer);
    document.removeEventListener('keydown', this._keyHandler);
    clearHighlights();

    this.onFinish({
      mode:     'osu',
      speed:    this._calcSpeed(),
      accuracy: this._calcAccuracy(),
      chars:    this.totalChars,
      errors:   this.misses,
      score:    this.score,
      maxCombo: this.maxCombo,
      duration: Date.now() - this.startTime,
      keyStats: this.keyStats,
      lang:     this.lang,
      gameover: this.livesLeft <= 0,
    });
  }
}


// ===== js/app.js =====














// ─── State ────────────────────────────────────────────────────────────
let profile = {};      // loaded after auth in startApp()
let settings = {};     // loaded after auth in startApp()
let currentMode = null;
let currentPage = 'home';
let _currentModeName = null;  // current game mode name (for ghost tracking)

// ─── Boot ─────────────────────────────────────────────────────────────
function boot() {
  initAuth(); // show login/register modal if not authenticated
}

async function initAuth() {
  await waitForAuth();
  const authModal = document.getElementById('auth-modal');
  if (!authModal) return;

  if (isLoggedIn()) {
    // Already have a session — continue straight to app
    try {
      await startApp(getCurrentUser(), getCurrentUserDisplayName());
    } catch (err) {
      document.body.innerHTML = `<div style="color:#e74c3c;padding:32px;font-family:monospace;white-space:pre-wrap;font-size:14px"><b>Ошибка запуска:</b>\n${err && err.stack ? err.stack : String(err)}</div>`;
    }
    return;
  }

  // Show auth screen (blocks app)
  authModal.classList.add('visible');

  // Tab switching
  authModal.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      authModal.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const isLogin = tab.dataset.tab === 'login';
      authModal.querySelector('#auth-form-login').style.display = isLogin ? '' : 'none';
      authModal.querySelector('#auth-form-register').style.display = isLogin ? 'none' : '';
    });
  });

  // Login form
  authModal.querySelector('#auth-form-login').addEventListener('submit', async e => {
    e.preventDefault();
    const name = document.getElementById('login-name').value;
    const pass = document.getElementById('login-pass').value;
    const errEl = document.getElementById('login-error');
    const submitBtn = authModal.querySelector('#auth-form-login button[type="submit"]');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Вход…'; }
    const res = await loginUser(name, pass);
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Войти'; }
    if (!res.ok) { errEl.textContent = res.error; return; }
    errEl.textContent = '';
    authModal.classList.remove('visible');
    await startApp(getCurrentUser(), res.user.displayName);
  });

  // Register form
  authModal.querySelector('#auth-form-register').addEventListener('submit', async e => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const pass = document.getElementById('reg-pass').value;
    const pass2 = document.getElementById('reg-pass2').value;
    const errEl = document.getElementById('reg-error');
    const submitBtn = authModal.querySelector('#auth-form-register button[type="submit"]');
    if (pass !== pass2) { errEl.textContent = 'Пароли не совпадают'; return; }
    // Show loading state while server checks uniqueness
    errEl.textContent = '';
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Проверка…'; }
    const res = await registerUser(name, pass);
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Создать аккаунт'; }
    if (!res.ok) { errEl.textContent = res.error; return; }
    errEl.textContent = '';
    authModal.classList.remove('visible');
    await startApp(getCurrentUser(), res.user.displayName);
  });
}

async function startApp(username, displayName) {
  try {
  // Namespace all localStorage keys under this user
  setUserStorage(username);

  // Load persisted data from Firestore (cross-device sync)
  await loadDataFromFirestore(username);

  // Reload profile/settings after namespacing
  profile = loadProfile();

  // Always sync display name from auth (source of truth)
  profile.name = displayName || profile.name || username;
  saveProfile({ name: profile.name });

  settings = loadSettings();

  // Bind logout button
  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      if (!confirm('Выйти из аккаунта?')) return;
      await logoutUser();
      // Reset storage namespace and reload the page to show auth again
      window.location.reload();
    });
  }

  // Bind profile pill click to open profile editor
  const profilePill = document.querySelector('.profile-pill');
  if (profilePill) {
    profilePill.addEventListener('click', e => {
      if (e.target.closest('#btn-logout')) return; // don't open modal on logout click
      openProfileModal();
    });
  }

  initAchievements();
  applyTheme();
  initAudio();
  updateAudioSettings(settings);
  initKeyboardPanel();
  bindNav();
  bindSettings();
  bindHomeButtons();
  updateProfileDisplay();
  updateLeaderboardNavState();

  // Check admin/banned status from server (async, non-blocking)
  refreshUserStatus().then(status => {
    if (!status) return;
    if (status.banned) {
      // Force logout — user was banned
      showToast('Ваш аккаунт заблокирован администратором.');
      setTimeout(() => { logoutUser(); location.reload(); }, 2500);
      return;
    }
    // Show admin nav if applicable
    const adminNavBtn = document.getElementById('nav-admin');
    if (adminNavBtn) adminNavBtn.style.display = status.admin ? '' : 'none';
  });

  showPage('home');
  } catch (err) {
    document.body.innerHTML = `<div style="color:#e74c3c;padding:32px;font-family:monospace;white-space:pre-wrap;font-size:14px;background:#0d1117"><b>Ошибка запуска TypeMaster:</b>\n${err && err.stack ? err.stack : String(err)}</div>`;
  }
}


function bindHomeButtons() {
  // Mode cards — all go through difficulty picker
  document.querySelectorAll('.mode-card[data-mode]').forEach(card => {
    card.addEventListener('click', () => {
      showDifficultyPicker(card.dataset.mode);
    });
  });

  // Universal difficulty picker buttons
  const diffModal = document.getElementById('diff-modal');
  if (diffModal) {
    diffModal.querySelectorAll('.spheres-diff-btn[data-diff]').forEach(btn => {
      btn.addEventListener('click', () => {
        diffModal.classList.remove('visible');
        const mode = diffModal.dataset.mode;
        let extraOpts = {};
        try { extraOpts = JSON.parse(diffModal.dataset.extraOpts || '{}'); } catch (_) {}
        const opts = { lang: settings.lang || 'ru', difficulty: btn.dataset.diff, ...extraOpts };
        if (mode === 'code') {
          startGame('classic', { ...opts, codeMode: true });
        } else {
          startGame(mode, opts);
        }
      });
    });
    diffModal.querySelector('#diff-modal-cancel')?.addEventListener('click', () => {
      diffModal.classList.remove('visible');
    });
    diffModal.addEventListener('click', e => {
      if (e.target === diffModal) diffModal.classList.remove('visible');
    });
  }

  // Quick start — all go through difficulty picker
  document.getElementById('btn-quick-classic')?.addEventListener('click', () =>
    showDifficultyPicker('sprint')
  );
  document.getElementById('btn-custom-text')?.addEventListener('click', openCustomTextModal);
  document.getElementById('btn-quick-marathon')?.addEventListener('click', () =>
    showDifficultyPicker('marathon')
  );
  document.getElementById('btn-continue-level')?.addEventListener('click', () => {
    const lvl = getLevelById(profile.level || 1);
    if (lvl) startGame('classic', { level: lvl, duration: lvl.duration || 60, wordCount: lvl.wordCount || 50, lang: settings.lang || 'ru' });
    else startGame('classic', { lang: settings.lang || 'ru' });
  });

  // Finger legend
  const legendEl = document.getElementById('finger-legend');
  if (legendEl) renderFingerLegend(legendEl);

  // Language toggle buttons on home page
  document.querySelectorAll('.btn-lang[data-lang]').forEach(btn => {
    // Set initial active state
    btn.classList.toggle('active', btn.dataset.lang === (settings.lang || 'ru'));
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      settings.lang = lang;
      profile.lang = lang;
      setKbLang(lang);
      saveProfile({ lang });
      saveSettings(settings);
      document.querySelectorAll('.btn-lang').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
      // sync settings select
      const langSelect = document.getElementById('set-lang');
      if (langSelect) langSelect.value = lang;
    });
  });
}

// Per-mode difficulty descriptions for the picker
const DIFF_PICKER_INFO = {
  classic: {
    icon: '📝', name: 'Классика',
    easy:   '90 сек · короткие слова',
    medium: '60 сек · обычные слова',
    hard:   '45 сек · длинные слова',
    _startOpts: {}
  },
  sprint: {
    icon: '▶', name: 'Спринт (60 сек)',
    easy:   '60 сек · короткие слова',
    medium: '60 сек · обычные слова',
    hard:   '60 сек · длинные слова',
    _mode: 'classic', _startOpts: { duration: 60 }
  },
  marathon: {
    icon: '📖', name: 'Марафон (200 слов)',
    easy:   '200 слов · короткие слова',
    medium: '200 слов · обычные слова',
    hard:   '200 слов · длинные слова',
    _mode: 'classic', _startOpts: { wordCount: 200, duration: 999 }
  },
  rated: {
    icon: '⭐', name: 'Рейтинговая игра',
    easy:   '90 сек · короткие слова · +рейтинг',
    medium: '60 сек · обычные слова · +рейтинг',
    hard:   '45 сек · длинные слова · +рейтинг',
    _mode: 'classic', _startOpts: { duration: 60, rated: true }
  },
  falling: {
    icon: '🎮', name: 'Падающие слова',
    easy:   '7 жизней · медленно',
    medium: '5 жизней · стандарт',
    hard:   '3 жизни · быстро',
  },
  zombie: {
    icon: '🧟', name: 'Зомби-атака',
    easy:   '5 жизней · медленные зомби',
    medium: '3 жизни · стандарт',
    hard:   '1 жизнь · быстрые зомби',
  },
  osu: {
    icon: '🔮', name: 'Сферы',
    easy:   '7 жизней · сферы медленнее',
    medium: '5 жизней · стандартный темп',
    hard:   '3 жизни · быстро и жёстко',
  },
  code: {
    icon: '💻', name: 'Режим кода',
    easy:   '90 сек · ключевые слова JS/Python',
    medium: '60 сек · API, функции, паттерны',
    hard:   '45 сек · продвинутый синтаксис',
  },
};

function showDifficultyPicker(pickerName) {
  const modal = document.getElementById('diff-modal');
  if (!modal) return;
  const info = DIFF_PICKER_INFO[pickerName] || { icon: '🎮', name: pickerName, easy: '', medium: '', hard: '' };
  // Store the actual game mode and extra start opts in the modal
  modal.dataset.mode = info._mode || pickerName;
  modal.dataset.extraOpts = JSON.stringify(info._startOpts || {});
  const title = modal.querySelector('#diff-modal-title');
  if (title) title.textContent = `${info.icon} ${info.name}`;
  ['easy', 'medium', 'hard'].forEach(d => {
    const desc = modal.querySelector(`#diff-${d}-desc`);
    if (desc) desc.textContent = info[d] || '';
  });
  modal.classList.add('visible');
}

// ─── Navigation ───────────────────────────────────────────────────────
function bindNav() {
  document.querySelectorAll('[data-nav]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      showPage(el.dataset.nav);
    });
  });
}

function showPage(page) {
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active');
    p.style.display = '';
  });
  const target = document.getElementById('page-' + page);
  if (target) target.classList.add('active');

  document.querySelectorAll('[data-nav]').forEach(el => {
    el.classList.toggle('active', el.dataset.nav === page);
  });

  // Stop any running game when leaving
  if (page !== 'game') {
    stopCurrentMode();
    // Restore keyboard to user's preferred language when leaving game
    setKbLang(settings.lang || 'ru');
  }

  currentPage = page;

  // Show/hide global keyboard panel
  const kbSection = document.getElementById('global-keyboard-section');
  if (kbSection) {
    const showKb = page === 'home' || page === 'game';
    kbSection.style.display = showKb ? '' : 'none';
  }

  if (page === 'stats') renderStatsPage(document.getElementById('stats-container'), settings.lang || 'ru', isVip(), profile);
  if (page === 'levels') renderLevelsPage();
  if (page === 'achievements') renderAchievementsPage();
  if (page === 'leaderboard') renderLeaderboardPage();
  if (page === 'home') renderHomePage();
  if (page === 'guide') renderGuidePage();
  if (page === 'admin') renderAdminPage();
}

// ─── Keyboard Panel ───────────────────────────────────────────────────
function initKeyboardPanel() {
  const kbEl = document.getElementById('virtual-keyboard');
  if (!kbEl) return;
  initKeyboard(kbEl, settings.lang || 'ru', settings);

  // Keyboard toggle button
  const kbSection = document.getElementById('global-keyboard-section');
  const toggleBtn  = document.getElementById('kb-toggle-btn');
  if (kbSection && toggleBtn) {
    // Restore saved state
    const hidden = localStorage.getItem('tm_kb_hidden') === '1';
    if (hidden) {
      kbSection.classList.add('kb-hidden');
      toggleBtn.textContent = '⌨ Показать клавиатуру';
    }
    toggleBtn.addEventListener('click', () => {
      const isHidden = kbSection.classList.toggle('kb-hidden');
      toggleBtn.textContent = isHidden ? '⌨ Показать клавиатуру' : '⬆ Скрыть клавиатуру';
      localStorage.setItem('tm_kb_hidden', isHidden ? '1' : '0');
    });
  }
}

// ─── Settings ─────────────────────────────────────────────────────────
function bindSettings() {
  const panel = document.getElementById('settings-panel');
  if (!panel) return;

  // Populate current values
  ['blind-mode', 'sound', 'color-zones', 'show-hints'].forEach(id => {
    const el = document.getElementById('set-' + id);
    if (!el) return;
    const key = id.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    const settingKey = { blindMode: 'blindMode', sound: 'sound', colorZones: 'colorZones', showHints: 'showFingerHints' }[key] || key;
    el.checked = settings[settingKey] ?? true;
  });

  const langSelect = document.getElementById('set-lang');
  if (langSelect) langSelect.value = settings.lang || 'ru';

  const musicVol = document.getElementById('set-music-vol');
  if (musicVol) musicVol.value = (settings.musicVolume || 0.2) * 100;

  const sfxVol = document.getElementById('set-sfx-vol');
  if (sfxVol) sfxVol.value = (settings.sfxVolume || 0.5) * 100;

  // Listeners
  const handleSettingsEvent = e => {
    const id = e.target.id;
    resumeAudioContext();
    if (id === 'set-blind-mode') {
      settings.blindMode = e.target.checked;
      setBlindMode(e.target.checked);
    }
    if (id === 'set-sound') settings.sound = e.target.checked;
    if (id === 'set-color-zones') { settings.colorZones = e.target.checked; setColorZones(e.target.checked); }
    if (id === 'set-show-hints') settings.showFingerHints = e.target.checked;
    if (id === 'set-lang') {
      settings.lang = e.target.value;
      profile.lang = e.target.value;
      setKbLang(e.target.value);
      saveProfile({ lang: e.target.value });
      // sync home page language buttons
      document.querySelectorAll('.btn-lang').forEach(b => b.classList.toggle('active', b.dataset.lang === e.target.value));
    }
    if (id === 'set-music-vol') settings.musicVolume = e.target.value / 100;
    if (id === 'set-sfx-vol') settings.sfxVolume = e.target.value / 100;
    saveSettings(settings);
    updateAudioSettings(settings);
  };
  panel.addEventListener('change', handleSettingsEvent);
  panel.addEventListener('input', handleSettingsEvent);

  // Themes section (available to all)
  {
    const vipThemeSection = document.createElement('div');
    vipThemeSection.className = 'settings-section';
    const VIP_THEMES = [
      { id: 'dark',    label: '🌑', title: 'По умолчанию' },
      { id: 'neon',    label: '🔵', title: 'Неон' },
      { id: 'rose',    label: '🌸', title: 'Rose Gold' },
      { id: 'galaxy',  label: '🌌', title: 'Галактика' },
      { id: 'emerald', label: '🌿', title: 'Изумруд' },
    ];
    vipThemeSection.innerHTML = `
      <h3 class="settings-group-title">🌈 Темы оформления</h3>
      <div class="vip-theme-grid">
        ${VIP_THEMES.map(t => `<button class="vip-theme-btn${(settings.theme||'dark')===t.id?' active':''}" data-theme="${t.id}" title="${t.title}">${t.label}<br><span>${t.title}</span></button>`).join('')}
      </div>`;
    panel.appendChild(vipThemeSection);
    vipThemeSection.querySelectorAll('.vip-theme-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const oldTheme = settings.theme || 'dark';
        document.body.classList.remove('theme-' + oldTheme);
        settings.theme = btn.dataset.theme;
        saveSettings(settings);
        document.body.classList.add('theme-' + settings.theme);
        vipThemeSection.querySelectorAll('.vip-theme-btn').forEach(b => b.classList.toggle('active', b.dataset.theme === settings.theme));
      });
    });
  }
}

// ─── Game Control ─────────────────────────────────────────────────────
function stopCurrentMode() {
  if (currentMode) {
    // Save a partial session if the user typed at least 10 characters
    if ((currentMode.totalChars || 0) >= 10 && currentMode.startTime) {
      try {
        const partialResult = {
          mode:     currentMode.modeName || 'classic',
          speed:    typeof currentMode._calcSpeed    === 'function' ? currentMode._calcSpeed()    : 0,
          accuracy: typeof currentMode._calcAccuracy === 'function' ? currentMode._calcAccuracy() : 100,
          chars:    currentMode.totalChars  || 0,
          errors:   currentMode.errors || currentMode.misses || 0,
          duration: Date.now() - currentMode.startTime,
          keyStats: currentMode.keyStats || {},
          lang:     currentMode.lang || 'ru',
          partial:  true
        };
        saveSession(partialResult);
      } catch (_) {}
    }
    currentMode.unmount();
    currentMode = null;
  }
  stopMusic();
}

function startGame(modeName, opts = {}) {
  resumeAudioContext();
  showPage('game');
  stopCurrentMode();
  _currentModeName = (modeName === 'classic' && opts.codeMode) ? 'code'
                   : (modeName === 'classic' && opts.customWords)  ? 'custom'
                   : modeName;

  // Load ghost for this mode and update topbar widget
  const ghostBests = storage.get('ghost_bests', {});
  const ghostSpeed = ghostBests[_currentModeName] || 0;
  const ghostWidget = document.getElementById('ghost-widget');
  const ghostValEl  = document.getElementById('ghost-topbar-val');
  const ghostDeltaEl = document.getElementById('ghost-topbar-delta');
  if (ghostWidget) {
    if (ghostSpeed > 0) {
      ghostWidget.style.display = '';
      if (ghostValEl) ghostValEl.textContent = ghostSpeed;
      if (ghostDeltaEl) { ghostDeltaEl.textContent = ''; ghostDeltaEl.className = 'ghost-delta'; }
    } else {
      ghostWidget.style.display = 'none';
    }
  }

  const container = document.getElementById('game-field');
  if (!container) return;

  const lang = opts.codeMode ? 'en' : (opts.lang || settings.lang || 'ru');
  const level = opts.level || null;

  // Sync on-screen keyboard language to the game's language
  setKbLang(lang);

  const modeOpts = {
    container,
    lang,
    level,
    onFinish: result => onGameFinish(result),
    onChange: ({ speed }) => {
      if (speed > 0) {
        const bpm = Math.max(60, Math.min(180, 60 + speed / 2));
        // updateMusicBPM(bpm); // adaptive music
      }
      // Update ghost delta in topbar
      if (ghostSpeed > 0 && ghostDeltaEl) {
        const d = speed - ghostSpeed;
        ghostDeltaEl.textContent = (d >= 0 ? '+' : '') + d;
        ghostDeltaEl.className = 'ghost-delta ' + (d >= 0 ? 'ghost-pos' : 'ghost-neg');
      }
    }
  };

  if (modeName === 'classic') currentMode = new ClassicMode({ ...modeOpts, duration: opts.duration, wordCount: opts.wordCount, difficulty: opts.difficulty || 'medium', codeMode: opts.codeMode || false, customWords: opts.customWords || null, ghostSpeed });
  else if (modeName === 'falling') currentMode = new FallingMode({ ...modeOpts, difficulty: opts.difficulty || 'medium' });
  else if (modeName === 'zombie') currentMode = new ZombieMode({ ...modeOpts, difficulty: opts.difficulty || 'medium' });
  else if (modeName === 'osu') currentMode = new OsuMode({ ...modeOpts, difficulty: opts.difficulty || 'medium', duration: opts.duration || 90 });

  if (currentMode) {
    currentMode.mount();
    startMusic(80);

    // Update game header
    const modeNames = { classic: '📝 Классика', falling: '🎮 Падающие слова', zombie: '🧟 Зомби-атака', osu: '🔮 Сферы' };
    const diffLabels = { easy: '🟢 Легко', medium: '🟡 Средне', hard: '🔴 Сложно' };
    const titleEl = document.getElementById('game-mode-title');
    if (titleEl) {
        const diffLabel = opts.difficulty ? ` · ${diffLabels[opts.difficulty] || opts.difficulty}` : '';
        const codeLabel = opts.codeMode ? '💻 Режим кода' : (modeNames[modeName] || modeName);
        const customLabel = opts.customWords ? '📝 Свой текст' : null;
        titleEl.textContent = (customLabel || codeLabel) + diffLabel;
    }

  }
}

function onGameFinish(result) {
  stopMusic();
  if (currentMode) { currentMode.unmount(); currentMode = null; }

  // Spheres game-over: instantly go to home menu (no result screen)
  if (result.gameover === true) {
    saveSession(result);
    const updatedProfile = { ...profile, totalChars: (profile.totalChars || 0) + (result.chars || 0), totalErrors: (profile.totalErrors || 0) + (result.errors || 0), totalSessions: (profile.totalSessions || 0) + 1 };
    saveProfile(updatedProfile);
    profile = updatedProfile;
    showPage('home');
    return;
  }

  // Build updated profile base
  const updatedProfile = {
    ...profile,
    totalChars: (profile.totalChars || 0) + (result.chars || 0),
    totalErrors: (profile.totalErrors || 0) + (result.errors || 0),
    totalSessions: (profile.totalSessions || 0) + 1,
    bestSpeed: Math.max(profile.bestSpeed || 0, result.speed || 0)
  };

  saveSession(result);
  saveProfile(updatedProfile);
  profile = updatedProfile;
  updateLeaderboardNavState();
  updateProfileDisplay();

  const stats = loadStats();
  checkAchievements(stats, profile, result);
  playSuccess();

  result._modeName = _currentModeName;

  // Ghost + Quests
  try {
    if ((result.speed || 0) > 0 && _currentModeName) {
      storage.update('ghost_bests', cur => ({
        ...cur, [_currentModeName]: Math.max(cur[_currentModeName] || 0, result.speed)
      }), {});
    }
    result._streak    = stats.dailyStreak || 0;
    const { newlyCompleted } = updateQuestProgress(result);
    if (newlyCompleted && newlyCompleted.length > 0) {
      let totalReward = 0;
      newlyCompleted.forEach(q => { totalReward += q.reward || 0; });
      if (totalReward > 0) {
        profile.ratingPoints = Math.max(0, (profile.ratingPoints || 1000) + totalReward);
        saveProfile({ ratingPoints: profile.ratingPoints });
        updateProfileDisplay();
      }
      setTimeout(() => {
        newlyCompleted.forEach(q => showToast(`✅ Задание: «${q.label}» — +${q.reward}⭐`));
      }, 600);
    }
  } catch (_) {}

  showResultModal(result);
}

function showResultModal(result) {
  const modal = document.getElementById('result-modal');
  if (!modal) return;

  modal.querySelector('#rm-speed').textContent = result.speed;
  modal.querySelector('#rm-accuracy').textContent = result.accuracy;
  modal.querySelector('#rm-chars').textContent = result.chars || 0;
  modal.querySelector('#rm-errors').textContent = result.errors || 0;
  const dur = Math.round((result.duration || 0) / 1000);
  modal.querySelector('#rm-time').textContent = dur + 'с';

  const grade = result.accuracy >= 98 ? 'S' : result.accuracy >= 95 ? 'A' : result.accuracy >= 85 ? 'B' : result.accuracy >= 70 ? 'C' : 'D';
  const gradeEl = modal.querySelector('#rm-grade');
  if (gradeEl) { gradeEl.textContent = grade; gradeEl.className = 'rm-grade grade-' + grade; }

  modal.classList.add('visible');

  // Key heatmap
  const heatmapContainer = modal.querySelector('#rm-heatmap');
  if (heatmapContainer) renderKeyHeatmap(result.keyStats, heatmapContainer);
}

// ─── Key heatmap renderer ─────────────────────────────────────────────
function renderKeyHeatmap(keyStats, container) {
  if (!keyStats || !Object.keys(keyStats).length) { container.innerHTML = ''; return; }
  const lang = (settings && settings.lang) || 'ru';
  const layout = KEYBOARD_LAYOUTS[lang];
  if (!layout) return;

  const rows = layout.rows.slice(1, 4); // rows 1-3 = main letter rows
  container.innerHTML = `
    <div class="heatmap-section">
      <div class="heatmap-title">🔥 Анализ клавиш</div>
      <div class="heatmap-kb">
        ${rows.map(row => `
          <div class="heatmap-row">
            ${row.map(key => {
              const k = key.toLowerCase();
              const stat = keyStats[k];
              if (!stat || stat.hits === 0) return `<span class="hm-key hm-untouched" title="${k}">${k}</span>`;
              const errRate = stat.errors / (stat.hits || 1);
              const cls = errRate >= 0.25 ? 'hm-bad' : errRate >= 0.08 ? 'hm-ok' : 'hm-good';
              const pct = Math.round(errRate * 100);
              return `<span class="hm-key ${cls}" title="${k}: ${stat.hits} наж., ${stat.errors} ош. (${pct}%)">${k}</span>`;
            }).join('')}
          </div>`).join('')}
      </div>
      <div class="heatmap-legend">
        <span class="hm-leg hm-good-bg"></span> Хорошо &nbsp;
        <span class="hm-leg hm-ok-bg"></span> Проблемы &nbsp;
        <span class="hm-leg hm-bad-bg"></span> Ошибки
      </div>
    </div>`;
}

// ─── Custom Text Modal ────────────────────────────────────────────────
function openCustomTextModal() {
  const modal = document.getElementById('custom-text-modal');
  if (!modal) return;
  const input = document.getElementById('custom-text-input');
  if (input) input.value = '';

  // Recent texts
  const recents = storage.get('custom_texts', []);
  const recentsEl = document.getElementById('custom-text-recents');
  if (recentsEl) {
    recentsEl.innerHTML = recents.length
      ? '<div class="custom-text-recents-label">Недавние:</div>' +
        recents.slice(0, 4).map((t, i) =>
          `<button class="custom-text-recent-btn" data-ri="${i}">${t.substring(0, 70)}${t.length > 70 ? '…' : ''}</button>`
        ).join('')
      : '';
    recentsEl.querySelectorAll('[data-ri]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (input) input.value = recents[parseInt(btn.dataset.ri)];
      });
    });
  }

  modal.classList.add('visible');
  setTimeout(() => input?.focus(), 100);

  document.getElementById('custom-text-cancel')?.addEventListener('click', () => modal.classList.remove('visible'), { once: true });
  document.getElementById('custom-text-start')?.addEventListener('click', () => {
    const text = (input?.value || '').trim();
    const words = text.split(/\s+/).filter(Boolean);
    if (words.length < 3) { showToast('Введи хотя бы 3 слова'); return; }
    // Save to recents
    const updated = [text, ...storage.get('custom_texts', []).filter(t => t !== text)].slice(0, 5);
    storage.set('custom_texts', updated);
    modal.classList.remove('visible');
    startGame('classic', { customWords: words, duration: 120, lang: settings.lang || 'ru' });
  }, { once: true });
}

function showToast(msg, duration = 3500) {
  let toast = document.getElementById('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.style.cssText = [
      'position:fixed', 'bottom:24px', 'left:50%', 'transform:translateX(-50%)',
      'background:var(--surface,#1e1e2e)', 'color:var(--text,#cdd6f4)',
      'padding:12px 24px', 'border-radius:8px', 'font-size:14px',
      'box-shadow:0 4px 20px rgba(0,0,0,.4)', 'z-index:9999',
      'transition:opacity .3s', 'pointer-events:none'
    ].join(';');
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => { toast.style.opacity = '0'; }, duration);
}

document.addEventListener('click', e => {
  if (e.target.closest('#result-modal .rm-close') || e.target.id === 'result-modal') {
    document.getElementById('result-modal')?.classList.remove('visible');
  }
  if (e.target.id === 'rm-play-again') {
    document.getElementById('result-modal')?.classList.remove('visible');
    const gameField = document.getElementById('game-field');
    if (gameField) {
      // Find last mode from HUD title
      const title = document.getElementById('game-mode-title')?.textContent || '';
      const mode = title.includes('Зомби') ? 'zombie' : title.includes('Паде') ? 'falling' : 'classic';
      startGame(mode, { lang: settings.lang });
    }
  }
  if (e.target.id === 'rm-to-menu') {
    document.getElementById('result-modal')?.classList.remove('visible');
    showPage('home');
  }
  if (e.target.id === 'game-stop-btn') {
    stopCurrentMode();
    showPage('home');
  }
});

// ─── Levels Page ──────────────────────────────────────────────────────
function renderLevelsPage() {
  const container = document.getElementById('levels-container');
  if (!container) return;
  const curLevel = profile.level || 1;

  container.innerHTML = `
    <div class="levels-grid">
      ${LEVELS.map(lvl => {
        const unlocked = lvl.id <= curLevel;
        const completed = lvl.id < curLevel;
        const current = lvl.id === curLevel;
        return `<div class="level-card ${completed ? 'lc-done' : current ? 'lc-current' : (unlocked ? 'lc-open' : 'lc-locked')}" data-level="${lvl.id}">
          <div class="lc-num">${lvl.id}</div>
          <div class="lc-name">${lvl.title}</div>
          <div class="lc-desc">${lvl.description}</div>
          <div class="lc-req">${lvl.minSpeed} зн/мин · ${lvl.minAccuracy}% точность</div>
          ${unlocked ? `<button class="btn-play-level" data-level="${lvl.id}">▶ Играть</button>` : '<div class="lc-lock">🔒</div>'}
        </div>`;
      }).join('')}
    </div>`;

  container.querySelectorAll('.btn-play-level').forEach(btn => {
    btn.addEventListener('click', () => {
      const lvl = getLevelById(parseInt(btn.dataset.level));
      startGame('classic', { level: lvl, duration: lvl.duration || 60, wordCount: lvl.wordCount || 50, lang: settings.lang });
    });
  });
}

// ─── Achievements Page ────────────────────────────────────────────────
function renderAchievementsPage() {
  const container = document.getElementById('achievements-container');
  if (!container) return;
  const unlocked = new Set(getUnlockedList().map(a => a.id));

  container.innerHTML = `
    <div class="achievements-grid">
      ${ACHIEVEMENTS.map(a => `
        <div class="ach-card ${unlocked.has(a.id) ? 'ach-unlocked' : 'ach-locked'}">
          <div class="ach-icon">${unlocked.has(a.id) ? a.icon : '🔒'}</div>
          <div class="ach-name">${a.name}</div>
          <div class="ach-desc">${a.desc}</div>
        </div>`).join('')}
    </div>`;
}
// ─── Leaderboard Page ────────────────────────────────────────────────────
async function renderLeaderboardPage() {
  const container = document.getElementById('leaderboard-container');
  if (!container) return;
  await renderLeaderboard(container, getCurrentUser(), profile.level || 1);
}

function updateLeaderboardNavState() {
  // Leaderboard is always unlocked
  const lbBtn = document.getElementById('nav-leaderboard');
  if (lbBtn) {
    lbBtn.classList.remove('nav-btn-locked');
    lbBtn.title = '';
  }
  // ── Admin nav ───────────────────────────────────────────────
  const adminNavBtn = document.getElementById('nav-admin');
  if (adminNavBtn) adminNavBtn.style.display = isAdmin() ? '' : 'none';
}
// ─── Home Page ────────────────────────────────────────────────────────
function renderHomePage() {
  const stats = loadStats();
  const sessions = stats.sessions || [];
  const bestSpeed = sessions.length ? Math.max(...sessions.map(s => s.speed || 0)) : 0;
  const el = id => document.getElementById(id);
  if (el('home-best-speed')) el('home-best-speed').textContent = bestSpeed;
  if (el('home-sessions')) el('home-sessions').textContent = sessions.length;
  if (el('home-level')) el('home-level').textContent = profile.level || 1;
  if (el('home-streak')) el('home-streak').textContent = (stats.dailyStreak || 0) + ' 🔥';

  // Daily quests panel
  const questsEl = document.getElementById('home-quests');
  if (questsEl) renderQuestsPanel(questsEl);

  // Fill hero panel (right side of hero) — theme switcher
  {
    const vipBlock = el('home-hero-vip');
    if (vipBlock) {
      const currentTheme = settings.theme || 'dark';

      vipBlock.innerHTML = `
        <div class="home-theme-card">
          <div class="htc-header">
            <span class="htc-label">🌈 Тема</span>
            <button class="htc-edit-btn" id="hvip-edit-btn" title="Редактировать профиль">⚙️</button>
          </div>
          <div class="htc-btns" id="hvip-theme-btns">
            ${[
              { id:'dark', e:'🌑', n:'Тёмная' },
              { id:'neon', e:'🔵', n:'Неон' },
              { id:'rose', e:'🌸', n:'Rose' },
              { id:'galaxy', e:'🌌', n:'Галактика' },
              { id:'emerald', e:'🌿', n:'Изумруд' }
            ].map(t => `<button class="htc-dot${t.id === currentTheme ? ' active' : ''}" data-theme="${t.id}" title="${t.n}">${t.e}<span>${t.n}</span></button>`).join('')}
          </div>
        </div>`;

      vipBlock.querySelector('#hvip-edit-btn')?.addEventListener('click', () => openProfileModal());
      vipBlock.querySelectorAll('.htc-dot').forEach(btn => {
        btn.addEventListener('click', () => {
          const old = settings.theme || 'dark';
          document.body.classList.remove('theme-' + old);
          settings.theme = btn.dataset.theme;
          saveSettings(settings);
          document.body.classList.add('theme-' + settings.theme);
          vipBlock.querySelectorAll('.htc-dot').forEach(b => b.classList.toggle('active', b.dataset.theme === settings.theme));
          document.querySelectorAll('.vip-theme-btn').forEach(b => b.classList.toggle('active', b.dataset.theme === settings.theme));
        });
      });
    }
  }
}

function updateProfileDisplay() {
  const nameEl = document.getElementById('profile-name');
  if (nameEl) nameEl.textContent = profile.name || 'Игрок';
  const levelEl = document.getElementById('profile-level');
  if (levelEl) levelEl.textContent = 'Уровень ' + (profile.level || 1);
  const avatarEl = document.getElementById('profile-avatar');
  if (avatarEl) {
    const userData = getCurrentUserData();
    const emoji = userData?.avatarEmoji;
    const avatarUrl = userData?.avatarUrl;
    if (avatarUrl) {
      avatarEl.innerHTML = `<img src="${avatarUrl}" alt="avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%" onerror="this.parentElement.textContent='${emoji || (profile.name||'I')[0].toUpperCase()}'" />`;
    } else {
      avatarEl.textContent = emoji || (profile.name || 'Игрок')[0].toUpperCase();
    }
    // gradient border
    {
      const grad = getCurrentUserData()?.avatarGradient;
      if (grad && grad.from && grad.to) {
        avatarEl.style.background = '';
        avatarEl.style.boxShadow = `0 0 0 3px transparent`;
        avatarEl.style.border = `3px solid transparent`;
        avatarEl.style.backgroundImage = `linear-gradient(var(--bg2), var(--bg2)), linear-gradient(135deg, ${grad.from}, ${grad.to})`;
        avatarEl.style.backgroundOrigin = 'border-box';
        avatarEl.style.backgroundClip = 'padding-box, border-box';
      } else {
        avatarEl.style.backgroundImage = '';
        avatarEl.style.border = '';
      }
    }
  }
  // VIP badge hidden (all users get VIP perks)
  const vipBadgeEl = document.getElementById('profile-vip-pill-badge');
  if (vipBadgeEl) vipBadgeEl.style.display = 'none';
}

// ─── Profile Edit Modal ───────────────────────────────────────────────
const PROFILE_EMOJIS = [
  '🎮','👾','🤖','👑','🔥','⚡','🌟','🎯','🏹','🎵',
  '🧠','👻','🦊','🐉','🌙','💎','🚀','🎲','🌈','⚔️',
  '🧙','🦸','🐺','🦋','🍀','🎸','🏆','🎪','🦄','🌊',
];

function openProfileModal() {
  const modal = document.getElementById('profile-modal');
  if (!modal) return;

  const userData = getCurrentUserData() || {};

  // Populate avatar preview
  const preview = document.getElementById('profile-edit-avatar-preview');
  let selectedEmoji = userData.avatarEmoji || null;
  const refreshPreview = (overrideUrl) => {
    if (!preview) return;
    const url = overrideUrl !== undefined ? overrideUrl : (getCurrentUserData()?.avatarUrl || null);
    if (url) {
      preview.innerHTML = `<img src="${url}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block" onerror="this.parentElement.textContent='${selectedEmoji || (profile.name||'?')[0].toUpperCase()}'" />`;
    } else {
      preview.innerHTML = '';
      preview.textContent = selectedEmoji || (profile.name || 'Игрок')[0].toUpperCase();
    }
  };
  refreshPreview();

  // Build emoji picker
  const picker = document.getElementById('profile-emoji-picker');
  if (picker) {
    picker.innerHTML = '';
    // Clear (revert to letter) button
    const clearBtn = document.createElement('button');
    clearBtn.className = 'profile-emoji-btn clear-btn' + (selectedEmoji === null ? ' selected' : '');
    clearBtn.title = 'Сброс (первая буква имени)';
    clearBtn.textContent = 'Аа';
    clearBtn.addEventListener('click', () => {
      selectedEmoji = null;
      picker.querySelectorAll('.profile-emoji-btn').forEach(b => b.classList.remove('selected'));
      clearBtn.classList.add('selected');
      refreshPreview();
      updateUserMeta({ avatarEmoji: null });
      updateProfileDisplay();
    });
    picker.appendChild(clearBtn);

    PROFILE_EMOJIS.forEach(emoji => {
      const btn = document.createElement('button');
      btn.className = 'profile-emoji-btn' + (selectedEmoji === emoji ? ' selected' : '');
      btn.textContent = emoji;
      btn.addEventListener('click', () => {
        selectedEmoji = emoji;
        picker.querySelectorAll('.profile-emoji-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        refreshPreview();
        updateUserMeta({ avatarEmoji: emoji });
        updateProfileDisplay();
      });
      picker.appendChild(btn);
    });
  }

  // Pre-fill bio
  const bioInput = document.getElementById('profile-edit-bio');
  if (bioInput) bioInput.value = userData.bio || '';

  // Pre-fill name
  const nameInput = document.getElementById('profile-edit-newname');
  if (nameInput) nameInput.value = profile.name || '';

  // Clear password fields & errors
  ['profile-edit-name-pass','profile-edit-curpass','profile-edit-newpass','profile-edit-newpass2'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  ['profile-bio-error','profile-name-error','profile-pass-error'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });

  // Show modal
  modal.classList.add('visible');

  // Close on overlay click
  const overlayHandler = e => { if (e.target === modal) { modal.classList.remove('visible'); modal.removeEventListener('click', overlayHandler); } };
  modal.addEventListener('click', overlayHandler);

  // Close button
  const closeBtn = document.getElementById('profile-modal-close');
  if (closeBtn) {
    const closeFn = () => { modal.classList.remove('visible'); closeBtn.removeEventListener('click', closeFn); };
    closeBtn.onclick = closeFn;
  }

  // Save bio
  const saveBioBtn = document.getElementById('profile-save-bio');
  if (saveBioBtn) {
    saveBioBtn.onclick = () => {
      const errEl = document.getElementById('profile-bio-error');
      const res = updateUserMeta({ bio: bioInput?.value || '' });
      if (res.ok) {
        if (errEl) { errEl.className = 'profile-edit-success'; errEl.textContent = '✓ Сохранено'; setTimeout(() => { errEl.textContent = ''; errEl.className = 'auth-error'; }, 2000); }
      }
    };
  }

  // Save display name
  const saveNameBtn = document.getElementById('profile-save-name');
  if (saveNameBtn) {
    saveNameBtn.onclick = async () => {
      const errEl = document.getElementById('profile-name-error');
      const newName = document.getElementById('profile-edit-newname')?.value || '';
      const pass = document.getElementById('profile-edit-name-pass')?.value || '';
      if (errEl) { errEl.textContent = ''; errEl.className = 'auth-error'; }
      const res = await updateDisplayName(newName, pass);
      if (!res.ok) { if (errEl) errEl.textContent = res.error; return; }
      // Update profile name
      profile.name = res.displayName;
      saveProfile({ name: profile.name });
      updateProfileDisplay();
      // Re-auth WS with new display name
      wsAuth(getCurrentUser(), profile.name, profile.ratingPoints || 1000);
      if (errEl) { errEl.className = 'profile-edit-success'; errEl.textContent = '✓ Имя изменено'; setTimeout(() => { errEl.textContent = ''; errEl.className = 'auth-error'; }, 2500); }
      // Clear password field
      const passField = document.getElementById('profile-edit-name-pass');
      if (passField) passField.value = '';
    };
  }

  // Save password
  const savePassBtn = document.getElementById('profile-save-pass');
  if (savePassBtn) {
    savePassBtn.onclick = async () => {
      const errEl = document.getElementById('profile-pass-error');
      const cur = document.getElementById('profile-edit-curpass')?.value || '';
      const nw = document.getElementById('profile-edit-newpass')?.value || '';
      const nw2 = document.getElementById('profile-edit-newpass2')?.value || '';
      if (errEl) { errEl.textContent = ''; errEl.className = 'auth-error'; }
      if (nw !== nw2) { if (errEl) errEl.textContent = 'Пароли не совпадают'; return; }
      const res = await updatePassword(cur, nw);
      if (!res.ok) { if (errEl) errEl.textContent = res.error; return; }
      if (errEl) { errEl.className = 'profile-edit-success'; errEl.textContent = '✓ Пароль изменён'; setTimeout(() => { errEl.textContent = ''; errEl.className = 'auth-error'; }, 2500); }
      ['profile-edit-curpass','profile-edit-newpass','profile-edit-newpass2'].forEach(id => {
        const el = document.getElementById(id); if (el) el.value = '';
      });
    };
  }

  // Customization section
  const vipSection = document.getElementById('profile-vip-section');
  if (vipSection) {
    vipSection.innerHTML = `
      <div class="profile-edit-group">
        <label class="profile-edit-label">🖼 Аватар — вставь URL картинки</label>
        <input type="text" id="profile-vip-avatar-url" class="profile-edit-input" placeholder="https://i.imgur.com/abc.png" value="${userData.avatarUrl || ''}" />
        <div class="auth-error" id="profile-vip-avatar-error"></div>
        <button class="btn btn-accent" id="profile-save-vip-avatar" style="margin-top:8px;width:100%">💾 Сохранить аватар</button>
      </div>
      <div class="profile-edit-group">
        <label class="profile-edit-label">🎨 Градиентная рамка аватара</label>
        <div class="vip-gradient-presets" id="vip-grad-presets">
          <div class="vip-grad-swatch" data-from="#58a6ff" data-to="#0d6efd" title="Синий" style="background:linear-gradient(135deg,#58a6ff,#0d6efd)"></div>
          <div class="vip-grad-swatch" data-from="#bf5af2" data-to="#8829cc" title="Фиолетовый" style="background:linear-gradient(135deg,#bf5af2,#8829cc)"></div>
          <div class="vip-grad-swatch" data-from="#f0c040" data-to="#e08800" title="Золото" style="background:linear-gradient(135deg,#f0c040,#e08800)"></div>
          <div class="vip-grad-swatch" data-from="#ff6b9d" data-to="#cc3366" title="Розовый" style="background:linear-gradient(135deg,#ff6b9d,#cc3366)"></div>
          <div class="vip-grad-swatch" data-from="#2ecc71" data-to="#1a8a4a" title="Зелёный" style="background:linear-gradient(135deg,#2ecc71,#1a8a4a)"></div>
          <div class="vip-grad-swatch" data-from="#ff9f43" data-to="#ee5a24" title="Оранжевый" style="background:linear-gradient(135deg,#ff9f43,#ee5a24)"></div>
          <div class="vip-grad-swatch" data-from="#00f5ff" data-to="#0099aa" title="Неон" style="background:linear-gradient(135deg,#00f5ff,#0099aa)"></div>
          <div class="vip-grad-swatch" data-from="#ff4444" data-to="#aa0000" title="Красный" style="background:linear-gradient(135deg,#ff4444,#aa0000)"></div>
          <div class="vip-grad-swatch vip-grad-none" data-from="" data-to="" title="Без рамки" style="background:var(--bg4)">✕</div>
        </div>
      </div>
      <div class="profile-edit-group">
        <label class="profile-edit-label">🌈 Тема оформления</label>
        <div class="vip-theme-grid" id="vip-modal-theme-grid">
          ${[
            {id:'dark',e:'🌑',name:'Тёмная'},
            {id:'neon',e:'🔵',name:'Неон'},
            {id:'rose',e:'🌸',name:'Rose Gold'},
            {id:'galaxy',e:'🌌',name:'Галактика'},
            {id:'emerald',e:'🌿',name:'Изумруд'},
          ].map(t=>`<button class="vip-theme-btn${(settings.theme||'dark')===t.id?' active':''}" data-theme="${t.id}">${t.e}<br><span>${t.name}</span></button>`).join('')}
        </div>
      </div>`;
    // Gradient swatch wiring
    vipSection.querySelectorAll('.vip-grad-swatch').forEach(sw => {
      const saved = getCurrentUserData()?.avatarGradient;
      if (saved && sw.dataset.from === saved.from && sw.dataset.to === saved.to) sw.classList.add('selected');
      if (!saved && !sw.dataset.from) sw.classList.add('selected');
      sw.addEventListener('click', () => {
        vipSection.querySelectorAll('.vip-grad-swatch').forEach(s => s.classList.remove('selected'));
        sw.classList.add('selected');
        const grad = sw.dataset.from ? { from: sw.dataset.from, to: sw.dataset.to } : null;
        updateUserMeta({ avatarGradient: grad });
        updateProfileDisplay();
      });
    });
    // Theme picker wiring
    vipSection.querySelectorAll('.vip-theme-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const old = settings.theme || 'dark';
        document.body.classList.remove('theme-' + old);
        settings.theme = btn.dataset.theme;
        saveSettings(settings);
        document.body.classList.add('theme-' + settings.theme);
        vipSection.querySelectorAll('.vip-theme-btn').forEach(b => b.classList.toggle('active', b.dataset.theme === settings.theme));
        document.querySelectorAll('.hvip-theme-dot').forEach(b => b.classList.toggle('active', b.dataset.theme === settings.theme));
        document.querySelectorAll('#vip-theme-grid .vip-theme-btn').forEach(b => b.classList.toggle('active', b.dataset.theme === settings.theme));
      });
    });
    // Avatar URL live preview + save
    const avatarUrlInput = vipSection.querySelector('#profile-vip-avatar-url');
    if (avatarUrlInput) {
      avatarUrlInput.addEventListener('input', () => refreshPreview(avatarUrlInput.value.trim() || null));
      avatarUrlInput.addEventListener('paste', () => setTimeout(() => refreshPreview(avatarUrlInput.value.trim() || null), 50));
    }
    vipSection.querySelector('#profile-save-vip-avatar')?.addEventListener('click', () => {
      const url = (vipSection.querySelector('#profile-vip-avatar-url')?.value || '').trim();
      const errEl = vipSection.querySelector('#profile-vip-avatar-error');
      const res = updateUserMeta({ avatarUrl: url });
      if (res.ok) {
        updateProfileDisplay();
        refreshPreview(url || null);
        if (errEl) { errEl.className = 'profile-edit-success'; errEl.textContent = '✓ Аватар обновлён'; setTimeout(() => { errEl.textContent = ''; errEl.className = 'auth-error'; }, 2000); }
      }
    });
  }
}

function applyTheme() {
  document.body.classList.add('theme-' + (settings.theme || 'dark'));
}

// ─── Guide Page ──────────────────────────────────────────────────────
function renderGuidePage() {
  const container = document.getElementById('guide-container');
  if (!container) return;

  const lang = settings.lang || 'ru';
  const layout = KEYBOARD_LAYOUTS[lang];
  const zones  = FINGER_ZONES[lang] || {};

  // Left-hand fingers: indices 0-3; Right: 4-7
  const leftFingers = [
    { idx: 0, label: 'Мизинец', keys: lang === 'ru' ? 'Ф / Й / А / Я' : 'A / Q / Z' },
    { idx: 1, label: 'Безымянный', keys: lang === 'ru' ? 'Ы / Ц / С / Ч' : 'S / W / X' },
    { idx: 2, label: 'Средний', keys: lang === 'ru' ? 'В / У / М / И' : 'D / E / C' },
    { idx: 3, label: 'Указательный', keys: lang === 'ru' ? 'А/П/Е/К/Н/Г/Т/И/Р' : 'F/G/R/T/V/B' },
  ];
  const rightFingers = [
    { idx: 4, label: 'Указательный', keys: lang === 'ru' ? 'О/Л/Г/Н/Р/О/Ь/Б' : 'H/J/Y/U/N/M' },
    { idx: 5, label: 'Средний', keys: lang === 'ru' ? 'Д / Ш / Т' : 'K / I / ,' },
    { idx: 6, label: 'Безымянный', keys: lang === 'ru' ? 'Ж / Щ / И' : 'L / O / .' },
    { idx: 7, label: 'Мизинец', keys: lang === 'ru' ? 'Э / З / Х / Ъ' : '; / P / [ / /' },
  ];

  function fingerHtml(f, side) {
    return `<div class="guide-finger">
      <div class="gf-knuckle" style="--fc:${FINGER_COLORS[f.idx]}"></div>
      <div class="gf-label" style="--fc:${FINGER_COLORS[f.idx]}">${f.label}</div>
      <div class="gf-keys">${f.keys}</div>
    </div>`;
  }

  // Home row keys for the chosen layout
  const homeRu = [
    { k:'ф', fi:0 },{ k:'ы', fi:1 },{ k:'в', fi:2 },{ k:'а', fi:3 },{ k:'п', fi:3 },
    { k:'р', fi:4 },{ k:'о', fi:4 },{ k:'л', fi:5 },{ k:'д', fi:6 },{ k:'ж', fi:7 },
  ];
  const homeEn = [
    { k:'a', fi:0 },{ k:'s', fi:1 },{ k:'d', fi:2 },{ k:'f', fi:3 },{ k:'g', fi:3 },
    { k:'h', fi:4 },{ k:'j', fi:4 },{ k:'k', fi:5 },{ k:'l', fi:6 },{ k:';', fi:7 },
  ];
  const homeRow = lang === 'ru' ? homeRu : homeEn;
  const anchorKeys = lang === 'ru' ? ['а','о'] : ['f','j'];

  function homeKeyHtml(entry) {
    const isAnchor = anchorKeys.includes(entry.k);
    return `<div class="ghr-key${isAnchor ? ' ghr-anchor' : ''}" style="color:${FINGER_COLORS[entry.fi]};border-color:${FINGER_COLORS[entry.fi]}">
      ${entry.k.toUpperCase()}${isAnchor ? '<span class="ghr-dot"></span>' : ''}
    </div>`;
  }

  // Build colored keyboard rows (rows 1-3 only — letters)
  function buildKbRows(rows, rowZones) {
    const rowClasses = ['gkb-row-1','gkb-row-2','gkb-row-3'];
    return rows.slice(1, 4).map((row, ri) => {
      const keys = row.map(k => {
        const fi = rowZones[k.toLowerCase()] ?? 8;
        const isAnchor = anchorKeys.includes(k.toLowerCase());
        return `<div class="gkb-key${isAnchor ? ' gkb-anchor' : ''}" style="color:${FINGER_COLORS[fi]};border-color:${FINGER_COLORS[fi]};background:var(--bg3)">
          ${k.toUpperCase()}${isAnchor ? '<span class="gkb-dot" style="background:${FINGER_COLORS[fi]}"></span>' : ''}
        </div>`;
      }).join('');
      return `<div class="gkb-row ${rowClasses[ri]}">${keys}</div>`;
    }).join('');
  }

  const kbRows = buildKbRows(layout.rows, zones);

  container.innerHTML = `
    <div class="guide-page">
      <h2 class="guide-title">🖐 Инструкция по слепой печати</h2>

      <!-- Положение рук -->
      <div class="guide-section">
        <h3>Положение рук и пальцев</h3>
        <p class="guide-note">
          Держи руки над клавиатурой незацепленно. <b>Левая рука</b> — пальцы на «Ф Ы В А» (или A S D F).
          <b>Правая рука</b> — на «Р О Л Д» (или H J K L). Большие пальцы — на пробеле.
        </p>
        <div class="guide-hands-row">
          <div class="guide-hand-block">
            <div class="guide-hand-title">✋ Левая рука</div>
            <div class="guide-hand">
              ${leftFingers.map(f => fingerHtml(f,'left')).join('')}
            </div>
          </div>
          <div class="guide-hand-block">
            <div class="guide-hand-title">🤚 Правая рука</div>
            <div class="guide-hand guide-hand-right">
              ${rightFingers.map(f => fingerHtml(f,'right')).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- Стартовая позиция -->
      <div class="guide-section">
        <h3>Стартовая (домашняя) позиция</h3>
        <p class="guide-note">
          Клавиши с <b>точкой</b> — твои опорные клавиши. Всегда возвращай пальцы сюда после каждого нажатия.
        </p>
        <div class="guide-homerow">
          <div class="guide-homerow-set">
            <div class="ghr-label">${lang === 'ru' ? 'Русская раскладка' : 'English layout'}</div>
            <div class="ghr-keys">${homeRow.map(e => homeKeyHtml(e)).join('')}</div>
          </div>
        </div>
      </div>

      <!-- Клавиатура с цветовыми зонами -->
      <div class="guide-section">
        <h3>Цветовая карта клавиатуры (${lang === 'ru' ? 'RU' : 'EN'})</h3>
        <p class="guide-note">Каждый цвет соответствует одному пальцу. Нажимай клавишу только «своим» пальцем.</p>
        <div class="gkb">${kbRows}</div>
        <div class="gkb-legend">
          ${FINGER_NAMES.slice(0,8).map((name, i) =>
            `<div class="gkb-legend-item"><span class="gkb-legend-dot" style="background:${FINGER_COLORS[i]}"></span>${name}</div>`
          ).join('')}
        </div>
      </div>

      <!-- Основные правила -->
      <div class="guide-section">
        <h3>Основные правила</h3>
        <div class="guide-rules">
          <div class="guide-rule"><span class="gr-icon">👀</span><div><div class="gr-title">Не смотри на клавиши</div><div class="gr-text">Тренируй мышечную память — смотри только на экран.</div></div></div>
          <div class="guide-rule"><span class="gr-icon">🏠</span><div><div class="gr-title">Возвращай пальцы</div><div class="gr-text">После каждого нажатия возвращай пальцы в домашнюю позицию.</div></div></div>
          <div class="guide-rule"><span class="gr-icon">🐢</span><div><div class="gr-title">Сначала точность</div><div class="gr-text">Лучше медленно и без ошибок, чем быстро и с опечатками.</div></div></div>
          <div class="guide-rule"><span class="gr-icon">🖐</span><div><div class="gr-title">Правильный палец</div><div class="gr-text">Каждая клавиша закреплена за конкретным пальцем — следуй карте цветов.</div></div></div>
          <div class="guide-rule"><span class="gr-icon">😌</span><div><div class="gr-title">Не напрягайся</div><div class="gr-text">Руки должны быть расслаблены, запястья — не лежать на столе.</div></div></div>
          <div class="guide-rule"><span class="gr-icon">📅</span><div><div class="gr-title">Регулярность</div><div class="gr-text">15–20 минут ежедневно дают лучший результат, чем редкие длинные сессии.</div></div></div>
        </div>
      </div>

      <!-- Режимы игры -->
      <div class="guide-section">
        <h3>Режимы тренировки</h3>
        <div class="guide-rules">
          <div class="guide-rule"><span class="gr-icon">📝</span><div><div class="gr-title">Классика</div><div class="gr-text">Набери текст как можно быстрее и точнее. Основной режим для отработки навыка.</div></div></div>
          <div class="guide-rule"><span class="gr-icon">🌧</span><div><div class="gr-title">Падающие слова</div><div class="gr-text">Слова падают сверху — успей набрать до того, как долетят до земли.</div></div></div>
          <div class="guide-rule"><span class="gr-icon">🧟</span><div><div class="gr-title">Зомби</div><div class="gr-text">Защищай базу от нашествия зомби — набирай слова, чтобы их остановить.</div></div></div>
          <div class="guide-rule"><span class="gr-icon">⭐</span><div><div class="gr-title">Рейтинговый бой</div><div class="gr-text">Соревнуйся с другим игроком в реальном времени. Победитель получает рейтинг.</div></div></div>
        </div>
      </div>
    </div>`;
}

// ─── Admin Page ───────────────────────────────────────────────────────
async function renderAdminPage() {
  const container = document.getElementById('admin-panel-container');
  if (!container) return;
  if (!isAdmin()) {
    container.innerHTML = '<p style="color:var(--clr-danger)">Нет доступа.</p>';
    return;
  }

  container.innerHTML = '<p style="opacity:.6">Загрузка пользователей…</p>';
  const result = await getAdminUserList();
  if (!result.ok) {
    container.innerHTML = `<p style="color:var(--clr-danger)">${result.error || 'Ошибка'}</p>`;
    return;
  }

  const users = result.users || [];
  container.innerHTML = `
    <div class="admin-stats-row">
      <span>Всего: <b>${users.length}</b></span>
      <span>Заблокированных: <b>${users.filter(u => u.banned).length}</b></span>
      <span>Администраторов: <b>${users.filter(u => u.admin).length}</b></span>
    </div>
    <div class="admin-search-row">
      <input id="admin-search" class="admin-search-input" placeholder="🔍 Поиск по имени…" type="text"/>
    </div>
    <div class="admin-user-list" id="admin-user-list">
      ${users.map(u => `
        <div class="admin-user-row ${u.banned ? 'aur-banned' : ''}" data-username="${u.username}">
          <div class="aur-avatar">${u.displayName[0].toUpperCase()}</div>
          <div class="aur-info">
            <div class="aur-name">${u.displayName} ${u.admin ? '<span class="aur-badge aur-admin">🛡️ Админ</span>' : ''}${u.banned ? '<span class="aur-badge aur-ban">🚫 Бан</span>' : ''}</div>
            <div class="aur-sub">@${u.username} · Регистрация: ${u.createdAt ? new Date(u.createdAt).toLocaleDateString('ru') : '—'}</div>
          </div>
          <div class="aur-actions">
            ${!u.admin ? `
              <button class="btn btn-sm ${u.banned ? 'btn-accent' : 'btn-danger'} aur-ban-btn"
                data-target="${u.uid}" data-name="${u.displayName}" data-ban="${u.banned ? '0' : '1'}">
                ${u.banned ? '✅ Разбанить' : '🚫 Забанить'}
              </button>` : ''}
          </div>
        </div>`).join('')}
    </div>`;

  // Search filter
  const searchEl = document.getElementById('admin-search');
  if (searchEl) {
    searchEl.addEventListener('input', () => {
      const q = searchEl.value.toLowerCase();
      container.querySelectorAll('.admin-user-row').forEach(row => {
        const name = (row.dataset.username || '').toLowerCase();
        row.style.display = name.includes(q) ? '' : 'none';
      });
    });
  }

  // Ban / unban buttons
  container.querySelectorAll('.aur-ban-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const target = btn.dataset.target;
      const name = btn.dataset.name || target;
      const ban = btn.dataset.ban === '1';
      btn.disabled = true;
      btn.textContent = '…';
      const res = await banUser(target, ban);
      if (res.ok) {
        showToast(ban ? `${name} забанен.` : `${name} разбанен.`);
        renderAdminPage(); // refresh
      } else {
        showToast(res.error || 'Ошибка', 'error');
        btn.disabled = false;
        btn.textContent = ban ? '🚫 Забанить' : '✅ Разбанить';
      }
    });
  });
}

// ─── Finger legend ────────────────────────────────────────────────────
function renderFingerLegend(container) {
  container.innerHTML = FINGER_NAMES.map((name, i) => `
    <div class="finger-legend-item">
      <span class="fl-dot" style="background:${FINGER_COLORS[i]}"></span>
      <span>${name}</span>
    </div>`).join('');
}



// ===== entry point =====
document.addEventListener('DOMContentLoaded', () => boot());
