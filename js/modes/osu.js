import { clearHighlights } from '../keyboard.js';
import { playKeyClick, playError, playSuccess } from '../audio.js';
import { WORDS } from '../data/words.js';

// Difficulty presets
const SPHERE_DIFF = {
  easy:   { lives: 7, baseLifetime: 8000, minLifetime: 5000, maxCircles: 3, baseSpawn: 3200, minSpawn: 2000, accel: 15 },
  medium: { lives: 5, baseLifetime: 5500, minLifetime: 3000, maxCircles: 4, baseSpawn: 2200, minSpawn: 1300, accel: 28 },
  hard:   { lives: 3, baseLifetime: 3200, minLifetime: 1600, maxCircles: 5, baseSpawn: 1300, minSpawn: 700,  accel: 45 },
};

// Сферы mode: circles appear on screen with countdown, type the word to hit them
export class OsuMode {
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
