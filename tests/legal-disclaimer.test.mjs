import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const content = path => readFileSync(new URL(path, import.meta.url),'utf8');
const index=content('../index.html');
const legal=content('../disclaimer.html');
const build=content('../scripts/build-pages.mjs');
const styles=content('../src/styles.css');
test('legal notice is shown across all editors independently of app rendering',()=>{
  assert.match(index,/<footer class="site-legal-footer"/);
  assert.match(index,/EDUCATIONAL PURPOSES ONLY/);
  assert.match(index,/not affiliated with, sponsored, authorized or endorsed by Rockstar Games, Rockstar North, Take-Two Interactive/);
  assert.match(index,/href="disclaimer.html"/);
  assert.match(styles,/\.site-legal-footer/);
});
test('dedicated disclaimer acknowledges trademarks and educational scope',()=>{
  for(const phrase of ['educational purposes only','Rockstar Games','Rockstar North','Take-Two Interactive','trademarks','back up your original save']) assert.ok(legal.toLowerCase().includes(phrase.toLowerCase()),phrase);
  assert.match(legal,/href="src\/styles.css"/);
  assert.match(legal,/href="\.\/"/);
});
test('disclaimer gets copied into GitHub Pages build',()=>{
  assert.match(build,/disclaimer\.html/);
});
