/**
 * 精确字符串替换（设置侧栏导航、欢迎页、Agent 侧栏等）
 * 优先整块替换 JwS 导航对象，避免碎片化替换失效
 */
const fs = require('fs');
const path = require('path');

const navDataPath = path.join(__dirname, '..', 'data', 'nav-snippets-3.5.38.json');
const navData = JSON.parse(fs.readFileSync(navDataPath, 'utf8'));

/** @type {[string, string][]} */
const exactSnippets = [
  // --- 3.5.38 设置侧栏 JwS 导航（整块替换，必须匹配英文原版）---
  ...navData.replacements.map((r) => [r.from, r.to]),

  // --- 设置页标题与描述 ---
  ['title:"Plan & Usage"', 'title:"计划与用量"'],
  [
    'description:"Personal usage for your primary enterprise team."',
    'description:"您主企业团队的个人用量。"'
  ],

  // --- 欢迎页 / 启动页（已验证备份中存在）---
  ['wt("<div>Open project")', 'wt("<div>打开项目")'],
  ['wt("<div>Clone repo")', 'wt("<div>克隆仓库")'],
  ['wt("<div>Connect via SSH")', 'wt("<div>通过 SSH 连接")'],
  ['wt("<div>New Window")', 'wt("<div>新建窗口")'],
  ['<span>Recent projects</span>', '<span>最近项目</span>'],
  ['>View all (<!>)', '>查看全部 (<!>)'],
  ['()=>p()?"Hide":"View all"', '()=>p()?"隐藏":"查看全部"'],

  // --- Agent 侧栏 / 账户 ---
  ['children:"Upgrade to a Pro account"', 'children:"升级到专业版账户"'],
  ['"aria-label":"Upgrade to a Pro account"', '"aria-label":"升级到专业版账户"'],
  ['children:"Upgrade to Pro"', 'children:"升级到专业版"'],
  ['"aria-label":"Upgrade to Pro"', '"aria-label":"升级到专业版"'],
  ['"Upgrade for extended limits and full model access"', '"升级以获得更高额度和完整模型访问"'],

  // --- Agent 侧栏导航 ---
  ['children:"Customize"', 'children:"自定义"'],
  ['title:"Customize"', 'title:"自定义"'],
  ['label:"Customize"', 'label:"自定义"'],
  ['>Customize<', '>自定义<'],
  // Glass 侧栏 marketplace 标签（A/B 实验 treatment 组显示 Customize）
  [
    'ut1("marketplace_tab_customize_label","group",!se)==="treatment"?"Customize":"Marketplace"',
    'ut1("marketplace_tab_customize_label","group",!se)==="treatment"?"自定义":"市场"'
  ],
  ['C3.create(gDm,gDm.ID,"Customize")', 'C3.create(gDm,gDm.ID,"自定义")'],
  ['original:"Open Customize"', 'original:"打开自定义"'],

  // --- 顶部菜单栏 View ---
  [
    '{menuId:Zt.MenubarViewMenu,label:"View",trigger:"text"}',
    '{menuId:Zt.MenubarViewMenu,label:"视图",trigger:"text"}'
  ],
  ['View:cn(1774,"View")', 'View:cn(1774,"视图")'],

  // --- 用户菜单（Cursor Docs / Contact Us）---
  ['children:"Cursor Docs"', 'children:"Cursor 文档"'],
  ['children:"Contact Us"', 'children:"联系我们"'],

  // --- 外观子菜单（主题）---
  ['fJ0={icon:"color-mode",label:"System"}', 'fJ0={icon:"color-mode",label:"跟随系统"}'],
  ['label:"Cursor Light"', 'label:"Cursor 浅色"'],
  ['label:"Cursor Dark High Contrast"', 'label:"Cursor 深色高对比度"'],
  ['label:"Cursor Dark"', 'label:"Cursor 深色"'],

  // --- 顶部菜单栏子菜单（Glass menubar au() menu.title）---
  [
    'menu:{column:Zt.MenubarFileMenu,group:"2_new_tabs",order:1,title:"New Terminal"}',
    'menu:{column:Zt.MenubarFileMenu,group:"2_new_tabs",order:1,title:"新建终端"}'
  ],
  [
    'menu:{column:Zt.MenubarFileMenu,group:"2_new_tabs",order:2,title:"New Browser"}',
    'menu:{column:Zt.MenubarFileMenu,group:"2_new_tabs",order:2,title:"新建浏览器"}'
  ],
  [
    'menu:{column:Zt.MenubarFileMenu,group:"2_open",order:3,title:"Open Editor Window"}',
    'menu:{column:Zt.MenubarFileMenu,group:"2_open",order:3,title:"打开编辑器窗口"}'
  ],
  [
    'menu:{column:Zt.MenubarFileMenu,group:"9_exit",order:0,title:"Exit"}',
    'menu:{column:Zt.MenubarFileMenu,group:"9_exit",order:0,title:"退出"}'
  ],
  ['id:"quitApplication",title:"Quit"', 'id:"quitApplication",title:"退出"'],
  [
    'F({key:"glassOsEditUndo",comment:["&& denotes a mnemonic"]},"&&Undo")',
    'F({key:"glassOsEditUndo",comment:["&& denotes a mnemonic"]},"撤销")'
  ],
  [
    'F({key:"glassOsEditRedo",comment:["&& denotes a mnemonic"]},"&&Redo")',
    'F({key:"glassOsEditRedo",comment:["&& denotes a mnemonic"]},"重做")'
  ],
  [
    'F({key:"glassOsEditCut",comment:["&& denotes a mnemonic"]},"Cu&&t")',
    'F({key:"glassOsEditCut",comment:["&& denotes a mnemonic"]},"剪切")'
  ],
  [
    'F({key:"glassOsEditCopy",comment:["&& denotes a mnemonic"]},"&&Copy")',
    'F({key:"glassOsEditCopy",comment:["&& denotes a mnemonic"]},"复制")'
  ],
  [
    'F({key:"glassOsEditPaste",comment:["&& denotes a mnemonic"]},"&&Paste")',
    'F({key:"glassOsEditPaste",comment:["&& denotes a mnemonic"]},"粘贴")'
  ],
  [
    'F({key:"glassOsEditSelectAll",comment:["&& denotes a mnemonic"]},"Select &&All")',
    'F({key:"glassOsEditSelectAll",comment:["&& denotes a mnemonic"]},"全选")'
  ],
  [
    'menu:{column:Zt.MenubarViewMenu,group:"1_open",order:1,title:"Changes"}',
    'menu:{column:Zt.MenubarViewMenu,group:"1_open",order:1,title:"更改"}'
  ],
  [
    'menu:{column:Zt.MenubarViewMenu,group:"1_open",order:3,title:"Files"}',
    'menu:{column:Zt.MenubarViewMenu,group:"1_open",order:3,title:"文件"}'
  ],
  [
    'menu:{column:Zt.MenubarViewMenu,group:"5_zoom",order:1,title:"Zoom In"',
    'menu:{column:Zt.MenubarViewMenu,group:"5_zoom",order:1,title:"放大"'
  ],
  [
    'menu:{column:Zt.MenubarViewMenu,group:"5_zoom",order:2,title:"Zoom Out"',
    'menu:{column:Zt.MenubarViewMenu,group:"5_zoom",order:2,title:"缩小"'
  ],
  [
    'menu:{column:Zt.MenubarViewMenu,group:"5_zoom",order:3,title:"Reset Zoom"',
    'menu:{column:Zt.MenubarViewMenu,group:"5_zoom",order:3,title:"重置缩放"'
  ],
  [
    'menu:{column:Zt.MenubarHelpMenu,group:"1_welcome",order:2,title:"Command Palette"',
    'menu:{column:Zt.MenubarHelpMenu,group:"1_welcome",order:2,title:"命令面板"'
  ],
  [
    'menu:{column:Zt.MenubarHelpMenu,group:"4_legal",order:1,title:"View License"',
    'menu:{column:Zt.MenubarHelpMenu,group:"4_legal",order:1,title:"查看许可证"'
  ],

  // --- 通用设置页（账号 / 升级 / 通知）---
  [
    'label:"Cursor Account",description:"Manage your account and billing"',
    'label:"Cursor 账号",description:"管理您的账号与账单"'
  ],
  [
    'label:"Warning Notifications",description:"Show warning-level in-app toasts"',
    'label:"警告通知",description:"显示应用内警告级别通知"'
  ],
  [
    'return Z()?"Start Free Trial":"Upgrade to Pro"',
    'return Z()?"开始免费试用":"升级到 Pro"'
  ],
  [
    'return Z()?"Start Trial":"Upgrade"',
    'return Z()?"开始试用":"升级"'
  ],

  // --- 外观分区标题 ---
  ['title:"Colors"', 'title:"颜色"'],
  ['title:"Typography"', 'title:"字体排印"'],
  ['title:"Motion"', 'title:"动效"'],
  ['title:"Cleanup"', 'title:"清理"'],
  ['title:"Chat"', 'title:"聊天"'],

  // --- 计划与用量 ---
  ['>Current Plan</div>', '>当前方案</div>'],
  ['>Upgrade Available</div>', '>可升级</div>'],
  ['>Resets on ', '>重置于 '],

  // --- API Key 描述碎片 ---
  ['"You can put in"', '"您可以填写"'],
  ['["You can put in"," "', '["您可以填写"," "'],

  // --- 钩子标题 ---
  ['return`Configured Hooks (${N()})`', 'return`已配置的钩子 (${N()})`'],

  // --- MCP 状态 ---
  ['`${d()} tools`', '`${d()} 个工具`'],
  ['`${h()} prompts`', '`${h()} 个提示`'],
  ['`${p()} resources`', '`${p()} 个资源`'],
  ['n.isEnabled?"enabled":""', 'n.isEnabled?"已启用":""'],
  [
    'wt("<div class=mcp-server-list-header>User MCP Servers")',
    'wt("<div class=mcp-server-list-header>用户 MCP 服务器")'
  ],
  [
    'wt("<div class=mcp-server-list-header>Workspace MCP Servers")',
    'wt("<div class=mcp-server-list-header>工作区 MCP 服务器")'
  ],
  [
    'wt("<div class=mcp-server-list-header>Plugin MCP Servers")',
    'wt("<div class=mcp-server-list-header>插件 MCP 服务器")'
  ],
  [
    '>Team MCP Servers</span><span class=team-mcp-section-header-subtitle>Configured in the dashboard',
    '>团队 MCP 服务器</span><span class=team-mcp-section-header-subtitle>在控制台中配置'
  ],
  [
    'wt("<div class=settings-menu-hoverable>View All Models")',
    'wt("<div class=settings-menu-hoverable>查看全部模型")'
  ],
  [
    'wt(\'<div class="flex items-center gap-2"><span>On-Demand Usage\')',
    'wt(\'<div class="flex items-center gap-2"><span>按需用量\')'
  ],
  ['title:"Configure Ignored Files"', 'title:"配置忽略的文件"'],
  ['<div>Browser Automation</div>', '<div>浏览器自动化</div>'],
  ['>Browser Automation</div>', '>浏览器自动化</div>'],

  // --- Docs 外链 ---
  ['ccm={docs:"Docs",contact:"Contact"}', 'ccm={docs:"文档",contact:"联系"}'],
  ['docs:"Docs"', 'docs:"文档"'],
  ['contact:"Contact"', 'contact:"联系"'],

  // --- 菜单 View（布局子菜单）---
  ['title:cn(3163,"Customize Layout...")', 'title:cn(3163,"自定义布局...")'],

  // --- Free Plan 显示 ---
  ['?"Free Plan":"Pro+ Trial"', '?"免费版":"Pro+ 试用"'],
  ['return"Free Plan"', 'return"免费版"'],
  ['case Ru.FREE:return"Free Plan"', 'case Ru.FREE:return"免费版"'],
  ['"Free Plan · Upgrade"', '"免费版 · 升级"']
];

// 按源字符串长度降序，避免短串抢先替换
exactSnippets.sort((a, b) => b[0].length - a[0].length);

module.exports = { exactSnippets, navData };
