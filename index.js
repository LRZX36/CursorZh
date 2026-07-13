#!/usr/bin/env node
/**
 * Cursor 3.5.38 汉化补丁
 * 覆盖 Editor / Agent / Settings
 */
const fs = require('fs');
const path = require('path');
const { detectCursorPath, hasWritePermission, readCursorVersion } = require('./src/platform');
const { translate, restore } = require('./src/i18n-core');
const { patchEditorNls, configureLocale, installLanguagePackExtension } = require('./src/editor-nls');

const SUPPORTED_VERSION = '3.5.38';

function parseArgs(argv) {
  const args = {
    action: 'apply',
    appPath: null,
    skipEditor: false,
    skipLangPack: false,
    force: false
  };

  for (const arg of argv.slice(2)) {
    if (arg === 'apply' || arg === 'restore') args.action = arg;
    else if (arg === '--skip-editor') args.skipEditor = true;
    else if (arg === '--skip-langpack') args.skipLangPack = true;
    else if (arg === '--force') args.force = true;
    else if (arg.startsWith('--app=')) args.appPath = arg.slice('--app='.length);
    else if (arg === '--help' || arg === '-h') args.action = 'help';
  }

  return args;
}

function printHelp() {
  console.log(`
Cursor 汉化补丁 v1.0.0 (适配 ${SUPPORTED_VERSION})

用法:
  node index.js apply [选项]     应用汉化补丁
  node index.js restore [选项]   恢复英文原版

选项:
  --app=<路径>        指定 Cursor resources/app 目录
  --skip-editor       跳过 Editor nls 汉化（仅汉化 Agent/Settings）
  --skip-langpack     跳过语言包扩展安装
  --force             忽略版本不匹配警告

示例:
  node index.js apply
  node index.js apply --app="D:\\cursor\\resources\\app"
  node index.js restore
`);
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.action === 'help') {
    printHelp();
    return;
  }

  const paths = detectCursorPath(args.appPath);
  if (!paths) {
    console.error('错误: 未找到 Cursor 安装目录。请使用 --app= 指定路径。');
    process.exit(1);
  }

  const version = readCursorVersion(paths.appPath);
  console.log(`检测到 Cursor ${version}`);
  console.log(`安装路径: ${paths.appPath}`);

  if (version !== SUPPORTED_VERSION && !args.force) {
    console.warn(`警告: 本补丁针对 ${SUPPORTED_VERSION} 制作，当前版本为 ${version}。`);
    console.warn('继续执行可能部分失效，建议使用 --force 强制应用。');
    process.exit(1);
  }

  if (!fs.existsSync(paths.mainJsPath)) {
    console.error(`错误: 未找到核心文件 ${paths.mainJsPath}`);
    process.exit(1);
  }

  if (!hasWritePermission(paths.mainJsPath)) {
    console.error('错误: 没有写入权限。请以管理员身份运行，或将 Cursor 安装到用户目录。');
    process.exit(1);
  }

  if (args.action === 'restore') {
    const restored = restore(paths);
    if (restored > 0) {
      console.log(`已恢复 ${restored} 个文件。请重启 Cursor。`);
    } else {
      console.log('未找到备份文件，无法恢复。');
    }
    return;
  }

  console.log('\n[1/3] 汉化 Agent / Settings / Cursor 专有界面...');
  const { stats, hashFixed } = translate(paths);
  console.log(
    `  workbench 替换: 精确 ${stats.exactCount}/${stats.exactTotal}, 安全词条 ${stats.safeCount}, 特殊规则 ${stats.trickyCount}`
  );
  if (stats.exactMisses?.length) {
    const misses = stats.exactMisses.length;
    console.log(`  精确替换未命中 ${misses} 条（可能已在之前版本汉化或格式变化）`);
    if (misses <= 8) stats.exactMisses.forEach((m) => console.log(`    - ${m}...`));
  }
  console.log(hashFixed ? '  已更新 product.json 完整性校验' : '  未更新完整性校验');

  if (!args.skipEditor) {
    console.log('\n[2/3] 汉化 Editor 基础界面 (nls.messages.json)...');
    try {
      const nlsResult = await patchEditorNls(paths);
      const rate = ((nlsResult.translated / nlsResult.total) * 100).toFixed(1);
      console.log(`  Editor 词条: ${nlsResult.translated}/${nlsResult.total} (${rate}%)`);
    } catch (err) {
      console.error(`  Editor 汉化失败: ${err.message}`);
    }
  } else {
    console.log('\n[2/3] 已跳过 Editor 汉化');
  }

  console.log('\n[3/3] 配置显示语言...');
  const localePath = configureLocale(paths.userDataPath);
  console.log(`  已写入 ${localePath}`);

  if (!args.skipLangPack) {
    const extResult = installLanguagePackExtension(paths.cursorExePath);
    if (extResult.installed) {
      console.log('  已安装中文语言包扩展');
    } else {
      console.log(`  语言包扩展安装跳过: ${extResult.reason || '未知原因'}`);
      console.log('  可手动在扩展市场搜索 "Chinese (Simplified) Language Pack" 安装');
    }
  }

  console.log('\n汉化完成！请完全退出并重启 Cursor 查看效果。');
  console.log('更新 Cursor 后需重新运行: node index.js apply');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
