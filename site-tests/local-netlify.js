// Tiny local stand-in for Netlify: applies netlify.toml redirects the way
// Netlify does (rules match with or without trailing slash) and serves files.
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = process.argv[2], PORT = +process.argv[3] || 8787;
const rules = fs.readFileSync(path.join(ROOT, 'netlify.toml'), 'utf8').split('[[redirects]]').slice(1).map(b => ({
  from: (b.match(/from\s*=\s*"([^"]+)"/) || [])[1], to: (b.match(/to\s*=\s*"([^"]+)"/) || [])[1],
  status: +((b.match(/status\s*=\s*(\d+)/) || [])[1]), query: (b.match(/query\s*=\s*\{\s*(\w+)\s*=\s*"([^"]+)"/) || []).slice(1),
}));
const norm = p => (p.length > 1 ? p.replace(/\/$/, '') : p);
const types = { '.html': 'text/html; charset=utf-8', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.xml': 'application/xml', '.txt': 'text/plain', '.json': 'application/json', '.md': 'text/markdown', '.py': 'text/plain', '.toml': 'text/plain' };
const zlib = require('zlib'); let curReq = null;
function send(res, file, status = 200) {
  const f = path.join(ROOT, file);
  if (!fs.existsSync(f) || !fs.statSync(f).isFile()) { res.writeHead(404, { 'content-type': 'text/html' }); return res.end('<h1>Not found</h1>'); }
  const type = types[path.extname(f)] || 'application/octet-stream';
  if (/text|xml|json/.test(type) && /gzip/.test((curReq && curReq.headers['accept-encoding']) || '')) {
    res.writeHead(status, { 'content-type': type, 'content-encoding': 'gzip' }); return res.end(zlib.gzipSync(fs.readFileSync(f)));
  }
  res.writeHead(status, { 'content-type': type }); fs.createReadStream(f).pipe(res);
}
http.createServer((req, res) => {
  curReq = req;
  const u = new URL(req.url, 'http://x'); const p = decodeURIComponent(u.pathname);
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end(); }
  for (const r of rules) {
    const hit = r.from.endsWith('/*') ? p.startsWith(r.from.slice(0, -1)) : norm(r.from) === norm(p);
    if (!hit) continue;
    if (r.query.length && u.searchParams.get(r.query[0]) !== r.query[1]) continue;
    if (r.status === 301 || r.status === 302) { res.writeHead(r.status, { location: r.to }); return res.end(); }
    if (r.status === 404) { res.writeHead(404, { 'content-type': 'text/html' }); return res.end('<h1>Not found</h1>'); }
    return send(res, r.to.slice(1), r.status);
  }
  if (p === '/') return send(res, 'index.html');
  if (fs.existsSync(path.join(ROOT, p)) && fs.statSync(path.join(ROOT, p)).isFile()) return send(res, p.slice(1));
  if (fs.existsSync(path.join(ROOT, p + '.html'))) return send(res, p.slice(1) + '.html');
  res.writeHead(404, { 'content-type': 'text/html' }); res.end('<h1>Not found</h1>');
}).listen(PORT, () => console.log('listening', PORT));
