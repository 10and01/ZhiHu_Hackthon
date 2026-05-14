import { ArticleScript } from "../../types";

export function generateArticleStyles(script: ArticleScript): string {
  const { style_dna } = script;
  const cs = style_dna.color_scheme;
  const fonts = style_dna.typography;

  return `<style>
:root {
  --primary: ${cs.primary};
  --secondary: ${cs.secondary};
  --bg: ${cs.bg};
  --text: ${cs.text};
  --accent: ${cs.accent};
  --font-heading: ${fonts.heading};
  --font-body: ${fonts.body};
  --font-special: ${fonts.special};
}

* { margin: 0; padding: 0; box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  font-family: ${fonts.body};
  background: ${cs.bg};
  color: ${cs.text};
  overflow-x: hidden;
}

/* 侧边目录 */
.article-toc {
  position: fixed;
  left: 0;
  top: 0;
  width: 220px;
  height: 100vh;
  background: rgba(15,23,42,0.85);
  backdrop-filter: blur(12px);
  border-right: 1px solid rgba(255,255,255,0.06);
  padding: 2rem 1rem;
  z-index: 100;
  overflow-y: auto;
  transition: transform 0.3s ease;
}
.toc-title {
  font-family: ${fonts.heading};
  font-size: 0.875rem;
  font-weight: 700;
  color: ${cs.primary};
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.toc-item {
  font-size: 0.8125rem;
  color: rgba(255,255,255,0.5);
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.toc-item:hover {
  background: rgba(255,255,255,0.05);
  color: rgba(255,255,255,0.8);
}
.toc-item.active {
  background: ${cs.primary}22;
  color: ${cs.primary};
}

/* 主容器 */
#article-container {
  margin-left: 220px;
  min-height: 100vh;
}

/* 场景 */
.scene {
  width: 100%;
  min-height: 100vh;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
}

/* 导航点 */
.scene-nav {
  position: fixed;
  right: 1.5rem;
  top: 50%;
  transform: translateY(-50%);
  z-index: 90;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.scene-nav-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  cursor: pointer;
  transition: all 0.3s;
}
.scene-nav-dot.active {
  background: ${cs.primary};
  transform: scale(1.4);
  box-shadow: 0 0 8px ${cs.primary}66;
}

/* 情绪脉搏 */
.emotion-pulse {
  position: fixed;
  bottom: 0;
  left: 220px;
  right: 0;
  height: 60px;
  z-index: 80;
  pointer-events: none;
  opacity: 0.6;
}

/* reveal 动画 */
.reveal {
  opacity: 0;
  transform: translateY(24px);
  transition: all 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}
.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}
.reveal-delay-1 { transition-delay: 0.1s; }
.reveal-delay-2 { transition-delay: 0.2s; }
.reveal-delay-3 { transition-delay: 0.3s; }

/* 概念卡片 */
.concept-card {
  background: linear-gradient(135deg, ${cs.primary}15, ${cs.secondary}10);
  border: 1px solid ${cs.primary}30;
  border-radius: 16px;
  padding: 1.5rem 2rem;
  margin: 1.5rem 0;
  position: relative;
  overflow: hidden;
}
.concept-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: ${cs.primary};
}
.concept-term {
  font-family: ${fonts.heading};
  font-size: 1.125rem;
  font-weight: 700;
  color: ${cs.primary};
  margin-bottom: 0.5rem;
}
.concept-explanation {
  font-size: 0.9375rem;
  color: ${cs.text}cc;
  line-height: 1.6;
}

/* 数据高亮 */
.data-highlight {
  text-align: center;
  padding: 3rem 2rem;
  background: ${cs.primary}08;
  border-radius: 20px;
  margin: 2rem 0;
}
.data-value {
  font-family: ${fonts.special};
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 800;
  color: ${cs.accent};
  line-height: 1;
  margin-bottom: 0.75rem;
}
.data-context {
  font-size: 1rem;
  color: ${cs.text}aa;
}
.data-source {
  font-size: 0.75rem;
  color: ${cs.text}66;
  margin-top: 0.5rem;
}

/* 可视化容器 */
.viz-container {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 16px;
  padding: 2rem;
  margin: 2rem 0;
}
.viz-title {
  font-family: ${fonts.heading};
  font-size: 1.25rem;
  font-weight: 700;
  color: ${cs.primary};
  margin-bottom: 1.5rem;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .article-toc { transform: translateX(-100%); width: 200px; }
  #article-container { margin-left: 0; }
  .emotion-pulse { left: 0; }
  .scene { padding: 3rem 1rem; }
}

/* 纹理 */
${generateTextureCSS(style_dna.texture)}
</style>`;
}

function generateTextureCSS(texture: string): string {
  if (texture.includes("grid")) {
    return `body::before { content:''; position:fixed; inset:0; background-image:linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px); background-size:40px 40px; pointer-events:none; z-index:1; }`;
  }
  if (texture.includes("noise")) {
    return `body::before { content:''; position:fixed; inset:0; background:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E"); pointer-events:none; z-index:1; }`;
  }
  if (texture.includes("paper")) {
    return `body::before { content:''; position:fixed; inset:0; background:url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.04' numOctaves='5'/%3E%3CfeDiffuseLighting lighting-color='%23f5f0e8' surfaceScale='2'%3E%3CfeDistantLight azimuth='45' elevation='60'/%3E%3C/feDiffuseLighting%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23p)' opacity='0.4'/%3E%3C/svg%3E"); pointer-events:none; z-index:1; }`;
  }
  return "";
}

export function generateEmotionPulseSVG(emotion_curve: any[], primaryColor: string): string {
  if (!emotion_curve || emotion_curve.length === 0) {
    return `<svg viewBox="0 0 400 60" class="w-full h-full"><text x="200" y="35" text-anchor="middle" fill="${primaryColor}" opacity="0.3" font-size="12">情绪脉搏</text></svg>`;
  }
  const points = emotion_curve.map((k) => `${(k.position / 100) * 400},${60 - k.intensity * 50}`).join(" ");
  return `<svg viewBox="0 0 400 60" class="w-full h-full" preserveAspectRatio="none">
    <defs><linearGradient id="pulseGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="${primaryColor}" stop-opacity="0.3"/><stop offset="100%" stop-color="${primaryColor}" stop-opacity="0.8"/></linearGradient></defs>
    <polyline points="${points}" fill="none" stroke="url(#pulseGrad)" stroke-width="2" stroke-linecap="round"/>
    <circle id="pulseCursor" cx="0" cy="${60 - emotion_curve[0].intensity * 50}" r="4" fill="${primaryColor}" />
  </svg>`;
}
