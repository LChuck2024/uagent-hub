# uAgent Hub

uAgent 是 **Agent / Skill / API** 能力货架：主站做产品导航，Agent 商店负责体验与克隆开站，子域承载中转与多 Agent 工具。

## 信息架构

| 路径 / 域名 | 作用 |
|---|---|
| `uagent.net/` | 门户首页（产品跳转） |
| `uagent.net/agents` | Agent 商店（体验 + 克隆子域名） |
| `api.uagent.net` | API 中转（omni） |
| `storm.uagent.net` | IdeaStorm |
| `audit.uagent.net` | Life Audit（战略复盘） |
| `{slug}.uagent.net` | 用户克隆的租户站 |

不包含：梦织机、K12 / 背单词等垂类产品。

## 本地运行

```bash
npm install
cp .env.example .env
npm run dev
```

打开 <http://localhost:3000>。可选环境变量：

```bash
VITE_TENANT_DOMAIN="uagent.net"
VITE_SUITE_API_URL="https://your-omni-deploy"
VITE_SUITE_STORM_URL="https://your-ideastorm-deploy"
VITE_SUITE_AUDIT_URL="https://your-life-audit-deploy"
VITE_DEEPSEEK_API_KEY="..."
```

未配置套件 URL 时，默认指向 `api|storm|audit.localhost:PORT`。

## 脚本

- `npm run dev` — Express + Vite
- `npm run lint` — 类型检查
- `npm run build` / `npm run build:pages` — 生产 / EdgeOne
- `npm start` — 生产启动

## 注意

- DeepSeek Key 仅服务端使用，勿在前端读取 `VITE_DEEPSEEK_API_KEY`。
- 租户克隆不可占用：`api` / `storm` / `audit` / `hub` / `edu` 等保留子域。
