import { Scene, ArticleScript } from "../../types";
import { escapeHtml } from "../../pipeline/shared";

export function renderConceptCard(scene: Scene, script: ArticleScript): string {
  const concept = scene.content.concept;
  if (!concept) return "";

  const cs = script.style_dna.color_scheme;

  return `<section class="scene article-concept" id="${scene.id}" data-section-index="${scene.chapterIndex}">
  <div class="max-w-2xl mx-auto px-6 w-full">
    <div class="reveal concept-card">
      <div class="concept-term">${escapeHtml(concept.term)}</div>
      <div class="concept-explanation">${escapeHtml(concept.explanation)}</div>
      <div class="mt-3 flex items-center gap-2">
        <span class="text-xs px-2 py-0.5 rounded" style="background:${cs.primary}20;color:${cs.primary}">
          ${concept.complexity}
        </span>
      </div>
    </div>
  </div>
</section>`;
}
