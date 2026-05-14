"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { Wand2, Compass, Library, LogIn, LogOut, User } from "lucide-react";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-black/40 border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-white font-bold text-lg">
          <Wand2 className="w-6 h-6 text-purple-400" />
          <span>知乎故事重塑工坊</span>
        </Link>

        <div className="flex items-center gap-1 md:gap-4">
          <Link
            href="/community"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition text-sm"
          >
            <Compass className="w-4 h-4" />
            <span className="hidden md:inline">社区广场</span>
          </Link>

          {session?.user ? (
            <>
              <Link
                href="/my-works"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition text-sm"
              >
                <Library className="w-4 h-4" />
                <span className="hidden md:inline">我的作品</span>
              </Link>
              <div className="flex items-center gap-2 ml-2">
                {session.user.image && (
                  <img
                    src={session.user.image}
                    alt="avatar"
                    className="w-8 h-8 rounded-full border border-white/20"
                  />
                )}
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden md:inline">退出</span>
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={() => signIn("zhihu")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition text-sm font-medium"
            >
              <LogIn className="w-4 h-4" />
              <span>知乎登录</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
