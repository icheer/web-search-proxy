# web-search-proxy

轻量级网页搜索与抓取代理，为 AI Agent 提供两个 HTTP 接口：搜索互联网、抓取网页正文。无浏览器依赖，镜像体积小。

## 接口

### POST /search

通过 DuckDuckGo 搜索互联网。

```bash
curl -X POST http://localhost:3030/search \
  -H "Content-Type: application/json" \
  -d '{"query": "TypeScript tutorial", "count": 5}'
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `query` | string | 必填 | 搜索关键词 |
| `count` | number | 10 | 返回结果数量 |

响应：

```json
{
  "results": [
    {
      "url": "https://...",
      "title": "页面标题",
      "description": "摘要内容"
    }
  ]
}
```

---

### POST /fetch

抓取指定 URL 的网页内容。

```bash
# 返回纯文本（去除脚本/样式）
curl -X POST http://localhost:3030/fetch \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "sanitize": true}'

# 返回 Markdown
curl -X POST http://localhost:3030/fetch \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "markdown": true}'
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `url` | string | 必填 | 目标网页 URL |
| `sanitize` | boolean | false | 去除所有 HTML 标签，返回纯文本 |
| `markdown` | boolean | false | 将 HTML 转换为 Markdown（优先级高于 sanitize） |

响应：

```json
{
  "title": "页面标题",
  "content": "..."
}
```

## 本地运行

```bash
npm install
npm run dev        # 开发模式，监听 :3030
```

## 环境变量

复制 `.env.example` 并按需修改：

```bash
cp .env.example .env
```

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `PORT` | 3030 | 监听端口 |

## Docker

```bash
docker build -t web-search-proxy .
docker run -p 3030:3030 web-search-proxy
```

## CI/CD

- **GitHub Actions**：push 到 `main` 分支自动构建并推送镜像至 DockerHub（`icheerme/web-search-proxy:latest`）

所需 Secrets：`DOCKERHUB_USERNAME`、`DOCKERHUB_TOKEN`（GitHub）；`CI_TOKEN`、`GIT_IDG`（Gitea）

## 技术栈

- Node.js 20 + TypeScript
- Express
- Turndown（HTML → Markdown）
