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
      authorization: {
        url: "https://openapi.zhihu.com/authorize",
        params: {
          response_type: "code",
          app_id: process.env.ZHIHU_APP_ID || "",
          redirect_uri: process.env.ZHIHU_REDIRECT_URI || "",
        },
      },
      token: {
        async request({ params }) {
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
          return getUserInfo(tokens.access_token as string);
        },
      },
      profile(profile) {
        return {
          id: String(profile.uid),
          name: profile.fullname,
          image: profile.avatar_path,
          email: profile.email || "",
        };
      },
      clientId: process.env.ZHIHU_APP_ID || "",
      clientSecret: process.env.ZHIHU_APP_SECRET || "",
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
