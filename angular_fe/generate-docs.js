#!/usr/bin/env node
/**
 * FastBuyWave — Component Source Code Documentation Generator
 * ─────────────────────────────────────────────────────────────────
 * Reads your REAL Angular component files (HTML, SCSS, TypeScript)
 * and generates documentation showing the actual source code.
 * 
 * ⚠️ NOTE: This shows SOURCE CODE, not rendered UI.
 */

'use strict';
const fs   = require('fs');
const path = require('path');

// ─── CONFIG — adjust these two paths ────────────────────────────────────────
const APP_ROOT = path.join(__dirname);
const LIB_ROOT = path.join(__dirname, '..', 'my-lib', 'projects', 'my-lib-inside', 'src', 'lib');
const OUT_FILE  = path.join(__dirname, 'FASTBUYWAVE_CODE_DOCS.html');
// ─────────────────────────────────────────────────────────────────────────────

function readSafe(p) {
  try { return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : ''; }
  catch { return ''; }
}

function walk(dir, ext, results = []) {
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, ext, results);
    else if (entry.isFile() && entry.name.endsWith(ext)) results.push(full);
  }
  return results;
}

function extractBindings(ts) {
  // Più permissiva: cattura @Input e @Output anche con alias e su più righe
  const inputs = [];
  const outputs = [];
  
  // Match @Input() propertyName
  const inputMatches = [...ts.matchAll(/@Input\([^)]*\)\s*(?:readonly\s+)?(\w+)\b/g)];
  for (const m of inputMatches) {
    inputs.push(m[1]);
  }
  
  // Match @Output() propertyName
  const outputMatches = [...ts.matchAll(/@Output\([^)]*\)\s*(?:readonly\s+)?(\w+)\b/g)];
  for (const m of outputMatches) {
    outputs.push(m[1]);
  }
  
  // Match @Input() set propertyName
  const setMatches = [...ts.matchAll(/@Input\([^)]*\)\s+set\s+(\w+)/g)];
  for (const m of setMatches) {
    inputs.push(m[1]);
  }
  
  // Match @Output() eventName (property)
  const outputEventMatches = [...ts.matchAll(/@Output\([^)]*\)\s+(\w+)\s*=/g)];
  for (const m of outputEventMatches) {
    outputs.push(m[1]);
  }
  
  return { 
    inputs: [...new Set(inputs)], 
    outputs: [...new Set(outputs)] 
  };
}

function extractScssTokens(scss) {
  const vars   = [...scss.matchAll(/\$([\w-]+)\s*:\s*([^;]+);/g)].map(m => ({ name: m[1], value: m[2].trim() }));
  const colors = [...scss.matchAll(/#([0-9a-fA-F]{3,8})\b/g)].map(m => '#' + m[1]);
  const unique = [...new Set(colors)].slice(0, 12);
  return { vars, colors: unique };
}

function extractGlobalTokens() {
  const tokensPaths = [
    path.join(APP_ROOT, 'src', 'styles', '_tokens.scss'),
    path.join(APP_ROOT, 'styles', '_tokens.scss'),
    path.join(APP_ROOT, 'src', 'assets', 'styles', '_tokens.scss')
  ];
  
  let tokensContent = '';
  for (const p of tokensPaths) {
    if (fs.existsSync(p)) {
      tokensContent = readSafe(p);
      console.log(`  ✓ Trovato _tokens.scss in ${p}`);
      break;
    }
  }
  
  if (!tokensContent) {
    console.log(`  ⚠️ _tokens.scss non trovato, uso solo variabili locali`);
    return { vars: [], colors: [] };
  }
  
  const vars = [...tokensContent.matchAll(/\$([\w-]+)\s*:\s*([^;]+);/g)].map(m => ({ 
    name: m[1], 
    value: m[2].trim(),
    source: '_tokens.scss'
  }));
  
  const colors = [...tokensContent.matchAll(/#([0-9a-fA-F]{3,8})\b/g)].map(m => '#' + m[1]);
  const uniqueColors = [...new Set(colors)].slice(0, 20);
  
  return { vars, colors: uniqueColors };
}

function toTitle(name) {
  return name
    .replace(/[-_.]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace(/\bComponent\b/gi, '')
    .trim();
}

function extractDesc(ts) {
  const m = ts.match(/@description\s*\n\s*\*\s*([^\n*]+)/);
  return m ? m[1].trim() : '';
}

function guessRole(name, html) {
  const n = name.toLowerCase();
  if (n.includes('login'))           return { icon: '🔑', tag: 'auth',     label: 'Authentication' };
  if (n.includes('register'))        return { icon: '📝', tag: 'auth',     label: 'Registration' };
  if (n.includes('dashboard'))       return { icon: '🏠', tag: 'layout',   label: 'Layout Shell' };
  if (n.includes('navbar'))          return { icon: '🧭', tag: 'layout',   label: 'Navigation' };
  if (n.includes('sidebar'))         return { icon: '📂', tag: 'layout',   label: 'Sidebar' };
  if (n.includes('footer'))          return { icon: '🔗', tag: 'layout',   label: 'Footer' };
  if (n.includes('breadcrumb'))      return { icon: '🗺️', tag: 'layout',   label: 'Breadcrumb' };
  if (n.includes('modal'))           return { icon: '🪟', tag: 'overlay',  label: 'Modal' };
  if (n.includes('spinner'))         return { icon: '⏳', tag: 'feedback', label: 'Loading' };
  if (n.includes('cart'))            return { icon: '🛒', tag: 'commerce', label: 'Cart' };
  if (n.includes('advertisement') && n.includes('create')) return { icon: '📢', tag: 'crud', label: 'Create Ad' };
  if (n.includes('advertisement') && n.includes('view'))   return { icon: '🗂️', tag: 'crud', label: 'View Ads' };
  if (n.includes('favorites'))       return { icon: '❤️', tag: 'user',     label: 'Favourites' };
  if (n.includes('search'))          return { icon: '🔍', tag: 'user',     label: 'Search' };
  if (n.includes('profile'))         return { icon: '👤', tag: 'settings', label: 'Profile' };
  if (n.includes('notification'))    return { icon: '🔔', tag: 'settings', label: 'Notifications' };
  if (n.includes('privacy'))         return { icon: '🔒', tag: 'settings', label: 'Privacy' };
  if (n.includes('language'))        return { icon: '🌐', tag: 'settings', label: 'Language' };
  if (n.includes('admin') && n.includes('category') && n.includes('create')) return { icon: '➕', tag: 'admin', label: 'Admin' };
  if (n.includes('admin') && n.includes('category') && n.includes('list'))   return { icon: '📋', tag: 'admin', label: 'Admin' };
  if (n.includes('admin') && n.includes('user'))  return { icon: '👥', tag: 'admin',    label: 'Admin' };
  if (n.includes('contact') && n.includes('request')) return { icon: '📨', tag: 'inbox', label: 'Inbox' };
  if (n.includes('appointment'))     return { icon: '📅', tag: 'inbox',    label: 'Inbox' };
  if (n.includes('dialog'))          return { icon: '💬', tag: 'overlay',  label: 'Dialog' };
  if (n.includes('calendar'))        return { icon: '📆', tag: 'inbox',    label: 'Calendar' };
  if (n.includes('card'))            return { icon: '🃏', tag: 'ui',       label: 'Card' };
  if (n.includes('pagination'))      return { icon: '📄', tag: 'ui',       label: 'Pagination' };
  if (n.includes('form'))            return { icon: '📋', tag: 'ui',       label: 'Form' };
  if (n.includes('table'))           return { icon: '📊', tag: 'ui',       label: 'Table' };
  if (n.includes('empty'))           return { icon: '🈳', tag: 'feedback', label: 'Empty State' };
  if (n.includes('carousel'))        return { icon: '🎠', tag: 'ui',       label: 'Carousel' };
  if (n.includes('tree'))            return { icon: '🌲', tag: 'ui',       label: 'Tree' };
  if (n.includes('settings'))        return { icon: '⚙️', tag: 'settings', label: 'Settings' };
  return { icon: '🧩', tag: 'misc', label: 'Component' };
}

function extractLibUsages(html) {
  return [...new Set([...html.matchAll(/<(lib-[\w-]+)/g)].map(m => m[1]))];
}

// ========== MOSTRA IL VERO CONTENUTO, NIENTE MOCKUP ==========

function buildRealContent(comp, globalTokens) {
  const html = readSafe(comp.htmlPath);
  const scss = readSafe(comp.scssPath);
  
  let htmlSample = '';
  if (html && html.trim().length > 0) {
    const truncated = html.length > 800 ? html.substring(0, 800) + '…' : html;
    htmlSample = `
      <div class="real-code-block">
        <div class="code-header">
          <span class="code-icon">📄</span>
          <span class="code-filename">${path.basename(comp.htmlPath)}</span>
          <span class="code-lines">${comp.linesHtml} lines</span>
        </div>
        <pre class="code-pre html-pre"><code class="language-html">${escHtml(truncated)}</code></pre>
      </div>
    `;
  } else {
    htmlSample = `<div class="code-placeholder">⚠️ No HTML template found</div>`;
  }
  
  let scssSample = '';
  if (scss && scss.trim().length > 10) {
    const truncatedScss = scss.length > 600 ? scss.substring(0, 600) + '…' : scss;
    scssSample = `
      <div class="real-code-block">
        <div class="code-header">
          <span class="code-icon">🎨</span>
          <span class="code-filename">${path.basename(comp.scssPath)}</span>
          <span class="code-lines">${comp.linesScss} lines</span>
        </div>
        <pre class="code-pre scss-pre"><code class="language-scss">${escHtml(truncatedScss)}</code></pre>
      </div>
    `;
  }
  
  let localVarsHtml = '';
  if (comp.vars && comp.vars.length) {
    localVarsHtml = `
      <div class="scss-vars local-vars">
        <div class="vars-header">📌 Local SCSS Variables (${comp.vars.length})</div>
        <div class="var-list">
          ${comp.vars.map(v => `<code class="var-item">$${v.name}: ${v.value}</code>`).join('')}
        </div>
      </div>
    `;
  }
  
  let globalVarsHtml = '';
  if (globalTokens && globalTokens.vars && globalTokens.vars.length) {
    globalVarsHtml = `
      <div class="scss-vars global-vars">
        <div class="vars-header">🌍 Global Tokens (_tokens.scss) — ${globalTokens.vars.length} variables</div>
        <div class="var-list var-list-global">
          ${globalTokens.vars.slice(0, 30).map(v => `<code class="var-item global-var">$${v.name}: ${v.value}</code>`).join('')}
          ${globalTokens.vars.length > 30 ? `<code class="var-item more">... e altri ${globalTokens.vars.length - 30}</code>` : ''}
        </div>
      </div>
    `;
  }
  
  let colorHtml = '';
  const allColors = [...(globalTokens?.colors || []), ...(comp.colors || [])];
  const uniqueColors = [...new Set(allColors)].slice(0, 20);
  if (uniqueColors.length) {
    colorHtml = `
      <div class="colors-section">
        <div class="colors-header">🎨 Colors found (${uniqueColors.length})</div>
        <div class="color-row">${uniqueColors.map(c =>
          `<span class="swatch" style="background:${c}" title="${c}"></span>`
        ).join('')}</div>
      </div>
    `;
  }
  
  return `
    <div class="real-content">
      ${htmlSample}
      ${scssSample}
      ${globalVarsHtml}
      ${localVarsHtml}
      ${colorHtml}
    </div>
  `;
}

function scanComponents(rootDir, source, globalTokens) {
  const tsFiles = walk(rootDir, '.component.ts');
  return tsFiles
    .filter(f => !f.endsWith('.spec.ts'))
    .map(tsPath => {
      const dir      = path.dirname(tsPath);
      const baseName = path.basename(tsPath, '.component.ts');
      const htmlPath = path.join(dir, baseName + '.component.html');
      const scssPath = path.join(dir, baseName + '.component.scss');

      const ts   = readSafe(tsPath);
      const html = readSafe(htmlPath);
      const scss = readSafe(scssPath);

      const { inputs, outputs } = extractBindings(ts);
      const { vars, colors }    = extractScssTokens(scss);
      const libUsages           = extractLibUsages(html);
      const role                = guessRole(baseName, html);
      const desc                = extractDesc(ts);

      const selMatch = ts.match(/selector\s*:\s*['"]([^'"]+)['"]/);
      const selector = selMatch ? selMatch[1] : baseName;

      return {
        name:      baseName,
        title:     toTitle(baseName),
        selector,
        source,
        tsPath,
        htmlPath,
        scssPath,
        inputs,
        outputs,
        vars,
        colors,
        libUsages,
        role,
        desc,
        hasTemplate: html.length > 0,
        hasScss:     scss.length > 10,
        linesHtml:   html.split('\n').length,
        linesTs:     ts.split('\n').length,
        linesScss:   scss.split('\n').length,
      };
    });
}

function extractRouteMappings(rootDir) {
  const rmPath = walk(rootDir, 'route-manager.service.ts')[0];
  if (!rmPath) return { navbar: {}, sidebar: {} };
  const ts = readSafe(rmPath);

  function parseRouteMap(block) {
    const map = {};
    const entries = [...block.matchAll(/(\w+)\s*:\s*(\w+Component)/g)];
    entries.forEach(m => { map[m[1]] = m[2]; });
    return map;
  }

  const navbarBlock  = ts.match(/navbarRoutes[^=]*=\s*\{([\s\S]*?)\};/)?.[1]  || '';
  const sidebarBlock = ts.match(/sidebarRoutes[^=]*=\s*\{([\s\S]*?)\};/)?.[1] || '';

  return {
    navbar:  parseRouteMap(navbarBlock),
    sidebar: parseRouteMap(sidebarBlock),
  };
}

function extractAppRoutes(rootDir) {
  const routesPath = walk(rootDir, 'app.routes.ts')[0];
  if (!routesPath) return [];
  const ts = readSafe(routesPath);
  const entries = [...ts.matchAll(/path:\s*'([^']+)'[\s\S]*?data:\s*\{[^}]*category:\s*'([^']+)'[^}]*source:\s*'([^']+)'/g)];
  return entries.map(m => ({ path: m[1], category: m[2], source: m[3] }));
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function renderBadge(text, cls) {
  return `<span class="badge badge-${cls}">${text}</span>`;
}

function renderCompCard(comp, globalTokens) {
  const realContent = buildRealContent(comp, globalTokens);
  const srcBadge = comp.source === 'lib'
    ? renderBadge('custom lib', 'lib')
    : renderBadge('app', 'app');

  const inputsHtml = comp.inputs.length
    ? comp.inputs.map(i => `<code>${i}</code>`).join(' ')
    : '<span style="color:#94a3b8;font-size:11px">none</span>';
  const outputsHtml = comp.outputs.length
    ? comp.outputs.map(o => `<code>${o}</code>`).join(' ')
    : '<span style="color:#94a3b8;font-size:11px">none</span>';

  const libTags = comp.libUsages.length
    ? comp.libUsages.map(l => `<code class="lib-tag">${l}</code>`).join(' ')
    : '';

  return `
  <div class="comp-card" data-tag="${comp.role.tag}" id="comp-${comp.name}">
    <div class="comp-real-content">${realContent}</div>
    <div class="comp-info">
      <div class="comp-header-row">
        <span class="comp-icon">${comp.role.icon}</span>
        <div>
          <div class="comp-name">${escHtml(comp.title)}</div>
          <code class="comp-selector">&lt;${escHtml(comp.selector)}&gt;</code>
        </div>
        <div class="comp-badges">${srcBadge} ${renderBadge(comp.role.label, comp.role.tag)}</div>
      </div>
      ${comp.desc ? `<p class="comp-desc">${escHtml(comp.desc)}</p>` : ''}
      <div class="comp-meta-row">
        <span class="meta-key">@Input</span>${inputsHtml}
      </div>
      <div class="comp-meta-row">
        <span class="meta-key">@Output</span>${outputsHtml}
      </div>
      ${libTags ? `<div class="comp-meta-row"><span class="meta-key">Uses</span>${libTags}</div>` : ''}
      <div class="comp-stats">
        <span>HTML ${comp.linesHtml}l</span>
        <span>TS ${comp.linesTs}l</span>
        ${comp.hasScss ? `<span>SCSS ${comp.linesScss}l</span>` : ''}
      </div>
    </div>
  </div>`;
}

function renderRouteTable(routes) {
  if (!routes.length) return '<p style="color:#94a3b8;font-size:13px">No routes found.</p>';
  return `
  <table>
    <thead><tr><th>Path</th><th>Category key</th><th>Source</th></tr></thead>
    <tbody>
      ${routes.map(r => `
      <tr>
        <td><code>/${escHtml(r.path)}</code></td>
        <td><code>${escHtml(r.category)}</code></td>
        <td><span class="badge badge-${r.source}">${r.source}</span></td>
      </tr>`).join('')}
    </tbody>
  </table>`;
}

function renderRouteMappings(routeMaps) {
  const allEntries = [
    ...Object.entries(routeMaps.navbar).map(([k,v]) => ({ key:k, comp:v, source:'navbar' })),
    ...Object.entries(routeMaps.sidebar).map(([k,v]) => ({ key:k, comp:v, source:'sidebar' })),
  ];
  if (!allEntries.length) return '';
  return `
  <table>
    <thead><tr><th>Category key</th><th>Component rendered</th><th>Source</th></tr></thead>
    <tbody>
      ${allEntries.map(e => `
      <tr>
        <td><code>${escHtml(e.key)}</code></td>
        <td><code>${escHtml(e.comp)}</code></td>
        <td><span class="badge badge-${e.source}">${e.source}</span></td>
      </tr>`).join('')}
    </tbody>
  </table>`;
}

function buildHTML(appComps, libComps, routes, routeMaps, globalTokens) {
  const allComps = [...libComps, ...appComps];
  const tags = [...new Set(allComps.map(c => c.role.tag))].sort();

  const filterBtns = ['all', ...tags].map(t =>
    `<button class="filter-btn ${t==='all'?'active':''}" data-filter="${t}">${t}</button>`
  ).join('');

  const compCards = allComps.map(comp => renderCompCard(comp, globalTokens)).join('');

  const stats = {
    total:     allComps.length,
    app:       appComps.length,
    lib:       libComps.length,
    routes:    routes.length,
    withInputs: allComps.filter(c => c.inputs.length).length,
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>FastBuyWave — Component Source Code Documentation</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
:root {
  --bg:#f6f7fb; --surface:#fff; --border:#e4e8f0; --text:#0f172a;
  --muted:#64748b; --accent:#5b5ef4; --nav-w:220px;
  --r:10px; --font:'IBM Plex Sans',sans-serif; --mono:'IBM Plex Mono',monospace;
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:var(--font);background:var(--bg);color:var(--text);font-size:14px;line-height:1.65}
a{color:var(--accent);text-decoration:none}
code{font-family:var(--mono);font-size:11.5px;background:#f1f5f9;color:#334155;padding:1px 5px;border-radius:4px}

.sidenav{position:fixed;top:0;left:0;bottom:0;width:var(--nav-w);background:var(--surface);border-right:1px solid var(--border);display:flex;flex-direction:column;z-index:100;overflow-y:auto}
.snav-logo{padding:18px 18px 12px;border-bottom:1px solid var(--border)}
.snav-logo h1{font-size:15px;font-weight:600}
.snav-logo p{font-size:11px;color:var(--muted);margin-top:2px}
.snav-sec{padding:14px 18px 3px;font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.nav-a{display:block;padding:7px 18px;font-size:13px;color:var(--muted);border-left:3px solid transparent;transition:all .12s}
.nav-a:hover,.nav-a.active{color:var(--accent);border-left-color:var(--accent);background:#eef2ff}

.topbar{position:sticky;top:0;z-index:90;margin-left:var(--nav-w);background:var(--surface);border-bottom:1px solid var(--border);padding:10px 40px;display:flex;align-items:center;justify-content:space-between}
.topbar-t{font-size:13px;font-weight:500;color:var(--muted)}
.topbar-badge{background:#dcfce7;color:#065f46;font-size:11px;padding:2px 10px;border-radius:20px;font-weight:600}

.main{margin-left:var(--nav-w);padding:40px 44px;max-width:1100px}
.section{margin-bottom:60px}
.sec-title{font-size:20px;font-weight:600;margin-bottom:4px;padding-bottom:10px;border-bottom:2px solid var(--border)}
.sec-sub{font-size:13px;color:var(--muted);margin-bottom:22px}

.hero{background:linear-gradient(135deg,#eef2ff,#f0fdf4);border:1px solid var(--border);border-radius:var(--r);padding:30px 36px;margin-bottom:26px}
.hero h2{font-size:26px;font-weight:600;margin-bottom:8px}
.hero p{color:var(--muted);max-width:580px;font-size:13.5px}
.hero-tags{display:flex;gap:6px;flex-wrap:wrap;margin-top:14px}
.hero-tag{background:#fff;border:1px solid var(--border);border-radius:20px;padding:3px 10px;font-size:11px;color:var(--muted)}

.stats-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px}
.stat-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:16px 18px}
.stat-icon{font-size:20px;margin-bottom:8px}
.stat-label{font-size:11px;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:.05em}
.stat-val{font-size:28px;font-weight:600;color:var(--accent)}

.filter-bar{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:22px}
.filter-btn{padding:5px 14px;border-radius:20px;border:1px solid var(--border);background:#fff;font-size:12px;cursor:pointer;text-transform:capitalize;transition:all .12s;font-family:var(--font)}
.filter-btn:hover{border-color:var(--accent);color:var(--accent)}
.filter-btn.active{background:var(--accent);color:#fff;border-color:var(--accent)}

.comp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(420px,1fr));gap:20px}
.comp-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);overflow:hidden;transition:box-shadow .15s}
.comp-card:hover{box-shadow:0 4px 20px rgba(91,94,244,.1)}

.comp-real-content{background:#1e293b;padding:12px;max-height:400px;overflow-y:auto}
.comp-info{padding:14px 16px}
.comp-header-row{display:flex;align-items:flex-start;gap:10px;margin-bottom:8px}
.comp-icon{font-size:20px;flex-shrink:0;margin-top:1px}
.comp-name{font-size:14px;font-weight:600}
.comp-selector{display:block;font-size:11px;color:var(--muted);margin-top:1px}
.comp-badges{margin-left:auto;display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end}
.comp-desc{font-size:12px;color:var(--muted);margin-bottom:8px;line-height:1.5}
.comp-meta-row{display:flex;flex-wrap:wrap;gap:4px;align-items:center;margin-bottom:4px;font-size:12px}
.meta-key{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);min-width:50px}
.comp-stats{display:flex;gap:8px;margin-top:8px;font-size:11px;color:var(--muted);padding-top:6px;border-top:1px solid var(--border)}
.lib-tag{background:#fce7f3;color:#be185d}

.badge{font-size:10px;font-weight:600;padding:2px 7px;border-radius:20px;letter-spacing:.03em}
.badge-lib{background:#fce7f3;color:#be185d}
.badge-app{background:#ede9fe;color:#5b21b6}
.badge-navbar{background:#dcfce7;color:#065f46}
.badge-sidebar{background:#fef3c7;color:#78350f}
.badge-layout{background:#e0f2fe;color:#0369a1}
.badge-auth{background:#ede9fe;color:#5b21b6}
.badge-crud{background:#dcfce7;color:#065f46}
.badge-overlay{background:#fce7f3;color:#be185d}
.badge-settings{background:#f1f5f9;color:#475569}
.badge-feedback{background:#fef3c7;color:#78350f}
.badge-commerce{background:#dcfce7;color:#065f46}
.badge-input{background:#e0f2fe;color:#0369a1}
.badge-user{background:#ede9fe;color:#5b21b6}
.badge-admin{background:#fee2e2;color:#991b1b}
.badge-inbox{background:#f0fdf4;color:#166534}
.badge-ui{background:#f8fafc;color:#475569}
.badge-misc{background:#f1f5f9;color:#64748b}

table{width:100%;border-collapse:collapse;font-size:13px}
thead th{background:#f8fafc;text-align:left;padding:9px 12px;font-weight:600;font-size:11px;letter-spacing:.04em;text-transform:uppercase;color:var(--muted);border-bottom:1px solid var(--border)}
tbody td{padding:9px 12px;border-bottom:1px solid #f1f5f9;vertical-align:top}
tbody tr:hover td{background:#fafbff}

.arch-wrap{background:#f8fafc;border:1px solid var(--border);border-radius:var(--r);padding:20px;margin-bottom:20px}
.callout{background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:12px 16px;font-size:13px;color:#78350f;margin:14px 0;display:flex;gap:10px}

/* Code blocks */
.real-code-block{margin-bottom:12px}
.code-header{display:flex;align-items:center;gap:8px;margin-bottom:6px;padding:4px 0;border-bottom:1px solid #334155}
.code-icon{font-size:12px}
.code-filename{font-size:10px;color:#94a3b8;font-family:var(--mono)}
.code-lines{font-size:9px;color:#64748b;margin-left:auto}
.code-pre{background:#0f172a;border-radius:6px;padding:10px;overflow-x:auto;font-size:10px;line-height:1.4;margin:0 0 10px 0}
.code-pre code{background:transparent;color:#e2e8f0;padding:0;font-size:10px}
.html-pre code{color:#7dd3fc}
.scss-pre code{color:#86efac}
.code-placeholder{color:#f87171;font-size:11px;padding:10px;text-align:center}

.scss-vars{margin:8px 0;padding:6px 8px;border-radius:6px}
.local-vars{background:#f0f9ff;border-left:3px solid #0ea5e9}
.global-vars{background:#f0fdf4;border-left:3px solid #10b981}
.vars-header{font-size:10px;font-weight:600;color:#475569;margin-bottom:6px;text-transform:uppercase}
.var-list{display:flex;flex-wrap:wrap;gap:6px}
.var-list-global{max-height:100px;overflow-y:auto}
.var-item{background:#e2e8f0;padding:2px 6px;border-radius:4px;font-size:9px}
.global-var{background:#dcfce7;color:#065f46}
.var-item.more{background:#f1f5f9;color:#64748b;font-style:italic}

.colors-section{margin-top:8px}
.colors-header{font-size:10px;font-weight:600;color:#475569;margin-bottom:6px;text-transform:uppercase}
.color-row{display:flex;gap:6px;flex-wrap:wrap}
.swatch{width:24px;height:24px;border-radius:6px;border:1px solid rgba(0,0,0,.1);cursor:pointer;transition:transform .1s}
.swatch:hover{transform:scale(1.1)}

@media(max-width:768px){.sidenav,.topbar{display:none}.main{margin-left:0;padding:20px}.comp-grid{grid-template-columns:1fr}}
@media print{.sidenav,.topbar,.filter-bar{display:none}.main{margin-left:0;padding:16px}.comp-card{break-inside:avoid}}
</style>
</head>
<body>

<nav class="sidenav">
  <div class="snav-logo">
    <h1>⚡ FastBuyWave</h1>
    <p>Code Docs — REAL source code</p>
  </div>
  <div class="snav-sec">General</div>
  <a href="#overview"      class="nav-a">Overview</a>
  <a href="#architecture"  class="nav-a">Architecture</a>
  <div class="snav-sec">Catalogue</div>
  <a href="#components"    class="nav-a">Components (${stats.total})</a>
  <a href="#routes"        class="nav-a">Routes (${stats.routes})</a>
  <a href="#route-mapping" class="nav-a">Route → Component</a>
</nav>

<div class="topbar">
  <span class="topbar-t">FastBuyWave — Component Code Reference (source code, NO rendered UI)</span>
  <span class="topbar-badge">FastBuyWave — Component Code Reference (source code, NO rendered UI)</span>
</div>

<main class="main">

<section class="section" id="overview">
  <h2 class="sec-title">Overview</h2>
  <div class="hero">
    <h2>FastBuyWave</h2>
    <p>A full-featured e-commerce marketplace where users post, browse and respond to product advertisements across multiple categories. Supports USER and ADMIN roles, lazy-loaded category views and an integrated contact / appointment system.</p>
    <div class="hero-tags">
      <span class="hero-tag">Angular 18 Standalone</span>
      <span class="hero-tag">SCSS + _tokens.scss</span>
      <span class="hero-tag">Google OAuth</span>
      <span class="hero-tag">OpenLayers Maps</span>
      <span class="hero-tag">Angular Material</span>
      <span class="hero-tag">Custom Library (my-lib-inside)</span>
      <span class="hero-tag">Lazy Loading via ngComponentOutlet</span>
    </div>
  </div>
  <div class="stats-grid">
    <div class="stat-card"><div class="stat-icon">🧩</div><div class="stat-label">Total components</div><div class="stat-val">${stats.total}</div></div>
    <div class="stat-card"><div class="stat-icon">📦</div><div class="stat-label">App components</div><div class="stat-val">${stats.app}</div></div>
    <div class="stat-card"><div class="stat-icon">📚</div><div class="stat-label">Library components</div><div class="stat-val">${stats.lib}</div></div>
    <div class="stat-card"><div class="stat-icon">🛣️</div><div class="stat-label">Routes</div><div class="stat-val">${stats.routes}</div></div>
    <div class="stat-card"><div class="stat-icon">🎛️</div><div class="stat-label">Components with @Input</div><div class="stat-val">${stats.withInputs}</div></div>
  </div>
</section>

<section class="section" id="architecture">
  <h2 class="sec-title">Architecture</h2>
  <p class="sec-sub">How the application layers interact at runtime.</p>
  <div class="arch-wrap">
    <svg viewBox="0 0 800 260" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto">
      <defs><marker id="a" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0L0,6L8,3z" fill="#94a3b8"/></marker></defs>
      <rect x="10" y="100" width="110" height="50" rx="8" fill="#e0e7ff" stroke="#6366f1" stroke-width="1.5"/>
      <text x="65" y="124" text-anchor="middle" font-size="11" fill="#3730a3" font-weight="600">Browser</text>
      <text x="65" y="138" text-anchor="middle" font-size="10" fill="#6366f1">Angular SPA</text>
      <rect x="160" y="100" width="120" height="50" rx="8" fill="#dcfce7" stroke="#10b981" stroke-width="1.5"/>
      <text x="220" y="124" text-anchor="middle" font-size="11" fill="#065f46" font-weight="600">Angular Router</text>
      <text x="220" y="138" text-anchor="middle" font-size="10" fill="#10b981">app.routes.ts</text>
      <rect x="330" y="30" width="150" height="50" rx="8" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.5"/>
      <text x="405" y="54" text-anchor="middle" font-size="11" fill="#78350f" font-weight="600">DashboardComponent</text>
      <text x="405" y="68" text-anchor="middle" font-size="10" fill="#f59e0b">Shell + ngComponentOutlet</text>
      <rect x="330" y="105" width="150" height="40" rx="8" fill="#f0fdf4" stroke="#10b981" stroke-width="1"/>
      <text x="405" y="124" text-anchor="middle" font-size="10" fill="#065f46" font-weight="600">RouteManagerService</text>
      <text x="405" y="136" text-anchor="middle" font-size="9" fill="#10b981">category → component</text>
      <rect x="330" y="170" width="150" height="50" rx="8" fill="#fce7f3" stroke="#ec4899" stroke-width="1.5"/>
      <text x="405" y="194" text-anchor="middle" font-size="11" fill="#831843" font-weight="600">my-lib-inside</text>
      <text x="405" y="208" text-anchor="middle" font-size="10" fill="#ec4899">Navbar · Sidebar · Modal…</text>
      <rect x="530" y="100" width="120" height="50" rx="8" fill="#f0f9ff" stroke="#0ea5e9" stroke-width="1.5"/>
      <text x="590" y="124" text-anchor="middle" font-size="11" fill="#0c4a6e" font-weight="600">Services</text>
      <text x="590" y="138" text-anchor="middle" font-size="10" fill="#0ea5e9">Auth · Category · Profile</text>
      <rect x="700" y="100" width="90" height="50" rx="8" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1.5"/>
      <text x="745" y="124" text-anchor="middle" font-size="11" fill="#334155" font-weight="600">Backend</text>
      <text x="745" y="138" text-anchor="middle" font-size="10" fill="#64748b">REST API</text>
      <line x1="120" y1="125" x2="158" y2="125" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#a)"/>
      <line x1="280" y1="115" x2="328" y2="70" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#a)"/>
      <line x1="280" y1="125" x2="328" y2="122" stroke="#94a3b8" stroke-width="1" stroke-dasharray="4" marker-end="url(#a)"/>
      <line x1="280" y1="135" x2="328" y2="180" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#a)"/>
      <line x1="480" y1="125" x2="528" y2="125" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#a)"/>
      <line x1="650" y1="125" x2="698" y2="125" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#a)"/>
      <line x1="405" y1="80" x2="405" y2="103" stroke="#94a3b8" stroke-width="1" stroke-dasharray="3"/>
      <line x1="405" y1="145" x2="405" y2="168" stroke="#94a3b8" stroke-width="1" stroke-dasharray="3"/>
    </svg>
  </div>
  <div class="callout">
    <span>💡</span>
    <div><strong>DashboardComponent</strong> is the universal shell for all authenticated routes. The router passes a <code>category</code> + <code>source</code> data object; <strong>RouteManagerService</strong> maps this to the correct lazy component which is then rendered via <code>ngComponentOutlet</code>.</div>
  </div>
</section>

<section class="section" id="components">
  <h2 class="sec-title">Components</h2>
  <p class="sec-sub">All ${stats.total} components — showing REAL HTML templates, REAL SCSS code, and extracted tokens.</p>
  <div class="filter-bar">${filterBtns}</div>
  <div class="comp-grid" id="compGrid">${compCards}</div>
</section>

<section class="section" id="routes">
  <h2 class="sec-title">Application Routes</h2>
  <p class="sec-sub">${stats.routes} routes extracted directly from <code>app.routes.ts</code>.</p>
  ${renderRouteTable(routes)}
</section>

<section class="section" id="route-mapping">
  <h2 class="sec-title">Route → Component Mapping</h2>
  <p class="sec-sub">Extracted from <code>RouteManagerService</code>. Shows which component is lazy-loaded for each category key.</p>
  ${renderRouteMappings(routeMaps)}
</section>

</main>

<script>
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    document.querySelectorAll('.comp-card').forEach(card => {
      card.style.display = (f === 'all' || card.dataset.tag === f) ? '' : 'none';
    });
  });
});

const sections = document.querySelectorAll('section[id]');
const links = document.querySelectorAll('.nav-a');
if (window.IntersectionObserver) {
  sections.forEach(s => {
    new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          links.forEach(l => l.classList.remove('active'));
          const a = document.querySelector('.nav-a[href="#'+e.target.id+'"]');
          if (a) a.classList.add('active');
        }
      });
    }, { threshold: 0.25 }).observe(s);
  });
}
</script>
</body>
</html>`;
}

function main() {
  console.log('\n🔍 FastBuyWave Doc Generator starting…\n');

  const srcDir = path.join(APP_ROOT, 'src', 'app');
  const libDir = LIB_ROOT;

  console.log(`  APP: ${srcDir}`);
  console.log(`  LIB: ${libDir}`);

  console.log('\n📦 Loading global tokens (_tokens.scss)...');
  const globalTokens = extractGlobalTokens();
  console.log(`  ✓ Trovate ${globalTokens.vars.length} variabili globali e ${globalTokens.colors.length} colori`);

  console.log('\n📂 Scanning app components…');
  const appComps = scanComponents(srcDir, 'app', globalTokens);
  console.log(`  Found ${appComps.length} components`);

  console.log('📚 Scanning library components…');
  const libComps = scanComponents(libDir, 'lib', globalTokens);
  console.log(`  Found ${libComps.length} components`);

  console.log('🛣️  Extracting routes…');
  const routes = extractAppRoutes(APP_ROOT);
  console.log(`  Found ${routes.length} routes`);

  console.log('🗺️  Extracting RouteManager mappings…');
  const routeMaps = extractRouteMappings(srcDir);
  const totalMappings = Object.keys(routeMaps.navbar).length + Object.keys(routeMaps.sidebar).length;
  console.log(`  Found ${totalMappings} mappings`);

  console.log('\n✍️  Generating HTML…');
  const html = buildHTML(appComps, libComps, routes, routeMaps, globalTokens);

  const outDir = path.dirname(OUT_FILE);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(OUT_FILE, html, 'utf8');

  const kb = Math.round(fs.statSync(OUT_FILE).size / 1024);
  console.log(`\n✅  Done! → ${OUT_FILE}  (${kb} KB)\n`);
  console.log('   Open docs/index.html in your browser to view the documentation.');
  console.log('   Now showing REAL HTML templates and REAL SCSS code — NO mockups!\n');
}

main();