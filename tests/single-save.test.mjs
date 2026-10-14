import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {GAME_GROUPS,WORKSPACE_SETTINGS,makeWorkspace,assertWorkspaceSave} from '../src/workspace-core.js';

const source=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const index=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const snippet=source.slice(source.indexOf('function rememberWorkspace(){'),source.indexOf('function assetPath(name)'));
function createSession(){
  const dialogs=[];
  const SA=class SaSave {constructor(changeCount=0){this.game='SA';this.changeCount=changeCount;}};
  const Classic=class ClassicSave {constructor(game){this.game=game;this.changeCount=0;}};
  const IV=class Gta4Save {constructor(game){this.game=game;this.changeCount=0;}};
  const workspaces=makeWorkspace();
  const state={activeGame:'SA',save:new SA(3),fileName:'GTASAsf1.b',expandedGame:'SA',pendingMission:null,workspaces};
  for(const key of WORKSPACE_SETTINGS)state[key]=workspaces.SA[key];
  const context={state,GAME_GROUPS,WORKSPACE_SETTINGS,SaSave:SA,ClassicSave:Classic,Gta4Save:IV,assertWorkspaceSave,ready:()=>Boolean(state.save),window:{confirm:(message)=>{dialogs.push(message);return true;}}};
  runInNewContext(snippet,context);
  return {context,state,dialogs,SA,Classic,IV};
}
test('homepage does not suggest that uploaded saves are stored in a library',()=>{
  const home=source.slice(source.indexOf('function viewHome(){'),source.indexOf('function heading(',source.indexOf('function viewHome(){')));
  assert.doesNotMatch(home,/workspaces loaded|saves loaded|NO SAVE|SAVE LOADED|Continue editing|PC SAVE COLLECTION/);
  assert.match(home,/Choose a save to edit/);
  assert.match(home,/One file at a time/);
  assert.match(home,/No accounts, uploads to a server, or cloud storage/);
  const navbar=source.slice(source.indexOf('function renderNavigation()'),source.indexOf('function viewHome()'));
  assert.doesNotMatch(navbar,/saves loaded|Save loaded ·|game-loaded-dot/);
  assert.match(index,/LOCAL FILE EDITOR/);
});
test('changing games discards old file and does not cache it under either game',()=>{
  const {context,state,SA}=createSession();
  context.activateWorkspace('VC');
  assert.equal(state.save,null);
  assert.equal(state.fileName,null);
  context.activateWorkspace('SA');
  assert.equal(state.save,null);
  assert.equal(state.fileName,null);
  for(const values of Object.values(state.workspaces)){
    assert.equal(Object.hasOwn(values,'save'),false);
    assert.equal(Object.hasOwn(values,'fileName'),false);
  }
  const edited=new SA(0);
  context.activateWorkspace('SA',{save:edited,fileName:'GTASAsf3.b'});
  assert.equal(state.save,edited);
  assert.equal(state.fileName,'GTASAsf3.b');
});
test('an unsaved modified save requires confirmation before being replaced',()=>{
  const {context,state,dialogs}=createSession();
  assert.equal(context.confirmDiscard(),true);
  assert.match(dialogs[0],/pending change/);
  state.save.changeCount=0;
  assert.equal(context.confirmDiscard(),true);
  assert.equal(dialogs.length,1);
});
test('no browser persistence API is used to store save bytes',()=>{
  for(const word of ['localStorage','sessionStorage','indexedDB'])assert.doesNotMatch(source,new RegExp(word));
});
