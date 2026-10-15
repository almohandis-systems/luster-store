const fs = require('node:fs');

const file = 'index.html';
if (!fs.existsSync(file)) {
  console.error('FAIL: index.html is missing.');
  process.exit(1);
}
const html = fs.readFileSync(file, 'utf8');
const scripts = [...html.matchAll(/<script\\b([^>]*)>([\\s\\S]*?)<\\/script\\s*>/gi)];
let syntaxErrors = 0;
let parsedCount = 0;

for (let i = 0; i < scripts.length; i++) {
  const attrs = scripts[i][1] || '';
  const code = scripts[i][2] || '';
  if (/type\\s*=\\s*["']application\\/(?:ld\\+json|json)["']/i.test(attrs)) continue;
  try {
    new Function(code);
    parsedCount++;
  } catch (error) {
    syntaxErrors++;
    console.error(`FAIL: inline script #${i + 1}: ${error.message}`);
  }
}

const blockers = [];
if (/allow\\s+read\\s*,\\s*create:\\s*if\\s+true\\s*;/i.test(html) &&
    /allow\\s+update\\s*,\\s*delete:\\s*if\\s+true\\s*;/i.test(html)) {
  blockers.push('Permissive Firestore rules template grants public order reads/writes.');
}
if (/getOwnerPin\\(\\)\\s*\\{[\\s\\S]{0,220}?\\|\\|\\s*['"]2222['"]/i.test(html)) {
  blockers.push('Owner PIN has a hard-coded default in client-side code.');
}
if (/oldEntered\\s*===\\s*['"]2222['"]|oldEntered\\s*===\\s*['"]0846['"]/i.test(html)) {
  blockers.push('Owner PIN change accepts hard-coded bypass values.');
}

console.log(`Parsed ${parsedCount} inline JavaScript blocks; found ${syntaxErrors} syntax errors.`);
if (blockers.length) {
  console.error('RELEASE BLOCKERS:');
  for (const item of blockers) console.error(`- ${item}`);
}
if (syntaxErrors || blockers.length) process.exit(1);
console.log('PASS: static release checks.');
