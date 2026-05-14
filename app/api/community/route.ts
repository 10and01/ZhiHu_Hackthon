export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const works = await prisma.work.findMany({
    where: { isPublic: true },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { screenName: true, avatarUrl: true } },
      _count: { select: { likes: true } },
    },
  });

  return NextResponse.json(works);
}
