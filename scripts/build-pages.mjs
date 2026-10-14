import {generateSeo, PAGES} from './generate-seo.mjs';
/** Universal GitHub Pages site: works under any repository path or domain. */
import {cp,mkdir,rm,writeFile} from 'node:fs/promises';
import {dirname,resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const dist=join(root,'dist');
await generateSeo();
await rm(dist,{force:true,recursive:true});
await mkdir(dist,{recursive:true});
for(const file of ['index.html','404.html','disclaimer.html','privacy.html','favicon.svg','sitemap.xml','robots.txt']) await cp(join(root,file),join(dist,file));
for(const directory of ['src','assets',...PAGES.filter(p=>p.slug).map(p=>p.slug)])await cp(join(root,directory),join(dist,directory),{recursive:true});
await writeFile(join(dist,'.nojekyll'),'');
console.log('GitHub Pages build ready for any project prefix, user domain, or custom domain.');
