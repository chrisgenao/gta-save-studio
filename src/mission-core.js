/**
 * GTA San Andreas 1.00 ORIGINAL SCM mission-chain reader and guarded counter editor.
 * References:
 *  https://kb.speeddemosarchive.com/Grand_Theft_Auto:_San_Andreas/Missions/Chains
 *  https://kb.speeddemosarchive.com/Grand_Theft_Auto:_San_Andreas/Additional_Resources/Memory_Addresses
 *
 * IMPORTANT: A chain counter is not a complete mission transaction. We deliberately
 * do not claim that advancing it runs mission-end scripts (awards, pickups, phone
 * calls, world state). Every advanced write must be explicitly accepted in UI.
 */
const defs = [
  ['Introduction',448,'Big Smoke|Ryder'],
  ['Sweet',452,"Tagging up Turf|Cleaning the Hood|Drive-Thru|Nines and AK's|Drive-By|Sweet's Girl|Cesar Vialpando|Doberman|Los Sepulcros"],
  ['OG Loc',455,"Life's a Beach|Madd Dogg's Rhymes|Management Issues|House Party (cutscene)|House Party"],
  ['C.R.A.S.H. Los Santos',456,'Burning Desire|Gray Imports'],
  ['Ryder',453,'Home Invasion|Catalyst|Robbing Uncle Sam'],
  ['Big Smoke',454,'OG Loc|Running Dog|Wrong Side of the Tracks|Just Business'],
  ['Los Santos finale',458,'Reuniting the Families|The Green Sabre'],
  ['Lowrider',457,'High Stakes, Low Rider'],
  ['Badlands',493,'Badlands'],
  ['The Truth',491,'Body Harvest|Are You Going to San Fierro?'],
  ['Cesar',492,'Wu Zi Mu|Farewell, My Love...'],
  ['Catalina: Local Liquor Store',714,'Local Liquor Store'],
  ['Catalina: Small Town Bank',715,'Small Town Bank'],
  ['Catalina: Tanker Commander',716,'Tanker Commander'],
  ['Catalina: Against All Odds',717,'Against All Odds'],
  ['Garage',541,'Wear Flowers in Your Hair|Deconstruction'],
  ['Woozie',543,'Mountain Cloud Boys|Ran Fa Li|Lure|Amphibious Assault|The Da Nang Thang'],
  ['Syndicate',545,"Photo Opportunity|Jizzy (cutscene)|Jizzy|T-Bone Mendez|Mike Toreno|Outrider|Ice Cold Killa|Pier 69|Toreno's Last Flight|Yay Ka-Boom-Boom"],
  ['C.R.A.S.H. San Fierro',546,'555 We Tip|Snail Trail'],
  ['Zero',542,'Air Raid|Supply Lines...|New Model Army'],
  ['Wang Cars',544,'Zeroing In|Test Drive|Customs Fast Track|Puncture Wounds'],
  ['Toreno / Desert',593,'Monster|Highjack|Interdiction|Verdant Meadows|Learning to Fly|N.O.E.|Stowaway|Black Project|Green Goo'],
  ['Casino',597,"Fender Ketchup|Explosive Situation|You've Had Your Chips|Don Peyote|Intensive Care|The Meat Business|Fish in a Barrel|Freefall|Saint Mark's Bistro"],
  ['C.R.A.S.H. Las Venturas',598,'Misappropriation|High Noon'],
  ['Madd Dogg',599,'Madd Dogg'],
  ['Casino heist',600,"Architectural Espionage|Key to Her Heart|Dam and Blast|Cop Wheels|Up, Up and Away!|Breaking the Bank at Caligula's"],
  ['Mansion',626,'A Home in the Hills|Vertical Bird|Home Coming|Cut Throat Business'],
  ['Grove Street',627,'Beat Down on B-Dup|Grove 4 Life'],
  ['Finale',629,'Riot|Los Desperados|End of the Line (Part 1)|End of the Line (Part 2)|End of the Line'],
];

export const normalizeMission = name => String(name).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]/g,'');
const aliases = { highstakeslowrider:'High Stakes, Low Rider', bdup:'Beat Down on B-Dup', endoftheline:'End of the Line', jizzy:'Jizzy', houseparty:'House Party' };
export const MISSION_CHAINS = defs.map(([name, global, entry])=>({name,global,missions:entry.split('|')}));
export const MISSION_INDEX = new Map();
for(const chain of MISSION_CHAINS){
  chain.missions.forEach((name,index)=>{
    const id=normalizeMission(name);
    // In-game titles Jizzy and House Party refer to actual mission after cutscene.
    if(!name.toLowerCase().includes('(cutscene)') && !name.toLowerCase().includes('(part 1)') && !name.toLowerCase().includes('(part 2)')){
      MISSION_INDEX.set(id,{id,name,chain,index,threshold:chain.global===492?(index+1)*5:index+1});
    }
  });
}
// Story gate dependencies known from the original mission script's milestone chains.
// These are not asserted to be exhaustive. Unsupported prerequisites remain explicit.
const externalDeps = {
  taggingupturf:['Ryder'],
  reunitingthefamilies:['Just Business','Los Sepulcros','High Stakes, Low Rider','Gray Imports'],
  thegreensabre:['Reuniting the Families'],
  badlands:['The Green Sabre'],
  bodyharvest:['Badlands'],
  areyougoingtosanfierro:['Body Harvest','Farewell, My Love...'],
  wearflowersinyourhair:['Are You Going to San Fierro?'],
  photopportunity:['Wear Flowers in Your Hair'],
  mountaincloudboys:['Wear Flowers in Your Hair'],
  monster:["Yay Ka-Boom-Boom"],
  learningtofly:['Verdant Meadows'],
  noe:['Learning to Fly'],
  fenderketchup:['Learning to Fly'],
  architecturalespionage:['Fender Ketchup'],
  keytoherheart:['Architectural Espionage'],
  breakingthebankatcaligulas:['Up, Up and Away!'],
  ahomeinthehills:['Saint Mark\'s Bistro'],
  riot:['Grove 4 Life','Cut Throat Business'],
  losdesperados:['Riot'],
  endoftheline:['Los Desperados'],
};
// Extra state that a single mission-chain counter cannot prove. These *must* be
// verified by a full script/world-state mapper before writing complete passes.
const unverifiedExtra = {
  reunitingthefamilies:'All Los Santos branches and lowrider unlocks',
  thegreensabre:'All Los Santos finale world triggers',
  areyougoingtosanfierro:'Truth farm and San Fierro transition',
  yaykaboomboom:'Syndicate garage and building state',
  verdantmeadows:'Airstrip purchase / property and trigger state',
  learningtofly:'All flying-school tests and completion flag',
  noe:'Flying-school completion flag, not just mission-chain progress',
  keytoherheart:'Millie relationship initialization and keycard heist state',
  damandblast:'Keycard/mission setup, heist objectives and equipment',
  breakingthebankatcaligulas:'Millie keycard AND all heist preparations, crew and casino state',
  ahomeinthehills:'Mansion ownership and spawned world entities',
  homecoming:'Los Santos return, new gang-territory state',
  riot:'Late-game story unlock and territory state',
  losdesperados:'At least 35% gang territory and recruited gang members',
  endoftheline:'Final mission parts and their internal script state',
};
// First mission in an independent chain, or a special stage, often needs an
// unlock trigger that is not stored in the chain itself. Refuse edits by default.
const noFirstStageProof = new Set([
  455,456,453,454,457,493,491,492,714,715,716,717,541,543,545,546,
  542,544,593,597,598,599,600,626,627,629,
]);
export const GIRLFRIENDS = [
  {id:'denise',name:'Denise Robinson', global:383,stat:252, unlockedBy:'Burning Desire', description:'Introduced through Burning Desire'},
  {id:'michelle',name:'Michelle Cannes', global:384,stat:253, unlockedBy:'Are You Going to San Fierro?', description:'Encountered at Driving School in San Fierro'},
  {id:'helena',name:'Helena Wankstein', global:385,stat:254, unlockedBy:'The Green Sabre', description:'Available after countryside access'},
  {id:'barbara',name:'Barbara Schternvart', global:386,stat:255, unlockedBy:'The Green Sabre', description:'Available after desert/countryside access'},
  {id:'katie',name:'Katie Zhan', global:387,stat:256, unlockedBy:'Are You Going to San Fierro?', description:'Available after San Fierro access'},
  {id:'millie',name:'Millie Perkins', global:388,stat:257, unlockedBy:'Key to Her Heart', description:'Introduced during the casino heist setup'},
];

function readChain(save,chain){
  try{
    if(!save||save.game!=='SA' || save.version!=='1.00 Original')return null;
    const val=save.getScriptGlobal(chain.global);
    if(!Number.isInteger(val)||val<0||val>(chain.global===492?10:chain.missions.length))return null;
    return val;
  }catch{return null;}
}
export function missionStatus(save,id){
  const node=MISSION_INDEX.get(normalizeMission(id));
  if(!node)return {status:'unknown',reason:'No verified independent completion mapping'};
  const value=readChain(save,node.chain);
  if(value===null)return {status:'unknown',reason:'Original SCM counter is unavailable or inconsistent'};
  return {status:value>=node.threshold?'passed':'not-passed',node,value};
}
export function missionRequirements(save,id){
  const state=missionStatus(save,id);
  const checks=[];
  const node=state.node;
  if(!node)return {status:state.status,checks:[{ok:false,text:state.reason}],allowed:false};
  checks.push({ok:state.status!=='unknown',text:'Original 1.00 SCM counter is readable and in range'});
  let current=state.value;
  const step=node.chain.global===492?5:1;
  if(state.status==='passed')return {status:state.status,node,checks,allowed:false,already:true};
  checks.push({ok:current===node.threshold-step,text:`Previous steps in ${node.chain.name} are recorded (${current} / ${node.threshold-step})`});
  for(const dep of externalDeps[node.id]??[]){
    const check=missionStatus(save,dep);
    checks.push({ok:check.status==='passed',text:`Requires ${dep} to be passed (${check.status==='unknown'?'unverified':check.status==='passed'?'verified':'missing'})`});
  }
  if(node.index===0&&noFirstStageProof.has(node.chain.global))checks.push({ok:false,text:'The first mission of this chain needs a separate spawn/unlock condition not proven by this counter'});
  if(unverifiedExtra[node.id])checks.push({ok:false,text:`Additional game prerequisites not verified: ${unverifiedExtra[node.id]}`});
  let onMission=null;
  try{onMission=save.getScriptGlobal(433);}catch{}
  checks.push({ok:onMission===0,text:onMission===null?'Could not verify the active-mission script flag':onMission===0?'No mission currently in progress':'A mission appears active; edit refused'});
  // This is an *experimental counter operation*, not a complete mission completion.
  return {status:state.status,node,checks,allowed:checks.every(c=>c.ok),already:false,
    limitation:'Only a mission-chain progress variable is updated. The game may also require mission rewards, world state, calls, and asset flags. This is NOT a guaranteed equivalent of playing and passing the mission.'};
}
export function advanceMissionChain(save,id){
  const result=missionRequirements(save,id);
  if(!result.allowed)throw new Error('Mission-chain edit blocked: all documented prerequisites must be verified.');
  const {node}=result;
  save.setScriptGlobal(node.chain.global,node.threshold);
  return result;
}
export function girlfriendState(save,id){
  const gf=GIRLFRIENDS.find(g=>g.id===id);
  if(!gf)return null;
  const unlock=missionStatus(save,gf.unlockedBy);
  let internal=null,display=null;
  try{internal=save.getScriptGlobal(gf.global);display=save.stat(gf.stat);}catch{}
  const plausible=x=>Number.isInteger(x)&&x>=-100&&x<=100;
  return { ...gf, storyGate:unlock.status,internal:plausible(internal)?internal:null,display:plausible(display)?display:null,
    relationshipVerified:false,
    note:'A story prerequisite and relationship percentage do not prove the girlfriend is active. SCM bitfields, pickup/blip state, gifts and keycard flags require additional verification before an actual unlock or edit.' };
}
