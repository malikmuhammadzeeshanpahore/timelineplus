const fs = require('fs');
const path = require('path');

const PUBLIC = path.resolve(__dirname, '..', 'public');
const DIST = path.resolve(__dirname, '..', 'dist');

function rmrf(p) {
  if (fs.existsSync(p)) {
    fs.rmSync(p, { recursive: true, force: true });
  }
}

function copyRecursive(src, dest, filterHtml = false) {
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
}

function build() {
  console.log('Building frontend -> dist/');
  rmrf(DIST);
  fs.mkdirSync(DIST, { recursive: true });

  // Copy static assets (css, js, images, fonts, etc.)
  copyRecursive(PUBLIC, DIST, true);

  const files = fs.readdirSync(PUBLIC).filter(f => f.endsWith('.html'));
  for (const f of files) {
    const inPath = path.join(PUBLIC, f);
    let html = fs.readFileSync(inPath, 'utf8');

    // Replace /something.html with /something (absolute links)
    html = html.replace(/(href|src)=("|')\/?([^"']+?)\.html("|')/g, (m, a, q1, p1, q2) => {
      return `${a}=${q1}/${p1}${q2}`; // keep leading slash
    });

    // Replace relative links like "page.html" to "/page"
    html = html.replace(/(href|src)=("|')([^"']+?)\.html("|')/g, (m, a, q1, p1, q2) => {
      let p = p1;
      if (!p.startsWith('/')) p = '/' + p;
      return `${a}=${q1}${p}${q2}`;
    });

    const base = path.basename(f, '.html');

    // default output dir: dist/<base>/index.html (so /<base> works)
    const outDir = path.join(DIST, base);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');

    // special alias: if name contains "dashboard" create /dashboard alias
    if (/dashboard/.test(base) && base !== 'dashboard') {
      const aliasDir = path.join(DIST, 'dashboard');
      fs.mkdirSync(aliasDir, { recursive: true });
      fs.writeFileSync(path.join(aliasDir, 'index.html'), html, 'utf8');
    }

    // also keep copy at root for index.html
    if (base === 'index') {
      fs.writeFileSync(path.join(DIST, 'index.html'), html, 'utf8');
    }

    console.log('Built', f, '->', path.join(outDir, 'index.html'));
  }

  console.log('Build complete. dist/ contains built site.');
}

if (require.main === module) build();
module.exports = build;
