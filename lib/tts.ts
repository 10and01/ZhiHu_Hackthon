import { StoryScript, Scene, TTSConfig } from "./types";
import { getStylePresetByGenre } from "./style-presets";
import { getProviderConfig } from "./pipeline/shared";

// ============================================
// TTS 生成主入口
// ============================================

export async function generateTTSForStory(
  storyScript: StoryScript,
  sceneList: Scene[],
  apiKey: string
): Promise<Record<string, string>> {
  const ttsUrls: Record<string, string> = {};

  // 获取风格对应的音色配置
  const preset = getStylePresetByGenre(storyScript.meta.genre);
  const ttsConfig: TTSConfig = {
    voice: preset.voiceMapping.voice,
    format: "wav",
  };

  // 按章节分组生成 TTS
  const chapterScenes = groupScenesByChapter(sceneList);

  for (const [chapterIndex, scenes] of Object.entries(chapterScenes)) {
    // 收集该章节的所有文本
    const texts = scenes
      .map((s) => buildTTSText(s))
      .filter(Boolean);

    if (texts.length === 0) continue;

    const fullText = texts.join("\n");

    // 限制文本长度（MiMo TTS 有上下文限制）
    const truncatedText = fullText.slice(0, 1500);

    // 构建风格控制指令（放到 user message 中）
    const styleHint = buildTTSStyleHint(scenes, preset.voiceMapping.styleHint);

    try {
      const audioUrl = await generateTTSAudio(truncatedText, styleHint, ttsConfig, apiKey);
      ttsUrls[chapterIndex] = audioUrl;
    } catch (err) {
      console.error(`TTS generation failed for chapter ${chapterIndex}:`, err);
    }
  }

  return ttsUrls;
}

// ============================================
// 构建 TTS 合成文本
// ============================================

function buildTTSText(scene: Scene): string {
  const paragraphs = scene.content.paragraphs || [];
  if (paragraphs.length === 0) return "";

  // 清理文本，移除 markdown 和特殊符号
  const cleanText = paragraphs
    .join("\n")
    .replace(/[#*_`~]/g, "")
    .replace(/\[.*?\]/g, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return cleanText;
}

// ============================================
// 构建 TTS 风格控制指令（user message）
// ============================================

function buildTTSStyleHint(scenes: Scene[], baseStyle: string): string {
  // 计算平均情绪
  let totalIntensity = 0;
  let totalValence = 0;
  let totalArousal = 0;
  for (const s of scenes) {
    totalIntensity += s.emotion.intensity;
    totalValence += s.emotion.valence;
    totalArousal += s.emotion.arousal;
  }
  const n = scenes.length;
  const intensity = totalIntensity / n;
  const valence = totalValence / n;
  const arousal = totalArousal / n;

  // 根据情绪生成风格指令
  let emotionHint = "";
  if (intensity > 0.8 && valence < -0.5) {
    emotionHint = "紧张，呼吸急促，";
  } else if (intensity > 0.8 && valence > 0.5) {
    emotionHint = "兴奋，语速加快，";
  } else if (arousal < 0.3) {
    emotionHint = "平静，缓慢，";
  } else if (valence < -0.7) {
    emotionHint = "悲伤，低沉，";
  } else if (valence > 0.7) {
    emotionHint = "温暖，微笑，";
  }

  return `${emotionHint}${baseStyle}`;
}

// ============================================
// 调用 MiMo TTS API (v2.5)
// ============================================

async function generateTTSAudio(
  text: string,
  styleHint: string,
  config: TTSConfig,
  apiKey: string
): Promise<string> {
  const { config: providerConfig } = getProviderConfig("mimo", apiKey);
  const res = await fetch(`${providerConfig.baseUrl}/chat/completions`, {
    method: "POST",
    headers: providerConfig.headers(apiKey),
    body: JSON.stringify({
      model: "mimo-v2.5-tts",
      messages: [
        { role: "user", content: styleHint || "请自然朗读以下内容" },
        { role: "assistant", content: text },
      ],
      audio: {
        format: config.format,
        voice: config.voice,
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`TTS API 失败: ${res.status} ${errText}`);
  }

  const data = await res.json();
  const audioBase64 = data.choices?.[0]?.message?.audio?.data;

  if (!audioBase64) {
    throw new Error("TTS 响应中未找到音频数据");
  }

  return `data:audio/wav;base64,${audioBase64}`;
}

// ============================================
// 辅助函数
// ============================================

function groupScenesByChapter(scenes: Scene[]): Record<string, Scene[]> {
  const groups: Record<string, Scene[]> = {};

  for (const scene of scenes) {
    const key = String(scene.chapterIndex);
    if (!groups[key]) groups[key] = [];
    groups[key].push(scene);
  }

  return groups;
}
