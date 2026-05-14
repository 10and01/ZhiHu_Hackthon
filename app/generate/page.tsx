"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wand2,
  Save,
  Share2,
  Check,
  Loader2,
  ArrowLeft,
  Download,
} from "lucide-react";
import SandboxPreview from "@/components/SandboxPreview";
import AiDecisionPanel from "@/components/AiDecisionPanel";

export default function GeneratePage() {
  const [result, setResult] = useState<any>(null);
  const [content, setContent] = useState("");
  const [phase, setPhase] = useState<"generating" | "done">("generating");
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [savedWork, setSavedWork] = useState<any>(null);
  const [showDecision, setShowDecision] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const r = sessionStorage.getItem("generated_result");
    const c = sessionStorage.getItem("generated_content");
    if (!r || !c) {
      router.push("/");
      return;
    }
    setResult(JSON.parse(r));
    setContent(c);

    // 模拟动效时间
    const timer = setTimeout(() => setPhase("done"), 2500);
    return () => clearTimeout(timer);
  }, [router]);

  // 粒子动效
  useEffect(() => {
    if (phase !== "generating") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = content.split("").slice(0, 200);
    const particles = chars.map((char, i) => ({
      x: canvas.width / 2 + (Math.random() - 0.5) * 200,
      y: canvas.height / 2 + (Math.random() - 0.5) * 100,
      char,
      vx: (Math.random() - 0.5) * 4,
      vy: -Math.random() * 3 - 1,
      opacity: 1,
      size: 14 + Math.random() * 10,
    }));

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.99;
        p.opacity -= 0.008;
        if (p.opacity > 0) {
          ctx.globalAlpha = p.opacity;
          ctx.font = `${p.size}px monospace`;
          ctx.fillStyle = Math.random() > 0.7 ? "#c084fc" : "#e2e8f0";
          ctx.fillText(p.char, p.x, p.y);
        }
      });
      animId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animId);
  }, [phase, content]);

  const handleSave = async () => {
    if (!session?.user) {
      alert("请先登录知乎账号");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/works", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: content.split("\n")[0].replace("# ", "").slice(0, 50) || "未命名作品",
          sourceUrl: "",
          htmlCode: result.htmlCode,
          metaJson: JSON.stringify({ ...result.metaJson, mode: result.mode }),
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSavedWork(data);
      alert("已保存到个人作品库！");
    } catch (err: any) {
      alert("保存失败: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!savedWork) {
      await handleSave();
    }
    if (!savedWork?.id) return;

    setPublishing(true);
    try {
      const res = await fetch(`/api/works/${savedWork.id}/publish`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      alert("已发布到社区广场！");
      router.push("/community");
    } catch (err: any) {
      alert("发布失败: " + err.message);
    } finally {
      setPublishing(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([result.htmlCode], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `repage-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!result) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {phase === "generating" && (
          <motion.div
            key="generating"
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50"
          >
            <canvas
              ref={canvasRef}
              className="absolute inset-0"
            />
            <div className="relative z-10 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="inline-flex mb-6"
              >
                <Wand2 className="w-12 h-12 text-purple-400" />
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">
                AI 正在重塑你的故事...
              </h2>
              <p className="text-gray-400">
                分析情绪 · 设计视觉 · 生成交互
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {phase === "done" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto px-4 py-8"
        >
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" />
              返回首页
            </button>

            <div className="flex items-center gap-2">
              {result.mode && (
                <span className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                  result.mode === "article"
                    ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                    : "bg-purple-500/20 text-purple-300 border-purple-500/30"
                }`}>
                  {result.mode === "article" ? "📄 文章模式" : "📖 故事模式"}
                </span>
              )}
              <button
                onClick={() => setShowDecision(!showDecision)}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-sm transition"
              >
                {showDecision ? "隐藏" : "查看"} AI 设计决策
              </button>
            </div>
          </div>

          <div className="flex gap-6 flex-col lg:flex-row">
            {/* Preview */}
            <div className="flex-1">
              <div className="rounded-2xl overflow-hidden border border-white/10 bg-slate-900/50">
                <SandboxPreview htmlCode={result.htmlCode} />
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-center gap-4 mt-6">
                <button
                  onClick={handleSave}
                  disabled={saving || !!savedWork}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-purple-600/50 text-white font-medium transition"
                >
                  {savedWork ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {savedWork ? "已保存" : saving ? "保存中..." : "保存到作品库"}
                </button>

                <button
                  onClick={handlePublish}
                  disabled={publishing}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white font-medium transition"
                >
                  <Share2 className="w-4 h-4" />
                  {publishing ? "发布中..." : "分享到社区"}
                </button>

                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition"
                >
                  <Download className="w-4 h-4" />
                  下载代码
                </button>
              </div>

              {!session?.user && (
                <p className="text-center text-sm text-gray-500 mt-4">
                  登录后可保存作品并分享到社区广场
                </p>
              )}
            </div>

            {/* AI Decision Panel */}
            {showDecision && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-full lg:w-80"
              >
                <AiDecisionPanel meta={result.metaJson} mode={result.mode} />
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
