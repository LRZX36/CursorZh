#!/usr/bin/env node
/**
 * 从 VS Code 中文语言包生成 zh-cn 版 nls.messages.json
 */
const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const langPackPath = path.join(projectRoot, 'data', 'langpack', 'extracted', 'extension', 'translations', 'main.i18n.json');
const outputPath = path.join(projectRoot, 'data', 'nls.messages.zh-cn.json');

function resolveAppPath() {
  const arg = process.argv.find((a) => a.startsWith('--app='));
  if (arg) return arg.slice('--app='.length);
  const candidates = [
    'D:/cursor/resources/app',
    path.join(process.env.LOCALAPPDATA || '', 'Programs/cursor/resources/app')
  ];
  return candidates.find((p) => fs.existsSync(p));
}

function build() {
  const appPath = resolveAppPath();
  if (!appPath) {
    console.error('未找到 Cursor 安装目录，请使用 --app= 指定');
    process.exit(1);
  }
  if (!fs.existsSync(langPackPath)) {
    console.error(`未找到语言包翻译文件: ${langPackPath}`);
    console.error('请先运行补丁工具，它会自动下载语言包。');
    process.exit(1);
  }

  const keys = require(path.join(appPath, 'out', 'nls.keys.json'));
  const messages = require(path.join(appPath, 'out', 'nls.messages.json'));
  const i18n = require(langPackPath);

  const zhMessages = [...messages];
  let translated = 0;
  let idx = 0;

  for (const [mod, modKeys] of keys) {
    const modTrans = i18n.contents[mod] || {};
    for (const key of modKeys) {
      const zh = modTrans[key];
      if (zh) {
        zhMessages[idx] = zh;
        translated++;
      }
      idx++;
    }
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(zhMessages), 'utf8');

  console.log(`生成完成: ${outputPath}`);
  console.log(`覆盖率: ${translated}/${messages.length} (${((translated / messages.length) * 100).toFixed(1)}%)`);
}

build();
