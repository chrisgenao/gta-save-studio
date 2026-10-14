import test from 'node:test';
import assert from 'node:assert/strict';
import {Gta4Save,gta4Checksum,GTA4_STATS,GTA4_REWARDS} from '../src/gta4-core.js';
import {GAME_GROUPS,makeWorkspace,assertWorkspaceSave} from '../src/workspace-core.js';
import {routeForGame,gameForPath} from '../src/routes.js';

/** Standalone synthetic fixture; real player saves are NEVER packaged. */
function makeSyntheticGta4(){
 const sizes=Array(32).fill(9);
 sizes[0]=185;sizes[1]=217;sizes[2]=4177;sizes[13]=5929;sizes[15]=6422;
 const total=0x110+sizes.reduce((a,b)=>a+b,0)+20;
 const bytes=new Uint8Array(total);
 const view=new DataView(bytes.buffer);
 view.setUint32(0,57,true);view.setUint32(4,total,true);
 bytes.set([83,65,86,69],12); // SAVE
 const title='A GTA IV Test Save';for(let i=0;i<title.length;i++)view.setUint16(0x10+i*2,title.charCodeAt(i),true);
 let p=0x110;let blocks=[];
 for(const size of sizes){bytes.set([66,76,79,67,75],p);view.setUint32(p+5,size,true);blocks.push(p+9);p+=size;}
 const info=blocks[1]+0x10;
 view.setUint32(info+0x08,1207452,true);view.setUint32(info+0x10,1207452,true);
 view.setUint16(info+0x24,200,true);view.setUint16(info+0x26,100,true);
 view.setFloat32(info+0x50,200,true);view.setFloat32(info+0x54,100,true);
 view.setFloat32(blocks[13]+0x6c+0*4,75,true);
 view.setFloat32(blocks[13]+0x6c+1*4,85,true);
 view.setInt32(blocks[13]+0x6c+253*4,30,true);
 view.setUint32(blocks[15]+5,25,true);view.setUint32(blocks[15]+9,64,true);
 bytes.set([69,78,68,0],p+4);
 view.setUint32(p,gta4Checksum(bytes,p),true);
 return bytes;
}
const original=makeSyntheticGta4();const parse=()=>new Gta4Save(original);

test('GTA IV structure reads 32 blocks and documented player metadata',()=>{
 const save=parse();
 assert.equal(save.game,'IV');assert.equal(save.saveName,'A GTA IV Test Save');assert.equal(save.version,57);
 assert.equal(save.blocks.length,32);
 assert.equal(save.progress,75);assert.equal(save.money,1207452);
 assert.equal(save.health,200);assert.equal(save.armor,100);
 assert.equal(save.maxHealth,200);assert.equal(save.maxArmor,100);
 assert.equal(save.stuntCount,25);assert.equal(save.getStat(253),30);
 assert.equal(save.checksumValidOnLoad,true);
 assert.deepEqual(save.export(),original);
});

test('GTA IV edits reimport, checksum rebuild verified, original not changed',()=>{
 const save=parse();
 save.money=15000000;save.health=180;save.armor=175;
 save.maxArmor=200;save.setStat(1,90);save.setStat(258,22);
 save.setReward('fireproof',true);save.setReward('driveBy',true);
 save.cheatFlag=true;save.saveName='Niko – Test';
 const exported=save.export();
 const again=new Gta4Save(exported);
 assert.equal(again.money,15000000);assert.equal(again.health,180);
 assert.equal(again.armor,175);assert.equal(again.maxArmor,200);
 assert.equal(again.getStat(1),90);assert.equal(again.getStat(258),22);
 assert.equal(again.getReward('fireproof'),true);assert.equal(again.cheatFlag,true);
 assert.equal(again.getReward('driveBy'),true);assert.equal(again.saveName,'Niko – Test');
 assert.equal(new DataView(exported.buffer).getUint32(save.checksumOffset,true),gta4Checksum(exported,save.checksumOffset));
 assert.deepEqual(original,makeSyntheticGta4());
 assert.deepEqual(save.reset().export(),original);
});

test('GTA IV invalid headers, checksums and unsupported offsets rejected',()=>{
 const bad=new Uint8Array(original);bad[0x0c]=0;assert.throws(()=>new Gta4Save(bad),/SAVE header/);
 const corrupt=new Uint8Array(original);corrupt[500]^=0x3c;assert.throws(()=>new Gta4Save(corrupt),/checksum/);
 const s=parse();
 for(const [fn,msg] of [
 [()=>{s.money=-1},/whole number/],[()=>{s.health=999999},/Enter a value/],
 [()=>s.setStat(270,51),/Enter a value/],[()=>s.setStat(123456,100),/Unmapped/],
 [()=>s.setReward('unknown',true),/Unknown reward/]
 ])assert.throws(fn,msg);
 assert.deepEqual(s.export(),original);
});

test('GTA IV is a separate route/workspace with unique known stat IDs',()=>{
 assert.equal(routeForGame('IV'),'/gtaiv');assert.equal(gameForPath('/gtaiv'),'IV');
 assert.equal(GAME_GROUPS.length,6);
 assert.ok(GAME_GROUPS.some(x=>x.id==='IV'));
 assert.equal(new Set(GTA4_STATS.map(x=>x.id)).size,GTA4_STATS.length);
 assert.equal(new Set(GTA4_REWARDS.map(x=>x.id)).size,GTA4_REWARDS.length);
 const workspace=makeWorkspace();workspace.IV.save=parse();workspace.IV.ivGroup='Relationships';
 assert.ok(!workspace.SA.save&&!workspace.VC.save&&!workspace.III.save);
 assert.doesNotThrow(()=>assertWorkspaceSave(workspace.IV.save,'IV'));
 assert.throws(()=>assertWorkspaceSave(workspace.IV.save,'SA'),/different/);
});
