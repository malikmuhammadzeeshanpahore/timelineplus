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

  // Process JSX files and generate HTML entry points
  const files = fs.readdirSync(PUBLIC).filter(f => f.endsWith('.jsx'));
  console.log('Processing JSX files:', files);

  // Create main app entry point
  let imports = '';
  let routes = '';
  
  files.forEach(f => {
    const componentName = path.basename(f, '.jsx')
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
    
    imports += `import ${componentName} from '../public/${f.replace('.jsx', '')}';\n`;
    const routeName = '/' + path.basename(f, '.jsx') + '.html';
    routes += `  case '${routeName}':\n    return <${componentName} />;\n`;
  });

  // Create App.jsx
  const appJsx = `import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

${imports}

const App = () => {
  const currentPath = window.location.pathname;
  
  const getComponent = () => {
    switch(currentPath) {
${routes}
      default:
        return null;
    }
  };

  return <>{getComponent()}</>;
};

export default App;
`;

  fs.writeFileSync(path.join(DIST, 'App.jsx'), appJsx, 'utf8');

  // Create main index.html with React app mount
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TimelinePlus</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script src="/index.js"></script>
</body>
</html>
`;

  fs.writeFileSync(path.join(DIST, 'index.html'), indexHtml, 'utf8');

  // Create JSX file routes that render individual components
  files.forEach(f => {
    const base = path.basename(f, '.jsx');
    const componentName = base
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');

    const pageJsx = `import React from 'react';
import ${componentName} from '../public/${base}';

export default ${componentName};
`;

    const outDir = path.join(DIST, base);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.jsx'), pageJsx, 'utf8');

    // Create HTML wrapper for each JSX page
    const pageHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TimelinePlus - ${base}</title>
</head>
<body>
  <div id="root"></div>
  <script src="/_jsx/${base}.js"></script>
</body>
</html>
`;
    fs.writeFileSync(path.join(outDir, 'index.html'), pageHtml, 'utf8');
    console.log('Built', f, '->', path.join(base, 'index.html'));
  });

  // Create special alias for dashboard
  const dashboardDir = path.join(DIST, 'dashboard');
  fs.mkdirSync(dashboardDir, { recursive: true });
  const dashboardHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TimelinePlus - Dashboard</title>
</head>
<body>
  <div id="root"></div>
  <script>
    const role = localStorage.getItem('role') || 'buyer';
    const redirect = role === 'freelancer' ? '/freelancer-dashboard.html' : '/dashboard-buyer.html';
    window.location.href = redirect;
  </script>
</body>
</html>
`;
  fs.writeFileSync(path.join(dashboardDir, 'index.html'), dashboardHtml, 'utf8');

  console.log('Build complete. dist/ contains built site.');
}

if (require.main === module) build();
module.exports = build;

