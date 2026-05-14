// ============================================
// 知乎故事重塑工坊 —— 核心类型定义 v3.0
// 支持 Story 模式和 Article 模式双分支
// ============================================

export type AiProvider = "openai" | "mimo" | "kimi";
export type ContentMode = "story" | "article";

export interface GenerateResult {
  htmlCode: string;
  metaJson: StoryMeta | ArticleMeta;
  storyScript?: StoryScript;
  articleScript?: ArticleScript;
  sceneList: Scene[];
  ttsUrls?: Record<string, string>;
  mode: ContentMode;
}

// ============================================
// Pipeline 缓存
// ============================================

export interface PipelineCache {
  stage0: Stage0Result;
  stage1: Stage1Result;
  stage2: StyleDNA;
  timestamp: number;
}

export interface Stage0Result {
  mode: ContentMode;
  confidence: number;
  genre_hints: string[];
  reason: string;
}

export type Stage1Result = StoryAnalysis | ArticleAnalysis;

// ============================================
// Stage 1: Story 模式分析输出
// ============================================

export interface StoryAnalysis {
  mode: "story";
  meta: StoryMeta;
  characters: Character[];
  chapters: Chapter[];
  emotion_curve: EmotionKeyframe[];
  dialogue_segments: DialogueSegment[];
}

export interface StoryMeta {
  title: string;
  author: string;
  genre: string;
  theme: string;
  estimated_reading_time: number;
  total_word_count: number;
}

export interface Character {
  id: string;
  name: string;
  role: "protagonist" | "antagonist" | "supporting" | "emotional_anchor";
  traits: string[];
  arc: string;
  visual_symbol: string;
  color: string;
  emoji?: string;
}

export interface Chapter {
  index: number;
  title: string;
  type: "setup" | "escalation" | "climax" | "resolution" | "twist";
  start_para: number;
  end_para: number;
  emotion_summary: {
    dominant: string;
    intensity: number;
    valence: number;
    arousal: number;
  };
  key_moment: string;
  paragraphs: string[];
}

export interface EmotionKeyframe {
  position: number;
  intensity: number;
  valence: number;
  arousal: number;
  emotion: string;
}

export interface DialogueSegment {
  paragraph_idx: number;
  speaker: string;
  speaker_id: string;
  type: "spoken" | "thought" | "narration" | "description";
  text: string;
  emotion: string;
}

// ============================================
// Stage 1: Article 模式分析输出
// ============================================

export interface ArticleAnalysis {
  mode: "article";
  meta: ArticleMeta;
  sections: ArticleSection[];
  concepts: ArticleConcept[];
  data_points: ArticleDataPoint[];
  visualization_suggestions: VisualizationSuggestion[];
}

export interface ArticleMeta {
  title: string;
  author: string;
  category: string;
  abstract: string;
  reading_time: number;
  total_word_count: number;
  theme?: string;
}

export interface ArticleSection {
  index: number;
  title: string;
  type: "introduction" | "body" | "conclusion" | "appendix";
  key_points: string[];
  importance: number;
  start_para: number;
  end_para: number;
  paragraphs: string[];
}

export interface ArticleConcept {
  term: string;
  explanation: string;
  first_appearance_para: number;
  complexity: "beginner" | "intermediate" | "advanced";
}

export interface ArticleDataPoint {
  value: string;
  context: string;
  source?: string;
  paragraph_idx: number;
}

export type VisualizationType = "flowchart" | "figure_sheet" | "module_map" | "animation_sandbox";

export interface VisualizationSuggestion {
  type: VisualizationType;
  title: string;
  target_section: number;
  reason: string;
  data: FlowchartData | FigureSheetData | ModuleMapData | AnimationSandboxData;
}

export interface FlowchartData {
  nodes: { id: string; label: string; x?: number; y?: number; shape?: string }[];
  edges: { from: string; to: string; label?: string }[];
  annotations?: Record<string, string>;
}

export interface FigureSheetData {
  components: { id: string; label: string; description?: string }[];
  connections?: { from: string; to: string; style?: string }[];
}

export interface ModuleMapData {
  root: { id: string; label: string };
  modules: { id: string; label: string; parent?: string; level?: number }[];
  connections?: { from: string; to: string }[];
}

export interface AnimationSandboxData {
  animation_type: string;
  steps: { caption: string; duration?: number }[];
  initial_state?: Record<string, any>;
}

// ============================================
// Stage 2: 风格 DNA（Story 和 Article 共用）
// ============================================

export interface StyleDNA {
  name: string;
  description: string;
  reference?: string;
  color_scheme: {
    primary: string;
    secondary: string;
    bg: string;
    bg_gradient: string[];
    text: string;
    accent: string;
  };
  typography: {
    heading: string;
    body: string;
    special: string;
  };
  texture: string;
  mood_keywords: string[];
  voice_design_prompt?: string;
}

// ============================================
// Stage 3: Scene 分镜设计（双模式共用）
// ============================================

export type SceneType =
  | "cover"
  | "chapter_title"
  | "narrative"
  | "dialogue"
  | "character_card"
  | "emotion_peak"
  | "climax"
  | "ending"
  // Article 模式专属
  | "article_cover"
  | "section_title"
  | "concept_card"
  | "data_highlight"
  | "quote_block"
  | "visualization"
  | "article_ending";

export interface Scene {
  id: string;
  type: SceneType;
  chapterIndex: number;

  content: {
    title?: string;
    paragraphs: string[];
    dialogue?: DialogueLine[];
    note?: string;
    // Article 模式扩展
    sectionIndex?: number;
    concept?: ArticleConcept;
    dataPoint?: ArticleDataPoint;
    visualization?: VisualizationSuggestion;
  };

  visual: {
    layout: SceneLayout;
    background: {
      type: "gradient" | "solid" | "animated" | "texture";
      value: string;
    };
    typography: {
      font_size: string;
      font_weight: number;
      letter_spacing: string;
      line_height: number;
      color: string;
      effect?: TextEffect;
    };
    animation: {
      entrance: string;
      exit: string;
    };
  };

  emotion: {
    keyframeRef: number;
    intensity: number;
    valence: number;
    arousal: number;
  };

  audio?: {
    ttsText: string;
    ttsRate: number;
    ttsPitch: number;
    styleHint: string;
  };

  durationEstimate: number;
}

export type SceneLayout =
  | "fullscreen_text"
  | "split_image_text"
  | "center_focus"
  | "dialogue_bubbles"
  | "character_card_layout"
  | "impact_text"
  // Article 布局
  | "article_header"
  | "article_content"
  | "article_split"
  | "article_visualization"
  | "article_data";

export type TextEffect = "glow" | "shake" | "pulse" | "typewriter" | "none";

export interface DialogueLine {
  speaker: string;
  text: string;
  emotion?: string;
}

// ============================================
// StoryScript / ArticleScript —— 统一包装
// ============================================

export interface StoryScript {
  meta: StoryMeta;
  style_dna: StyleDNA;
  characters: Character[];
  chapters: Chapter[];
  emotion_curve: EmotionKeyframe[];
  dialogue_segments?: DialogueSegment[];
}

export interface ArticleScript {
  meta: ArticleMeta;
  style_dna: StyleDNA;
  sections: ArticleSection[];
  concepts: ArticleConcept[];
  data_points: ArticleDataPoint[];
  visualization_suggestions: VisualizationSuggestion[];
}

// ============================================
// TTS 相关
// ============================================

export interface TTSConfig {
  voice: string;
  customVoiceId?: string;
  format: "mp3" | "wav";
}

export interface VoiceDesignResult {
  voiceId: string;
  description: string;
}

// ============================================
// 风格库预设
// ============================================

export interface StylePreset {
  id: string;
  name: string;
  description: string;
  dna: StyleDNA;
  voiceMapping: {
    voice: string;
    styleHint: string;
  };
}

// ============================================
// 上传/爬虫相关
// ============================================

export interface ParsedDocument {
  title: string;
  author?: string;
  content: string;
  images: { url: string; alt: string; position: number }[];
  sourceUrl?: string;
}
