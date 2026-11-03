// Bundles src/main.js (three.js r186 + GLTFLoader + the viewer) into /js/flood3d.vN.js: tree-shaken, minified, no CDN.
// Usage: node build.mjs [--version N]   (bump N whenever the output changes; /js/ is cached as immutable)
import { build } from 'esbuild';
import { gzipSync } from 'zlib';
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url)); const root = path.resolve(here, '..', '..');
const i = process.argv.indexOf('--version'); const v = i > 0 ? process.argv[i + 1] : '1';
const out = path.join(root, 'js', `flood3d.v${v}.js`);
await build({ entryPoints: [path.join(here, 'src', 'main.js')], bundle: true, minify: true, format: 'esm', target: ['es2020'], outfile: out, legalComments: 'none', treeShaking: true, define: { 'process.env.NODE_ENV': '"production"' }, banner: { js: '/* Patrimonio Protegido: live 3D flood viewer, three.js r186 (MIT), meshoptimizer decoder (MIT). Built by tools/flood3d/build.mjs. */' } });
const raw = fs.readFileSync(out); const gz = gzipSync(raw, { level: 9 }).length;
console.log(`${path.relative(root, out)}: ${(raw.length / 1024).toFixed(1)} KiB raw, ${(gz / 1024).toFixed(1)} KiB gzip (budget 180 KiB gzip)`);
if (gz > 180 * 1024) { console.error('over budget'); process.exit(1); }
