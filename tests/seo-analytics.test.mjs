import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
const root=resolve(new URL('..',import.meta.url).pathname);
const read=(path)=>readFileSync(resolve(root,path),'utf8');
const slugNames=['gtaiii','gtavc','gtasa','gtaiv','tlad','tbogt'];
test('search engine content is statically present at all six game routes',()=>{
 for(const slug of slugNames){
  const html=read(slug+'/index.html');
  assert.match(html,/<h1>GTA|<h1>The /);
  assert.match(html,new RegExp(`https://chrisgenao.github.io/gta-save-studio/${slug}/`));
  assert.match(html,/<meta name="description"/);
  assert.match(html,/<script type="application\/ld\+json">/);
  assert.match(html,/<meta property="og:image"/);
  assert.match(html,/<meta name="robots" content="index,follow/);
  assert.match(html,/<main id="page-content"/);
 }
});
test('sitemap contains only the seven canonical public pages',()=>{
 const sitemap=read('sitemap.xml');
 const matches=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(x=>x[1]);
 assert.deepEqual(matches,['https://chrisgenao.github.io/gta-save-studio/',...slugNames.map(s=>`https://chrisgenao.github.io/gta-save-studio/${s}/`)]);
 assert.ok(existsSync(resolve(root,'assets/social-preview.png')));
 assert.match(read('robots.txt'),/sitemap.xml/);
});
test('analytics is OFF until a G- measurement ID is entered, and tracks only a fixed set of safe events',()=>{
 assert.match(read('src/analytics-config.js'),/MEASUREMENT_ID = ''/);
 const js=read('src/analytics.js');
 assert.match(js,/if\(!configured\)return;/);
 assert.match(js,/data-analytics="accept"/);
 assert.match(js,/data-analytics="deny"/);
 assert.match(js,/allowedEvents = new Set\(\['save_imported', 'save_exported', 'import_failed'\]\)/);
 assert.doesNotMatch(js,/file\.name|save\.bytes|statValue/);
 assert.match(read('privacy.html'),/It does not send filenames, save content/);
});
