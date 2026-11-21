# 一言 API（Cloudflare Pages）

基于 Cloudflare Pages 的随机一言接口，内置一言开源社区官方完整词库（11279 条，12 个分类），返回格式与官方 API 兼容，并针对中国名言名句做了专项优化。

词库来源：[hitokoto-osc/sentences-bundle](https://github.com/hitokoto-osc/sentences-bundle)，每天由 GitHub Actions 自动同步更新。本仓库按 AGPL-3.0 授权。

## 快速调用

```
GET /api
```

```
curl "https://你的域名/api"
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

## 中国名言名句

`c=cn`（或 `c=中国`、`c=china`）进入中国名言名句合集，对应官方「诗词」分类，收录 755 条中国古典诗词，全部有明确作者和出处，不含译作。

```
curl "https://你的域名/api?c=cn"
```

配合 `author` 按作者筛选，例如取苏轼的词：

```
curl "https://你的域名/api?c=cn&author=苏轼"
```

也可以按出处取句：

```
curl "https://你的域名/api?c=cn&from=滕王阁序"
```

想要直接可读的「句子 —— 作者《出处》」排版，用 `format=quote`：

```
curl "https://你的域名/api?c=cn&format=quote"
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
| `id` | — | 按 id 精确查询单条 |
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
| cn | 中国名言名句 | 中国、china（等价于 i） |

示例：

```
curl "https://你的域名/api?c=诗词&min_length=10&max_length=20"
curl "https://你的域名/api?c=k&q=人生"
curl "https://你的域名/api?q=明月&format=text"
```

错误响应统一为 JSON，带 `error` 和 `message` 字段：

| 状态码 | error | 含义 |
|--------|-------|------|
| 400 | `INVALID_CATEGORY` | 分类不存在，响应里带合法分类列表 |
| 400 | `INVALID_FORMAT` | 输出格式不支持 |
| 404 | `NOT_FOUND` | id 不存在 |
| 404 | `NO_MATCH` | 筛选条件无结果 |
| 500 | `API_ERROR` | 服务端异常 |

接口开启 CORS（`Access-Control-Allow-Origin: *`），支持 `OPTIONS` 预检，响应带 `Cache-Control: public, max-age=60`，前端可直接调用。

## 部署到 Cloudflare Pages

1. Fork 本仓库。
2. 进入 Cloudflare Dashboard → Workers 和 Pages → 创建 → Pages → 连接到 Git，选择你 fork 的仓库。
3. 构建设置：
   - 构建命令：`npm run build`
   - 输出目录：`/`
4. 保存并部署。部署产物在 `api/*` 路径下，根路径是演示页。
5. 可选：在仓库 Actions 页启用 `Sync Sentences from sentences-bundle`，启用后每天 03:00 UTC 自动从官方词库同步并触发重新部署。fork 后该工作流默认关闭，需手动启用。
6. 可选：在 Pages 项目设置里绑定自定义域名。

本地开发：

```bash
npm install
npm run build      # 重新生成 data/sentences.js
npx wrangler pages dev .
```

## 数据说明

- `sentences/`：官方词库原始 JSON，12 个分类，由 Actions 自动同步，请勿手工改。
- `data/sentences.js`：构建产物，完整 11279 条，已提交进仓库，所以即使不跑构建也能直接用。
- `data/categories.js`：分类元数据与中文别名映射。
- `functions/api/[[path]].js`：API 实现。

## 协议与致谢

本程序采用 AGPL-3.0。若修改代码并对外提供服务，需公开你的修改版本。语句数据版权归原作者所有，来源为 [一言](https://hitokoto.cn/) 与 [句子包](https://sentences-bundle.hitokoto.cn/)。
