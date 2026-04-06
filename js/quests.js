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

export function getDailyQuests() {
  const today = _todayStr();
  const saved = storage.get('daily_quests', null);
  if (saved && saved.date === today) return saved.quests;

  const seed = today.split('').reduce((a, c, i) => a + c.charCodeAt(0) * (i + 1), 0);
  const picked = _seededPick(seed, QUEST_TEMPLATES, 3);
  const quests = picked.map(t => ({ ...t, progress: 0, completed: false }));
  storage.set('daily_quests', { date: today, quests });
  return quests;
}

export function updateQuestProgress(result) {
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

export function renderQuestsPanel(container) {
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
