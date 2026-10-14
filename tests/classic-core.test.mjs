import assert from 'node:assert/strict';
import test from 'node:test';
import {checksum,storedChecksum,SaveFormatError} from '../src/save-core.js';
import {CLASSIC_GAMES,CLASSIC_STATS,CLASSIC_REWARDS,ClassicSave,detectSave} from '../src/classic-core.js';

/** Deliberately synthetic structural test fixtures, NOT playable game saves. */
function fixture(game){
  const cfg=CLASSIC_GAMES[game],bytes=new Uint8Array(cfg.size),dv=new DataView(bytes.buffer);
  let pos=0;const starts=[];
  for(let i=0;i<cfg.blocks;i++){
    let size= i===0?0x100:i===1?0x800:i===cfg.info?0x170:i===cfg.stats?0x300:i===cfg.blocks-1?0x300:24;
    dv.setUint32(pos,size,true);starts.push(pos+4);pos+=size+4;
  }
  const first=starts[0],p=starts[1],info=starts[cfg.info],stats=starts[cfg.stats],last=starts[cfg.blocks-1];
  dv.setUint32(first+0x40,cfg.header,true);
  dv.setUint16(first+0x30,2026,true);dv.setUint16(first+0x32,10,true);dv.setUint16(first+0x36,13,true);
  for(const [i,c] of [...'LAST MISSION'].entries())dv.setUint16(first+i*2,c.charCodeAt(0),true);
  dv.setUint32(p,0x7FC,true);dv.setUint32(p+4,1,true);
  const ped=p+8+0xA;
  dv.setFloat32(ped+(game==='III'?0x2C0:0x354),90,true);
  dv.setFloat32(ped+(game==='III'?0x2C4:0x358),60,true);
  dv.setUint32(info,0x16C,true);dv.setInt32(info+4,25000,true);dv.setInt32(info+4+0x0F,25000,true);
  dv.setUint32(stats,0x2FC,true);
  dv.setUint32(stats+4+(game==='III'?0x70:0x78),game==='III'?50:0,true);
  if(game==='VC')dv.setFloat32(stats+4+0x78,50,true);
  if(game==='III')dv.setUint32(stats+4+0x74,100,true);
  else dv.setFloat32(stats+4+0x7C,100,true);
  bytes.set(new TextEncoder().encode('PTP'),last+4);
  dv.setUint32(bytes.length-4,checksum(bytes),true);
  return bytes;
}
for(const game of ['III','VC']){
  test(`${game} classic format parses exact blocks and metadata`,()=>{
    const save=new ClassicSave(fixture(game),game);
    assert.equal(save.game,game);assert.equal(save.saveName,'LAST MISSION');
    assert.equal(save.money,25000);assert.equal(save.health,90);assert.equal(save.armor,60);
    assert.equal(save.progress,50);assert.equal(save.date.getFullYear(),2026);
    assert.equal(save.checksumValidOnLoad,true);
    assert.equal(detectSave(fixture(game)).game,game);
  });
  test(`${game} edits survive export, preserve original and reset`,()=>{
    const file=fixture(game),base=Array.from(file);
    const save=new ClassicSave(file,game);
    save.money=1961510;save.health=176.5;save.armor=150;save.saveName='MY SAVE';save.packageCount=75;
    const flag=CLASSIC_REWARDS[game][0];save.setReward(flag.id,true);
    const activity=CLASSIC_STATS[game].find(s=>s.group==='Activities');save.setStat(activity.offset,10);
    assert.equal(save.changeCount,7);
    const out=save.export();assert.equal(checksum(out),storedChecksum(out));
    const reread=new ClassicSave(out,game);
    assert.equal(reread.money,1961510);assert.equal(reread.health,176.5);
    assert.equal(reread.armor,150);assert.equal(reread.saveName,'MY SAVE');
    assert.equal(reread.packageCount,75);assert.equal(reread.getReward(flag.id),true);
    assert.equal(reread.getStat(activity.offset),10);
    assert.equal(save.reset().money,25000);
    assert.deepEqual(Array.from(file),base,'Original file remains unchanged');
  });
  test(`${game} refuses invalid files, bad writes, mismatched signatures`,()=>{
    const good=fixture(game),broken=new Uint8Array(good);broken[70]=1;
    assert.throws(()=>new ClassicSave(broken,game),SaveFormatError);
    assert.throws(()=>new ClassicSave(good,game==='III'?'VC':'III'),SaveFormatError);
    const s=new ClassicSave(good,game);
    assert.throws(()=>s.setStat(0xDEADBEEF,10),RangeError);
    assert.throws(()=>s.setStat(0,1.3),RangeError);
    assert.throws(()=>{s.money=-1;},RangeError);
    assert.throws(()=>{s.health=1001;},RangeError);
    assert.throws(()=>s.setReward('madeUpReward',true),RangeError);
    assert.throws(()=>{s.packageCount=101;},RangeError);
    assert.throws(()=>{s.saveName='This name is longer than twenty three chars';},RangeError);
  });
}
test('No game schema reuses ambiguous statistic offsets or reward ids',()=>{
  for (const game of ['III','VC']){
    assert.equal(new Set(CLASSIC_STATS[game].map(x=>x.offset)).size,CLASSIC_STATS[game].length);
    assert.equal(new Set(CLASSIC_REWARDS[game].map(x=>x.id)).size,CLASSIC_REWARDS[game].length);
  }
});

// Regression: an actual 100%-completion VC PC save from the wild used 0x031401
// in the same header field that documentation describes as 12609.
test('VC recognizes both observed PC header variants without weakening size/block/checksum checks',()=>{
  for(const header of [12609,0x031401]){
    const b=fixture('VC'),dv=new DataView(b.buffer);
    dv.setUint32(4+0x40,header,true);
    dv.setUint32(b.length-4,checksum(b),true);
    const save=new ClassicSave(b,'VC');
    assert.equal(save.headerValue,header);
    assert.equal(save.progress,50);
    assert.equal(new ClassicSave(save.export(),'VC').headerValue,header);
  }
});
test('Vice City maximum health and armor preserve numeric byte caps, never boolean 1',()=>{
  const b=fixture('VC');const save=new ClassicSave(b,'VC');
  const hp=CLASSIC_REWARDS.VC.find(x=>x.id==='maxHealth');
  const armor=CLASSIC_REWARDS.VC.find(x=>x.id==='maxArmor');
  const p=save.dataStart(save.config.info,hp.offset),q=save.dataStart(save.config.info,armor.offset);
  b[p]=200;b[q]=200;new DataView(b.buffer).setUint32(b.length-4,checksum(b),true);
  const original=new ClassicSave(b,'VC');
  assert.equal(original.getReward('maxHealth'),true);
  assert.equal(original.getReward('maxArmor'),true);
  original.setReward('maxHealth',true);original.setReward('maxArmor',true);
  assert.equal(original.export()[p],200);
  assert.equal(original.export()[q],200);
  assert.equal(original.changeCount,0);
  original.setReward('maxHealth',false);original.setReward('maxArmor',false);
  assert.equal(original.export()[p],100);
  assert.equal(original.export()[q],100);
  const reread=new ClassicSave(original.export(),'VC');
  reread.setReward('maxHealth',true);reread.setReward('maxArmor',true);
  assert.equal(reread.export()[p],200);
  assert.equal(reread.export()[q],200);
});
test('setting unchanged title leaves raw mission-name padding intact',()=>{
  const b=fixture('III');
  const start=4;
  b[start+0x26]=0xA6;
  new DataView(b.buffer).setUint32(b.length-4,checksum(b),true);
  const s=new ClassicSave(b,'III');
  s.saveName=s.saveName;
  assert.deepEqual(s.export(),b);
  assert.equal(s.changeCount,0);
});
