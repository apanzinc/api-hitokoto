import { getSentencesData } from '../../data/sentences.js';
import {
  CATEGORIES,
  CHINESE_COLLECTION,
  categoryName,
  resolveCategory,
} from '../../data/categories.js';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const jsonHeaders = (extra = {}) => ({
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'public, max-age=60',
  ...CORS_HEADERS,
  ...extra,
});

function jsonResponse(body, status = 200, extra = {}) {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders(extra) });
}

function textResponse(body, extra = {}) {
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=60',
      ...CORS_HEADERS,
      ...extra,
    },
  });
}

// "中国名言名句"合集在官方诗词分类（i）里进一步筛掉作者为空或占位作者，
// 只保留有明确中文作者和中文出处的条目，避免 null/佚名混入。
function isChineseClassic(item) {
  if (!CHINESE_COLLECTION.types.includes(item.type)) return false;
  const author = (item.from_who ?? '').trim();
  const source = (item.from ?? '').trim();
  if (!author || !source) return false;
  if (/^(佚名|无名|网络|网友|未知)$/.test(author)) return false;
  return /[\u3400-\u9fff]/.test(author) && /[\u3400-\u9fff]/.test(source);
}

function parseNonNegativeInt(value) {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(value);
  return Number.isFinite(num) && num >= 0 ? Math.floor(num) : null;
}

// 根据查询参数从全量词库中筛选候选池。
function buildPool(params) {
  let pool = getSentencesData();

  const category = resolveCategory(params.get('c') ?? params.get('type'));
  if (category === 'cn') {
    pool = pool.filter(isChineseClassic);
  } else if (category) {
    pool = pool.filter((item) => item.type === category);
  }

  const author = (params.get('author') ?? params.get('from_who') ?? '').trim();
  if (author) {
    const needle = author.toLowerCase();
    pool = pool.filter((item) => (item.from_who ?? '').toLowerCase().includes(needle));
  }

  const source = (params.get('from') ?? '').trim();
  if (source) {
    const needle = source.toLowerCase();
    pool = pool.filter((item) => (item.from ?? '').toLowerCase().includes(needle));
  }

  const keyword = (params.get('q') ?? params.get('keyword') ?? '').trim();
  if (keyword) {
    const needle = keyword.toLowerCase();
    pool = pool.filter(
      (item) =>
        item.hitokoto.toLowerCase().includes(needle) ||
        (item.from_who ?? '').toLowerCase().includes(needle) ||
        (item.from ?? '').toLowerCase().includes(needle),
    );
  }

  const minLength = parseNonNegativeInt(params.get('min_length'));
  if (minLength !== null) pool = pool.filter((item) => item.length >= minLength);

  const maxLength = parseNonNegativeInt(params.get('max_length'));
  if (maxLength !== null) pool = pool.filter((item) => item.length <= maxLength);

  return pool;
}

function findById(id) {
  return getSentencesData().find((item) => String(item.id) === String(id)) ?? null;
}

function formatQuote(item) {
  const parts = [item.hitokoto];
  if (item.from_who) parts.push(`—— ${item.from_who}`);
  if (item.from) parts.push(`《${item.from}》`);
  return parts.join(' ');
}

function escapeJs(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/'/g, "\\'");
}

export async function onRequestGet(context) {
  try {
    const url = new URL(context.request.url);
    const params = url.searchParams;

    const id = params.get('id');
    if (id !== null && id !== '') {
      const found = findById(id);
      if (!found) {
        return jsonResponse({ error: 'NOT_FOUND', message: `没有 id 为 ${id} 的句子` }, 404);
      }
      return jsonResponse(found);
    }

    const format = (params.get('format') ?? params.get('encode') ?? 'json').toLowerCase();
    const allowedFormats = ['json', 'text', 'quote', 'js'];
    if (!allowedFormats.includes(format)) {
      return jsonResponse(
        { error: 'INVALID_FORMAT', message: `format 只支持 ${allowedFormats.join(' / ')}` },
        400,
      );
    }

    const categoryInput = params.get('c') ?? params.get('type');
    const requestedCategory = resolveCategory(categoryInput);
    if (categoryInput && requestedCategory === null) {
      return jsonResponse(
        {
          error: 'INVALID_CATEGORY',
          message: `未知分类 ${categoryInput}`,
          categories: CATEGORIES.map((item) => ({ key: item.key, name: item.name })).concat({
            key: CHINESE_COLLECTION.key,
            name: CHINESE_COLLECTION.name,
          }),
        },
        400,
      );
    }

    const pool = buildPool(params);
    if (pool.length === 0) {
      return jsonResponse(
        { error: 'NO_MATCH', message: '没有符合条件的句子，试试放宽筛选条件' },
        404,
      );
    }

    const picked = pool[Math.floor(Math.random() * pool.length)];

    if (format === 'text') return textResponse(picked.hitokoto);
    if (format === 'quote') return textResponse(formatQuote(picked));
    if (format === 'js') {
      return textResponse(`document.write("${escapeJs(formatQuote(picked))}");`, {
        'Content-Type': 'application/javascript; charset=utf-8',
      });
    }

    // 默认 JSON：保留官方字段，追加分类中文名，方便前端直接展示。
    return jsonResponse({
      ...picked,
      category: requestedCategory === 'cn' ? CHINESE_COLLECTION.name : categoryName(picked.type),
    });
  } catch (error) {
    return jsonResponse({ error: 'API_ERROR', message: error.message }, 500);
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
