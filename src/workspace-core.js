import {routeForGame} from './routes.js';
const assetPath = (name) => (typeof document !== 'undefined' ? new URL('assets/'+name,document.baseURI).pathname : '/assets/'+name);
/** Independent in-memory workspaces for six PC Grand Theft Auto campaigns. */
export const GAME_GROUPS=Object.freeze([
  {id:'III',label:'GTA III',subtitle:'Liberty City · Claude',monogram:'III',route:routeForGame('III'),logo:assetPath('gta-iii.png')},
  {id:'VC',label:'GTA Vice City',subtitle:'Vice City · Tommy',monogram:'VC',route:routeForGame('VC'),logo:assetPath('gta-vc.png')},
  {id:'SA',label:'GTA San Andreas',subtitle:'San Andreas · CJ',monogram:'SA',route:routeForGame('SA'),logo:assetPath('gta-sa.png')},
  {id:'IV',label:'GTA IV',subtitle:'Liberty City · Niko',monogram:'IV',route:routeForGame('IV'),logo:assetPath('gta-iv.png')},
  {id:'TLAD',label:'The Lost and Damned',subtitle:'GTA IV episode · Johnny',monogram:'TLAD',route:routeForGame('TLAD'),logo:assetPath('gta-tlad.png')},
  {id:'TBOGT',label:'The Ballad of Gay Tony',subtitle:'GTA IV episode · Luis',monogram:'TBOGT',route:routeForGame('TBOGT'),logo:assetPath('gta-tbogt.png')},
]);
// View preferences are intentionally stored separately for each game.
export const WORKSPACE_SETTINGS=Object.freeze(['view','demo','sideFilter','skillGroup','statQuery','classicGroup','classicQuery','missionQuery','selectedSlot','ivGroup','ivQuery']);
const workspaceDefaults=()=>({save:null,fileName:null,view:'overview',demo:false,sideFilter:'all',skillGroup:'Body',statQuery:'',classicGroup:'Activities',classicQuery:'',missionQuery:'',selectedSlot:1,ivGroup:'Relationships',ivQuery:''});
export function makeWorkspace(){return Object.fromEntries(GAME_GROUPS.map(g=>[g.id,workspaceDefaults()]));}
export function gameForSave(save){
  const game=save?.game;
  if(!GAME_GROUPS.some(g=>g.id===game))throw new Error('Unsupported GTA save game.');
  return game;
}
export function belongsToWorkspace(save,game){return GAME_GROUPS.some(g=>g.id===game) && save?.game===game;}
export function assertWorkspaceSave(save,game){
  if(!GAME_GROUPS.some(g=>g.id===game))throw new Error('Unsupported game workspace.');
  if(save!=null && !belongsToWorkspace(save,game))throw new Error('Save belongs to a different GTA game. The save was not changed.');
}

