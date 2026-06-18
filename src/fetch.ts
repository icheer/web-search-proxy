import type { Request, Response } from 'express';
import Turndown from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

const WX_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 NetType/WIFI MicroMessenger/7.0.20.1781(0x6700143B) WindowsWechat(0x63090a13) UnifiedPCWindowsWechat(0xf254101f) XWEB/16389 SideBar Flue';

const BLOCKED = (process.env.BLOCKED_DOMAINS ?? 'localhost,127.0.0.1,::1,0.0.0.0,[bare]')
  .split(',').map(s => s.trim()).filter(Boolean);

function isBlocked(hostname: string): boolean {
  return BLOCKED.some(p => {
    if (p === '[bare]') return !hostname.includes('.');
    if (p.startsWith('*.')) return hostname === p.slice(2) || hostname.endsWith('.' + p.slice(2));
    return hostname === p;
  });
}

const td = new Turndown({ codeBlockStyle: 'fenced', headingStyle: 'atx' });
td.remove(['script', 'style', 'link', 'head', 'iframe', 'video', 'audio', 'canvas', 'noscript', 'aside']);
td.use(gfm);

export async function fetchHandler(req: Request, res: Response) {
  const { url, sanitize = false, markdown = false } = req.body as { url: string; sanitize?: boolean; markdown?: boolean };
  if (!url) { res.status(400).json({ error: 'url is required' }); return; }
  let parsed: URL;
  try { parsed = new URL(url); } catch { res.status(400).json({ error: 'invalid url' }); return; }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    res.status(400).json({ error: 'only http and https are supported' }); return;
  }
  if (isBlocked(parsed.hostname)) {
    res.status(403).json({ error: `blocked: ${parsed.hostname}` }); return;
  }
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': WX_UA,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Referer': 'https://www.bing.com/',
      },
      signal: AbortSignal.timeout(15000),
    });
    const html = await response.text();
    const title = /<title[^>]*>([^<]+)<\/title>/i.exec(html)?.[1]?.trim() ?? '';
    const content = markdown ? td.turndown(html)
      : sanitize ? html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      : html;
    res.json({ title, content });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
}
