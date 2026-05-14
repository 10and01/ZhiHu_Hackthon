import { Scene, StoryScript } from "../types";

export function renderDialogue(scene: Scene, script: StoryScript): string {
  const { style_dna, characters } = script;
  const cs = style_dna.color_scheme;

  // 尝试识别对话中的发言者
  const dialogues = parseDialogues(scene.content.paragraphs, characters);

  return `
<section class="scene chapter-content" data-scene="${scene.id}" data-emotion-idx="${scene.emotion.keyframeRef}" data-chapter="${scene.chapterIndex}">
  <div class="absolute inset-0" style="
    background: linear-gradient(180deg, ${cs.bg} 0%, ${cs.bg_gradient[0]} 100%);
  "></div>
  
  <div class="relative z-10 max-w-xl mx-auto px-4 py-16">
    <div class="dialogue-container">
      ${dialogues.map((d, i) => {
        const char = characters.find((c) => c.name === d.speaker);
        const isLeft = i % 2 === 0;
        const charColor = char?.color || cs.secondary;
        const charEmoji = char?.emoji || "👤";
        
        return `
      <div class="dialogue-row ${isLeft ? 'left' : 'right'} reveal reveal-delay-${Math.min(i + 1, 5)}">
        <div class="character-avatar flex-shrink-0" style="
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, ${charColor}, ${charColor}88);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
        ">${charEmoji}</div>
        <div class="dialogue-bubble ${isLeft ? 'left' : 'right'}" style="
          ${isLeft 
            ? `background: ${charColor}18; border-color: ${charColor}30;` 
            : `background: ${charColor}18; border-color: ${charColor}30;`
          }
        ">
          <div class="dialogue-speaker" style="color: ${charColor}">${d.speaker}</div>
          <div>${escapeHtml(d.text)}</div>
        </div>
      </div>`;
      }).join("\n")}
    </div>
  </div>
</section>`;
}

interface ParsedDialogue {
  speaker: string;
  text: string;
}

function parseDialogues(paragraphs: string[], characters: StoryScript["characters"]): ParsedDialogue[] {
  const result: ParsedDialogue[] = [];
  
  for (const para of paragraphs) {
    // 尝试匹配「某人：...」或 "某人: ..." 格式
    const match = para.match(/^([^「"'\n:]+)[：:](.+)$/);
    if (match) {
      result.push({ speaker: match[1].trim(), text: match[2].trim() });
      continue;
    }
    
    // 尝试匹配「...」引号内的对话，尝试推断发言者
    const quoteMatch = para.match(/[「"']([^"'」]+)["'」]/g);
    if (quoteMatch) {
      // 简化处理：如果没有明确发言者，使用段落中的角色名或默认"旁白"
      const speaker = characters.find((c) => para.includes(c.name))?.name || "...";
      result.push({ speaker, text: para });
      continue;
    }
    
    // 默认作为叙述
    result.push({ speaker: "叙述", text: para });
  }
  
  return result;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
