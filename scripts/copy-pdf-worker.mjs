// Copies the pdf.js worker into /public so the browser can load it from our
// own origin (no third-party CDN, works with any bundler).
import { copyFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const pkgDir = dirname(require.resolve('pdfjs-dist/package.json'));
const { version } = require('pdfjs-dist/package.json');
mkdirSync('public/vendor', { recursive: true });
copyFileSync(join(pkgDir, 'build/pdf.worker.min.mjs'), `public/vendor/pdf.worker-${version}.min.mjs`);
console.log(`[pdf-worker] copied pdf.worker-${version}.min.mjs`);
