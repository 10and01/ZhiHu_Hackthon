"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, Heart, Download, Trash2, Share2, ExternalLink } from "lucide-react";

interface WorkCardProps {
  work: any;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

export default function WorkCard({ work, onDelete, showActions = true }: WorkCardProps) {
  const meta = JSON.parse(work.metaJson || "{}");
  const colors = meta.color_scheme || {};

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group rounded-xl bg-white/5 border border-white/10 overflow-hidden hover:border-purple-500/30 transition"
    >
      {/* Thumbnail preview */}
      <Link href={`/p/${work.id}`}>
        <div
          className="h-40 flex items-center justify-center relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${colors.primary || "#1e1b4b"}, ${colors.bg || "#0f0f1a"})`,
          }}
        >
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)]" />
          <h3 className="text-white font-bold text-lg px-4 text-center relative z-10 line-clamp-2">
            {work.title}
          </h3>
          <div className="absolute bottom-2 right-2 flex gap-1">
            {(meta.mood_tags || []).slice(0, 2).map((tag: string) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded bg-black/30 text-white/80 text-[10px]"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </Link>

      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          {work.user?.avatarUrl && (
            <img
              src={work.user.avatarUrl}
              alt=""
              className="w-5 h-5 rounded-full"
            />
          )}
          <span className="text-xs text-gray-400 truncate">
            {work.user?.screenName || "匿名用户"}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {work.viewCount}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="w-3 h-3" />
            {work._count?.likes || 0}
          </span>
          <span>{new Date(work.createdAt).toLocaleDateString()}</span>
        </div>

        {showActions && (
          <div className="flex items-center gap-2">
            <Link
              href={`/p/${work.id}`}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs transition"
            >
              <ExternalLink className="w-3 h-3" />
              预览
            </Link>
            <a
              href={`/api/works/${work.id}/download`}
              className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs transition"
            >
              <Download className="w-3 h-3" />
            </a>
            {work.isPublic ? (
              <span className="px-2 py-1 rounded bg-green-500/10 text-green-400 text-[10px]">
                已公开
              </span>
            ) : (
              <span className="px-2 py-1 rounded bg-gray-500/10 text-gray-500 text-[10px]">
                私密
              </span>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(work.id)}
                className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-300 hover:text-red-400 text-xs transition"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
