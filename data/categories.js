// 本文件为 apanzinc 在 welyfun/api-hitokoto（AGPL-3.0）基础上新增，非原作品内容。
// Added by apanzinc <apanzinc@outlook.com>, 2026-11-21。详见仓库根目录 NOTICE。
//
// 分类元数据：对齐官方 sentences-bundle 的 categories.json，并补充中文检索别名。
// key 是官方分类码，name 是中文名，aliases 是可被 URL 参数 c 识别的写法。

export const CATEGORIES = [
  { key: 'a', name: '动画', aliases: ['a', 'anime', '动画'] },
  { key: 'b', name: '漫画', aliases: ['b', 'comic', '漫画'] },
  { key: 'c', name: '游戏', aliases: ['c', 'game', '游戏'] },
  { key: 'd', name: '文学', aliases: ['d', 'literature', '文学'] },
  { key: 'e', name: '原创', aliases: ['e', 'original', '原创'] },
  { key: 'f', name: '网络', aliases: ['f', 'internet', '网络'] },
  { key: 'g', name: '其他', aliases: ['g', 'other', '其他'] },
  { key: 'h', name: '影视', aliases: ['h', 'video', '影视'] },
  { key: 'i', name: '诗词', aliases: ['i', 'poem', 'poetry', '诗词', '古诗', '名言'] },
  { key: 'j', name: '网易云', aliases: ['j', 'ncm', 'netease', '网易云'] },
  { key: 'k', name: '哲学', aliases: ['k', 'philosophy', '哲学'] },
  { key: 'l', name: '抖机灵', aliases: ['l', 'funny', '抖机灵'] },
]

// 中国名言名句合集：以官方「诗词」分类（i）为底，API 运行时再过滤空作者和
// 占位作者，只保留有明确中文作者和出处的 683 条。c=cn 或 c=中国 走这个合集。
export const CHINESE_COLLECTION = {
  key: 'cn',
  name: '中国名言名句',
  types: ['i'],
}

const aliasIndex = new Map()
for (const cat of CATEGORIES) {
  for (const alias of cat.aliases) {
    aliasIndex.set(alias.toLowerCase(), cat.key)
  }
}
aliasIndex.set('cn', 'cn')
aliasIndex.set('中国', 'cn')
aliasIndex.set('china', 'cn')

// 把 URL 传入的分类写法归一化为内部 key。未知值返回 null。
export function resolveCategory(input) {
  if (!input) return null
  return aliasIndex.get(String(input).trim().toLowerCase()) ?? null
}

export function categoryName(key) {
  if (key === 'cn') return CHINESE_COLLECTION.name
  return CATEGORIES.find((item) => item.key === key)?.name ?? null
}
