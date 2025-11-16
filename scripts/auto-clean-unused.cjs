#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const logPath = path.join(__dirname, '..', 'eslint.log');
if (!fs.existsSync(logPath)) {
  console.error('eslint.log not found at', logPath);
  process.exit(1);
}

const text = fs.readFileSync(logPath, 'utf8');
const lines = text.split(/\r?\n/);

const fileMap = new Map();
let currentFile = null;
for (const line of lines) {
  const fileMatch = line.match(/^(\/[^\s]+\.(?:ts|tsx))/);
  if (fileMatch) {
    currentFile = fileMatch[1];
    fileMap.set(currentFile, new Set());
    continue;
  }
  if (!currentFile) continue;
  // match patterns like: 'User' is defined but never used.
  const definedMatch = line.match(/'([A-Za-z0-9_$]+)' is defined but never used/);
  const assignedMatch = line.match(/'([A-Za-z0-9_$]+)' is assigned a value but never used/);
  const argsMatch = line.match(/'([A-Za-z0-9_$]+)' is defined but never used\. Allowed unused args/);
  const paramsMatch = line.match(/'([A-Za-z0-9_$]+)' is defined but never used\. Allowed unused vars/);

  const m = definedMatch || assignedMatch || argsMatch || paramsMatch;
  if (m) {
    fileMap.get(currentFile).add(m[1]);
  }
}

const modifiedFiles = [];
for (const [filePath, idSet] of fileMap.entries()) {
  if (idSet.size === 0) continue;
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  // For each identifier, try to replace in import lists first
  for (const id of Array.from(idSet)) {
    const idEsc = id.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    // Replace in import { A, B } from '...'
    const importRegex = new RegExp(`(import\\s*\\{[^}]*?)\\b${idEsc}\\b([^}]*\\}\\s*from)`, 'g');
    content = content.replace(importRegex, (m, p1, p2) => {
      // If already aliased to _ then skip
      if (new RegExp(`\\b${idEsc}\\s+as\\s+_${idEsc}\\b`).test(m)) return m;
      return `${p1}${id} as _${id}${p2}`;
    });

    // Replace simple default or named import occurrences like: import X from '...'; (rare)
    const namedImportRegex = new RegExp(`(import\\s*[^\\{\\n]*?)\\b${idEsc}\\b`, 'g');
    content = content.replace(namedImportRegex, (m, p1) => {
      // Avoid rewriting import type lines
      if (/import\\s+type/.test(m)) return m;
      return m.replace(new RegExp(`\\b${idEsc}\\b`), `_${id}`);
    });

    // Replace const/let/var declarations: const id =, let id =, var id =
    const declRegex = new RegExp(`\\b(const|let|var)\\s+${idEsc}\\b`, 'g');
    content = content.replace(declRegex, (m, p1) => `${p1} _${id}`);

    // Replace function parameter occurrences (basic): (id) => or (a, id, b) or function(x, id) {
    const paramRegex = new RegExp(`([\\(,\\s])${idEsc}([,\\)\\s=])`, 'g');
    content = content.replace(paramRegex, (m, p1, p2) => `${p1}_${id}${p2}`);

    // Replace occurrences of " = id" assignments e.g., draggedOrderId =
    const assignRegex = new RegExp(`\\b${idEsc}\\s*=`, 'g');
    content = content.replace(assignRegex, `_${id} =`);

    // Replace usages in catch clauses like catch (id)
    const catchRegex = new RegExp(`(catch\\s*\\()${idEsc}(\\))`, 'g');
    content = content.replace(catchRegex, (m, p1, p2) => `${p1}_${id}${p2}`);
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    modifiedFiles.push(filePath);
  }
}

// Output modified files for the caller
console.log('MODIFIED_FILES_START');
modifiedFiles.forEach(f => console.log(f));
console.log('MODIFIED_FILES_END');

if (modifiedFiles.length === 0) {
  console.log('No files modified by auto-cleaner.');
} else {
  console.log('Auto-cleaner modified', modifiedFiles.length, 'files.');
}
