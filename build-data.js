import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取 sentences 文件夹中的所有 JSON 并合并为 data/sentences.js。
// 原版只在部署时生成，导致新 clone 的仓库只有 1 条样例；这里让完整结果可被提交进仓库。
function buildSentencesData() {
  const sentencesDir = path.join(__dirname, 'sentences');
  const allSentences = [];

  console.log('开始构建数据文件...');

  if (!fs.existsSync(sentencesDir)) {
    console.error('sentences 文件夹不存在');
    process.exit(1);
  }

  const jsonFiles = fs.readdirSync(sentencesDir).filter((file) => file.endsWith('.json')).sort();

  for (const file of jsonFiles) {
    try {
      const content = fs.readFileSync(path.join(sentencesDir, file), 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        allSentences.push(...parsed);
        console.log(`从 ${file} 加载了 ${parsed.length} 条数据`);
      }
    } catch (error) {
      console.error(`读取文件 ${file} 时出错:`, error.message);
    }
  }

  // 用紧凑 JSON，避免缩进把体积撑大（11279 条缩进后约 4.4MB，紧凑约 3.2MB）。
  const output = `// 自动生成的句子数据文件，由 build-data.js 从 sentences/*.json 合并而来。
// 共 ${allSentences.length} 条。请勿手工编辑，改动 sentences 后重新执行 npm run build。
const sentencesData = ${JSON.stringify(allSentences)};

export function getSentencesData() {
  return sentencesData;
}

export default sentencesData;
`;

  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(path.join(dataDir, 'sentences.js'), output);
  console.log(`成功生成 data/sentences.js，包含 ${allSentences.length} 条数据`);
}

buildSentencesData();
