const fs = require('fs');
const path = require('path');

const PUBLIC = path.resolve(__dirname, '..', 'public');
const DIST = path.resolve(__dirname, '..', 'dist');

function rmrf(p) {
  try {
    if (fs.existsSync(p)) {
      fs.rmSync(p, { recursive: true, force: true });
    }
  } catch (e) {
    console.error('Error removing', p, ':', e.message);
  }
}

function copyRecursive(src, dest, filterHtml = false) {
  try {
    if (!fs.existsSync(src)) return;
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
      fs.mkdirSync(dest, { recursive: true });
      for (const f of fs.readdirSync(src)) {
        copyRecursive(path.join(src, f), path.join(dest, f), filterHtml);
      }
    } else {
      if (filterHtml && path.extname(src) === '.html') return;
      fs.copyFileSync(src, dest);
    }
  } catch (e) {
    console.error('Error copying', src, '->', dest, ':', e.message);
  }
}

function build() {
  console.log('Building frontend -> dist/');
  console.log('PUBLIC:', PUBLIC);
  console.log('DIST:', DIST);

  if (!fs.existsSync(PUBLIC)) {
    console.error('ERROR: public/ directory not found at', PUBLIC);
    process.exit(1);
  }

  rmrf(DIST);
  fs.mkdirSync(DIST, { recursive: true });

  // Copy static assets (css, js, images, fonts, etc.) - skip HTML
  console.log('Copying static assets...');
  copyRecursive(PUBLIC, DIST, true);

  // Process HTML files
  const files = fs.readdirSync(PUBLIC).filter(f => f.endsWith('.html'));
  console.log('Processing HTML files:', files);

  for (const f of files) {
    const inPath = path.join(PUBLIC, f);
    try {
      let html = fs.readFileSync(inPath, 'utf8');

      // Replace .html extensions in links with clean URLs
      html = html.replace(/(href|src)=("|')\/?([^"']+?)\.html("|')/g, (m, a, q1, p1, q2) => {
        let p = p1;
        if (!p.startsWith('/')) p = '/' + p;
        return `${a}=${q1}${p}${q2}`;
      });

      const base = path.basename(f, '.html');

      // Create /name/index.html structure
      const outDir = path.join(DIST, base);
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');

      // Special alias: if dashboard create /dashboard alias
      if (/dashboard/.test(base) && base !== 'dashboard') {
        const aliasDir = path.join(DIST, 'dashboard');
        fs.mkdirSync(aliasDir, { recursive: true });
        fs.writeFileSync(path.join(aliasDir, 'index.html'), html, 'utf8');
      }

      // Also keep copy at root for index.html
      if (base === 'index') {
        fs.writeFileSync(path.join(DIST, 'index.html'), html, 'utf8');
      }

      console.log('Built', f, '->', path.join(base, 'index.html'));
    } catch (e) {
      console.error('ERROR processing', f, ':', e.message);
    }
  }

  console.log('Build complete. dist/ contains built site.');
}

if (require.main === module) build();
module.exports = build;
