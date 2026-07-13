#!/usr/bin/env node
/**
 * 从 workbench.desktop.main.js 提取可能的 UI 英文字符串
 */
const fs = require('fs');
const path = require('path');

const workbenchPath = process.argv[2] || 'D:/cursor/resources/app/out/vs/workbench/workbench.desktop.main.js';
const content = fs.readFileSync(workbenchPath, 'utf8');

const strings = new Set();

// Quoted UI strings starting with capital letter
const re1 = /["'`]([A-Z][^"'`]{4,150})["'`]/g;
let m;
while ((m = re1.exec(content))) {
  const s = m[1];
  if (s.includes('${') || s.includes('http') || /^[A-Z_]+$/.test(s)) continue;
  if (/^[a-z]/.test(s) || s.includes('function') || s.includes('return')) continue;
  strings.add(s);
}

const keywords = /agent|setting|composer|chat|model|cursor|editor|layout|privacy|plugin|rule|skill|mcp|index|general|account|billing|team|notification|terminal|browser|hook|cloud|tab|pane|mode|plan|ask|debug|review|commit|merge|diff|accept|reject|cancel|confirm|search|import|export|delete|create|new|add|remove|enable|disable|show|hide|open|close|save|copy|paste|undo|redo|file|folder|workspace|extension|marketplace|keyboard|shortcut|font|theme|update|beta|nightly|network|diagnostic|privacy|usage|limit|queue|submit|message|conversation|autocomplete|suggestion|inline|grep|embed|codebase|doc|subagent|command|allowlist|protection|auto-?run|mcp|fetch|web/i;

const filtered = [...strings]
  .filter((s) => keywords.test(s))
  .sort();

const outPath = path.join(__dirname, '..', 'data', 'extracted-strings-3.5.38.json');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify({ total: strings.size, filtered: filtered.length, strings: filtered }, null, 2));
console.log(`Total strings: ${strings.size}, filtered: ${filtered.length}`);
console.log(`Written to ${outPath}`);
