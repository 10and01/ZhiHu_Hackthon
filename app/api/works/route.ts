export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.zhihuUid) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { zhihuUid: String(session.zhihuUid) },
  });
  if (!user) {
    return NextResponse.json({ error: "用户不存在" }, { status: 404 });
  }

  const body = await req.json();
  const { title, sourceUrl, htmlCode, metaJson } = body;

  if (!title || !htmlCode) {
    return NextResponse.json({ error: "缺少必填字段" }, { status: 400 });
  }

  const work = await prisma.work.create({
    data: {
      userId: user.id,
      title,
      sourceUrl: sourceUrl || null,
      htmlCode,
      metaJson: metaJson || "{}",
    },
  });

  return NextResponse.json(work);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.zhihuUid) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { zhihuUid: String(session.zhihuUid) },
  });
  if (!user) {
    return NextResponse.json({ error: "用户不存在" }, { status: 404 });
  }

  const works = await prisma.work.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { likes: true } },
    },
  });

  return NextResponse.json(works);
}
