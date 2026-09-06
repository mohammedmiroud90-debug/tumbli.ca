"use client";

import { FormEvent, useState } from "react";

const copy = {
  en: { eyebrow: "The Tumbli note", title: "A good idea, delivered occasionally.", placeholder: "Your email address", button: "Subscribe", success: "You’re on the list. Thank you." },
  fr: { eyebrow: "La note Tumbli", title: "Une bonne idée, envoyée de temps en temps.", placeholder: "Votre adresse e-mail", button: "S’inscrire", success: "Vous êtes inscrit·e. Merci." },
  ar: { eyebrow: "رسالة تمبلي", title: "فكرة جيدة تصل إليك من حين لآخر.", placeholder: "بريدك الإلكتروني", button: "اشترك", success: "أنت الآن في القائمة. شكرًا لك." },
} as const;

export function NewsletterForm({ locale }: { locale: string }) {
  const text = copy[locale as keyof typeof copy] ?? copy.en;
  const [sent, setSent] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (event.currentTarget.checkValidity()) setSent(true); }

  return <aside className="relative mt-12 overflow-hidden rounded-2xl bg-[#252525] px-6 py-8 text-white shadow-[0_18px_42px_rgba(30,20,20,.16)] sm:px-9 sm:py-10 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(360px,.8fr)] lg:items-center lg:gap-12">
    <span aria-hidden="true" className="absolute -left-20 -top-20 size-64 rounded-full border-[28px] border-[#f7ced0]/20" />
    <span aria-hidden="true" className="absolute -bottom-24 right-[28%] size-56 rounded-full bg-[#8c1515]/50 blur-2xl" />
    <div className="relative">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f7ced0]">{text.eyebrow}</p>
      <h3 className="mt-3 max-w-xl text-2xl font-semibold leading-tight tracking-[-0.04em] sm:text-3xl">{text.title}</h3>
      <p className="mt-3 max-w-lg text-sm leading-6 text-white/70">Fresh stories, useful ideas, and thoughtful discoveries from Tumbli — sent occasionally.</p>
    </div>
    <div className="relative mt-7 lg:mt-0">
      {sent ? <p role="status" className="rounded-xl border border-[#f7ced0]/35 bg-white/10 px-5 py-4 text-sm font-semibold text-[#ffe7e8]">{text.success}</p> : <form onSubmit={submit} className="rounded-xl bg-white p-2 shadow-lg sm:flex sm:items-center"><label className="sr-only" htmlFor="newsletter-email">{text.placeholder}</label><input id="newsletter-email" type="email" required placeholder={text.placeholder} className="min-h-12 min-w-0 w-full flex-1 rounded-lg bg-transparent px-3 text-sm text-[#252525] outline-none placeholder:text-zinc-500 focus:ring-2 focus:ring-[#8c1515]/35" /><button type="submit" className="mt-2 min-h-12 w-full rounded-lg bg-[#8c1515] px-5 text-xs font-semibold uppercase tracking-[.08em] text-white transition-colors hover:bg-[#b1040e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8c1515] sm:mt-0 sm:w-auto">{text.button}</button></form>}
      <p className="mt-3 text-xs leading-5 text-white/50">No noise. Unsubscribe at any time.</p>
    </div>
  </aside>;
}
