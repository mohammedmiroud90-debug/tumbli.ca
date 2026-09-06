import Image from "next/image";
import { notFound } from "next/navigation";
import { CommentThread } from "@/components/comment-thread";
import { ArticleBody } from "@/components/article-body";
import { ContentHeader } from "@/components/content-header";
import { JournalFooter } from "@/components/journal-footer";
import { ReadingProgress } from "@/components/reading-progress";
import { getPost, getPosts, plainText } from "@/lib/parse";

export const revalidate = 300;

type Heading = { id: string; text: string; level: number };

function headings(content: string): Heading[] {
  return [...content.matchAll(/<h([2-3])([^>]*)>([\s\S]*?)<\/h\1>/gi)].map((match, index) => ({
    id: match[2].match(/id=["']([^"']+)["']/i)?.[1] ?? `section-${index + 1}`,
    text: plainText(match[3]),
    level: Number(match[1]),
  }));
}

function safeArticleHtml(content: string) {
  return content
    .replace(/<\/?(?:script|style|iframe|object|embed)[^>]*>/gi, "")
    .replace(/\son\w+=["'][^"']*["']/gi, "")
    .replace(/javascript:/gi, "");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric" }).format(new Date(value));
}

function LinkedInIcon() { return <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="size-4"><path d="M5.3 3.5A1.8 1.8 0 1 1 5.3 7a1.8 1.8 0 0 1 0-3.5ZM3.8 8.5h3v11h-3v-11Zm5 0h2.9V10c.4-.8 1.4-1.8 3.3-1.8 3.5 0 4.1 2.3 4.1 5.3v6h-3v-5.3c0-1.3 0-2.9-1.8-2.9s-2.1 1.4-2.1 2.8v5.4h-3v-11Z" /></svg>; }
function XIcon() { return <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="size-4"><path d="M18.8 3H22l-7 8 8.2 10H17l-4.9-6.2L6.7 21H3.5l7.5-8.6L3.1 3h6.4l4.4 5.6L18.8 3Zm-1.1 16h1.8L8.5 4.9H6.6L17.7 19Z" /></svg>; }
function FacebookIcon() { return <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="size-4"><path d="M13.8 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5H17V4a20 20 0 0 0-2.3-.1c-2.3 0-3.9 1.4-3.9 4V10H8.2v3h2.6v8h3Z" /></svg>; }
function MailIcon() { return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-4"><rect x="3.5" y="5.5" width="17" height="13" /><path d="m4 7 8 6 8-6" /></svg>; }

export default async function PostPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const post = await getPost(slug, locale);
  if (!post) notFound();

  const [{ items: allPosts }] = await Promise.all([getPosts(12, locale)]);
  const related = allPosts.filter((item) => item.id !== post.id).sort((a, b) => Number(b.category === post.category) - Number(a.category === post.category)).slice(0, 3);
  const tableOfContents = headings(post.content);
  const articleHtml = safeArticleHtml(post.content);
  const articleUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://tumbli.eu.cc"}/${locale}/posts/${post.slug}`;
  const encodedArticleUrl = encodeURIComponent(articleUrl);
  const encodedTitle = encodeURIComponent(post.title);
  const iconClass = "grid size-9 place-items-center rounded-full border border-[#c9c3b9] bg-white text-[#8c1515] shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#8c1515] hover:bg-[#8c1515] hover:text-white";

  return <main className="min-h-screen bg-[#f5f6f8] text-[#252525]">
    <ReadingProgress />
    <ContentHeader locale={locale} />
    <article className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-14">
      <a href={`/${locale}/posts`} className="text-sm font-semibold text-[#8c1515] underline underline-offset-4">← All posts</a>
      <header className="mx-auto max-w-[760px] pt-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8c1515]">{post.category}</p>
        <h1 className="mt-4 text-4xl font-semibold leading-[1.04] tracking-[-0.055em] sm:text-6xl">{post.title}</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-600">{post.excerpt}</p>
        <div className="mt-7 flex flex-wrap items-center gap-3 border-y border-[#d9d4cb] py-4"><span className="grid size-10 place-items-center rounded-full bg-[#8c1515] text-xs font-bold text-white">{post.author.charAt(0).toUpperCase()}</span><div className="text-sm"><p className="font-semibold">{post.author}</p><p className="mt-0.5 text-zinc-500"><time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time> · {post.readingTime} min read</p></div></div>
      </header>

      <div className="mx-auto mt-7 grid max-w-7xl gap-8 lg:grid-cols-[minmax(180px,220px)_minmax(0,680px)_minmax(210px,1fr)]">
        <aside className="hidden lg:block"><div className="sticky top-8"><nav aria-label="Table of contents" className="border-t border-[#d4cec5] pt-4">{tableOfContents.length > 0 && <><p className="text-[10px] font-bold uppercase tracking-[.15em] text-[#8c1515]">On this page</p><ol className="mt-3 space-y-2.5">{tableOfContents.map((heading) => <li key={heading.id} className={heading.level === 3 ? "pl-3" : ""}><a href={`#${heading.id}`} className="text-xs leading-5 text-zinc-600 transition-colors hover:text-[#8c1515]">{heading.text}</a></li>)}</ol></>}</nav><div className="mt-8 border-t border-[#d4cec5] pt-4"><p className="text-[10px] font-bold uppercase tracking-[.15em] text-[#8c1515]">Share</p><div className="mt-3 flex flex-wrap gap-2"><a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedArticleUrl}`} target="_blank" rel="noreferrer" aria-label="Share on LinkedIn" className={iconClass}><LinkedInIcon /></a><a href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedArticleUrl}`} target="_blank" rel="noreferrer" aria-label="Share on X" className={iconClass}><XIcon /></a><a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedArticleUrl}`} target="_blank" rel="noreferrer" aria-label="Share on Facebook" className={iconClass}><FacebookIcon /></a><a href={`mailto:?subject=${encodedTitle}&body=${encodedArticleUrl}`} aria-label="Share by email" className={iconClass}><MailIcon /></a></div></div><a href="#comments" className="mt-5 inline-block text-xs font-semibold text-[#8c1515] underline underline-offset-4">Join the discussion</a></div></aside>

        <div>{post.imageUrl && <figure className="mb-7 overflow-hidden border-y border-[#d9d4cb] bg-white"><Image src={post.imageUrl} alt={post.title} width={1360} height={760} className="h-auto w-full object-cover" sizes="(min-width: 1024px) 680px, 100vw" priority /></figure>}<div className="border-y border-[#d9d4cb] bg-white px-5 py-7 sm:px-10 sm:py-10"><ArticleBody html={articleHtml || `<p>${post.excerpt}</p>`} /></div>{related.length > 0 && <section className="mt-14 border-t border-[#c9c3b9] pt-9 lg:hidden"><p className="text-[11px] font-semibold uppercase tracking-[.18em] text-[#8c1515]">Continue reading</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em]">Similar posts</h2><RelatedPosts items={related} locale={locale} /></section>}<CommentThread postId={post.id} locale={locale} /></div>

        <aside className="hidden lg:block"><div className="sticky top-8"><div className="border-y border-[#d4cec5] bg-white px-5 py-7 text-center"><p className="text-[10px] font-semibold uppercase tracking-[.16em] text-zinc-400">Advertisement</p><p className="mt-7 text-xl font-semibold leading-tight tracking-[-.035em]">Make space for your next good idea.</p><p className="mt-3 text-xs leading-5 text-zinc-500">Partner with Tumbli to reach readers who are curious by default.</p><a href={`/${locale}/services`} className="mt-6 inline-block border border-[#8c1515] px-4 py-2 text-xs font-semibold text-[#8c1515] transition-colors hover:bg-[#8c1515] hover:text-white">Work with us</a></div>{related.length > 0 && <section className="mt-10 border-t border-[#d4cec5] pt-4"><div className="flex items-baseline justify-between gap-3"><p className="text-[10px] font-bold uppercase tracking-[.15em] text-[#8c1515]">Related posts</p><a href={`/${locale}/posts`} className="text-xs font-semibold text-[#8c1515] hover:underline">All</a></div><RelatedPosts items={related} locale={locale} compact /></section>}</div></aside>
      </div>
    </article>
    <JournalFooter locale={locale} />
  </main>;
}

function RelatedPosts({ items, locale, compact = false }: { items: Awaited<ReturnType<typeof getPosts>>["items"]; locale: string; compact?: boolean }) {
  return <div className={`mt-4 divide-y divide-[#d9d4cb] border-y border-[#d9d4cb] ${compact ? "" : "mt-6"}`}>{items.map((item) => <a key={item.id} href={`/${locale}/posts/${item.slug}`} className="group block py-4"><p className="text-[10px] font-semibold uppercase tracking-[.13em] text-[#8c1515]">{item.category}</p><h3 className={`${compact ? "text-sm leading-5" : "text-lg leading-snug"} mt-2 font-semibold transition-colors group-hover:text-[#8c1515]`}>{item.title}</h3><p className="mt-1 text-xs text-zinc-500">{item.readingTime} min read</p></a>)}</div>;
}
