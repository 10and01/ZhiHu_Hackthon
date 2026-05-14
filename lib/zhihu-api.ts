import crypto from "crypto";

const BASE_URL = "https://openapi.zhihu.com";

function getCredentials() {
  const appKey = process.env.ZHIHU_APP_KEY || "";
  const appSecret = process.env.ZHIHU_APP_SECRET || "";
  if (!appKey || !appSecret) {
    throw new Error("ZHIHU_APP_KEY 或 ZHIHU_APP_SECRET 未配置");
  }
  return { appKey, appSecret };
}

export function generateSign(
  appKey: string,
  appSecret: string,
  timestamp: string,
  logId: string,
  extraInfo: string = ""
): string {
  const signStr = `app_key:${appKey}|ts:${timestamp}|logid:${logId}|extra_info:${extraInfo}`;
  const hmac = crypto.createHmac("sha256", appSecret);
  hmac.update(signStr);
  return hmac.digest("base64");
}

export function buildHeaders(extraInfo: string = "") {
  const { appKey, appSecret } = getCredentials();
  const timestamp = String(Math.floor(Date.now() / 1000));
  const logId = crypto.randomUUID();
  const sign = generateSign(appKey, appSecret, timestamp, logId, extraInfo);

  return {
    "X-App-Key": appKey,
    "X-Timestamp": timestamp,
    "X-Log-Id": logId,
    "X-Sign": sign,
    "X-Extra-Info": extraInfo,
    "Content-Type": "application/json",
  };
}

export async function zhihuRequest(
  path: string,
  options?: RequestInit & { params?: Record<string, string> }
) {
  const url = new URL(path, BASE_URL);
  if (options?.params) {
    Object.entries(options.params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const headers = buildHeaders();
  const res = await fetch(url.toString(), {
    ...options,
    headers: {
      ...headers,
      ...(options?.headers || {}),
    },
  });
  if (!res.ok) {
    throw new Error(`知乎 API 请求失败: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// OAuth 相关
export async function getAccessToken(
  code: string
): Promise<{
  access_token: string;
  token_type: string;
  expires_in: number;
}> {
  const appId = process.env.ZHIHU_APP_ID || "";
  // 兼容两种命名：ZHIHU_APP_KEY（知乎开放平台）或 ZHIHU_APP_SECRET（NextAuth 习惯）
  const appKey = process.env.ZHIHU_APP_KEY || process.env.ZHIHU_APP_SECRET || "";
  const redirectUri = process.env.ZHIHU_REDIRECT_URI || "";

  const body = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
    code,
  });

  const res = await fetch(`${BASE_URL}/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`获取 access_token 失败: ${text}`);
  }
  return res.json();
}

export async function getUserInfo(accessToken: string) {
  const res = await fetch(`${BASE_URL}/user`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`获取用户信息失败: ${text}`);
  }
  return res.json();
}

// 发布想法到圈子
export async function publishPin(
  accessToken: string,
  content: string,
  ringId: string,
  title?: string,
  imageUrls?: string[]
): Promise<{ content_token: string }> {
  const body = {
    title: title || "",
    content,
    image_urls: imageUrls || [],
    ring_id: ringId,
  };

  const res = await fetch(`${BASE_URL}/openapi/publish/pin`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`发布想法失败: ${text}`);
  }
  const data = await res.json();
  if (data.status !== 0) {
    throw new Error(`发布想法失败: ${data.msg}`);
  }
  return data.data;
}
