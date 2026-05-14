export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateHtml, AiProvider } from "@/lib/ai-generator";
import { generateTTSForStory } from "@/lib/tts";

function resolveApiKey(provider: AiProvider): string | undefined {
  switch (provider) {
    case "mimo":
      return process.env.MIMO_API_KEY || undefined;
    case "kimi":
      return process.env.KIMI_API_KEY || undefined;
    case "openai":
    default:
      return process.env.OPENAI_API_KEY || undefined;
  }
}

export async function POST(req: NextRequest) {
  try {
    // 鉴权：生成接口需要登录
    const session = await getServerSession(authOptions);
    if (!session?.zhihuUid) {
      return NextResponse.json({ error: "请先登录知乎账号" }, { status: 401 });
    }

    const { content, enableTTS = true, mode: userMode } = await req.json();
    
    if (!content || content.trim().length < 10) {
      return NextResponse.json({ error: "内容太短" }, { status: 400 });
    }

    const provider = (process.env.AI_PROVIDER as AiProvider) || "openai";
    let apiKey = resolveApiKey(provider);
    if (!apiKey || apiKey.includes("your_")) apiKey = undefined;

    console.log(`[AI Generate] provider=${provider}, hasKey=${!!apiKey}, enableTTS=${enableTTS}`);

    // 阶段 1-3: 分析 → 分镜 → 渲染 HTML
    const result = await generateHtml(content, apiKey, provider, userMode);
    console.log("[API Generate] result keys:", Object.keys(result || {}));
    console.log("[API Generate] htmlCode type:", typeof result?.htmlCode, "length:", result?.htmlCode?.length);

    if (!result || typeof result.htmlCode !== "string" || result.htmlCode.length === 0) {
      console.error("[API Generate] htmlCode missing or invalid, falling back to demo");
      // 降级：返回演示模板
      const { preprocessContent } = await import("@/lib/pipeline/shared");
      const { title, author, paragraphs } = preprocessContent(content);
      const safeTitle = title.replace(/["']/g, "");
      const demoHtml = `<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="UTF-8"><title>${safeTitle}</title>
<style>body{font-family:serif;background:#1a1a2e;color:#eee;padding:2rem;line-height:1.8;max-width:700px;margin:0 auto;}</style>
</head><body><h1>${safeTitle}</h1><p>作者：${author}</p><hr/>${paragraphs.slice(0,20).map(p=>`<p>${p}</p>`).join("")}</body></html>`;
      return NextResponse.json({
        htmlCode: demoHtml,
        metaJson: { title, author, genre: "演示", estimated_reading_time: 5, total_word_count: content.length },
        sceneList: [],
        mode: userMode || "story",
      });
    }

    // 阶段 4: 生成 TTS（异步，失败不影响主流程）
    let ttsUrls: Record<string, string> = {};
    if (enableTTS && apiKey && result.mode === "story" && result.storyScript && result.sceneList.length > 0) {
      try {
        ttsUrls = await generateTTSForStory(
          result.storyScript,
          result.sceneList,
          apiKey
        );
        console.log(`[TTS] Generated ${Object.keys(ttsUrls).length} chapter audios`);
      } catch (ttsErr) {
        console.error("[TTS] Generation failed:", ttsErr);
      }
    }

    // 将 TTS URL 注入 HTML
    let finalHtml = result.htmlCode;
    if (Object.keys(ttsUrls).length > 0) {
      const ttsMapScript = `<script>window.PRELOADED_TTS_MAP = ${JSON.stringify(ttsUrls)};</script>`;
      finalHtml = finalHtml.replace("</head>", `${ttsMapScript}\n</head>`);
    }

    return NextResponse.json({
      htmlCode: finalHtml,
      metaJson: result.metaJson,
      storyScript: result.storyScript,
      articleScript: result.articleScript,
      sceneList: result.sceneList,
      ttsUrls,
      mode: result.mode,
    });
  } catch (err: any) {
    console.error("Generate error:", err);
    return NextResponse.json(
      { error: err.message || "生成失败" },
      { status: 500 }
    );
  }
}
