import { Scene, StoryScript } from "../types";

export function renderEnding(scene: Scene, script: StoryScript): string {
  const { meta, style_dna } = script;
  const cs = style_dna.color_scheme;

  return `
<section class="scene chapter-cover" data-scene="${scene.id}" data-emotion-idx="${scene.emotion.keyframeRef}" data-chapter="999">
  <div class="absolute inset-0" style="
    background: linear-gradient(180deg, ${cs.bg_gradient[0]} 0%, ${cs.bg} 50%, ${cs.bg_gradient[1]} 100%);
  "></div>
  
  <div class="relative z-10 text-center px-6 max-w-lg mx-auto">
    <div class="reveal">
      <p class="text-4xl mb-8">✦</p>
    </div>
    
    <h2 class="reveal reveal-delay-1 text-2xl md:text-3xl font-bold mb-6" style="
      font-family: var(--font-heading);
      color: ${cs.text};
    ">
      ${scene.content.title || "故事结束"}
    </h2>
    
    <div class="reveal reveal-delay-2">
      <p class="text-sm mb-2" style="color: ${cs.text}; opacity: 0.6">
        ${meta.title}
      </p>
      <p class="text-xs mb-8" style="color: ${cs.text}; opacity: 0.4">
        ${meta.author} · ${meta.genre}
      </p>
    </div>
    
    <div class="reveal reveal-delay-3">
      <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs" style="
        background: ${cs.primary}15;
        color: ${cs.secondary};
        border: 1px solid ${cs.primary}30;
      ">
        <span>🎨</span>
        <span>风格：${style_dna.name}</span>
      </div>
    </div>
    
    <div class="reveal reveal-delay-4 mt-12">
      <p class="text-xs" style="color: ${cs.text}; opacity: 0.3">
        由 知乎故事重塑工坊 生成
      </p>
    </div>
  </div>
</section>`;
}
