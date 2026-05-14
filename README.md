# 知乎故事重塑工坊

> 知乎黑客松项目 —— AI 赋能沉浸式内容创作

## 项目简介

**知乎故事重塑工坊**是一个将知乎故事/文章内容通过 AI 转化为情绪响应式、交互丰富的 AI-Native 网页的创作平台。

核心卖点：**"粘贴一篇知乎故事，AI 为你生成一部电影级沉浸式阅读体验"**

## 功能特性

### 核心功能
- ✨ **极简输入**：支持粘贴知乎 URL、Markdown、纯文本，或一键填充 9 个示例故事
- 🎨 **AI 生成引擎**：自动分析情绪曲线、角色、配色，生成独立 HTML 页面
- 🎬 **魔法动效**：碎纸成代码粒子的生成过程可视化
- 🔒 **沙箱预览**：iframe 隔离渲染 AI 生成的 HTML，安全无 XSS
- 📊 **AI 设计决策面板**：展示配色逻辑、情绪标签、风格 DNA、情绪脉搏图

### 用户系统
- 🔑 **知乎 OAuth 登录**：标准 OAuth 2.0 授权流程
- 📚 **个人作品库**：保存、预览、下载、删除生成的作品
- 🌐 **社区广场**：浏览公开作品，按情绪标签筛选，点赞互动
- ⬇️ **代码下载**：一键下载 `.html` 文件到本地

### 扩展功能
- 🚀 **一键发布到知乎圈子**（API 已封装，配置密钥后即可使用）
- 📈 **情绪脉搏图**：可视化故事情绪起伏曲线
- 🏷️ **作品 DNA 标签**：AI 自动提取视觉风格 DNA

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Next.js 14 (App Router) + React 18 |
| 样式 | Tailwind CSS + Framer Motion |
| 数据库 | SQLite (Prisma ORM) |
| 认证 | NextAuth.js + 知乎 OAuth 2.0 |
| AI | OpenAI GPT-4o / Claude 3.5（兼容） |
| 部署 | Vercel / 自建服务器 |

## 快速开始

### 1. 安装依赖

```bash
cd web
npm install
```

### 2. 配置环境变量

复制 `.env` 并填写你的密钥：

```bash
# 数据库
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="你的随机密钥"
NEXTAUTH_URL="http://localhost:3000"

# 知乎 OAuth（在知乎开放平台申请）
ZHIHU_APP_ID="your_app_id"
ZHIHU_APP_KEY="your_app_key"
ZHIHU_APP_SECRET="your_app_secret"
ZHIHU_REDIRECT_URI="http://localhost:3000/api/auth/callback/zhihu"

# AI API（可选，不填则使用演示模板）
OPENAI_API_KEY="sk-..."
# 或 ANTHROPIC_API_KEY="sk-ant-..."
```

**注意**：知乎 OAuth 的 `redirect_uri` 需配置为 `http://localhost:3000/api/auth/callback/zhihu`

### 3. 初始化数据库

```bash
npx prisma migrate dev --name init
npx prisma db seed   # 可选：填充示例作品
```

在 `package.json` 中添加：
```json
"prisma": {
  "seed": "ts-node prisma/seed.ts"
}
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 5. 构建生产版本

```bash
npm run build
npm start
```

## 项目结构

```
web/
├── app/                      # Next.js App Router
│   ├── page.tsx              # 首页（输入 + 示例故事）
│   ├── generate/page.tsx     # AI 生成过程页（动效 + 预览）
│   ├── p/[id]/page.tsx       # 作品预览页（沙箱 + 工具条）
│   ├── my-works/page.tsx     # 个人作品库
│   ├── community/page.tsx    # 社区广场
│   └── api/                  # API Routes
│       ├── auth/[...nextauth]/  # NextAuth 知乎 OAuth
│       ├── works/            # 作品 CRUD + 下载 + 发布
│       ├── community/        # 广场列表 + 点赞
│       └── generate/         # AI 生成接口
├── components/               # React 组件
│   ├── Navbar.tsx            # 导航栏
│   ├── SandboxPreview.tsx    # iframe 沙箱预览
│   ├── AiDecisionPanel.tsx   # AI 设计决策面板
│   └── WorkCard.tsx          # 作品卡片
├── lib/
│   ├── db.ts                 # Prisma 客户端
│   ├── auth.ts               # NextAuth 配置
│   ├── zhihu-api.ts          # 知乎 API 封装（签名/OAuth）
│   └── ai-generator.ts       # AI 生成引擎
├── prisma/
│   ├── schema.prisma         # 数据库模型
│   └── seed.ts               # 示例数据
├── data/
│   └── stories.json          # 9 篇知乎黑客松示例故事
└── package.json
```

## 数据库模型

- **User**：知乎用户信息（uid、昵称、头像）
- **Work**：生成的作品（标题、HTML 代码、元信息、公开状态）
- **Like**：点赞记录

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/generate` | AI 生成 HTML |
| POST/GET | `/api/works` | 创建/获取作品 |
| GET/DELETE | `/api/works/:id` | 获取/删除作品 |
| POST | `/api/works/:id/publish` | 设为公开 |
| GET | `/api/works/:id/download` | 下载 HTML |
| GET | `/api/community` | 社区广场列表 |
| POST | `/api/community/:id/like` | 点赞/取消点赞 |

## 部署到 Vercel

1. 将代码推送到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量（同上）
4. 添加 Build Command：`npx prisma generate && next build`
5. 部署

## 注意事项

- **AI 生成**：需要配置 `OPENAI_API_KEY` 才能使用真实 AI 生成。未配置时，系统会返回基于内容长度的演示模板。
- **知乎 OAuth**：需要在知乎开放平台（https://openapi.zhihu.com）申请应用凭证，并将授权回调地址配置为 `/api/auth/callback/zhihu`。
- **发布到圈子**：接口已封装在 `lib/zhihu-api.ts` 中，配置 `ZHIHU_APP_KEY` 和 `ZHIHU_APP_SECRET` 后即可调用。

## 截图预览

（此处可添加首页、生成页、预览页、社区广场截图）

## 团队与致谢

本项目为知乎黑客松参赛项目，基于知乎开放平台 API 开发。
