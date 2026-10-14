/**
 * GTA IV PC save codec. Preserves every unknown byte and every variable-length
 * BLOCK payload. Only documented, bounded offsets may be modified.
 * References: https://gtamods.com/wiki/Saves_(GTA_4)
 *             https://gtamods.com/wiki/List_of_statistics_(GTA4)
 */
const u32=(v)=>{const n=Number(v);if(!Number.isSafeInteger(n)||n<0||n>0xffffffff)throw new RangeError('Enter a whole number from 0 to 4294967295.');return n;};
const bounded=(v,min,max)=>{const n=Number(v);if(!Number.isFinite(n)||n<min||n>max)throw new RangeError(`Enter a value from ${min} to ${max}.`);return n;};
const asBytes=(bytes)=>new Uint8Array(bytes);
const ascii=(b,p,n)=>String.fromCharCode(...b.subarray(p,p+n));

export const GTA4_NAV=Object.freeze([
 ['overview','layout-dashboard','Overview'],['stats','activity','Niko Statistics'],['missions','flag','Activities & Records'],
 ['checklist','check','Completion Guide'],['collectibles','gem','Stunt Jumps'],['rewards','gift','Rewards & Perks'],
 ['inspector','terminal','Stat Inspector'],['settings','settings','Save Settings']
]);

export function hdNavigation(game){
 if(game==='IV')return GTA4_NAV;
 if(!Object.hasOwn(EPISODE_PROFILES,game))throw new Error('Unknown IV-era episode.');
 const player=EPISODE_PROFILES[game].player.split(' ')[0];
 return GTA4_NAV.map(([id,glyph,label])=>[id,glyph,id==='stats'?`${player} Statistics`:id==='missions'?'Episode Activities':id==='collectibles'?'Collectibles & Challenges':label]);
}

export const GTA4_REWARDS=Object.freeze([
 {id:'infiniteSprint',label:'Infinite sprint',detail:'Never tired',offset:0x20},
 {id:'fastReload',label:'Fast reload',detail:'Faster reload flag',offset:0x21},
 {id:'fireproof',label:'Fireproof',detail:'Fire resistance flag',offset:0x22},
 {id:'keepWeapons',label:'Keep weapons after arrest',detail:'Retain weapons when busted',offset:0x28},
 {id:'freeHealth',label:'Free hospital visits',detail:'Free health care flag',offset:0x29},
 {id:'driveBy',label:'Drive-by enabled',detail:'Player drive-by ability',offset:0x2a},
]);


export const EPISODE_PROFILES=Object.freeze({
 IV:{id:'IV',name:'Grand Theft Auto IV',short:'GTA IV',player:'Niko Bellic',place:'Liberty City',progressId:0,logo:'IV',chapter:'2008',stuntGoal:50},
 TLAD:{id:'TLAD',name:'The Lost and Damned',short:'The Lost and Damned',player:'Johnny Klebitz',place:'Liberty City',progressId:133,logo:'TLAD',chapter:'2008',stuntGoal:null},
 TBOGT:{id:'TBOGT',name:'The Ballad of Gay Tony',short:'The Ballad of Gay Tony',player:'Luis Lopez',place:'Liberty City',progressId:187,logo:'TBOGT',chapter:'2008',stuntGoal:null},
});
/** Episode identity comes from the save's encoded title, never its filename/selected route. */
export function detectGta4Episode(title){
 const name=String(title||'');
 if(/^TLAD\s*-\s*/i.test(name))return 'TLAD';
 if(/^TBoGT\s*-\s*/i.test(name))return 'TBOGT';
 return 'IV';
}

const stat=(id,label,type='int',max=1000000,group='General')=>({id,label,type,max,group,min:0});
export const GTA4_STATS=Object.freeze([
 stat(0,'Game progress','float',100,'Progress'),
 stat(1,'Roman like','float',100,'Relationships'),stat(2,'Roman respect','float',100,'Relationships'),
 stat(3,'Roman mission progress','float',100,'Progress'),stat(4,'Vlad mission progress','float',100,'Progress'),
 stat(5,'Little Jacob like','float',100,'Relationships'),stat(6,'Little Jacob respect','float',100,'Relationships'),
 stat(7,'Little Jacob mission progress','float',100,'Progress'),stat(8,'Faustin mission progress','float',100,'Progress'),
 stat(9,'Manny mission progress','float',100,'Progress'),stat(10,'Elizabeta mission progress','float',100,'Progress'),
 stat(11,'Dwayne like','float',100,'Relationships'),stat(12,'Dwayne respect','float',100,'Relationships'),
 stat(13,'Dwayne mission progress','float',100,'Progress'),
 stat(90,'Spent on Pay n Spray','float',100000000,'Economy'),stat(91,'Spent on dates','float',100000000,'Economy'),
 stat(92,'Spent buying clothes','float',100000000,'Economy'),stat(93,'Made from missions','float',100000000,'Economy'),
 stat(94,'Spent in bars and clubs','float',100000000,'Economy'),stat(97,'Spent on food','float',100000000,'Economy'),
 stat(98,'Spent on taxis','float',100000000,'Economy'),stat(100,'Made from vigilante','float',100000000,'Economy'),
 stat(253,'Missions passed','int',200,'Progress'),stat(254,'Missions failed','int',100000,'Progress'),
 stat(255,'Missions attempted','int',100000,'Progress'),stat(256,'Replays used','int',100000,'Progress'),
 stat(257,'People killed','int',10000000,'Combat'),stat(258,'Taxi fares completed','int',100000,'Activities'),
 stat(259,'Times cheated','int',100000,'General'),stat(260,'Days passed','int',100000,'General'),
 stat(261,'Times died','int',100000,'General'),stat(262,'People run down','int',10000000,'Combat'),
 stat(267,'Helicopter tours','int',10000,'Activities'),stat(268,'Taxis hailed','int',100000,'Activities'),
 stat(269,'Stunt jumps found (stat)','int',50,'Stunts'),stat(270,'Stunt jumps completed (stat)','int',50,'Stunts'),
 stat(272,'Fires started','int',100000,'Combat'),stat(273,'Criminals killed','int',100000,'Activities'),
 stat(274,'Cars stolen','int',100000,'Activities'),stat(275,'Bikes stolen','int',100000,'Activities'),
 stat(278,'Wanted stars attained','int',100000,'Combat'),stat(279,'Wanted stars evaded','int',100000,'Combat'),
 stat(281,'Bridges flown under','int',100,'Stunts'),stat(282,'Pay n Spray visits','int',100000,'Activities'),
 stat(284,'Drug packages delivered','int',10000,'Activities'),stat(285,'Cars sold to Stevie','int',30,'Activities')
]);
const COMMON_EPISODE_STATS=Object.freeze([
 stat(40,'Shooting accuracy','float',100,'Combat'),stat(41,'Free-aim kills (%)','float',100,'Combat'),
 stat(90,'Spent at Pay n Spray','float',100000000,'Economy'),stat(93,'Made from missions','float',100000000,'Economy'),
 stat(100,'Made from vigilante','float',100000000,'Economy'),
 stat(253,'Missions passed','int',1000,'Progress'),stat(254,'Missions failed','int',100000,'Progress'),
 stat(255,'Missions attempted','int',100000,'Progress'),stat(257,'People killed','int',10000000,'Combat'),
 stat(258,'Taxi fares completed','int',100000,'Activities'),stat(259,'Times cheated','int',100000,'General'),
 stat(261,'Times died','int',100000,'General'),stat(268,'Taxis hailed','int',100000,'Activities'),
 stat(269,'Stunt jumps found (stat)','int',500,'Stunts'),stat(270,'Stunt jumps completed (stat)','int',500,'Stunts'),
 stat(274,'Cars stolen','int',100000,'Activities'),stat(275,'Bikes stolen','int',100000,'Activities'),
 stat(282,'Pay n Spray visits','int',100000,'Activities')
]);
export const EPISODE_STATS=Object.freeze({
 IV:GTA4_STATS,
 TLAD:Object.freeze([
   stat(133,'Game progress','float',100,'Progress'),
   stat(121,'Billy mission progress','float',100,'Progress'),
   stat(122,'Jim mission progress','float',100,'Progress'),
   stat(123,'Jim respect','float',100,'Relationships'),
   stat(124,'Jim like','float',100,'Relationships'),
   stat(125,'Stubbs mission progress','float',100,'Progress'),
   stat(126,'Ashley mission progress','float',100,'Progress'),
   stat(127,'Elizabeta mission progress','float',100,'Progress'),
   stat(128,'Ray mission progress','float',100,'Progress'),
   stat(129,'Terry respect','float',100,'Relationships'),
   stat(130,'Terry like','float',100,'Relationships'),
   stat(131,'Clay respect','float',100,'Relationships'),
   stat(132,'Clay like','float',100,'Relationships'),
   stat(136,'Air hockey games','float',100000,'Activities'),
   stat(137,'Air hockey victories','float',100000,'Activities'),
   stat(138,'Racers knocked off bikes','float',100000,'Activities'),
   stat(142,'Bike races won','float',100000,'Activities'),
   stat(143,'Seagulls exterminated','float',50,'Collectibles'),
   stat(144,'Bikes delivered','float',100000,'Activities'),
   stat(145,'Stubbs dirty laundry missions','float',100000,'Activities'),
   stat(167,'Backup calls','float',100000,'Activities'),
   stat(168,'Terry toughness','float',100,'Relationships'),
   stat(169,'Clay toughness','float',100,'Relationships'),
   stat(177,'Gang wars completed','float',100000,'Activities'),
   stat(178,'Hi-lo games played','float',100000,'Activities'),
   stat(179,'Hi-lo games won','float',100000,'Activities'),
   stat(180,'Arm wrestling games','float',100000,'Activities'),
   stat(181,'Arm wrestling victories','float',100000,'Activities'),
   ...COMMON_EPISODE_STATS
 ]),
 TBOGT:Object.freeze([
   stat(187,'Game progress','float',100,'Progress'),
   stat(188,'Tony mission progress','float',100,'Progress'),
   stat(191,'Yusuf mission progress','float',100,'Progress'),
   stat(192,'Mori mission progress','float',100,'Progress'),
   stat(195,'Henrique like','float',100,'Relationships'),
   stat(196,'Henrique respect','float',100,'Relationships'),
   stat(198,'Armando like','float',100,'Relationships'),
   stat(199,'Armando respect','float',100,'Relationships'),
   stat(200,'Ray Bulgarin progress','float',100,'Progress'),
   stat(201,'Rocco progress','float',100,'Progress'),
   stat(203,'Champagne consumed','float',100000,'Activities'),
   stat(204,'Times vomited','float',100000,'Activities'),
   stat(205,'Drinking-game wins','float',100000,'Activities'),
   stat(206,'People impressed with dancing','float',100000,'Activities'),
   stat(207,'Base jumps completed','float',10000,'Collectibles'),
   stat(209,'L.C. cage fight wins','float',100000,'Activities'),
   stat(210,'Races won','float',100000,'Activities'),
   stat(211,'Seagulls exterminated','float',50,'Collectibles'),
   stat(212,'Golf flags hit','float',100000,'Activities'),
   stat(229,'Cage fight earnings','float',100000000,'Economy'),
   stat(235,'Base jump earnings','float',100000000,'Economy'),
   stat(243,'Drug wars completed','float',100000,'Activities'),
   stat(244,'Nightclub missions completed','float',100000,'Activities'),
   stat(245,'Golf games played','float',100000,'Activities'),
   stat(246,'Golf victories','float',100000,'Activities'),
   ...COMMON_EPISODE_STATS
 ])
});
const episodeStatsById=Object.freeze(Object.fromEntries(Object.entries(EPISODE_STATS).map(([game,fields])=>[game,new Map(fields.map(s=>[s.id,s]))])));


/** GTA IV checksum is computed over all bytes before the checksum dword,
 * with the header's declared file size temporarily reduced by 12 bytes.
 * That 12-byte delta is the GFWL footer treatment used by PC saves.
 */
export function gta4Checksum(input,checksumOffset){
 const bytes=input instanceof Uint8Array?input:new Uint8Array(input);
 if(checksumOffset<12||checksumOffset>bytes.length-4)throw new RangeError('Invalid GTA IV checksum position.');
 let sum=0;
 for(let i=0;i<checksumOffset;i++){
   // Header file-size bytes: game uses filesize - 12 during checksum calculation.
   const value=(i>=4&&i<=7)?(((bytes.length-12)>>>((i-4)*8))&255):bytes[i];
   sum=(sum+value)>>>0;
 }
 return sum>>>0;
}
export class Gta4Save {
 constructor(input,{strictChecksum=true}={}){
   this.game='IV';this.bytes=asBytes(input);
   if(this.bytes.length<0x500||this.bytes.length>32*1024*1024)throw new Error('Unsupported GTA IV save size.');
   this.original=new Uint8Array(this.bytes);
   this.view=new DataView(this.bytes.buffer,this.bytes.byteOffset,this.bytes.byteLength);
   if(ascii(this.bytes,0x0c,4)!=='SAVE')throw new Error('Not a GTA IV PC save (SAVE header missing).');
   this.version=this.view.getUint32(0,true);
   if(this.version===0||this.version>1000)throw new Error('Unsupported GTA IV save version.');
   if(this.view.getUint32(4,true)!==this.bytes.length)throw new Error('GTA IV header declares an incorrect file length.');
   this.blocks=[];
   let p=0x110;
   for(let i=0;i<32;i++){
     if(p+9>this.bytes.length||ascii(this.bytes,p,5)!=='BLOCK')throw new Error(`GTA IV data block ${i} is missing or corrupted.`);
     const length=this.view.getUint32(p+5,true);
     if(length<9||length>this.bytes.length-p)throw new Error(`Invalid GTA IV block ${i} length.`);
     this.blocks.push({offset:p,start:p+9,length,bodyLength:length-9,end:p+length});p+=length;
   }
   this.checksumOffset=p;
   if(p+8>this.bytes.length||ascii(this.bytes,p+4,4)!=='END\0')throw new Error('GTA IV save footer is missing.');
   this.checksumValidOnLoad=this.view.getUint32(p,true)===gta4Checksum(this.bytes,p);
   if(strictChecksum&&!this.checksumValidOnLoad)throw new Error('GTA IV checksum mismatch. Import stopped to protect your save.');
   if(this.blocks[0].bodyLength<0xb0||this.blocks[1].bodyLength<0xc0)throw new Error('GTA IV player records are truncated.');
   if(this.blocks[13].bodyLength<0x1708)throw new Error('GTA IV statistics block is too short.');
   this.statsStart=this.blocks[13].bodyLength>=0x1720?0x6c:0x54;
   this.playerStart=this.blocks[1].start+0x10;
   this.game=detectGta4Episode(this.saveName);
   this.changes=new Set();
   // Confirm that every documented editable offset fits its own data block.
   for(const field of EPISODE_STATS[this.game])this.statOffset(field.id);
   for(const reward of GTA4_REWARDS)this.playerOffset(reward.offset,1);
 }
 blockOffset(index,offset,size=1){const block=this.blocks[index];if(!block||offset<0||offset+size>block.bodyLength)throw new RangeError(`Field exceeds GTA IV data block ${index}.`);return block.start+offset;}
 playerOffset(offset,size){return this.blockOffset(1,0x10+offset,size);}
 statOffset(id){if(!Number.isInteger(id)||!episodeStatsById[this.game].has(id))throw new RangeError('Unmapped GTA IV stat identifier.');return this.blockOffset(13,this.statsStart+id*4,4);}
 mark(offset,length){if(this.bytes.subarray(offset,offset+length).some((v,i)=>v!==this.original[offset+i]))this.changes.add(offset);else this.changes.delete(offset);}
 readU32(p){return this.view.getUint32(p,true);}setU32(p,v){this.view.setUint32(p,u32(v),true);this.mark(p,4);}
 get saveName(){let out='';for(let i=0;i<128;i++){const code=this.view.getUint16(0x10+i*2,true);if(!code)break;out+=String.fromCharCode(code);}return out;}
 set saveName(value){const name=String(value);if(detectGta4Episode(name)!==this.game)throw new Error('Save title must retain its original episode prefix (TLAD - / TBoGT -).');if(name===this.saveName)return;if(name.length>120)throw new RangeError('Title exceeds 120 UTF-16 characters.');for(let i=0;i<128;i++)this.view.setUint16(0x10+i*2,i<name.length?name.charCodeAt(i):0,true);this.mark(0x10,256);}
 get money(){return this.readU32(this.playerOffset(0x08,4));}set money(v){const p=this.playerOffset(0x08,4);this.setU32(p,v);this.setU32(this.playerOffset(0x10,4),v);}
 get health(){return this.view.getFloat32(this.playerOffset(0x50,4),true);}set health(v){const p=this.playerOffset(0x50,4);this.view.setFloat32(p,bounded(v,0,2000),true);this.mark(p,4);}
 get armor(){return this.view.getFloat32(this.playerOffset(0x54,4),true);}set armor(v){const p=this.playerOffset(0x54,4);this.view.setFloat32(p,bounded(v,0,2000),true);this.mark(p,4);}
 get maxHealth(){return this.view.getUint16(this.playerOffset(0x24,2),true);}set maxHealth(v){const n=bounded(v,1,2000);if(!Number.isInteger(n))throw new RangeError('Enter a whole number.');const p=this.playerOffset(0x24,2);this.view.setUint16(p,n,true);this.mark(p,2);}
 get maxArmor(){return this.view.getUint16(this.playerOffset(0x26,2),true);}set maxArmor(v){const n=bounded(v,1,2000);if(!Number.isInteger(n))throw new RangeError('Enter a whole number.');const p=this.playerOffset(0x26,2);this.view.setUint16(p,n,true);this.mark(p,2);}
 get cheatFlag(){return this.bytes[this.blockOffset(0,0x3c)]!==0;}set cheatFlag(v){const p=this.blockOffset(0,0x3c);this.bytes[p]=v?1:0;this.mark(p,1);}
 getReward(id){const r=GTA4_REWARDS.find(x=>x.id===id);if(!r)throw new RangeError('Unknown reward.');return this.bytes[this.playerOffset(r.offset,1)]!==0;}
 setReward(id,on){const r=GTA4_REWARDS.find(x=>x.id===id);if(!r)throw new RangeError('Unknown reward.');const p=this.playerOffset(r.offset,1);this.bytes[p]=on?1:0;this.mark(p,1);}
 getStat(id){const field=episodeStatsById[this.game].get(id);const p=this.statOffset(id);return field.type==='float'?this.view.getFloat32(p,true):this.view.getInt32(p,true);}
 setStat(id,value){const field=episodeStatsById[this.game].get(id);const p=this.statOffset(id);const n=bounded(value,field.min,field.max);if(field.type==='int'){if(!Number.isInteger(n))throw new RangeError('Enter a whole number.');this.view.setInt32(p,n,true);}else this.view.setFloat32(p,n,true);this.mark(p,4);}
 get progress(){return this.getStat(EPISODE_PROFILES[this.game].progressId);}
 get missionKey(){return this.saveName;}
 get stuntCount(){return this.readU32(this.blockOffset(15,5,4));}
 get stuntTotal(){return this.readU32(this.blockOffset(15,9,4));}
 get changeCount(){return this.changes.size;}
 export(){const output=new Uint8Array(this.bytes);const d=new DataView(output.buffer);if(this.changes.size){d.setUint32(this.checksumOffset,gta4Checksum(output,this.checksumOffset),true);}return output;}
 reset(){return new Gta4Save(this.original);}
}
