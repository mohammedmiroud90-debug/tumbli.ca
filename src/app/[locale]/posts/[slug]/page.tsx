import { notFound } from "next/navigation";
import { CommentThread } from "@/components/comment-thread";
import { ContentHeader } from "@/components/content-header";
import { ReadingProgress } from "@/components/reading-progress";
import { JournalFooter } from "@/components/journal-footer";
import { getPost, getPosts, plainText } from "@/lib/parse";

export const revalidate = 300;

type Heading = { id: string; text: string; level: number };

function headings(content: string): Heading[] {
  const matches = [...content.matchAll(/<h([2-3])([^>]*)>([\s\S]*?)<\/h\1>/gi)];
  return matches.map((match, index) => ({ id: match[2].match(/id=["']([^"']+)["']/i)?.[1] ?? `section-${index + 1}`, text: plainText(match[3]), level: Number(match[1]) }));
}

function safeArticleHtml(content: string) {
  return content
    .replace(/<\/?(?:script|style|iframe|object|embed)[^>]*>/gi, "")
    .replace(/\son\w+=["'][^"']*["']/gi, "")
    .replace(/javascript:/gi, "");
}

function formatDate(value: string) { return new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric" }).format(new Date(value)); }

export default async function PostPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const post = await getPost(slug, locale);
  if (!post) notFound();
  const [{ items: allPosts }] = await Promise.all([getPosts(12, locale)]);
  const related = allPosts.filter((item) => item.id !== post.id).sort((a, b) => Number(b.category === post.category) - Number(a.category === post.category)).slice(0, 3);
  const tableOfContents = headings(post.content);
  const articleHtml = safeArticleHtml(post.content);

  return <main className="min-h-screen bg-[#f5f6f8] text-[#252525]"><ReadingProgress /><ContentHeader locale={locale} />
    <article className="mx-auto max-w-6xl px-4 py-10 sm:px-8 sm:py-16">
      <a href={`/${locale}/posts`} className="text-sm font-semibold text-[#8c1515] underline underline-offset-4">&larr; All posts</a>
      <header className="mx-auto max-w-3xl pt-10 text-center"><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8c1515]">{post.category}</p><h1 className="mt-4 text-4xl font-semibold leading-[1.04] tracking-[-0.055em] sm:text-6xl">{post.title}</h1><p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-zinc-600">{post.excerpt}</p><div className="mt-7 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm text-zinc-600"><span className="font-medium text-[#252525]">{post.author}</span><span aria-hidden="true">·</span><time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time><span aria-hidden="true">·</span><span>{post.readingTime} min read</span></div></header>
      <div className="mx-auto mt-12 grid max-w-5xl gap-10 lg:grid-cols-[190px_minmax(0,1fr)]">
        {tableOfContents.length > 0 && <aside className="hidden lg:block"><nav aria-label="Table of contents" className="sticky top-8 border-l border-[#d4cec5] pl-4"><p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#8c1515]">On this page</p><ol className="mt-4 space-y-3">{tableOfContents.map((heading) => <li key={heading.id} className={heading.level === 3 ? "pl-3" : ""}><a href={`#${heading.id}`} className="text-xs leading-5 text-zinc-600 transition-colors hover:text-[#8c1515]">{heading.text}</a></li>)}</ol></nav></aside>}
        <div><div className="bg-white px-5 py-8 shadow-[0_12px_30px_rgba(30,25,20,0.06)] sm:px-10 sm:py-12"><div className="article-content mx-auto max-w-[700px] font-[family-name:var(--font-open-sans)] text-[1.1rem] leading-[1.72] text-[#343434] [&_a]:font-semibold [&_a]:text-[#8c1515] [&_a]:decoration-[#8c1515]/50 [&_a]:underline [&_a]:underline-offset-4 [&_a]:transition-colors hover:[&_a]:text-[#b1040e] [&_blockquote]:my-8 [&_blockquote]:border-l-4 [&_blockquote]:border-[#8c1515] [&_blockquote]:bg-[#f7f4f1] [&_blockquote]:px-5 [&_blockquote]:py-4 [&_h1]:mt-12 [&_h1]:text-3xl [&_h1]:font-semibold [&_h2]:mt-12 [&_h2]:scroll-mt-8 [&_h2]:text-3xl [&_h2]:font-semibold [&_h2]:leading-tight [&_h3]:mt-9 [&_h3]:scroll-mt-8 [&_h3]:text-xl [&_h3]:font-semibold [&_img]:my-8 [&_img]:h-auto [&_img]:max-w-full [&_li]:my-2 [&_ol]:my-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-5 [&_pre]:my-8 [&_pre]:overflow-x-auto [&_pre]:bg-[#252525] [&_pre]:p-5 [&_pre]:text-sm [&_pre]:leading-6 [&_pre]:text-white [&_ul]:my-6 [&_ul]:list-disc [&_ul]:pl-6" dangerouslySetInnerHTML={{ __html: articleHtml || `<p>${post.excerpt}</p>` }} /></div>
          {related.length > 0 && <section className="mt-14 border-t border-[#c9c3b9] pt-9"><div className="flex items-baseline justify-between"><div><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8c1515]">Continue reading</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em]">Similar posts</h2></div><a href={`/${locale}/posts`} className="text-sm font-semibold text-[#8c1515] underline underline-offset-4">All posts</a></div><div className="mt-6 divide-y divide-[#d9d4cb] border-y border-[#d9d4cb]">{related.map((item) => <a key={item.id} href={`/${locale}/posts/${item.slug}`} className="group flex items-center justify-between gap-5 py-5"><div><p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8c1515]">{item.category}</p><h3 className="mt-2 text-lg font-semibold leading-snug transition-colors group-hover:text-[#8c1515]">{item.title}</h3><p className="mt-1 text-sm text-zinc-500">{item.readingTime} min read</p></div><span aria-hidden="true" className="text-xl text-[#8c1515]">→</span></a>)}</div></section>}
          <CommentThread postId={post.id} locale={locale} />
        </div>
      </div>
    </article><JournalFooter locale={locale} />
  </main>;
}
