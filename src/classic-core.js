/**
 * GTA III and GTA Vice City original PC save codecs.
 * Block sizes, player structures and stat offsets documented by GTAMods:
 * https://gtamods.com/wiki/Saves_(GTA_3)
 * https://gtamods.com/wiki/Saves_(GTA_VC)
 * No fields are inferred from San Andreas stat identifiers.
 */
import {checksum, storedChecksum, SaveFormatError} from './save-core.js';

export const CLASSIC_GAMES = Object.freeze({
  III: {id:'III', name:'Grand Theft Auto III', short:'GTA III', player:'Claude', location:'Liberty City', size:0x3145C, blocks:20, info:16, stats:17, header:0x031401, filePrefix:'GTA3sf', folder:'GTA3 User Files'},
  VC: {id:'VC', name:'Grand Theft Auto: Vice City', short:'Vice City', player:'Tommy Vercetti', location:'Vice City', size:0x31464, blocks:23, info:18, stats:19, header:12609, acceptedHeaders:[12609,0x031401], filePrefix:'GTAVCsf', folder:'GTA Vice City User Files'}
});
const int=(offset,label,max=2000000000,group='General')=>({offset,label,type:'int',min:0,max,group});
const float=(offset,label,max=10000000,group='General')=>({offset,label,type:'float',min:0,max,group});

// Separate, game-specific schemas. No arbitrary raw-byte editing exposed.
export const CLASSIC_STATS = Object.freeze({
  III: [
    int(0x00,'People wasted by player'),int(0x04,'People wasted by others'),int(0x08,'Vehicles destroyed'),int(0x0C,'Shots made'),
    int(0x6C,'Helicopters destroyed'),int(0x70,'Completion points',100000,'Progress'),int(0x74,'Total completion points',100000,'Progress'),
    int(0x78,'Explosives used (kg)'),int(0x7C,'Bullets fired'),int(0x80,'Bullets that hit'),int(0x84,'Cars crushed'),int(0x88,'Headshots'),
    int(0x8C,'Times busted'),int(0x90,'Times wasted'),int(0x94,'Days passed'),int(0x98,'Rainfall (mm)'),
    float(0x9C,'Best insane jump distance',100000,'Stunts'),float(0xA0,'Best insane jump height',100000,'Stunts'),
    int(0xA4,'Most flips',1000,'Stunts'),int(0xA8,'Most rotations',1000,'Stunts'),
    int(0xB0,'Unique stunt jumps found',20,'Stunts'),int(0xB4,'Total stunt jumps',20,'Stunts'),
    int(0xB8,'Missions attempted',1000,'Progress'),int(0xBC,'Missions passed',1000,'Progress'),
    int(0xC0,'Taxi fares completed',10000,'Activities'),int(0xC4,'Money earned driving taxis'),
    int(0xD4,'Turismo best time (seconds)',100000,'Activities'),float(0xD8,'Distance traveled on foot'),float(0xDC,'Distance traveled by car'),
    int(0xE0,'Patriot Playground best time',100000,'Activities'),int(0xE4,'A Ride in the Park best time',100000,'Activities'),
    int(0xE8,'Gripped! best time',100000,'Activities'),int(0xEC,'Multistorey Mayhem best time',100000,'Activities'),
    int(0xF0,'Ambulance patients saved',100000,'Activities'),int(0xF4,'Criminals eliminated in Vigilante',100000,'Activities'),
    int(0xF8,'Highest Paramedic level',20,'Activities'),int(0xFC,'Fires extinguished',100000,'Activities'),
    int(0x100,'Longest Dodo flight',1000000,'Activities'),int(0x104,'Best bomb defusal time',100000,'Activities'),
    int(0x108,'Rampages completed',100,'Activities'),int(0x10C,'Total rampages',100,'Activities'),int(0x110,'Total missions',1000,'Progress')
  ],
  VC: [
    int(0x00,'People wasted by player'),int(0x04,'People wasted by others'),int(0x08,'Vehicles destroyed'),
    int(0x0C,'Boats destroyed'),int(0x10,'Tires popped'),int(0x14,'Bullets fired'),int(0x74,'Planes/helicopters destroyed'),
    float(0x78,'Completion points',100000,'Progress'),float(0x7C,'Total completion points',100000,'Progress'),
    int(0x80,'Explosives used (kg)'),int(0x84,'Bullets that hit'),int(0x88,'Headshots'),
    int(0x8C,'Wanted stars earned'),int(0x90,'Wanted stars evaded'),int(0x94,'Times busted'),int(0x98,'Times wasted'),
    int(0x9C,'Days passed'),int(0xA0,'Safehouse visits'),int(0xA4,'Sprayings'),
    float(0xA8,'Best insane jump distance',100000,'Stunts'),float(0xAC,'Best insane jump height',100000,'Stunts'),
    int(0xB0,'Most flips',1000,'Stunts'),int(0xB4,'Most rotations',1000,'Stunts'),
    int(0xBC,'Unique stunt jumps found',36,'Stunts'),int(0xC0,'Total stunt jumps',36,'Stunts'),
    int(0xC4,'Missions attempted',1000,'Progress'),int(0xC8,'Taxi fares completed',10000,'Activities'),
    int(0xCC,'Money earned driving taxis'),
    float(0xE4,'Distance traveled on foot'),float(0xE8,'Distance traveled by car'),float(0xEC,'Distance traveled by bike'),
    float(0xF0,'Distance traveled by boat'),float(0xF4,'Distance traveled by golf cart'),float(0xF8,'Distance traveled by helicopter'),
    float(0xFC,'Distance traveled by plane'),int(0x100,'Ambulance patients saved',100000,'Activities'),
    int(0x104,'Criminals eliminated in Vigilante',100000,'Activities'),int(0x108,'Fires extinguished',100000,'Activities'),
    int(0x10C,'Highest Vigilante level',40,'Activities'),int(0x110,'Highest Paramedic level',20,'Activities'),
    int(0x114,'Highest Firefighter level',20,'Activities'),int(0x118,'Photographs taken'),
    int(0x11C,'Rampages completed',100,'Activities'),int(0x120,'Total rampages',100,'Activities'),
    int(0x124,'Total missions',1000,'Progress'),int(0x128,'Flight hours',2000000000,'Activities'),
    int(0x12C,'Times drowned'),int(0x130,'Seagulls sniped'),
    float(0x134,'Weapon spending'),float(0x138,'Clothing spending'),
    float(0x140,'Stores robbed',10000,'Activities'),float(0x148,'Assassination contracts',1000,'Activities'),
    float(0x14C,'Pizzas delivered',10000,'Activities'),float(0x154,'Ice creams sold',100000,'Activities'),
    int(0x178,'Property purchases spending'),int(0x17C,'Vehicle repairs spending'),int(0x180,'Property destroyed'),
    int(0x184,'Properties owned',15,'Progress'),int(0x188,'Bloodring kills',10000,'Activities'),
    int(0x18C,'Bloodring survival time',100000,'Activities')
  ]
});
export const CLASSIC_ACTIVITIES = Object.freeze({
  III:[
    {name:'Paramedic',offset:0xF8,unit:'Highest level reached',goal:12,max:20,icon:'heart',reward:'neverTired'},
    {name:'Firefighter',offset:0xFC,unit:'Fires extinguished (no stored highest level)',goal:60,max:100000,icon:'flame'},
    {name:'Vigilante',offset:0xF4,unit:'Criminals killed (no stored highest level)',goal:60,max:100000,icon:'shield'},
    {name:'Taxi Driver',offset:0xC0,unit:'Passengers delivered',goal:100,max:10000,icon:'car'}
  ],
  VC:[
    {name:'Paramedic',offset:0x110,unit:'Highest level reached',goal:12,max:20,icon:'heart',reward:'neverTired'},
    {name:'Firefighter',offset:0x114,unit:'Highest level reached',goal:12,max:20,icon:'flame',reward:'fireProof'},
    {name:'Vigilante',offset:0x10C,unit:'Highest level reached',goal:12,max:40,icon:'shield',reward:'maxArmor'},
    {name:'Taxi Driver',offset:0xC8,unit:'Passengers delivered',goal:100,max:10000,icon:'car'},
    {name:'Pizza Boy',offset:0x14C,unit:'Pizzas delivered (counter only)',goal:55,max:10000,icon:'star'}
  ]
});
export const CLASSIC_REWARDS = Object.freeze({
  III:[{id:'neverTired',label:'Infinite sprint',offset:0x1B,description:'Player never gets tired'},
       {id:'fastReload',label:'Fast reload',offset:0x1C,description:'Faster weapon reload'},
       {id:'freeArrest',label:'Get out of jail free',offset:0x1D,description:'Avoid arrest cost'},
       {id:'freeHealth',label:'Free health care',offset:0x1E,description:'No hospital cost'}],
  VC:[{id:'neverTired',label:'Infinite sprint',offset:0x1B,description:'Paramedic reward'},
      {id:'fastReload',label:'Fast reload',offset:0x1C,description:'Weapon reload bonus'},
      {id:'fireProof',label:'Fireproof',offset:0x1D,description:'Firefighter reward'},
      {id:'maxHealth',label:'Maximum health cap',offset:0x1E,kind:'cap',description:'Numeric cap: 100 normal, 200 boosted'},
      {id:'maxArmor',label:'Maximum armor cap',offset:0x1F,kind:'cap',description:'Numeric cap: 100 normal, 200 boosted'},
      {id:'freeArrest',label:'Get out of jail free',offset:0x20,description:'Avoid arrest cost'},
      {id:'freeHealth',label:'Free health care',offset:0x21,description:'No hospital cost'},
      {id:'driveby',label:'Drive-by unlocked',offset:0x22,description:'Player can perform drive-bys'}]
});
function asBytes(input){return input instanceof Uint8Array?new Uint8Array(input):new Uint8Array(input);}
const assertFinite=(v,min,max)=>{const n=Number(v);if(!Number.isFinite(n)||n<min||n>max)throw new RangeError(`Enter a number from ${min} to ${max}.`);return n;};
const decodeName=(bytes,pos)=>{let text='';for(let i=0;i<24;i++){const code=bytes[pos+i*2]|(bytes[pos+i*2+1]<<8);if(!code)break;text+=String.fromCharCode(code);}return text;};
export class ClassicSave {
  constructor(input,game,{strictChecksum=true}={}){
    this.game=game;
    this.config=CLASSIC_GAMES[game];
    if(!this.config)throw new SaveFormatError('Unsupported game.');
    this.bytes=asBytes(input);
    if(this.bytes.length!==this.config.size)throw new SaveFormatError(`Expected ${this.config.short} save (${this.config.size} bytes).`);
    this.original=new Uint8Array(this.bytes);
    this.view=new DataView(this.bytes.buffer,this.bytes.byteOffset,this.bytes.byteLength);
    this.checksumValidOnLoad=checksum(this.bytes)===storedChecksum(this.bytes);
    if(strictChecksum&&!this.checksumValidOnLoad)throw new SaveFormatError('Invalid save checksum; this file may be corrupt.');
    this.blocks=[];
    let pos=0;
    for(let i=0;i<this.config.blocks;i++){
      if(pos+4>this.bytes.length-4)throw new SaveFormatError('Truncated save block table.');
      const size=this.view.getUint32(pos,true),start=pos+4,end=start+size;
      if(!size||end>this.bytes.length-4||end<=start)throw new SaveFormatError(`Invalid ${this.config.short} block ${i} length.`);
      this.blocks.push({start,end,size});pos=end;
    }
    const headerValue=this.view.getUint32(this.blocks[0].start+0x40,true);
    if(!(this.config.acceptedHeaders??[this.config.header]).includes(headerValue))
      throw new SaveFormatError(`Header 0x${headerValue.toString(16)} does not match supported ${this.config.short} PC variants.`);
    this.headerValue=headerValue;
    // Every main stats and player info block starts with a nested size prefix.
    for(const id of [this.config.info,this.config.stats,1]){
      const b=this.blocks[id];const inner=this.view.getUint32(b.start,true);
      if(inner<16||inner>b.size-4)throw new SaveFormatError(`Unexpected block ${id} substructure.`);
    }
    const ped=this.pedStart();
    if(ped+0x500>=this.blocks[1].end)throw new SaveFormatError('Player ped layout does not match this edition.');
    // Final documented field is [0x19C,0x1A4) in III and [0x22B,0x253) in VC.
    // The old probe read a byte PAST the last GTA III stat (0x1A4), rejecting valid saves.
    this.dataStart(this.config.stats,game==='III'?0x19C:0x22B,game==='III'?8:40);
    this.dataStart(this.config.info,0x23);
    const last=this.blocks[this.config.blocks-1];
    if(String.fromCharCode(...this.bytes.slice(last.start+4,last.start+7))!=='PTP')
      throw new SaveFormatError('Final ped-types block signature mismatch.');
    this.dirty=new Set();
  }
  blockStart(index,offset=0,len=1){const b=this.blocks[index];const p=b.start+offset;if(p<b.start||p+len>b.end)throw new RangeError('Write exceeds save block.');return p;}
  dataStart(index,offset=0,len=1){
    const b=this.blocks[index],inner=this.view.getUint32(b.start,true);
    const p=b.start+4+offset,limit=Math.min(b.end,b.start+4+inner);
    if(offset<0||len<1||p+len>limit)throw new SaveFormatError(`${this.config.short} has an incomplete or unsupported block ${index} (requested 0x${offset.toString(16)}). Refusing to modify it.`);
    return p;
  }
  pedStart(){const b=this.blocks[1];if(this.view.getUint32(b.start+4,true)!==1)throw new SaveFormatError('Expected one player ped.');return b.start+4+4+0x0A;}
  readInt(index,offset){return this.view.getInt32(this.dataStart(index,offset,4),true);}
  readFloat(index,offset){return this.view.getFloat32(this.dataStart(index,offset,4),true);}
  readByte(index,offset){return this.bytes[this.dataStart(index,offset,1)];}
  writeInt(index,offset,value,key){const n=assertFinite(value,0,2000000000);if(!Number.isInteger(n))throw new RangeError('Value must be an integer.');this.view.setInt32(this.dataStart(index,offset,4),n,true);this.dirty.add(key);}
  writeFloat(index,offset,value,key){const n=assertFinite(value,0,100000000);this.view.setFloat32(this.dataStart(index,offset,4),n,true);this.dirty.add(key);}
  writeByte(index,offset,value,key){const p=this.dataStart(index,offset,1);if(this.bytes[p]===value)return;this.bytes[p]=value;this.dirty.add(key);}
  get changeCount(){return this.dirty.size;}
  get saveName(){return decodeName(this.bytes,this.blocks[0].start);}
  set saveName(value){const name=String(value);if(name===this.saveName)return;if(name.length>23||[...name].some(c=>c.codePointAt(0)>0xFFFF||c==='\0'))throw new RangeError('Save title must fit in 23 UTF-16 characters.');const p=this.blockStart(0,0,48);this.bytes.fill(0,p,p+48);for(let i=0;i<name.length;i++)this.view.setUint16(p+i*2,name.charCodeAt(i),true);this.dirty.add('saveName');}
  get version(){return this.headerValue===0x031401 ? 'Classic PC (0x031401 variant)' : 'Classic PC';}
  get money(){return this.readInt(this.config.info,0);}
  set money(value){const n=assertFinite(value,0,2000000000);if(!Number.isInteger(n))throw new RangeError('Money must be a whole number.');this.writeInt(this.config.info,0,n,'money');this.writeInt(this.config.info,0x0F,n,'money');}
  get health(){return this.view.getFloat32(this.pedStart()+(this.game==='III'?0x2C0:0x354),true);}
  set health(value){this.view.setFloat32(this.pedStart()+(this.game==='III'?0x2C0:0x354),assertFinite(value,0,1000),true);this.dirty.add('health');}
  get armor(){return this.view.getFloat32(this.pedStart()+(this.game==='III'?0x2C4:0x358),true);}
  set armor(value){this.view.setFloat32(this.pedStart()+(this.game==='III'?0x2C4:0x358),assertFinite(value,0,1000),true);this.dirty.add('armor');}
  get packageCount(){return this.readInt(this.config.info,0x13);}
  set packageCount(value){const n=assertFinite(value,0,100);this.writeInt(this.config.info,0x13,n,'packages');}
  get missionKey(){const offset=this.game==='III'?0x19C:0x21F;const p=this.dataStart(this.config.stats,offset,8);return new TextDecoder('windows-1252').decode(this.bytes.subarray(p,p+8)).replace(/\0.*$/,'').trim();}
  get date(){const p=this.blocks[0].start;const year=this.view.getUint16(p+0x30,true),month=this.view.getUint16(p+0x32,true),day=this.view.getUint16(p+0x36,true),h=this.view.getUint16(p+0x38,true),m=this.view.getUint16(p+0x3A,true);
    if(year<1995||year>2100||month<1||month>12||day<1||day>31||h>23||m>59)return null;return new Date(year,month-1,day,h,m);}
  get progress(){const cur=this.getStat(this.game==='III'?0x70:0x78),total=this.getStat(this.game==='III'?0x74:0x7C);return total>0?Math.min(100,Math.max(0,cur/total*100)):0;}
  getStat(offset){const spec=CLASSIC_STATS[this.game].find(x=>x.offset===offset);if(!spec)throw new RangeError('Undocumented statistic field.');return spec.type==='float'?this.readFloat(this.config.stats,offset):this.readInt(this.config.stats,offset);}
  setStat(offset,value){const spec=CLASSIC_STATS[this.game].find(x=>x.offset===offset);if(!spec)throw new RangeError('Undocumented statistic field.');const n=assertFinite(value,spec.min,spec.max);if(spec.type==='float')this.writeFloat(this.config.stats,offset,n,`stat:${offset}`);else this.writeInt(this.config.stats,offset,n,`stat:${offset}`);}
  getReward(id){
    const f=CLASSIC_REWARDS[this.game].find(x=>x.id===id);
    if(!f)throw new RangeError('Unknown reward.');
    const value=this.readByte(this.config.info,f.offset);
    return f.kind==='cap'?value>=200:value!==0;
  }
  getRewardValue(id){
    const f=CLASSIC_REWARDS[this.game].find(x=>x.id===id);
    if(!f)throw new RangeError('Unknown reward.');
    return this.readByte(this.config.info,f.offset);
  }
  setReward(id,enabled){
    const f=CLASSIC_REWARDS[this.game].find(x=>x.id===id);
    if(!f)throw new RangeError('Unknown reward.');
    // VC max HP / armor fields are BYTE values, NOT boolean flags. 0xC8 = cap 200.
    const value=f.kind==='cap'?(enabled?200:100):(enabled?1:0);
    this.writeByte(this.config.info,f.offset,value,`reward:${id}`);
  }
  export(){const out=new Uint8Array(this.bytes);new DataView(out.buffer).setUint32(out.length-4,checksum(out),true);return out;}
  reset(){return new ClassicSave(this.original,this.game,{strictChecksum:this.checksumValidOnLoad});}
}
export function detectSave(input){
  const bytes=input instanceof Uint8Array?input:new Uint8Array(input);
  if(bytes.length===CLASSIC_GAMES.III.size)return new ClassicSave(bytes,'III');
  if(bytes.length===CLASSIC_GAMES.VC.size)return new ClassicSave(bytes,'VC');
  throw new SaveFormatError('Not a supported GTA III or Vice City classic PC save.');
}
