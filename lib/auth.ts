import { NextAuthOptions } from "next-auth";
import { prisma } from "./db";
import { getAccessToken, getUserInfo } from "./zhihu-api";

export const authOptions: NextAuthOptions = {
  providers: [
    {
      id: "zhihu",
      name: "知乎",
      type: "oauth",
      version: "2.0",
      // 禁用 NextAuth 的 state 检查，知乎黑客松 API 不支持
      checks: ["none"],
      authorization: {
        url: "https://openapi.zhihu.com/authorize",
        params: {
          app_id: process.env.ZHIHU_APP_ID || "",
          response_type: "code",
          // redirect_uri 由 NextAuth 自动从 NEXTAUTH_URL 推断并添加
          // 不要手动添加，避免重复
        },
      },
      token: {
        // 提供 token URL 满足 NextAuth 类型要求（虽然自定义 request 会覆盖实际请求）
        url: "https://openapi.zhihu.com/access_token",
        async request({ params }) {
          console.log("[Zhihu OAuth] Exchanging code for token, code:", params.code?.slice(0, 10) + "...");
          const { access_token, token_type, expires_in } = await getAccessToken(
            params.code as string
          );
          return {
            tokens: {
              access_token,
              token_type,
              expires_at: Math.floor(Date.now() / 1000) + expires_in,
            },
          };
        },
      },
      userinfo: {
        async request({ tokens }) {
          console.log("[Zhihu OAuth] Fetching user info");
          return getUserInfo(tokens.access_token as string);
        },
      },
      profile(profile) {
        console.log("[Zhihu OAuth] User profile:", profile.fullname, profile.uid);
        return {
          id: String(profile.uid),
          name: profile.fullname,
          image: profile.avatar_path,
          email: profile.email || "",
        };
      },
      // NextAuth 会自动把 clientId 作为 client_id 参数添加到授权 URL
      // 知乎黑客松 API 不认识 client_id，但应该能容忍（只是忽略）
      // 真正的 app_id 已通过 authorization.params 传入
      clientId: process.env.ZHIHU_APP_ID || "",
      // 兼容两种命名
      clientSecret: process.env.ZHIHU_APP_SECRET || process.env.ZHIHU_APP_KEY || "",
    },
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "zhihu" && user.id) {
        const zhihuUser = await getUserInfo(account.access_token as string);
        await prisma.user.upsert({
          where: { zhihuUid: String(zhihuUser.uid) },
          update: {
            screenName: zhihuUser.fullname,
            avatarUrl: zhihuUser.avatar_path,
            profileUrl: zhihuUser.url,
          },
          create: {
            zhihuUid: String(zhihuUser.uid),
            screenName: zhihuUser.fullname,
            avatarUrl: zhihuUser.avatar_path,
            profileUrl: zhihuUser.url,
          },
        });
      }
      return true;
    },
    async jwt({ token, account, user }) {
      if (account && user) {
        token.accessToken = account.access_token;
        token.zhihuUid = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).accessToken = token.accessToken;
      (session as any).zhihuUid = token.zhihuUid;
      return session;
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
