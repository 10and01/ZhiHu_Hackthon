"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Library, LogIn, Loader2 } from "lucide-react";
import Link from "next/link";
import WorkCard from "@/components/WorkCard";

export default function MyWorksPage() {
  const { data: session, status } = useSession();
  const [works, setWorks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      setLoading(false);
      return;
    }
    if (status === "authenticated") {
      fetch("/api/works")
        .then((res) => res.json())
        .then((data) => {
          setWorks(data.error ? [] : data);
          setLoading(false);
        });
    }
  }, [status]);

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个作品吗？")) return;
    try {
      const res = await fetch(`/api/works/${id}`, { method: "DELETE" });
      if (res.ok) {
        setWorks((prev) => prev.filter((w) => w.id !== id));
      }
    } catch {}
  };

  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-gray-400">
        <LogIn className="w-12 h-12 mb-4 text-gray-600" />
        <p className="mb-4">请先登录知乎账号</p>
        <Link
          href="/"
          className="px-6 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-500 transition"
        >
          去登录
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Library className="w-6 h-6 text-purple-400" />
        <h1 className="text-2xl font-bold text-white">我的作品库</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        </div>
      ) : works.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="mb-4">还没有作品，去首页生成一个吧！</p>
          <Link
            href="/"
            className="px-6 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-500 transition"
          >
            去创作
          </Link>
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {works.map((work) => (
              <WorkCard
                key={work.id}
                work={work}
                onDelete={handleDelete}
                showActions={true}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
