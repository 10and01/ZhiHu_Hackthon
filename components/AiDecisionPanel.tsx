"use client";

import { Palette, Brain, Users, Clock, Dna, FileText, BookOpen } from "lucide-react";

export default function AiDecisionPanel({ meta, mode = "story" }: { meta: any; mode?: "story" | "article" }) {
  if (!meta) return null;

  const colors = meta.color_scheme || {};
  const curve = meta.emotion_curve || [];
  const isArticle = mode === "article";

  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-6">
      <h3 className="text-lg font-bold text-white flex items-center gap-2">
        <Brain className="w-5 h-5 text-purple-400" />
        AI 设计决策
      </h3>

      <div>
        <div className="text-sm text-gray-400 mb-2 flex items-center gap-2">
          {isArticle ? <FileText className="w-4 h-4" /> : <Dna className="w-4 h-4" />}
          {isArticle ? "文章分类" : "风格 DNA"}
        </div>
        <div className="text-white font-medium">
          {isArticle ? (meta.category || "综合") : (meta.style_dna || meta.genre || "未知")}
        </div>
        {isArticle && meta.abstract && (
          <div className="text-xs text-gray-500 mt-1 line-clamp-2">{meta.abstract}</div>
        )}
      </div>

      <div>
        <div className="text-sm text-gray-400 mb-2 flex items-center gap-2">
          <Palette className="w-4 h-4" />
          配色方案
        </div>
        <div className="flex gap-2">
          {colors.primary && (
            <div
              className="w-8 h-8 rounded-lg border border-white/20"
              style={{ backgroundColor: colors.primary }}
              title="主色"
            />
          )}
          {colors.secondary && (
            <div
              className="w-8 h-8 rounded-lg border border-white/20"
              style={{ backgroundColor: colors.secondary }}
              title="辅色"
            />
          )}
          {colors.bg && (
            <div
              className="w-8 h-8 rounded-lg border border-white/20"
              style={{ backgroundColor: colors.bg }}
              title="背景色"
            />
          )}
        </div>
        <div className="text-xs text-gray-500 mt-1 font-mono">
          {colors.primary} · {colors.secondary} · {colors.bg}
        </div>
      </div>

      <div>
        <div className="text-sm text-gray-400 mb-2">情绪标签</div>
        <div className="flex flex-wrap gap-1.5">
          {(meta.mood_tags || []).map((tag: string) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-300 text-xs border border-purple-500/20"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {curve.length > 0 && (
        <div>
          <div className="text-sm text-gray-400 mb-2">情绪曲线</div>
          <svg viewBox={`0 0 ${curve.length * 20} 60`} className="w-full h-12">
            <defs>
              <linearGradient id="emotionGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#f472b6" />
              </linearGradient>
            </defs>
            <polyline
              fill="none"
              stroke="url(#emotionGrad)"
              strokeWidth="2"
              points={curve
                .map((v: number, i: number) => `${i * 20 + 10},${60 - v * 50}`)
                .join(" ")}
            />
            {curve.map((v: number, i: number) => (
              <circle
                key={i}
                cx={i * 20 + 10}
                cy={60 - v * 50}
                r="3"
                fill="#c084fc"
              />
            ))}
          </svg>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
        <div>
          <div className="text-xs text-gray-500 flex items-center gap-1">
            {isArticle ? <BookOpen className="w-3 h-3" /> : <Users className="w-3 h-3" />}
            {isArticle ? "章节数" : "角色数"}
          </div>
          <div className="text-white font-medium">
            {isArticle ? (meta.section_count || 0) : (meta.character_count || 0)}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            阅读时间
          </div>
          <div className="text-white font-medium">
            {(meta.reading_time || meta.estimated_reading_time || 5)} 分钟
          </div>
        </div>
      </div>
    </div>
  );
}
