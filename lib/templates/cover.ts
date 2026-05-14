import { Scene, StoryScript } from "../types";

export function renderCover(scene: Scene, script: StoryScript): string {
  const { meta, style_dna } = script;
  const cs = style_dna.color_scheme;

  return `
<section class="scene chapter-cover" data-scene="${scene.id}" data-emotion-idx="${scene.emotion.keyframeRef}" data-chapter="-1">
  <div class="absolute inset-0" style="
    background: linear-gradient(135deg, ${cs.bg_gradient[0]} 0%, ${cs.bg_gradient[1]} 50%, ${cs.bg_gradient[2] || cs.bg_gradient[1]} 100%);
  "></div>
  <div class="absolute inset-0 bg-mist opacity-60"></div>
  
  <div class="relative z-10 text-center px-6 max-w-3xl mx-auto">
    <div class="reveal">
      <p class="text-sm tracking-[0.3em] uppercase mb-6" style="color: ${cs.secondary}">
        ${meta.genre}
      </p>
    </div>
    
    <h1 class="reveal reveal-delay-1 impact-text text-glow" style="
      font-family: var(--font-heading);
      color: ${cs.primary};
      margin-bottom: 1.5rem;
    ">
      ${meta.title}
    </h1>
    
    <div class="reveal reveal-delay-2">
      <p class="text-lg mb-2" style="color: ${cs.text}; opacity: 0.8">
        ${meta.author}
      </p>
      <p class="text-sm max-w-md mx-auto" style="color: ${cs.text}; opacity: 0.5">
        ${meta.theme}
      </p>
    </div>
    
    <div class="reveal reveal-delay-3 mt-12">
      <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full border" style="
        border-color: ${cs.primary}40;
        color: ${cs.secondary};
        font-size: 0.875rem;
      ">
        <span>↓</span>
        <span>滚动进入故事</span>
      </div>
    </div>
    
    <div class="reveal reveal-delay-4 mt-8 flex justify-center gap-3 flex-wrap">
      ${style_dna.mood_keywords.map(kw => `
        <span class="px-3 py-1 rounded-full text-xs" style="
          background: ${cs.primary}15;
          color: ${cs.primary};
          border: 1px solid ${cs.primary}30;
        ">${kw}</span>
      `).join('')}
    </div>
  </div>
</section>`;
}
