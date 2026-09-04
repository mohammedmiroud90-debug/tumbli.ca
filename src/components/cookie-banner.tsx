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
  return <aside role="dialog" aria-label={text.title} className="fixed inset-x-3 bottom-3 z-[100] mx-auto max-w-xl rounded-xl border border-zinc-200 bg-[#f7f7f5] p-5 text-[#252525] shadow-[0_18px_50px_rgba(0,0,0,0.22)] sm:bottom-6 sm:p-6"><h2 className="text-base font-semibold">{text.title}</h2><p className="mt-2 text-sm leading-6 text-zinc-600">{text.body}</p><div className="mt-5 flex flex-wrap gap-2"><button onClick={() => save("all")} className="bg-[#8c1515] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#b1040e]">{text.accept}</button><button onClick={() => save("essential")} className="border border-zinc-300 bg-white px-4 py-2.5 text-xs font-semibold transition-colors hover:bg-zinc-100">{text.essential}</button></div></aside>;
}
