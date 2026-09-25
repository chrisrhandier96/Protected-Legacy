// Post-build steps applied to the flat pages, in order. All steps are idempotent.
// Usage (repo root, after build_library.py + flatten.py): node tools/postbuild.js
const { execFileSync } = require('child_process'); const path = require('path');
const ROOT = path.resolve(__dirname, '..'); const P = f => path.join(__dirname, 'post', f);
for (const step of ['add-slash.js', 'add-panel.js', 'apply-logo.js', 'add-og.js', 'apply-fixes.js', 'a11y-css.js', 'apply-v2-lib.js']) {
  process.stdout.write(`-- ${step}\n`); execFileSync(process.execPath, [P(step), ROOT], { stdio: 'inherit' });
}
