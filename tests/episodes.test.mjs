import test from 'node:test';
import assert from 'node:assert/strict';
import {Gta4Save,gta4Checksum,EPISODE_STATS,EPISODE_PROFILES,detectGta4Episode} from '../src/gta4-core.js';
import {GAME_GROUPS,makeWorkspace,assertWorkspaceSave} from '../src/workspace-core.js';
import {routeForGame,gameForPath} from '../src/routes.js';
import {readFileSync,existsSync} from 'node:fs';

// Independent synthetic GTA IV container. Not a user's private save.
function fixture(episode){
 const sizes=Array(32).fill(9);
 sizes[0]=185;sizes[1]=217;sizes[2]=4177;sizes[13]=5929;sizes[15]=6422;
 const total=0x110+sizes.reduce((a,b)=>a+b,0)+20;
 const bytes=new Uint8Array(total); const d=new DataView(bytes.buffer);
 const title=episode==='TLAD'?'TLAD - First Mission':episode==='TBOGT'?'TBoGT - First Mission':'Story Complete';
 d.setUint32(0,57,true);d.setUint32(4,total,true);
 bytes.set([83,65,86,69],12);
 for(let i=0;i<title.length;i++)d.setUint16(0x10+i*2,title.charCodeAt(i),true);
 let p=0x110;const blocks=[];
 for(const len of sizes){bytes.set([66,76,79,67,75],p);d.setUint32(p+5,len,true);blocks.push(p+9);p+=len;}
 const info=blocks[1]+0x10;d.setUint32(info+8,4567,true);d.setUint32(info+16,4567,true);
 d.setUint16(info+0x24,200,true);d.setUint16(info+0x26,100,true);
 d.setFloat32(info+0x50,185,true);d.setFloat32(info+0x54,87,true);
 const start=blocks[13]+0x6c;
 d.setFloat32(start+0*4,13,true);d.setFloat32(start+133*4,45,true);d.setFloat32(start+187*4,75,true);
 d.setInt32(start+253*4,25,true);
 d.setUint32(blocks[15]+5,10,true);d.setUint32(blocks[15]+9,64,true);
 bytes[blocks[31]+2]=117; // unknown byte must be preserved
 bytes.set([69,78,68,0],p+4);d.setUint32(p,gta4Checksum(bytes,p),true);
 return bytes;
}

test('the three IV-era campaigns are identified from their UTF-16 save header',()=>{
 for(const id of ['IV','TLAD','TBOGT']){
  const save=new Gta4Save(fixture(id));
  assert.equal(save.game,id);
  assert.equal(save.progress,{IV:13,TLAD:45,TBOGT:75}[id]);
  assert.equal(save.money,4567);
  assert.equal(save.getStat(253),25);
  assert.equal(save.checksumValidOnLoad,true);
  assert.deepEqual(save.export(),fixture(id));
  assert.equal(EPISODE_PROFILES[id].id,id);
  assert.ok(EPISODE_STATS[id].some(s=>s.id===EPISODE_PROFILES[id].progressId));
 }
 assert.equal(detectGta4Episode('TBoGT - Departure Time'),'TBOGT');
 assert.equal(detectGta4Episode('TLAD - Get Lost'),'TLAD');
 assert.equal(detectGta4Episode('Story Complete'),'IV');
});

test('TLAD and TBoGT edit/export/reimport independently and preserve unknown bytes',()=>{
 for(const id of ['TLAD','TBOGT']){
  const original=fixture(id);const save=new Gta4Save(original);
  save.money=95822;save.armor=99;save.setStat(EPISODE_PROFILES[id].progressId,95);
  save.setReward('fireproof',true);
  save.saveName=id==='TLAD'?'TLAD - Synthetic New':'TBoGT - Synthetic New';
  assert.throws(()=>{save.saveName='Story Complete'},/episode prefix/);
  assert.throws(()=>save.getStat(id==='TLAD'?187:133),/Unmapped/);
  const out=save.export();const again=new Gta4Save(out);
  assert.equal(again.game,id);assert.equal(again.progress,95);assert.equal(again.money,95822);
  assert.equal(again.armor,99);assert.equal(again.getReward('fireproof'),true);
  assert.equal(out[save.blocks[31].start+2],original[save.blocks[31].start+2]);
  assert.equal(new DataView(out.buffer).getUint32(save.checksumOffset,true),gta4Checksum(out,save.checksumOffset));
  assert.deepEqual(save.reset().export(),original);
 }
});

test('episode routes, artwork and save workspaces remain isolated',()=>{
 const work=makeWorkspace();
 for(const [game,path] of [['IV','/gtaiv'],['TLAD','/tlad'],['TBOGT','/tbogt']]){
  assert.equal(routeForGame(game),path);assert.equal(gameForPath(path),game);
  const save=new Gta4Save(fixture(game));work[game].save=save;
  assert.doesNotThrow(()=>assertWorkspaceSave(save,game));
  for(const other of ['IV','TLAD','TBOGT'].filter(g=>g!==game))assert.throws(()=>assertWorkspaceSave(save,other),/different/);
 }
 for(const entry of GAME_GROUPS)assert.ok(existsSync(new URL('..'+entry.logo,import.meta.url)),`Missing ${entry.logo}`);
 const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
 assert.match(app,/EPISODE_STATS\[save\.game\]/);
 assert.match(app,/renderGta4/);
 assert.match(app,/gta-iv\.png/);
});

test('each episode uses separate player navigation and correct labels',async()=>{
 const {hdNavigation}=await import('../src/gta4-core.js');
 const {renderGta4}=await import('../src/gta4-ui.js');
 const deps={icon:x=>x,escapeHtml:x=>x,heading:(a,b,c)=>`${a} ${b} ${c}`,metric:(...xs)=>xs.join(' / '),numeric:x=>String(x),logo:x=>x};
 for(const id of ['IV','TLAD','TBOGT']){
  const save=new Gta4Save(fixture(id));
  const nav=hdNavigation(id);
  assert.equal(nav[1][2],`${EPISODE_PROFILES[id].player.split(' ')[0]} Statistics`);
  for(const view of ['overview','stats','missions','checklist','collectibles','rewards','inspector','settings']){
   const html=renderGta4({save,view,ivGroup:'Progress',ivQuery:'',fileName:'SGTA400'},deps);
   assert.ok(html.length>400,`${id}: ${view} empty`);
   assert.ok(!html.includes('NaN'),`${id}: ${view} invalid value`);
   assert.ok(!html.includes('undefined'),`${id}: ${view} undefined text`);
  }
 }
});
