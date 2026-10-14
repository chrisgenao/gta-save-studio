/** Universal GitHub Pages site: works under any repository path or domain. */
import {cp,mkdir,rm,writeFile} from 'node:fs/promises';
import {dirname,resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const dist=join(root,'dist');
await rm(dist,{force:true,recursive:true});
await mkdir(dist,{recursive:true});
for(const file of ['index.html','404.html','favicon.svg']) await cp(join(root,file),join(dist,file));
for(const directory of ['src','assets'])await cp(join(root,directory),join(dist,directory),{recursive:true});
await writeFile(join(dist,'.nojekyll'),'');
console.log('GitHub Pages build ready for any project prefix, user domain, or custom domain.');
