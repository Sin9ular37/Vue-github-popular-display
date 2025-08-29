# Vue GitHub Popular Projects — 前端展示页面

一个使用 **Vite + Vue 3 + Element Plus** 构建的 GitHub 热门项目展示页面。

## ✨ 功能特性

- 🔍 **智能搜索**：支持关键词搜索和编程语言筛选
- 📊 **多维度排序**：按星标数、复刻数、最近更新排序
- 🎨 **现代化 UI**：使用 Element Plus 组件库，界面美观易用
- 📱 **响应式设计**：支持各种屏幕尺寸
- 📖 **README 预览**：点击详情可查看项目的 README 文档
- 🔄 **分页浏览**：支持分页查看更多项目
- 🚀 **代理支持**：内置代理服务器避免 GitHub API 限制
- 🌐 **多语言支持**：支持中英文切换，默认显示中文

## 🚀 快速开始

### 方法 1：使用启动脚本（推荐）

```bash
# Windows
start.bat

# 或手动执行
cd frontend && npm install && npm run dev
```

### 方法 2：手动启动

```bash
# 1. 安装前端依赖
cd frontend
npm install

# 2. 启动前端开发服务器
npm run dev

# 3. 可选：启动代理服务器
cd ../proxy
npm install
node server.js
```

## 🌐 访问地址

- **前端应用**：http://localhost:3000
- **代理服务器**：http://localhost:5174

## ⚙️ 配置说明

### 环境变量配置

在 `frontend` 目录下创建 `.env` 文件：

```bash
# 使用代理服务器（推荐）
VITE_API_BASE=http://localhost:5174/github

# 或直接使用 GitHub API（可能遇到速率限制）
VITE_API_BASE=https://api.github.com
```

### GitHub Token 配置（可选）

如果需要更高的 API 限制，可以设置 GitHub Token：

```bash
# 在代理服务器目录设置环境变量
export GITHUB_TOKEN=your_github_token
# Windows: set GITHUB_TOKEN=your_github_token
```

## 🛠️ 技术栈

- **前端框架**：Vue 3 (Composition API)
- **构建工具**：Vite 5
- **UI 组件库**：Element Plus 2.5
- **HTTP 客户端**：Axios
- **Markdown 解析**：Marked
- **样式**：CSS Grid + Flexbox

## 📁 项目结构

```
Vue-github-popular-display/
├── frontend/                 # 前端应用
│   ├── src/
│   │   ├── components/      # Vue 组件
│   │   │   └── RepoCard.vue # 仓库卡片组件
│   │   ├── App.vue          # 主应用组件
│   │   ├── main.js          # 应用入口
│   │   ├── i18n.js          # 国际化配置
│   │   └── styles.css       # 全局样式
│   ├── package.json         # 前端依赖
│   └── vite.config.js       # Vite 配置
├── proxy/                    # 代理服务器
│   ├── server.js            # Express 代理服务器
│   └── package.json         # 代理依赖
├── start.bat                # Windows 启动脚本
├── README.md                # 项目说明文档
└── LANGUAGE_SWITCH.md       # 语言切换功能说明
```

## 🔧 开发说明

### 新增功能

- **功能 3**：仓库详情页显示 README
  - 通过 GitHub API 获取 README 内容
  - 使用 `marked` 库解析 Markdown
  - 支持 base64 解码和原始文本

- **功能 4**：UI 优化，使用 Element Plus
  - 替换原生 HTML 元素为 Element Plus 组件
  - 统一的视觉风格和交互体验
  - 响应式布局优化

- **功能 5**：多语言支持
  - 支持中英文切换，默认显示中文
  - 完整的界面文本国际化
  - 动态语言切换，无需刷新页面

### 组件说明

- **RepoCard.vue**：仓库信息卡片，显示基本信息
- **App.vue**：主应用，包含搜索、列表、分页、详情弹窗

## 📝 使用说明

1. **搜索项目**：在搜索框输入关键词（如 "vue"、"react"）
2. **筛选语言**：选择特定的编程语言
3. **排序方式**：按星标数、复刻数或更新时间排序
4. **查看详情**：点击 "Details" 按钮查看项目详情和 README
5. **分页浏览**：使用分页控件查看更多项目
6. **切换语言**：点击右上角语言切换按钮在中英文之间切换

## 🌐 语言切换

- **默认语言**：中文
- **支持语言**：中文、英文
- **切换方式**：点击页面右上角的语言切换按钮
- **即时生效**：切换后所有界面文本立即更新

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## �� 许可证

MIT License 