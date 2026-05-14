// ============================================
// Stage 1: 内容结构化分析
// 根据 mode 选择 story 分支或 article 分支
// ============================================

import {
  AiProvider,
  ContentMode,
  StoryAnalysis,
  ArticleAnalysis,
  Chapter,
  ArticleSection,
  DialogueSegment,
  EmotionKeyframe,
} from "../types";
import { callLLM, preprocessContent, generateDefaultEmotionCurve } from "./shared";

export async function analyzeContent(
  content: string,
  mode: ContentMode,
  apiKey: string,
  provider: AiProvider
): Promise<StoryAnalysis | ArticleAnalysis> {
  if (mode === "article") {
    return analyzeArticle(content, apiKey, provider);
  }
  return analyzeStory(content, apiKey, provider);
}

// ============================================
// Story 分支
// ============================================

async function analyzeStory(
  content: string,
  apiKey: string,
  provider: AiProvider
): Promise<StoryAnalysis> {
  const { title, author, paragraphs, bodyText } = preprocessContent(content);
  const wordCount = bodyText.length;
  const sampleText = bodyText.slice(0, 1500);

  const prompt = `分析以下故事，输出JSON。字段：
- meta: {title, author, genre(悬疑/现实/科幻/历史/言情/医疗/纪实), theme(一句话), estimated_reading_time}
- characters: [{id, name, role(protagonist/antagonist/supporting), traits(3个), color(hex)}] 1-3个
- chapters: [{index, title, type(setup/escalation/climax/resolution), start_para, end_para, emotion_summary:{dominant,intensity,valence,arousal}}] 3-4个
- emotion_curve: [{position,intensity,valence,arousal,emotion}] 5-7个

内容（前1500字）：
${sampleText}`;

  const raw = await callLLM(provider, apiKey, prompt, {
    maxTokens: 1536,
    temperature: 0.8,
    topP: 0.95,
  });

  const chapters: Chapter[] = buildChapters(raw.chapters || [], paragraphs);

  return {
    mode: "story",
    meta: {
      title: raw.title || title,
      author: raw.author || author,
      genre: raw.genre || "悬疑",
      theme: raw.theme || "未知主题",
      estimated_reading_time: raw.estimated_reading_time || Math.ceil(paragraphs.length / 20),
      total_word_count: wordCount,
    },
    characters: (raw.characters || []).map((c: any, i: number) => ({
      id: c.id || `char_${i}`,
      name: c.name || `角色${i + 1}`,
      role: c.role || "supporting",
      traits: c.traits || [],
      arc: c.arc || "",
      visual_symbol: c.visual_symbol || "",
      color: c.color || "#94A3B8",
      emoji: c.emoji || "👤",
    })),
    chapters,
    emotion_curve: (raw.emotion_curve || generateDefaultEmotionCurve()) as EmotionKeyframe[],
    dialogue_segments: (raw.dialogue_segments || []) as DialogueSegment[],
  };
}

function buildChapters(rawChapters: any[], allParagraphs: string[]): Chapter[] {
  return rawChapters.map((c, i) => {
    const start = Math.max(0, c.start_para || 0);
    const end = Math.min(allParagraphs.length - 1, c.end_para || allParagraphs.length - 1);

    return {
      index: c.index || i + 1,
      title: c.title || `第${i + 1}章`,
      type: c.type || "setup",
      start_para: start,
      end_para: end,
      emotion_summary: {
        dominant: c.emotion_summary?.dominant || "neutral",
        intensity: c.emotion_summary?.intensity || 0.5,
        valence: c.emotion_summary?.valence || 0,
        arousal: c.emotion_summary?.arousal || 0.5,
      },
      key_moment: c.key_moment || "",
      paragraphs: allParagraphs.slice(start, end + 1),
    };
  });
}

// ============================================
// Article 分支
// ============================================

async function analyzeArticle(
  content: string,
  apiKey: string,
  provider: AiProvider
): Promise<ArticleAnalysis> {
  const { title, author, paragraphs, bodyText } = preprocessContent(content);
  const wordCount = bodyText.length;
  const sampleText = bodyText.slice(0, 1500);

  const prompt = `分析以下文章，输出JSON。字段：
- meta: {title, author, category(科技/商业/历史/科普/教程/观点), abstract(50字), reading_time}
- sections: [{index, title, type(introduction/body/conclusion), key_points(2-3条), importance, start_para, end_para}] 3-5个
- concepts: [{term, explanation(20字), complexity}] 3-5个
- data_points: [{value, context, paragraph_idx}] 3-5个

内容（前1500字）：
${sampleText}`;

  const raw = await callLLM(provider, apiKey, prompt, {
    maxTokens: 1536,
    temperature: 0.7,
    topP: 0.95,
  });

  const sections: ArticleSection[] = buildArticleSections(raw.sections || [], paragraphs);

  return {
    mode: "article",
    meta: {
      title: raw.title || title,
      author: raw.author || author,
      category: raw.category || "综合",
      abstract: raw.abstract || "",
      reading_time: raw.reading_time || Math.ceil(paragraphs.length / 25),
      total_word_count: wordCount,
    },
    sections,
    concepts: (raw.concepts || []).map((c: any, i: number) => ({
      term: c.term || `概念${i + 1}`,
      explanation: c.explanation || "",
      first_appearance_para: c.first_appearance_para || 0,
      complexity: c.complexity || "intermediate",
    })),
    data_points: (raw.data_points || []).map((d: any) => ({
      value: d.value || "",
      context: d.context || "",
      source: d.source || "",
      paragraph_idx: d.paragraph_idx || 0,
    })),
    visualization_suggestions: (raw.visualization_suggestions || []).map((v: any) => ({
      type: v.type || "flowchart",
      title: v.title || "",
      target_section: v.target_section || 0,
      reason: v.reason || "",
      data: v.data || {},
    })),
  };
}

function buildArticleSections(rawSections: any[], allParagraphs: string[]): ArticleSection[] {
  return rawSections.map((s, i) => {
    const start = Math.max(0, s.start_para || 0);
    const end = Math.min(allParagraphs.length - 1, s.end_para || allParagraphs.length - 1);

    return {
      index: s.index || i + 1,
      title: s.title || `第${i + 1}节`,
      type: s.type || "body",
      key_points: s.key_points || [],
      importance: Math.max(0, Math.min(1, s.importance || 0.5)),
      start_para: start,
      end_para: end,
      paragraphs: allParagraphs.slice(start, end + 1),
    };
  });
}
