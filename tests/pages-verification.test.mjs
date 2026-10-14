import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
const root = resolve(new URL('..', import.meta.url).pathname);
const token = 'google1ed131ac7d6d9c0a.html';
const expected = `google-site-verification: ${token}`;

test('Google verification response survives GitHub Pages build verbatim', () => {
  const before = readFileSync(resolve(root,token),'utf8');
  assert.equal(before,expected);
  const result = spawnSync(process.execPath,['scripts/build-pages.mjs'],{cwd:root,encoding:'utf8'});
  assert.equal(result.status,0,result.stderr || result.stdout);
  assert.ok(existsSync(resolve(root,'dist',token)));
  assert.equal(readFileSync(resolve(root,'dist',token),'utf8'),before);
});

test('Publish workflow builds an artifact before deploying it', () => {
  const workflow = readFileSync(resolve(root,'.github/workflows/pages.yml'),'utf8');
  assert.match(workflow,/\n  build:\n/);
  assert.match(workflow,/\n  deploy:\n[\s\S]*?\n    needs: build\n/);
  assert.match(workflow,/actions\/upload-pages-artifact@v4/);
  assert.match(workflow,/actions\/deploy-pages@v4/);
  assert.match(workflow,/test -s dist\/google1ed131ac7d6d9c0a\.html/);
});
