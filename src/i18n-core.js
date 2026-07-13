/**
 * 核心汉化逻辑 + 完整性校验修复
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { safeGlobalDict, riskyShortWords } = require('./dict');
const { exactSnippets } = require('./exact-snippets');

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const safeEntries = Object.entries(safeGlobalDict).sort((a, b) => b[0].length - a[0].length);
const safePattern = safeEntries.map(([en]) => escapeRegExp(en)).join('|');
const safeMegaRegex = safePattern ? new RegExp(`(["'\`])(${safePattern})\\1`, 'g') : null;

const longEntries = safeEntries.filter(([en]) => en.length >= 20);
const longPattern = longEntries.map(([en]) => escapeRegExp(en)).join('|');
const longMegaRegex = longPattern ? new RegExp(`(${longPattern})`, 'g') : null;

const uiProps = ['children', 'title', 'label', 'placeholder', 'description', 'tooltip', 'text', 'ariaLabel'];
const uiPropsPattern = uiProps.join('|');

const riskyRegexes = Object.entries(riskyShortWords).map(([en, zh]) => {
  const escaped = escapeRegExp(en);
  return {
    en,
    zh,
    propRegex: new RegExp(`(${uiPropsPattern})\\s*:\\s*(["'\`])(${escaped})\\2`, 'g'),
    jsxRegex: new RegExp(`(null|}|\\w)\\s*,\\s*(["'\`])(${escaped})\\2\\s*(?=[,)])`, 'g'),
    htmlRegex: new RegExp(`>\\s*(${escaped})\\s*<`, 'g')
  };
});

const trickyReplacements = [
  {
    regex: /Reset\s+(?:\\?["']|\\u201[CD]|\\u0022|")Don(?:'|\\'|\\u2019|’|')t\s+Ask\s+Again(?:\\?["']|\\u201[CD]|\\u0022|")\s+Dialogs/gi,
    zh: '重置“不再询问”弹窗'
  },
  {
    regex: /See\s+warnings\s+and\s+tips\s+that\s+you(?:'|\\'|\\u2019|’|')ve\s+hidden/gi,
    zh: '查看您已隐藏的警告和提示'
  },
  {
    regex: /No\s+Hidden\s+Dialogs\s+Yet/gi,
    zh: '暂无隐藏的弹窗'
  },
  {
    regex: /You\s+haven(?:'|\\'|\\u2019|’|')t\s+marked\s+any\s+dialogs\s+as\s+(?:\\?["']|\\u201[CD]|\\u0022|")Don(?:'|\\'|\\u2019|’|')t\s+ask\s+again(?:\\?["']|\\u201[CD]|\\u0022|")\.\s*Any\s+hidden\s+dialogs\s+will\s+appear\s+here\s+to\s+manage\./gi,
    zh: '您尚未将任何弹窗标记为“不再询问”。任何隐藏的弹窗都将显示在此处以供管理。'
  },
  {
    regex: /Use\s+with\s+caution\.\s*Skip\s+symlinks\s+during\s+\.cursorignore\s+file\s+discovery\.\s*Only\s+enable\s+if\s+your\s+repository\s+has\s+many\s+symlinks\s+and\s+all\s+\.cursorignore\s+files\s+are\s+reachable\s+without\s+them(?:\$\{[^}]*\}[^C]*)?\.\s*Changing\s+this\s+setting\s+will\s+require\s+a\s+restart\s+of\s+Cursor\./gi,
    zh: '请谨慎使用。在查找 .cursorignore 文件时跳过符号链接。仅当代码库包含大量符号链接且均可直接访问时才启用。更改此设置需重启 Cursor。'
  },
  {
    regex: /Submit\s+with\s+(\$\{[^}]+\}|Ctrl\s*\+\s*)Enter/gi,
    zh: '使用 $1Enter 提交'
  },
  {
    regex: /When\s+enabled,\s+(\$\{[^}]+\}|Ctrl\s*\+\s*)Enter\s+submits\s+chat\s+and\s+Enter\s+inserts\s+a\s+newline/gi,
    zh: '启用后，$1Enter 提交聊天，Enter 插入换行'
  },
  {
    regex: /Apply\s+(.{0,10}?)\.cursorignore(.{0,10}?)\s+files\s+to\s+all\s+subdirectories(?:\$\{[^}]*\}[^C]*)?\.\s*Changing\s+this\s+setting\s+will\s+require\s+a\s+restart\s+of\s+Cursor\./gi,
    zh: '将 $1.cursorignore$2 文件应用于所有子目录。更改此设置需重启 Cursor。'
  },
  {
    regex: /Automatically\s+import\s+necessary\s+modules\s+for\s+(\$\{[^}]+\}|TypeScript|C\+\+)/gi,
    zh: '自动为 $1 导入必要的模块'
  },
  {
    regex: /Accept\s+the\s+next\s+word\s+of\s+a\s+suggestion\s+via\s+(\$\{[^}]+\}|Ctrl\+RightArrow)/gi,
    zh: '使用 $1 接受建议的下一个词'
  },
  {
    regex: /Embed\s+codebase\s+for\s+improved\s+contextual\s+understanding\s+and\s+knowledge\.\s*Embeddings\s+and\s+metadata\s+are\s+stored\s+in\s+the\s+([^,]{1,50}?),\s*but\s+all\s+code\s+is\s+stored\s+locally\./gi,
    zh: '嵌入代码库以提升上下文理解和知识运用。嵌入向量和元数据存储在$1中，但所有代码均存储在本地。'
  },
  {
    regex: /Files\s+to\s+exclude\s+from\s+indexing\s+in\s+addition\s+to\s+([\s\S]{0,10}?)\.gitignore([\s\S]{0,10}?)\./gi,
    zh: '除 $1.gitignore$2 外要从索引中排除的额外文件。'
  },
  {
    regex: /Add\s+documentation\s+to\s+use\s+as\s+context\.\s*You\s+can\s+also\s+use\s+([\s\S]{0,20}?)@Add([\s\S]{0,20}?)\s+in\s+Chat\s+or\s+while\s+editing\s+to\s+add\s+a\s+doc\./gi,
    zh: '添加文档以用作上下文。您也可以在聊天或编辑框中使用 $1@Add$2 来添加文档。'
  },
  {
    regex: /You(?:'|\\'|\\u2019|’|')re\s+over\s+your\s+current\s+usage\s+limit\s+and\s+your\s+requests\s+are\s+being\s+processed\s+with\s+(.{1,20}?)\s+in\s+the\s+slow\s+queue\./gi,
    zh: '您已超出当前使用额度，您的请求正在慢速队列中由 $1 处理。'
  },
  {
    regex: /Automatically\s+parse\s+links\s+when\s+pasted\s+into\s+Quick\s+Edit\s+\((\$\{[^}]+\}|Ctrl\+)K\)\s+input/gi,
    zh: '粘贴到快速编辑 ($1K) 输入框时自动解析链接'
  },
  {
    regex: /Automatically\s+jump\s+to\s+the\s+next\s+diff\s+when\s+accepting\s+changes\s+with\s+(\$\{[^}]+\}|Ctrl\+)Y/gi,
    zh: '使用 $1Y 接受更改时自动跳转到下一个差异'
  },
  {
    regex: /Show\s+a\s+hint\s+for\s+(\$\{[^}]+\}|Ctrl\+)K\s+in\s+the\s+Terminal/gi,
    zh: '在终端中显示 $1K 提示'
  },
  {
    regex: /Preview\s+Box\s+for\s+Terminal\s+(\$\{[^}]+\}|Ctrl\+)K/gi,
    zh: '终端 $1K 的预览框'
  },
  {
    regex: /\[\s*"Automatically\s+index\s+any\s+new\s+folders\s+with\s+fewer\s+than"\s*,\s*" "\s*,\s*(.+?)\s*,\s*" "\s*,\s*"files"\s*\]/gi,
    zh: '["自动索引文件数量少于", " ", $1, " ", "个的新文件夹"]'
  },
  {
    regex: /"Automatically\s+index\s+repositories\s+to\s+speed\s+up\s+Grep\s+searches\.\s+All\s+data\s+is\s+stored\s+locally\."/gi,
    zh: '"自动索引代码库以加速 Grep 搜索。所有数据均存储在本地。"'
  },
  {
    regex: /Your\s+installation\s+appears\s+to\s+be\s+corrupt\.\s*Please\s+reinstall\./gi,
    zh: '安装似乎已损坏，请重新安装。'
  },
  {
    regex: /Awaiting approval to edit (\$\{[^}]+\})/g,
    zh: '等待批准编辑 $1'
  },
  {
    regex: /Agent Review complete - Found (\d+) potential issue/g,
    zh: '智能体审查完成 - 发现 $1 个潜在问题'
  },
  {
    regex: /`Stop \$\{a\(\)\}`/g,
    zh: '`停止 ${a()}`'
  },
  {
    regex: /"Send \\u23CE"/g,
    zh: '"发送 \\u23CE"'
  },
  {
    regex: /Switching models can degrade quality and is currently limited in this conversation\. Would you like to start a new chat\?/g,
    zh: '切换模型可能降低质量，且在当前对话中受限。是否开始新聊天？'
  },
  {
    regex: /Composer and Chat have been unified into a single Cursor Chat that can answer questions, edit code, and use tools\./g,
    zh: 'Composer 和 Chat 已统一为单个 Cursor 聊天，可回答问题、编辑代码并使用工具。'
  },
  {
    regex: /This file is already being edited in another thread\. Accept to apply those changes first, or reject to discard them\./g,
    zh: '此文件已在另一线程中编辑。接受以先应用那些更改，或拒绝以丢弃它们。'
  },
  {
    regex: /Worktree chats require a single-root workspace\. Remove additional workspace folders or open a single-folder workspace\./g,
    zh: '工作树聊天需要单根工作区。请移除额外工作区文件夹或打开单文件夹工作区。'
  }
];

function backupFile(filePath) {
  const backupPath = `${filePath}.cursorzh.bak`;
  if (fs.existsSync(backupPath)) {
    fs.copyFileSync(backupPath, filePath);
    return { restored: true, path: backupPath };
  }
  if (fs.existsSync(filePath)) {
    fs.copyFileSync(filePath, backupPath);
    return { restored: false, path: backupPath };
  }
  return null;
}

function restoreFromBackup(filePath) {
  const backupPath = `${filePath}.cursorzh.bak`;
  if (fs.existsSync(backupPath)) {
    fs.copyFileSync(backupPath, filePath);
    return true;
  }
  return false;
}

function detectHashAlgo(hash) {
  const len = hash.length;
  if (len <= 24) return 'md5';
  if (len <= 44) return 'sha256';
  if (len <= 88) return 'sha512';
  return 'sha256';
}

function fixProductHash(mainJsPath, productJsonPath) {
  const updatedContent = fs.readFileSync(mainJsPath);
  const productJson = JSON.parse(fs.readFileSync(productJsonPath, 'utf8'));
  let hashUpdated = false;

  if (productJson.checksums) {
    for (const key of Object.keys(productJson.checksums)) {
      if (key.endsWith('workbench.desktop.main.js')) {
        const algo = detectHashAlgo(productJson.checksums[key]);
        productJson.checksums[key] = crypto
          .createHash(algo)
          .update(updatedContent)
          .digest('base64')
          .replace(/=+$/, '');
        hashUpdated = true;
        break;
      }
    }
  }

  if (hashUpdated) {
    fs.writeFileSync(productJsonPath, `${JSON.stringify(productJson, null, '\t')}\n`, 'utf8');
  }
  return hashUpdated;
}

function patchWorkbench(mainJsPath) {
  let jsContent = fs.readFileSync(mainJsPath, 'utf8');
  let safeCount = 0;
  let riskyCount = 0;
  let trickyCount = 0;
  let exactCount = 0;
  const exactMisses = [];

  for (const [from, to] of exactSnippets) {
    if (jsContent.includes(from)) {
      jsContent = jsContent.split(from).join(to);
      exactCount++;
    } else {
      exactMisses.push(from.slice(0, 80));
    }
  }

  if (safeMegaRegex) {
    jsContent = jsContent.replace(safeMegaRegex, (match, quote, en) => {
      safeCount++;
      return `${quote}${safeGlobalDict[en]}${quote}`;
    });
  }

  if (longMegaRegex) {
    jsContent = jsContent.replace(longMegaRegex, (match, en) => {
      safeCount++;
      return safeGlobalDict[en];
    });
  }

  for (const { regex, zh } of trickyReplacements) {
    const before = jsContent;
    jsContent = jsContent.replace(regex, zh);
    if (before !== jsContent) trickyCount++;
  }

  for (const { zh, propRegex, jsxRegex, htmlRegex } of riskyRegexes) {
    jsContent = jsContent.replace(propRegex, `$1: $2${zh}$2`);
    jsContent = jsContent.replace(jsxRegex, `$1, $2${zh}$2`);
    jsContent = jsContent.replace(htmlRegex, `>${zh}<`);
    riskyCount++;
  }

  fs.writeFileSync(mainJsPath, jsContent, 'utf8');
  return { safeCount, riskyCount, trickyCount, exactCount, exactMisses, exactTotal: exactSnippets.length };
}

function translate(paths) {
  const { mainJsPath, productJsonPath } = paths;
  const files = [mainJsPath, productJsonPath];
  const backups = [];

  for (const filePath of files) {
    const result = backupFile(filePath);
    if (result) backups.push(result);
  }

  const stats = patchWorkbench(mainJsPath);
  const hashFixed = fixProductHash(mainJsPath, productJsonPath);

  return { stats, hashFixed, backups };
}

function restore(paths) {
  const targets = [paths.mainJsPath, paths.productJsonPath, paths.nlsMessagesPath].filter(Boolean);
  let restored = 0;
  for (const filePath of targets) {
    if (restoreFromBackup(filePath)) restored++;
  }
  return restored;
}

module.exports = {
  translate,
  restore,
  backupFile,
  restoreFromBackup,
  fixProductHash,
  patchWorkbench
};
