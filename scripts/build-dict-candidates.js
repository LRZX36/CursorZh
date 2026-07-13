#!/usr/bin/env node
/**
 * 从 extracted-strings 筛选 Agent/UI 文案候选
 */
const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const extractedPath = path.join(projectRoot, 'data', 'extracted-strings-3.5.38.json');
const dictPath = path.join(projectRoot, 'src', 'dict.js');
const outPath = path.join(projectRoot, 'data', 'dict-candidates.json');

const UI_PREFIXES = [
  'Awaiting ',
  'Agent ',
  'Running ',
  'Reading ',
  'Searching ',
  'Generating ',
  'Waiting ',
  'Stopped ',
  'Completed ',
  'Cancelled ',
  'Failed to ',
  'Allow Agent',
  'Prevent Agent',
  'Start Agent',
  'Stop Agent',
  'Abort ',
  'Accept ',
  'Reject ',
  'Approve ',
  'Deny ',
  'Plan ',
  'Ask ',
  'Debug ',
  'Cloud ',
  'Background ',
  'New Agent',
  'Open Agent',
  'Create Agent',
  'Send ',
  'Queue ',
  'Usage ',
  'Model ',
  'Subagent',
  'MCP ',
  'Tool ',
  'Browser ',
  'Terminal ',
  'Checkpoint',
  'Review ',
  'Hook '
];

const EXCLUDE_PATTERNS = [
  /Request$/,
  /Response$/,
  /Service$/,
  /Controller$/,
  /Provider$/,
  /Handler$/,
  /Registry$/,
  /Serializer$/,
  /Extension$/,
  /out-build/,
  /https?:\/\//,
  /\$\{/,
  /^[a-z][a-zA-Z0-9]*$/,
  /^[A-Z_]+$/,
  /Failed to (acquire|add events|apply code action|apply notebook|assert|add non-enumerable)/,
  /Abstract/,
  /Exception/,
  /\.js$/,
  /\.ts$/,
  /vscode\./
];

const PROGRAMMING_WORDS = new Set([
  'Default', 'Custom', 'Auto', 'Always', 'Never', 'Quick', 'Deep', 'Context',
  'Cancel', 'Confirm', 'Hide', 'Edit', 'Open', 'Close', 'Save', 'Delete',
  'Search', 'Replace', 'Import', 'Export', 'Enable', 'Disable', 'Apply',
  'Settings', 'General', 'Models', 'Agents', 'Plugins', 'Hooks', 'Network',
  'Browser', 'Terminal', 'Editor', 'Account', 'Billing', 'Team', 'Privacy'
]);

function loadExistingKeys() {
  delete require.cache[require.resolve(dictPath)];
  const dict = require(dictPath);
  return new Set([...Object.keys(dict.safeGlobalDict), ...Object.keys(dict.riskyShortWords)]);
}

function isUiLike(str) {
  if (str.length < 8 || str.length > 120) return false;
  if (!/^[A-Za-z]/.test(str)) return false;
  if (str.includes('\\\\')) return false;
  if (EXCLUDE_PATTERNS.some((re) => re.test(str))) return false;
  if (str.includes(' ')) return true;
  return UI_PREFIXES.some((p) => str.startsWith(p));
}

function classify(str) {
  if (str.includes(' ')) return 'safe';
  if (str.length >= 4 && !PROGRAMMING_WORDS.has(str)) return 'risky';
  return null;
}

function suggestZh(en) {
  const map = {
    'Ask Mode': '问答模式',
    'Plan Mode': '计划模式',
    'Debug Mode': '调试模式',
    'Agent Mode': '智能体模式',
    'Agent complete': '智能体完成',
    'Agent blocked': '智能体已阻止',
    'Agent Settings': '智能体设置',
    'Agent Review': '智能体审查',
    'Agent Review Disabled': '智能体审查已禁用',
    'Agent Review Settings': '智能体审查设置',
    'Agent Review cancelled': '智能体审查已取消',
    'Agent Review: potential bug detected': '智能体审查：检测到潜在问题',
    'Agent Tabs': '智能体标签页',
    'Agent Terminal': '智能体终端',
    'Agent Layout': '智能体布局',
    'Agent history': '智能体历史',
    'Agent conversations': '智能体对话',
    'Agent disconnected': '智能体已断开',
    'Agent encountered an error': '智能体遇到错误',
    'Agent features require login.': '智能体功能需要登录。',
    'Agent features require authentication. Please sign in.': '智能体功能需要身份验证，请登录。',
    'Agent is blocked': '智能体已被阻止',
    'Agent is waiting for a command to finish.': '智能体正在等待命令完成。',
    'Agent is waiting for commands to finish.': '智能体正在等待命令完成。',
    'Agent is using this terminal. It': '智能体正在使用此终端。',
    'Agent terminals are read-only': '智能体终端为只读',
    'Agent instructions; Type @ for tools, / for commands...': '智能体指令；输入 @ 调用工具，/ 调用命令...',
    'Awaiting MCP tool approval': '等待 MCP 工具批准',
    'Awaiting terminal approval': '等待终端批准',
    'Awaiting Review': '等待审查',
    'Awaiting plan review': '等待计划审查',
    'Awaiting review from': '等待审查来自',
    'Abort Agent and Restore Query': '中止智能体并恢复查询',
    'Abort Chat': '中止聊天',
    'Aborted current chat': '已中止当前聊天',
    'Aborting current chat': '正在中止当前聊天',
    'Running in cloud': '在云端运行',
    'Running command': '正在运行命令',
    'Reading file': '正在读取文件',
    'Searching codebase': '正在搜索代码库',
    'Searching web': '正在搜索网络',
    'Generating': '正在生成',
    'Waiting for approval': '等待批准',
    'Waiting for user': '等待用户',
    'In progress': '进行中',
    'Allow once': '允许一次',
    'Allow always': '始终允许',
    'Run in background': '在后台运行',
    'Open in editor': '在编辑器中打开',
    'Open in terminal': '在终端中打开',
    'Open in browser': '在浏览器中打开',
    'Show diff': '显示差异',
    'Accept file': '接受文件',
    'Reject file': '拒绝文件',
    'Keep file': '保留文件',
    'Undo file': '撤销文件',
    'Apply patch': '应用补丁',
    'Revert patch': '还原补丁',
    'Create checkpoint': '创建检查点',
    'Delete checkpoint': '删除检查点',
    'Restore from checkpoint': '从检查点恢复',
    'Files changed': '文件已更改',
    'Lines added': '新增行',
    'Lines removed': '删除行',
    'No changes': '无更改',
    'View all changes': '查看所有更改',
    'Collapse all': '全部折叠',
    'Expand all': '全部展开',
    'Filter changes': '筛选更改',
    'All changes from this Agent chat': '此智能体聊天的所有更改',
    'Allow Agent to switch modes without asking first, such as Agent to Plan or Agent to Debug. When off, Cursor asks before switching.':
      '允许智能体无需询问即切换模式，例如从智能体切换到计划或调试。关闭时，Cursor 会在切换前询问。',
    'Skip approval dialog; Agent may run web searches automatically': '跳过批准对话框；智能体可自动运行网络搜索',
    'Mark Agent commits as \'Made with Cursor\'': '将智能体提交标记为“Made with Cursor”',
    'Adjust the default behavior of sending a message while Agent is running': '调整智能体运行时发送消息的默认行为',
    'Adjust the default behavior of sending a message while Agent is streaming': '调整智能体流式响应时发送消息的默认行为',
    'Contextual suggestions while prompting Agent': '向智能体提问时提供上下文建议',
    'After periods of inactivity, open the Agent Pane to a new conversation': '一段时间不活动后，将智能体面板打开为新对话',
    'Show system notifications when Agent completes or needs attention': '智能体完成或需要注意时显示系统通知',
    'Play a sound when Agent finishes responding': '智能体完成响应时播放提示音',
    'Automatically format files when the agent finishes': '智能体完成时自动格式化文件',
    'Automatically review your changes for issues after each commit': '每次提交后自动审查更改是否存在问题',
    'Include changes from Git submodules in the review': '在审查中包含 Git 子模块的更改',
    'Include untracked files (new files not yet added to Git) in the review': '在审查中包含未跟踪文件（尚未添加到 Git 的新文件）',
    'Choose between quick or more thorough, higher-cost analysis': '在快速与更彻底、更高成本的分析之间选择',
    'A hook in your project configuration (.cursor/hooks.json) has blocked this operation.':
      '项目配置 (.cursor/hooks.json) 中的钩子已阻止此操作。',
    'A hook in your user configuration (~/.cursor/hooks.json) has blocked this operation.':
      '用户配置 (~/.cursor/hooks.json) 中的钩子已阻止此操作。',
    'A team hook has blocked this operation.': '团队钩子已阻止此操作。',
    'A configured hook has blocked this operation.': '已配置的钩子已阻止此操作。',
    'A beforeSubmitPrompt hook blocked this submission.': 'beforeSubmitPrompt 钩子已阻止此次提交。',
    'No hooks configured': '未配置钩子',
    'No hook executions yet': '暂无钩子执行记录',
    'Configured Hooks': '已配置的钩子',
    'Execution Log': '执行日志',
    'Clear log': '清空日志',
    'New MCP Server': '新建 MCP 服务器',
    'Add a Custom MCP Server': '添加自定义 MCP 服务器',
    'Installed MCP Servers': '已安装的 MCP 服务器',
    'Browser Automation': '浏览器自动化',
    'Browser automation disabled': '浏览器自动化已禁用',
    'Show Localhost Links in Browser': '在浏览器中显示 Localhost 链接',
    'Automatically open localhost links in the Browser Tab': '自动在浏览器标签页中打开 localhost 链接',
    'Legacy Terminal Tool': '旧版终端工具',
    'Use the legacy terminal tool in agent mode, for use on systems with unsupported shell configurations':
      '在智能体模式下使用旧版终端工具，适用于 shell 配置不受支持的系统',
    'Cloud Agents require a Git repository in an open folder.': '云智能体需要打开的文件夹中包含 Git 仓库。',
    'Background agents only work in folders with a git repository.': '后台智能体仅在包含 git 仓库的文件夹中工作。',
    'Open a Git repository': '打开 Git 仓库',
    'Get Started': '开始使用',
    'Multiple models require a Git repository.': '多模型功能需要 Git 仓库。',
    'Balanced quality and speed, recommended for most tasks': '平衡质量与速度，推荐用于大多数任务',
    'Increase limits for faster responses': '提高限制以获得更快响应',
    'Set new limit': '设置新限制',
    'API key rate limit exceeded.': 'API 密钥速率限制已超出。',
    'A newer version of Cursor is available. We recommend updating for the best experience.':
      '有更新版本的 Cursor 可用，建议更新以获得最佳体验。',
    'Your installation appears to be corrupt. Please reinstall.': '安装似乎已损坏，请重新安装。',
    'How was this response?': '这条回复怎么样？',
    'Copy ID': '复制 ID',
    'Copied!': '已复制！',
    'Type to search...': '输入以搜索...',
    'Search models': '搜索模型',
    'No results found': '未找到结果',
    'Loading...': '加载中...',
    'Try Again': '重试',
    'Stop Generation': '停止生成',
    'Stop response': '停止响应',
    'Regenerate': '重新生成',
    'Clear Chat': '清空聊天',
    'New Chat': '新建聊天',
    'Rename Chat': '重命名聊天',
    'Delete Chat': '删除聊天',
    'Export Chat': '导出聊天',
    'Import Chat': '导入聊天',
    'Copy Chat': '复制聊天',
    'Search in Chat': '在聊天中搜索',
    'Add to Chat': '添加到聊天',
    'Add to Composer': '添加到 Composer',
    'Quick Edit': '快速编辑',
    'Build with Agent': '使用智能体构建',
    'Chat with Agent': '与智能体聊天',
    'Continue in Agent': '在智能体中继续',
    'Edit in Agent': '在智能体中编辑',
    'Fix in Agent': '在智能体中修复',
    'Generate with Agent': '使用智能体生成',
    'Run Agent': '运行智能体',
    'Stop Agent': '停止智能体',
    'Create Agent': '创建智能体',
    'New Agent': '新建智能体',
    'Open Agent': '打开智能体',
    'Switch to Agent': '切换到智能体',
    'Switch to Ask': '切换到问答',
    'Switch to Plan': '切换到计划',
    'Accept Mode Switch': '接受模式切换',
    'Thinking': '思考中',
    'Reasoning': '推理',
    'Max Mode': 'Max 模式',
    'Select Model': '选择模型',
    'Choose a model': '选择模型',
    'No models available': '无可用模型',
    'Review Changes': '审查更改',
    'View Changes': '查看更改',
    'Discard Changes': '放弃更改',
    'Accept Changes': '接受更改',
    'Reject Changes': '拒绝更改',
    'Accept all changes': '接受所有更改',
    'Reject all changes': '拒绝所有更改',
    'Restore Checkpoint': '恢复检查点',
    'Attach files': '附加文件',
    'Attach image': '附加图片',
    'Add context': '添加上下文',
    'Remove context': '移除上下文',
    'Clear context': '清空上下文',
    'Include codebase': '包含代码库',
    'Include docs': '包含文档',
    'Include web': '包含网络',
    'Use codebase': '使用代码库',
    'Use web search': '使用网络搜索',
    'Run terminal command': '运行终端命令',
    'Read file': '读取文件',
    'Search web': '搜索网络',
    'Pending': '等待中',
    'Approved': '已批准',
    'Rejected': '已拒绝',
    'Approve': '批准',
    'Deny': '拒绝',
    'Completed': '已完成',
    'Failed': '失败',
    'Cancelled': '已取消'
  };
  return map[en] || null;
}

function main() {
  const data = JSON.parse(fs.readFileSync(extractedPath, 'utf8'));
  const existing = loadExistingKeys();

  const safe = [];
  const risky = [];
  const skipped = [];

  for (const str of data.strings) {
    if (existing.has(str)) continue;
    if (!isUiLike(str)) continue;

    const bucket = classify(str);
    if (!bucket) {
      skipped.push(str);
      continue;
    }

    const entry = { en: str, zh: suggestZh(str) };
    if (bucket === 'safe') safe.push(entry);
    else risky.push(entry);
  }

  safe.sort((a, b) => b.en.length - a.en.length);
  risky.sort((a, b) => a.en.localeCompare(b.en));

  const output = {
    generatedAt: new Date().toISOString(),
    totalExtracted: data.strings.length,
    safeCount: safe.length,
    riskyCount: risky.length,
    withSuggestion: [...safe, ...risky].filter((e) => e.zh).length,
    safe,
    risky,
    skippedSample: skipped.slice(0, 50)
  };

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf8');

  console.log(`safe: ${safe.length}, risky: ${risky.length}, with zh suggestion: ${output.withSuggestion}`);
  console.log(`written: ${outPath}`);
}

main();
