/** Generates crawler-readable static landing pages for all six game routes.
 * SOURCE_ORIGIN is a deployment setting, not a secret; set it to the canonical website.
 */
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const SITE='https://chrisgenao.github.io/gta-save-studio';
export const PAGES=[
 {slug:'',title:'GTA Save Editor Online | GTA Save Studio – III, VC, SA, IV & Episodes',description:'Free GTA save editor for classic PC games: GTA III, Vice City, San Andreas, GTA IV, The Lost and Damned, and The Ballad of Gay Tony. Edit locally in your browser, then download your save.',heading:'Free GTA Save Editor for PC',intro:'Edit GTA III, GTA Vice City, GTA San Andreas, GTA IV, The Lost and Damned, and The Ballad of Gay Tony PC save files directly in your browser. Import a file, review supported statistics and rewards, make changes, and download an edited copy. No account or server uploads.'},
 {slug:'gtaiii',title:'GTA III Save Editor Online – Liberty City | GTA Save Studio',description:'Edit a GTA III PC save online: money, health, armor, side mission records, hidden packages and documented rewards. Private local GTA3sf save editor.',heading:'GTA III PC Save Editor',intro:'Upload an original GTA III PC GTA3sf save to inspect and edit Claude’s cash, health, armor, activity statistics, hidden-package counts, and documented rewards. Export an updated save with checksum validation.'},
 {slug:'gtavc',title:'GTA Vice City Save Editor Online | GTA Save Studio',description:'GTA Vice City save editor for original PC saves: edit Tommy’s cash, health, armor, hidden packages, side mission records, and supported bonuses.',heading:'GTA Vice City PC Save Editor',intro:'Edit Tommy Vercetti’s original PC Vice City save: money, health, armor, side activities, packages and supported unlockables. Import a GTAVCsf save, modify documented fields and export your file.'},
 {slug:'gtasa',title:'GTA San Andreas Save Editor – CJ Stats & Missions | GTA Save Studio',description:'Edit GTA San Andreas PC saves: CJ skills, cash, health, armor, side missions, rewards, collectibles, and guarded mission tracking. No save uploads.',heading:'GTA San Andreas PC Save Editor',intro:'Import your original PC San Andreas save and edit CJ’s player statistics, skills, cash, health, armor, side mission records, collectibles and supported reward flags. Track mission prerequisites using the guarded mission viewer.'},
 {slug:'gtaiv',title:'GTA IV Save Editor – Niko’s Stats & Rewards | GTA Save Studio',description:'Edit original GTA IV PC SGTA4 saves. Manage Niko’s money, health, armor, friendships, stunt jump records, and supported perk flags in your browser.',heading:'GTA IV PC Save Editor',intro:'Open a supported original GTA IV PC save for Niko Bellic, review recorded progression, money, health, armor, relationships and stunt jump statistics, then export edits with a regenerated checksum.'},
 {slug:'tlad',title:'The Lost and Damned Save Editor (TLAD) | GTA Save Studio',description:'GTA IV: The Lost and Damned save editor for PC. Inspect Johnny Klebitz stats, activity records, gang wars, and supported save values.',heading:'The Lost and Damned PC Save Editor',intro:'Work with Johnny Klebitz’s The Lost and Damned PC save. View and edit supported player information, relationships, gang-war activity and documented stat records without confusing them with Niko’s GTA IV stats.'},
 {slug:'tbogt',title:'The Ballad of Gay Tony Save Editor (TBoGT) | GTA Save Studio',description:'GTA IV: The Ballad of Gay Tony save editor for PC. Inspect Luis Lopez stats, drug wars, club jobs, base jumps, and supported activities.',heading:'The Ballad of Gay Tony PC Save Editor',intro:'Manage supported Luis Lopez statistics in The Ballad of Gay Tony PC saves, including recorded drug wars, nightclub jobs and activity statistics. This editor uses episode-specific fields and checksum regeneration.'}
];
const xmlEscape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const htmlEscape=s=>xmlEscape(s).replaceAll('"','&quot;');
function makeMetadata(page){
 const url=`${SITE}/${page.slug?page.slug+'/':''}`;
 const json={ '@context':'https://schema.org','@type':'WebApplication',name:page.slug?`${page.heading} – GTA Save Studio`:'GTA Save Studio',url,description:page.description,operatingSystem:'Any (modern web browser)',applicationCategory:'UtilitiesApplication',isAccessibleForFree:true,offers:{'@type':'Offer',price:'0',priceCurrency:'USD'},creator:{'@type':'Organization',name:'GTA Save Studio (independent fan project)'}};
 const tags=[
  `<meta name="robots" content="index,follow,max-image-preview:large" />`,
  `<link rel="canonical" href="${url}" />`,
  `<meta property="og:type" content="website" />`,
  `<meta property="og:site_name" content="GTA Save Studio" />`,
  `<meta property="og:title" content="${htmlEscape(page.title)}" />`,
  `<meta property="og:description" content="${htmlEscape(page.description)}" />`,
  `<meta property="og:url" content="${url}" />`,
  `<meta property="og:image" content="${SITE}/assets/social-preview.png" />`,
  `<meta property="og:image:width" content="1200" />`,
  `<meta property="og:image:height" content="630" />`,
  `<meta name="twitter:card" content="summary_large_image" />`,
  `<meta name="twitter:title" content="${htmlEscape(page.title)}" />`,
  `<meta name="twitter:description" content="${htmlEscape(page.description)}" />`,
  `<meta name="twitter:image" content="${SITE}/assets/social-preview.png" />`,
  `<script type="application/ld+json">${JSON.stringify(json).replaceAll('<','\\u003c')}</script>`
 ];
 return tags.join('\n  ');
}
function fallback(page){
  if(page.slug){
   return `<section class="seo-fallback" aria-label="About this save editor"><h1>${htmlEscape(page.heading)}</h1><p>${htmlEscape(page.intro)}</p><p>To edit a save file, enable JavaScript and choose “Import save”. Save-file contents are processed locally in your browser, not uploaded to a server.</p><p><a href="./">GTA Save Studio homepage</a></p></section>`;
  }
  return `<section class="seo-fallback" aria-label="About GTA Save Studio"><h1>${htmlEscape(page.heading)}</h1><p>${htmlEscape(page.intro)}</p><nav aria-label="Game save editors">${PAGES.slice(1).map(g=>`<a href="${g.slug}/">${htmlEscape(g.heading)}</a>`).join(' · ')}</nav><p>This unofficial educational tool is not endorsed by Rockstar Games or Take-Two Interactive.</p></section>`;
}
export async function generateSeo(){
 // Homepage index.html is the common editor shell; each static game page has a distinct SEO head and useful pre-rendered page content.
 const home=await readFile(join(root,'index.html'),'utf8');
 for(const page of PAGES){
  let html=home.replace(/<title>[^<]*<\/title>/,`<title>${htmlEscape(page.title)}</title>`)
   .replace(/<meta name="description" content="[^"]*"\s*\/>/,`<meta name="description" content="${htmlEscape(page.description)}" />`);
  html=html.replace(/<!-- SEO METADATA START -->[\s\S]*?<!-- SEO METADATA END -->/,`<!-- SEO METADATA START -->\n  ${makeMetadata(page)}\n  <!-- SEO METADATA END -->`);
  html=html.replace(/<main id="page-content" tabindex="-1">[\s\S]*?<\/main>/,`<main id="page-content" tabindex="-1">${fallback(page)}</main>`);
  if(!page.slug){ await writeFile(join(root,'index.html'),html,'utf8'); continue; }
  const directory=join(root,page.slug);await mkdir(directory,{recursive:true});
  await writeFile(join(directory,'index.html'),html,'utf8');
 }
 const sitemap=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${PAGES.map(page=>`  <url><loc>${SITE}/${page.slug?page.slug+'/':''}</loc></url>`).join('\n')}\n</urlset>\n`;
 await writeFile(join(root,'sitemap.xml'),sitemap);
 // On a project site, /gta-save-studio/robots.txt isn't the host-root robots.txt.
 // Submit the sitemap explicitly in Google Search Console.
 await writeFile(join(root,'robots.txt'),`User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
}
if(process.argv[1] && fileURLToPath(import.meta.url)===process.argv[1])await generateSeo();
