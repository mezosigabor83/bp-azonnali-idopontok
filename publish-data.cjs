const { mkdirSync, copyFileSync, writeFileSync } = require('node:fs');
const data = require('./bp-kereso-adatok-bovitett.json');

if (!Array.isArray(data.incomplete) || data.incomplete.length) {
  throw new Error('Hiányos lekérés. Az előző közzétett lista marad elérhető.');
}

const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Budapest' }).format(new Date());
if (data.from !== today || !Array.isArray(data.profiles) || !data.profiles.length) {
  throw new Error('A futás nem adott friss profiladatokat.');
}

mkdirSync('public', { recursive: true });
copyFileSync('index.html', 'public/index.html');
writeFileSync('public/adatok.json', JSON.stringify({ ...data, checkedAt: new Date().toISOString() }));
