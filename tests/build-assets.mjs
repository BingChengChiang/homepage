// Generated from real Perl evaluation, not a hand-maintained approximation.
import fs from 'node:fs';
const input=new URL('./assets.raw.json',import.meta.url);
const a=JSON.parse(fs.readFileSync(input,'utf8').replace(/^\uFEFF/,''));
fs.writeFileSync(new URL('../dist/asciiquarium/assets.js',import.meta.url),'/* Sprite data from asciiquarium 1.1, GPL-2.0-or-later. See NOTICE.md and COPYING. */\nexport const ASSETS = '+JSON.stringify(a)+';\n');
