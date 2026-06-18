import type { Request, Response } from 'express';

const now = () => new Date().toLocaleString('sv-SE', { timeZone: process.env.TZ ?? 'Asia/Shanghai' });
const MAX = 50;
const searchLog: { query: string; time: string }[] = [];
const fetchLog: { url: string; time: string }[] = [];

export function logSearch(query: string) {
  if (searchLog.length >= MAX) searchLog.pop();
  searchLog.unshift({ query, time: now() });
}

export function logFetch(url: string) {
  if (fetchLog.length >= MAX) fetchLog.pop();
  fetchLog.unshift({ url, time: now() });
}

export function logsHandler(req: Request, res: Response) {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) { res.status(404).json({ error: 'not found' }); return; }
  if (req.query.password !== pw) { res.status(401).json({ error: 'unauthorized' }); return; }
  res.json({ searches: searchLog, fetches: fetchLog });
}
