// ============================================
// Pipeline 共享工具
// ============================================

import { AiProvider } from "../types";

export interface ProviderConfig {
  baseUrl: string;
  model: string;
  headers: (apiKey: string) => Record<string, string>;
}

export const PROVIDER_CONFIGS: Record<AiProvider, ProviderConfig> = {
  openai: {
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o",
    headers: (apiKey) => ({
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    }),
  },
  mimo: {
    baseUrl: "https://token-plan-cn.xiaomimimo.com/v1",
    model: "mimo-v2.5-pro",
    headers: (apiKey) => ({
      "api-key": apiKey,
      "Content-Type": "application/json",
    }),
  },
  kimi: {
    baseUrl: "https://api.moonshot.cn/v1",
    model: "kimi-k2.6",
    headers: (apiKey) => ({
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    }),
  },
};

export function getProviderConfig(provider: AiProvider, apiKey?: string): { config: ProviderConfig; key: string } {
  let config = PROVIDER_CONFIGS[provider];
  const key = apiKey || "";
  if (!key) {
    throw new Error(`未配置 ${provider} 的 API Key`);
  }

  // MiMo 支持多种接入方式，优先级：环境变量 > 按 key 前缀推断
  if (provider === "mimo") {
    const customBaseUrl = process.env.MIMO_BASE_URL;
    if (customBaseUrl) {
      // 用户自定义了 baseUrl（如新加坡节点 token-plan-sgp）
      const isTokenPlan = customBaseUrl.includes("token-plan");
      config = {
        baseUrl: customBaseUrl.replace(/\/$/, ""),
        model: "mimo-v2.5-pro",
        headers: (k) => ({
          ...(isTokenPlan
            ? { "api-key": k }
            : { Authorization: `Bearer ${k}` }),
          "Content-Type": "application/json",
        }),
      };
    } else if (key.startsWith("sk-")) {
      // 按量付费：使用 api.xiaomimimo.com + Authorization: Bearer
      config = {
        baseUrl: "https://api.xiaomimimo.com/v1",
        model: "mimo-v2.5-pro",
        headers: (k) => ({
          Authorization: `Bearer ${k}`,
          "Content-Type": "application/json",
        }),
      };
    } else {
      // Token Plan（tp- 开头或默认）：使用 token-plan-cn + api-key header
      config = {
        baseUrl: "https://token-plan-cn.xiaomimimo.com/v1",
        model: "mimo-v2.5-pro",
        headers: (k) => ({
          "api-key": k,
          "Content-Type": "application/json",
        }),
      };
    }
  }

  return { config, key };
}

/**
 * 调用 LLM API，返回 JSON 对象
 */
export async function callLLM(
  provider: AiProvider,
  apiKey: string,
  prompt: string,
  options: { maxTokens?: number; temperature?: number; topP?: number } = {}
): Promise<any> {
  const { config, key } = getProviderConfig(provider, apiKey);
  const { maxTokens = 2048, temperature = 0.8, topP = 0.95 } = options;

  const res = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: config.headers(key),
    body: JSON.stringify({
      model: config.model,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_completion_tokens: maxTokens,
      temperature,
      top_p: topP,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`LLM 调用失败: ${res.status} ${errText}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("LLM 返回空内容");
  }

  try {
    return JSON.parse(content);
  } catch (e) {
    // 尝试从 markdown 代码块中提取 JSON
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    throw new Error(`LLM 返回非 JSON: ${content.slice(0, 200)}`);
  }
}

/**
 * 预处理输入文本：提取元信息，清理 markdown
 *
 * 支持的元信息格式（不区分大小写）：
 * # 标题
 * **作者**: xxx / 作者：xxx
 * **标签**: xxx, yyy / 标签：xxx yyy
 * **章节**: xxx / 章节：xxx
 */
export function preprocessContent(content: string): {
  title: string;
  author: string;
  tags: string[];
  paragraphs: string[];
  bodyText: string;
} {
  // === 第1步：提取元信息（在清理 markdown 之前） ===

  // 提取标题：优先匹配 # 标题 或 **标题** 或 独立的一行
  let title = "";
  const titleMatch = content.match(/^#{1,6}\s*(.+)$/m);
  if (titleMatch) {
    title = titleMatch[1].trim();
  }
  // 如果没有 # 标题，尝试匹配 **标题** 在第一行附近
  if (!title) {
    const boldTitleMatch = content.match(/\*\*([^*\n]{2,30})\*\*[\s]*(?:\n|$)/);
    if (boldTitleMatch) {
      title = boldTitleMatch[1].trim();
    }
  }

  // 提取作者：支持 **作者**: xxx / 作者：xxx / 文/xxx
  let author = "";
  const authorPatterns = [
    /\*\*作者\*\*\s*[:：]\s*([^\n\r]+)/i,
    /(?:^|\n)作者\s*[:：]\s*([^\n\r]+)/i,
    /(?:^|\n)文\s*\/\s*([^\n\r]+)/i,
    /(?:^|\n)作者\s*\/\s*([^\n\r]+)/i,
  ];
  for (const pattern of authorPatterns) {
    const match = content.match(pattern);
    if (match) {
      author = match[1].trim();
      break;
    }
  }

  // 提取标签：支持 **标签**: a, b, c / 标签：a b c
  const tags: string[] = [];
  const tagPatterns = [
    /\*\*标签\*\*\s*[:：]\s*([^\n\r]+)/i,
    /(?:^|\n)标签\s*[:：]\s*([^\n\r]+)/i,
  ];
  for (const pattern of tagPatterns) {
    const match = content.match(pattern);
    if (match) {
      const raw = match[1].trim();
      // 按逗号、顿号、空格分隔
      const splitTags = raw.split(/[,，、\s]+/).map((t) => t.trim()).filter((t) => t.length > 0);
      tags.push(...splitTags);
      break;
    }
  }
  // 如果没有显式标签，尝试匹配 #tag 格式（但要排除 markdown 标题）
  if (tags.length === 0) {
    const hashTagMatches = content.match(/(?:^|\s)#([^#\s\n,，]+)/g);
    if (hashTagMatches) {
      hashTagMatches.forEach((t) => {
        const tag = t.trim().replace("#", "");
        if (tag.length > 0 && tag.length < 15) tags.push(tag);
      });
    }
  }

  // 提取章节：支持 **章节**: xxx
  let chapter = "";
  const chapterMatch = content.match(/\*\*章节\*\*\s*[:：]\s*([^\n\r]+)/i);
  if (chapterMatch) {
    chapter = chapterMatch[1].trim();
  }

  // === 第2步：清理 markdown，准备正文 ===
  let cleaned = content
    .replace(/^---[\s\S]*?---/m, "") // YAML frontmatter
    .replace(/!\[.*?\]\(.*?\)/g, "") // 图片
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // 链接
    .replace(/`{1,3}[^`]*`/g, (m) => m.replace(/`/g, "")) // 行内代码
    .replace(/^\s*[-*+]\s+/gm, "") // 列表标记
    .replace(/^#{1,6}\s*/gm, "") // 标题标记
    .replace(/\*\*|__/g, "") // 粗体
    .replace(/\*|_/g, "") // 斜体
    .replace(/^>\s*/gm, "") // 引用
    .trim();

  const paragraphs = cleaned
    .split(/\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  // === 第3步：回退提取 ===
  if (!title && paragraphs.length > 0) {
    // 第一行如果较短且像标题，用它
    const first = paragraphs[0];
    if (first.length <= 50 && !/[。，！？；：]/.test(first)) {
      title = first;
      paragraphs.shift();
    }
  }
  if (!title) {
    title = "未命名作品";
  }
  if (!author) {
    author = "未知作者";
  }

  // 如果提取到了章节但标题为空，用章节作为标题
  if (chapter && title === "未命名作品") {
    title = chapter;
  }

  const bodyText = paragraphs.join("\n");

  return { title, author, tags, paragraphs, bodyText };
}

/**
 * HTML 转义，防止 XSS
 */
export function escapeHtml(text: string): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * 生成默认情绪曲线
 */
export function generateDefaultEmotionCurve() {
  return [
    { position: 0, intensity: 0.3, valence: 0, arousal: 0.4, emotion: "calm" },
    { position: 20, intensity: 0.5, valence: -0.2, arousal: 0.6, emotion: "unease" },
    { position: 40, intensity: 0.7, valence: -0.4, arousal: 0.7, emotion: "tension" },
    { position: 60, intensity: 0.9, valence: -0.6, arousal: 0.9, emotion: "fear" },
    { position: 80, intensity: 0.6, valence: -0.3, arousal: 0.5, emotion: "aftermath" },
    { position: 100, intensity: 0.4, valence: 0, arousal: 0.3, emotion: "calm" },
  ];
}
