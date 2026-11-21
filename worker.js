import { onRequestGet, onRequestOptions } from './functions/api/[[path]].js';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const HOME_HTML = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>一言 API</title>
  <style>
    :root { color-scheme: light dark; }
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; background: #f6f8fa; color: #1f2328; }
    @media (prefers-color-scheme: dark) { body { background: #0d1117; color: #e6edf3; } }
    main { width: min(720px, calc(100% - 40px)); padding: 40px; border-radius: 16px; background: #ffffff; box-shadow: 0 8px 30px rgba(0,0,0,.08); }
    @media (prefers-color-scheme: dark) { main { background: #161b22; } }
    h1 { margin: 0 0 12px; font-size: 28px; }
    p { line-height: 1.7; }
    code { padding: 2px 6px; border-radius: 6px; background: rgba(127,127,127,.16); }
    a { color: #0969da; }
    @media (prefers-color-scheme: dark) { a { color: #58a6ff; } }
  </style>
</head>
<body>
  <main>
    <h1>一言 API</h1>
    <p>内置完整一言词库，支持分类、作者、出处、关键词、长度筛选和中国名言名句合集。</p>
    <p>调用接口：<code>GET /api</code></p>
    <p>中国名言名句：<a href="/api?c=cn&format=quote">/api?c=cn&format=quote</a></p>
    <p>完整参数说明见仓库 README。</p>
  </main>
</body>
</html>`;

function jsonNotFound(pathname) {
  return new Response(
    JSON.stringify({ error: 'NOT_FOUND', message: `没有路径 ${pathname}，API 地址是 /api` }),
    {
      status: 404,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        ...CORS_HEADERS,
      },
    },
  );
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const isApi = url.pathname === '/api' || url.pathname.startsWith('/api/');

    if (isApi) {
      if (request.method === 'OPTIONS') return onRequestOptions();
      if (request.method === 'GET') {
        return onRequestGet({ request, env, ctx });
      }
      return new Response(null, {
        status: 405,
        headers: { Allow: 'GET, OPTIONS', ...CORS_HEADERS },
      });
    }

    if (request.method === 'GET' || request.method === 'HEAD') {
      if (url.pathname !== '/') return jsonNotFound(url.pathname);
      return new Response(request.method === 'HEAD' ? null : HOME_HTML, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=300',
        },
      });
    }

    return jsonNotFound(url.pathname);
  },
};
