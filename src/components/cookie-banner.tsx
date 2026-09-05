"use client";

import { useEffect, useState } from "react";

const copy = {
  en: { title: "Your privacy matters", body: "We use essential cookies to keep Tumbli working and optional analytics cookies to understand what readers find useful.", accept: "Accept all", essential: "Essential only" },
  fr: { title: "Votre vie privée compte", body: "Nous utilisons des cookies essentiels pour faire fonctionner Tumbli et des cookies analytiques facultatifs pour comprendre ce qui est utile aux lecteurs.", accept: "Tout accepter", essential: "Essentiels uniquement" },
  ar: { title: "خصوصيتك مهمة", body: "نستخدم ملفات تعريف الارتباط الأساسية لتشغيل تمبلي، وملفات تحليلية اختيارية لفهم ما يجده القراء مفيدًا.", accept: "قبول الكل", essential: "الأساسية فقط" },
} as const;

export function CookieBanner({ locale }: { locale: string }) {
  const [visible, setVisible] = useState(false);
  const text = copy[locale as keyof typeof copy] ?? copy.en;
  useEffect(() => { setVisible(!window.localStorage.getItem("tumbli-cookie-consent")); }, []);
  function save(choice: "all" | "essential") { window.localStorage.setItem("tumbli-cookie-consent", choice); setVisible(false); }
  if (!visible) return null;
  return <aside role="dialog" aria-live="polite" aria-label={text.title} className="fixed inset-x-0 bottom-0 z-[100] border-t-4 border-[#f7ced0] bg-[#78080d] text-white shadow-[0_-16px_42px_rgba(0,0,0,0.28)]"><div className="mx-auto grid max-w-[1320px] gap-6 px-5 py-5 sm:px-8 sm:py-6 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center lg:gap-10"><div aria-hidden="true" className="grid size-11 shrink-0 place-items-center border border-white/35 bg-[#8c1515]"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="size-6"><circle cx="12" cy="12" r="8.5"/><circle cx="9" cy="9" r="1" fill="currentColor"/><circle cx="15.5" cy="10.5" r="1" fill="currentColor"/><circle cx="11" cy="15.5" r="1" fill="currentColor"/><path d="M4.5 5.5c2.3 1 4.6 3.2 4.6 6.5"/></svg></div><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#f7ced0]">Tumbli</p><h2 className="mt-1 text-lg font-semibold tracking-[-0.025em]">{text.title}</h2><p className="mt-1 max-w-3xl text-sm leading-6 text-white/80">{text.body}</p></div><div className="grid gap-2 sm:grid-cols-2 lg:min-w-[270px] lg:grid-cols-1"><button onClick={() => save("all")} className="min-h-11 bg-white px-5 py-3 text-xs font-semibold text-[#78080d] transition-colors hover:bg-[#f7ced0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">{text.accept}</button><button onClick={() => save("essential")} className="min-h-11 border border-white/45 px-5 py-3 text-xs font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">{text.essential}</button></div></div></aside>;
}
