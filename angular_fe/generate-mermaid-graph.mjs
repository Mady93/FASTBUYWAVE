/**
 * @fileoverview Generates a Mermaid diagram of all import-based dependencies in the Angular project.
 * Scans the src/app directory, extracts TypeScript import statements, and creates a visual graph
 * showing relationships between all modules.
 * 
 * @author FastBuyWave Team
 * @version 2.0.0
 * 
 * @example
 * // From project root:
 * node generate-mermaid-graph.mjs
 */

import { readdir, stat, readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';

/** @constant {string} ROOT - Root directory containing source code to scan */
const ROOT = path.join(process.cwd(), 'src/app');

/** @constant {string} OUT_DIR - Output directory for generated files */
const OUT_DIR = path.join(process.cwd(), 'graphs');

/** @constant {Promise<void>} - Create output directory if it doesn't exist */
await mkdir(OUT_DIR, { recursive: true });

/** @constant {string[]} EXCLUDED_FILES - Files to exclude from scanning */
const EXCLUDED_FILES = ['app.config.server.ts', 'app.config.ts', 'app.routes.ts'];

/** @constant {string[]} EXCLUDED_PATTERNS - File patterns to exclude (test files) */
const EXCLUDED_PATTERNS = ['.spec.ts', '.test.ts'];

/** @type {Map<string, {safe: string, category: string, label: string}>} */
const nodes = new Map();

/** @type {Array<{from: string, to: string, importName: string}>} */
const edges = [];

/**
 * Category definitions with color codes for Mermaid diagram
 * @type {Object.<string, {color: string}>}
 */
const categories = {
  component: { color: '#1f77b4' },  // Blue - Angular components
  service: { color: '#2ca02c' },    // Green - Injectable services
  util: { color: '#ffc107' },       // Yellow - Utility functions
  constant: { color: '#17a2b8' },   // Teal - Constants
  model: { color: '#6f42c1' },      // Purple - Data models/DTOs
  interface: { color: '#e83e8c' },  // Pink - TypeScript interfaces
  enum: { color: '#fd7e14' },       // Orange - Enumerations
  guard: { color: '#20c997' },      // Green-Gray - Route guards
  pipe: { color: '#dc3545' },       // Red - Angular pipes
  directive: { color: '#6c757d' },  // Gray - Angular directives
  external: { color: '#ff7f0e' }    // Orange-Brown - External dependencies
};

/**
 * Creates a safe identifier for Mermaid node names
 * Replaces invalid characters with underscores and ensures the name starts with a letter
 * 
 * @param {string} name - Original file name
 * @returns {string} Safe name suitable for Mermaid node identifier
 */
function makeSafeName(name) {
  return name
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/^[0-9]/, '_$&')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

/**
 * Determines the category of a file based on its content and filename
 * 
 * @param {string} fileName - Name of the file being scanned
 * @param {string} content - File content as string
 * @returns {string} Category identifier (component, service, util, etc.)
 */
function getCategory(fileName, content) {
  const name = fileName.toLowerCase();
  
  if (/@Component/.test(content)) return 'component';
  if (/@Injectable/.test(content)) return 'service';
  if (name.includes('.util') || /export\s+function/.test(content)) return 'util';
  if (name.includes('.constant') || /export\s+const/.test(content)) return 'constant';
  if (name.includes('.model') || /export\s+class/.test(content) && !/@Component/.test(content) && !/@Injectable/.test(content)) return 'model';
  if (name.includes('.interface') || /export\s+interface/.test(content)) return 'interface';
  if (name.includes('.enum') || /export\s+enum/.test(content)) return 'enum';
  if (name.includes('.guard') || /canActivate/.test(content)) return 'guard';
  if (name.includes('.pipe') || /@Pipe/.test(content)) return 'pipe';
  if (name.includes('.directive') || /@Directive/.test(content)) return 'directive';
  
  return 'util';
}

/**
 * Recursively scans a directory for TypeScript files and extracts import relationships
 * 
 * @async
 * @param {string} dir - Directory path to scan
 * @returns {Promise<void>}
 */
async function scanDir(dir) {
  const files = await readdir(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stats = await stat(fullPath);
    
    if (stats.isDirectory()) {
      if (file !== 'node_modules' && !file.startsWith('.')) {
        await scanDir(fullPath);
      }
    } else if (file.endsWith('.ts') && !EXCLUDED_PATTERNS.some(p => file.includes(p))) {
      if (EXCLUDED_FILES.includes(file)) continue;
      
      const content = await readFile(fullPath, 'utf8');
      const name = file.replace('.ts', '');
      const safeName = makeSafeName(name);
      const category = getCategory(file, content);
      
      // Aggiungi nodo
      if (!nodes.has(name)) {
        nodes.set(name, { safe: safeName, category, label: name });
      }
      
      const importRegex = /import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/g;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        const imports = match[1].split(',').map(i => i.trim());
        const importPath = match[2];
        
        let importedFile = importPath.split('/').pop();
        if (importedFile.startsWith('.')) {
          const currentDir = path.dirname(fullPath);
          const resolvedPath = path.resolve(currentDir, importPath);
          importedFile = path.basename(resolvedPath, '.ts');
        } else {
          importedFile = importedFile.replace('.ts', '');
        }
        
        imports.forEach(imp => {
          if (imp && !imp.startsWith('type')) {
            edges.push({ from: name, to: importedFile, importName: imp });
          }
        });
      }
    }
  }
}

console.log('Scanning...');
await scanDir(ROOT);

/** @type {Map<string, boolean>} */
const usedNames = new Map();
/** @type {Array} */
const finalNodes = [];
nodes.forEach((node, name) => {
  let baseName = node.safe;
  let counter = 1;
  let finalName = baseName;
  while (usedNames.has(finalName)) {
    finalName = `${baseName}_${counter}`;
    counter++;
  }
  usedNames.set(finalName, true);
  finalNodes.push({ ...node, safe: finalName, originalName: name });
  node.safe = finalName;
});

let mermaid = '```mermaid\ngraph TD\n';

finalNodes.forEach(node => {
  mermaid += `    ${node.safe}["${node.label}"]:::${node.category}\n`;
});

const nodeNames = new Set(finalNodes.map(n => n.originalName));
let validEdges = 0;
let skippedEdges = 0;

edges.forEach(edge => {
  if (nodeNames.has(edge.from) && nodeNames.has(edge.to)) {
    const fromNode = finalNodes.find(n => n.originalName === edge.from);
    const toNode = finalNodes.find(n => n.originalName === edge.to);
    if (fromNode && toNode) {
      mermaid += `    ${fromNode.safe} --> ${toNode.safe}\n`;
      validEdges++;
    } else {
      skippedEdges++;
    }
  } else {
    skippedEdges++;
  }
});

Object.entries(categories).forEach(([cat, config]) => {
  mermaid += `\n    classDef ${cat} fill:${config.color},stroke:#000,stroke-width:1px,color:#fff;`;
});

mermaid += '\n```';

await writeFile(path.join(OUT_DIR, 'full-import-graph.md'), mermaid);

// 🔥 Genera una versione pulita senza backtick per il CLI di Mermaid 🔥
const cleanMermaid = mermaid
  .replace(/^```mermaid\n/, '')
  .replace(/\n```$/, '');
await writeFile(path.join(OUT_DIR, 'full-import-graph-clean.mmd'), cleanMermaid);
console.log('   Clean version for CLI: full-import-graph-clean.mmd');
// 🔥 FINE AGGIUNTA 🔥


// Statistiche
console.log('\nDone: ' + path.join(OUT_DIR, 'full-import-graph.md'));
console.log('\nStatistics:');
console.log(`   Total files: ${finalNodes.length}`);
console.log(`   Total connections: ${edges.length}`);
console.log(`   Valid connections: ${validEdges}`);
console.log(`   Skipped connections: ${skippedEdges}`);

const catStats = {};
finalNodes.forEach(n => {
  catStats[n.category] = (catStats[n.category] || 0) + 1;
});
console.log('\nBy category:');
Object.entries(catStats).sort().forEach(([cat, count]) => {
  console.log(`   ${cat}: ${count}`);
});