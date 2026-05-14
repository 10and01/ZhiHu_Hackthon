// ============================================
// Stage 2: 风格 DNA 生成
// LLM 动态生成独特风格，预设库作为 fallback
// ============================================

import { AiProvider, ContentMode, Stage1Result, StyleDNA } from "../types";
import { callLLM } from "./shared";
import { getStylePresetByGenre } from "../style-presets";

export async function generateStyleDNA(
  stage1: Stage1Result,
  _apiKey: string,
  _provider: AiProvider
): Promise<StyleDNA> {
  // 生产环境跳过 LLM 风格生成，直接使用本地预设（避免 serverless 超时）
  // 如需动态风格，可在本地开发时通过环境变量启用
  if (process.env.NODE_ENV === "production" || process.env.SKIP_STYLE_LLM === "true") {
    console.log("[Stage 2] 使用本地预设风格（跳过 LLM）");
    return fallbackDNA(stage1);
  }

  try {
    const prompt = buildStylePrompt(stage1);
    const result = await callLLM(_provider, _apiKey, prompt, {
      maxTokens: 1024,
      temperature: 0.9,
      topP: 0.95,
    });

    const dna = parseStyleDNA(result);
    if (dna && isValidDNA(dna)) {
      return dna;
    }
    throw new Error("生成的 DNA 格式不完整");
  } catch (err) {
    console.warn("[Stage 2] 动态风格生成失败，回退到预设:", err);
    return fallbackDNA(stage1);
  }
}

function buildStylePrompt(stage1: Stage1Result): string {
  const isStory = stage1.mode === "story";
  const meta = stage1.meta;
  const theme = isStory ? (stage1 as any).theme || meta.theme : meta.title;
  const genre = isStory ? (stage1 as any).genre || "综合" : (stage1 as any).category || "综合";

  // 计算主导情绪
  let dominantEmotion = "中性";
  if (isStory && (stage1 as any).emotion_curve) {
    const curve = (stage1 as any).emotion_curve as any[];
    if (curve.length > 0) {
      const avgValence = curve.reduce((s, k) => s + k.valence, 0) / curve.length;
      const avgArousal = curve.reduce((s, k) => s + k.arousal, 0) / curve.length;
      if (avgValence < -0.3 && avgArousal > 0.6) dominantEmotion = "紧张/恐惧";
      else if (avgValence < -0.3) dominantEmotion = "悲伤/压抑";
      else if (avgValence > 0.3 && avgArousal > 0.6) dominantEmotion = "兴奋/喜悦";
      else if (avgValence > 0.3) dominantEmotion = "温暖/治愈";
      else if (avgArousal > 0.6) dominantEmotion = "激烈/动荡";
      else dominantEmotion = "平静/沉思";
    }
  }

  return `基于以下内容和分析结果，生成独特的视觉风格 DNA。

内容类型：${isStory ? "故事" : "文章"}
主题：${theme}
分类/类型：${genre}
情绪基调：${dominantEmotion}

要求：
1. color_scheme 必须根据内容和情绪原创，不要套用固定模板
2. typography 选择适合内容气质的 Google Fonts 字体
3. texture 描述具体的前端可实现效果
4. voice_design_prompt 描述适合朗读的声音特质

示例（仅供参考，不要复制）：
- 悬疑故事 → 暗紫 #0D0221 + 霓虹粉 #FF2A6D + 噪点纹理
- 科普文章 → 冷白 #F8FAFC + 科技蓝 #0EA5E9 + 网格纹理
- 历史演义 → 赭石 #451A03 + 古金 #D97706 + 纸张纹理

输出 JSON：
{
  "name": "创意命名（4-6字）",
  "description": "50字内描述",
  "color_scheme": {
    "primary": "#hex",
    "secondary": "#hex",
    "bg": "#hex",
    "bg_gradient": ["#hex", "#hex", "#hex"],
    "text": "#hex",
    "accent": "#hex"
  },
  "typography": {
    "heading": "'Google Font', serif",
    "body": "'Google Font', sans-serif",
    "special": "'Google Font', cursive"
  },
  "texture": "具体纹理描述",
  "mood_keywords": ["关键词1", "关键词2", "关键词3"],
  "voice_design_prompt": "声音描述"
}`;
}

function parseStyleDNA(raw: any): StyleDNA | null {
  if (!raw || !raw.color_scheme) return null;

  return {
    name: raw.name || "未命名风格",
    description: raw.description || "",
    color_scheme: {
      primary: raw.color_scheme.primary || "#3B82F6",
      secondary: raw.color_scheme.secondary || "#6366F1",
      bg: raw.color_scheme.bg || "#0F172A",
      bg_gradient: raw.color_scheme.bg_gradient || ["#0F172A", "#1E293B"],
      text: raw.color_scheme.text || "#E2E8F0",
      accent: raw.color_scheme.accent || "#22D3EE",
    },
    typography: {
      heading: raw.typography?.heading || "'Noto Serif SC', serif",
      body: raw.typography?.body || "'Noto Sans SC', sans-serif",
      special: raw.typography?.special || "'ZCOOL XiaoWei', serif",
    },
    texture: raw.texture || "subtle_noise",
    mood_keywords: raw.mood_keywords || ["沉浸"],
    voice_design_prompt: raw.voice_design_prompt || "一个平稳清晰的声音",
  };
}

function isValidDNA(dna: StyleDNA): boolean {
  const cs = dna.color_scheme;
  const hexPattern = /^#[0-9A-Fa-f]{6}$/;
  return (
    hexPattern.test(cs.primary) &&
    hexPattern.test(cs.secondary) &&
    hexPattern.test(cs.bg) &&
    hexPattern.test(cs.text) &&
    hexPattern.test(cs.accent) &&
    cs.bg_gradient.length >= 2
  );
}

function fallbackDNA(stage1: Stage1Result): StyleDNA {
  const isStory = stage1.mode === "story";
  const genre = isStory ? (stage1 as any).genre || "悬疑" : (stage1 as any).category || "综合";

  const preset = getStylePresetByGenre(genre);
  return preset.dna;
}
