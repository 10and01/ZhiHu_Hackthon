"use client";

import { useEffect, useRef } from "react";

/**
 * 沙箱预览组件
 * 使用 srcdoc + document.write 双保险策略，确保在各种浏览器环境下都能正确渲染
 */
export default function SandboxPreview({ htmlCode }: { htmlCode: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    // 策略：优先使用 document.write（最可靠），iframe 加载完成后写入内容
    const loadHandler = () => {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc) return;
        doc.open();
        doc.write(htmlCode);
        doc.close();
      } catch (e) {
        console.error("[SandboxPreview] iframe write failed:", e);
      }
    };

    // 清除 srcdoc，确保空白状态
    iframe.removeAttribute("srcdoc");

    // 监听加载事件
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
      // allow-scripts: 允许执行 JS（滚动动效、交互）
      // allow-same-origin: 允许 Blob URL 和 document.write 正常工作
      // allow-popups: 允许场景中的链接打开新窗口
      sandbox="allow-scripts allow-same-origin allow-popups"
      className="w-full h-[70vh] lg:h-[80vh]"
      title="AI 生成预览"
      style={{ border: "none" }}
    />
  );
}
