import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync,existsSync} from 'node:fs';
import {GAME_PATHS,HOME_PATH,gameForPath,routeForGame,validRoute} from '../src/routes.js';
import {GAME_GROUPS} from '../src/workspace-core.js';

const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const server=readFileSync(new URL('../server.mjs',import.meta.url),'utf8');

test('root is a distinct dashboard; every game has a dedicated direct URL',()=>{
 assert.equal(HOME_PATH,'/');
 assert.deepEqual(GAME_PATHS,{III:'/gtaiii',VC:'/gtavc',SA:'/gtasa',IV:'/gtaiv',TLAD:'/tlad',TBOGT:'/tbogt'});
 for (const [game,path] of Object.entries(GAME_PATHS)) {
  assert.equal(routeForGame(game),path);
  assert.equal(gameForPath(path),game);
  assert.equal(gameForPath(path+'/'),game);
  assert.equal(validRoute(path),true);
  assert.ok(server.includes("'/"+path.slice(1)+"'"));
 }
 assert.equal(gameForPath('/'),null);
 assert.equal(validRoute('/'),true);
 assert.equal(validRoute('/missing'),false);
 assert.throws(()=>routeForGame('GTAV'),/Unsupported/);
});

test('all custom logos are included and used instead of sidebar monograms',()=>{
 for(const group of GAME_GROUPS){
  assert.equal(group.route,routeForGame(group.id));
  assert.equal(group.logo,`/assets/gta-${group.id==='III'?'iii':group.id.toLowerCase()}.png`);
  assert.ok(existsSync(new URL('..'+group.logo,import.meta.url)),group.logo+' is missing');
 }
 assert.match(app,/function logo\(game\)/);
 assert.match(app,/game-accordion-logo.*logo\(group\.id\)/);
 assert.match(app,/home-game-card/);
 assert.match(app,/home-hero/);
 assert.doesNotMatch(app,/game-accordion-monogram/);
});

test('all routes use absolute stylesheet, entry script and icon URLs for refresh',()=>{
 assert.match(html,/href="\/src\/styles\.css"/);
 assert.match(html,/src="\/src\/app\.js"/);
 assert.match(html,/href="\/favicon\.svg"/);
 assert.match(server,/spaPaths\.has\(pathname\)/);
 assert.match(server,/'\.png':'image\/png'/);
});

test('home navigation, automatic imported-game routing and history are integrated',()=>{
 assert.match(app,/page:'home'/);
 assert.match(app,/function viewHome\(\)/);
 assert.match(app,/function navigateHome\(/);
 assert.match(app,/function navigateGame\(/);
 assert.match(app,/function syncRouteFromLocation\(/);
 assert.match(app,/navigateGame\(game,'overview'\)/);
 assert.match(app,/window\.addEventListener\('popstate',syncRouteFromLocation\)/);
 assert.match(app,/window\.addEventListener\('hashchange',syncRouteFromLocation\)/);
 assert.match(app,/state\.page==='home'/);
});
