// Work order Nov 4, 2026: one build for every live 3D entry on the site, sharing the three.js core as one chunk.
//   js/casa3d.vN.js     the guides' scenes (src/casa3d.js)
//   js/hero3d.vH.js     the homepage hero: the estate at dusk (src/hero.js)
//   js/domains3d.vD.js  the homepage domains map (src/domains.js)
//   js/three-<hash>.js  the shared code (three.js r186 core, meshopt decoder); the hash changes with its content,
//                       so the immutable cache stays safe, and a visitor downloads it once for the homepage and the guides
// Usage: node build-shared.mjs --casa 4 --hero 2 --domains 1
// Budgets, gzip, each entry with the chunks it imports: casa3d 180 KiB; hero and domains 155 KiB. The work order asked for
// the hero at or under hero3d.v1's 141 KiB while sharing the core with casa3d; esbuild splits by file, so the shared
// chunk carries every three.js class either side uses (152 KiB for the hero on a first visit, 2.3 KiB of its own after
// that). A standalone hero with the small loader would be about 143 KiB and share nothing: the shared build wins once a
// visitor opens one guide.
// The older single-file builds (build.mjs, tools/hero3d) stay for reference; their deployed files never change.
import { build } from 'esbuild';
import { gzipSync } from 'zlib';
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url)); const root = path.resolve(here, '..', '..');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const V = { casa: arg('casa', '4'), hero: arg('hero', '2'), domains: arg('domains', '1') };
const names = { [`casa3d.v${V.casa}`]: 'casa3d.js', [`hero3d.v${V.hero}`]: 'hero.js', [`domains3d.v${V.domains}`]: 'domains.js' };
const outdir = path.join(root, 'js');
const res = await build({
  entryPoints: Object.fromEntries(Object.entries(names).map(([k, f]) => [k, path.join(here, 'src', f)])),
  bundle: true, splitting: true, minify: true, format: 'esm', target: ['es2020'], outdir, chunkNames: 'three-[hash]',
  legalComments: 'none', treeShaking: true, metafile: true, define: { 'process.env.NODE_ENV': '"production"' },
  banner: { js: '/* Patrimonio Protegido: live 3D (Casa Patrimonio from the Unreal session), three.js r186 (MIT), meshoptimizer decoder (MIT). Built by tools/casa3d/build-shared.mjs. */' }
});
const gz = (f) => gzipSync(fs.readFileSync(path.resolve(process.cwd(), f)), { level: 9 }).length;   // metafile paths are relative to the working directory
const BUDGET = { casa3d: 180, hero3d: 155, domains3d: 155 };
let over = false;
for (const [out, meta] of Object.entries(res.metafile.outputs)) {
  if (!meta.entryPoint) continue;
  const rel = out;
  const deps = meta.imports.filter((x) => x.kind === 'import-statement').map((x) => x.path.replace(/\\/g, '/'));
  const own = gz(rel), shared = deps.reduce((a, d) => a + gz(d), 0), total = own + shared;
  const key = path.basename(rel).split('.')[0], b = BUDGET[key];
  console.log(`${rel}: ${(own / 1024).toFixed(1)} KiB gzip + shared ${deps.map((d) => path.basename(d)).join(', ')} ${(shared / 1024).toFixed(1)} KiB = ${(total / 1024).toFixed(1)} KiB (budget ${b} KiB)`);
  if (b && total > b * 1024) over = true;
}
if (over) { console.error('over budget'); process.exit(1); }
