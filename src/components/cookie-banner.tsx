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
  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 px-4 py-6 backdrop-blur-[2px]" role="presentation"><aside role="dialog" aria-modal="true" aria-live="polite" aria-label={text.title} className="w-full max-w-[610px] border border-white/20 bg-[#78080d] text-white shadow-[0_24px_70px_rgba(0,0,0,0.45)]"><div className="border-b border-white/15 bg-[#8c1515] px-6 py-5 sm:px-8"><div className="flex items-center gap-4"><div aria-hidden="true" className="grid size-12 shrink-0 place-items-center bg-white/12 text-[#f7ced0]"><svg viewBox="0 0 32 32" fill="none" className="size-8"><path d="M19.5 4.5a11.5 11.5 0 1 0 8 19.75 7.9 7.9 0 0 1-8.1-8.1 7.9 7.9 0 0 1-8.1-8.1 11.45 11.45 0 0 0 8.2-3.55Z" fill="currentColor"/><circle cx="11.2" cy="16" r="1.65" fill="#78080d"/><circle cx="17.8" cy="22.1" r="1.65" fill="#78080d"/><circle cx="21.5" cy="11.8" r="1.3" fill="#78080d"/></svg></div><div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#f7ced0]">Tumbli</p><h2 className="mt-1 text-xl font-semibold tracking-[-0.03em]">{text.title}</h2></div></div></div><div className="px-6 py-6 sm:px-8 sm:py-7"><p className="text-sm leading-6 text-white/85">{text.body}</p><div className="mt-7 grid gap-3 sm:grid-cols-2"><button onClick={() => save("all")} className="min-h-12 bg-white px-5 py-3 text-sm font-semibold text-[#78080d] transition-colors hover:bg-[#f7ced0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">{text.accept}</button><button onClick={() => save("essential")} className="min-h-12 border border-white/45 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">{text.essential}</button></div></div></aside></div>;
}
