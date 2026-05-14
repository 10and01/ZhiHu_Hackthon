import { StoryScript } from "../types";

export function generateGlobalStyles(storyScript: StoryScript): string {
  const { style_dna, emotion_curve, characters } = storyScript;
  const cs = style_dna.color_scheme;

  // 生成角色 CSS 变量
  const charVars = characters
    .map(
      (c) => `
  --char-${c.id}-color: ${c.color};
  --char-${c.id}-bg: ${c.color}20;`
    )
    .join("\n");

  // 生成情绪关键帧 CSS
  const emotionKeyframes = emotion_curve
    .map(
      (k, i) => `
  .emotion-kf-${i} {
    --kf-intensity: ${k.intensity};
    --kf-valence: ${k.valence};
    --kf-arousal: ${k.arousal};
  }`
    )
    .join("\n");

  return `
<style>
/* ===== 设计系统变量 ===== */
:root {
  --primary: ${cs.primary};
  --secondary: ${cs.secondary};
  --bg: ${cs.bg};
  --text: ${cs.text};
  --accent: ${cs.accent};
  
  /* 情绪驱动变量（动态更新） */
  --current-intensity: 0.5;
  --current-valence: 0;
  --current-arousal: 0.5;
  --fx-intensity: 0.8;
  
  /* 字体 */
  --font-heading: ${style_dna.typography.heading};
  --font-body: ${style_dna.typography.body};
  --font-special: ${style_dna.typography.special};
  
  ${charVars}
}

/* ===== 基础重置 ===== */
*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
  overflow-x: hidden;
}

body {
  font-family: var(--font-body), 'Noto Sans SC', system-ui, -apple-system, sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.6;
  overflow-x: hidden;
}

/* ===== 场景系统 ===== */
.scene {
  width: 100%;
  position: relative;
  overflow: hidden;
}

.chapter-cover {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.chapter-content {
  min-height: 100vh;
  padding: 4rem 1.5rem;
}

/* ===== 情绪驱动样式 ===== */
.emotion-text {
  font-size: calc(1rem + var(--current-intensity) * var(--fx-intensity) * 0.5rem);
  font-weight: calc(400 + var(--current-intensity) * var(--fx-intensity) * 400);
  letter-spacing: calc(var(--current-arousal) * var(--fx-intensity) * 0.05em);
  line-height: calc(1.6 + (1 - var(--current-arousal)) * 0.4);
  color: var(--text);
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.emotion-text.negative {
  color: var(--primary);
}

.emotion-text.positive {
  color: var(--secondary);
}

/* ===== 文本效果 ===== */
.text-glow {
  text-shadow: 0 0 calc(20px * var(--fx-intensity)) var(--primary),
               0 0 calc(40px * var(--fx-intensity)) var(--primary);
}

.text-pulse {
  animation: textPulse 2s ease-in-out infinite;
}

@keyframes textPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.85; transform: scale(1.02); }
}

.text-shake {
  animation: textShake 0.5s ease-in-out infinite;
}

@keyframes textShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  75% { transform: translateX(2px); }
}

/* ===== 背景效果 ===== */
.bg-mist {
  position: relative;
}
.bg-mist::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 70%, ${cs.primary}30 0%, transparent 50%),
              radial-gradient(circle at 70% 30%, ${cs.secondary}20 0%, transparent 40%);
  animation: mistFloat 8s ease-in-out infinite;
  pointer-events: none;
}

@keyframes mistFloat {
  0%, 100% { opacity: 0.6; transform: translateY(0); }
  50% { opacity: 0.9; transform: translateY(-10px); }
}

.bg-heartbeat {
  animation: bgHeartbeat 1.5s ease-in-out infinite;
}

@keyframes bgHeartbeat {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.15); }
}

/* ===== 滚动揭示动画 ===== */
.reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}

.reveal-delay-1 { transition-delay: 0.1s; }
.reveal-delay-2 { transition-delay: 0.2s; }
.reveal-delay-3 { transition-delay: 0.3s; }
.reveal-delay-4 { transition-delay: 0.4s; }
.reveal-delay-5 { transition-delay: 0.5s; }

/* ===== 导航 ===== */
.scene-nav {
  position: fixed;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.scene-nav-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255,255,255,0.25);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.scene-nav-dot:hover {
  background: rgba(255,255,255,0.6);
  transform: scale(1.2);
}

.scene-nav-dot.active {
  background: var(--primary);
  transform: scale(1.4);
  box-shadow: 0 0 8px var(--primary);
}

/* ===== 情绪脉搏（底部） ===== */
.emotion-pulse {
  position: fixed;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(8px);
  border-radius: 999px;
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.emotion-pulse svg {
  width: 200px;
  height: 30px;
}

.emotion-pulse-cursor {
  fill: var(--primary);
  transition: cx 0.5s ease;
}

/* ===== TTS 播放器 ===== */
.tts-player {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  z-index: 100;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(8px);
  border-radius: 12px;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border: 1px solid rgba(255,255,255,0.1);
}

.tts-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--primary);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.tts-btn:hover {
  transform: scale(1.1);
  filter: brightness(1.2);
}

.tts-progress {
  width: 100px;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: rgba(255,255,255,0.2);
  border-radius: 2px;
  outline: none;
}

.tts-progress::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--primary);
  cursor: pointer;
}

/* ===== 角色卡片 ===== */
.character-card {
  border: 1px solid var(--char-color, var(--primary));
  border-radius: 16px;
  padding: 1.5rem;
  margin: 1.5rem auto;
  max-width: 480px;
  background: rgba(255,255,255,0.03);
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
}

.character-card:hover {
  background: rgba(255,255,255,0.06);
  transform: translateY(-2px);
}

.character-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
}

.character-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  flex-shrink: 0;
}

.character-name {
  font-size: 1.25rem;
  font-weight: 700;
}

.character-role {
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  border-radius: 999px;
  background: var(--char-color, var(--primary));
  color: white;
  opacity: 0.8;
}

.character-body {
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  transition: all 0.4s ease;
}

.character-body.expanded {
  max-height: 300px;
  opacity: 1;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--char-color, var(--primary));
}

.character-trait {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  background: var(--char-color, var(--primary));
  color: white;
  font-size: 0.875rem;
  margin: 0.25rem;
  opacity: 0.8;
}

/* ===== 对话气泡 ===== */
.dialogue-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 640px;
  margin: 0 auto;
}

.dialogue-row {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.dialogue-row.left { flex-direction: row; }
.dialogue-row.right { flex-direction: row-reverse; }

.dialogue-bubble {
  max-width: 75%;
  padding: 0.875rem 1.25rem;
  border-radius: 1rem;
  position: relative;
  line-height: 1.6;
}

.dialogue-bubble.left {
  background: rgba(167, 139, 250, 0.12);
  border: 1px solid rgba(167, 139, 250, 0.25);
  border-bottom-left-radius: 0.25rem;
}

.dialogue-bubble.right {
  background: rgba(255, 42, 109, 0.12);
  border: 1px solid rgba(255, 42, 109, 0.25);
  border-bottom-right-radius: 0.25rem;
}

.dialogue-speaker {
  font-size: 0.75rem;
  color: var(--text);
  opacity: 0.6;
  margin-bottom: 0.25rem;
}

/* ===== 情绪峰值页 ===== */
.impact-text {
  font-size: clamp(1.75rem, 5vw, 3rem);
  font-weight: 900;
  line-height: 1.2;
  text-align: center;
  letter-spacing: -0.02em;
}

.impact-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  text-align: center;
}

/* ===== 章节标题 ===== */
.chapter-number {
  font-size: 0.875rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--secondary);
  margin-bottom: 1rem;
}

.chapter-title {
  font-family: var(--font-heading);
  font-size: clamp(2rem, 6vw, 4rem);
  font-weight: 700;
  line-height: 1.1;
  margin-bottom: 1.5rem;
}

.chapter-divider {
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  border-radius: 2px;
}

/* ===== 全局动画 ===== */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes slideInUp {
  from { opacity: 0; transform: translateY(60px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideOutUp {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(-60px); }
}

${emotionKeyframes}

/* ===== 响应式 ===== */
@media (max-width: 640px) {
  .chapter-content { padding: 2rem 1rem; }
  .scene-nav { right: 0.5rem; }
  .tts-player {
    bottom: 0.5rem;
    right: 0.5rem;
    left: 0.5rem;
    justify-content: center;
  }
  .emotion-pulse { display: none; }
  .character-card { margin: 1rem; }
}

/* ===== 打印 ===== */
@media print {
  .scene-nav, .emotion-pulse, .tts-player { display: none !important; }
  .scene { page-break-inside: avoid; }
}
</style>`;
}

export function generateEmotionPulseSVG(emotionCurve: StoryScript["emotion_curve"], primaryColor: string): string {
  if (emotionCurve.length < 2) return "";

  const width = 400;
  const height = 60;
  const points = emotionCurve.map((kf) => {
    const x = (kf.position / 100) * width;
    const y = height - kf.intensity * height * 0.8 - 10;
    return `${x},${y}`;
  });

  const pathD = `M${points[0]} ${points.slice(1).map((p) => `L${p}`).join(" ")}`;

  return `<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
    <defs>
      <linearGradient id="pulseGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="${primaryColor}" stop-opacity="0.3"/>
        <stop offset="50%" stop-color="${primaryColor}" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="${primaryColor}" stop-opacity="0.3"/>
      </linearGradient>
    </defs>
    <path d="${pathD}" fill="none" stroke="url(#pulseGrad)" stroke-width="2" stroke-linecap="round"/>
    <circle id="pulseCursor" cx="0" cy="${height / 2}" r="4" fill="${primaryColor}" class="emotion-pulse-cursor"/>
  </svg>`;
}
