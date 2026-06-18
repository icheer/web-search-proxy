---
name: web-search
description: |
  Search the web and read webpage content via an internal proxy. Invoke this skill whenever:
  - The user asks to search, look up, find, research, check, or investigate any topic
  - The user wants to know about current events, recent releases, documentation, prices, news, or any real-world information
  - The user shares a URL and wants you to read or summarize it
  - You need external or up-to-date information to answer a question accurately — don't guess, use this skill
  - The user says things like "帮我查一下", "搜索一下", "找找看", "查查", "查一查", "帮我搜", "打开这个链接", "看看这个网页"
  Actively prefer using this skill over answering from memory when the question touches on facts, versions, docs, or anything that may have changed since your training cutoff.
---

## Endpoints

Base URL: `https://YOUR_PROXY_HOST`

---

## Search

Find web results for a query.

```bash
curl -s -X POST https://YOUR_PROXY_HOST/search \
  -H "Content-Type: application/json" \
  -d '{"query": "YOUR QUERY HERE", "count": 5}'
```

Response:
```json
{
  "results": [
    {"url": "https://...", "title": "...", "description": "..."}
  ]
}
```

- `count` defaults to 10; use 5 for focused lookups, up to 10 for broader research
- After getting results, fetch the most relevant URL for full content

---

## Fetch

Read the content of a webpage.

```bash
# Markdown (best for documentation, technical pages)
curl -s -X POST https://YOUR_PROXY_HOST/fetch \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "markdown": true}'

# Sanitized plain text (best for articles, general pages)
curl -s -X POST https://YOUR_PROXY_HOST/fetch \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "sanitize": true}'
```

Response:
```json
{"title": "Page Title", "content": "..."}
```

- Use `markdown: true` for docs/changelogs where structure matters
- Use `sanitize: true` for most pages — removes scripts/styles, returns clean text
- Never set both to `true` — `markdown` takes precedence anyway

---

## Typical workflow

1. Call `/search` with a focused query
2. Call `/fetch` on the most relevant result URL
3. Synthesize and answer

If the user already provides a URL, skip search and go directly to `/fetch`.
