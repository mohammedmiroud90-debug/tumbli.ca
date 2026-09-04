import { ContentHeader } from "@/components/content-header";
import { JournalFooter } from "@/components/journal-footer";
import { getQuestions, isBackendConfigured } from "@/lib/parse";

export const revalidate = 300;

export default async function QuestionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { items: questions } = await getQuestions(20, locale);
  return (
    <main className="min-h-screen bg-[#f5f6f8] text-[#252525]">
      <ContentHeader locale={locale} />
      <section className="mx-auto max-w-[1100px] px-4 py-12 sm:px-8 sm:py-16">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8c1515]">Community knowledge</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">Questions &amp; answers</h1>
        {!isBackendConfigured ? <p className="mt-8 bg-white p-5 text-sm text-zinc-600">The Q&amp;A backend has not been configured yet.</p> : questions.length === 0 ? <p className="mt-8 bg-white p-5 text-sm text-zinc-600">No published questions are available yet.</p> : <div className="mt-10 space-y-4">{questions.map((question) => <article key={question.id} className="grid gap-4 border border-[#d9d4cb] bg-white p-5 sm:grid-cols-[100px_1fr] sm:p-6">
          <div className="text-xs text-zinc-500"><strong className="block text-xl font-semibold text-[#8c1515]">1</strong> answer<br /><strong className="mt-2 block text-lg font-semibold text-[#252525]">{question.viewCount}</strong> views</div>
          <div><h2 className="text-xl font-semibold tracking-[-0.025em]"><a href={`/${locale}/questions/${question.slug}`} className="transition-colors hover:text-[#8c1515]">{question.title}</a></h2><p className="mt-3 text-sm leading-6 text-zinc-600">{question.question}</p><div className="mt-4 flex flex-wrap gap-2">{[question.category, ...question.tags].slice(0, 4).map((tag) => <span key={tag} className="bg-[#f0eeea] px-2 py-1 text-xs text-[#8c1515]">{tag}</span>)}</div><a href={`/${locale}/questions/${question.slug}`} className="mt-6 inline-block font-serif text-sm font-semibold text-[#8c1515] underline decoration-[#8c1515]/40 decoration-1 underline-offset-4 transition-colors hover:text-[#b1040e]">Read the full discussion <span aria-hidden="true">&rarr;</span></a></div>
        </article>)}</div>}
      </section><JournalFooter locale={locale} />
    </main>
  );
}
