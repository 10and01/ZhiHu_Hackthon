import { NextRequest, NextResponse } from "next/server";

/**
 * 自定义知乎 OAuth 授权入口
 * 完全按照知乎黑客松官方文档构造授权 URL，避免 NextAuth 自动注入 client_id/state 等参数
 */
export async function GET(req: NextRequest) {
  const appId = process.env.ZHIHU_APP_ID || "";
  // 优先使用环境变量，否则从请求 origin 推断
  const redirectUri =
    process.env.ZHIHU_REDIRECT_URI ||
    `${req.nextUrl.origin}/api/auth/callback/zhihu`;

  if (!appId) {
    console.error("[Zhihu OAuth] ZHIHU_APP_ID not configured");
    return NextResponse.json(
      { error: "ZHIHU_APP_ID 未配置" },
      { status: 500 }
    );
  }

  // 严格按官方文档格式构造 URL:
  // https://openapi.zhihu.com/authorize?redirect_uri={redirect_uri}&app_id={app_id}&response_type=code
  const authUrl = new URL("https://openapi.zhihu.com/authorize");
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("app_id", appId);
  authUrl.searchParams.set("response_type", "code");

  console.log("[Zhihu OAuth] Redirecting to authorize URL:", authUrl.toString());
  return NextResponse.redirect(authUrl.toString());
}
