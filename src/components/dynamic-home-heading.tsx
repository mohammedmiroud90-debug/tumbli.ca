"use client";

import { useEffect, useState } from "react";

const alternatives: Record<string, string[]> = {
  en: ["Every day.", "For curious minds.", "Made to explore."],
  fr: ["Chaque jour.", "Pour les esprits curieux.", "À explorer."],
  ar: ["كل يوم.", "للعقول الفضولية.", "لاكتشاف المزيد."],
};

export function DynamicHomeHeading({ title, locale }: { title: string; locale: string }) {
  const match = title.match(/^(.*?\.)\s+(.+)$/);
  const prefix = match?.[1] ?? title;
  const phrases = alternatives[locale] ?? [match?.[2] ?? ""];
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setInterval(() => { setVisible(false); window.setTimeout(() => { setIndex((value) => (value + 1) % phrases.length); setVisible(true); }, 180); }, 3200);
    return () => window.clearInterval(timer);
  }, [phrases.length]);

  return <h1 className="max-w-[14ch] text-[2.55rem] font-medium leading-[1] tracking-[-0.055em] text-white sm:max-w-none sm:text-6xl lg:text-[4.4rem]">{prefix}{" "}<span className={`inline-block text-[#f7ced0] transition-all duration-200 ${visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}>{phrases[index]}</span></h1>;
}
