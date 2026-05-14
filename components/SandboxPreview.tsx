"use client";

import { useEffect, useRef } from "react";

export default function SandboxPreview({ htmlCode }: { htmlCode: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!iframeRef.current) return;
    const blob = new Blob([htmlCode], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    iframeRef.current.src = url;
    return () => URL.revokeObjectURL(url);
  }, [htmlCode]);

  return (
    <iframe
      ref={iframeRef}
      sandbox="allow-scripts"
      className="w-full h-[70vh] lg:h-[80vh]"
      title="AI 生成预览"
    />
  );
}
