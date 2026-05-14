import { Scene, ArticleScript } from "../../types";
import { escapeHtml } from "../../pipeline/shared";

export function renderDataHighlight(scene: Scene, script: ArticleScript): string {
  const dp = scene.content.dataPoint;
  if (!dp) return "";

  const cs = script.style_dna.color_scheme;

  return `<section class="scene article-data" id="${scene.id}" data-section-index="${scene.chapterIndex}">
  <div class="max-w-2xl mx-auto px-6 w-full">
    <div class="reveal data-highlight">
      <div class="data-value">${escapeHtml(dp.value)}</div>
      <div class="data-context">${escapeHtml(dp.context)}</div>
      ${dp.source ? `<div class="data-source">来源：${escapeHtml(dp.source)}</div>` : ""}
    </div>
  </div>
</section>`;
}
