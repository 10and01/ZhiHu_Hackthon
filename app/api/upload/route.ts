export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "未上传文件" }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    let content = "";
    const images: { url: string; alt: string; position: number }[] = [];

    if (fileName.endsWith(".txt") || fileName.endsWith(".md")) {
      content = await file.text();
      
      // 从 markdown 中提取图片
      const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
      let match;
      while ((match = imgRegex.exec(content)) !== null) {
        images.push({
          url: match[2],
          alt: match[1],
          position: match.index,
        });
      }
    } else {
      return NextResponse.json(
        { error: "不支持的文件格式，仅支持 .txt 和 .md" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      title: file.name.replace(/\.[^/.]+$/, ""),
      content,
      images,
      fileName: file.name,
    });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: err.message || "上传失败" },
      { status: 500 }
    );
  }
}
