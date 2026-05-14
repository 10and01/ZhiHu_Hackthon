"use client";

import { useEffect, useRef } from "react";

/**
 * 沙箱预览组件
 * 使用 document.write 双保险策略，确保在各种浏览器环境下都能正确渲染
 */
export default function SandboxPreview({ htmlCode }: { htmlCode?: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    // 防御：htmlCode 必须是有效字符串
    const safeHtml = typeof htmlCode === "string" && htmlCode.length > 0
      ? htmlCode
      : `<!DOCTYPE html><html><body style="font-family:sans-serif;background:#0f172a;color:#e2e8f0;padding:2rem;text-align:center;"><h2>⚠️ 预览内容为空</h2><p>HTML 内容未正确生成，请返回重试。</p></body></html>`;

    const loadHandler = () => {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc) return;
        doc.open();
        doc.write(safeHtml);
        doc.close();
      } catch (e) {
        console.error("[SandboxPreview] iframe write failed:", e);
      }
    };

    // 清除 srcdoc，确保空白状态
    iframe.removeAttribute("srcdoc");
    iframe.addEventListener("load", loadHandler);

    // 如果 iframe 已经加载完成，直接写入
    if (iframe.contentDocument?.readyState === "complete") {
      loadHandler();
    }

    return () => {
      iframe.removeEventListener("load", loadHandler);
    };
  }, [htmlCode]);

  return (
    <iframe
      ref={iframeRef}
      sandbox="allow-scripts allow-same-origin allow-popups"
      className="w-full h-[70vh] lg:h-[80vh]"
      title="AI 生成预览"
      style={{ border: "none" }}
    />
  );
}
