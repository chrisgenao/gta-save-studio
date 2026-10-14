/** Dedicated GTA IV, TLAD and TBoGT workspace rendering (never reuses SA views). */
import {GTA4_REWARDS,EPISODE_STATS,EPISODE_PROFILES} from './gta4-core.js';

export function renderGta4(state,{icon,escapeHtml:esc,heading,metric,numeric,logo}){
 const save=state.save,view=state.view,profile=EPISODE_PROFILES[save.game],episode=save.game!=='IV',allStats=EPISODE_STATS[save.game],mainLogo=profile.logo;
 const jumpGoal=profile.stuntGoal;
 const field=(key,title,opts={})=>`<label class="field"><span>${title}</span><input type="number" data-iv-field="${key}" value="${save[key]}" min="${opts.min??0}" max="${opts.max??100000000}" step="${opts.step??1}" /></label>`;
 const info=(title,value)=>`<div><span>${title}</span><strong>${esc(value)}</strong></div>`;
 const banner=(title,body)=>`<section class="panel note-panel">${icon('shield',20)}<div><strong>${title}</strong><p>${body}</p></div></section>`;
 const title=(tag,text,sub)=>heading(tag,text,sub);
 const statInput=(s)=>`<input type="number" data-iv-stat="${s.id}" value="${save.getStat(s.id)}" min="${s.min}" max="${s.max}" step="${s.type==='int'?'1':'any'}" aria-label="Edit ${esc(s.label)}" />`;
 const sliders=(s)=>`<article class="skill-card"><div class="skill-card-head"><div><h3>${esc(s.label)}</h3><p>${esc(s.group)} · Stat #${s.id}</p></div><strong>${numeric(save.getStat(s.id),2)}</strong></div><input class="skill-range" data-iv-range="${s.id}" type="range" min="${s.min}" max="${s.max}" step="0.1" value="${save.getStat(s.id)}" aria-label="${esc(s.label)}"/><div class="skill-input-row"><span>0 – ${s.max}</span>${statInput(s)}</div></article>`;
 const statRow=(s)=>`<tr><td><span class="id-pill">#${s.id}</span></td><td>${esc(s.label)}</td><td>${s.type==='float'?'float32':'int32'}</td><td>${statInput(s)}</td></tr>`;
 const stat=(id)=>save.getStat(id);
 const status=(n,target)=>n>=target?'Target reached':'Recorded value';
 let content='';
 switch(view){
 case 'overview':
 content=`${title('LIBERTY CITY · 2008',`Welcome back, ${esc(profile.player.split(' ')[0])}.`,`Your ${esc(profile.name)} PC save, edited locally.`)}
 <section class="hero-card iv-hero"><div class="hero-content"><span class="hero-kicker">${icon('globe',16)} ${esc(profile.name.toUpperCase())} // ${esc(profile.player.toUpperCase())}</span><h2>Liberty City.<br><em>Your rules.</em></h2><p>Manage ${esc(profile.player)}'s money, health, armor, relationships, activity records and documented perks without changing the campaign script.</p><div class="hero-actions"><button class="button button-primary" data-action="upload" data-import-game="${save.game}">${icon('upload',17)} Replace ${esc(profile.short)} save</button></div></div><div class="hero-art" aria-hidden="true">${logo(mainLogo)}<span class="hero-art-tag">LIBERTY CITY · 2008</span></div></section>
 <section class="metric-grid">${metric('flag','GAME PROGRESS',`${numeric(save.progress,2)}%`,'Recorded statistics','violet')}${metric('car','PLAYER CASH','$'+numeric(save.money),'Current player funds','cyan')}${metric('heart','HEALTH',numeric(save.health,1),`Cap: ${save.maxHealth}`,'rose')}${metric('shield','ARMOR',numeric(save.armor,1),`Cap: ${save.maxArmor}`,'orange')}</section>
 <div class="content-columns"><section class="panel"><div class="panel-title-row"><div><h3>Player essentials</h3><p>Editable values from PlayerInfo</p></div>${icon('edit',18)}</div><div class="settings-grid">${field('money','Available cash',{max:4294967295})}${field('health','Current health',{max:2000,step:'any'})}${field('armor','Current armor',{max:2000,step:'any'})}${field('maxHealth','Maximum health',{min:1,max:2000})}${field('maxArmor','Maximum armor',{min:1,max:2000})}</div></section>
 <section class="panel"><div class="panel-title-row"><div><h3>Save information</h3><p>Verified from your file</p></div>${icon('shield',18)}</div><div class="info-list">${info('Save title',save.saveName)}${info('Save version',save.version)}${info('Recorded missions passed',stat(253))}${info('Stunt jumps completed',save.stuntCount)}${info('Checksum',save.checksumValidOnLoad?'Verified':'Mismatch')}${info('Pending changes',save.changeCount)}</div></section></div>
 ${banner('Safe boundaries','Campaign and world state are not automatically modified by changes to completion statistics. Back up the original save before editing.')}`;
 break;
 case 'stats':{
 const groups=[...new Set(allStats.map(s=>s.group))];const group=groups.includes(state.ivGroup)?state.ivGroup:'Relationships';const list=allStats.filter(s=>s.group===group);
 content=`${title('PLAYER DATA',`${esc(profile.player)} Statistics`,'Edit mapped statistics specific to this campaign, including relationship and progress counters.')}
 <div class="segmented-filters">${groups.map(g=>`<button type="button" class="filter-pill ${g===group?'active':''}" data-iv-group="${g}">${g}</button>`).join('')}</div>
 <div class="section-header"><div><h3>${group}</h3><p>Changes to statistics do not run associated mission scripts or unlock all rewards.</p></div><span class="small-label">${list.length} FIELDS</span></div>
 <section class="skills-grid">${list.map(sliders).join('')}</section>${banner('Statistics versus unlocks','Relationship percentage fields are real saved values, but changing them does not automatically unlock every phone contact, friend ability, or mission.')}`;
 break;}
 case 'missions':{
 const activityIds=episode?allStats.filter(s=>s.group==='Activities').map(s=>s.id):[258,267,268,273,274,275,281,282,284,285];
 content=`${title('LIBERTY CITY JOBS','Activities & Records','Edit selected documented counters while leaving mission-script state intact.')}
 ${banner('No fabricated mission completion','A count of completed activities does not prove that every individual job, telephone objective or map marker has changed state. Story mission editing remains disabled until all prerequisites and script side effects can be mapped.')}
 <section class="skills-grid">${activityIds.map(id=>{const s=allStats.find(x=>x.id===id);return `<article class="skill-card"><h3>${esc(s.label)}</h3><p>Recorded game statistic #${id}</p><div class="mission-level-row"><strong class="mission-large">${numeric(stat(id))}</strong>${statInput(s)}</div></article>`;}).join('')}</section>`;
 break;}
 case 'checklist':{
 const tracked=episode
  ? save.game==='TLAD'?[['Gang wars',177],['Bike race wins',142],['Seagulls',143],['Bikes delivered',144],['Arm wrestling victories',181]]
                    :[['Drug wars',243],['Nightclub jobs',244],['Base jumps',207],['Seagulls',211],['Cage fights',209]]
  :[['Stunt jumps (world record)',null],['Stevie vehicle deliveries',285],['Taxi fares',258]];
 content=`${title('CAMPAIGN COMPLETION','Completion Guide',`Recorded ${esc(profile.name)} progress and documented counters; not individual script-state mission flags.`)}
 <section class="metric-grid">${metric('flag','GAME PROGRESS',`${numeric(save.progress,2)}%`,`Stat #${profile.progressId}`,'violet')}${metric('check','MISSIONS PASSED',numeric(stat(253)),'Aggregate missions count','cyan')}${metric('star',episode?'EPISODE ACTIVITIES':'STUNT JUMPS',episode?String(tracked.length):`${save.stuntCount} / 50`,'Recorded milestones','rose')}${metric('car','PLAYER CASH','$'+numeric(save.money),'From player information','orange')}</section>
 <section class="panel"><div class="panel-title-row"><div><h3>Recorded milestone counters</h3><p>Stats or world totals; not automatic full completion</p></div></div>
 ${tracked.map(([name,id])=>`<div class="milestone-row"><span class="milestone-check">${icon('info',16)}</span><strong>${esc(name)}</strong><span class="status-pill">${numeric(id===null?save.stuntCount:stat(id))}</span></div>`).join('')}</section>
 ${banner('Mission editing is protected',`Marking ${esc(profile.player)}'s missions as passed requires verified prerequisites, world records and script globals. This editor does not invent mission completion flags.`)}`;
 break;}
 case 'collectibles':{
 const list=save.game==='TLAD'?[143]:save.game==='TBOGT'?[207,211]:[269,270];
 const names=allStats.filter(s=>list.includes(s.id));
 content=`${title('WORLD RECORDS','Collectibles & Challenges',`Inspect ${esc(profile.name)} documented counters. They are not a substitute for individual world objects.`)}
 ${!episode?`<section class="metric-grid">${metric('zap','STUNT JUMPS',`${save.stuntCount} / ${jumpGoal}`,'Verified Block 15 count','violet')}${metric('gem','STUNT SLOTS',numeric(save.stuntTotal),'Allocated records','cyan')}</section>`:''}
 <section class="panel"><div class="panel-title-row"><div><h3>${episode?'Episode collectibles and challenges':'Related recorded statistics'}</h3><p>Numerical statistics are editable. World-state objects are left untouched.</p></div></div><div class="settings-grid">${names.map(s=>`<label class="field"><span>${esc(s.label)} (#${s.id})</span>${statInput(s)}</label>`).join('')}</div></section>
 ${banner('Counts are not pickup flags','Editing counters does not remove seagulls, complete jumps, change spawn state or trigger rewards. Only documented byte ranges are written.')}`;
 break;}
 case 'rewards':
 content=`${title('PLAYER UNLOCKS','Rewards & Perks','Direct GTA IV player-info flags with clear separation from campaign completion.')}
 <section class="panel"><div class="panel-title-row"><div><h3>${esc(profile.player)}'s saved perks</h3><p>Documented flags in PlayerInfo</p></div><span class="small-label">${GTA4_REWARDS.length} AVAILABLE</span></div><div class="reward-list">${GTA4_REWARDS.map(r=>`<div class="reward-row"><div class="reward-badge">${icon('gift',18)}</div><div><strong>${esc(r.label)}</strong><p>${esc(r.detail)}</p></div><label class="switch"><input type="checkbox" data-iv-reward="${r.id}" ${save.getReward(r.id)?'checked':''}/><i></i></label></div>`).join('')}</div></section>
 ${banner('Independent bonuses','Editing a reward toggle does not complete a mission or satisfy its prerequisites. Keep the original save to restore the previous flags if necessary.')}`;
 break;
 case 'inspector':{
 const query=(state.ivQuery||'').trim().toLowerCase();const matching=allStats.filter(s=>s.label.toLowerCase().includes(query)||String(s.id).includes(query));
 content=`${title('ADVANCED TOOLS','Stat Inspector','Precise campaign-specific statistic IDs backed by Block 13.')}
 <section class="panel"><div class="panel-title-row"><div><h3>Mapped statistics</h3><p>Documented float32 and int32 identifiers</p></div><span class="status-pill">ADVANCED</span></div><label class="search-bar">${icon('search',19)}<input type="search" id="iv-search" value="${esc(state.ivQuery||'')}" placeholder="Search ID or stat name" /></label><div class="stat-table-wrap"><table class="stat-table"><thead><tr><th>ID</th><th>DESCRIPTION</th><th>FORMAT</th><th>VALUE</th></tr></thead><tbody>${matching.map(statRow).join('')||'<tr><td colspan="4">No matching stats.</td></tr>'}</tbody></table></div><p class="table-footnote">Only ${allStats.length} mapped stats are editable. Raw unknown bytes are never guessed.</p></section>`;
 break;}
 case 'settings':
 content=`${title('SAVE FILE PROFILE','Save Settings','Change save-title metadata or inspect the GTA IV PC save container.')}
 <div class="content-columns"><section class="panel"><div class="panel-title-row"><div><h3>Save identity</h3><p>UTF-16 title in file header</p></div>${icon('edit',18)}</div><label class="field"><span>Last mission / save title ${episode?'(keep episode prefix)':''}</span><input type="text" data-iv-title="true" maxlength="120" value="${esc(save.saveName)}" /></label><p class="settings-subtext">The game can replace this title during a subsequent in-game save.</p><div class="setting-toggle-row"><div><strong>Cheats used</strong><p>SimpleVars cheat flag. Does not rewind gameplay or times-cheated statistic.</p></div><label class="switch"><input type="checkbox" data-iv-cheat="true" ${save.cheatFlag?'checked':''} /><i></i></label></div></section>
 <section class="panel"><div class="panel-title-row"><div><h3>Technical details</h3><p>Validated structure</p></div>${icon('shield',18)}</div><div class="info-list">${info('Game',profile.name)}${info('File',state.fileName||'—')}${info('Version',save.version)}${info('Bytes',save.bytes.length.toLocaleString('en-US'))}${info('Data blocks',save.blocks.length)}${info('Checksum',save.checksumValidOnLoad?'Verified':'Mismatch')}${info('Edits staged',save.changeCount)}${info('Player',profile.player)}</div></section></div>
 ${banner('Save locations','GTA IV / EFLC Complete Edition PC saves are normally in Documents/Rockstar Games/GTA IV/Profiles/&lt;profile&gt;. Keep backups: loading the file successfully is not proof that an edited file will work with every game patch.')}`;
 break;
 default:return renderGta4({...state,view:'overview'},{icon,escapeHtml:esc,heading,metric,numeric,logo});
 }
 return content;
}
