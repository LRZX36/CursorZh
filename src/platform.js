/**
 * 跨平台 Cursor 安装路径探测
 */
const fs = require('fs');
const path = require('path');
const os = require('os');

const PLATFORM = os.platform();

function detectCursorPath(customAppPath) {
  if (customAppPath) {
    const appPath = path.resolve(customAppPath);
    if (!fs.existsSync(appPath)) {
      throw new Error(`指定的 Cursor 路径不存在: ${appPath}`);
    }
    return buildPaths(appPath);
  }

  const candidates = [];

  if (PLATFORM === 'win32') {
    const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
    const programFiles = process.env.ProgramFiles || 'C:\\Program Files';
    const programFilesX86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';
    candidates.push(
      path.join(localAppData, 'Programs', 'cursor', 'resources', 'app'),
      path.join(programFiles, 'Cursor', 'resources', 'app'),
      path.join(programFiles, 'cursor', 'resources', 'app'),
      path.join(programFilesX86, 'Cursor', 'resources', 'app'),
      'D:\\cursor\\resources\\app',
      'C:\\cursor\\resources\\app'
    );
  } else if (PLATFORM === 'darwin') {
    candidates.push(
      '/Applications/Cursor.app/Contents/Resources/app',
      path.join(os.homedir(), 'Applications', 'Cursor.app/Contents/Resources/app')
    );
  } else {
    candidates.push(
      '/opt/Cursor/resources/app',
      path.join(os.homedir(), '.local/share/cursor/resources/app')
    );
  }

  const appPath = candidates.find((p) => fs.existsSync(p));
  if (!appPath) {
    return null;
  }
  return buildPaths(appPath);
}

function buildPaths(appPath) {
  return {
    appPath,
    mainJsPath: path.join(appPath, 'out', 'vs', 'workbench', 'workbench.desktop.main.js'),
    htmlPath: path.join(appPath, 'out', 'vs', 'code', 'electron-sandbox', 'workbench', 'workbench.html'),
    productJsonPath: path.join(appPath, 'product.json'),
    nlsMessagesPath: path.join(appPath, 'out', 'nls.messages.json'),
    nlsKeysPath: path.join(appPath, 'out', 'nls.keys.json'),
    cursorExePath: findCursorExe(appPath),
    userDataPath: getUserDataPath()
  };
}

function findCursorExe(appPath) {
  const root = path.resolve(appPath, '..', '..');
  const names = PLATFORM === 'win32' ? ['Cursor.exe'] : PLATFORM === 'darwin' ? ['Cursor'] : ['cursor', 'Cursor'];
  for (const name of names) {
    const exe = path.join(root, name);
    if (fs.existsSync(exe)) return exe;
  }
  return null;
}

function getUserDataPath() {
  if (PLATFORM === 'win32') {
    return path.join(process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'), 'Cursor');
  }
  if (PLATFORM === 'darwin') {
    return path.join(os.homedir(), 'Library', 'Application Support', 'Cursor');
  }
  return path.join(os.homedir(), '.config', 'Cursor');
}

function hasWritePermission(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

function readCursorVersion(appPath) {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(appPath, 'package.json'), 'utf8'));
    return pkg.version || 'unknown';
  } catch {
    return 'unknown';
  }
}

module.exports = {
  PLATFORM,
  detectCursorPath,
  hasWritePermission,
  readCursorVersion,
  getUserDataPath
};
