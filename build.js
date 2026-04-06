const fs = require('fs'), path = require('path');
const base = path.join(__dirname);

function strip(src) {
  // Remove import lines
  src = src.replace(/^import\s+\{[^}]+\}\s+from\s+['"][^'"]+['"]\s*;?\s*$/gm, '');
  src = src.replace(/^import\s+[^'"]+from\s+['"][^'"]+['"]\s*;?\s*$/gm, '');
  // Remove 'export' prefix from declarations (keep function/class/const/let/var)
  src = src.replace(/^export\s+(async\s+function|function|class|const|let|var)\s+/gm, '$1 ');
  // Remove export { ... } blocks
  src = src.replace(/^export\s+\{[^}]+\}\s*;?\s*$/gm, '');
  return src;
}

const fileOrder = [
  'js/data/words.js',
  'js/data/levels.js',
  'js/storage.js',
  'js/quests.js',
  'js/auth.js',
  'js/audio.js',
  'js/keyboard.js',
  'js/achievements.js',
  'js/stats.js',
  'js/leaderboard.js',
  'js/ws.js',
  'js/modes/classic.js',
  'js/modes/falling.js',
  'js/modes/zombie.js',
  'js/modes/osu.js',
  'js/app.js'
];

let bundle = '"use strict";\n\n';
fileOrder.forEach(f => {
  const src = fs.readFileSync(path.join(base, f), 'utf8');
  bundle += '// ===== ' + f + ' =====\n';
  bundle += strip(src) + '\n\n';
});

bundle += '\n// ===== entry point =====\ndocument.addEventListener(\'DOMContentLoaded\', () => boot());\n';

fs.writeFileSync(path.join(base, 'bundle.js'), bundle);
console.log('bundle.js written:', bundle.length, 'bytes');
