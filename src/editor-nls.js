/**
 * Editor 界面汉化：nls.messages.json + locale 配置 + 语言包安装
 */
const fs = require('fs');
const path = require('path');
const https = require('https');
const zlib = require('zlib');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.join(__dirname, '..');
const LANGPACK_DIR = path.join(PROJECT_ROOT, 'data', 'langpack');
const LANGPACK_VSIX = path.join(LANGPACK_DIR, 'zh-hans.vsix');
const LANGPACK_EXTRACTED = path.join(LANGPACK_DIR, 'extracted');
const LANGPACK_I18N = path.join(LANGPACK_EXTRACTED, 'extension', 'translations', 'main.i18n.json');
const LANGPACK_URL =
  'https://marketplace.visualstudio.com/_apis/public/gallery/publishers/MS-CEINTL/vsextensions/vscode-language-pack-zh-hans/1.105.2025101509/vspackage';

function downloadLanguagePack() {
  if (fs.existsSync(LANGPACK_I18N)) return Promise.resolve(LANGPACK_I18N);

  fs.mkdirSync(LANGPACK_DIR, { recursive: true });

  return new Promise((resolve, reject) => {
    console.log('正在下载 VS Code 中文语言包...');
    const file = fs.createWriteStream(LANGPACK_VSIX);
    https
      .get(LANGPACK_URL, { headers: { Accept: 'application/octet-stream' } }, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          https.get(res.headers.location, (res2) => res2.pipe(file));
          return;
        }
        res.pipe(file);
      })
      .on('error', reject);

    file.on('finish', () => {
      file.close(() => {
        try {
          extractVsix(LANGPACK_VSIX, LANGPACK_EXTRACTED);
          resolve(LANGPACK_I18N);
        } catch (err) {
          reject(err);
        }
      });
    });
  });
}

function extractVsix(vsixPath, outDir) {
  const data = fs.readFileSync(vsixPath);
  const zipData = data[0] === 0x1f && data[1] === 0x8b ? zlib.gunzipSync(data) : data;
  fs.mkdirSync(outDir, { recursive: true });

  let offset = 0;
  while (offset < zipData.length - 30) {
    const sig = zipData.readUInt32LE(offset);
    if (sig !== 0x04034b50) break;
    const compMethod = zipData.readUInt16LE(offset + 8);
    const compSize = zipData.readUInt32LE(offset + 18);
    const nameLen = zipData.readUInt16LE(offset + 26);
    const extraLen = zipData.readUInt16LE(offset + 28);
    const name = zipData.slice(offset + 30, offset + 30 + nameLen).toString('utf8');
    const dataStart = offset + 30 + nameLen + extraLen;
    const compData = zipData.slice(dataStart, dataStart + compSize);
    const outPath = path.join(outDir, name);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    const raw = compMethod === 8 ? zlib.inflateRawSync(compData) : compData;
    fs.writeFileSync(outPath, raw);
    offset = dataStart + compSize;
  }
}

function buildZhMessages(appPath) {
  const keysPath = path.join(appPath, 'out', 'nls.keys.json');
  const messagesPath = path.join(appPath, 'out', 'nls.messages.json');
  const keys = JSON.parse(fs.readFileSync(keysPath, 'utf8'));
  const messages = JSON.parse(fs.readFileSync(messagesPath, 'utf8'));
  const i18n = JSON.parse(fs.readFileSync(LANGPACK_I18N, 'utf8'));

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

  return { zhMessages, translated, total: messages.length };
}

function backupFile(filePath) {
  const backupPath = `${filePath}.cursorzh.bak`;
  if (!fs.existsSync(backupPath) && fs.existsSync(filePath)) {
    fs.copyFileSync(filePath, backupPath);
  }
}

function patchEditorNls(paths) {
  return downloadLanguagePack().then(() => {
    const { zhMessages, translated, total } = buildZhMessages(paths.appPath);
    backupFile(paths.nlsMessagesPath);
    fs.writeFileSync(paths.nlsMessagesPath, JSON.stringify(zhMessages), 'utf8');
    return { translated, total };
  });
}

function configureLocale(userDataPath) {
  const userDir = path.join(userDataPath, 'User');
  fs.mkdirSync(userDir, { recursive: true });

  const localePath = path.join(userDir, 'locale.json');
  const locale = { locale: 'zh-cn' };
  fs.writeFileSync(localePath, `${JSON.stringify(locale, null, 2)}\n`, 'utf8');

  const argvPath = path.join(userDataPath, 'argv.json');
  if (fs.existsSync(argvPath)) {
    try {
      const argv = JSON.parse(fs.readFileSync(argvPath, 'utf8'));
      argv.locale = 'zh-cn';
      fs.writeFileSync(argvPath, `${JSON.stringify(argv, null, 2)}\n`, 'utf8');
    } catch {
      // ignore malformed argv.json
    }
  }

  return localePath;
}

function installLanguagePackExtension(cursorExePath) {
  if (!cursorExePath || !fs.existsSync(cursorExePath)) {
    return { installed: false, reason: '未找到 Cursor.exe' };
  }

  try {
    execSync(`"${cursorExePath}" --install-extension MS-CEINTL.vscode-language-pack-zh-hans --force`, {
      stdio: 'pipe',
      timeout: 120000
    });
    return { installed: true };
  } catch (err) {
    return { installed: false, reason: err.message };
  }
}

module.exports = {
  patchEditorNls,
  configureLocale,
  installLanguagePackExtension,
  downloadLanguagePack
};
