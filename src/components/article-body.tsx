"use client";

import type { MouseEvent } from "react";

function enhanceCodeBlocks(html: string) {
  return html.replace(/<pre\b([^>]*)>([\s\S]*?)<\/pre>/gi, '<div class="article-code-block"><button type="button" aria-label="Copy code" data-copy-code class="article-copy-code"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="8" y="8" width="11" height="11" rx="1.5"></rect><path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8"></path></svg></button><pre$1>$2</pre></div>');
}

export function ArticleBody({ html }: { html: string }) {
  async function copyCode(event: MouseEvent<HTMLDivElement>) {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-copy-code]");
    const code = button?.parentElement?.querySelector("pre")?.innerText;
    if (!button || !code) return;
    await navigator.clipboard.writeText(code);
    button.setAttribute("aria-label", "Copied");
    button.dataset.copied = "true";
    window.setTimeout(() => { button.setAttribute("aria-label", "Copy code"); delete button.dataset.copied; }, 1600);
  }

  return <div onClick={copyCode} className="article-content max-w-[680px] font-[family-name:var(--font-open-sans)] text-[1.08rem] leading-[1.72] text-[#252525] [&_a]:font-semibold [&_a]:text-[#8c1515] [&_a]:underline [&_a]:underline-offset-4 [&_blockquote]:my-8 [&_blockquote]:border-l-4 [&_blockquote]:border-[#8c1515] [&_blockquote]:bg-[#f7f4f1] [&_blockquote]:px-5 [&_blockquote]:py-4 [&_h2]:mt-12 [&_h2]:scroll-mt-8 [&_h2]:text-3xl [&_h2]:font-semibold [&_h3]:mt-9 [&_h3]:scroll-mt-8 [&_h3]:text-xl [&_h3]:font-semibold [&_img]:my-8 [&_img]:h-auto [&_img]:max-w-full [&_li]:my-2 [&_ol]:my-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-5 [&_ul]:my-6 [&_ul]:list-disc [&_ul]:pl-6" dangerouslySetInnerHTML={{ __html: enhanceCodeBlocks(html) }} />;
}
