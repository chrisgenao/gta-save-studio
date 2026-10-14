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
test('GitHub Pages project site builds correct repo-prefix assets and SPA paths',()=>{
 const x=build('example/gta-save-studio');
 assert.match(x.index,/src="\/gta-save-studio\/src\/app\.js"/);
 assert.match(x.index,/href="\/gta-save-studio\/src\/styles\.css"/);
 assert.match(x.index,/href="\/gta-save-studio\/"/);
 assert.match(x.routes,/SA:'\/gta-save-studio\/gtasa'/);
 assert.match(x.workspace,/route:'\/gta-save-studio\/gtasa'/);
 assert.match(x.workspace,/logo:'\/gta-save-studio\/assets\/gta-sa.png'/);
 assert.match(x.app,/src="\/gta-save-studio\/assets\/gta-iii.png"/);
 assert.match(x.notFound,/__page/);
 assert.match(x.index,/replaceState/);
 assert.ok(existsSync(resolve(root,'dist','.nojekyll')));
});
test('GitHub Pages root site builds unprefixed URLs',()=>{
 const x=build('example/example.github.io');
 assert.match(x.index,/src="\/src\/app\.js"/);
 assert.match(x.routes,/SA:'\/gtasa'/);
 assert.match(x.workspace,/logo:'\/assets\/gta-sa.png'/);
 assert.doesNotMatch(x.index,/example\.github\.io\/src/);
});
