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

function copyRecursive(src, dest, skipExtensions = []) {
  try {
    if (!fs.existsSync(src)) return;
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
      fs.mkdirSync(dest, { recursive: true });
      for (const f of fs.readdirSync(src)) {
        copyRecursive(path.join(src, f), path.join(dest, f), skipExtensions);
      }
    } else {
      const ext = path.extname(src);
      if (skipExtensions.includes(ext)) return;
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

  // Copy static assets (css, js, images, fonts, etc.) - skip HTML and JSX
  console.log('Copying static assets...');
  copyRecursive(PUBLIC, DIST, ['.html', '.jsx']);

  // Copy special HTML files separately (header.html, settings.html)
  const specialHtmlFiles = {
    'header.html': false,  // Copy to root, not in subdirectory
    'settings.html': true  // Copy to settings/ subdirectory
  };
  for (const [htmlFile, needsSubdir] of Object.entries(specialHtmlFiles)) {
    const htmlPath = path.join(PUBLIC, htmlFile);
    if (fs.existsSync(htmlPath)) {
      if (needsSubdir) {
        // Create subdirectory like /settings/index.html
        const dirName = htmlFile.replace('.html', '');
        const subdir = path.join(DIST, dirName);
        fs.mkdirSync(subdir, { recursive: true });
        fs.copyFileSync(htmlPath, path.join(subdir, 'index.html'));
        console.log(`Copied ${htmlFile} -> ${dirName}/index.html`);
      } else {
        // Copy to root
        fs.copyFileSync(htmlPath, path.join(DIST, htmlFile));
        console.log(`Copied ${htmlFile}`);
      }
    }
  }

  // Process JSX files and generate static HTML entry points by extracting
  // the rendered fragment and inline styles from the JSX files. This avoids
  // requiring a frontend bundler in production and fixes blank pages.
  let files = fs.readdirSync(PUBLIC).filter(f => f.endsWith('.jsx'));
  console.log('Processing JSX files:', files);

  // Detect duplicate files by content hash and remove duplicates in public
  const hashes = {};
  const crypto = require('crypto');
  files.forEach(f => {
    const p = path.join(PUBLIC, f);
    const content = fs.readFileSync(p, 'utf8');
    const h = crypto.createHash('md5').update(content).digest('hex');
    if (hashes[h]) {
      // duplicate found - remove the duplicate file
      console.log('Removing duplicate public file:', f, 'same as', hashes[h]);
      fs.unlinkSync(p);
    } else {
      hashes[h] = f;
    }
  });

  // Recompute files after dedupe
  files = fs.readdirSync(PUBLIC).filter(f => f.endsWith('.jsx'));

  for (const f of files) {
    const inPath = path.join(PUBLIC, f);
    try {
      const jsx = fs.readFileSync(inPath, 'utf8');

      // Extract styles if present: const styles = `...`;
      let styles = '';
      const stylesMatch = jsx.match(/const\s+styles\s*=\s*`([\s\S]*?)`/);
      if (stylesMatch) styles = stylesMatch[1].trim();

      // Extract script tags (both inline and src) present in the JSX body
      const scriptTagRegex = /<script[\s\S]*?<\/script>/gi;
      const scriptMatches = jsx.match(scriptTagRegex);

      // Extract fragment content between return (<> and </>)
      const retMatch = jsx.match(/return\s*\(\s*<>\s*([\s\S]*?)\s*<\/>\s*\)/);
      let body = retMatch ? retMatch[1].trim() : '';

      // Remove original <script> tags from the body (we'll reference external JS files instead)
      body = body.replace(scriptTagRegex, '');

      // The body may contain JSX expressions; we will output the HTML as-is
      // since our converted components used raw HTML in the JSX.

      // Convert className back to class for static HTML
      body = body.replace(/className=/g, 'class=');

      // Remove JSX comments {/* ... */}
      body = body.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');

      // Remove JSX inline style objects style={{...}} and replace with inline style attribute
      // This regex is more permissive to handle template literals and expressions inside
      body = body.replace(/style=\{\{([^}]*)\}\}/g, (match, content) => {
        try {
          // Try to convert key: value pairs
          const pairs = content.split(',').map(pair => {
            const colonIdx = pair.indexOf(':');
            if (colonIdx === -1) return '';
            const key = pair.substring(0, colonIdx).trim();
            let value = pair.substring(colonIdx + 1).trim();
            
            // Skip if value has template literal or JSX expression
            if (value.includes('`') || value.includes('${') || value.includes('||')) {
              return '';  // Skip dynamic styles
            }
            
            // Convert camelCase to kebab-case
            const cssKey = key.replace(/([A-Z])/g, (m) => '-' + m.toLowerCase());
            // Remove quotes
            value = value.replace(/^['"]|['"]$/g, '');
            return `${cssKey}: ${value}`;
          }).filter(p => p).join('; ');
          
          if (pairs.length > 0) {
            return `style="${pairs};"`;
          }
          return '';  // If no static styles, remove attribute
        } catch (e) {
          return '';  // Remove on error
        }
      });

      // Replace <style>{styles}</style> with actual styles
      if (styles) {
        body = body.replace(/<style>\{styles\}<\/style>/gi, `<style>\n${styles}\n</style>`);
      }

      // Remove JSX-only fragments (e.g., <style dangerouslySetInnerHTML=... />)
      body = body.replace(/<style[\s\S]*?dangerouslySetInnerHTML[\s\S]*?\/?>/gi, '');
      
      // Remove remaining <style> tags with template variables (since they're extracted to head)
      body = body.replace(/<style>[\s\S]*?\{styles\}[\s\S]*?<\/style>/gi, '');

      // Compose final HTML
      const base = path.basename(f, '.jsx');
      const titleMatch = jsx.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1] : 'TimelinePlus';

      const outDir = path.join(DIST, base);
      fs.mkdirSync(outDir, { recursive: true });
      // Process scripts: write inline script content to external JS files (to satisfy CSP)
      let scriptsHtml = '';
      if (scriptMatches && scriptMatches.length > 0) {
        const jsDir = path.join(DIST, 'js');
        if (!fs.existsSync(jsDir)) fs.mkdirSync(jsDir, { recursive: true });
        const externalScripts = [];
        let inlineContent = '';
        for (const tag of scriptMatches) {
          const srcMatch = tag.match(/src=["']([^"']+)["']/i);
          if (srcMatch) {
            // copy external script reference as-is
            externalScripts.push(`<script src="${srcMatch[1]}"></script>`);
          } else {
            // extract inner content
            const inner = tag.replace(/^<script[^>]*>/i, '').replace(/<\/script>$/i, '');
            inlineContent += inner + '\n';
          }
        }
        if (inlineContent.trim()) {
          const outJs = path.join(jsDir, `${base}.js`);
          fs.writeFileSync(outJs, inlineContent, 'utf8');
          externalScripts.unshift(`<script src="/js/${base}.js"></script>`);
        }
        scriptsHtml = externalScripts.join('\n');
      }

      // For root index, redirect based on localStorage.role
      // For dashboard pages, redirect if no token
      let redirectScriptContent = '';
      if (base === 'index') {
        redirectScriptContent = `(async()=>{const t=localStorage.getItem('token');if(!t)return;try{const r=await fetch('/api/auth/me',{headers:{'Authorization':\`Bearer \${t}\`}});if(r.ok){const d=await r.json();const role=d.user?.role;const isAdmin=d.user?.isAdmin;if(isAdmin)window.location.replace('/admin-panel/');else if(role==='freelancer')window.location.replace('/freelancer-dashboard/');else if(role==='buyer')window.location.replace('/dashboard-buyer/');}}catch(e){console.log('Not logged in')}})();`;
      } else if (base === 'freelancer-dashboard' || base === 'dashboard-buyer') {
        redirectScriptContent = `if(!localStorage.getItem('token')){window.location.replace('/');}`;
      }

      // Build HTML without inline scripts
      let html = `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width,initial-scale=1">\n  <title>${title}</title>\n  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/font-awesome@6.4.0/css/all.min.css">\n  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">\n  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css">\n  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/remixicon/3.5.0/remixicon.min.css">\n  ${styles ? `<style>\n${styles}\n</style>` : ''}\n</head>\n<body>\n${body}\n</body>\n</html>`;

      // append external script references (if we generated any)
      if (scriptsHtml && scriptsHtml.length) {
        html = html.replace('\n</body>', `\n${scriptsHtml}\n</body>`);
      }
      
      // Add redirect script as external file reference if needed
      if (redirectScriptContent) {
        const jsDir = path.join(DIST, 'js');
        if (!fs.existsSync(jsDir)) fs.mkdirSync(jsDir, { recursive: true });
        const redirectJs = path.join(jsDir, `${base}-auth.js`);
        fs.writeFileSync(redirectJs, redirectScriptContent, 'utf8');
        html = html.replace('</body>', `<script src="/js/${base}-auth.js"></script>\n</body>`);
      }
      
      // For dashboard pages, add the data loading script
      if (base === 'freelancer-dashboard' || base === 'dashboard-buyer') {
        html = html.replace('</body>', `<script src="/js/${base}.js"></script>\n</body>`);
      }

      // For deposit, campaigns, and wallet pages, inject toast first, then their scripts
      if (base === 'deposit' || base === 'campaigns' || base === 'wallet-buyer' || base === 'wallet') {
        html = html.replace('</body>', `<script src="/js/toast.js"></script>\n<script src="/js/wallet.js"></script>\n</body>`);
      }

      // Inject role enforcer on all pages to protect access (runs before page content)
      if (!['login', 'register', 'forgot', 'index'].includes(base)) {
        html = html.replace('<body>', `<body>\n<script src="/js/role-enforcer-v2.js"></script>`);
      }

      fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');

      // Keep root index for index.jsx
      if (base === 'index') {
        fs.writeFileSync(path.join(DIST, 'index.html'), html, 'utf8');
      }

      // Also expose header partial at /header.html for legacy fetch() calls
      if (base === 'header') {
        fs.writeFileSync(path.join(DIST, 'header.html'), body, 'utf8');
      }

      // Dashboard alias handling: create /dashboard pointing to appropriate page
      if (/dashboard/.test(base) && base !== 'dashboard') {
        const aliasDir = path.join(DIST, 'dashboard');
        fs.mkdirSync(aliasDir, { recursive: true });
        fs.writeFileSync(path.join(aliasDir, 'index.html'), html, 'utf8');
      }

      console.log('Built', f, '->', path.join(base, 'index.html'));
    } catch (e) {
      console.error('ERROR processing', f, ':', e.message);
    }
  }

  console.log('Build complete. dist/ contains built static pages.');
}

if (require.main === module) build();
module.exports = build;

