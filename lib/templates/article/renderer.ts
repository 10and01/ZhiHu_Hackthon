// ============================================
// Article 模式渲染器
// ============================================

import { Scene, ArticleScript, SceneType } from "../../types";
import { generateArticleStyles, generateEmotionPulseSVG } from "./styles";
import { renderArticleCover } from "./cover";
import { renderSectionTitle } from "./section";
import { renderArticleNarrative } from "./narrative";
import { renderConceptCard } from "./concept";
import { renderDataHighlight } from "./data";
import { renderVisualization } from "./visualization";
import { renderArticleEnding } from "./ending";

export function renderArticleHTML(sceneList: Scene[], articleScript: ArticleScript): string {
  const { meta, style_dna, sections } = articleScript;
  const cs = style_dna.color_scheme;

  const scenesHTML = sceneList.map((scene) => renderArticleScene(scene, articleScript)).join("\n");

  const navDots = sceneList
    .map((scene, i) => `<div class="scene-nav-dot" data-scene-idx="${i}" onclick="goToScene(${i})"></div>`)
    .join("\n");

  const pulseSVG = generateEmotionPulseSVG([], cs.primary);

  const sectionsJSON = JSON.stringify(sections.map((s) => ({ index: s.index, title: s.title })));
  const sceneDataJSON = JSON.stringify(
    sceneList.map((s) => ({
      id: s.id,
      type: s.type,
      chapterIndex: s.chapterIndex,
      emotion: s.emotion,
      audio: s.audio,
    }))
  );

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${meta.title} · 知乎故事重塑工坊</title>
<script src="https://cdn.tailwindcss.com"></script>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&family=Noto+Sans+SC:wght@300;400;500;700&family=Ma+Shan+Zheng&family=ZCOOL+XiaoWei&display=swap" rel="stylesheet">
${generateArticleStyles(articleScript)}
</head>
<body>

<!-- 侧边目录 -->
<aside class="article-toc" id="article-toc">
  <div class="toc-title">目录</div>
  <div class="toc-list" id="toc-list"></div>
</aside>

<!-- 场景容器 -->
<main id="article-container">
${scenesHTML}
</main>

<!-- 右侧场景导航 -->
<nav class="scene-nav" id="scene-nav">
${navDots}
</nav>

<!-- 底部情绪脉搏 -->
<div class="emotion-pulse" id="emotion-pulse">
  ${pulseSVG}
</div>

<script>
// ===== 数据 =====
const SECTIONS = ${sectionsJSON};
const SCENE_DATA = ${sceneDataJSON};

// ===== 目录生成 =====
const tocList = document.getElementById('toc-list');
SECTIONS.forEach((sec, i) => {
  const item = document.createElement('div');
  item.className = 'toc-item';
  item.textContent = sec.title;
  item.dataset.section = i;
  item.onclick = () => {
    const target = document.querySelector('[data-section-index="' + i + '"]');
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  tocList.appendChild(item);
});

// ===== 场景控制器 =====
class ArticleSceneController {
  constructor() {
    this.scenes = document.querySelectorAll('.scene');
    this.navDots = document.querySelectorAll('.scene-nav-dot');
    this.tocItems = document.querySelectorAll('.toc-item');
    this.currentScene = 0;
    this.isScrolling = false;
    this.init();
  }

  init() {
    window.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === ' ') { e.preventDefault(); this.nextScene(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); this.prevScene(); }
    });
    let touchStartY = 0;
    window.addEventListener('touchstart', e => touchStartY = e.touches[0].clientY, { passive: true });
    window.addEventListener('touchend', e => {
      const diff = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(diff) > 60) diff > 0 ? this.nextScene() : this.prevScene();
    }, { passive: true });
    this.setupObservers();
    this.updateNav(0);
  }

  handleWheel(e) {
    e.preventDefault();
    if (this.isScrolling) return;
    const delta = e.deltaY;
    if (delta > 30) { this.isScrolling = true; this.nextScene(); setTimeout(() => this.isScrolling = false, 800); }
    else if (delta < -30) { this.isScrolling = true; this.prevScene(); setTimeout(() => this.isScrolling = false, 800); }
  }

  nextScene() { if (this.currentScene < this.scenes.length - 1) this.goToScene(this.currentScene + 1); }
  prevScene() { if (this.currentScene > 0) this.goToScene(this.currentScene - 1); }

  goToScene(index) {
    if (index < 0 || index >= this.scenes.length) return;
    const target = this.scenes[index];
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    this.currentScene = index;
    this.updateNav(index);
    this.updateToc(index);
  }

  setupObservers() {
    const sceneObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          const idx = Array.from(this.scenes).indexOf(entry.target);
          if (idx !== this.currentScene) {
            this.currentScene = idx;
            this.updateNav(idx);
            this.updateToc(idx);
          }
        }
      });
    }, { threshold: [0.5] });
    this.scenes.forEach(s => sceneObserver.observe(s));

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
  }

  updateNav(index) {
    this.navDots.forEach((dot, i) => dot.classList.toggle('active', i === index));
  }

  updateToc(index) {
    const scene = SCENE_DATA[index];
    if (!scene) return;
    this.tocItems.forEach((item, i) => {
      item.classList.toggle('active', i === scene.chapterIndex);
    });
    const cursor = document.getElementById('pulseCursor');
    if (cursor) {
      const progress = (index / (this.scenes.length - 1)) * 400;
      cursor.setAttribute('cx', progress);
    }
  }
}

function goToScene(index) { window.sceneController.goToScene(index); }

window.sceneController = new ArticleSceneController();
</script>

</body>
</html>`;
}

function renderArticleScene(scene: Scene, script: ArticleScript): string {
  switch (scene.type) {
    case "article_cover":
      return renderArticleCover(scene, script);
    case "section_title":
      return renderSectionTitle(scene, script);
    case "narrative":
      return renderArticleNarrative(scene, script);
    case "concept_card":
      return renderConceptCard(scene, script);
    case "data_highlight":
      return renderDataHighlight(scene, script);
    case "visualization":
      return renderVisualization(scene, script);
    case "article_ending":
      return renderArticleEnding(scene, script);
    default:
      return renderArticleNarrative(scene, script);
  }
}
