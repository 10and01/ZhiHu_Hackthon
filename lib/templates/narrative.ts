import { Scene, StoryScript } from "../types";

export function renderNarrative(scene: Scene, script: StoryScript): string {
  const { style_dna } = script;
  const cs = style_dna.color_scheme;

  return `
<section class="scene chapter-content" data-scene="${scene.id}" data-emotion-idx="${scene.emotion.keyframeRef}" data-chapter="${scene.chapterIndex}">
  <div class="absolute inset-0" style="
    background: linear-gradient(180deg, ${cs.bg} 0%, ${cs.bg_gradient[0]} 50%, ${cs.bg} 100%);
  "></div>
  
  <div class="relative z-10 max-w-2xl mx-auto px-4">
    ${scene.content.paragraphs.map((p, i) => {
      const isKeyMoment = p.length < 50 && scene.emotion.intensity > 0.7;
      const delay = Math.min(i + 1, 5);
      
      if (isKeyMoment) {
        return `
    <p class="reveal reveal-delay-${delay} my-8 text-center" style="
      font-size: 1.5rem;
      font-weight: 700;
      color: ${cs.primary};
      font-family: var(--font-heading);
      letter-spacing: 0.05em;
    ">${escapeHtml(p)}</p>`;
      }
      
      return `
    <p class="reveal reveal-delay-${delay} emotion-text mb-6" style="
      text-indent: 2em;
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
