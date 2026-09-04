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
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setSent(true); }
  return <aside className="mt-10 border border-[#d5d0c8] bg-[#ebe7e1] px-5 py-6 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:px-7"><div><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8c1515]">{text.eyebrow}</p><h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[#252525]">{text.title}</h3></div>{sent ? <p className="mt-4 text-sm font-semibold text-[#39754b] sm:mt-0">{text.success}</p> : <form onSubmit={submit} className="mt-4 flex max-w-md flex-1 gap-2 sm:mt-0"><input type="email" required placeholder={text.placeholder} className="min-w-0 flex-1 border border-[#c2bbb1] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#8c1515]" /><button className="bg-[#8c1515] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#b1040e]">{text.button}</button></form>}</aside>;
}
