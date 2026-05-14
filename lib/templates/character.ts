import { Scene, StoryScript } from "../types";

export function renderCharacterCard(scene: Scene, script: StoryScript): string {
  const { style_dna, characters } = script;
  const cs = style_dna.color_scheme;
  const charName = scene.content.title || "";
  const char = characters.find((c) => c.name === charName);
  
  if (!char) return "";

  const roleLabels: Record<string, string> = {
    protagonist: "主角",
    antagonist: "反派",
    supporting: "配角",
    emotional_anchor: "情感锚点",
  };

  return `
<section class="scene chapter-cover" data-scene="${scene.id}" data-emotion-idx="${scene.emotion.keyframeRef}" data-chapter="${scene.chapterIndex}">
  <div class="absolute inset-0" style="background: ${cs.bg}"></div>
  
  <div class="relative z-10 flex items-center justify-center min-h-screen px-4 py-16">
    <div class="character-card" style="--char-color: ${char.color}">
      <div class="character-header" onclick="toggleCharacterCard(this)">
        <div class="character-avatar" style="background: linear-gradient(135deg, ${char.color}, ${char.color}88)">
          ${char.emoji || "👤"}
        </div>
        <div class="flex-1">
          <div class="character-name" style="color: ${char.color}">${char.name}</div>
          <div class="flex items-center gap-2 mt-1">
            <span class="character-role">${roleLabels[char.role] || char.role}</span>
            <span class="text-xs" style="color: ${cs.text}; opacity: 0.4">点击展开档案 ▼</span>
          </div>
        </div>
      </div>
      
      <div class="character-body">
        ${char.visual_symbol ? `
        <div class="mb-3 text-sm" style="color: ${cs.text}; opacity: 0.7">
          <strong>视觉符号：</strong>${char.visual_symbol}
        </div>
        ` : ""}
        
        ${char.arc ? `
        <div class="mb-3 text-sm" style="color: ${cs.text}; opacity: 0.7">
          <strong>角色弧线：</strong>${char.arc}
        </div>
        ` : ""}
        
        <div class="flex flex-wrap gap-1 mt-3">
          ${char.traits.map((t) => `
            <span class="character-trait" style="--char-color: ${char.color}">${t}</span>
          `).join("")}
        </div>
      </div>
    </div>
  </div>
</section>`;
}
