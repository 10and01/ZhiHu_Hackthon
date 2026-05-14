import { Scene, ArticleScript } from "../../types";
import { escapeHtml } from "../../pipeline/shared";

export function renderArticleCover(scene: Scene, script: ArticleScript): string {
  const { meta } = script;
  const cs = script.style_dna.color_scheme;
  const paragraphs = scene.content.paragraphs || [];

  return `<section class="scene article-cover" id="${scene.id}" data-scene-idx="0">
  <div class="text-center max-w-3xl mx-auto px-6">
    <div class="reveal">
      <span class="inline-block px-3 py-1 rounded-full text-xs font-medium mb-6" style="background:${cs.primary}22;color:${cs.primary};border:1px solid ${cs.primary}44">
        ${escapeHtml(meta.category)}
      </span>
    </div>
    <h1 class="reveal reveal-delay-1 font-bold mb-6" style="font-family:${script.style_dna.typography.heading};font-size:clamp(2rem,6vw,4.5rem);line-height:1.1;color:${cs.primary};text-shadow:0 0 60px ${cs.primary}44">
      ${escapeHtml(scene.content.title || meta.title)}
    </h1>
    <div class="reveal reveal-delay-2 flex items-center justify-center gap-4 text-sm mb-8" style="color:${cs.text}88">
      <span>${escapeHtml(paragraphs[0] || meta.author)}</span>
      <span>·</span>
      <span>${escapeHtml(paragraphs[2] || meta.reading_time + " 分钟阅读")}</span>
    </div>
    <p class="reveal reveal-delay-3 text-lg max-w-xl mx-auto leading-relaxed" style="color:${cs.text}aa">
      ${escapeHtml(paragraphs[1] || meta.abstract)}
    </p>
    <div class="reveal reveal-delay-3 mt-12 animate-bounce" style="color:${cs.text}44">
      ↓ 滚动阅读
    </div>
  </div>
</section>`;
}
