import { clearHighlights, setNextKey } from '../keyboard.js';
import { playKeyClick, playError, playSuccess } from '../audio.js';
import { WORDS } from '../data/words.js';

// Difficulty presets
const ZOMBIE_DIFF = {
  easy:   { lives: 5, baseSpeed: 5,  waveIncrement: 1.0, baseSpawnRate: 3500, minSpawnRate: 1500 },
  medium: { lives: 3, baseSpeed: 6,  waveIncrement: 1.5, baseSpawnRate: 3000, minSpawnRate: 1000 },
  hard:   { lives: 1, baseSpeed: 10, waveIncrement: 2.2, baseSpawnRate: 2200, minSpawnRate:  600 },
};

// Zombie arcade mode — words advance toward the player
export class ZombieMode {
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
