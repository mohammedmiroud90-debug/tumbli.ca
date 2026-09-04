import { ContentHeader } from "@/components/content-header";
import { JournalFooter } from "@/components/journal-footer";
import { getPosts, isBackendConfigured } from "@/lib/parse";

export const revalidate = 300;

function date(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export default async function PostsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { items: posts } = await getPosts(12, locale);
  return (
    <main className="min-h-screen bg-[#f5f6f8] text-[#252525]">
      <ContentHeader locale={locale} />
      <section className="mx-auto max-w-[1100px] px-4 py-12 sm:px-8 sm:py-16">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8c1515]">Tumbli Journal</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">Our posts</h1>
        {!isBackendConfigured ? <p className="mt-8 bg-white p-5 text-sm text-zinc-600">The content backend has not been configured yet.</p> : posts.length === 0 ? <p className="mt-8 bg-white p-5 text-sm text-zinc-600">No published posts are available yet.</p> : <div className="mt-10 grid border-t border-[#cfd4d7] sm:grid-cols-2 lg:grid-cols-3">{posts.map((post) => <article key={post.id} className="flex flex-col border-b border-[#cfd4d7] py-7 sm:px-6 sm:first:pl-0 lg:nth-[3n+1]:pl-0">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#8c1515]">{post.category}</p>
          <h2 className="mt-4 text-2xl font-semibold leading-tight tracking-[-0.035em]"><a className="transition-colors hover:text-[#8c1515]" href={`/${locale}/posts/${post.slug}`}>{post.title}</a></h2>
          <p className="mt-3 text-sm leading-6 text-zinc-600">{post.excerpt}</p>
          <div className="mt-6 flex items-center justify-between gap-3 text-xs text-zinc-500"><span>{post.author}</span><span>{date(post.publishedAt)}</span></div>
          <a className="mt-auto pt-7 font-serif text-sm font-semibold text-[#8c1515] underline decoration-[#8c1515]/40 decoration-1 underline-offset-4 transition-colors hover:text-[#b1040e]" href={`/${locale}/posts/${post.slug}`}>
            Read the full article <span aria-hidden="true">&rarr;</span>
          </a>
        </article>)}</div>}
      </section><JournalFooter locale={locale} />
    </main>
  );
}
