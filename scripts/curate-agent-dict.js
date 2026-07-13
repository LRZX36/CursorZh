#!/usr/bin/env node
/**
 * 从 dict-candidates 中筛选 Agent 相关词条，输出精选合并列表
 */
const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const candidatesPath = path.join(projectRoot, 'data', 'dict-candidates.json');
const dictPath = path.join(projectRoot, 'src', 'dict.js');
const outPath = path.join(projectRoot, 'data', 'dict-agent-curated.json');

const AGENT_KEYWORDS =
  /\b(agent|agents|chat|composer|plan|ask|debug|subagent|mcp|approval|awaiting|checkpoint|hook|cloud agent|background agent|terminal approval|mode switch|queue message|tool call|review changes|accept changes|reject changes|stop generation|new chat|clear chat|run agent|build with agent)\b/i;

const EXCLUDE =
  /proto JSON|layout phase|DisposableStore|DisposableMap|TunnelService|Glass WebSocket|R:text\.html|scaling factor|layering phase|editor\.update\(\)|plausibly related|webhook auth|worktrees directory|Cursor worktrees directory|Failed to play sound|Privacy Mode enabled, none of your questions/i;

function loadExisting() {
  delete require.cache[require.resolve(dictPath)];
  const dict = require(dictPath);
  return new Set([...Object.keys(dict.safeGlobalDict), ...Object.keys(dict.riskyShortWords)]);
}

function main() {
  const data = JSON.parse(fs.readFileSync(candidatesPath, 'utf8'));
  const existing = loadExisting();

  const curated = [];
  for (const entry of data.safe) {
    if (!entry.zh) continue;
    if (existing.has(entry.en)) continue;
    if (!AGENT_KEYWORDS.test(entry.en)) continue;
    if (EXCLUDE.test(entry.en)) continue;
    if (entry.en.length > 100) continue;
    curated.push(entry);
  }

  curated.sort((a, b) => b.en.length - a.en.length);

  const output = {
    generatedAt: new Date().toISOString(),
    count: curated.length,
    entries: curated
  };

  fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf8');
  console.log(`curated agent entries: ${curated.length}`);
  console.log(`written: ${outPath}`);
}

main();
