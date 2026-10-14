import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {Gta4Save,gta4Checksum,gta4StatsLayout} from '../src/gta4-core.js';

// Synthetic data only. NEVER include or publish genuine player saves in tests.
function synthetic({modern=false,episode='IV'}={}) {
  const sizes=Array(32).fill(9);
  sizes[0]=185;sizes[1]=217;sizes[2]=4177;
  sizes[13]=modern?0x1741:0x1729; // block header adds 9 bytes
  sizes[15]=6422;
  const tail=modern?0:12;
  const total=0x110+sizes.reduce((a,b)=>a+b,0)+8+tail;
  const out=new Uint8Array(total),view=new DataView(out.buffer);
  view.setUint32(0,57,true);view.setUint32(4,total,true);
  out.set([83,65,86,69],12);
  const title=episode==='IV'?'Synthetic save':episode==='TLAD'?'TLAD - Test Save':'TBoGT - Test Save';
  for(let i=0;i<title.length;i++)view.setUint16(0x10+i*2,title.charCodeAt(i),true);
  let p=0x110;const body=[];
  for(const size of sizes){out.set([66,76,79,67,75],p);view.setUint32(p+5,size,true);body.push(p+9);p+=size;}
  const player=body[1]+0x10;
  view.setUint32(player+0x8,290,true);view.setUint32(player+0x10,290,true);
  view.setUint16(player+0x24,200,true);view.setUint16(player+0x26,100,true);
  view.setFloat32(player+0x50,199,true);view.setFloat32(player+0x54,20,true);
  const start=body[13]+(modern?0x68:0x6c);
  view.setFloat32(start+0*4,4.5,true);
  view.setFloat32(start+133*4,47.5,true);
  view.setFloat32(start+187*4,62.5,true);
  view.setInt32(start+253*4,7,true);
  view.setUint32(body[15]+5,10,true);view.setUint32(body[15]+9,50,true);
  out.set([69,78,68,0],p+4);
  if(tail)for(let i=0;i<tail;i++)out[p+8+i]=i+71;
  view.setUint32(p,gta4Checksum(out,p),true);
  return out;
}

test('checksum recognizes legacy 12-byte footer and Complete Edition zero-byte footer',()=>{
 for(const modern of [false,true]){
   const bytes=synthetic({modern}),save=new Gta4Save(bytes);
   assert.equal(save.footerTrailerLength,modern?0:12);
   assert.equal(save.statsStart,modern?0x68:0x6c);
   assert.equal(save.progress,4.5);
   assert.equal(save.getStat(253),7);
   assert.equal(save.checksumValidOnLoad,true);
   assert.deepEqual(save.export(),bytes);
   assert.equal(gta4Checksum(bytes,save.checksumOffset),save.view.getUint32(save.checksumOffset,true));
 }
 assert.equal(gta4StatsLayout(0x1720).offset,0x6c);
 assert.equal(gta4StatsLayout(0x1738).offset,0x68);
 assert.throws(()=>gta4StatsLayout(0x1724),/Unmapped/);
});

test('both formats preserve unrelated bytes and trailer after editing',()=>{
 for(const modern of [false,true])for(const episode of ['IV','TLAD','TBOGT']){
   const original=synthetic({modern,episode});
   const save=new Gta4Save(original);
   assert.equal(save.game,episode);
   save.money=45011;
   save.setStat(episode==='IV'?0:episode==='TLAD'?133:187,80);
   const output=save.export();
   const again=new Gta4Save(output);
   assert.equal(again.money,45011);
   assert.equal(again.progress,80);
   assert.equal(again.getStat(253),7);
   assert.equal(again.checksumValidOnLoad,true);
   assert.equal(again.footerTrailerLength,save.footerTrailerLength);
   if(!modern)assert.deepEqual(output.subarray(-12),original.subarray(-12));
   const allowed=new Set();
   for(const start of [save.playerOffset(8,4),save.playerOffset(16,4),save.statOffset(episode==='IV'?0:episode==='TLAD'?133:187),save.checksumOffset])
    for(let j=0;j<4;j++)allowed.add(start+j);
   for(let j=0;j<original.length;j++)if(original[j]!==output[j])assert.ok(allowed.has(j),`Unexpected modification at 0x${j.toString(16)}`);
   assert.deepEqual(original,synthetic({modern,episode}));
 }
});

test('genuine checksum corruption is rejected in both formats, rather than ignored',()=>{
 for(const modern of [false,true]){
   const bytes=synthetic({modern});bytes[0x600]^=0x41;
   assert.throws(()=>new Gta4Save(bytes),/checksum mismatch/i);
 }
});

test('a structurally unknown stats layout is not written using guessed offsets',()=>{
 const bytes=synthetic({modern:true});
 const p=0x110+[185,217,4177,...Array(10).fill(9)].reduce((a,b)=>a+b,0);
 // Instead of modifying block lengths (which would corrupt all downstream
 // offsets), verify the layout guard directly.
 assert.throws(()=>gta4StatsLayout(0x1740),/Unmapped/);
 assert.ok(p>0);
});

// Optional, locally executed integration cases; user saves are never bundled.
// GTA4_TEST_SAMPLES_DIR=/mnt/data node --test tests/gta4-compatibility.test.mjs
const sampleDir=process.env.GTA4_TEST_SAMPLES_DIR;
test('optional private real saves: import, no-op byte identity, edit and re-import', {skip:!sampleDir},()=>{
 for(const [file,fmt,progress,missions] of [
  ['SGTA4xx','Legacy PC / GFWL-style',100,85],
  ['SGTA400','Complete Edition-style',2.0930233001708984,3],
  ['SGTA412','Complete Edition-style',3.4883720874786377,5]
 ]){
   const path=resolve(sampleDir,file);
   assert.ok(existsSync(path),`Missing local private test save: ${file}`);
   const original=readFileSync(path),save=new Gta4Save(original);
   assert.equal(save.saveFormat,fmt);
   assert.ok(Math.abs(save.progress-progress)<0.00001);
   assert.equal(save.getStat(253),missions);
   assert.deepEqual(Buffer.from(save.export()),original);
   save.money=save.money+101;
   const again=new Gta4Save(save.export());
   assert.equal(again.money,save.money);
   assert.equal(again.getStat(253),missions);
   assert.equal(again.checksumValidOnLoad,true);
   assert.deepEqual(Buffer.from(save.reset().export()),original);
 }
});
