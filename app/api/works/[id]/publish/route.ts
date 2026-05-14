export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
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

  const updated = await prisma.work.update({
    where: { id: params.id },
    data: { isPublic: true },
  });

  return NextResponse.json(updated);
}
