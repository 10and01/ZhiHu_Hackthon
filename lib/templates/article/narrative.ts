import { Scene, ArticleScript } from "../../types";
import { escapeHtml } from "../../pipeline/shared";

export function renderArticleNarrative(scene: Scene, script: ArticleScript): string {
  const cs = script.style_dna.color_scheme;
  const paragraphs = scene.content.paragraphs || [];
  const sectionIndex = scene.content.sectionIndex ?? scene.chapterIndex;

  return `<section class="scene article-narrative" id="${scene.id}" data-section-index="${sectionIndex}" data-scene-idx="${scene.chapterIndex}">
  <div class="max-w-2xl mx-auto px-6 w-full">
    <div class="space-y-6">
      ${paragraphs.map((p, i) => `<p class="reveal ${i > 0 ? `reveal-delay-${Math.min(i, 3)}` : ""}" style="font-size:1.0625rem;line-height:1.8;color:${cs.text}dd;text-indent:2em">
        ${escapeHtml(p)}
      </p>`).join("\n")}
    </div>
  </div>
</section>`;
}
