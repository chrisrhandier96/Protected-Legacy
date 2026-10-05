// Bundles src/main.js (three.js + the scene) into /js/hero3d.vN.js: tree-shaken, minified, ES2019, no CDN.
// Usage: node build.mjs [--version N]   (bump N in both homepages whenever the output changes)
import { build } from 'esbuild';
import { gzipSync } from 'zlib';
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url)); const root = path.resolve(here, '..', '..');
const i = process.argv.indexOf('--version'); const v = i > 0 ? process.argv[i + 1] : '1';
const out = path.join(root, 'js', `hero3d.v${v}.js`);
fs.mkdirSync(path.dirname(out), { recursive: true });
await build({ entryPoints: [path.join(here, 'src', 'main.js')], bundle: true, minify: true, format: 'esm', target: ['es2020'], outfile: out, legalComments: 'none', treeShaking: true, define: { 'process.env.NODE_ENV': '"production"' }, banner: { js: '/* Patrimonio Protegido: hero skyline, three.js r186 (MIT). Built by tools/hero3d/build.mjs. */' } });
const raw = fs.readFileSync(out); const gz = gzipSync(raw, { level: 9 }).length;
console.log(`${path.relative(root, out)}: ${(raw.length / 1024).toFixed(1)} KiB raw, ${(gz / 1024).toFixed(1)} KiB gzip (budget 160 KiB gzip)`);
if (gz > 160 * 1024) { console.error('over budget'); process.exit(1); }
