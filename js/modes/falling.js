import { clearHighlights, setNextKey } from '../keyboard.js';
import { playKeyClick, playError, playSuccess } from '../audio.js';
import { WORDS } from '../data/words.js';

// Difficulty presets
const FALLING_DIFF = {
  easy:   { lives: 7, baseSpawn: 3200, minSpawn: 1800, baseSpeed: 0.02, maxSpeed: 0.05 },
  medium: { lives: 5, baseSpawn: 2500, minSpawn: 1200, baseSpeed: 0.03, maxSpeed: 0.08 },
  hard:   { lives: 3, baseSpawn: 1800, minSpawn:  700, baseSpeed: 0.045, maxSpeed: 0.14 },
};

// ZType-style falling words arcade mode
export class FallingMode {
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
