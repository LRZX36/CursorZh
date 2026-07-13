#!/usr/bin/env node
/**
 * 验收汉化补丁：JwS 导航、关键英文词、JS 语法
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { detectCursorPath } = require('../src/platform');

const NAV_ZH = [
  '通用',
  'VS Code 设置',
  '外观',
  '计划与用量',
  '智能体',
  'Tab 补全',
  '模型',
  '规则、技能与子智能体',
  '插件',
  '索引与文档',
  '工具与 MCP',
  '钩子',
  '自动化',
  '测试版',
  '网络',
  '云端智能体',
  '工作树'
];

const EN_TERMS = [
  'Plan & Usage',
  'Tools & MCPs',
  'Indexing & Docs',
  'Worktrees',
  'General',
  'Appearance',
  'Automations',
  'Open project',
  'Clone repo',
  'Recent projects'
];

function main() {
  const arg = process.argv.find((a) => a.startsWith('--app='));
  const paths = detectCursorPath(arg ? arg.slice('--app='.length) : null);
  if (!paths) {
    console.error('未找到 Cursor 安装目录');
    process.exit(1);
  }

  const wb = fs.readFileSync(paths.mainJsPath, 'utf8');
  let failed = 0;

  const jwsMatch = wb.match(/JwS=\{[^}]+\}/);
  if (!jwsMatch) {
    console.error('FAIL: 未找到 JwS 对象');
    failed++;
  } else {
    const jws = jwsMatch[0];
    for (const label of NAV_ZH) {
      if (!jws.includes(`"${label}"`)) {
        console.error(`FAIL: JwS 缺少中文导航项 "${label}"`);
        failed++;
      }
    }
    for (const bad of ['"General"', '"Appearance"', '"Plan & Usage"', '"Agents"', '"Tools & MCPs"']) {
      if (jws.includes(bad)) {
        console.error(`FAIL: JwS 仍含英文 ${bad}`);
        failed++;
      }
    }
    if (failed === 0) console.log('PASS: JwS 导航对象已全部汉化');
  }

  for (const term of EN_TERMS) {
    const count = wb.split(term).length - 1;
    if (count > 0) {
      console.warn(`WARN: "${term}" 仍出现 ${count} 次（可能存在于非 UI 上下文）`);
    }
  }

  try {
    execSync(`node --check "${paths.mainJsPath}"`, { stdio: 'pipe' });
    console.log('PASS: workbench.desktop.main.js 语法检查通过');
  } catch (err) {
    console.error('FAIL: workbench.desktop.main.js 语法错误');
    failed++;
  }

  const nlsPath = paths.nlsMessagesPath;
  if (fs.existsSync(nlsPath)) {
    const nls = JSON.parse(fs.readFileSync(nlsPath, 'utf8'));
    const zhCount = nls.filter((s) => /[\u4e00-\u9fff]/.test(s)).length;
    console.log(`INFO: nls.messages.json 中文词条 ${zhCount}/${nls.length}`);
  }

  if (failed > 0) {
    console.error(`\n验收失败: ${failed} 项`);
    process.exit(1);
  }

  console.log('\n验收通过');
}

main();
