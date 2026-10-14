import { SaSave, SAVE_SIZE, SKILLS, SIDE_MISSIONS, REWARD_FLAGS, STAT } from './save-core.js';
import {ClassicSave,CLASSIC_GAMES,CLASSIC_STATS} from './classic-core.js';
import {missionStatus,missionRequirements,advanceMissionChain,girlfriendState,GIRLFRIENDS,normalizeMission,MISSION_INDEX} from './mission-core.js';
import {CLASSIC_NAV,renderClassic} from './classic-ui.js';
import {GAME_GROUPS,WORKSPACE_SETTINGS,makeWorkspace,gameForSave,assertWorkspaceSave} from './workspace-core.js';
import {HOME_PATH,routeForGame,gameForPath} from './routes.js';
import {Gta4Save,GTA4_NAV,GTA4_STATS,EPISODE_STATS,EPISODE_PROFILES,hdNavigation} from './gta4-core.js';
import {renderGta4} from './gta4-ui.js';

const state = { page:'home', save:null, fileName:null, view:'overview', demo:false, activeGame:'SA', expandedGame:null, workspaces:makeWorkspace(), pendingImportGame:null, sideFilter:'all', skillGroup:'Body', statQuery:'', errors:[], selectedSlot:1, classicGroup:'Activities', classicQuery:'', missionQuery:'', pendingMission:null, ivGroup:'Relationships', ivQuery:'' };
const $ = (selector) => document.querySelector(selector);
const fmt = new Intl.NumberFormat('en-US');
const moneyFmt = new Intl.NumberFormat('en-US', { style:'currency', currency:'USD', maximumFractionDigits:0 });
const nav = [ ['overview','layout-dashboard','Overview'], ['stats','activity','CJ Statistics'], ['missions','flag','Side Missions'], ['checklist','check','Mission Tracker'], ['collectibles','gem','Collectibles'], ['rewards','gift','Rewards & Perks'], ['inspector','terminal','Stat Inspector'], ['settings','settings','Save Settings'] ];
const icons = {
  'layout-dashboard':'<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
  'activity':'<path d="M3 12h4l3-8 4 16 3-8h4"/>', 'flag':'<path d="M5 21V5m0 0c4-4 8 4 16 0v11c-8 4-12-4-16 0"/>',
  'gem':'<path d="M6 3h12l4 6-10 12L2 9l4-6Z"/><path d="M2 9h20M8 3l4 18 4-18"/>',
  'gift':'<rect x="3" y="8" width="18" height="13" rx="2"/><path d="M12 8v13M3 12h18M12 8c-5 0-7-6-3-6 2 0 3 2 3 6Zm0 0c5 0 7-6 3-6-2 0-3 2-3 6Z"/>',
  'settings':'<path d="M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8ZM19.4 15a2 2 0 0 0 .4 2.2l-2 2a2 2 0 0 0-2.2-.4L12 21l-3.6-2.2a2 2 0 0 0-2.2.4l-2-2A2 2 0 0 0 4.6 15L3 12l1.6-3a2 2 0 0 0-.4-2.2l2-2A2 2 0 0 0 8.4 5L12 3l3.6 2a2 2 0 0 0 2.2-.2l2 2A2 2 0 0 0 19.4 9L21 12l-1.6 3Z"/>',
  'terminal':'<rect x="2" y="3" width="20" height="18" rx="2"/><path d="m6 9 4 3-4 3m7 0h5"/>',
  'upload':'<path d="M12 16V3m-5 5 5-5 5 5M4 16v4h16v-4"/>',
  'download':'<path d="M12 3v13m-5-5 5 5 5-5M4 17v4h16v-4"/>',
  'lock':'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  'shield':'<path d="m12 2 9 4v6c0 6-4 9-9 10-5-1-9-4-9-10V6l9-4Z"/>',
  'heart':'<path d="M20.8 4.8a5.6 5.6 0 0 0-7.9 0l-.9.9-.9-.9a5.6 5.6 0 0 0-7.9 7.9 5.6 5.6 0 0 0 0 7.9l.9.9L12 21l7.9-8.3.9-.9a5.6 5.6 0 0 0 0-7.9Z"/>',
  'flame':'<path d="M12 22c4.5 0 8-3 8-8 0-3-1.5-5-4-7 0 3-2 4-2 4-1-3-1-6-4-9 0 4-2 6-4 9-4 6 0 11 6 11Z"/>',
  'car':'<path d="m5 17-1 3H2v-9l3-6h14l3 6v9h-2l-1-3H5ZM2 12h20M5 16h2m10 0h2M7 5l-2 7m12-7 2 7"/>',
  'star':'<path d="m12 2 3.2 6.6 7.3 1.1-5.3 5.2 1.3 7.2-6.5-3.4-6.5 3.4 1.3-7.2L1.5 9.7l7.3-1.1L12 2Z"/>',
  'folder':'<path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v11H3V7Z"/>',
  'check':'<path d="m4 12 5 5L20 6"/>', 'chevron':'<path d="m9 18 6-6-6-6"/>',
  'refresh':'<path d="M20 7v6h-6M4 17v-6h6"/><path d="M5 9a8 8 0 0 1 14-2l1 2M4 15l1 2a8 8 0 0 0 14-2"/>',
  'edit':'<path d="M12 20h9M4 16l12-12 4 4L8 20H4v-4Z"/>',
  'info':'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
  'alert':'<path d="m12 2 10 18H2L12 2Zm0 7v5m0 3h.01"/>',
  'search':'<circle cx="10.5" cy="10.5" r="7.5"/><path d="m16 16 6 6"/>',
  'arrow':'<path d="M5 12h14m-6-6 6 6-6 6"/>',
  'x':'<path d="M18 6 6 18M6 6l12 12"/>',
  'menu':'<path d="M4 7h16M4 12h16M4 17h16"/>',
  'panel-left-close':'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18m7-12-3 3 3 3"/>',
  'panel-left-open':'<rect x="3" y="3" width="18" height="18" rx="2"/> <path d="M9 3v18m4-6 3-3-3-3"/>',
  'clock':'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  'globe':'<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/>',
  'zap':'<path d="m13 2-10 12h8l-1 8 11-12h-8l1-8Z"/>',
};
function icon(name, size=18) { return `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${icons[name] || icons.info}</svg>`; }
function escapeHtml(v) { return String(v ?? '').replace(/[&<>"']/g, ch=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }
function numeric(value, digits=0) { return Number.isFinite(value) ? digits ? Number(value).toFixed(digits) : fmt.format(Math.round(value)) : '—'; }
function actualStat(id, fallback=0) { return state.save ? state.save.stat(id) : state.demo ? (demoStats[id] ?? fallback) : fallback; }
function actual(key, fallback) { return state.save ? state.save[key] : state.demo ? (demoValues[key] ?? fallback) : fallback; }
const demoValues = { saveName:"Breaking the Bank at Caligula's", version:'1.00 Original', progress:72.19, money:1961510, health:176, armor:150, cheatFlag:false, missionKey:'HEIST9', sprayedTags:100, completedJumps:70, date:new Date('2026-10-13T13:13:00') };
const demoStats = { 0:130.7, 1:181.05, 21:15, 22:950, 23:870, 25:760, 68:960, 69:1000, 70:900, 71:1000, 72:450, 75:970, 77:1000, 78:1000, 133:1, 135:14, 136:43, 145:70, 147:95, 150:50, 157:12, 158:12, 159:0, 160:1000, 210:10, 223:980, 225:600, 229:600, 230:700, 231:50, 241:50, 243:50 };
const ready = () => !!state.save;

function currentNav() { return state.activeGame==='SA' ? nav : ['IV','TLAD','TBOGT'].includes(state.activeGame) ? hdNavigation(state.activeGame) : CLASSIC_NAV; }
function currentPrefix() { return ['IV','TLAD','TBOGT'].includes(state.activeGame) ? 'SGTA4' : state.activeGame==='SA' ? 'GTASAsf' : CLASSIC_GAMES[state.activeGame].filePrefix; }
function outputName(slot=state.selectedSlot) { return ['IV','TLAD','TBOGT'].includes(state.activeGame) ? `SGTA4${String(slot-1).padStart(2,'0')}` : `${currentPrefix()}${slot}.b`; }
// Keep only UI preferences per game; actual save bytes belong to one active session.
function rememberWorkspace(){
  const workspace=state.workspaces[state.activeGame];
  for(const name of WORKSPACE_SETTINGS)workspace[name]=state[name];
}
function activateWorkspace(game,{save,fileName}={}){
  if(!GAME_GROUPS.some(g=>g.id===game))throw new Error('Unsupported game.');
  if(save!==undefined){
    assertWorkspaceSave(save,game);
    if((game==='SA' && !(save instanceof SaSave)) || (['IV','TLAD','TBOGT'].includes(game) && !(save instanceof Gta4Save)) || (!['SA','IV','TLAD','TBOGT'].includes(game) && !(save instanceof ClassicSave))){
      throw new Error('Imported save codec does not match the selected game.');
    }
  }
  rememberWorkspace();
  if(state.activeGame!==game){
    // Prevent the site from retaining a collection of uploaded save files.
    state.save=null;
    state.fileName=null;
    state.demo=false;
  }
  state.activeGame=game;
  const workspace=state.workspaces[game];
  if(save!==undefined){
    state.save=save;
    state.fileName=fileName;
    Object.assign(workspace,{view:'overview',demo:false});
  }
  for(const name of WORKSPACE_SETTINGS)state[name]=workspace[name];
  assertWorkspaceSave(state.save,game);
  state.expandedGame=game;
  state.pendingMission=null;
}
function confirmDiscard({replacing=false}={}){
  if(!ready() || state.save.changeCount===0)return true;
  const purpose=replacing?'open a different file':'switch game editors';
  return window.confirm(`You have ${state.save.changeCount} pending change(s) to ${state.fileName || 'the open save'}. Download the edited save before you ${purpose}. Discard these changes and continue?`);
}
function assetPath(name){return `${HOME_PATH}assets/${name}`;}
function logo(game){
 const entry=GAME_GROUPS.find(g=>g.id===game);
 return `<img class="game-logo" src="${entry.logo}" alt="${escapeHtml(entry.label)} logo" loading="lazy" />`;
}
function renderNavigation() {
 const onHome=state.page==='home';
 const menu=currentNav();
 $('#navigation').innerHTML=`<a href="${HOME_PATH}" class="nav-link home-nav-link ${onHome?'active':''}" data-home="true" ${onHome?'aria-current="page"':''}>${icon('layout-dashboard',17)}<span>Main Dashboard</span>${onHome?'<span class="nav-arrow">›</span>':''}</a><div class="game-nav-heading">YOUR GAMES</div>`+GAME_GROUPS.map(group=>{
  const expanded=!onHome&&state.expandedGame===group.id,active=!onHome&&state.activeGame===group.id;
  const groupMenu=group.id==='SA'?nav:['IV','TLAD','TBOGT'].includes(group.id)?hdNavigation(group.id):CLASSIC_NAV;
  return `<section class="game-nav-group ${expanded?'is-expanded':''} ${active?'is-current':''}">
   <button class="game-accordion game-${group.id.toLowerCase()}" type="button" data-game="${group.id}" aria-expanded="${expanded}" aria-controls="game-nav-${group.id}" aria-label="Open ${escapeHtml(group.label)}">
   <span class="game-accordion-logo">${logo(group.id)}</span><span class="game-accordion-copy"><strong>${escapeHtml(group.label)}</strong><small>${escapeHtml(group.subtitle)}</small></span>
   <span class="game-accordion-end">${icon('chevron',14)}</span></button>
   <div id="game-nav-${group.id}" class="game-accordion-panel" ${expanded?'':'hidden'}>
    ${groupMenu.map(([id,glyph,label])=>`<button class="nav-link ${active&&state.view===id?'active':''}" data-view="${id}" data-game-scope="${group.id}" type="button">${icon(glyph,17)} <span>${label}</span>${active&&state.view===id?'<span class="nav-arrow">›</span>':''}</button>`).join('')}
   </div></section>`;
 }).join('');
 const group=GAME_GROUPS.find(g=>g.id===state.activeGame);
 $('#crumb-label').textContent=onHome?'Dashboard':(menu.find(x=>x[0]===state.view)?.[2]??'Overview');
 $('.brand-symbol').innerHTML='GTA<span>+</span>';
 $('.brand-type > span').textContent=onHome?'SIX CAMPAIGN SAVE GARAGE':`${group.label} edition`;
 $('.breadcrumbs > span:first-child').textContent=onHome?'GTA SAVE STUDIO':`${group.label.replace('GTA: ','')} / EDITOR`;
 $('#top-file-state').innerHTML=onHome
  ? `${icon('shield',15)} Upload · Edit · Download`
  : `<span class="status-dot ${ready()?'ready':''}"></span> ${ready()?escapeHtml(state.fileName):state.demo?'Preview mode':'Choose a save file'}`;
 document.querySelectorAll('[data-action="export"]').forEach(button=>{
  button.hidden=onHome;
  button.disabled=onHome||!ready();
  button.title=ready()?'Export the active game save':'Import a save for this game first';
 });
}
function viewHome(){
 const previews={TLAD:{name:'The Lost and Damned',player:'Johnny Klebitz',tag:'EPISODE ONE',caption:'Manage Johnny’s cash, health, biker relationships, gang wars, races, seagulls and safe activity records.',features:'Johnny · Gang wars · Biker stats · Rewards'},TBOGT:{name:'The Ballad of Gay Tony',player:'Luis Lopez',tag:'EPISODE TWO',caption:'Explore Luis’s nightclub stats, drug wars, base jumps, cage fights, golf and player perks.',features:'Luis · Nightlife · Base jumps · Rewards'},IV:{name:'GTA IV',player:'Niko Bellic',tag:'THE HD ERA',caption:'Dive into Liberty City, edit Niko’s money, health, armor, stats, friendships and verified save rewards.',features:'Niko · Friendships · Stunt jumps · Rewards'},III:{name:'Liberty City',player:'Claude',tag:'THE ORIGINAL',caption:'Return to the streets of Liberty City. Edit player records, side activities, hidden packages and documented perks.',features:'Statistics · Activities · Packages · Rewards'},VC:{name:'Vice City',player:'Tommy Vercetti',tag:'NEON LEGENDS',caption:'Manage Tommy’s stats, story completion percentage, side activities, hidden packages and bonuses.',features:'Statistics · Activities · Packages · Rewards'},SA:{name:'San Andreas',player:'Carl Johnson',tag:'WEST COAST CLASSIC',caption:'Unlock CJ’s editor with skill sliders, mission tracker, relationships, collectibles and rewards.',features:'Skills · Mission tracker · Relationships · Rewards'}};
 return `<section class="home-hero"><div class="home-hero-copy"><span class="eyebrow">WELCOME TO THE GARAGE</span><h1>Six campaigns.<br/><em>One save studio.</em></h1><p>Upload a GTA PC save from your device, make your edits in the matching game editor, and download the result. No accounts, uploads to a server, or cloud storage.</p><div class="home-hero-actions"><button class="button button-primary" data-action="upload">${icon('upload',17)} Choose a save to edit</button><span class="home-status">${icon('lock',15)} Private · One file at a time</span></div></div><div class="home-hero-logos" aria-hidden="true"><img src="${assetPath('gta-iii.png')}" alt=""/><img src="${assetPath('gta-vc.png')}" alt=""/><img src="${assetPath('gta-sa.png')}" alt=""/><img src="${assetPath('gta-iv.png')}" alt=""/></div></section>
 <div class="section-header home-section-title"><div><h3>Choose your game</h3><p>Open a dedicated editor, select a local save, make changes, then export it. Switching games closes the current save.</p></div><span class="small-label">SUPPORTED PC GAMES</span></div>
 <section class="home-game-grid">${GAME_GROUPS.map(group=>{
  const game=group.id,info=previews[game];
  return `<article class="home-game-card home-game-${game.toLowerCase()}"><div class="home-game-card-head"><span class="home-game-edition">${info.tag}</span></div><div class="home-logo-stage">${logo(game)}<div class="home-card-aura"></div></div><div class="home-game-body"><span class="home-game-eyebrow">${escapeHtml(group.label)} · ${escapeHtml(info.player)}</span><h3>${info.name}</h3><p>${info.caption}</p><div class="home-feature-note">${info.features}</div><div class="home-card-actions"><a href="${routeForGame(game)}" class="button button-primary home-open-link" data-open-game="${game}">Open editor ${icon('arrow',16)}</a><button type="button" class="button button-quiet home-import" data-action="upload" data-import-game="${game}" aria-label="Choose ${escapeHtml(group.label)} save">${icon('upload',16)}</button></div></div></article>`;
 }).join('')}</section>
 <section class="home-info-strip"><div>${icon('lock',23)}<span><strong>Private by design</strong><small>No cloud uploads or server-side save storage</small></span></div><div>${icon('shield',23)}<span><strong>One-file editing</strong><small>Import, modify and download — no save library</small></span></div><div>${icon('download',23)}<span><strong>Original preserved</strong><small>Export a new game save with its checksum</small></span></div></section>`;
}
function heading(eyebrow,title,subtitle) { return `<div class="page-heading"><div><span class="eyebrow">${eyebrow}</span><h1>${title}</h1><p>${subtitle}</p></div><div class="heading-actions">${ready()?`<button class="button button-quiet" data-action="reset">${icon('refresh',16)} Reset changes</button><button class="button button-primary" data-action="export">${icon('download',17)} Export save</button>`:''}</div></div>`; }
function guard() { return !ready() ? `<div class="preview-bar">${icon('info',16)} ${state.demo?'You are exploring a sample dashboard. Upload a real .b save to unlock editing and exporting.':'Upload a classic PC save to load your real values and make changes.'}<button data-action="upload">Choose save ${icon('arrow',14)}</button></div>` : ''; }
function metric(iconName, label, value, small, accent) { return `<div class="metric-card"><div class="metric-head"><span>${label}</span><span class="metric-glyph ${accent}">${icon(iconName,17)}</span></div><div class="metric-value">${value}</div><div class="metric-foot">${small}</div></div>`; }
function miniBar(label,val,max,side) { let pct=Math.min(100, Math.max(0, Math.round(val/max*100))); return `<div class="mini-bar"><div class="mini-bar-title"><span>${label}</span><b>${numeric(val)} <small>/ ${numeric(max)}</small></b></div><div class="track"><span style="width:${pct}%"></span></div>${side?`<small>${side}</small>`:''}</div>`; }
function viewOverview() {
  const loaded=ready()||state.demo;
  const money=actual('money',0), progress=actual('progress',0), health=actual('health',0), armor=actual('armor',0);
  const mission=actual('saveName','Not loaded');
  const bodyStats=[SKILLS[1],SKILLS[2],SKILLS[6],SKILLS[7]];
  return `${heading('SAN ANDREAS WORKSPACE', 'CJ. Your save. Your rules.', 'Exclusively for Grand Theft Auto: San Andreas original PC saves. GTA III and Vice City have their own separate workspaces.')}
    <section class="hero-card"><div class="hero-content"><span class="hero-kicker">${icon('zap',15)} GTA SAN ANDREAS // ORIGINAL PC SAVES</span><h2>Every stat.<br/><em>Every advantage.</em></h2><p>Inspect CJ’s skills, gangs, missions, collectibles and unlocks in your San Andreas save. Changes stay on your device.</p><div class="hero-actions"><button class="button button-primary" data-action="upload" data-import-game="SA">${icon('upload',17)} ${ready()?'Replace San Andreas save':'Import San Andreas save'}</button>${!ready()?'<button class="button button-ghost" data-action="demo">Explore CJ sample <span>↗</span></button>':'<span class="hero-upload-note">Your San Andreas save is ready</span>'}</div></div><div class="hero-art" aria-hidden="true"><div class="halo halo-a"></div><div class="halo halo-b"></div>${logo('SA')}<span class="hero-art-tag">LOS SANTOS <i>•</i> 1992</span><span class="hero-art-coord">34°00' / 118°22'</span></div></section>
    ${!ready()&&!state.demo?`<div class="game-support-panel"><div class="section-header"><div><h3>San Andreas save file</h3><p>Import GTASAsf1.b through GTASAsf8.b from your original GTA San Andreas PC installation. GTA III and Vice City editors live in the other two sidebar sections.</p></div><span class="small-label">SAN ANDREAS ONLY</span></div><div class="san-andreas-import-info">${icon('shield',18)} <span>San Andreas skills, mission prerequisites, girlfriend tracking, and world records are available only within this section.</span></div></div>`:''}
    ${guard()}
    <div class="section-header"><div><h3>Save at a glance</h3><p>${ready()?'Live data from your imported save':state.demo?'Sample values for layout preview':'Your save information will appear here once loaded'}</p></div><span class="small-label">${ready()?'LIVE SAVE DATA':state.demo?'DEMO PREVIEW':'WAITING FOR FILE'}</span></div>
    <section class="metric-grid">${metric('flag','GAME COMPLETION',`${numeric(progress,2)}%`,'Overall progress','violet')}${metric('car','PLAYER CASH',moneyFmt.format(money),'Available in your wallet','cyan')}${metric('heart','CURRENT HEALTH',numeric(health,1),'CJ health points','rose')}${metric('shield','CURRENT ARMOR',numeric(armor,1),'Protection level','orange')}</section>
    <div class="content-columns">
      <section class="panel"><div class="panel-title-row"><div><h3>Character overview</h3><p>Skill distribution</p></div><button class="text-button" data-view="stats">Edit stats ${icon('arrow',15)}</button></div>${bodyStats.map(s=>miniBar(s.label, actualStat(s.id,0),s.max)).join('')}</section>
      <section class="panel"><div class="panel-title-row"><div><h3>Save information</h3><p>Classic San Andreas profile</p></div><span class="status-pill ${loaded?'good':''}">${loaded?'● Loaded':'● Empty'}</span></div><div class="info-list"><div><span>Savegame title</span><strong>${escapeHtml(mission)}</strong></div><div><span>Game version</span><strong>${escapeHtml(actual('version','—'))}</strong></div><div><span>Last mission key</span><strong class="monospace">${escapeHtml(actual('missionKey','—')||'—')}</strong></div><div><span>Times busted</span><strong>${numeric(actualStat(133,0))}</strong></div><div><span>Times wasted</span><strong>${numeric(actualStat(135,0))}</strong></div><div><span>Used cheats flag</span><strong class="${actual('cheatFlag',false)?'negative':'positive'}">${actual('cheatFlag',false)?'Yes':'No'}</strong></div><div><span>Pending changes</span><strong class="positive">${state.save?.changeCount??0} edits</strong></div></div></section>
    </div>
    <div class="section-header space-top"><div><h3>Quick access</h3><p>Jump into the most popular save modifications.</p></div></div>
    <section class="quick-grid"><button data-view="missions" class="quick-card"><span class="quick-icon warm">${icon('flame',24)}</span><div><strong>Side missions</strong><small>Edit levels & mission rewards</small></div>${icon('arrow',17)}</button><button data-view="collectibles" class="quick-card"><span class="quick-icon purple">${icon('gem',24)}</span><div><strong>Collectibles</strong><small>Tags, jumps and stats</small></div>${icon('arrow',17)}</button><button data-view="inspector" class="quick-card"><span class="quick-icon blue">${icon('terminal',24)}</span><div><strong>Stat inspector</strong><small>Access all stored stat IDs</small></div>${icon('arrow',17)}</button></section>`;
}
function skillCard(s) {
  const val=actualStat(s.id,0); const pct=Math.max(0,Math.min(100, val/s.max*100));
  return `<div class="skill-card"><div class="skill-header"><span>${escapeHtml(s.label)}</span><strong data-stat-read="${s.id}">${numeric(val)}<small> / ${s.max}</small></strong></div><input class="range-input" type="range" min="0" max="${s.max}" step="1" value="${Math.max(0,Math.min(s.max,Math.round(val)))}" data-stat-range="${s.id}" ${!ready()?'disabled':''} style="--fill:${pct}%" aria-label="${escapeHtml(s.label)}"/><div class="skill-bottom"><small>${pct>=100?'MAXED OUT':pct>=80?'HIGH SKILL':'SKILL LEVEL'}</small><label>Set exact <input type="number" min="0" max="${s.max}" step="1" value="${Math.round(val)}" data-stat-exact="${s.id}" ${!ready()?'disabled':''}/></label></div></div>`;
}
function viewStats() { const group=state.skillGroup; const stats=SKILLS.filter(s=>s.group===group);
  return `${heading('PLAYER EDITOR','CJ Statistics','Shape CJ into exactly the character you want with live skill sliders and exact values.')}${guard()}
    <div class="tab-row">${['Body','Vehicle','Weapons'].map(g=>`<button class="tab ${group===g?'selected':''}" data-skill-group="${g}">${g==='Body'?icon('heart',17):g==='Vehicle'?icon('car',17):icon('zap',17)} ${g} <span>${SKILLS.filter(s=>s.group===g).length}</span></button>`).join('')}</div>
    <div class="section-header"><div><h3>${group} statistics</h3><p>Drag a slider or type a precise value. Changes are made in memory until export.</p></div>${ready()?'<button class="button button-outline button-small" data-action="max-group">Max this category</button>':''}</div>
    <section class="skills-grid">${stats.map(skillCard).join('')}</section>
    <section class="panel note-panel">${icon('info',19)}<div><strong>How the sliders work</strong><p>Displayed values are real stat values from the save, not just percentages. Most attributes use a 0–1,000 scale. For health and armor, use the quick edit panel below. Some game HUD labels use a different scale.</p></div></section>
    <section class="panel"><div class="panel-title-row"><div><h3>Player essentials</h3><p>Update CJ's current condition and wallet.</p></div></div><div class="essential-grid">${essentialInput('money','Cash ($)',0,2000000000,1)}${essentialInput('health','Current health',0,1000,0.1)}${essentialInput('armor','Current armor',0,1000,0.1)}</div></section>`;
}
function essentialInput(key,label,min,max,step) { return `<label class="field"><span>${label}</span><input type="number" min="${min}" max="${max}" step="${step}" data-field="${key}" value="${ready()||state.demo?actual(key,0):0}" ${!ready()?'disabled':''}/></label>`; }
function levelCard(m) { const val=actualStat(m.stat,0); const achieved=val>=m.goal; const reward = ready()?state.save.getReward(m.rewardId):state.demo ? achieved : false;
  return `<article class="mission-card"><div class="mission-head"><div class="mission-icon ${m.color}">${icon(m.icon,24)}</div><div class="mission-name"><h3>${m.label}</h3><span>Goal: ${m.goal===50?'50 fares':`level ${m.goal}`}</span></div><span class="status-pill ${achieved?'good':'pending'}">${achieved?'Goal reached':'In progress'}</span></div><p>${m.detail}</p><div class="mission-level-row"><div><span class="label-strong">${m.id==='taxi'?'Fares completed':'Highest recorded level'}</span><strong class="mission-large" data-mission-read="${m.stat}">${numeric(val)}</strong></div><div class="mission-stepper"><button type="button" data-step="${m.stat}" data-dir="-1" data-max="${m.max}" ${!ready()||val<=0?'disabled':''} aria-label="Decrease ${m.label}">−</button><input aria-label="${m.label} record" data-mission-exact="${m.stat}" type="number" min="0" max="${m.max}" value="${Math.round(val)}" ${!ready()?'disabled':''}/><button type="button" data-step="${m.stat}" data-dir="1" data-max="${m.max}" ${!ready()||val>=m.max?'disabled':''} aria-label="Increase ${m.label}">+</button></div></div><div class="mission-progress"><div style="width:${Math.min(100,val/m.goal*100)}%"></div></div><div class="mission-reward"><div>${icon('gift',17)} <span><strong>${m.reward}</strong><small>Dedicated save flag</small></span></div><label class="switch" title="Explicitly set this reward flag"><input type="checkbox" data-reward="${m.rewardId}" ${reward?'checked':''} ${!ready()?'disabled':''}/><i></i></label></div></article>`;
}
const OTHER_RECORDS = [
  {label:'Trucking jobs', id:161, max:8, suffix:'missions passed'},
  {label:'Valet parking', id:175, max:25, suffix:'highest cars parked'},
  {label:'Shooting range', id:174, max:50, suffix:'stages passed'},
  {label:'Courier packages', id:154, max:1000, suffix:'packages delivered'},
  {label:'8-Track race', id:172, max:30, suffix:'best finishing position'},
  {label:'Vehicles exported', id:213, max:30, suffix:'total exported'},
];
function viewMissions() {
 return `${heading('SIDE ACTIVITY CONTROL', 'Side missions & levels','Edit the actual level records and individually set the associated in-game reward flags.')}${guard()}
   <div class="info-banner">${icon('info',18)} The highest achieved level and the reward unlock flag are separate values in the save. Updating one does not automatically update the other — use both controls when needed.</div>
   <div class="section-header"><div><h3>Vehicle missions</h3><p>Five well-documented records, ready to edit.</p></div><span class="small-label">EDITABLE RECORDS</span></div>
   <section class="mission-grid">${SIDE_MISSIONS.map(levelCard).join('')}</section>
   <div class="section-header"><div><h3>Additional activity records</h3><p>Verified stored statistics; these controls do not grant mission rewards or assets.</p></div><span class="small-label">COUNTERS ONLY</span></div>
   <section class="other-records-grid">${OTHER_RECORDS.map(r=>`<label class="record-row"><span><strong>${r.label}</strong><small>${r.suffix}</small></span><input aria-label="${r.label}" data-record-input="${r.id}" type="number" step="1" min="0" max="${r.max}" value="${numeric(actualStat(r.id))}" ${!ready()?'disabled':''}/></label>`).join('')}</section>
   <section class="panel note-panel">${icon('alert',21)}<div><strong>About story missions and progression</strong><p>Story missions, courier asset unlocks, racing flags, schools, and other checklist entries are primarily controlled by <code>main.scm</code> variables and related world state. The Mission Tracker reads documented SCM counters and offers tightly guarded experimental chain-only edits: changing an unverified value can block subsequent missions or corrupt a save. The editor exposes the latest saved mission key and mission counters in the Inspector.</p></div></section>`;
}
function collectibleCard(title,iconName,actualCount,total,desc,action,editable=true) {const pct=Math.min(100,Math.max(0,actualCount/total*100));return `<article class="collectible-card"><div class="collectible-top"><span class="collectible-icon">${icon(iconName,22)}</span><span class="status-pill ${actualCount>=total?'good':'pending'}">${actualCount>=total?'Complete':'In progress'}</span></div><h3>${title}</h3><p>${desc}</p><div class="collectible-count"><strong>${numeric(actualCount)}</strong><span>/ ${total}</span></div><div class="track"><span style="width:${pct}%"></span></div>${action==='all' ? `<div class="collectible-buttons"><button class="button button-outline button-small" data-collection="${title==='Gang tags'?'tags':'jumps'}" data-value="true" ${!ready()||!editable?'disabled':''}>Mark all complete</button><button class="button button-ghost button-small" data-collection="${title==='Gang tags'?'tags':'jumps'}" data-value="false" ${!ready()||!editable?'disabled':''}>Clear all</button></div>`:`<label class="count-input">Stat counter only <input type="number" min="0" max="${total}" data-stat-exact="${action}" value="${numeric(actualCount)}" ${!ready()?'disabled':''}/></label>`}</article>`;}
function viewCollectibles(){const tags=actual('sprayedTags',0)??0, jumps=actual('completedJumps',0)??0;
 return `${heading('COMPLETION GARAGE','Collectibles','Track San Andreas collectibles and edit documented save data.')}${guard()}
  <div class="info-banner warning">${icon('alert',18)} Tags and stunt jumps have individual world records. Snapshot, horseshoe and oyster counters are statistics only — changing them does not collect their map objects or guarantee their rewards.</div>
  <section class="collectible-grid">${collectibleCard('Gang tags','edit',tags,100,'100 graffiti tags across Los Santos. Changes the individual spray values in the save.','all',state.save?.tagCount===100||state.demo)}${collectibleCard('Unique stunt jumps','zap',jumps,70,'Marks existing stunt-jump entries completed and updates their counters.','all',state.save?.jumpCount<=70||state.demo)}${collectibleCard('Snapshots','activity',actualStat(231),50,'San Fierro photography count. Counter only; world pickups untouched.',231)}${collectibleCard('Horseshoes','star',actualStat(241),50,'Las Venturas horseshoe counter. Counter only; world pickups untouched.',241)}${collectibleCard('Oysters','gem',actualStat(243),50,'Oyster counter. Counter only; world pickups untouched.',243)}</section>`;
}
function viewRewards(){return `${heading('BONUS UNLOCKS','Rewards & Perks','Set independent reward flags that the game reads directly from the save.')}${guard()}
  <section class="panel"><div class="panel-title-row"><div><h3>Player bonuses</h3><p>Flags saved in Blocks 0 and 15</p></div><span class="small-label">${REWARD_FLAGS.length} AVAILABLE</span></div><div class="reward-list">${REWARD_FLAGS.map(r=>`<div class="reward-row"><div class="reward-badge">${icon(r.id==='fireproof'?'flame':r.id==='taxiNitro'?'zap':'gift',18)}</div><div><strong>${r.label}</strong><p>${r.detail}</p></div><label class="switch"><input type="checkbox" data-reward="${r.id}" ${ready()&&state.save.getReward(r.id)?'checked':''} ${!ready()?'disabled':''}/><i></i></label></div>`).join('')}</div></section>
   <section class="panel note-panel">${icon('shield',20)}<div><strong>Reward flags are independent of game history</strong><p>This screen changes reward bits without pretending the underlying mission, race, or school was completed. For example, enable “Fireproof” even if the firefighter highest level remains unchanged. Only toggle the flags you really want.</p></div></section>`;}
const statLabels={0:'Progress made',1:'Total possible progress',3:'Distance travelled on foot',4:'Distance travelled by car',5:'Distance travelled by motorbike',6:'Distance travelled by boat',21:'Fat',22:'Stamina',23:'Muscle',24:'Max health stat',25:'Sex appeal',63:'Time underwater',64:'Total respect',68:'Respect',69:'Pistol skill',70:'Silenced pistol skill',71:'Desert Eagle skill',72:'Shotgun skill',73:'Sawn-off skill',74:'Combat shotgun skill',75:'Machine pistol skill',76:'SMG skill',77:'AK-47 skill',78:'M4 skill',79:'Rifle skill',81:'Gambling skill',120:'People killed by others',121:'People killed by CJ',126:'Bullets fired',128:'Bullets hit',130:'Headshots',131:'Wanted stars attained',132:'Wanted stars evaded',133:'Times busted',135:'Times wasted',136:'Times saved',137:'Times cheated counter',144:'Unique jumps found',145:'Unique jumps completed',146:'Mission attempts',147:'Missions passed',148:'Total missions',149:'Taxi income',150:'Taxi passengers',151:'Paramedic lives saved',152:'Vigilante criminals killed',153:'Fires extinguished',154:'Packages delivered',157:'Highest vigilante level',158:'Highest paramedic level',159:'Highest firefighter level',160:'Driving skill',161:'Truck missions passed',166:'Photographs taken',171:'Girls pimped',174:'Shooting range stages',175:'Valet cars parked',184:'Number of girlfriends',191:'Houses burgled',198:'Gym visits',201:'Quarry income',210:'Pimping level',213:'Vehicles exported',214:'Vehicles imported',223:'Flying skill',225:'Lung capacity',229:'Motorcycle skill',230:'Bicycle skill',231:'Snapshots collected counter',232:'Total snapshots',234:'Territories captured',236:'Territories held',241:'Horseshoes collected counter',242:'Total horseshoes',243:'Oysters collected counter',244:'Total oysters',252:'Denise progress stat',253:'Michelle progress stat',254:'Helena progress stat',255:'Barbara progress stat',256:'Katie progress stat',257:'Millie progress stat',322:'Tags sprayed counter'};
const validStatIds=[...Array(82).keys(),...Array.from({length:223},(_,i)=>i+120)];
function viewInspector(){const query=state.statQuery.trim().toLowerCase();const ids=validStatIds.filter(id=>!query || String(id).includes(query) || (statLabels[id]||'').toLowerCase().includes(query)).slice(0,80);
return `${heading('ADVANCED TOOLS','Stat Inspector','Direct access to saved stat values for power users. Use precise IDs to modify additional mission records.')}${guard()}
<section class="panel"><div class="panel-title-row"><div><h3>Browse binary statistics</h3><p>82 float values and 223 integer counters • Saved in Block 16</p></div><span class="status-pill">ADVANCED MODE</span></div><label class="search-bar">${icon('search',19)}<input type="search" value="${escapeHtml(state.statQuery)}" placeholder="Search stat ID or name (e.g. 159, firefighter, kills)" id="stat-search"/></label><div class="stat-table-wrap"><table class="stat-table"><thead><tr><th>STAT ID</th><th>DESCRIPTION</th><th>FORMAT</th><th>VALUE</th></tr></thead><tbody>${ids.map(id=>`<tr><td><span class="id-pill">#${id}</span></td><td>${escapeHtml(statLabels[id]||'Unlabeled game stat')}</td><td>${id<=81?'float32':'int32'}</td><td><input aria-label="Edit stat ${id}" type="number" step="${id<=81?'0.01':'1'}" value="${numeric(actualStat(id),id<=81?2:0).replace(/,/g,'')}" data-raw-stat="${id}" ${!ready()?'disabled':''}/></td></tr>`).join('')||'<tr><td colspan="4">No matching statistics found.</td></tr>'}</tbody></table></div><p class="table-footnote">Showing ${ids.length} of ${validStatIds.filter(id=>!query||String(id).includes(query)||(statLabels[id]||'').toLowerCase().includes(query)).length} matches. An unlabeled stat is not necessarily safe to modify: edit only values you understand.</p></section>`;
}
const STORY_GROUPS = [
  ['Los Santos', 'Big Smoke|Ryder|Tagging Up Turf|Cleaning the Hood|Drive-Thru|Nines and AK’s|Drive-By|Sweet’s Girl|Cesar Vialpando|High Stakes, Low Rider|Home Invasion|Catalyst|Robbing Uncle Sam|OG Loc|Running Dog|Wrong Side of the Tracks|Just Business|Life’s a Beach|Madd Dogg’s Rhymes|Management Issues|House Party|Burning Desire|Gray Imports|Doberman|Los Sepulcros|Reuniting the Families|The Green Sabre'],
  ['Badlands', 'Badlands|Wu Zi Mu|Farewell, My Love...|Local Liquor Store|Small Town Bank|Tanker Commander|Against All Odds|Body Harvest|Are You Going to San Fierro?'],
  ['San Fierro', 'Wear Flowers in Your Hair|555 We Tip|Deconstruction|Photo Opportunity|Jizzy|T-Bone Mendez|Mike Toreno|Outrider|Snail Trail|Ice Cold Killa|Pier 69|Toreno’s Last Flight|Yay Ka-Boom-Boom'],
  ['Desert', 'Monster|Highjack|Interdiction|Verdant Meadows|Learning to Fly|N.O.E.|Stowaway|Black Project|Green Goo'],
  ['Las Venturas', 'Fender Ketchup|Explosive Situation|You’ve Had Your Chips|Don Peyote|Intensive Care|Misappropriation|The Meat Business|Fish in a Barrel|Madd Dogg|Freefall|High Noon|Saint Mark’s Bistro|Architectural Espionage|Key to Her Heart|Dam and Blast|Cop Wheels|Up, Up and Away!|Breaking the Bank at Caligula’s'],
  ['Los Santos II', 'A Home in the Hills|Vertical Bird|Home Coming|Cut Throat Business|Beat Down on B Dup|Grove 4 Life|Riot|Los Desperados|End of the Line']
];
const CHECKLIST_EXTRAS = [
  ['Firefighter Level 12', 'missions', () => actualStat(159)>=12],
  ['Paramedic Level 12', 'missions', () => actualStat(158)>=12],
  ['Vigilante Level 12', 'missions', () => actualStat(157)>=12],
  ['Taxi: 50 passengers', 'missions', () => actualStat(150)>=50],
  ['Pimping Level 10', 'missions', () => actualStat(210)>=10],
  ['Gang tags (100)', 'collectibles', () => (actual('sprayedTags',0)??0)>=100],
  ['Unique jumps (70; completionist extra)', 'collectibles', () => (actual('completedJumps',0)??0)>=70],
  ['Snapshots counter (50; stat only)', 'collectibles', () => actualStat(231)>=50],
  ['Horseshoes counter (50; stat only)', 'collectibles', () => actualStat(241)>=50],
  ['Oysters counter (50; stat only)', 'collectibles', () => actualStat(243)>=50],
];
function progressGlyph(status){
 return status==='passed'?'<span class="mission-mark mark-passed" aria-label="Passed">✓</span>':status==='not-passed'?'<span class="mission-mark mark-failed" aria-label="Not passed">✕</span>':'<span class="mission-mark mark-unknown" aria-label="Not verifiable">?</span>';
}
function missionRow(title){
 const info=ready()?missionStatus(state.save,title):{status:'unknown'};
 const id=normalizeMission(title);
 const mapped=MISSION_INDEX.has(id);
 const editable=ready()&&info.status==='not-passed';
 return `<button type="button" class="story-item mission-tracker-row ${info.status==='passed'?'passed':''}" data-mission="${escapeHtml(title)}" title="${escapeHtml(info.reason||'Show mission prerequisites and save evidence')}">
  ${progressGlyph(info.status)}<span class="mission-title">${escapeHtml(title)}</span>
  <span class="mission-status-name">${info.status==='passed'?'PASSED':info.status==='not-passed'?'NOT PASSED':'UNVERIFIED'}</span>
  ${icon(mapped?'chevron':'info',15)}
 </button>`;
}
function girlCard(gf){
 const info=ready()?girlfriendState(state.save,gf.id):null;
 const gate=info?.storyGate??'unknown';
 const progress=info?.display??info?.internal;
 return `<article class="gf-card"><div class="gf-card-head"><span class="gf-avatar">${gf.name.split(' ').map(w=>w[0]).slice(0,2).join('')}</span><div><h4>${escapeHtml(gf.name)}</h4><small>${escapeHtml(gf.description)}</small></div>${progressGlyph(gate)}</div>
   <div class="gf-progress"><span>Saved relationship progress</span><strong>${progress===null||progress===undefined?'Unverified':`${progress}%`}</strong></div>
   <div class="track"><span style="width:${Math.max(0,Math.min(100,progress||0))}%"></span></div>
   <div class="gf-foot"><span>Story prerequisite: ${escapeHtml(gf.unlockedBy)}</span><button type="button" class="button button-outline button-small" data-girlfriend="${gf.id}">Review requirements ${icon('chevron',13)}</button></div>
 </article>`;
}
function viewChecklist(){
 const q=state.missionQuery.toLowerCase().trim();
 const all=STORY_GROUPS.flatMap(([group,entries])=>entries.split('|').map(title=>({group,title})));
 const known=ready()?all.map(x=>missionStatus(state.save,x.title).status):[];
 const counts={passed:known.filter(x=>x==='passed').length,missing:known.filter(x=>x==='not-passed').length,unknown:ready()?known.filter(x=>x==='unknown').length:all.length};
 return `${heading('SAVE-AWARE STORY PROGRESSION','Mission Tracker','Verified ✓ and ✕ indicators from original-game SCM counters, with prerequisite inspection and guarded editing.')}${guard()}
 <div class="info-banner warning">${icon('shield',19)} <div><strong>Mission safety mode</strong> Completion status is read from saved script counters, not guessed from the save title. <b>?</b> means the game state cannot be verified. An optional advanced chain-counter edit can only advance the next mission after recorded requirements pass; it does not replay mission rewards or world events. Never treat it as a guaranteed story skip.</div></div>
 <div class="checklist-summary">${metric('check','VERIFIED PASSED',counts.passed,'SCM chain counters','cyan')}${metric('x','VERIFIED NOT PASSED',counts.missing,'Known incomplete chain entries','orange')}${metric('info','UNKNOWN / UNSUPPORTED',counts.unknown,'No safe individual completion evidence','violet')}</div>
 <div class="section-header"><div><h3>Campaign timeline</h3><p>Click a mission to inspect its recorded progress, sequential prerequisites and any remaining blockers.</p></div><span class="small-label">ORIGINAL PC 1.0 SCM</span></div>
 <label class="search-bar mission-search">${icon('search',18)}<input type="search" id="mission-search" placeholder="Find a mission or region…" value="${escapeHtml(state.missionQuery)}"/></label>
 <section class="checklist-group-grid">${STORY_GROUPS.map(([region,missions])=>{
  const filtered=missions.split('|').filter(title=>!q||title.toLowerCase().includes(q)||region.toLowerCase().includes(q));
  return filtered.length?`<div class="panel checklist-group"><div class="mission-region-head"><h3>${region}</h3><span>${filtered.length} missions</span></div><div class="story-list">${filtered.map(missionRow).join('')}</div></div>`:'';
 }).join('')||'<div class="panel empty-campaign">No matching mission found.</div>'}</section>
 <div class="section-header"><div><h3>Girlfriends & relationships</h3><p>Story gates, saved relationship scores and restricted unlock checks. These are separate from ordinary missions.</p></div><span class="small-label">PREREQUISITES FIRST</span></div>
 <section class="gf-grid">${GIRLFRIENDS.map(girlCard).join('')}</section>
 <section class="panel note-panel">${icon('lock',20)}<div><strong>Safe by default</strong><p>Girlfriend unlocks and heist keycards have additional active-state bitfields, blips, script threads and pickups. Those are not inferred from relationship percentages. Unlock editing is disabled until a complete mapping for the supplied game version is validated.</p></div></section>
 <div class="section-header"><div><h3>Other recorded milestones</h3><p>Actual level and counter checks, not story completion claims.</p></div></div>
 <section class="panel milestone-list">${CHECKLIST_EXTRAS.map(([title,tab,done])=>`<button data-view="${tab}" class="milestone-row"><span class="milestone-check ${done()?'done':''}">${icon(done()?'check':'x',15)}</span><strong>${title}</strong><span class="status-pill ${done()?'good':'pending'}">${done()?'Recorded':'Not recorded'}</span>${icon('chevron',15)}</button>`).join('')}</section>`;
}
function missionDetails(title){
 if(!ready()){notify('Import a GTA San Andreas save to review its mission counters.','error');return;}
 const report=missionRequirements(state.save,title);
 state.pendingMission=report.node?.id??null;
 const status=report.status;
 const checklist=report.checks.map(check=>`<div class="preflight-row">${progressGlyph(check.ok?'passed':'not-passed')}<span>${escapeHtml(check.text)}</span></div>`).join('');
 const advanced=report.allowed&&status==='not-passed';
 $('#modal-root').innerHTML=`<div class="modal-overlay" data-close="yes"><div class="modal-box mission-dialog" role="dialog" aria-modal="true" aria-label="Mission requirements"><div class="modal-header"><div><span class="eyebrow">STORY / PREREQUISITES</span><h2>${escapeHtml(title)}</h2></div><button class="icon-button" data-action="close-modal" aria-label="Close dialog">${icon('x',19)}</button></div>
 <div class="preflight-status">${progressGlyph(status)} <div><strong>${status==='passed'?'Passed in stored mission chain':status==='not-passed'?'Not passed in stored mission chain':'Completion cannot be proven'}</strong><small>${escapeHtml(report.node?`${report.node.chain.name} • SCM global $${report.node.chain.global} • stage ${report.node.index+1}`:'This objective has no supported individual mission-counter mapping.')}</small></div></div>
 <h3 class="preflight-heading">Preflight checks</h3><div class="preflight-checks">${checklist}</div>
 ${advanced?`<div class="risk-box"><strong>${icon('alert',16)} Advanced chain edit — experimental</strong><p>${escapeHtml(report.limitation)}</p><label class="risk-ack"><input id="mission-risk-ack" type="checkbox"/><span>I understand this only changes the next saved SCM mission-chain value, not its complete game state. I made a backup.</span></label></div><button class="button button-primary mission-confirm" data-action="mission-apply" disabled>Advance saved chain counter</button>`:`<div class="risk-box locked"><strong>${icon('lock',16)} Edit unavailable</strong><p>${status==='passed'?'Already recorded as passed. The editor will not reverse story flags automatically.':status==='unknown'?'No verified completion byte is available for this objective.':'One or more requirements are missing or cannot be verified. Nothing will be written.'}</p></div>`}
 <p class="modal-hint">SCM chain values only apply to unmodified GTA San Andreas PC 1.00. This tool does not guarantee that skipping missions will preserve progression.</p></div></div>`;
}
function girlfriendDetails(id){
 if(!ready()){notify('Import a San Andreas save to inspect relationships.','error');return;}
 const gf=girlfriendState(state.save,id);if(!gf)return;
 const gateName=gf.storyGate==='passed'?'Passed':gf.storyGate==='not-passed'?'Not passed':'Not verifiable';
 $('#modal-root').innerHTML=`<div class="modal-overlay" data-close="yes"><div class="modal-box mission-dialog" role="dialog" aria-modal="true" aria-label="Girlfriend requirements"><div class="modal-header"><div><span class="eyebrow">RELATIONSHIP PREREQUISITES</span><h2>${escapeHtml(gf.name)}</h2></div><button class="icon-button" data-action="close-modal">${icon('x',19)}</button></div><div class="preflight-checks"><div class="preflight-row">${progressGlyph(gf.storyGate)}<span>Story prerequisite: ${escapeHtml(gf.unlockedBy)} — ${gateName}</span></div><div class="preflight-row">${progressGlyph(gf.internal===null?'unknown':'passed')}<span>SCM relationship variable: ${gf.internal===null?'Unknown':`${gf.internal}%`}</span></div><div class="preflight-row">${progressGlyph(gf.display===null?'unknown':'passed')}<span>Statistics-screen relationship: ${gf.display===null?'Unknown':`${gf.display}%`}</span></div><div class="preflight-row">${progressGlyph('unknown')}<span>Relationship active flag, character spawn, pickups, gifts and phone state: not verified</span></div></div><div class="risk-box locked"><strong>${icon('lock',16)} Unlock/edit blocked</strong><p>${escapeHtml(gf.note)}</p></div></div></div>`;
}
function viewSettings(){const date=actual('date',null);
return `${heading('SAVE FILE PROFILE','Save Settings','Edit the basic save identity and check your imported file properties.')}${guard()}
<section class="content-columns"><div class="panel"><div class="panel-title-row"><div><h3>Save identity</h3><p>Binary file metadata stored in Block 0</p></div>${icon('edit',19)}</div><label class="field">Save display title<input type="text" data-text-field="saveName" maxlength="99" value="${escapeHtml(actual('saveName',''))}" ${!ready()?'disabled':''}/></label><p class="settings-subtext">The game rebuilds this title from the last mission key on the next in-game save.</p><div class="setting-toggle-row"><div><strong>Has used cheats</strong><p>Saved cheat-history flag. This does not undo effects of cheats or change the times-cheated counter.</p></div><label class="switch"><input type="checkbox" data-cheatflag="true" ${actual('cheatFlag',false)?'checked':''} ${!ready()?'disabled':''}/><i></i></label></div></div>
<div class="panel"><div class="panel-title-row"><div><h3>Technical details</h3><p>File fingerprint & compatibility</p></div>${icon('shield',19)}</div><div class="info-list"><div><span>File name</span><strong>${escapeHtml(state.fileName||'—')}</strong></div><div><span>Binary version</span><strong>${escapeHtml(actual('version','—'))}</strong></div><div><span>File type</span><strong>Classic PC .b</strong></div><div><span>File size</span><strong>${fmt.format(state.save?.bytes.length||SAVE_SIZE)} bytes</strong></div><div><span>Checksum</span><strong class="positive">${ready()?'Verified on import':'—'}</strong></div><div><span>Last saved at</span><strong>${date instanceof Date&&!isNaN(date)?escapeHtml(date.toLocaleString()):'Not available'}</strong></div><div><span>Last mission key</span><strong>${escapeHtml(actual('missionKey','—'))}</strong></div><div><span>Edits staged</span><strong>${state.save?.changeCount??0}</strong></div></div></div></section>
<section class="panel note-panel">${icon('lock',19)}<div><strong>Nothing is uploaded</strong><p>The original save is kept in browser memory. Export generates a new file with a corrected checksum, and the original on your disk is not overwritten by this website.</p></div></section>`;
}
function viewEmptyGame(){
 const g=GAME_GROUPS.find(g=>g.id===state.activeGame);
 const isIII=g.id==='III';
 const features=isIII ? [
   ['Player Statistics','Money, health, armor, completion records and activity counters','stats','activity'],
   ['Side Missions','Paramedic level; taxi fares, fires and Vigilante records','missions','flag'],
   ['Collectibles','100 hidden packages and 20 unique stunt jumps (counters)','collectibles','gem'],
   ['Rewards & Perks','Infinite sprint, fast reload, jail and hospital benefits','rewards','gift']
 ] : [
   ['Player Statistics','Money, health, armor and game-specific statistics','stats','activity'],
   ['Side Missions','Firefighter, Vigilante, Paramedic and Pizza Boy records','missions','flag'],
   ['Collectibles','100 hidden packages and 36 unique stunt jumps (counters)','collectibles','gem'],
   ['Rewards & Perks','Fireproof, maximum armor and health, sprint and more','rewards','gift']
 ];
 return `${heading('TRILOGY WORKSPACES',`Welcome to ${escapeHtml(g.label)}`,`Import an original PC save to inspect and modify ${escapeHtml(g.subtitle)}.`)}
 <section class="hero-card classic-hero ${isIII?'theme-iii':'theme-vc'} empty-game-hero"><div class="hero-content"><span class="hero-kicker">${icon('folder',16)} ${escapeHtml(g.label.toUpperCase())} // CLASSIC PC</span><h2>${isIII?'Liberty City':'Vice City'}<br><em>save garage.</em></h2><p>Load a genuine ${isIII?'GTA3sf':'GTAVCsf'}#.b file to see your progress, stats, side missions, collectibles, rewards and more. Changes remain on your device.</p><div class="hero-actions"><button class="button button-primary" data-action="upload" data-import-game="${g.id}">${icon('upload',17)} Import ${isIII?'GTA III':'Vice City'} save</button></div></div><div class="hero-art" aria-hidden="true">${logo(g.id)}<span class="hero-art-tag">${escapeHtml(g.subtitle.toUpperCase())}</span></div></section>
 <div class="section-header"><div><h3>What you can edit</h3><p>These options unlock after the correct game save is imported.</p></div><span class="small-label">GAME-SPECIFIC EDITOR</span></div>
 <section class="quick-grid game-capabilities">${features.map(([name,desc,,glyph])=>`<div class="quick-card"><span class="quick-icon purple">${icon(glyph,22)}</span><div><strong>${name}</strong><small>${desc}</small></div>${icon('lock',16)}</div>`).join('')}</section>
 <section class="panel note-panel">${icon('shield',20)}<div><strong>Classic PC files only</strong><p>Definitive Edition, mobile and console saves are not supported. Export retains the same file format, with a recalculated checksum. Mission completion still requires verified script/world-state data rather than counters alone.</p></div></section>`;
}
function viewEmptyGta4(){
 const profile=EPISODE_PROFILES[state.activeGame];
 const episode=profile.id!=='IV';
 return `${heading(episode?'EPISODES FROM LIBERTY CITY':'GTA IV WORKSPACE',`Welcome to ${profile.name}`,`Import an SGTA4xx PC save belonging to ${profile.player} to open the separate editor.`)}
 <section class="hero-card iv-hero empty-game-hero"><div class="hero-content"><span class="hero-kicker">${icon('folder',16)} ${escapeHtml(profile.name.toUpperCase())} // PC</span><h2>${escapeHtml(profile.place)}.<br><em>${escapeHtml(profile.player)}.</em></h2><p>Inspect player money, health, armor, supported episode-specific statistics, activity records and perks. The game is identified from its save header, not the filename.</p><div class="hero-actions"><button class="button button-primary" data-action="upload" data-import-game="${profile.id}">${icon('upload',17)} Import ${escapeHtml(profile.short)} save</button></div></div><div class="hero-art" aria-hidden="true">${logo(profile.id)}<span class="hero-art-tag">${escapeHtml(profile.name.toUpperCase())}</span></div></section>
 <section class="quick-grid game-capabilities">${[['Player & Finances','Money, health, armor and caps','car'],['Episode statistics','Episode-specific progress and relationships','activity'],['Side activities','Recorded activity and collectible counters','zap'],['Rewards','Documented PlayerInfo perk flags','gift']].map(([name,desc,glyph])=>`<div class="quick-card"><span class="quick-icon purple">${icon(glyph,22)}</span><div><strong>${name}</strong><small>${desc}</small></div>${icon('lock',16)}</div>`).join('')}</section>
 <section class="panel note-panel">${icon('shield',20)}<div><strong>PC files only</strong><p>Classic GTA IV and the two EFLC episodes use similar SGTA4xx containers, but mission and stat layouts differ. A different episode's save automatically routes to its own workspace. Story-script completion editing is unavailable pending verified prerequisite mappings.</p></div></section>`;
}
function render(){
  if(state.page==='home'){
    renderNavigation();
    $('#page-content').innerHTML=viewHome();
    return;
  }
  // Never allow any game's screen to read another game's buffer or show another game's features.
  assertWorkspaceSave(state.save,state.activeGame);
  renderNavigation();
  if(['IV','TLAD','TBOGT'].includes(state.activeGame)){
    $('#page-content').innerHTML=ready()?renderGta4(state,{icon,escapeHtml,heading,metric,numeric,ready,logo}):viewEmptyGta4();
    return;
  }
  if(state.activeGame!=='SA'){
    $('#page-content').innerHTML=ready()?renderClassic(state,{icon,escapeHtml,heading,metric,numeric,ready,logo}):viewEmptyGame();
    return;
  }
  if(ready() && !(state.save instanceof SaSave))throw new Error('Only a San Andreas save can be edited inside the San Andreas workspace.');
  const view={overview:viewOverview,stats:viewStats,missions:viewMissions,checklist:viewChecklist,collectibles:viewCollectibles,rewards:viewRewards,inspector:viewInspector,settings:viewSettings}[state.view]??viewOverview;
  $('#page-content').innerHTML=view();
}
function notify(message,kind='success'){const node=document.createElement('div');node.className=`toast ${kind}`;node.textContent=message;$('#toast-root').append(node);setTimeout(()=>node.remove(),3600);}
function isNarrowScreen() { return window.matchMedia('(max-width: 700px)').matches; }
function syncNavigationToggle() {
  const mobile = isNarrowScreen();
  if (!mobile) document.body.classList.remove('menu-open');
  const expanded = mobile
    ? document.body.classList.contains('menu-open')
    : !$('#app').classList.contains('sidebar-collapsed');
  const toggle = $('#sidebar-toggle');
  const sidebar = $('#primary-sidebar');
  toggle.setAttribute('aria-expanded', String(expanded));
  toggle.setAttribute('aria-label', expanded ? 'Hide navigation' : 'Show navigation');
  toggle.title = expanded ? 'Hide navigation' : 'Show navigation';
  toggle.innerHTML = icon(mobile ? (expanded ? 'x' : 'menu') : (expanded ? 'panel-left-close' : 'panel-left-open'), 19);
  sidebar.inert = !expanded;
  sidebar.setAttribute('aria-hidden', String(!expanded));
}
function toggleNavigation() {
  if (isNarrowScreen()) document.body.classList.toggle('menu-open');
  else $('#app').classList.toggle('sidebar-collapsed');
  syncNavigationToggle();
}
function closeMobileNavigation() {
  if (!document.body.classList.contains('menu-open')) return;
  document.body.classList.remove('menu-open');
  syncNavigationToggle();
  $('#sidebar-toggle').focus();
}
function finishNavigation(){
  window.scrollTo(0,0);
  document.body.classList.remove('menu-open');
  syncNavigationToggle();
}
function navigateHome({push=true}={}){
 if(state.page!=='home')rememberWorkspace();
 state.page='home';state.expandedGame=null;state.pendingImportGame=null;
 if(push && location.pathname!==HOME_PATH)history.pushState({},'',HOME_PATH);
 closeModal();render();finishNavigation();
}
function navigateGame(game,view=null,{push=true,skipPrompt=false}={}){
 if(!GAME_GROUPS.some(g=>g.id===game))return false;
 if(state.activeGame!==game){
   if(!skipPrompt && !confirmDiscard())return false;
   activateWorkspace(game);
 }
 state.page='game';state.expandedGame=game;
 const candidate=view??state.view;
 if(currentNav().some(n=>n[0]===candidate))state.view=candidate;
 else state.view='overview';
 state.workspaces[game].view=state.view;
 const href=routeForGame(game)+(state.view==='overview'?'':'#'+state.view);
 if(push && location.pathname+location.hash!==href)history.pushState({},'',href);
 closeModal();render();finishNavigation();
 return true;
}
function syncRouteFromLocation(){
 const game=gameForPath(location.pathname);
 if(!game){navigateHome({push:false});return;}
 const view=location.hash.slice(1);
 // A route without a tab fragment always starts on Overview; switching
 // games within the app preserves their remembered view in memory.
 const changed=navigateGame(game,currentNavForGame(game).some(n=>n[0]===view)?view:'overview',{push:false});
 if(changed===false)history.replaceState({},'',routeForGame(state.activeGame)+(state.view==='overview'?'':'#'+state.view));
}
function currentNavForGame(game){return game==='SA'?nav:['IV','TLAD','TBOGT'].includes(game)?hdNavigation(game):CLASSIC_NAV;}
function switchView(next){
 if(state.page==='home'||!currentNav().some(n=>n[0]===next))return;
 state.view=next;
 state.workspaces[state.activeGame].view=next;
 const href=routeForGame(state.activeGame)+(next==='overview'?'':'#'+next);
 if(location.pathname+location.hash!==href)history.pushState({},'',href);
 render();finishNavigation();
}
async function upload(file){
 if(!file)return;
 try {
   const arr=new Uint8Array(await file.arrayBuffer());
   const save=(arr.byteLength>=0x500 && String.fromCharCode(...arr.slice(0x0c,0x10))==='SAVE') ? new Gta4Save(arr)
      : arr.byteLength===SAVE_SIZE ? new SaSave(arr)
      : arr.byteLength===CLASSIC_GAMES.III.size ? new ClassicSave(arr,'III')
      : arr.byteLength===CLASSIC_GAMES.VC.size ? new ClassicSave(arr,'VC')
      : (()=>{throw new Error('Unrecognized GTA III, Vice City, San Andreas or GTA IV/EFLC PC save.');})();
   const game=gameForSave(save);
   // Validate every field needed by the selected dashboard before replacing a previous save.
   if(save instanceof ClassicSave){
      const c=CLASSIC_GAMES[game];
      save.saveName;save.money;save.health;save.armor;save.packageCount;save.missionKey;save.progress;
      for(const spec of CLASSIC_STATS[game])save.getStat(spec.offset);
   }
   if(save instanceof Gta4Save){save.saveName;save.money;save.health;save.armor;save.maxHealth;save.maxArmor;save.progress;save.stuntCount;for(const spec of EPISODE_STATS[save.game])save.getStat(spec.id);}
   const selectedGame=state.pendingImportGame ?? (state.page==='game'?state.activeGame:null);
   // Parsing/validation happens first. Replacing an edited save requires consent.
   if(!confirmDiscard({replacing:true}))return;
   activateWorkspace(game,{save,fileName:file.name});
   state.errors=[];state.classicQuery='';state.missionQuery='';state.pendingImportGame=null;
   navigateGame(game,'overview');
   notify(selectedGame!==null && selectedGame!==game
      ? `${file.name} is a ${GAME_GROUPS.find(g=>g.id===game).label} save, so it was opened in that game's separate workspace.`
      : `Loaded ${file.name} into ${GAME_GROUPS.find(g=>g.id===game).label} · checksum valid`);
 }catch(error){
   notify(`${error.message} No existing save was replaced.`,'error');
 }finally{$('#file-input').value='';state.pendingImportGame=null;}
}
function applyChange(fn, message='Change staged'){if(!ready()){notify('Upload a save to make real edits.','error');return false;}try { fn();notify(message);return true; }catch(error){notify(error.message,'error');return false;}}
function closeModal(){$('#modal-root').innerHTML='';}
function exportModal(){if(!ready()){notify('Load a real save before exporting.','error');return;}
 const filename=['IV','TLAD','TBOGT'].includes(state.activeGame)?((state.fileName||'').match(/^SGTA4(\d\d)$/i)):((state.fileName||outputName(1)).match(/(?:GTA3sf|GTAVCsf|GTASAsf)([1-8])\.b/i));state.selectedSlot=filename?(['IV','TLAD','TBOGT'].includes(state.activeGame)?Math.min(12,Number(filename[1])+1):Number(filename[1])):1;
 $('#modal-root').innerHTML=`<div class="modal-overlay" data-close="yes"><div class="modal-box" role="dialog" aria-modal="true" aria-label="Export save"><div class="modal-header"><div><span class="eyebrow">SAVE YOUR CHANGES</span><h2>Export savegame</h2></div><button class="icon-button" data-action="close-modal" aria-label="Close dialog">${icon('x',19)}</button></div><p>Exporting creates a fresh copy, updates the checksum and leaves your original untouched. Select the destination game slot.</p><div class="export-summary"><span>Changes applied</span><strong>${state.save.changeCount} modification${state.save.changeCount===1?'':'s'}</strong></div><div class="slot-grid">${Array.from({length:['IV','TLAD','TBOGT'].includes(state.activeGame)?12:8},(_,i)=>`<button type="button" class="slot-btn ${state.selectedSlot===i+1?'chosen':''}" data-slot="${i+1}">SLOT ${i+1}</button>`).join('')}</div><div class="output-preview">${icon('folder',18)} <strong id="download-file-name">${outputName()}</strong><span>${fmt.format(state.save?.bytes.length||SAVE_SIZE)} bytes</span></div><button class="button button-primary export-now" data-action="download">${icon('download',19)} Download edited save</button><p class="modal-hint">Back up the existing save in the game's User Files folder before replacing it.</p></div></div>`;
}
function download(){const bytes=state.save.export();const blob=new Blob([bytes],{type:'application/octet-stream'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=outputName();document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);closeModal();notify('Save exported with a fresh valid checksum');}
function handleAction(action){if(action==='upload'){if(state.pendingImportGame===null)state.pendingImportGame=state.page==='game'?state.activeGame:null;$('#file-input').click();}if(action==='demo'&&state.activeGame==='SA'){if(!confirmDiscard({replacing:true}))return;state.demo=true;state.save=null;state.fileName=null;render();notify('Sample preview enabled. No file has been modified.');}if(action==='export')exportModal();if(action==='close-modal')closeModal();if(action==='download')download();if(action==='reset'){if(ready()){state.save=state.save.reset();render();notify('All edits reverted to your originally imported save');}}if(action==='mission-apply' && state.activeGame==='SA' && state.save instanceof SaSave){
  const checkbox=$('#mission-risk-ack');
  if(!checkbox?.checked || !state.pendingMission)return;
  const result=missionRequirements(state.save,state.pendingMission);
  if(!result.allowed){notify('Prerequisites are no longer satisfied. No change made.','error');missionDetails(result.node?.name||state.pendingMission);return;}
  if(applyChange(()=>advanceMissionChain(state.save,state.pendingMission),'Saved chain counter advanced (partial edit)')){closeModal();state.pendingMission=null;render();}
  return;
}
if(action==='max-group' && state.activeGame==='SA' && state.save instanceof SaSave){const group=state.skillGroup; if(applyChange(()=>{SKILLS.filter(s=>s.group===group).forEach(s=>state.save.setStat(s.id,s.max));},`Maxed ${group.toLowerCase()} category`))render();}}

const handleValueChange = (target, {live=false}={}) => {
 if(['IV','TLAD','TBOGT'].includes(state.activeGame) && state.save instanceof Gta4Save){
   if(target.dataset.ivField){const key=target.dataset.ivField;if(applyChange(()=>{state.save[key]=Number(target.value);},`Updated ${key}`))render();return;}
   if(target.dataset.ivStat!==undefined){const id=Number(target.dataset.ivStat);if(target.value==='')return;if(applyChange(()=>state.save.setStat(id,Number(target.value)),'Recorded statistic updated'))render();return;}
   if(target.dataset.ivReward){if(applyChange(()=>state.save.setReward(target.dataset.ivReward,target.checked),'GTA IV perk updated'))render();return;}
   if(target.dataset.ivTitle){if(applyChange(()=>{state.save.saveName=target.value;},'Save title updated'))render();return;}
   if(target.dataset.ivCheat){if(applyChange(()=>{state.save.cheatFlag=target.checked;},'Cheat flag updated'))render();return;}
   return;
 }

 if (state.activeGame!=='SA' && state.save instanceof ClassicSave) {
   if (target.dataset.classicField) {const key=target.dataset.classicField; if(applyChange(()=>{state.save[key]=key==='saveName'?target.value:Number(target.value);},`Updated ${key}`))render();return;}
   if (target.dataset.classicStat!==undefined) {const id=Number(target.dataset.classicStat); if(target.value==='')return; if(applyChange(()=>state.save.setStat(id,Number(target.value)),'Recorded stat updated'))render();return;}
   if (target.dataset.classicReward) {if(applyChange(()=>state.save.setReward(target.dataset.classicReward,target.checked),'Reward flag updated'))render();return;}
   return;
 }
 if(state.activeGame!=='SA'||!(state.save instanceof SaSave))return;
 const id=target.dataset.statRange??target.dataset.statExact??target.dataset.rawStat??target.dataset.missionExact;
 if (id!==undefined) {
   const stat=Number(id);let value=Number(target.value);if(target.value==='')return;
   const skill=SKILLS.find(s=>s.id===stat),mission=SIDE_MISSIONS.find(s=>s.stat===stat);
   const min=skill||mission?0:stat<=81?-100000000: -2147483648;
   const max=skill?.max??mission?.max??(stat<=81?100000000:2147483647);
   if(!Number.isFinite(value)||value<min||value>max||(stat>81&&!Number.isInteger(value))){if(!live)notify(`Enter a number between ${min} and ${max}`,'error');return;}
   if(live){try{if(ready()){state.save.setStat(stat,value);const label=document.querySelector(`[data-stat-read="${stat}"]`);if(label)label.innerHTML=`${numeric(value)}<small> / ${skill?.max??1000}</small>`;const range=target;range.style.setProperty('--fill',`${Math.min(100,value/(skill?.max||1000)*100)}%`);const exact=document.querySelector(`[data-stat-exact="${stat}"]`);if(exact)exact.value=value;}}catch(error){notify(error.message,'error');}}else{if(applyChange(()=>state.save.setStat(stat,value),`Updated stat #${stat}`))render();}
   return;
 }
 if(target.dataset.recordInput){const id=Number(target.dataset.recordInput),r=OTHER_RECORDS.find(x=>x.id===id),num=Number(target.value);if(target.value===''||!Number.isInteger(num)||num<0||num>r.max){notify('Enter a supported record value','error');return;}if(applyChange(()=>state.save.setStat(id,num),'Activity record updated'))render();return;}
 if(target.dataset.textField){const key=target.dataset.textField;if(applyChange(()=>{state.save[key]=target.value;},'Save title updated'))render();return;}
 if(target.dataset.cheatflag){if(applyChange(()=>{state.save.cheatFlag=target.checked;},'Cheat flag updated'))render();return;}
 if(target.dataset.field){const key=target.dataset.field;if(applyChange(()=>{state.save[key]=Number(target.value);},`Updated ${key}`))render();return;}
 if(target.dataset.reward){if(applyChange(()=>state.save.setReward(target.dataset.reward,target.checked),'Reward flag updated'))render();}
};

document.addEventListener('click',(e)=>{
 const action=e.target.closest('[data-action]');if(action){if(action.dataset.importGame)state.pendingImportGame=action.dataset.importGame;handleAction(action.dataset.action);return;}
 const home=e.target.closest('[data-home]');if(home){e.preventDefault();navigateHome();return;}
 const directGame=e.target.closest('[data-open-game]');if(directGame){e.preventDefault();navigateGame(directGame.dataset.openGame,'overview');return;}
 const game=e.target.closest('[data-game]');if(game){const id=game.dataset.game;if(state.page==='game'&&state.expandedGame===id){state.expandedGame=null;renderNavigation();}else{navigateGame(id);}return;}
 const mission=e.target.closest('[data-mission]');if(mission){missionDetails(mission.dataset.mission);return;}
 const gf=e.target.closest('[data-girlfriend]');if(gf){girlfriendDetails(gf.dataset.girlfriend);return;}
 const view=e.target.closest('[data-view]');if(view){if(view.dataset.gameScope && (state.page==='home'||view.dataset.gameScope!==state.activeGame)){navigateGame(view.dataset.gameScope,view.dataset.view);return;}switchView(view.dataset.view);return;}
 const group=e.target.closest('[data-skill-group]');if(group){state.skillGroup=group.dataset.skillGroup;render();return;}
 const ivGroup=e.target.closest('[data-iv-group]');if(ivGroup){state.ivGroup=ivGroup.dataset.ivGroup;render();return;}
 const classicGroup=e.target.closest('[data-classic-group]');if(classicGroup){state.classicGroup=classicGroup.dataset.classicGroup;render();return;}
 const classicStep=e.target.closest('[data-classic-step]');if(classicStep&&state.save instanceof ClassicSave){const id=Number(classicStep.dataset.classicStep),v=state.save.getStat(id),max=CLASSIC_STATS[state.save.game].find(x=>x.offset===id).max,next=Math.min(max,Math.max(0,v+Number(classicStep.dataset.dir)));if(applyChange(()=>state.save.setStat(id,next)))render();return;}
 const step=e.target.closest('[data-step]');if(step){let id=Number(step.dataset.step),delta=Number(step.dataset.dir);let next=Math.max(0,Math.min(Number(step.dataset.max),state.save.stat(id)+delta));if(applyChange(()=>state.save.setStat(id,next)))render();return;}
 const collection=e.target.closest('[data-collection]');if(collection){const complete=collection.dataset.value==='true';const key=collection.dataset.collection;if(applyChange(()=>key==='tags'?state.save.setAllTags(complete):state.save.setAllJumps(complete),`${key==='tags'?'Tags':'Jumps'} ${complete?'marked complete':'cleared'}`))render();return;}
 const slot=e.target.closest('[data-slot]');if(slot){state.selectedSlot=Number(slot.dataset.slot);document.querySelectorAll('[data-slot]').forEach(el=>el.classList.toggle('chosen',el===slot));$('#download-file-name').textContent=`${outputName()}`;return;}
 if(e.target.classList.contains('modal-overlay'))closeModal();
});
document.addEventListener('input',e=>{const t=e.target;
 if(t.id==='mission-search'){const caret=t.selectionStart;state.missionQuery=t.value;$('#page-content').innerHTML=viewChecklist();const node=$('#mission-search');node.focus();node.setSelectionRange(caret,caret);return;}
 if(t.id==='mission-risk-ack'){const button=$('[data-action="mission-apply"]');if(button)button.disabled=!t.checked;return;}
 if(t.id==='iv-search'&&state.save instanceof Gta4Save){const pos=t.selectionStart;state.ivQuery=t.value;$('#page-content').innerHTML=renderGta4(state,{icon,escapeHtml,heading,metric,numeric,ready,logo});const n=$('#iv-search');n.focus();n.setSelectionRange(pos,pos);return;}
 if(t.matches('[data-iv-range]')&&state.save instanceof Gta4Save){const number=t.parentElement.querySelector('[data-iv-stat]');if(number)number.value=t.value;}
 if(t.id==='classic-search'&&state.save instanceof ClassicSave){const pos=t.selectionStart;state.classicQuery=t.value;$('#page-content').innerHTML=renderClassic(state,{icon,escapeHtml,heading,metric,numeric,ready,logo});const n=$('#classic-search');n.focus();n.setSelectionRange(pos,pos);return;}
 if(t.matches('[data-classic-vital-range]')&&state.save instanceof ClassicSave){const field=t.dataset.classicVitalRange;const number=t.parentElement.querySelector(`[data-classic-field="${field}"]`);if(number)number.value=t.value;t.style.setProperty('--fill',`${100*Number(t.value)/Number(t.max)}%`);}
 if(t.matches('[data-classic-range]')&&state.save instanceof ClassicSave){const id=Number(t.dataset.classicRange);const number=t.parentElement.querySelector('[data-classic-stat]');if(number)number.value=t.value;t.style.setProperty('--fill',`${100*Number(t.value)/Number(t.max)}%`);}
if(t.matches('[data-stat-range]'))handleValueChange(t,{live:true});if(t.id==='stat-search'){const current=t.selectionStart;state.statQuery=t.value;$('#page-content').innerHTML=viewInspector();const n=$('#stat-search');n.focus();n.setSelectionRange(current,current);}});
document.addEventListener('change',e=>{const t=e.target;if(t.matches('[data-iv-range]')&&state.save instanceof Gta4Save){if(applyChange(()=>state.save.setStat(Number(t.dataset.ivRange),Number(t.value)),'Statistic updated'))render();return;}if(t.matches('[data-iv-field], [data-iv-stat], [data-iv-reward], [data-iv-title], [data-iv-cheat]')){handleValueChange(t);return;}if(t.matches('[data-classic-vital-range]')&&state.save instanceof ClassicSave){const key=t.dataset.classicVitalRange;if(applyChange(()=>{state.save[key]=Number(t.value);},`Updated ${key}`))render();return;}if(t.matches('[data-classic-range]')&&state.save instanceof ClassicSave){if(applyChange(()=>state.save.setStat(Number(t.dataset.classicRange),Number(t.value)),'Stat updated'))render();return;}if(t.matches('[data-classic-field], [data-classic-stat], [data-classic-reward]')){handleValueChange(t);return;}if(t.matches('[data-stat-range]')){render();return;}if(t.matches('[data-stat-exact], [data-raw-stat], [data-mission-exact], [data-field], [data-reward], [data-text-field], [data-cheatflag], [data-record-input]'))handleValueChange(t);});
$('#file-input').addEventListener('change',e=>upload(e.target.files?.[0]));
$('#sidebar-toggle').addEventListener('click', toggleNavigation);
$('#sidebar-backdrop').addEventListener('click', closeMobileNavigation);
window.addEventListener('resize', syncNavigationToggle);
window.addEventListener('dragover',e=>{e.preventDefault();document.body.classList.add('dragging');});
window.addEventListener('dragleave',e=>{if(e.relatedTarget===null)document.body.classList.remove('dragging');});
window.addEventListener('drop',e=>{e.preventDefault();document.body.classList.remove('dragging');if(e.dataTransfer.files?.length)upload(e.dataTransfer.files[0]);});
window.addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal();closeMobileNavigation();}});
window.addEventListener('beforeunload',e=>{if(ready()&&state.save.changeCount>0){e.preventDefault();e.returnValue='';}});
window.addEventListener('popstate',syncRouteFromLocation);
window.addEventListener('hashchange',syncRouteFromLocation);
syncRouteFromLocation();
syncNavigationToggle();
