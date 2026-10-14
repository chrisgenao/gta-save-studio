/**
 * San Andreas PC classic save codec. No external dependencies, no telemetry.
 * Offsets in each block are counted immediately after the ASCII 'BLOCK' marker.
 * Sources: https://gtamods.com/wiki/Saves_(GTA_SA)
 *          https://gtamods.com/wiki/List_of_statistics_(SA)
 */
export const SAVE_SIZE = 0x31800;
const encoder = new TextEncoder();
const ascii = new TextDecoder('windows-1252');
const MAGIC = [66, 76, 79, 67, 75]; // BLOCK

export class SaveFormatError extends Error {
  constructor(message) { super(message); this.name = 'SaveFormatError'; }
}

export function checksum(bytes) {
  let sum = 0;
  for (let i = 0; i < bytes.length - 4; i++) sum = (sum + bytes[i]) >>> 0;
  return sum >>> 0;
}
export function storedChecksum(bytes) {
  if (bytes.length < 4) throw new SaveFormatError('This is not a valid save file.');
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(bytes.length - 4, true);
}
function markerPositions(bytes) {
  const result = [];
  for (let i = 0; i + 5 <= bytes.length - 4; i++) {
    if (bytes[i] === MAGIC[0] && bytes[i + 1] === MAGIC[1] && bytes[i + 2] === MAGIC[2] && bytes[i + 3] === MAGIC[3] && bytes[i + 4] === MAGIC[4]) {
      result.push(i);
      i += 4;
    }
  }
  return result;
}
function inRange(value, min, max) { return Number.isFinite(value) && value >= min && value <= max; }
function cleanString(input, length) {
  const value = String(input).replace(/[\x00-\x1f\x7f-\x9f]/g, ' ').trim();
  const bytes = encoder.encode(value);
  if (bytes.length >= length) throw new RangeError(`Must be less than ${length} UTF-8 bytes.`);
  return bytes;
}
function makeStatOffset(id) {
  if (!Number.isInteger(id) || (id > 81 && id < 120) || id < 0 || id > 342) throw new RangeError('Unsupported San Andreas stat ID.');
  return id <= 81 ? id * 4 : 0x148 + (id - 120) * 4;
}
function assertNumber(value, min, max) {
  const number = Number(value);
  if (!inRange(number, min, max)) throw new RangeError(`Expected value from ${min} to ${max}.`);
  return number;
}
export const STAT = Object.freeze({
  PROGRESS: 0, TOTAL_PROGRESS: 1, FAT: 21, STAMINA: 22, MUSCLE: 23, MAX_HEALTH: 24,
  SEX_APPEAL: 25, RESPECT: 68, GAMBLING: 81, TIMES_BUSTED: 133, TIMES_WASTED: 135,
  TIMES_SAVED: 136, MISSIONS_ATTEMPTED: 146, MISSIONS_PASSED: 147,
  TAXI_FARES: 150, PARAMEDIC_SAVED: 151, VIGILANTE_KILLS: 152, FIRES: 153,
  VIGILANTE_LEVEL: 157, PARAMEDIC_LEVEL: 158, FIREFIGHTER_LEVEL: 159,
  DRIVING: 160, PIMP_LEVEL: 210, FLYING: 223, LUNG: 225,
  MOTORBIKE: 229, CYCLING: 230, SNAPSHOTS: 231, HORSESHOES: 241,
  OYSTERS: 243, UNIQUE_JUMPS: 145,
});

export const SKILLS = [
  { label: 'Fat', id: 21, max: 1000, group: 'Body' },
  { label: 'Stamina', id: 22, max: 1000, group: 'Body' },
  { label: 'Muscle', id: 23, max: 1000, group: 'Body' },
  { label: 'Sex appeal', id: 25, max: 1000, group: 'Body' },
  { label: 'Lung capacity', id: 225, max: 1000, group: 'Body' },
  { label: 'Respect', id: 68, max: 1000, group: 'Body' },
  { label: 'Driving', id: 160, max: 1000, group: 'Vehicle' },
  { label: 'Flying', id: 223, max: 1000, group: 'Vehicle' },
  { label: 'Motorcycle', id: 229, max: 1000, group: 'Vehicle' },
  { label: 'Cycling', id: 230, max: 1000, group: 'Vehicle' },
  { label: 'Pistol', id: 69, max: 1000, group: 'Weapons' },
  { label: 'Silenced pistol', id: 70, max: 1000, group: 'Weapons' },
  { label: 'Desert Eagle', id: 71, max: 1000, group: 'Weapons' },
  { label: 'Shotgun', id: 72, max: 1000, group: 'Weapons' },
  { label: 'Sawn-off shotgun', id: 73, max: 1000, group: 'Weapons' },
  { label: 'Combat shotgun', id: 74, max: 1000, group: 'Weapons' },
  { label: 'Micro SMG', id: 75, max: 1000, group: 'Weapons' },
  { label: 'SMG', id: 76, max: 1000, group: 'Weapons' },
  { label: 'AK-47', id: 77, max: 1000, group: 'Weapons' },
  { label: 'M4', id: 78, max: 1000, group: 'Weapons' },
  { label: 'Rifle', id: 79, max: 1000, group: 'Weapons' },
];

export const SIDE_MISSIONS = [
  { id:'firefighter', label:'Firefighter', stat:159, max:20, goal:12, icon:'flame', color:'orange', reward:'Fireproof CJ', rewardId:'fireproof', detail:'Highest level achieved. Reach level 12 to earn fire immunity.' },
  { id:'paramedic', label:'Paramedic', stat:158, max:20, goal:12, icon:'heart', color:'rose', reward:'Maximum health bonus', rewardId:'maxHealthBonus', detail:'Highest level achieved. Reward is awarded after level 12.' },
  { id:'vigilante', label:'Vigilante', stat:157, max:40, goal:12, icon:'shield', color:'cyan', reward:'Maximum armor bonus', rewardId:'maxArmorBonus', detail:'Highest level achieved. Reward is awarded after level 12.' },
  { id:'pimping', label:'Pimping', stat:210, max:20, goal:10, icon:'star', color:'violet', reward:'Prostitutes pay CJ', rewardId:'prostitutePay', detail:'Highest pimping level. Level 10 unlocks the benefit.' },
  { id:'taxi', label:'Taxi Driver', stat:150, max:500, goal:50, icon:'car', color:'yellow', reward:'All taxis have nitro', rewardId:'taxiNitro', detail:'Total fares/passengers dropped off; 50 completed fares earn the perk.' },
];

export const REWARD_FLAGS = [
  { id:'fireproof', label:'Fireproof', block:15, offset:0x22, detail:'Firefighter reward' },
  { id:'maxHealthBonus', label:'Max health bonus', block:15, offset:0x23, detail:'Paramedic reward' },
  { id:'maxArmorBonus', label:'Max armor bonus', block:15, offset:0x24, detail:'Vigilante reward' },
  { id:'prostitutePay', label:'Prostitutes pay CJ', block:0, offset:0x136, detail:'Pimping reward' },
  { id:'taxiNitro', label:'Nitro in all taxis', block:0, offset:0x135, detail:'Taxi driver reward' },
  { id:'infiniteSprint', label:'Infinite sprint', block:15, offset:0x20, detail:'Burglary reward' },
  { id:'fastReload', label:'Fast reload', block:15, offset:0x21, detail:'Weapon efficiency' },
  { id:'freeArrest', label:'One free arrest', block:15, offset:0x25, detail:'Protect from one arrest' },
  { id:'freeDeath', label:'One free hospital visit', block:15, offset:0x26, detail:'Protect from one death' },
  { id:'driveby', label:'Drive-by enabled', block:15, offset:0x27, detail:'Player ability' },
];

/** The original loaded bytes are never changed. All modifications live in copy. */
export class SaSave {
  get game() { return 'SA'; }
  constructor(input, { strictChecksum = true } = {}) {
    const bytes = input instanceof Uint8Array ? new Uint8Array(input) : new Uint8Array(input);
    if (bytes.length !== SAVE_SIZE) {
      throw new SaveFormatError(`Expected a classic PC save (${SAVE_SIZE.toLocaleString()} bytes), received ${bytes.length.toLocaleString()} bytes. Definitive Edition and PS2 saves are not supported.`);
    }
    if (bytes[0] !== 66 || bytes[1] !== 76 || bytes[2] !== 79 || bytes[3] !== 67 || bytes[4] !== 75) {
      throw new SaveFormatError('Missing GTA:SA BLOCK signature. Choose a classic PC GTASAsf#.b save file.');
    }
    this.original = new Uint8Array(bytes);
    this.bytes = bytes;
    this.view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    this.checksumValidOnLoad = checksum(bytes) === storedChecksum(bytes);
    if (strictChecksum && !this.checksumValidOnLoad) throw new SaveFormatError('The save checksum is invalid. Refusing to edit a possibly corrupted save.');
    const markers = markerPositions(bytes);
    if (markers.length < 28) throw new SaveFormatError('Not enough BLOCK sections were found. This save format is unsupported.');
    // A PC save may have a second occurrence of blocks 15-17 in padding. The
    // first numbered 28 blocks are the canonical sections.
    this.blocks = markers.slice(0, 28).map(position => position + 5);
    const b = this.blocks;
    const sane = markers[0] === 0 && b[1] - b[0] === 317 &&
      b[16] - b[15] === 49 && b[17] - b[16] === 1945 &&
      b[21] - b[20] === 109 && b[22] - b[21] === 264 &&
      b[24] - b[23] === 97;
    if (!sane) throw new SaveFormatError('BLOCK layout differs from the supported classic PC save format. No changes were made.');
    this.dirty = new Map();
  }
  at(block, offset, size = 1) {
    if (!Number.isInteger(block) || block < 0 || block > 27 || !Number.isInteger(offset) || offset < 0) throw new RangeError('Invalid save offset.');
    const start = this.blocks[block] + offset;
    const end = this.blocks[block + 1] ? this.blocks[block + 1] - 5 : this.bytes.length - 4;
    if (start + size > end) throw new RangeError('Attempted to read outside a save block.');
    return start;
  }
  getInt(block, offset) { return this.view.getInt32(this.at(block, offset, 4), true); }
  getUInt(block, offset) { return this.view.getUint32(this.at(block, offset, 4), true); }
  getFloat(block, offset) { return this.view.getFloat32(this.at(block, offset, 4), true); }
  getByte(block, offset) { return this.bytes[this.at(block, offset)]; }
  setInt(block, offset, value, key) {
    const n = assertNumber(value, -2147483648, 2147483647);
    if (!Number.isInteger(n)) throw new RangeError('A whole number is required.');
    this.view.setInt32(this.at(block, offset, 4), n, true); this.mark(key ?? `${block}:${offset}`);
  }
  setFloat(block, offset, value, key) {
    const n = assertNumber(value, -1e8, 1e8);
    this.view.setFloat32(this.at(block, offset, 4), n, true); this.mark(key ?? `${block}:${offset}`);
  }
  setByte(block, offset, value, key) {
    const n = assertNumber(value, 0, 255);
    if (!Number.isInteger(n)) throw new RangeError('A whole number is required.');
    this.bytes[this.at(block, offset)] = n; this.mark(key ?? `${block}:${offset}`);
  }
  mark(key) { this.dirty.set(key, true); }
  get changeCount() { return this.dirty.size; }
  get saveName() {
    const start = this.at(0, 4, 100);
    const raw = this.bytes.subarray(start, start + 100);
    const nullAt = raw.indexOf(0);
    return ascii.decode(nullAt < 0 ? raw : raw.subarray(0, nullAt)).trim();
  }
  set saveName(value) {
    const encoded = cleanString(value, 100);
    const start = this.at(0, 4, 100);
    this.bytes.fill(0, start, start + 100);
    this.bytes.set(encoded, start);
    this.mark('saveName');
  }
  get version() {
    const code = this.getUInt(0, 0);
    const known = { 0x35da8175: '1.00 Original', 0x65f3e583: '1.00 Modified', 0x9a6ebe58: '1.01 Original', 0x9345765e: '1.01 Modified', 0xfd148df6: '2.00 Original', 0x5d31cc22: '2.00 German' };
    return known[code] || `Unknown (0x${code.toString(16).toUpperCase()})`;
  }
  get cheatFlag() { return !!this.getByte(0, 0x90); }
  set cheatFlag(v) { this.setByte(0, 0x90, v ? 1 : 0, 'cheatFlag'); }
  get money() { return this.getInt(15, 4); }
  set money(value) {
    const n = assertNumber(value, 0, 2000000000);
    this.setInt(15, 4, n, 'money'); this.setInt(15, 0x10, n, 'money');
  }
  get health() { return this.getFloat(2, 0x20); }
  set health(value) { this.setFloat(2, 0x20, assertNumber(value, 0, 1000), 'health'); }
  get armor() { return this.getFloat(2, 0x24); }
  set armor(value) { this.setFloat(2, 0x24, assertNumber(value, 0, 1000), 'armor'); }
  get position() { return { x:this.getFloat(2,0x14), y:this.getFloat(2,0x18), z:this.getFloat(2,0x1C) }; }
  stat(id) {
    const offset = makeStatOffset(id);
    return id <= 81 ? this.getFloat(16, offset) : this.getInt(16, offset);
  }
  setStat(id, value) {
    const offset = makeStatOffset(id);
    if (id <= 81) this.setFloat(16, offset, value, `stat:${id}`);
    else this.setInt(16, offset, value, `stat:${id}`);
  }
  /** Read a global SCM slot in Block 1 of the ORIGINAL PC main.scm save. */
  getScriptGlobal(index) {
    if (!Number.isInteger(index) || index < 0 || index > 65535) throw new RangeError('Invalid SCM global index.');
    const size = this.getUInt(1, 0);
    const limit = this.blocks[2] - this.blocks[1] - 5;
    if (size < 4 || size % 4 !== 0 || size > limit - 4 || index * 4 + 4 > size) {
      throw new SaveFormatError('SCM global layout is unavailable or does not match the original script.');
    }
    return this.getInt(1, 4 + index * 4);
  }
  setScriptGlobal(index, value) {
    if (this.version !== '1.00 Original') throw new SaveFormatError('Story-script editing requires GTA SA original PC 1.00.');
    this.getScriptGlobal(index); // force all layout and size validation before writing
    this.setInt(1, 4 + index * 4, value, `script-global:${index}`);
  }
  get missionKey() {
    const start = this.at(16, 0x544, 8);
    return ascii.decode(this.bytes.slice(start, start + 8)).replace(/\0.*$/, '').trim();
  }
  get date() {
    const day = this.view.getUint16(this.at(0, 0x124, 2), true);
    const month = this.view.getUint16(this.at(0, 0x120, 2), true);
    const year = this.view.getUint16(this.at(0, 0x11e, 2), true);
    const hour = this.view.getUint16(this.at(0, 0x126, 2), true);
    const minute = this.view.getUint16(this.at(0, 0x128, 2), true);
    return year >= 2000 && year < 2100 && month >= 1 && month <= 12 && day >= 1 && day <= 31 && hour <= 23 && minute <= 59
      ? new Date(year, month - 1, day, hour, minute) : null;
  }
  get progress() {
    const made = this.stat(0), total = this.stat(1);
    return total > 0 ? Math.min(100, Math.max(0, made / total * 100)) : 0;
  }
  getReward(id) {
    const flag = REWARD_FLAGS.find(flag => flag.id === id);
    if (!flag) throw new RangeError('Unknown reward');
    return this.getByte(flag.block, flag.offset) !== 0;
  }
  setReward(id, enabled) {
    const flag = REWARD_FLAGS.find(flag => flag.id === id);
    if (!flag) throw new RangeError('Unknown reward');
    this.setByte(flag.block, flag.offset, enabled ? 1 : 0, `reward:${id}`);
  }
  get tagCount() { return this.getUInt(20, 0); }
  get sprayedTags() {
    const n = this.tagCount;
    if (n !== 100) return null;
    let count = 0;
    for (let i = 0; i < n; i++) if (this.getByte(20, 4 + i) === 255) count++;
    return count;
  }
  setAllTags(completed) {
    if (this.tagCount !== 100) throw new SaveFormatError('Unexpected tag count; no tag changes made.');
    for (let i = 0; i < 100; i++) this.setByte(20, 4 + i, completed ? 255 : 0, `tag:${i}`);
  }
  get jumpCount() { return this.getUInt(24, 0); }
  get completedJumps() {
    const count = this.jumpCount;
    if (count > 70) return null;
    let done = 0;
    for (let i = 0; i < count; i++) if (this.getByte(24, 4 + i * 68 + 64)) done++;
    return done;
  }
  setAllJumps(completed) {
    const n = this.jumpCount;
    if (n > 70) throw new SaveFormatError('Unexpected stunt jump count; no jump changes made.');
    for (let i = 0; i < n; i++) {
      this.setByte(24, 4 + i * 68 + 64, completed ? 1 : 0, `jump:${i}`);
      this.setByte(24, 4 + i * 68 + 65, completed ? 1 : 0, `jump:${i}`);
    }
    // This is a tracked stat; the individual stunt entries remain authoritative.
    this.setStat(144, completed ? n : 0);
    this.setStat(145, completed ? n : 0);
  }
  /** Always rebuild the checksum, preserving the original filename/slot elsewhere. */
  export() {
    const output = new Uint8Array(this.bytes);
    const sum = checksum(output);
    new DataView(output.buffer).setUint32(output.length - 4, sum, true);
    return output;
  }
  reset() { return new SaSave(this.original, { strictChecksum: this.checksumValidOnLoad }); }
}
