import assert from 'node:assert/strict';
import test from 'node:test';
import {SaSave,SAVE_SIZE,checksum,storedChecksum} from '../src/save-core.js';
import {MISSION_CHAINS,missionStatus,missionRequirements,advanceMissionChain,girlfriendState,normalizeMission} from '../src/mission-core.js';

function fixture(){
 const lengths=[312,3800,585,9159,11,32,19923,0,359,7000,18892,160,2200,0,0,44,1940,6724,26316,640,104,259,552,92,4764,16,3836,3590];
 const bytes=new Uint8Array(SAVE_SIZE), offsets=[];
 let p=0;
 for(const n of lengths){bytes.set([66,76,79,67,75],p);offsets.push(p+5);p+=5+n;}
 const view=new DataView(bytes.buffer);
 view.setUint32(offsets[0],0x35da8175,true);
 view.setUint32(offsets[1],3200,true);
 view.setUint32(bytes.length-4,checksum(bytes),true);
 return bytes;
}
function putGlobal(save,index,value){save.setScriptGlobal(index,value);}

test('chain definitions use unique script slots and mission identifiers',()=>{
 assert.equal(new Set(MISSION_CHAINS.map(c=>c.global)).size,MISSION_CHAINS.length);
 assert.equal(normalizeMission("The Green Sabre"),'thegreensabre');
 assert.equal(MISSION_CHAINS.length>20,true);
});
test('reads passed, not passed, and unverified from the saved SCM globals',()=>{
 const save=new SaSave(fixture());
 assert.equal(missionStatus(save,'Big Smoke').status,'not-passed');
 assert.equal(missionStatus(save,'Zeroing In').status,'not-passed');
 assert.equal(missionStatus(save,'Some Impossible Mission').status,'unknown');
 putGlobal(save,448,1);
 assert.equal(missionStatus(save,'Big Smoke').status,'passed');
 assert.equal(missionStatus(save,'Ryder').status,'not-passed');
 putGlobal(save,492,5);
 assert.equal(missionStatus(save,'Wu Zi Mu').status,'passed');
 assert.equal(missionStatus(save,'Farewell, My Love...').status,'not-passed');
});
test('requires in-chain progression AND cross-chain prerequisites, never jumps ahead',()=>{
 const save=new SaSave(fixture());
 assert.equal(missionRequirements(save,'Ryder').allowed,false);
 putGlobal(save,448,1);
 assert.equal(missionRequirements(save,'Ryder').allowed,true);
 assert.equal(missionRequirements(save,'Tagging Up Turf').allowed,false);
 advanceMissionChain(save,'Ryder');
 assert.equal(missionStatus(save,'Ryder').status,'passed');
 assert.equal(missionRequirements(save,'Tagging Up Turf').allowed,true);
 advanceMissionChain(save,'Tagging Up Turf');
 assert.equal(missionStatus(save,'Tagging Up Turf').status,'passed');
 assert.equal(missionRequirements(save,'Drive-Thru').allowed,false,'cannot skip Cleaning the Hood');
});
test('rejects unsupported world-state gates and active missions before writing',()=>{
 const save=new SaSave(fixture());
 assert.equal(missionRequirements(save,'High Stakes, Low Rider').allowed,false);
 assert.throws(()=>advanceMissionChain(save,'High Stakes, Low Rider'),/blocked/);
 putGlobal(save,593,4);
 assert.equal(missionRequirements(save,'Learning to Fly').allowed,false,'flying school world state not proven');
 putGlobal(save,433,1);
 assert.equal(missionRequirements(save,'Big Smoke').allowed,false,'on mission');
 assert.throws(()=>advanceMissionChain(save,'Big Smoke'),/blocked/);
});
test('prevents SCM edits when global header malformed',()=>{
 const save=new SaSave(fixture());
 save.setInt(1,0,3);
 assert.equal(missionStatus(save,'Big Smoke').status,'unknown');
 assert.throws(()=>advanceMissionChain(save,'Big Smoke'),/blocked/);
});
test('girlfriend story gates and displayed relationship are not confused with active unlock',()=>{
 const save=new SaSave(fixture());
 putGlobal(save,383,35);save.setStat(252,35);
 putGlobal(save,456,1);
 const gf=girlfriendState(save,'denise');
 assert.equal(gf.storyGate,'passed');
 assert.equal(gf.internal,35);
 assert.equal(gf.display,35);
 assert.equal(gf.relationshipVerified,false);
 assert.equal(girlfriendState(save,'millie').storyGate,'not-passed');
});
test('counter change survives re-import and checksum is recalculated, preserving original',()=>{
 const bytes=fixture();const save=new SaSave(bytes);
 advanceMissionChain(save,'Big Smoke');
 assert.equal(new SaSave(bytes).getScriptGlobal(448),0);
 const exported=save.export();
 assert.equal(checksum(exported),storedChecksum(exported));
 assert.equal(new SaSave(exported).getScriptGlobal(448),1);
 assert.equal(save.reset().getScriptGlobal(448),0);
});
