"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Wand2,
  Sparkles,
  FileText,
  ArrowRight,
  Loader2,
  Upload,
  X,
  LogIn,
} from "lucide-react";
import { signIn } from "next-auth/react";
import stories from "@/data/stories.json";


export default function Home() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [selectedMode, setSelectedMode] = useState<"story" | "article">("story");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { data: session, status } = useSession();

  // 不再自动跳转，改为显示登录按钮让用户主动点击
  // 避免 NextAuth 构造包含 client_id/state 的授权 URL

  const handleGenerate = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: input, enableTTS: false, mode: selectedMode }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      sessionStorage.setItem("generated_result", JSON.stringify(data));
      sessionStorage.setItem("generated_content", input);
      router.push("/generate");
    } catch (err: any) {
      alert("生成失败: " + err.message);
      setLoading(false);
    }
  };

  const fillExample = (content: string) => {
    setInput(content);
    setFileName("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setInput(data.content);
      setFileName(data.fileName);
    } catch (err: any) {
      alert("上传失败: " + err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const clearInput = () => {
    setInput("");
    setFileName("");
  };



  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm mb-6">
          <Sparkles className="w-4 h-4" />
          知乎黑客松 · AI 赋能内容创作
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
          让故事，变成一场电影
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          粘贴一篇知乎故事，AI 自动分析情绪、角色与节奏，
          为你生成一部沉浸式交互网页。
        </p>
      </div>

      {status === "loading" ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        </div>
      ) : session?.user ? (
        <>
          {/* Mode Selector */}
          <div className="max-w-3xl mx-auto mb-4">
            <div className="flex items-center justify-center gap-2">
              {([
                { key: "story", label: "📖 故事模式", desc: "适合小说、叙事文" },
                { key: "article", label: "📄 文章模式", desc: "适合科普、教程、观点" },
              ] as const).map((m) => (
                <button
                  key={m.key}
                  onClick={() => setSelectedMode(m.key)}
                  className={`relative px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                    selectedMode === m.key
                      ? m.key === "article"
                        ? "bg-blue-500/20 text-blue-300 border-blue-500/40 shadow-lg shadow-blue-500/10"
                        : "bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-lg shadow-purple-500/10"
                      : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-gray-300"
                  }`}
                  title={m.desc}
                >
                  {m.label}
                  {selectedMode === m.key && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-current opacity-80" />
                  )}
                </button>
              ))}
            </div>
            <p className="text-center text-xs text-gray-500 mt-2">
              {selectedMode === "story" && "提取角色、情绪曲线、章节节拍，生成沉浸式叙事体验"}
              {selectedMode === "article" && "提取概念、数据、可视化建议，生成结构化知识页面"}
            </p>
          </div>

          {/* Input */}
          <div className="max-w-3xl mx-auto mb-20">
            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="粘贴知乎文章链接、Markdown 或纯文本...&#10;&#10;支持：&#10;· 直接粘贴故事全文&#10;· Markdown 格式&#10;· 上传 .txt / .md 文件"
                className={`w-full h-64 bg-slate-900/50 border rounded-2xl p-6 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 resize-none text-base leading-relaxed transition ${
                  selectedMode === "article"
                    ? "border-blue-500/20 focus:ring-blue-500/50 focus:border-blue-500/40"
                    : "border-purple-500/20 focus:ring-purple-500/50 focus:border-purple-500/40"
                }`}
              />

              {/* 文件名显示 */}
              {fileName && (
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-sm">
                  <FileText className="w-3 h-3" />
                  <span>{fileName}</span>
                  <button onClick={clearInput} className="hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              <div className="absolute bottom-4 right-4 flex gap-2">
                {/* 上传按钮 */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/10 transition disabled:opacity-50"
                >
                  {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  上传文件
                </button>

                <button
                  onClick={clearInput}
                  className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/10 transition"
                >
                  清空
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={loading || !input.trim()}
                  className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      开始重塑
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* 未登录状态：显示登录入口 */
        <div className="max-w-xl mx-auto text-center">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-10">
            <LogIn className="w-12 h-12 text-purple-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-3">
              登录后即可使用
            </h2>
            <p className="text-gray-400 mb-8">
              使用知乎账号一键登录，开始创作你的沉浸式故事体验
            </p>
            <a
              href="/api/auth/zhihu/authorize"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium transition"
            >
              <LogIn className="w-5 h-5" />
              知乎账号登录
            </a>
          </div>
        </div>
      )}

      {/* Examples */}
      <div>
        <div className="flex items-center gap-2 mb-8">
          <FileText className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl font-bold text-white">示例故事，一键体验</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stories.map((story: any) => (
            <div
              key={story.id}
              className="text-left p-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/30 transition group relative"
            >
              <button
                onClick={() => fillExample(story.content)}
                className="w-full text-left"
              >
                <h3 className="font-semibold text-white mb-2 group-hover:text-purple-300 transition">
                  {story.title}
                </h3>
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                  {story.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {story.tags.slice(0, 3).map((tag: string) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md bg-white/5 text-xs text-gray-500"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </button>
              <div className="flex items-center justify-between mt-3">
                <span className="flex items-center gap-1 text-purple-400 text-sm opacity-0 group-hover:opacity-100 transition">
                  <span>点击填充</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
                {story.id === "1644038836790169600" && (
                  <a
                    href="/examples/repage-1778669394194.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-cyan-400 hover:text-cyan-300 underline underline-offset-2 opacity-0 group-hover:opacity-100 transition"
                  >
                    预览效果 →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
