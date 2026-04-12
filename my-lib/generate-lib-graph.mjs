/**
 * @fileoverview Generates a Mermaid diagram of import-based dependencies for the Angular library.
 * Scans the projects/my-lib-inside/src directory, extracts TypeScript import statements,
 * and creates a visual graph showing relationships between all modules.
 * 
 * @author FastBuyWave Team
 * @version 1.0.0
 * 
 * @example
 * // From project root:
 * node generate-lib-graph.mjs
 */

import { readdir, stat, readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// CONFIGURATION
// ============================================

/** Root directory containing source code to scan */
const ROOT = path.join(__dirname, 'projects', 'my-lib-inside', 'src');

/** Output directory for generated files */
const OUT_DIR = path.join(__dirname, 'graphs');

/** File extensions to scan */
const EXTENSIONS = ['.ts'];

/** Files/folders to exclude */
const EXCLUDE_PATTERNS = [
  'node_modules',
  '.spec.ts',
  '.test.ts',
  '.d.ts',
  'public'
];

// ============================================
// IMPLEMENTATION
// ============================================

await mkdir(OUT_DIR, { recursive: true });

/** @type {Map<string, {safe: string, category: string, label: string, path: string}>} */
const nodes = new Map();

/** @type {Array<{from: string, to: string}>} */
const edges = [];

/**
 * Category definitions with color codes
 */
const categories = {
  component: { color: '#3b82f6', label: 'Components' },
  service: { color: '#10b981', label: 'Services' },
  interface: { color: '#8b5cf6', label: 'Interfaces' },
  pipe: { color: '#f97316', label: 'Pipes' },
  constant: { color: '#fbbf24', label: 'Constants' },
  util: { color: '#49ae5d', label: 'Utils' },
  other: { color: '#5776a2', label: 'Other' }
};

function makeSafeName(name) {
  return name
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/^[0-9]/, '_$&')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

function shouldExclude(filePath) {
  return EXCLUDE_PATTERNS.some(pattern => filePath.includes(pattern));
}

function getCategory(filePath, content) {
  const pathLower = filePath.toLowerCase();
  const fileName = path.basename(filePath).toLowerCase();

    // REGOLA SPECIALE PER INPUT COMPONENT MAP
  if (fileName === 'input-component-map.ts') return 'util';
  
  // REGOLA SPECIFICA PER InputComponent
  if (pathLower.includes('input_component.interface')) return 'interface';

    // REGOLA PER I FILE DI COSTANTI (nome del file)
  if (fileName === 'icons.ts' || fileName === 'payment_method_icons_footer.ts') {
    return 'constant';
  }
  
  // PRIORITÀ ALTA: basato sul PATH (prima del contenuto)
  if (pathLower.includes('/constants/')) return 'constant';
  if (pathLower.includes('/interfaces/')) return 'interface';
  if (pathLower.includes('/components/')) return 'component';
  if (pathLower.includes('/services/')) return 'service';
  if (pathLower.includes('/pipes/')) return 'pipe';
  if (pathLower.includes('/utils/')) return 'util';
  
  // BASATO SUL CONTENUTO
  if (/@Component/.test(content)) return 'component';
  if (/@Injectable/.test(content)) return 'service';
  if (/@Pipe/.test(content)) return 'pipe';
  if (/export const/.test(content)) return 'constant';
  if (/export interface/.test(content)) return 'interface';
  if (/export class/.test(content) && !/@Component/.test(content) && !/@Injectable/.test(content)) return 'other';
  
  // BASATO SUL NOME DEL FILE
  if (fileName.includes('.constant')) return 'constant';
  if (fileName.includes('.interface')) return 'interface';
  if (fileName.includes('.component')) return 'component';
  if (fileName.includes('.service')) return 'service';
  if (fileName.includes('.pipe')) return 'pipe';
  if (fileName.includes('.util')) return 'util';
  
  // FALLBACK FINALE: cerca parole chiave nel contenuto
  const lowerContent = content.toLowerCase();
  if (lowerContent.includes('interface')) return 'interface';
  if (lowerContent.includes('const ') || lowerContent.includes('export const')) return 'constant';
  if (lowerContent.includes('@component')) return 'component';
  if (lowerContent.includes('@injectable')) return 'service';
  if (lowerContent.includes('@pipe')) return 'pipe';
  
  return 'other';
}

function extractImports(content) {
  const imports = [];
  
  // Named imports: import { something } from './path'
  const namedRegex = /import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/g;
  let match;
  while ((match = namedRegex.exec(content)) !== null) {
    const importNames = match[1].split(',').map(i => i.trim());
    const importPath = match[2];
    imports.push({ names: importNames, path: importPath });
  }
  
  // Default imports: import something from './path'
  const defaultRegex = /import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g;
  while ((match = defaultRegex.exec(content)) !== null) {
    const importName = match[1];
    const importPath = match[2];
    imports.push({ names: [importName], path: importPath });
  }
  
  return imports;
}

function resolveImportPath(importPath, currentFilePath) {
  if (importPath.startsWith('.')) {
    const currentDir = path.dirname(currentFilePath);
    const resolved = path.resolve(currentDir, importPath);
    let baseName = path.basename(resolved, '.ts');
    if (baseName === 'index') {
      baseName = path.basename(path.dirname(resolved));
    }
    return baseName;
  }
  return null;
}

async function scanDir(dir) {
  const files = await readdir(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stats = await stat(fullPath);
    
    if (stats.isDirectory()) {
      if (!shouldExclude(fullPath)) {
        await scanDir(fullPath);
      }
    } else if (EXTENSIONS.some(ext => file.endsWith(ext)) && !shouldExclude(fullPath)) {
      const content = await readFile(fullPath, 'utf8');
      const name = path.basename(file, '.ts');
      const safeName = makeSafeName(name);
      const category = getCategory(fullPath, content);
      
      if (!nodes.has(name)) {
        nodes.set(name, {
          safe: safeName,
          category,
          label: name,
          path: fullPath
        });
      }
      
      const imports = extractImports(content);
      for (const imp of imports) {
        const resolved = resolveImportPath(imp.path, fullPath);
        if (resolved && resolved !== name) {
          edges.push({ from: name, to: resolved });
        }
      }
    }
  }
}

console.log('Scanning library...');
await scanDir(ROOT);

// Genera Mermaid
let mermaid = '```mermaid\ngraph TD\n\n';

// Aggiungi nodi per categoria
const nodesByCategory = {};
for (const [name, node] of nodes) {
  if (!nodesByCategory[node.category]) {
    nodesByCategory[node.category] = [];
  }
  nodesByCategory[node.category].push(node);
}

for (const [category, catNodes] of Object.entries(nodesByCategory)) {
  mermaid += `  %% -- ${categories[category]?.label || category} --\n`;
  for (const node of catNodes) {
    mermaid += `  ${node.safe}["${node.label}"]:::${category}\n`;
  }
  mermaid += '\n';
}

// Aggiungi edges
const validEdges = edges.filter(edge => nodes.has(edge.from) && nodes.has(edge.to));
const edgeSet = new Set();
for (const edge of validEdges) {
  const key = `${edge.from}|${edge.to}`;
  if (!edgeSet.has(key)) {
    edgeSet.add(key);
    mermaid += `  ${nodes.get(edge.from).safe} --> ${nodes.get(edge.to).safe}\n`;
  }
}

// Aggiungi classDef
mermaid += '\n';
for (const [category, config] of Object.entries(categories)) {
  if (nodesByCategory[category]?.length) {
    mermaid += `  classDef ${category} fill:${config.color},stroke:#000,stroke-width:1px,color:#fff\n`;
  }
}
mermaid += '```';

// Salva
await writeFile(path.join(OUT_DIR, 'lib-dependency-graph.md'), mermaid);

// Clean version
const cleanMermaid = mermaid
  .replace(/^```mermaid\n/, '')
  .replace(/\n```$/, '');
await writeFile(path.join(OUT_DIR, 'lib-dependency-graph.mmd'), cleanMermaid);

// Statistiche
console.log('\n✅ Graph generated!');
console.log(`📁 Output: ${path.join(OUT_DIR, 'lib-dependency-graph.md')}`);
console.log(`\n📊 Statistics:`);
console.log(`   Total files: ${nodes.size}`);
console.log(`   Total edges: ${edges.length}`);
console.log(`   Valid edges: ${validEdges.length}`);

console.log('\n📂 By category:');
for (const [cat, nodes] of Object.entries(nodesByCategory).sort()) {
  console.log(`   ${categories[cat]?.label || cat}: ${nodes.length}`);
}