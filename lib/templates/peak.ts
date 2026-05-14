import { Scene, StoryScript } from "../types";

export function renderEmotionPeak(scene: Scene, script: StoryScript): string {
  const { style_dna } = script;
  const cs = style_dna.color_scheme;
  const isNegative = scene.emotion.valence < -0.3;
  const isHighArousal = scene.emotion.arousal > 0.7;

  return `
<section class="scene chapter-cover bg-heartbeat" data-scene="${scene.id}" data-emotion-idx="${scene.emotion.keyframeRef}" data-chapter="${scene.chapterIndex}">
  <div class="absolute inset-0" style="
    background: ${isNegative 
      ? `radial-gradient(circle at center, ${cs.primary}40 0%, ${cs.bg} 70%)`
      : `radial-gradient(circle at center, ${cs.secondary}40 0%, ${cs.bg} 70%)`
    };
  "></div>
  
  ${isHighArousal ? `
  <div class="absolute inset-0" style="
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      ${cs.primary}05 2px,
      ${cs.primary}05 4px
    );
    animation: scanline 0.1s linear infinite;
    pointer-events: none;
  "></div>
  ` : ""}
  
  <div class="relative z-10 impact-container">
    ${scene.content.paragraphs.map((p, i) => {
      const delay = Math.min(i + 1, 5);
      const isShort = p.length < 30;
      
      if (isShort) {
        return `
    <p class="reveal reveal-delay-${delay} impact-text ${isHighArousal ? 'text-pulse' : 'text-glow'}" style="
      color: ${cs.primary};
      margin-bottom: 2rem;
    ">${escapeHtml(p)}</p>`;
      }
      
      return `
    <p class="reveal reveal-delay-${delay} text-lg md:text-xl max-w-lg" style="
      color: ${cs.text};
      opacity: 0.85;
      line-height: 1.8;
      margin-bottom: 1.5rem;
    ">${escapeHtml(p)}</p>`;
    }).join("\n")}
  </div>
</section>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
