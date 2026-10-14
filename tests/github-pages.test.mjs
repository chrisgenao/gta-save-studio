import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
const root=resolve(new URL('..',import.meta.url).pathname);
function build(repo){
 const p=spawnSync(process.execPath,['scripts/build-pages.mjs'],{cwd:root,env:{...process.env,GITHUB_REPOSITORY:repo},encoding:'utf8'});
 assert.equal(p.status,0,p.stderr||p.stdout);
 const contents=(file)=>readFileSync(resolve(root,'dist',file),'utf8');
 return {index:contents('index.html'),routes:contents('src/routes.js'),workspace:contents('src/workspace-core.js'),app:contents('src/app.js'),notFound:contents('404.html')};
}
for (const repo of ['example/gta-save-studio','example/example.github.io']) {
 test(`GitHub Pages universal build works with ${repo} without hardcoded domain or repository path`,()=>{
  const x=build(repo);
  assert.match(x.index,/src="src\/app\.js"/);
  assert.match(x.index,/href="src\/styles\.css"/);
  assert.match(x.index,/href="favicon\.svg"/);
  assert.match(x.index,/document\.createElement\('base'\)/);
  assert.match(x.routes,/new URL\(document\.baseURI\)/);
  assert.match(x.workspace,/route:routeForGame\('SA'\)/);
  assert.match(x.workspace,/assetPath\('gta-sa.png'\)/);
  assert.match(x.app,/assetPath\('gta-iii.png'\)/);
  assert.match(x.notFound,/__page/);
  assert.match(x.index,/replaceState/);
  for (const path of ['src/app.js','src/styles.css','favicon.svg','404.html','.nojekyll','assets/gta-sa.png']) assert.ok(existsSync(resolve(root,'dist',path)),path);
  assert.ok(existsSync(resolve(root,'404.html')),'404.html must also exist in branch publishing root');
  assert.ok(existsSync(resolve(root,'.nojekyll')),'NoJekyll must also exist in branch publishing root');
 });
}
