"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Compass, Loader2 } from "lucide-react";
import WorkCard from "@/components/WorkCard";

export default function CommunityPage() {
  const [works, setWorks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("全部");

  useEffect(() => {
    fetch("/api/community")
      .then((res) => res.json())
      .then((data) => {
        setWorks(data.error ? [] : data);
        setLoading(false);
      });
  }, []);

  const allTags = Array.from(
    new Set(works.flatMap((w) => {
      try {
        return JSON.parse(w.metaJson || "{}").mood_tags || [];
      } catch {
        return [];
      }
    }))
  );

  const filtered =
    filter === "全部"
      ? works
      : works.filter((w) => {
          try {
            const tags = JSON.parse(w.metaJson || "{}").mood_tags || [];
            return tags.includes(filter);
          } catch {
            return false;
          }
        });

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Compass className="w-6 h-6 text-purple-400" />
          <h1 className="text-2xl font-bold text-white">社区广场</h1>
        </div>

        <div className="flex flex-wrap gap-2">
          {["全部", ...allTags.slice(0, 8)].map((tag) => (
            <button
              key={tag}
              onClick={() => setFilter(tag)}
              className={`px-3 py-1.5 rounded-lg text-sm transition ${
                filter === tag
                  ? "bg-purple-600 text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p>还没有公开作品，成为第一个分享的人吧！</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((work) => (
            <WorkCard
              key={work.id}
              work={work}
              showActions={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}
