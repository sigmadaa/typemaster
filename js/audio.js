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

export function updateAudioSettings(s) {
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

export function initAudio() {
  // Lazy init
}

// ─── Keypress click — soft, quiet "tick" like a low-profile keyboard
export function playKeyClick() {
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
export function playError() {
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
export function playSuccess() {
  if (!_audioSettings.sound) return;
  const notes   = [523, 659, 784, 1047]; // C5 E5 G5 C6
  const delays  = [0, 0.09, 0.18, 0.30];
  notes.forEach((freq, i) => playPluck(freq, 0.32, delays[i], 0.5));
}

// ─── Achievement — ascending pentatonic sparkle
export function playAchievement() {
  if (!_audioSettings.sound) return;
  const notes  = [523, 659, 784, 880, 1047, 1319]; // C E G A C E
  const delays = [0, 0.07, 0.14, 0.21, 0.30, 0.40];
  notes.forEach((freq, i) => playPluck(freq, 0.30, delays[i], 0.55));
}

// ─── Countdown beep — soft sine ping
export function playBeep(high = false) {
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

export function startMusic(bpm = 80) {
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

export function updateMusicBPM(bpm) {
  if (musicBPM === bpm) return;
  musicBPM = bpm;
  if (musicInterval) { clearInterval(musicInterval); startMusic(bpm); }
}

export function stopMusic() {
  if (musicInterval) { clearInterval(musicInterval); musicInterval = null; }
}

export function resumeAudioContext() {
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
