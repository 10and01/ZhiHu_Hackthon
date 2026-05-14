// ============================================
// Stage 3: 分镜/场景设计
// 支持 Story 模式和 Article 模式
// ============================================

import {
  Scene,
  SceneType,
  StoryScript,
  ArticleScript,
  ContentMode,
  StyleDNA,
  EmotionKeyframe,
} from "../types";

export function designScenes(
  mode: ContentMode,
  script: StoryScript | ArticleScript,
  styleDNA: StyleDNA
): Scene[] {
  if (mode === "article") {
    return designArticleScenes(script as ArticleScript, styleDNA);
  }
  return designStoryScenes(script as StoryScript, styleDNA);
}

// ============================================
// Story 模式分镜
// ============================================

function designStoryScenes(script: StoryScript, style: StyleDNA): Scene[] {
  const scenes: Scene[] = [];
  const { meta, characters, chapters, emotion_curve } = script;
  const cs = style.color_scheme;

  // 1. 封面
  scenes.push({
    id: "scene-cover",
    type: "cover",
    chapterIndex: -1,
    content: {
      title: meta.title,
      paragraphs: [meta.author, meta.theme],
    },
    visual: {
      layout: "fullscreen_text",
      background: { type: "gradient", value: cs.bg_gradient.join(", ") },
      typography: {
        font_size: "clamp(2.5rem, 8vw, 5rem)",
        font_weight: 900,
        letter_spacing: "-0.02em",
        line_height: 1.1,
        color: cs.primary,
        effect: "glow",
      },
      animation: { entrance: "fadeInUp", exit: "fadeOut" },
    },
    emotion: {
      keyframeRef: 0,
      intensity: emotion_curve[0]?.intensity || 0.3,
      valence: emotion_curve[0]?.valence || 0,
      arousal: emotion_curve[0]?.arousal || 0.4,
    },
    durationEstimate: 5,
  });

  // 2. 角色卡
  const mainChars = characters.filter((c) => c.role === "protagonist" || c.role === "antagonist");
  for (const char of mainChars.slice(0, 2)) {
    scenes.push({
      id: `scene-char-${char.id}`,
      type: "character_card",
      chapterIndex: 0,
      content: {
        title: char.name,
        paragraphs: [char.arc, `性格：${char.traits.join("、")}`],
      },
      visual: {
        layout: "character_card_layout",
        background: { type: "solid", value: cs.bg },
        typography: {
          font_size: "1.25rem",
          font_weight: 400,
          letter_spacing: "0",
          line_height: 1.6,
          color: cs.text,
        },
        animation: { entrance: "fadeIn", exit: "fadeOut" },
      },
      emotion: { keyframeRef: 0, intensity: 0.4, valence: 0, arousal: 0.3 },
      durationEstimate: 4,
    });
  }

  // 3. 章节场景
  for (let ci = 0; ci < chapters.length; ci++) {
    const chapter = chapters[ci];
    const kfIdx = Math.min(ci, emotion_curve.length - 1);
    const kf = emotion_curve[kfIdx] || emotion_curve[0];

    // 章节标题
    scenes.push({
      id: `scene-ch${ci}-title`,
      type: "chapter_title",
      chapterIndex: ci,
      content: {
        title: chapter.title,
        paragraphs: [`CHAPTER ${String(chapter.index).padStart(2, "0")}`, chapter.key_moment],
      },
      visual: {
        layout: "center_focus",
        background: { type: "gradient", value: cs.bg_gradient.join(", ") },
        typography: {
          font_size: "clamp(1.5rem, 5vw, 3rem)",
          font_weight: 700,
          letter_spacing: "0.1em",
          line_height: 1.3,
          color: cs.secondary,
        },
        animation: { entrance: "slideInUp", exit: "slideOutUp" },
      },
      emotion: {
        keyframeRef: kfIdx,
        intensity: chapter.emotion_summary.intensity,
        valence: chapter.emotion_summary.valence,
        arousal: chapter.emotion_summary.arousal,
      },
      durationEstimate: 4,
    });

    // 段落分镜
    const paras = chapter.paragraphs || [];
    const chunkSize = chapter.emotion_summary.intensity > 0.8 ? 2 : 3;

    for (let pi = 0; pi < paras.length; pi += chunkSize) {
      const chunk = paras.slice(pi, pi + chunkSize);
      const isPeak = chapter.emotion_summary.intensity > 0.85 && pi < chunkSize;
      const isDialogue = chunk.some((p) => p.includes("「") || p.includes("'") || p.includes('"'));

      const sceneType: SceneType = isPeak ? "emotion_peak" : isDialogue ? "dialogue" : "narrative";
      const layout = isPeak ? "impact_text" : isDialogue ? "dialogue_bubbles" : "center_focus";

      scenes.push({
        id: `scene-ch${ci}-p${pi}`,
        type: sceneType,
        chapterIndex: ci,
        content: { paragraphs: chunk },
        visual: {
          layout,
          background: {
            type: chapter.emotion_summary.intensity > 0.7 ? "animated" : "gradient",
            value: cs.bg_gradient.join(", "),
          },
          typography: {
            font_size: isPeak ? "clamp(1.5rem, 4vw, 2.5rem)" : "clamp(1rem, 2.5vw, 1.25rem)",
            font_weight: isPeak ? 700 : 400,
            letter_spacing: chapter.emotion_summary.arousal > 0.7 ? "0.05em" : "0",
            line_height: isPeak ? 1.4 : 1.8,
            color: isPeak ? cs.primary : cs.text,
            effect: isPeak ? "pulse" : "none",
          },
          animation: { entrance: pi === 0 ? "fadeIn" : "fadeInUp", exit: "fadeOut" },
        },
        emotion: {
          keyframeRef: kfIdx,
          intensity: chapter.emotion_summary.intensity,
          valence: chapter.emotion_summary.valence,
          arousal: chapter.emotion_summary.arousal,
        },
        durationEstimate: chunk.length * 8,
      });
    }
  }

  // 4. 结尾
  const lastKf = emotion_curve[emotion_curve.length - 1];
  scenes.push({
    id: "scene-ending",
    type: "ending",
    chapterIndex: chapters.length,
    content: {
      title: "未完待续",
      paragraphs: ["由 知乎故事重塑工坊 生成", `风格：${style.name}`],
    },
    visual: {
      layout: "center_focus",
      background: { type: "gradient", value: cs.bg_gradient.join(", ") },
      typography: {
        font_size: "1.5rem",
        font_weight: 300,
        letter_spacing: "0.05em",
        line_height: 1.6,
        color: cs.text,
      },
      animation: { entrance: "fadeIn", exit: "fadeOut" },
    },
    emotion: {
      keyframeRef: emotion_curve.length - 1,
      intensity: lastKf?.intensity || 0.3,
      valence: lastKf?.valence || 0,
      arousal: lastKf?.arousal || 0.3,
    },
    durationEstimate: 5,
  });

  return scenes;
}

// ============================================
// Article 模式分镜
// ============================================

function designArticleScenes(script: ArticleScript, style: StyleDNA): Scene[] {
  const scenes: Scene[] = [];
  const { meta, sections, concepts, data_points, visualization_suggestions } = script;
  const cs = style.color_scheme;

  // 构建概念查找表（按段落索引）
  const conceptsByPara = new Map<number, typeof concepts[0]>();
  for (const c of concepts) {
    conceptsByPara.set(c.first_appearance_para, c);
  }

  // 构建数据点查找表
  const dataByPara = new Map<number, typeof data_points[0]>();
  for (const d of data_points) {
    dataByPara.set(d.paragraph_idx, d);
  }

  // 构建可视化查找表（按章节索引）
  const vizBySection = new Map<number, typeof visualization_suggestions[0]>();
  for (const v of visualization_suggestions) {
    vizBySection.set(v.target_section, v);
  }

  // 1. 文章封面
  scenes.push({
    id: "scene-article-cover",
    type: "article_cover",
    chapterIndex: -1,
    content: {
      title: meta.title,
      paragraphs: [meta.author, meta.abstract, `${meta.reading_time} 分钟阅读`],
    },
    visual: {
      layout: "article_header",
      background: { type: "gradient", value: cs.bg_gradient.join(", ") },
      typography: {
        font_size: "clamp(2rem, 6vw, 4rem)",
        font_weight: 800,
        letter_spacing: "-0.02em",
        line_height: 1.1,
        color: cs.primary,
        effect: "glow",
      },
      animation: { entrance: "fadeInUp", exit: "fadeOut" },
    },
    emotion: { keyframeRef: 0, intensity: 0.3, valence: 0.2, arousal: 0.4 },
    durationEstimate: 5,
  });

  // 2. 章节场景
  for (let si = 0; si < sections.length; si++) {
    const section = sections[si];
    const importance = section.importance || 0.5;

    // 章节标题页
    scenes.push({
      id: `scene-sec${si}-title`,
      type: "section_title",
      chapterIndex: si,
      content: {
        title: section.title,
        paragraphs: section.key_points || [],
        sectionIndex: si,
      },
      visual: {
        layout: "article_split",
        background: { type: "gradient", value: cs.bg_gradient.join(", ") },
        typography: {
          font_size: "clamp(1.25rem, 4vw, 2.5rem)",
          font_weight: 700,
          letter_spacing: "0.02em",
          line_height: 1.3,
          color: cs.secondary,
        },
        animation: { entrance: "slideInUp", exit: "fadeOut" },
      },
      emotion: {
        keyframeRef: si,
        intensity: 0.3 + importance * 0.3,
        valence: 0.2,
        arousal: 0.3 + importance * 0.3,
      },
      durationEstimate: 4,
    });

    // 段落内容（article 模式用更长的段落块）
    const paras = section.paragraphs || [];
    const chunkSize = importance > 0.7 ? 2 : 3;

    for (let pi = 0; pi < paras.length; pi += chunkSize) {
      const chunk = paras.slice(pi, pi + chunkSize);
      const globalParaIdx = section.start_para + pi;

      // 检查是否有概念卡需要插入
      const concept = conceptsByPara.get(globalParaIdx);
      const dataPoint = dataByPara.get(globalParaIdx);

      if (concept && pi === 0) {
        scenes.push({
          id: `scene-sec${si}-concept-${concept.term}`,
          type: "concept_card",
          chapterIndex: si,
          content: {
            title: concept.term,
            paragraphs: [concept.explanation],
            concept,
          },
          visual: {
            layout: "article_content",
            background: { type: "solid", value: cs.bg },
            typography: {
              font_size: "1.125rem",
              font_weight: 400,
              letter_spacing: "0",
              line_height: 1.7,
              color: cs.text,
            },
            animation: { entrance: "fadeInUp", exit: "fadeOut" },
          },
          emotion: { keyframeRef: si, intensity: 0.4, valence: 0.2, arousal: 0.3 },
          durationEstimate: 5,
        });
      }

      if (dataPoint && pi === 0) {
        scenes.push({
          id: `scene-sec${si}-data-${pi}`,
          type: "data_highlight",
          chapterIndex: si,
          content: {
            title: dataPoint.value,
            paragraphs: [dataPoint.context, dataPoint.source || ""],
            dataPoint,
          },
          visual: {
            layout: "article_data",
            background: { type: "solid", value: cs.bg },
            typography: {
              font_size: "clamp(2rem, 5vw, 3.5rem)",
              font_weight: 800,
              letter_spacing: "-0.02em",
              line_height: 1.2,
              color: cs.accent,
              effect: "glow",
            },
            animation: { entrance: "fadeInUp", exit: "fadeOut" },
          },
          emotion: { keyframeRef: si, intensity: 0.5, valence: 0.3, arousal: 0.4 },
          durationEstimate: 4,
        });
      }

      // 普通段落
      scenes.push({
        id: `scene-sec${si}-p${pi}`,
        type: "narrative",
        chapterIndex: si,
        content: {
          paragraphs: chunk,
          sectionIndex: si,
        },
        visual: {
          layout: "article_content",
          background: { type: "solid", value: cs.bg },
          typography: {
            font_size: "clamp(1rem, 2.5vw, 1.125rem)",
            font_weight: 400,
            letter_spacing: "0.01em",
            line_height: 1.8,
            color: cs.text,
          },
          animation: { entrance: "fadeInUp", exit: "fadeOut" },
        },
        emotion: { keyframeRef: si, intensity: 0.3, valence: 0.2, arousal: 0.3 },
        durationEstimate: chunk.length * 6,
      });
    }

    // 可视化插入（在章节末尾）
    const viz = vizBySection.get(si);
    if (viz) {
      scenes.push({
        id: `scene-sec${si}-viz`,
        type: "visualization",
        chapterIndex: si,
        content: {
          title: viz.title,
          paragraphs: [viz.reason],
          visualization: viz,
        },
        visual: {
          layout: "article_visualization",
          background: { type: "solid", value: cs.bg },
          typography: {
            font_size: "1.25rem",
            font_weight: 600,
            letter_spacing: "0",
            line_height: 1.4,
            color: cs.primary,
          },
          animation: { entrance: "fadeIn", exit: "fadeOut" },
        },
        emotion: { keyframeRef: si, intensity: 0.5, valence: 0.3, arousal: 0.5 },
        durationEstimate: 8,
      });
    }
  }

  // 3. 文章结尾
  scenes.push({
    id: "scene-article-ending",
    type: "article_ending",
    chapterIndex: sections.length,
    content: {
      title: "阅读完成",
      paragraphs: [
        `由 知乎故事重塑工坊 生成`,
        `风格：${style.name} · ${meta.category}`,
      ],
    },
    visual: {
      layout: "center_focus",
      background: { type: "gradient", value: cs.bg_gradient.join(", ") },
      typography: {
        font_size: "1.25rem",
        font_weight: 300,
        letter_spacing: "0.05em",
        line_height: 1.6,
        color: cs.text,
      },
      animation: { entrance: "fadeIn", exit: "fadeOut" },
    },
    emotion: { keyframeRef: 0, intensity: 0.3, valence: 0.2, arousal: 0.3 },
    durationEstimate: 5,
  });

  return scenes;
}
