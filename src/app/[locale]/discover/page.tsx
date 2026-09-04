import { ContentHeader } from "@/components/content-header";
import { JournalFooter } from "@/components/journal-footer";
import { getPosts } from "@/lib/parse";

export const revalidate = 300;

export default async function DiscoverPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { items: posts } = await getPosts(24, locale);
  return <main className="min-h-screen bg-[#f5f6f8] text-[#252525]"><ContentHeader locale={locale} />
    <section className="mx-auto max-w-[1320px] px-4 py-12 sm:px-8 sm:py-16"><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8c1515]">Tumbli Journal</p><h1 className="mt-2 max-w-xl text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">Explore what moves you.</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-600">More thoughtful stories, useful ideas, and fresh perspectives to discover at your own pace.</p>
      <div className="mt-10 grid border-t border-[#cfd4d7] sm:grid-cols-2 lg:grid-cols-3">{posts.map((post) => <article key={post.id} className="group flex flex-col border-b border-[#cfd4d7] py-7 sm:px-6 sm:first:pl-0 lg:nth-[3n+1]:pl-0"><p className="text-xs font-bold uppercase tracking-[0.15em] text-[#8c1515]">{post.category}</p><h2 className="mt-4 text-2xl font-semibold leading-tight tracking-[-0.035em]"><a href={`/${locale}/posts/${post.slug}`} className="transition-colors group-hover:text-[#8c1515]">{post.title}</a></h2><p className="mt-3 text-sm leading-6 text-zinc-600">{post.excerpt}</p><a href={`/${locale}/posts/${post.slug}`} className="mt-auto pt-7 font-serif text-sm font-semibold text-[#8c1515] underline decoration-[#8c1515]/40 underline-offset-4">Read the full article →</a></article>)}</div>
    </section><JournalFooter locale={locale} />
  </main>;
}
