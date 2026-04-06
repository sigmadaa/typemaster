const fs = require('fs');
const lines = fs.readFileSync('bundle.js','utf8').split('\n');
lines.forEach((l, i) => {
  if (/^\s*import\b/.test(l) || /\bfrom\s+['"]/.test(l)) {
    console.log((i+1) + ': ' + l.trim());
  }
});
