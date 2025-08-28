# Vue GitHub 热门项目 — 前端展示页面

这是一个使用 **Vite + Vue 3 + Composition API** 构建的 GitHub 热门项目展示页面。

## ✨ 特性

- 🔍 **智能搜索** - 支持关键词搜索和语言筛选
- 📊 **多维度排序** - 按 stars、forks、更新时间排序
- 📱 **响应式设计** - 移动端友好的网格布局
- 🎯 **分页浏览** - 支持分页查看更多项目
- 💬 **详情弹窗** - 点击查看仓库详细信息
- 🚀 **高性能** - 使用 Vite 构建，开发体验优秀

## 🚀 快速开始

### 前置要求
- Node.js >= 18 (推荐)

### 安装依赖
```bash
cd frontend
npm install
```

### 启动开发服务器
```bash
npm run dev
```

应用将在 `http://localhost:3000` 启动

### 构建生产版本
```bash
npm run build
npm run preview
```

## 🔧 配置代理服务器（可选）

如果你遇到 GitHub API 速率限制，可以使用内置的代理服务器：

### 1. 安装代理依赖
```bash
cd proxy
npm install
```

### 2. 设置 GitHub Token（推荐）
```bash
# Windows PowerShell
$env:GITHUB_TOKEN="your_github_token_here"

# 或者创建 .env 文件
echo "GITHUB_TOKEN=your_github_token_here" > .env
```

### 3. 启动代理服务器
```bash
node server.js
```

代理服务器将在 `http://localhost:5174` 启动

### 4. 配置前端使用代理
在 `frontend` 目录创建 `.env` 文件：
```env
VITE_API_BASE=http://localhost:5174/github
```

## 📁 项目结构

```
project/
├─ frontend/                 # 前端应用
│  ├─ index.html            # HTML 入口
│  ├─ package.json          # 前端依赖
│  ├─ vite.config.js        # Vite 配置
│  └─ src/
│     ├─ main.js            # Vue 应用入口
│     ├─ App.vue            # 主应用组件
│     ├─ styles.css         # 全局样式
│     └─ components/
│        └─ RepoCard.vue    # 仓库卡片组件
└─ proxy/                   # 代理服务器（可选）
   ├─ package.json          # 代理依赖
   └─ server.js             # 代理服务器
```

## 🎨 自定义

### 修改样式
编辑 `frontend/src/styles.css` 文件

### 添加新功能
- 在 `App.vue` 中添加新的状态和方法
- 在 `RepoCard.vue` 中扩展卡片显示内容
- 在 `styles.css` 中添加新的样式类

### 配置 API
修改 `App.vue` 中的 `API_BASE` 常量或使用环境变量

## 🌟 技术栈

- **前端框架**: Vue 3 (Composition API)
- **构建工具**: Vite 5
- **HTTP 客户端**: Axios
- **样式**: 原生 CSS
- **代理服务器**: Express.js

## 📝 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**提示**: 首次使用建议先启动代理服务器，这样可以避免 GitHub API 的速率限制问题。 