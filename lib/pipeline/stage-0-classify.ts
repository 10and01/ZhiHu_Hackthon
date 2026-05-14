// ============================================
// Stage 0: 内容分类器
// 轻量快速调用，判断内容是 story 还是 article
// ============================================

import { ContentMode, Stage0Result } from "../types";
import { callLLM } from "./shared";
import { AiProvider } from "../types";

export async function classifyContent(
  content: string,
  apiKey: string,
  provider: AiProvider
): Promise<Stage0Result> {
  const sample = content.slice(0, 800);

  const prompt = `分析以下内容的类型，输出 JSON：
{
  "mode": "story" | "article",
  "confidence": 0-1,
  "genre_hints": ["可能的子类型"],
  "reason": "判断理由（20字内）"
}

判定标准：
- story: 大量第一人称、章节/场景描写、对话引号、角色名、过去时叙事
- article: 第三人称/客观叙述、标题层级、论点/数据、专业术语、现在时论述

内容前800字：
${sample}`;

  try {
    const result = await callLLM(provider, apiKey, prompt, {
      maxTokens: 256,
      temperature: 0.3,
      topP: 0.9,
    });

    const mode = result.mode === "article" ? "article" : "story";
    const confidence = Math.max(0, Math.min(1, result.confidence || 0.8));

    return {
      mode,
      confidence,
      genre_hints: result.genre_hints || [],
      reason: result.reason || "",
    };
  } catch (err) {
    console.warn("[Stage 0] 分类失败，回退到 story:", err);
    return {
      mode: "story",
      confidence: 0.5,
      genre_hints: [],
      reason: "分类失败，默认 story",
    };
  }
}

/**
 * 启发式快速分类（无需 LLM，作为 fallback 或预览）
 */
export function heuristicClassify(content: string): Stage0Result {
  const sample = content.slice(0, 2000);

  // 统计信号
  const dialogueMarks = (sample.match(/[「"'"']/g) || []).length;
  const firstPerson = (sample.match(/[我俺咱]/g) || []).length;
  const pastTense = (sample.match(/[了过呢]/g) || []).length;
  const dataSignals = (sample.match(/(?:研究表明|数据显示|据统计|百分比|%|结论|指出)/g) || []).length;
  const sectionHeaders = (sample.match(/^#{1,3}\s+/gm) || []).length;
  const dataNumbers = (sample.match(/\d+\.?\d*%?/g) || []).length;

  let articleScore = 0;
  let storyScore = 0;

  if (dialogueMarks > 5) storyScore += 2;
  if (firstPerson > 10) storyScore += 2;
  if (pastTense > 15) storyScore += 1;
  if (dataSignals > 3) articleScore += 2;
  if (sectionHeaders > 2) articleScore += 2;
  if (dataNumbers > 8) articleScore += 1;

  const mode: ContentMode = articleScore > storyScore ? "article" : "story";
  const total = articleScore + storyScore || 1;
  const confidence = Math.max(0.5, Math.max(articleScore, storyScore) / total);

  return {
    mode,
    confidence,
    genre_hints: mode === "article" ? ["知识型内容"] : ["叙事型内容"],
    reason: `article信号${articleScore} vs story信号${storyScore}`,
  };
}
