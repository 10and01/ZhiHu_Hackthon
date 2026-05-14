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

  const safeTitle = work.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, "_");
  const headers = new Headers();
  headers.set("Content-Type", "text/html; charset=utf-8");
  headers.set(
    "Content-Disposition",
    `attachment; filename="repage-${safeTitle}.html"`
  );

  return new NextResponse(work.htmlCode, { headers });
}
