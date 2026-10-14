import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, extname, join, resolve, sep } from 'node:path';
const root = dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 5173);
const mime = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.svg':'image/svg+xml', '.json':'application/json; charset=utf-8', '.png':'image/png', '.webp':'image/webp', '.ico':'image/x-icon', '.xml':'application/xml; charset=utf-8', '.txt':'text/plain; charset=utf-8' };
const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, `http://localhost:${port}`).pathname);
    const spaPaths = new Set(['/', '/gtaiii', '/gtavc', '/gtasa', '/gtaiv', '/gtaiii/', '/gtavc/', '/gtasa/', '/gtaiv/', '/tlad', '/tbogt', '/tlad/', '/tbogt/']);
    const gameSlug = pathname.match(/^\/(gtaiii|gtavc|gtasa|gtaiv|tlad|tbogt)\/?$/)?.[1];
    const file = resolve(root, '.' + (gameSlug ? '/'+gameSlug+'/index.html' : spaPaths.has(pathname) ? '/index.html' : pathname));
    if (!file.startsWith(root + sep)) { res.writeHead(403); res.end('Forbidden'); return; }
    if (!['GET','HEAD'].includes(req.method)) { res.writeHead(405); res.end('Method not allowed'); return; }
    if ((await stat(file)).isDirectory()) { res.writeHead(403); res.end('Forbidden'); return; }
    const content = await readFile(file);
    res.writeHead(200, { 'Content-Type':mime[extname(file)] || 'application/octet-stream', 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff', 'Content-Security-Policy':"default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; img-src 'self' data: https://*.google-analytics.com; object-src 'none'; base-uri 'self'; form-action 'none'; connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com" });
    if (req.method === 'HEAD') return res.end();
    res.end(content);
  } catch { res.writeHead(404); res.end('Not found'); }
});
server.listen(port, '127.0.0.1', () => console.log(`\n GTA SAVE STUDIO is running at http://localhost:${port}\n Your save files stay in your browser.\n`));
