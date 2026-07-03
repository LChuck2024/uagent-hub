<div align="center">
<img width="1200" height="475" alt="uAgent Hub banner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# uAgent Hub

uAgent Hub 是一个 AI 智能体与自动化工作流聚合中心。它内置多行业智能体、顺序执行工作流、社区资源列表、自定义配置与点赞/运行统计，适合用来快速体验和扩展 DeepSeek 驱动的 Agent 应用。

## 功能概览

- 智能体大厅：按办公、编程、营销、亲子、生活、金融、设计、旅行等分类浏览。
- 工作流执行：按步骤串联多轮 AI 生成、转换、翻译或格式化任务。
- 自定义配置：创建并发布自定义智能体或工作流到本地社区列表。
- 互动数据：支持点赞和运行次数统计。
- 服务端 DeepSeek 调用：通过 Express API 在服务端调用 DeepSeek。
- 前端体验：基于 React、Vite、Tailwind CSS 和 Motion 构建。

## 技术栈

- React 19
- Vite 6
- TypeScript
- Tailwind CSS 4
- Express
- DeepSeek Chat Completions API
- Lucide React
- Motion

## 本地运行

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制示例文件：

```bash
cp .env.example .env
```

然后在 `.env` 中填写：

```bash
VITE_DEEPSEEK_API_KEY="your_deepseek_api_key"
APP_URL="http://localhost:3000"
```

说明：

- `VITE_DEEPSEEK_API_KEY` 用于聊天和工作流执行接口。部署到 EdgeOne Pages 时，请在环境变量中配置这个 key。
- 大模型固定使用 DeepSeek V4 Flash，对应 API 模型名为 `deepseek-v4-flash`。
- 未配置 `VITE_DEEPSEEK_API_KEY` 时，应用仍可启动并浏览大厅资源，但调用 AI 会返回配置错误。
- `APP_URL` 目前主要用于部署环境中的自引用链接、OAuth 回调或 API 地址扩展。

### 3. 启动开发服务

```bash
npm run dev
```

默认访问地址：

```text
http://localhost:3000
```

## 常用脚本

```bash
npm run dev
```

启动 Express + Vite 开发服务。

```bash
npm run lint
```

运行 TypeScript 类型检查。

```bash
npm run build
```

构建前端静态资源，并打包服务端入口到 `dist/server.cjs`。

```bash
npm start
```

以生产模式启动构建后的服务。

```bash
npm run preview
```

使用 Vite 预览前端构建产物。

```bash
npm run clean
```

删除构建产物。

## 项目结构

```text
.
├── index.html
├── server.ts
├── package.json
├── vite.config.ts
├── src
│   ├── App.tsx
│   ├── main.tsx
│   ├── index.css
│   ├── types.ts
│   └── components
│       ├── AgentChat.tsx
│       ├── CustomCreator.tsx
│       ├── Markdown.tsx
│       ├── ParentChildChallenge.tsx
│       └── WorkflowRunner.tsx
└── .env.example
```

## API 简介

服务端主要提供以下接口：

- `GET /api/community/resources`：获取内置与自定义智能体、工作流。
- `POST /api/community/share`：发布自定义智能体或工作流。
- `POST /api/community/interaction`：记录点赞或运行次数。
- `POST /api/agent/chat`：与指定智能体对话。
- `POST /api/workflow/run`：按步骤执行工作流。

当前自定义资源和互动数据保存在服务端内存中，重启服务后会重置。如果要用于长期部署，需要接入数据库或持久化存储。

## 生产构建与部署

先构建：

```bash
npm run build
```

再启动：

```bash
npm start
```

服务端会读取 `PORT` 环境变量；如果未设置，默认使用 `3000`。

部署时至少需要配置：

```bash
VITE_DEEPSEEK_API_KEY="your_deepseek_api_key"
NODE_ENV="production"
```

`npm start` 已内置 `NODE_ENV=production`，在常见 Linux/macOS 环境中可直接使用。

如果只部署 Vite 静态产物到 EdgeOne Pages，内置智能体和工作流会从前端打包数据中兜底展示；但聊天、工作流执行、自定义发布、点赞统计等接口仍需要后端 API 或 EdgeOne Functions 承接。

## 注意事项

- 网页标签页标题配置在 `index.html` 中。
- DeepSeek 调用发生在服务端。虽然变量名使用 `VITE_` 以匹配 EdgeOne Pages 配置，请不要在前端代码里通过 `import.meta.env` 读取或打印它。
- 工作流步骤使用 `{{trigger.xxx}}`、`{{step_output_name}}` 等模板变量拼接上下文。
- 当前项目偏 Demo/原型形态，生产化前建议补充鉴权、持久化、请求限流和错误追踪。
