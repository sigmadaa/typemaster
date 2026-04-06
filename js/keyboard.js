import { KEYBOARD_LAYOUTS, FINGER_COLORS, FINGER_ZONES } from './data/words.js';

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

export function initKeyboard(container, lang = 'ru', settings = {}) {
  _container = container;
  _lang = lang;
  _blindMode = settings.blindMode || false;
  _colorZones = settings.colorZones !== false;
  renderKeyboard();
}

export function setKbLang(lang) {
  _lang = lang;
  renderKeyboard();
}

export function setBlindMode(v) {
  _blindMode = v;
  if (!_container) return;
  _container.querySelectorAll('.key-label').forEach(el => {
    el.style.opacity = v ? '0' : '1';
  });
}

export function setColorZones(v) {
  _colorZones = v;
  renderKeyboard();
}

export function highlightKey(key, type) {
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

export function setNextKey(key) {
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

export function clearHighlights() {
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
export function onPhysicalKey(keyEvent, expectedChar) {
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
