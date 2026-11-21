# 一言 API（Cloudflare Workers）

基于 Cloudflare Workers 的随机一言接口，内置一言开源社区官方完整词库（11279 条，12 个分类），返回格式与官方 API 兼容，并针对中国名言名句做了专项优化。

线上地址：<https://hitokoto.apanzinc.top>

可直接点开看效果：[中国名言名句 · quote 格式](https://hitokoto.apanzinc.top/api?c=cn&format=quote)

备用 Workers 地址：<https://api-hitokoto.pangzsopan.workers.dev>（国内访问可能较慢）

词库来源：[hitokoto-osc/sentences-bundle](https://github.com/hitokoto-osc/sentences-bundle)。本仓库按 AGPL-3.0 授权。

> **修改声明（AGPL-3.0 §5(a)）**
> 本仓库是 [welyfun/api-hitokoto](https://github.com/welyfun/api-hitokoto) 的修改版本，
> 修改者 apanzinc，修改日期 2026-11-21。修改过的文件、修改内容摘要和新增文件清单见
> [NOTICE](NOTICE)。原作品版权归 welyfun and contributors 所有。

## 快速调用

```
GET /api
```

```
curl "https://hitokoto.apanzinc.top/api"
```

返回官方格式的 JSON，并额外附带 `category` 中文分类名：

```json
{
  "id": 1263,
  "uuid": "a58936ac-f3fb-4e5d-838e-a77a7219d1a4",
  "hitokoto": "渔舟唱晚，响穷彭蠡之滨；雁阵惊寒，声断衡阳之浦。",
  "type": "i",
  "from": "滕王阁序",
  "from_who": "王勃",
  "category": "诗词"
}
```

根路径 `/` 是一个简易说明页，接口地址是 `/api`，其它路径返回 404 JSON。

## 中国名言名句

`c=cn`（或 `c=中国`、`c=china`）进入中国名言名句合集，以官方「诗词」分类为底，过滤空作者和占位作者后保留 683 条有明确中文作者和出处的中国古典诗词。`c=cn` 时返回的 `category` 为「中国名言名句」，句子本身的 `type` 仍是官方分类码 `i`。

```
curl "https://hitokoto.apanzinc.top/api?c=cn"
```

配合 `author` 按作者筛选，例如取苏轼的词：

```
curl "https://hitokoto.apanzinc.top/api?c=cn&author=苏轼"
```

也可以按出处取句：

```
curl "https://hitokoto.apanzinc.top/api?c=cn&from=滕王阁序"
```

想要直接可读的「句子 —— 作者《出处》」排版，用 `format=quote`：

```
curl "https://hitokoto.apanzinc.top/api?c=cn&format=quote"
```

```
落霞与孤鹜齐飞，秋水共长天一色。 —— 王勃 《滕王阁序》
```

## 请求参数

所有参数均为可选，可任意组合。

| 参数 | 别名 | 说明 |
|------|------|------|
| `c` | `type` | 分类筛选，支持分类码、中文名或英文别名，见下表 |
| `author` | `from_who` | 按作者模糊匹配，如 `苏轼` |
| `from` | — | 按出处模糊匹配，如 `滕王阁序` |
| `q` | `keyword` | 在句子、作者、出处中全文搜索 |
| `min_length` | — | 句子最小字数（含） |
| `max_length` | — | 句子最大字数（含） |
| `id` | — | 按 id 精确查询单条，传了 `id` 时忽略其它筛选参数 |
| `format` | `encode` | 输出格式：`json`（默认）、`text`、`quote`、`js` |

`format` 取值说明：

- `json`：官方格式 JSON，额外带 `category`
- `text`：只返回句子正文
- `quote`：句子 —— 作者《出处》，纯文本
- `js`：`document.write("句子 —— 作者《出处》");`

## 分类一览

| 码 | 中文名 | 可用别名 |
|----|--------|----------|
| a | 动画 | anime |
| b | 漫画 | comic |
| c | 游戏 | game |
| d | 文学 | literature |
| e | 原创 | original |
| f | 网络 | internet |
| g | 其他 | other |
| h | 影视 | video |
| i | 诗词 | poem、poetry、诗词、古诗、名言 |
| j | 网易云 | ncm、netease、网易云 |
| k | 哲学 | philosophy、哲学 |
| l | 抖机灵 | funny、抖机灵 |
| cn | 中国名言名句 | 中国、china（从 i 类诗词中筛选） |

示例：

```
curl "https://hitokoto.apanzinc.top/api?c=诗词&min_length=10&max_length=20"
curl "https://hitokoto.apanzinc.top/api?c=k&q=人生"
curl "https://hitokoto.apanzinc.top/api?q=明月&format=text"
```

错误响应统一为 JSON，带 `error` 和 `message` 字段：

| 状态码 | error | 含义 |
|--------|-------|------|
| 400 | `INVALID_CATEGORY` | 分类不存在，响应里带合法分类列表 |
| 400 | `INVALID_FORMAT` | 输出格式不支持 |
| 404 | `NOT_FOUND` | id 不存在或路径不存在 |
| 404 | `NO_MATCH` | 筛选条件无结果 |
| 405 | — | 接口只支持 GET 和 OPTIONS |
| 500 | `API_ERROR` | 服务端异常 |

接口开启 CORS（`Access-Control-Allow-Origin: *`），支持 `OPTIONS` 预检，响应带 `Cache-Control: public, max-age=60`，前端可直接调用。

## 部署到 Cloudflare Workers

本项目是标准 Workers 结构，支持 Workers Builds 从 GitHub 自动部署。

1. Fork 本仓库。
2. 进入 Cloudflare Dashboard → Workers 和 Pages → 创建应用程序 → Continue with GitHub。
3. 选择你 fork 的仓库，配置保持默认即可：
   - 项目名称：`api-hitokoto`
   - 构建命令：`npm run build`
   - 部署命令：`npx wrangler deploy`
   - 根目录：`/`
4. 点部署，完成后 Cloudflare 会分配 `<项目名>.<子域>.workers.dev`。
5. 国内使用建议在 Worker 的「域」页绑定自定义域名，例如 `hitokoto.apanzinc.top`。
6. 可选：在仓库 Actions 页启用 `Sync Sentences from sentences-bundle`。fork 后工作流默认关闭，启用后每天 03:00 UTC 从官方词库同步并触发重新部署。

本地开发：

```bash
npm install
npm run build      # 重新生成 data/sentences.js
npx wrangler dev   # 本地监听 8787
```

## 数据说明

- `sentences/`：官方词库原始 JSON，12 个分类，由 Actions 自动同步，请勿手工改。
- `data/sentences.js`：构建产物，完整 11279 条，已提交进仓库，不跑构建也能直接用。
- `data/categories.js`：分类元数据与中文别名映射。
- `functions/api/[[path]].js`：API 实现，Workers 与本地共用同一套筛选逻辑。
- `worker.js`：Workers 入口，把 `/api` 路由到 API，根路径返回说明页。
- `wrangler.toml`：Workers 部署配置。

## 协议与致谢

本程序采用 AGPL-3.0。若修改代码并对外提供服务，需公开你的修改版本。语句数据版权归原作者所有，来源为 [一言](https://hitokoto.cn/) 与 [句子包](https://sentences-bundle.hitokoto.cn/)。

原作品：[welyfun/api-hitokoto](https://github.com/welyfun/api-hitokoto)，Copyright (C) welyfun and contributors，AGPL-3.0。本仓库对其作了修改，修改文件清单、修改内容与日期记录在 [NOTICE](NOTICE)；按 AGPL-3.0 §5 要求，各修改过的源文件头部也带有修改声明。本程序不提供任何担保。完整许可证文本见 [LICENSE](LICENSE)。
