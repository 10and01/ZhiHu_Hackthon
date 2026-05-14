import { Scene, StoryScript } from "../types";

export function renderChapterTitle(scene: Scene, script: StoryScript): string {
  const { style_dna } = script;
  const cs = style_dna.color_scheme;
  const idx = scene.chapterIndex;

  return `
<section class="scene chapter-cover" data-scene="${scene.id}" data-emotion-idx="${scene.emotion.keyframeRef}" data-chapter="${idx}">
  <div class="absolute inset-0" style="
    background: linear-gradient(180deg, ${cs.bg_gradient[0]} 0%, ${cs.bg_gradient[1]} 60%, ${cs.bg} 100%);
  "></div>
  
  <div class="relative z-10 text-center px-6">
    <div class="reveal">
      <p class="chapter-number">CHAPTER ${String(idx + 1).padStart(2, "0")}</p>
    </div>
    
    <h2 class="reveal reveal-delay-1 chapter-title" style="color: ${cs.text}">
      ${scene.content.title || ""}
    </h2>
    
    <div class="reveal reveal-delay-2">
      <div class="chapter-divider mx-auto"></div>
    </div>
    
    ${scene.content.paragraphs[1] ? `
    <div class="reveal reveal-delay-3 mt-6">
      <p class="text-sm max-w-sm mx-auto" style="color: ${cs.text}; opacity: 0.5">
        ${scene.content.paragraphs[1]}
      </p>
    </div>
    ` : ""}
    
    <div class="reveal reveal-delay-4 mt-10">
      <span class="inline-block w-6 h-10 border-2 border-white/20 rounded-full relative">
        <span class="absolute top-2 left-1/2 -translate-x-1/2 w-1 h-2 bg-white/40 rounded-full animate-bounce"></span>
      </span>
    </div>
  </div>
</section>`;
}
