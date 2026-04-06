import { loadAchievements, unlockAchievement } from './storage.js';
import { playAchievement } from './audio.js';

export const ACHIEVEMENTS = [
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

export function initAchievements() {
  _unlocked = loadAchievements();
}

export function isUnlocked(id) {
  return !!_unlocked[id];
}

export function getUnlockedList() {
  return ACHIEVEMENTS.filter(a => _unlocked[a.id]).map(a => ({
    ...a,
    unlockedAt: _unlocked[a.id]?.date
  }));
}

export function checkAchievements(stats, profile, sessionData) {
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
