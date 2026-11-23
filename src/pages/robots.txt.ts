// 전체 허용. 특정 AI 크롤러를 막지 않는다(SEO-GUIDE 5.1).
import type { APIRoute } from 'astro';
import { absUrl } from '../site.config.ts';

export const GET: APIRoute = () =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${absUrl('/sitemap-index.xml')}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
