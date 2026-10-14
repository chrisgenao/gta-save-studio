import assert from 'node:assert/strict';
import test from 'node:test';
import { SaSave, SAVE_SIZE, checksum, storedChecksum, SaveFormatError, STAT, REWARD_FLAGS } from '../src/save-core.js';

/** Synthetic block skeleton for testing the documented codec; NOT a playable save. */
function fixture() {
  const lens = [312, 3800, 585, 9159, 11, 32, 19923, 0, 359, 7000, 18892, 160, 2200, 0, 0, 44, 1940, 6724, 26316, 640, 104, 259, 552, 92, 4764, 16, 3836, 3590];
  const b = new Uint8Array(SAVE_SIZE);
  const offsets = [];
  let p = 0;
  for (const len of lens) {
    if (p + 5 + len >= SAVE_SIZE - 4) throw new Error('Fixture too long');
    b.set([66,76,79,67,75],p);
    offsets.push(p+5);
    p += 5+len;
  }
  const dv = new DataView(b.buffer);
  dv.setUint32(offsets[0],0x35da8175,true);
  b.set(new TextEncoder().encode('SWEET'), offsets[0]+4);
  dv.setUint32(offsets[15],40,true);
  dv.setInt32(offsets[15]+4,14050,true);
  dv.setInt32(offsets[15]+0x10,14050,true);
  dv.setInt32(offsets[20],100,true);
  dv.setInt32(offsets[24],70,true);
  dv.setFloat32(offsets[2]+0x20,150,true);
  dv.setFloat32(offsets[2]+0x24,125,true);
  dv.setFloat32(offsets[16]+0x00,75,true);
  dv.setFloat32(offsets[16]+0x04,100,true);
  dv.setInt32(offsets[16]+0x148+(159-120)*4,7,true);
  dv.setInt32(offsets[16]+0x148+(210-120)*4,10,true);
  dv.setUint32(SAVE_SIZE-4,checksum(b),true);
  return b;
}

test('parses a valid classic save skeleton and reads the correct blocks',()=>{
  const s=new SaSave(fixture());
  assert.equal(s.version,'1.00 Original');
  assert.equal(s.saveName,'SWEET');
  assert.equal(s.money,14050);
  assert.equal(s.health,150);
  assert.equal(s.armor,125);
  assert.equal(s.stat(STAT.FIREFIGHTER_LEVEL),7);
  assert.equal(s.stat(STAT.PIMP_LEVEL),10);
  assert.equal(s.progress,75);
  assert.equal(s.tagCount,100);
  assert.equal(s.jumpCount,70);
  assert.equal(s.checksumValidOnLoad,true);
});
test('edited fields are preserved after export and valid checksum is regenerated',()=>{
  const input=fixture();const s=new SaSave(input);
  s.money=1961510;s.health=176;s.armor=150;
  s.setStat(159,12);s.setStat(21,825);s.setStat(69,1000);
  s.setReward('fireproof',true);s.setReward('taxiNitro',true);
  s.cheatFlag=false;s.saveName='LAS VENTURAS';
  assert.equal(s.changeCount,10);
  const copy=s.export();
  assert.equal(checksum(copy),storedChecksum(copy));
  const out=new SaSave(copy);
  assert.equal(out.money,1961510);
  assert.equal(out.health,176);
  assert.equal(out.armor,150);
  assert.equal(out.stat(159),12);
  assert.equal(out.stat(21),825);
  assert.equal(out.stat(69),1000);
  assert.equal(out.getReward('fireproof'),true);
  assert.equal(out.getReward('taxiNitro'),true);
  assert.equal(out.cheatFlag,false);
  assert.equal(out.saveName,'LAS VENTURAS');
  assert.equal(new SaSave(input).money,14050,'input file must remain untouched');
  assert.equal(s.reset().money,14050,'reset should restore original');
});
test('tag spraying and stunt jump edits update their individual records',()=>{
  const s=new SaSave(fixture());
  assert.equal(s.sprayedTags,0);
  assert.equal(s.completedJumps,0);
  s.setAllTags(true);s.setAllJumps(true);
  assert.equal(s.sprayedTags,100);
  assert.equal(s.completedJumps,70);
  assert.equal(s.stat(145),70);
  s.setAllTags(false);s.setAllJumps(false);
  assert.equal(s.sprayedTags,0);
  assert.equal(s.completedJumps,0);
  assert.equal(s.stat(145),0);
});
test('guards non-GTA inputs, corrupted checksum and out-of-range edits',()=>{
  const bad=fixture();bad[100]=30;
  assert.throws(()=>new SaSave(bad),SaveFormatError);
  assert.throws(()=>new SaSave(new Uint8Array([1,2,3])),SaveFormatError);
  const s=new SaSave(fixture());
  assert.throws(()=>s.setStat(82,5),RangeError);
  assert.throws(()=>s.setStat(343,5),RangeError);
  assert.throws(()=>{s.health=Number.POSITIVE_INFINITY;},RangeError);
  assert.throws(()=>{s.money=-5;},RangeError);
  assert.throws(()=>s.setStat(159,1.4),RangeError);
});
test('there are no unexpected duplicated reward IDs',()=>{
  assert.equal(new Set(REWARD_FLAGS.map(r=>r.id)).size,REWARD_FLAGS.length);
});
