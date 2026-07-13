/**
 * 设置页大批量词条（外观/隐私/用量/智能体/Tab/模型密钥/工作树/插件/MCP/钩子等）
 * 保留品牌名、模型供应商与模型名称
 */
const settingsSafeAddon = {
  'Choose between light, dark, or high contrast themes':
    '在浅色、深色或高对比度主题之间选择',
  'Tool Call Density': '工具调用密度',
  'Adjust how much detail is shown for tool calls': '调整工具调用显示的详细程度',
  'Choose a tint color': '选择着色颜色',
  'Control how strongly the tint is applied': '控制着色应用强度',
  'Reduce Transparency': '降低透明度',
  'Replace translucent surfaces with opaque backgrounds':
    '将半透明表面替换为不透明背景',
  'UI Font Size': '界面字体大小',
  'Font size for the Cursor user interface': 'Cursor 用户界面的字体大小',
  'Code Font Size': '代码字体大小',
  'Font size for code editors and diffs': '代码编辑器和差异视图的字体大小',
  'UI Font Family': '界面字体',
  'Override the Cursor user interface typeface': '覆盖 Cursor 用户界面字体',
  'Code Font Family': '代码字体',
  'Override the font for code editors and diffs': '覆盖代码编辑器和差异视图的字体',
  'System font': '系统字体',
  'System monospace': '系统等宽字体',
  'Reduce Motion': '减少动效',
  'Minimize interface animations. System follows your OS preference.':
    '尽量减少界面动画。跟随系统将使用操作系统偏好。',
  'Hide Email Address': '隐藏邮箱地址',
  'Partially mask your email address in the Cursor user interface':
    '在 Cursor 用户界面中部分遮盖您的邮箱地址',
  'Data Sharing Enabled': '已启用数据共享',
  'Your prompts, edits and other usage data will be stored and trained on by Cursor to improve the product.':
    '您的提示、编辑及其他使用数据将由 Cursor 存储并用于训练以改进产品。',
  'Share Data': '共享数据',
  'On-Demand Usage': '按需用量',
  "Enable on-demand usage to go beyond your plan's included usage. Requires a paid plan.":
    '启用按需用量以超出套餐包含额度。需要付费方案。',
  'Upgrade to Pro now': '立即升级到 Pro',
  'Show rotating tips on the empty screen': '在空白界面轮换显示提示',
  'Auto-Approve Mode Transitions': '自动批准模式切换',
  'Open Agents Window on startup': '启动时打开智能体窗口',
  'When launching Cursor, open Agents Window by default':
    '启动 Cursor 时默认打开智能体窗口',
  'Explore subagent model': 'Explore 子智能体模型',
  'The Explore subagent is used to do initial research for the main agent':
    'Explore 子智能体用于为主智能体做初步调研',
  'Enabled by Run Everything Auto-Run Mode: Agent bypasses approval prompts for tools including Web Search.':
    '已由「全部运行」自动运行模式启用：智能体将跳过包括网络搜索在内的工具审批提示。',
  'Branch Prefix': '分支前缀',
  'Prefix for new branches created by Agent (e.g., cursor/, username/)':
    '智能体新建分支的前缀（例如 cursor/、username/）',
  'Ignored Files': '忽略的文件',
  'Glob patterns for files where Cursor Tab will not suggest':
    'Cursor Tab 不会提供建议的文件 Glob 模式',
  'e.g., *.md, **/generated/**': '例如：*.md, **/generated/**',
  'View All Models': '查看全部模型',
  'Enter your OpenAI API Key': '输入您的 OpenAI API 密钥',
  'Override OpenAI Base URL': '覆盖 OpenAI Base URL',
  'Change the base URL for OpenAI API requests.': '更改 OpenAI API 请求的 Base URL。',
  'Anthropic API Key': 'Anthropic API 密钥',
  'Enter your Anthropic API Key': '输入您的 Anthropic API 密钥',
  'Google API Key': 'Google API 密钥',
  'Enter your Google AI Studio API Key': '输入您的 Google AI Studio API 密钥',
  'Configure Azure OpenAI to use OpenAI models through your Azure account.':
    '通过您的 Azure 帐户配置 Azure OpenAI 以使用 OpenAI 模型。',
  'Deployment Name': '部署名称',
  'Enter your Azure OpenAI API Key': '输入您的 Azure OpenAI API 密钥',
  'Configure AWS Bedrock to use Anthropic Claude models through your AWS account.':
    '通过您的 AWS 帐户配置 AWS Bedrock 以使用 Anthropic Claude 模型。',
  'Cursor Enterprise teams can configure IAM roles to access Bedrock without any Access Keys.':
    'Cursor Enterprise 团队可配置 IAM 角色以访问 Bedrock，无需任何 Access Key。',
  'Access Key ID': '访问密钥 ID',
  'Secret Access Key': '秘密访问密钥',
  'AWS Access Key ID': 'AWS 访问密钥 ID',
  'AWS Secret Access Key': 'AWS 秘密访问密钥',
  'Test Model': '测试模型',
  'Cursor periodically removes old worktrees to free disk space. Tune how aggressively cleanup runs.':
    'Cursor 会定期清理旧工作树以释放磁盘空间。可调整清理力度。',
  'Max worktrees': '最大工作树数量',
  'Maximum number of Cursor-managed worktrees to retain across all workspaces. Older worktrees are removed first.':
    '跨所有工作区保留的 Cursor 管理的工作树最大数量。较旧的工作树会先被移除。',
  'Max total size (GB)': '最大总大小 (GB)',
  'Maximum total size in GB across all Cursor-managed worktrees. Set to 0 to disable the size limit.':
    '所有 Cursor 管理的工作树的最大总大小（GB）。设为 0 可禁用大小限制。',
  'Cursor-managed worktrees': 'Cursor 管理的工作树',
  'No Cursor-managed worktrees on this machine.': '本机没有 Cursor 管理的工作树。',
  'Search or Paste Link': '搜索或粘贴链接',
  'No Plugins': '暂无插件',
  'Browse the marketplace or import custom plugins to extend':
    '浏览市场或导入自定义插件以扩展',
  'Cursor with Skills, Rules, Agents, Hooks, and MCPs.':
    'Cursor（技能、规则、智能体、钩子和 MCP）。',
  'Add Plugin': '添加插件',
  'No Rules Yet': '暂无规则',
  'Create rules to guide Agent behavior': '创建规则以引导智能体行为',
  'New User Rule': '新建用户规则',
  'Browser Automation': '浏览器自动化',
  'Connected to Browser Tab': '已连接到浏览器标签页',
  'Open Web Links in Browser': '在浏览器中打开网页链接',
  'Automatically open http and https links in the Browser Tab':
    '自动在浏览器标签页中打开 http 和 https 链接',
  'Servers available in this workspace.': '此工作区可用的服务器。',
  'User MCP Servers': '用户 MCP 服务器',
  'Workspace MCP Servers': '工作区 MCP 服务器',
  'Plugin MCP Servers': '插件 MCP 服务器',
  'New MCP Server': '新建 MCP 服务器',
  'Team MCP Servers': '团队 MCP 服务器',
  'Configured in the dashboard': '在控制台中配置',
  'No Team MCP Servers': '暂无团队 MCP 服务器',
  'Configure MCP servers in the dashboard to make them available in Cursor on desktop and in the cloud.':
    '在控制台中配置 MCP 服务器，以便在桌面端和云端 Cursor 中使用。',
  'Configure Team MCP Servers': '配置团队 MCP 服务器',
  'Add a hooks.json file to your user, project, or enterprise config to start running custom scripts.':
    '将 hooks.json 添加到用户、项目或企业配置中即可开始运行自定义脚本。',
  'to use OpenAI models at cost.': '以按成本计价使用 OpenAI 模型。',
  'to use Google models at-cost.': '以按成本计价使用 Google 模型。',
  'to use Claude at cost. When enabled, this key will be used for all models beginning with "claude-".':
    '以按成本计价使用 Claude。启用后，此前缀以 "claude-" 开头的模型都会使用此密钥。',
  'OpenAI API Key': 'OpenAI API 密钥',
  'API Key': 'API 密钥',
  'Base URL': '基址 URL',
  'your OpenAI key': '您的 OpenAI 密钥',
  'your Anthropic key': '您的 Anthropic 密钥',
  'your Google AI Studio key': '您的 Google AI Studio 密钥',
  'If you\'d like, you can put in your OpenAI api key to use Cursor at-cost.':
    '如有需要，可填写您的 OpenAI API 密钥，按成本在 Cursor 中使用。',
  'Team admins can configure shared MCP servers in the dashboard.':
    '团队管理员可在控制台中配置共享 MCP 服务器。',
  'Free 7-day trial': '免费 7 天试用',
  'Start Pro Now': '立即开始 Pro'
};

const settingsRiskyAddon = {
  Colors: '颜色',
  Typography: '字体排印',
  Motion: '动效',
  Compact: '紧凑',
  Detailed: '详细',
  Hue: '色相',
  Intensity: '强度',
  Tips: '提示',
  Cleanup: '清理',
  Manage: '管理',
  All: '全部',
  User: '用户',
  Team: '团队',
  Suggested: '推荐',
  Region: '区域'
};

module.exports = { settingsSafeAddon, settingsRiskyAddon };
