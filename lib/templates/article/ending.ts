import { Scene, ArticleScript } from "../../types";
import { escapeHtml } from "../../pipeline/shared";

export function renderArticleEnding(scene: Scene, script: ArticleScript): string {
  const cs = script.style_dna.color_scheme;
  const paragraphs = scene.content.paragraphs || [];

  return `<section class="scene article-ending" id="${scene.id}">
  <div class="text-center max-w-xl mx-auto px-6">
    <div class="reveal mb-8">
      <svg width="64" height="64" viewBox="0 0 64 64" class="mx-auto mb-6" style="opacity:0.6">
        <circle cx="32" cy="32" r="30" fill="none" stroke="${cs.primary}" stroke-width="1.5" opacity="0.4"/>
        <path d="M20 32 L28 40 L44 24" fill="none" stroke="${cs.primary}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <h2 class="reveal reveal-delay-1 text-2xl font-bold mb-4" style="font-family:${script.style_dna.typography.heading};color:${cs.primary}">
      ${escapeHtml(scene.content.title || "阅读完成")}
    </h2>
    <div class="reveal reveal-delay-2 space-y-2 text-sm" style="color:${cs.text}88">
      ${paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("\n")}
    </div>
  </div>
</section>`;
}
