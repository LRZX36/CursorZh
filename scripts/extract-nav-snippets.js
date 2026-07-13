#!/usr/bin/env node
/**
 * 从 workbench 备份提取 JwS 导航对象原文，输出 nav-snippets JSON
 */
const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const defaultBackup = 'D:/cursor/resources/app/out/vs/workbench/workbench.desktop.main.js.cursorzh.bak';

function resolveBackupPath() {
  const arg = process.argv.find((a) => a.startsWith('--backup='));
  if (arg) return arg.slice('--backup='.length);
  return defaultBackup;
}

function extractNavSnippets(source) {
  const jwsMatch = source.match(/JwS=\{[^}]+\}/);
  const unxMatch = source.match(/uNx=\(\)=>"[^"]+"/);
  const dnxMatch = source.match(/dNx=n=>n\.isGlass\?"[^"]+":"[^"]+"/);

  if (!jwsMatch) {
    throw new Error('未找到 JwS 导航对象');
  }

  const jwsRaw = jwsMatch[0];
  const navLabels = {};
  const pairRe = /(?:"([^"]+)"|([a-zA-Z-]+)):"([^"]*)"/g;
  let m;
  while ((m = pairRe.exec(jwsRaw)) !== null) {
    const key = m[1] || m[2];
    navLabels[key] = m[3];
  }

  return {
    version: '3.5.38',
    extractedAt: new Date().toISOString(),
    jws: jwsRaw,
    uNx: unxMatch ? unxMatch[0] : null,
    dNx: dnxMatch ? dnxMatch[0] : null,
    navLabels
  };
}

function buildZhReplacements(extracted) {
  const zhLabels = {
    general: '通用',
    'vscode-settings': 'VS Code 设置',
    appearance: '外观',
    'plan-usage': '计划与用量',
    chat: '智能体',
    tab: 'Tab 补全',
    models: '模型',
    rules: '规则、技能与子智能体',
    plugins: '插件',
    indexing: '索引与文档',
    mcp: '工具与 MCP',
    hooks: '钩子',
    'local-automations': '自动化',
    beta: '测试版',
    network: '网络',
    'background-composer': '云端智能体',
    worktrees: '工作树'
  };

  const parts = Object.entries(zhLabels).map(([key, zh]) => {
    const quotedKey = key.includes('-') ? `"${key}"` : key;
    return `${quotedKey}:"${zh}"`;
  });

  return {
    jwsZh: `JwS={${parts.join(',')}}`,
    uNxZh: 'uNx=()=>"规则、技能与子智能体"',
    dNxZh: 'dNx=n=>n.isGlass?"索引":"索引与文档"'
  };
}

function main() {
  const backupPath = resolveBackupPath();
  if (!fs.existsSync(backupPath)) {
    console.error(`备份文件不存在: ${backupPath}`);
    process.exit(1);
  }

  const source = fs.readFileSync(backupPath, 'utf8');
  const extracted = extractNavSnippets(source);
  const zh = buildZhReplacements(extracted);

  const output = {
    ...extracted,
    replacements: [
      { from: extracted.jws, to: zh.jwsZh },
      ...(extracted.uNx ? [{ from: extracted.uNx, to: zh.uNxZh }] : []),
      ...(extracted.dNx ? [{ from: extracted.dNx, to: zh.dNxZh }] : [])
    ]
  };

  const outPath = path.join(projectRoot, 'data', 'nav-snippets-3.5.38.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf8');

  console.log(`已提取 ${Object.keys(extracted.navLabels).length} 个导航项`);
  console.log(`已写入 ${outPath}`);
}

main();
