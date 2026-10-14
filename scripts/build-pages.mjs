/**
 * Generate a static version of GTA Save Studio for GitHub Pages.
 * Automatically supports both user sites (user.github.io) and
 * project sites (user.github.io/repository-name).
 *
 * Local examples:
 *   node scripts/build-pages.mjs
 *   node scripts/build-pages.mjs --base /gta-save-studio
 *   GITHUB_REPOSITORY=someone/gta-save-studio node scripts/build-pages.mjs
 */
import { mkdir, readFile, writeFile, cp, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, dirname, join } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const providedBaseIndex = process.argv.indexOf('--base');
const ownerRepo = (process.env.GITHUB_REPOSITORY || '').split('/');
const repoName = ownerRepo.length === 2 ? ownerRepo[1] : '';
const isUserSite = repoName.toLowerCase() === `${(ownerRepo[0]||'').toLowerCase()}.github.io`;
let base = providedBaseIndex >= 0 ? process.argv[providedBaseIndex + 1] : repoName && !isUserSite ? `/${repoName}` : '';
if (base === undefined || !/^\/?[a-zA-Z0-9._-]*\/?$/.test(base)) throw new Error('Invalid GitHub Pages base path');
base = base.replace(/^\/?/, '/').replace(/\/+$/, '');
if (base === '/') base = '';

const homePath = `${base}/`;
const assetPath = (path) => `${base}${path}`;
await rm(dist, {recursive:true,force:true});
await mkdir(join(dist,'src'), {recursive:true});
await cp(join(root,'assets'),join(dist,'assets'),{recursive:true});
await cp(join(root,'favicon.svg'),join(dist,'favicon.svg'));
await writeFile(join(dist,'.nojekyll'), '');
await cp(join(root,'src'),join(dist,'src'),{recursive:true});

// Rewrite client-side routes to include the GitHub Pages repository prefix.
const routesFile = join(dist,'src','routes.js');
let routes = await readFile(routesFile,'utf8');
routes = routes.replace("export const HOME_PATH = '/';", `export const HOME_PATH = '${homePath}';`);
for (const game of ['gtaiii','gtavc','gtasa','gtaiv','tlad','tbogt']) {
  routes = routes.replace(`'/${game}'`,`'${base}/${game}'`);
}
// Page root must match with or without the trailing slash.
routes = routes.replace("===HOME_PATH || gameForPath(pathname)!==null", "===(HOME_PATH.replace(/\\/+$/,'')||'/') || gameForPath(pathname)!==null");
await writeFile(routesFile,routes);

// All in-app logos must reference the project base instead of domain root.
for (const name of ['workspace-core.js','app.js']) {
 const path=join(dist,'src',name);
 let source=await readFile(path,'utf8');
 source=source.replaceAll('/assets/', assetPath('/assets/'));
 if (name==='workspace-core.js') {
   for (const game of ['gtaiii','gtavc','gtasa','gtaiv','tlad','tbogt']) {
     source=source.replace(`route:'/${game}'`, `route:'${base}/${game}'`);
   }
 }
 if (name==='app.js') source=source.replaceAll('href="/"', `href="${homePath}"`);
 await writeFile(path,source);
}

let html=await readFile(join(root,'index.html'),'utf8');
html=html.replaceAll('href="/favicon.svg"',`href="${assetPath('/favicon.svg')}"`)
 .replaceAll('href="/src/styles.css"',`href="${assetPath('/src/styles.css')}"`)
 .replaceAll('src="/src/app.js"',`src="${assetPath('/src/app.js')}"`)
 .replaceAll('href="/"',`href="${homePath}"`);

// GitHub Pages does not serve arbitrary SPA paths as 200 responses.
// The custom 404 page forwards a deep link to the existing index.html,
// which restores the original browser URL before loading the application.
const restore = `<script>
(function () {
  const params = new URLSearchParams(window.location.search);
  const route = params.get('__page');
  if (route && /^\\/(gtaiii|gtavc|gtasa|gtaiv|tlad|tbogt)\\/?$/.test(route)) {
    const query = params.get('__query');
    window.history.replaceState(null, '', ${JSON.stringify(base)} + route + (query ? '?' + query : '') + window.location.hash);
  }
}());
</script>`;
html=html.replace('</head>',`${restore}\n</head>`);
await writeFile(join(dist,'index.html'), html);
const notFound = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Opening GTA Save Studio…</title></head><body>
<script>
(function () {
  const base = ${JSON.stringify(base)};
  const path = window.location.pathname;
  if (!path.startsWith(base + '/')) { window.location.replace(base + '/'); return; }
  const route = path.slice(base.length);
  const target = new URL(base + '/', window.location.origin);
  target.searchParams.set('__page', route);
  if (window.location.search) target.searchParams.set('__query', window.location.search.slice(1));
  target.hash = window.location.hash;
  window.location.replace(target.href);
}());
</script>
<noscript><p>This save editor requires JavaScript. <a href="${homePath}">Open the dashboard</a>.</p></noscript>
</body></html>`;
await writeFile(join(dist,'404.html'),notFound);
console.log(`Built GitHub Pages site in dist/ for base: ${homePath}`);
