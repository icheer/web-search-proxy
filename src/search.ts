import type { Request, Response } from 'express';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36';
const TITLE_RE = /<a[^>]+class="result__a"[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
const SNIPPET_RE = /<a[^>]+class="result__snippet"[^>]*>([^<]*(?:<[^>]+>[^<]*)*)<\/a>/g;

async function ddgSearch(query: string, count: number) {
  const res = await fetch('https://html.duckduckgo.com/html/', {
    method: 'POST',
    headers: { 'user-agent': UA, 'content-type': 'application/x-www-form-urlencoded' },
    body: `q=${encodeURIComponent(query)}&b=&kl=`,
    signal: AbortSignal.timeout(10000),
  });
  const html = await res.text();
  const titles = [...html.matchAll(TITLE_RE)].slice(0, count);
  const snippets = [...html.matchAll(SNIPPET_RE)];
  const results = titles.map((m, i) => ({
    url: m[1],
    title: m[2],
    description: (snippets[i]?.[1].replace(/<[^>]+>/g, '') ?? '').replace(/[ \t]+/g, ' ').replace(/(\s*\n\s*)+/g, '\n').trim(),
  }));
  return { results };
}

export async function searchHandler(req: Request, res: Response) {
  const { query, count = 10 } = req.body as { query: string; count?: number };
  if (!query) { res.status(400).json({ error: 'query is required' }); return; }
  try {
    res.json(await ddgSearch(query, count));
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
}

