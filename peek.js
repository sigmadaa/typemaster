const fs = require('fs');
const s = fs.readFileSync('bundle.js', 'utf8');
const lines = s.split('\n');

console.log('--- updateAudioSettings ---');
lines.forEach((l, i) => {
  if (l.includes('updateAudioSettings')) console.log((i+1) + ': ' + l.trim());
});

console.log('--- updateSettings ---');
lines.forEach((l, i) => {
  if (l.includes('updateSettings')) console.log((i+1) + ': ' + l.trim());
});

console.log('--- ReferenceError candidates (called but never defined) ---');
const defined = new Set();
const called = [];
lines.forEach((l, i) => {
  const defM = l.match(/^function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/);
  if (defM) defined.add(defM[1]);
  const callM = l.match(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g);
  if (callM) callM.forEach(c => called.push([c.replace(/\s*\($/, ''), i+1]));
});
