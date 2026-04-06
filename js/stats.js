import { loadStats } from './storage.js';
import { FINGER_COLORS, FINGER_ZONES } from './data/words.js';

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
export function renderStatsPage(container, lang = 'ru', isVip = true, profile = {}) {
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
        <span class="stats-vip-tag">💎 VIP</span>
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
    if (r3) drawBarChart(r3, dayLabels, dayAvgs, '#f0c040', 'зн/мин');

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

