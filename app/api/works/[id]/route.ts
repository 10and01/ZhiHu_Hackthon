export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const work = await prisma.work.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { screenName: true, avatarUrl: true, zhihuUid: true } },
      _count: { select: { likes: true } },
    },
  });

  if (!work) {
    return NextResponse.json({ error: "作品不存在" }, { status: 404 });
  }

  if (!work.isPublic) {
    const session = await getServerSession(authOptions);
    if (!session?.zhihuUid) {
      return NextResponse.json({ error: "无权访问" }, { status: 403 });
    }
    const user = await prisma.user.findUnique({
      where: { zhihuUid: String(session.zhihuUid) },
    });
    if (!user || user.id !== work.userId) {
      return NextResponse.json({ error: "无权访问" }, { status: 403 });
    }
  }

  await prisma.work.update({
    where: { id: params.id },
    data: { viewCount: { increment: 1 } },
  });

  return NextResponse.json(work);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

  const work = await prisma.work.findUnique({
    where: { id: params.id },
  });
  if (!work || work.userId !== user.id) {
    return NextResponse.json({ error: "无权操作" }, { status: 403 });
  }

  await prisma.work.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
