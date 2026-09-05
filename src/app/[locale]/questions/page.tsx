import { ContentHeader } from "@/components/content-header";
import { JournalFooter } from "@/components/journal-footer";
import { getQuestions, isBackendConfigured } from "@/lib/parse";

export const revalidate = 300;

const copy = {
  en: { eyebrow: "Community knowledge", title: "Questions & answers", unavailable: "The Q&A backend has not been configured yet.", empty: "No published questions are available yet.", answer: "answer", answers: "answers", views: "views", read: "Read the full discussion" },
  fr: { eyebrow: "Savoirs de la communauté", title: "Questions et réponses", unavailable: "Le service de questions-réponses n’est pas encore configuré.", empty: "Aucune question publiée n’est disponible pour le moment.", answer: "réponse", answers: "réponses", views: "vues", read: "Lire toute la discussion" },
  ar: { eyebrow: "معرفة المجتمع", title: "الأسئلة والأجوبة", unavailable: "لم يتم إعداد خدمة الأسئلة والأجوبة بعد.", empty: "لا توجد أسئلة منشورة متاحة حتى الآن.", answer: "إجابة", answers: "إجابات", views: "مشاهدات", read: "اقرأ النقاش كاملًا" },
} as const;

export default async function QuestionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const { items: questions } = await getQuestions(20, locale);
  const text = copy[locale as keyof typeof copy] ?? copy.en;
  return (
    <main className="min-h-screen bg-[#f5f6f8] text-[#252525]">
      <ContentHeader locale={locale} />
      <section className="mx-auto max-w-[1100px] px-4 py-12 sm:px-8 sm:py-16">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8c1515]">{text.eyebrow}</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">{text.title}</h1>
        {!isBackendConfigured ? <p className="mt-8 bg-white p-5 text-sm text-zinc-600">{text.unavailable}</p> : questions.length === 0 ? <p className="mt-8 bg-white p-5 text-sm text-zinc-600">{text.empty}</p> : <div className="mt-10 space-y-4">{questions.map((question) => <article key={question.id} className="grid gap-4 border border-[#d9d4cb] bg-white p-5 sm:grid-cols-[100px_1fr] sm:p-6">
          <div className="text-xs text-zinc-500"><strong className="block text-xl font-semibold text-[#8c1515]">{question.answerCount}</strong> {question.answerCount === 1 ? text.answer : text.answers}<br /><strong className="mt-2 block text-lg font-semibold text-[#252525]">{question.viewCount}</strong> {text.views}</div>
          <div><h2 className="text-xl font-semibold tracking-[-0.025em]"><a href={`/${locale}/questions/${question.slug}`} className="transition-colors hover:text-[#8c1515]">{question.title}</a></h2><p className="mt-3 text-sm leading-6 text-zinc-600">{question.question}</p><div className="mt-4 flex flex-wrap gap-2">{[question.category, ...question.tags].slice(0, 4).map((tag) => <span key={tag} className="bg-[#f0eeea] px-2 py-1 text-xs text-[#8c1515]">{tag}</span>)}</div><a href={`/${locale}/questions/${question.slug}`} className="mt-6 inline-block font-serif text-sm font-semibold text-[#8c1515] underline decoration-[#8c1515]/40 decoration-1 underline-offset-4 transition-colors hover:text-[#b1040e]">{text.read} <span aria-hidden="true">&rarr;</span></a></div>
        </article>)}</div>}
      </section><JournalFooter locale={locale} />
    </main>
  );
}
