# web-search-proxy

为 AI Agent（如 Claude Code）提供网页搜索与抓取能力的轻量代理服务。部署后，Agent 可以通过简单的 HTTP 调用搜索互联网、读取任意网页内容，无需浏览器，无需复杂配置。

**适用场景：** 在局域网或私有环境中为 Claude Code / 自建 Agent 提供实时联网能力。

## 快速部署

```bash
docker run -d -p 3030:3030 --restart unless-stopped icheerme/web-search-proxy:latest
```

或使用 docker-compose：

```yaml
services:
  web-search-proxy:
    image: icheerme/web-search-proxy:latest
    ports:
      - "3030:3030"
    restart: always
    environment:
      - TZ=Asia/Shanghai
```

## 配套 Claude Code Skill

项目附带了一个 Claude Code Skill（`skill/SKILL.md`），安装后 Claude 可以**自动识别搜索需求**并调用本服务，无需手动指定工具。

安装方式：将 `skill/SKILL.md` 中的 `YOUR_PROXY_HOST` 替换为你的服务地址，然后在 Claude Code 中通过 `/add-skill` 加载。

## 接口

### POST /search

通过 DuckDuckGo 搜索互联网，返回标题、链接和摘要。

```bash
curl -X POST http://localhost:3030/search \
  -H "Content-Type: application/json" \
  -d '{"query": "TypeScript tutorial", "count": 5}'
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `query` | string | 必填 | 搜索关键词 |
| `count` | number | 10 | 返回结果数量 |

```json
{
  "results": [
    { "url": "https://...", "title": "页面标题", "description": "摘要内容" }
  ]
}
```

---

### POST /fetch

抓取指定 URL 的网页内容，支持纯文本或 Markdown 格式输出。

```bash
# 纯文本（去除脚本/样式，适合文章类页面）
curl -X POST http://localhost:3030/fetch \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "sanitize": true}'

# Markdown（保留文档结构，适合技术文档/changelog）
curl -X POST http://localhost:3030/fetch \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "markdown": true}'
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `url` | string | 必填 | 目标网页 URL |
| `sanitize` | boolean | false | 去除所有 HTML 标签，返回纯文本 |
| `markdown` | boolean | false | 将 HTML 转换为 Markdown（优先级高于 `sanitize`） |

```json
{ "title": "页面标题", "content": "..." }
```

## 本地开发

```bash
npm install
cp .env.example .env
npm run dev   # 监听 :3030
```

| 环境变量 | 默认值 | 说明 |
|----------|--------|------|
| `PORT` | 3030 | 监听端口 |
| `BLOCKED_DOMAINS` | `localhost,127.0.0.1,::1,0.0.0.0` | `/fetch` 域名黑名单，逗号分隔。支持精确匹配（`192.168.1.1`）、通配符（`*.internal`）、特殊值 `[bare]`（拦截所有无点裸主机名如 `redis`、`jenkins`） |

## 自行构建镜像

```bash
docker build -t web-search-proxy .
docker run -p 3030:3030 web-search-proxy
```

push 到 `main` 分支会自动触发 GitHub Actions 构建并推送至 DockerHub（需配置 `DOCKERHUB_USERNAME`、`DOCKERHUB_TOKEN` Secrets）。

## 技术栈

Node.js 20 · TypeScript · Express · Turndown
