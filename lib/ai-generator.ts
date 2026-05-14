// ============================================
// 知乎故事重塑工坊 —— AI 生成引擎 v3.0
// 多阶段 Pipeline 主入口
// Stage 1 → 2 → 3 → 4(渲染)
// ============================================

import {
  GenerateResult,
  AiProvider,
  ContentMode,
  StoryScript,
  ArticleScript,
} from "./types";
import { renderFullHTML } from "./templates/renderer";
import { renderArticleHTML } from "./templates/article/renderer";
import { STYLE_PRESETS, getStylePresetByGenre } from "./style-presets";
import { analyzeContent } from "./pipeline/stage-1-analyze";
import { generateStyleDNA } from "./pipeline/stage-2-style";
import { designScenes } from "./pipeline/stage-3-scene";
import { preprocessContent, generateDefaultEmotionCurve } from "./pipeline/shared";

export type { AiProvider };

// ============================================
// 主入口：多阶段流水线
// ============================================

export async function generateHtml(
  content: string,
  apiKey?: string,
  provider: AiProvider = "openai",
  userMode?: "story" | "article"
): Promise<GenerateResult> {
  // 降级方案：无 API Key 返回演示模板
  if (!apiKey) {
    return generateDemoHtml(content);
  }

  // 确定模式：用户选择优先，默认 story
  const mode: ContentMode = userMode === "article" ? "article" : "story";
  console.log(`[Pipeline] 用户选择 mode=${mode}`);

  try {
    // ===== Stage 1: 内容结构化分析 =====
    const stage1 = await analyzeContent(content, mode, apiKey, provider);
    console.log(`[Stage 1] mode=${stage1.mode}, title=${stage1.meta.title}`);

    // ===== Stage 2: 风格 DNA 生成 =====
    const styleDNA = await generateStyleDNA(stage1, apiKey, provider);
    console.log(`[Stage 2] style=${styleDNA.name}`);

    // ===== Stage 3: 分镜设计 =====
    let script: StoryScript | ArticleScript;

    if (mode === "article") {
      const analysis = stage1 as import("./types").ArticleAnalysis;
      script = {
        meta: analysis.meta,
        style_dna: styleDNA,
        sections: analysis.sections,
        concepts: analysis.concepts,
        data_points: analysis.data_points,
        visualization_suggestions: analysis.visualization_suggestions,
      };
    } else {
      const analysis = stage1 as import("./types").StoryAnalysis;
      script = {
        meta: analysis.meta,
        style_dna: styleDNA,
        characters: analysis.characters,
        chapters: analysis.chapters,
        emotion_curve: analysis.emotion_curve,
        dialogue_segments: analysis.dialogue_segments,
      };
    }

    const sceneList = designScenes(mode, script, styleDNA);
    console.log(`[Stage 3] scenes=${sceneList.length}`);

    // ===== Stage 4: 渲染合成 =====
    const htmlCode = mode === "article"
      ? renderArticleHTML(sceneList, script as ArticleScript)
      : renderFullHTML(sceneList, script as StoryScript);

    return {
      htmlCode,
      metaJson: script.meta,
      storyScript: mode === "story" ? (script as StoryScript) : undefined,
      articleScript: mode === "article" ? (script as ArticleScript) : undefined,
      sceneList,
      mode,
    };
  } catch (err: any) {
    console.error("AI Generate Pipeline Error:", err);
    const demo = generateDemoHtml(content);
    return {
      ...demo,
      metaJson: {
        ...demo.metaJson,
        title: demo.metaJson.title + " (生成失败-演示模式)",
      },
    };
  }
}

// ============================================
// 降级：演示模板
// ============================================

function generateDemoHtml(content: string): GenerateResult {
  const { title, author, paragraphs } = preprocessContent(content);
  const displayParagraphs = paragraphs.slice(0, 30);
  const preset = STYLE_PRESETS[0];

  const htmlCode = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<script src="https://cdn.tailwindcss.com"></script>
<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap');
body { font-family: 'Noto Serif SC', serif; }
.scene { width: 100vw; min-height: 100vh; position: relative; }
.chapter-cover { height: 100vh; display: flex; align-items: center; justify-content: center; }
.chapter-content { min-height: 100vh; padding: 4rem 1rem; }
.fade-in { opacity: 0; transform: translateY(20px); transition: all 0.8s ease; }
.fade-in.visible { opacity: 1; transform: translateY(0); }
.nav-dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.3); cursor: pointer; transition: all 0.3s; }
.nav-dot.active { background: white; transform: scale(1.3); }
</style>
</head>
<body class="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-gray-100">

<section class="scene chapter-cover" data-scene="cover">
  <div class="text-center px-6">
    <h1 class="text-5xl md:text-7xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">${escapeHtml(title)}</h1>
    <p class="text-gray-400 text-lg">AI 重塑工坊 · 沉浸式阅读体验</p>
    <p class="text-gray-500 text-sm mt-8">↓ 滚动进入内容</p>
  </div>
</section>

<section class="scene chapter-content" data-scene="narrative">
  <div class="max-w-2xl mx-auto">
    <div class="mb-12 p-6 rounded-2xl bg-white/5 border border-white/10">
      <h3 class="text-lg font-semibold mb-4 text-pink-300">情绪脉搏</h3>
      <svg viewBox="0 0 400 80" class="w-full h-20">
        <defs><linearGradient id="grad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#f472b6"/><stop offset="100%" stop-color="#a78bfa"/></linearGradient></defs>
        <path d="M0,60 Q40,20 80,50 T160,30 T240,55 T320,25 T400,45" fill="none" stroke="url(#grad)" stroke-width="2"/>
      </svg>
    </div>
    ${displayParagraphs.map((p, i) => `<p class="fade-in text-lg leading-relaxed mb-6 text-gray-200 ${i % 3 === 0 ? "text-pink-100" : ""}">${escapeHtml(p)}</p>`).join("\n")}
  </div>
</section>

<nav class="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
  <div class="nav-dot active" onclick="document.querySelector('[data-scene=cover]').scrollIntoView({behavior:'smooth'})"></div>
  <div class="nav-dot" onclick="document.querySelector('[data-scene=narrative]').scrollIntoView({behavior:'smooth'})"></div>
</nav>

<script>
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
</script>
</body>
</html>`;

  return {
    htmlCode,
    metaJson: {
      title,
      author: author || "演示模式",
      genre: "演示模式",
      theme: "演示主题",
      estimated_reading_time: 5,
      total_word_count: content.length,
    },
    sceneList: [],
    mode: "story",
  };
}

function escapeHtml(text: string): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
