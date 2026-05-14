"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Download, Eye, Heart, Sparkles } from "lucide-react";
import Link from "next/link";
import SandboxPreview from "@/components/SandboxPreview";
import AiDecisionPanel from "@/components/AiDecisionPanel";

export default function PreviewPage() {
  const { id } = useParams();
  const [work, setWork] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDecision, setShowDecision] = useState(false);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/works/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setWork(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const handleDownload = () => {
    if (!work) return;
    const blob = new Blob([work.htmlCode], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeTitle = work.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, "_");
    a.download = `repage-${safeTitle}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLike = async () => {
    try {
      const res = await fetch(`/api/community/${id}/like`, { method: "POST" });
      const data = await res.json();
      if (!data.error) {
        setLiked(data.liked);
      }
    } catch {}
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !work) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-gray-400">
        <p className="mb-4">{error || "作品不存在"}</p>
        <Link href="/" className="text-purple-400 hover:underline">
          返回首页
        </Link>
      </div>
    );
  }

  const meta = JSON.parse(work.metaJson || "{}");

  return (
    <div className="min-h-screen">
      {/* Floating Toolbar */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-16 z-40 bg-slate-900/80 backdrop-blur-md border-b border-white/10"
      >
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-gray-400 hover:text-white transition text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              返回
            </Link>
            <h1 className="text-white font-medium truncate max-w-xs md:max-w-md">
              {work.title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDecision(!showDecision)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden md:inline">AI 决策</span>
            </button>
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition ${
                liked
                  ? "bg-pink-600 text-white"
                  : "bg-white/5 hover:bg-white/10 text-gray-300"
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${liked ? "fill-current" : ""}`} />
              <span>{work._count?.likes || 0}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">下载</span>
            </button>
          </div>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto px-4 py-8 flex gap-6 flex-col lg:flex-row">
        <div className="flex-1">
          <div className="rounded-2xl overflow-hidden border border-white/10 bg-slate-900/50">
            <SandboxPreview htmlCode={work.htmlCode} />
          </div>
        </div>

        {showDecision && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-80"
          >
            <AiDecisionPanel meta={meta} mode={meta.mode || "story"} />
            <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-sm text-gray-400 mb-2">作者</div>
              <div className="flex items-center gap-2">
                {work.user?.avatarUrl && (
                  <img
                    src={work.user.avatarUrl}
                    alt=""
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <span className="text-white text-sm">
                  {work.user?.screenName || "匿名用户"}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {work.viewCount} 次浏览
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
