import assert from 'node:assert/strict';
import test from 'node:test';
import {GAME_GROUPS,WORKSPACE_SETTINGS,makeWorkspace,gameForSave,belongsToWorkspace,assertWorkspaceSave} from '../src/workspace-core.js';
import {ClassicSave} from '../src/classic-core.js';
import {readFileSync} from 'node:fs';
import {SaSave} from '../src/save-core.js';

test('six-game accordion groups are ordered and unique',()=>{
  assert.deepEqual(GAME_GROUPS.map(g=>g.id),['III','VC','SA','IV','TLAD','TBOGT']);
  assert.deepEqual(GAME_GROUPS.map(g=>g.label),['GTA III','GTA Vice City','GTA San Andreas','GTA IV','The Lost and Damned','The Ballad of Gay Tony']);
  assert.equal(new Set(GAME_GROUPS.map(g=>g.id)).size,6);
});
test('workspaces keep independent imported saves, views and filenames',()=>{
  const workspaces=makeWorkspace();
  const a={game:'III',changeCount:3},b={game:'VC',changeCount:4},c={game:'SA',changeCount:1};
  Object.assign(workspaces.III,{save:a,fileName:'GTA3sf1.b',view:'stats'});
  Object.assign(workspaces.VC,{save:b,fileName:'GTAVCsf1.b',view:'rewards'});
  Object.assign(workspaces.SA,{save:c,fileName:'GTASAsf1.b',view:'checklist'});
  assert.notEqual(workspaces.III,workspaces.VC);
  assert.equal(workspaces.III.save,a);
  assert.equal(workspaces.VC.save,b);
  assert.equal(workspaces.SA.save,c);
  assert.deepEqual([workspaces.III.view,workspaces.VC.view,workspaces.SA.view],['stats','rewards','checklist']);
  assert.deepEqual([workspaces.III.fileName,workspaces.VC.fileName,workspaces.SA.fileName],['GTA3sf1.b','GTAVCsf1.b','GTASAsf1.b']);
});
test('format classes map to correct accordion; no filenames required',()=>{
  assert.equal(gameForSave({game:'III'}),'III');
  assert.equal(gameForSave({game:'VC'}),'VC');
  assert.equal(gameForSave({game:'SA'}),'SA');
  assert.equal(gameForSave({game:'IV'}),'IV');
});

test('game boundaries reject a foreign save and unknown save formats',()=>{
  assert.throws(()=>gameForSave({game:'GTAIV'}),/Unsupported/);
  assert.throws(()=>gameForSave(null),/Unsupported/);
  for(const game of ['III','VC','SA','IV']){
    assert.equal(belongsToWorkspace({game},game),true);
    assert.doesNotThrow(()=>assertWorkspaceSave({game},game));
    for(const other of ['III','VC','SA','IV'].filter(id=>id!==game)){
      assert.equal(belongsToWorkspace({game},other),false);
      assert.throws(()=>assertWorkspaceSave({game},other),/different GTA game/);
    }
  }
  assert.doesNotThrow(()=>assertWorkspaceSave(null,'SA'));
});

test('each game remembers independent filters, search strings, and export slot',()=>{
  const groups=makeWorkspace();
  assert.ok(WORKSPACE_SETTINGS.includes('classicGroup'));
  assert.ok(WORKSPACE_SETTINGS.includes('skillGroup'));
  groups.SA.skillGroup='Weapons';groups.SA.statQuery='weapon';groups.SA.selectedSlot=5;
  groups.VC.classicQuery='taxi';groups.VC.selectedSlot=8;
  assert.equal(groups.III.skillGroup,'Body');
  assert.equal(groups.VC.skillGroup,'Body');
  assert.equal(groups.SA.classicQuery,'');
  assert.equal(groups.III.selectedSlot,1);
  assert.equal(groups.SA.selectedSlot,5);
  assert.equal(groups.VC.selectedSlot,8);
});

test('San Andreas overview contains only San Andreas import and no other-game tiles',()=>{
  const source=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
  const start=source.indexOf('function viewOverview()');
  const end=source.indexOf('function skillCard(',start);
  const overview=source.slice(start,end);
  assert.match(overview,/SAN ANDREAS WORKSPACE/);
  assert.match(overview,/GTA SAN ANDREAS \/\/ ORIGINAL PC SAVES/);
  assert.match(overview,/data-import-game="SA"/);
  assert.doesNotMatch(overview,/game-tile/);
  assert.doesNotMatch(overview,/CLASSIC TRILOGY/);
  assert.match(source,/assertWorkspaceSave\(state.save,state.activeGame\)/);
  assert.match(source,/state.activeGame!=='SA'/);
});
