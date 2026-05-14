import { Scene, ArticleScript } from "../../types";
import { escapeHtml } from "../../pipeline/shared";

export function renderSectionTitle(scene: Scene, script: ArticleScript): string {
  const cs = script.style_dna.color_scheme;
  const paragraphs = scene.content.paragraphs || [];
  const sectionIndex = scene.content.sectionIndex ?? scene.chapterIndex;

  return `<section class="scene article-section-title" id="${scene.id}" data-section-index="${sectionIndex}" data-scene-idx="${scene.chapterIndex}">
  <div class="max-w-3xl mx-auto px-6 w-full">
    <div class="reveal">
      <span class="text-xs font-bold tracking-widest uppercase mb-4 block" style="color:${cs.primary}88">
        SECTION ${String(sectionIndex + 1).padStart(2, "0")}
      </span>
      <h2 class="font-bold mb-8" style="font-family:${script.style_dna.typography.heading};font-size:clamp(1.5rem,4vw,2.75rem);line-height:1.2;color:${cs.secondary}">
        ${escapeHtml(scene.content.title || "")}
      </h2>
    </div>
    <div class="reveal reveal-delay-1 grid gap-3">
      ${paragraphs.map((p) => `<div class="flex items-start gap-3">
        <span class="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style="background:${cs.accent}"></span>
        <span class="text-base leading-relaxed" style="color:${cs.text}cc">${escapeHtml(p)}</span>
      </div>`).join("\n")}
    </div>
  </div>
</section>`;
}
