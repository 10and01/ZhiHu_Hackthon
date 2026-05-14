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
  const sampleText = bodyText.slice(0, 2500);

  const prompt = `你是一位资深文学分析师和视觉导演。请分析以下故事，输出严格的 JSON。

## 故事信息
- 标题：${title}
- 总字数：约 ${wordCount} 字
- 总段落数：${paragraphs.length} 段

## 分析维度

### 1. 元信息
- title: 故事标题
- author: 作者（如未知则填"未知"）
- genre: 从 [悬疑, 惊悚, 犯罪, 现实情感, 家庭, 玄幻奇幻, 科幻, 历史, 言情, 宫斗, 医疗, 纪实, 战争, 励志] 中选择最匹配的 1-2 个
- theme: 用一句话概括核心主题
- estimated_reading_time: 预计阅读分钟数

### 2. 角色档案（characters）
提取 1-5 个主要角色，每个角色包含：
- id: 英文标识符（如 protagonist, antagonist, char_1）
- name: 角色名
- role: protagonist / antagonist / supporting / emotional_anchor
- traits: 3 个性格关键词
- arc: 角色弧线（20字内）
- visual_symbol: 一个视觉符号
- color: 专属色（hex）

### 3. 章节节拍（chapters）
将故事划分为 3-6 个章节，每章包含：
- index: 序号（从 1 开始）
- title: 章节标题
- type: setup / escalation / climax / resolution / twist
- start_para: 起始段落索引（从 0 开始）
- end_para: 结束段落索引（从 0 开始）
- emotion_summary: { dominant, intensity: 0-1, valence: -1~1, arousal: 0-1 }
- key_moment: 关键事件描述（20字内）

### 4. 情绪曲线（emotion_curve）
在 0-100% 的故事进度上选取 7-10 个关键帧：
- position: 0-100, intensity: 0-1, valence: -1~1, arousal: 0-1, emotion: 具体情绪名称

### 5. 对话标注（dialogue_segments）
对关键段落进行对话/叙述标注，每个包含：
- paragraph_idx: 段落索引
- speaker: 角色名或"叙述"
- speaker_id: 匹配 characters 中的 id
- type: spoken / thought / narration / description
- text: 该段落的关键句（30字内）
- emotion: 该句的情绪标签

## 输出格式
严格输出 JSON，不要任何解释文字。

故事内容（前 2500 字）：
${sampleText}`;

  const raw = await callLLM(provider, apiKey, prompt, {
    maxTokens: 2048,
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
  const sampleText = bodyText.slice(0, 3000);

  const prompt = `你是一位资深内容架构师和数据可视化专家。请分析以下文章，输出严格的 JSON。

## 文章信息
- 标题：${title}
- 总字数：约 ${wordCount} 字
- 总段落数：${paragraphs.length} 段

## 分析维度

### 1. 元信息
- title: 文章标题
- author: 作者（如未知则填"未知"）
- category: 文章分类（如：科技、商业、历史、科普、教程、观点等）
- abstract: 摘要（50字内）
- reading_time: 预计阅读分钟数

### 2. 章节结构（sections）
将文章划分为 3-8 个章节，每章包含：
- index: 序号
- title: 章节标题
- type: introduction / body / conclusion / appendix
- key_points: 要点列表（2-4条）
- importance: 0-1 重要度
- start_para: 起始段落索引
- end_para: 结束段落索引

### 3. 关键概念（concepts）
提取 3-10 个专业概念，每个包含：
- term: 概念名称
- explanation: 简明解释（30字内）
- first_appearance_para: 首次出现段落索引
- complexity: beginner / intermediate / advanced

### 4. 数据点（data_points）
提取文章中的关键数据和事实：
- value: 数据值（如"85%"）
- context: 上下文说明
- source: 来源（如有）
- paragraph_idx: 所在段落索引

### 5. 可视化建议（visualization_suggestions）
为适合可视化的内容提出建议，type 可选：
- flowchart: 流程/步骤
- figure_sheet: 概念/结构图解
- module_map: 模块关系/层级
- animation_sandbox: 动态过程

每个建议包含：
- type: 图表类型
- title: 图表标题
- target_section: 对应章节索引
- reason: 建议理由
- data: 结构化数据（nodes/edges/components等）

## 输出格式
严格输出 JSON，不要任何解释文字。

文章内容（前 3000 字）：
${sampleText}`;

  const raw = await callLLM(provider, apiKey, prompt, {
    maxTokens: 2048,
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
