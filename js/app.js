import { initKeyboard, setKbLang, setBlindMode, setColorZones } from './keyboard.js';
import { ClassicMode } from './modes/classic.js';
import { FallingMode } from './modes/falling.js';
import { ZombieMode } from './modes/zombie.js';
import { OsuMode } from './modes/osu.js';
import { renderStatsPage } from './stats.js';
import { initAchievements, checkAchievements, ACHIEVEMENTS, getUnlockedList } from './achievements.js';
import { renderLeaderboard, isLeaderboardUnlocked } from './leaderboard.js';

import {
  loadProfile, saveProfile, loadStats, saveSession,
  loadSettings, saveSettings, setUserStorage
} from './storage.js';
import {
  getCurrentUser, getCurrentUserDisplayName, isLoggedIn,
  loginUser, registerUser, logoutUser,
  getCurrentUserData, updateUserMeta, updateDisplayName, updatePassword,
  isVip, activateVip, getVipInfo,
  isAdmin, refreshUserStatus, banUser, getAdminUserList, activateAdmin
} from './auth.js';
import {
  initAudio, updateAudioSettings,
  playSuccess, playBeep, resumeAudioContext, startMusic, stopMusic
} from './audio.js';
import { LEVELS, getLevelById, getMaxLevel } from './data/levels.js';
import { FINGER_COLORS, FINGER_NAMES, KEYBOARD_LAYOUTS, FINGER_ZONES } from './data/words.js';

import { getDailyQuests, updateQuestProgress, renderQuestsPanel } from './quests.js';

// ─── State ────────────────────────────────────────────────────────────
let profile = {};      // loaded after auth in startApp()
let settings = {};     // loaded after auth in startApp()
let currentMode = null;
let currentPage = 'home';
let _currentModeName = null;  // current game mode name (for ghost tracking)

// ─── Boot ─────────────────────────────────────────────────────────────
export function boot() {
  initAuth(); // show login/register modal if not authenticated
}

function initAuth() {
  const authModal = document.getElementById('auth-modal');
  if (!authModal) return;

  if (isLoggedIn()) {
    // Already have a session — continue straight to app
    startApp(getCurrentUser(), getCurrentUserDisplayName());
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
  authModal.querySelector('#auth-form-login').addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('login-name').value;
    const pass = document.getElementById('login-pass').value;
    const errEl = document.getElementById('login-error');
    const res = loginUser(name, pass);
    if (!res.ok) { errEl.textContent = res.error; return; }
    errEl.textContent = '';
    authModal.classList.remove('visible');
    startApp(getCurrentUser(), res.user.displayName);
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
    startApp(getCurrentUser(), res.user.displayName);
  });
}

function startApp(username, displayName) {
  // Namespace all localStorage keys under this user
  setUserStorage(username);

  // Reload profile/settings after namespacing
  profile = loadProfile();

  // Always sync display name from auth (source of truth)
  profile.name = displayName || profile.name || username;
  saveProfile({ name: profile.name });

  settings = loadSettings();

  // Bind logout button
  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (!confirm('Выйти из аккаунта?')) return;
      logoutUser();
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

export function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
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

export function startGame(modeName, opts = {}) {
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
function renderLeaderboardPage() {
  const container = document.getElementById('leaderboard-container');
  if (!container) return;
  renderLeaderboard(container, getCurrentUser(), profile.level || 1);
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
        <div class="home-vip-card">
          <div class="hvip-shimmer"></div>
          <div class="hvip-glow"></div>
          <div class="hvip-header">
            <div class="hvip-title-col">
              <div class="hvip-title">TypeMaster</div>
            </div>
            <button class="hvip-edit-btn" id="hvip-edit-btn" title="Редактировать профиль">⚙️</button>
          </div>
          <div class="hvip-divider"></div>
            <span class="hvip-theme-label">Тема:</span>
            <div class="hvip-theme-btns" id="hvip-theme-btns">
              ${[
                { id:'dark', e:'🌑', n:'Тёмная' },
                { id:'neon', e:'🔵', n:'Неон' },
                { id:'rose', e:'🌸', n:'Rose' },
                { id:'galaxy', e:'🌌', n:'Галактика' },
                { id:'emerald', e:'🌿', n:'Изумруд' }
              ].map(t => `<button class="hvip-theme-dot${t.id === currentTheme ? ' active' : ''}" data-theme="${t.id}" title="${t.n}">${t.e}</button>`).join('')}
            </div>
          </div>
        </div>`;

      vipBlock.querySelector('#hvip-edit-btn')?.addEventListener('click', () => openProfileModal());
      vipBlock.querySelectorAll('.hvip-theme-dot').forEach(btn => {
        btn.addEventListener('click', () => {
          const old = settings.theme || 'dark';
          document.body.classList.remove('theme-' + old);
          settings.theme = btn.dataset.theme;
          saveSettings(settings);
          document.body.classList.add('theme-' + settings.theme);
          vipBlock.querySelectorAll('.hvip-theme-dot').forEach(b => b.classList.toggle('active', b.dataset.theme === settings.theme));
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
    saveNameBtn.onclick = () => {
      const errEl = document.getElementById('profile-name-error');
      const newName = document.getElementById('profile-edit-newname')?.value || '';
      const pass = document.getElementById('profile-edit-name-pass')?.value || '';
      if (errEl) { errEl.textContent = ''; errEl.className = 'auth-error'; }
      const res = updateDisplayName(newName, pass);
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
    savePassBtn.onclick = () => {
      const errEl = document.getElementById('profile-pass-error');
      const cur = document.getElementById('profile-edit-curpass')?.value || '';
      const nw = document.getElementById('profile-edit-newpass')?.value || '';
      const nw2 = document.getElementById('profile-edit-newpass2')?.value || '';
      if (errEl) { errEl.textContent = ''; errEl.className = 'auth-error'; }
      if (nw !== nw2) { if (errEl) errEl.textContent = 'Пароли не совпадают'; return; }
      const res = updatePassword(cur, nw);
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
                data-target="${u.username}" data-ban="${u.banned ? '0' : '1'}">
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
      const ban = btn.dataset.ban === '1';
      btn.disabled = true;
      btn.textContent = '…';
      const res = await banUser(target, ban);
      if (res.ok) {
        showToast(ban ? `${target} забанен.` : `${target} разбанен.`);
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
export function renderFingerLegend(container) {
  container.innerHTML = FINGER_NAMES.map((name, i) => `
    <div class="finger-legend-item">
      <span class="fl-dot" style="background:${FINGER_COLORS[i]}"></span>
      <span>${name}</span>
    </div>`).join('');
}
