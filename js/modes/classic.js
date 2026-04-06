import { setNextKey, clearHighlights, onPhysicalKey } from '../keyboard.js';
import { playKeyClick, playError } from '../audio.js';
import { WORDS } from '../data/words.js';

// Difficulty presets (used when no level is active)
const CLASSIC_DIFF = {
  easy:   { duration: 90,  wordCount: 30, maxWordLen: 5 },
  medium: { duration: 60,  wordCount: 50, maxWordLen: 999 },
  hard:   { duration: 45,  wordCount: 70, minWordLen: 5 },
};

// Classic monkeytype-style mode
export class ClassicMode {
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
