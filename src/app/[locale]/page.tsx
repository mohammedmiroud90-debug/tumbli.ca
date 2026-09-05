import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getPosts } from "@/lib/parse";
import { DynamicHomeHeading } from "@/components/dynamic-home-heading";
import { NewsletterForm } from "@/components/newsletter-form";

export const revalidate = 300;

export default async function HomePage() {
  // Server helpers are required here: this page awaits backend content, and
  // React 19 cannot safely resume a component that mixes request hooks and
  // async data fetching.
  const t = await getTranslations("Home");
  const locale = await getLocale();
  const { items: posts } = await getPosts(3, locale);
  const collections = [
    { title: t("collections.one.title"), icon: "◐", links: [t("collections.one.links.0"), t("collections.one.links.1"), t("collections.one.links.2"), t("collections.one.links.3")] },
    { title: t("collections.two.title"), icon: "⌁", links: [t("collections.two.links.0"), t("collections.two.links.1"), t("collections.two.links.2"), t("collections.two.links.3")] },
    { title: t("collections.three.title"), icon: "✦", links: [t("collections.three.links.0"), t("collections.three.links.1"), t("collections.three.links.2"), t("collections.three.links.3")] },
    { title: t("collections.four.title"), icon: "↗", links: [t("collections.four.links.0"), t("collections.four.links.1"), t("collections.four.links.2"), t("collections.four.links.3")] },
  ];
  const highlights = [
    { title: t("highlights.one.title"), description: t("highlights.one.description") },
    { title: t("highlights.two.title"), description: t("highlights.two.description") },
    { title: t("highlights.three.title"), description: t("highlights.three.description") },
  ];

  return (
    <main className="min-h-screen overflow-hidden bg-black text-white">
      <section id="top" className="relative overflow-hidden border-b border-white/20 bg-[#8c1515]">
        <header className="mx-auto w-full max-w-[1320px] px-4 sm:px-8">
          {/* Enhanced Mobile Top Bar */}
          <div className="flex min-h-12 items-center gap-2 border-b border-white/20 text-[11px] font-medium text-white sm:gap-5">
            <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.04em] sm:text-[11px]">{t("eyebrow")}</span>
            
            {/* Improved scrollable navigation with better mobile UX */}
            <nav 
              aria-label="Featured topics" 
              className="relative flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto [-webkit-overflow-scrolling:touch] [scrollbar-width:none] sm:gap-2 [&::-webkit-scrollbar]:hidden"
            >
              <a href="#discover" className="shrink-0 rounded-md bg-black/15 px-2.5 py-1.5 text-[10px] transition-colors hover:bg-black active:bg-black sm:text-[11px]">{t("collections.one.title")}</a>
              <a href="#discover" className="shrink-0 rounded-md bg-black/15 px-2.5 py-1.5 text-[10px] transition-colors hover:bg-black active:bg-black sm:text-[11px]">{t("collections.three.title")}</a>
              <a href="#our-posts" className="shrink-0 rounded-md bg-black/15 px-2.5 py-1.5 text-[10px] transition-colors hover:bg-black active:bg-black sm:text-[11px]">{t("nav.posts")}</a>
              <a href="#discover" className="hidden shrink-0 rounded-md bg-black/15 px-2.5 py-1.5 transition-colors hover:bg-black sm:block">{t("posts.viewAll")}</a>
              
              {/* Gradient fade indicator for mobile scroll */}
              <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-[#8c1515] to-transparent sm:hidden" />
            </nav>
            
            {/* Mobile search icon - visible on smaller screens */}
            <a 
              href={`/${locale}/search`} 
              aria-label={t("nav.searchStories")}
              className="grid size-11 shrink-0 place-items-center rounded-full text-white transition-colors hover:bg-white/10 hover:text-[#f7ced0] sm:hidden"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-6">
                <circle cx="11" cy="11" r="5" />
                <path d="m15 15 4 4" />
              </svg>
            </a>
            <a href={`/${locale}/request`} className="inline-flex shrink-0 items-center gap-1 border-b border-white px-1 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:border-black hover:bg-black hover:text-white sm:hidden">{t("nav.request")} <span aria-hidden="true" className="text-xs leading-none">↗</span></a>
            
            {/* Desktop search field */}
            <form action={`/${locale}/search`} role="search" className="ml-auto hidden shrink-0 sm:block">
              <label className="group flex h-9 w-[305px] items-center gap-2 rounded-full border border-black/20 bg-[#8f1116] px-3.5 text-xs text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.12),0_2px_5px_rgba(50,0,0,0.25)] transition-all duration-200 hover:border-zinc-300 hover:bg-[#f5f6f8] hover:text-[#252525] focus-within:w-[330px] focus-within:border-white focus-within:bg-white focus-within:text-[#252525] focus-within:ring-2 focus-within:ring-black/20">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" className="size-[18px] shrink-0"><circle cx="11" cy="11" r="5" /><path d="m15 15 4 4" /></svg>
                <span className="sr-only">{t("nav.searchStories")}</span>
                <input type="search" name="q" placeholder={t("nav.searchStories")} className="min-w-0 flex-1 bg-transparent text-xs text-inherit outline-none placeholder:text-white/90 group-hover:placeholder:text-zinc-500 focus:placeholder:text-zinc-500" />
              </label>
            </form>
          </div>
          
          {/* Main Navigation Bar */}
          <nav className="grid min-h-[66px] grid-cols-[auto_1fr_auto] items-center gap-2 sm:min-h-20 sm:gap-5" aria-label={t("nav.label")}>
            {/* Enhanced Logo */}
            <a href="#top" aria-label="Tumbli" className="block py-2">
              <Image 
                src="/tumbli-logo.png" 
                alt="Tumbli" 
                width={146} 
                height={39} 
                priority 
                className="h-auto w-[100px] brightness-0 invert transition-transform hover:scale-105 sm:w-[136px]" 
              />
            </a>
            
            {/* Desktop Navigation Links */}
            <div className="hidden items-center justify-end gap-6 text-sm font-normal text-white lg:flex">
              <div className="group relative">
                <a className="relative block py-2 transition-colors hover:text-[#f7ced0] focus-visible:text-[#f7ced0] after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-[#f7ced0] after:transition-transform after:duration-200 group-hover:after:scale-x-100 focus-visible:after:scale-x-100" href={`/${locale}/discover`}>{t("nav.discover")}</a>
                <div className="invisible fixed inset-x-0 top-32 z-50 h-[min(620px,calc(100vh-8rem))] translate-y-2 overflow-hidden bg-[#8c1515] opacity-0 shadow-[0_24px_45px_rgba(30,10,10,0.32)] transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  <div className="mx-auto grid h-full max-w-[1320px] grid-cols-[1.1fr_0.9fr] gap-12 px-8 py-10">
                    <div className="relative h-full overflow-hidden bg-[#ded6cc] p-10 text-[#252525]"><Image src="/hero-outline.png" alt="" fill className="object-contain p-12 opacity-75" sizes="700px" /><div className="relative z-10"><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8c1515]">{t("eyebrow")}</p><p className="mt-4 max-w-[19ch] text-4xl font-semibold leading-tight">{t("description")}</p></div></div>
                    <div className="flex flex-col justify-center py-1"><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f7ced0]">{t("nav.discover")}</p><div className="mt-5 grid gap-2"><a href={`/${locale}/discover`} className="px-4 py-3 text-xl font-semibold transition-colors hover:bg-white/10 hover:text-[#f7ced0]">{t("nav.discover")}</a><a href={`/${locale}/services`} className="px-4 py-3 text-xl font-semibold transition-colors hover:bg-white/10 hover:text-[#f7ced0]">{t("nav.services")}</a><a href={`/${locale}/posts`} className="px-4 py-3 text-xl font-semibold transition-colors hover:bg-white/10 hover:text-[#f7ced0]">{t("nav.posts")}</a><a href={`/${locale}/posts/reinforcement-learning-explained-from-q-learning-to-deep-q-networks`} className="px-4 py-3 text-xl font-semibold transition-colors hover:bg-white/10 hover:text-[#f7ced0]">{t("nav.featured")}</a><a href={`/${locale}/questions`} className="px-4 py-3 text-xl font-semibold transition-colors hover:bg-white/10 hover:text-[#f7ced0]">{t("nav.questions")}</a><a href={`/${locale}/search`} className="px-4 py-3 text-xl font-semibold transition-colors hover:bg-white/10 hover:text-[#f7ced0]">{t("nav.search")}</a></div></div>
                  </div>
                </div>
              </div>
              <a className="relative py-2 transition-colors hover:text-[#f7ced0] focus-visible:text-[#f7ced0] after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-[#f7ced0] after:transition-transform after:duration-200 hover:after:scale-x-100 focus-visible:after:scale-x-100" href="#our-posts">{t("nav.posts")}</a>
              <a className="relative py-2 transition-colors hover:text-[#f7ced0] focus-visible:text-[#f7ced0] after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-[#f7ced0] after:transition-transform after:duration-200 hover:after:scale-x-100 focus-visible:after:scale-x-100" href={`/${locale}/services`}>{t("nav.services")}</a>
              <a className="relative py-2 transition-colors hover:text-[#f7ced0] focus-visible:text-[#f7ced0] after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-[#f7ced0] after:transition-transform after:duration-200 hover:after:scale-x-100 focus-visible:after:scale-x-100" href={`/${locale}/products`}>{t("nav.products")}</a>
              <a className="relative py-2 transition-colors hover:text-[#f7ced0] focus-visible:text-[#f7ced0] after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-[#f7ced0] after:transition-transform after:duration-200 hover:after:scale-x-100 focus-visible:after:scale-x-100" href={`/${locale}/platform`}>{t("nav.platform")}</a>
              <a className="relative py-2 transition-colors hover:text-[#f7ced0] focus-visible:text-[#f7ced0] after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-[#f7ced0] after:transition-transform after:duration-200 hover:after:scale-x-100 focus-visible:after:scale-x-100" href={`/${locale}/about`}>{t("nav.about")}</a>
              <a className="relative py-2 transition-colors hover:text-[#f7ced0] focus-visible:text-[#f7ced0] after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-[#f7ced0] after:transition-transform after:duration-200 hover:after:scale-x-100 focus-visible:after:scale-x-100" href="#contact">{t("nav.contact")}</a>
            </div>
            
            {/* Enhanced Mobile Menu - Better touch target and positioning */}
            <div className="flex items-center justify-self-end lg:hidden">
              <details className="group relative">
                <summary aria-label={t("nav.chooseLanguage")} className="grid size-11 cursor-pointer list-none place-items-center rounded-full text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white [&::-webkit-details-marker]:hidden">
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="size-5"><circle cx="12" cy="12" r="8.5" /><path d="M3.8 12h16.4M12 3.5c2.15 2.35 3.1 5.15 3.1 8.5s-.95 6.15-3.1 8.5c-2.15-2.35-3.1-5.15-3.1-8.5S9.85 5.85 12 3.5Z" /></svg>
                </summary>
                <div className="absolute right-0 top-[calc(100%+.5rem)] z-[70] hidden w-40 border border-zinc-200 bg-[#f7f7f5] p-1.5 text-[#252525] shadow-[0_14px_32px_rgba(0,0,0,0.28)] group-open:block"><span aria-hidden="true" className="absolute -top-1.5 right-4 size-3 rotate-45 border-l border-t border-zinc-200 bg-[#f7f7f5]" />
                  <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{t("nav.language")}</p>
                  {([{ locale: "en", label: "English" }, { locale: "fr", label: "Français" }, { locale: "ar", label: "العربية" }] as const).map((language) => <Link key={language.locale} href="/" locale={language.locale} aria-current={locale === language.locale ? "page" : undefined} className={`block px-3 py-2 text-sm transition-colors hover:bg-zinc-200 ${locale === language.locale ? "bg-zinc-200 font-semibold text-[#8c1515]" : "text-zinc-700"}`}>{language.label}</Link>)}
                </div>
              </details>
            <details className="group relative">
              <summary 
                aria-label={t("nav.openMenu")}
                className="relative z-[60] grid size-12 cursor-pointer list-none place-items-center rounded-full text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white [&::-webkit-details-marker]:hidden"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-7">
                  <path d="M3 6h18M3 12h18M3 18h18" />
                </svg>
              </summary>
              
              {/* Enhanced Mobile Dropdown Menu */}
              <div className="fixed inset-0 z-50 hidden overflow-y-auto bg-[#202020] pt-24 text-white group-open:block">
                {/* Menu Items */}
                <div className="min-h-full border-r border-white/50 px-7 pb-12 shadow-[12px_0_20px_rgba(0,0,0,0.32)]">
                  <a href={`/${locale}`} aria-label="Tumbli home" className="mb-10 inline-block border-b border-white/25 pb-5"><Image src="/tumbli-logo.png" alt="Tumbli" width={146} height={39} className="h-auto w-[126px] brightness-0 invert" /></a>
                  <a href={`/${locale}/discover`} className="flex items-center justify-between py-2 text-4xl font-semibold leading-tight tracking-[-0.05em] transition-colors hover:text-[#f7ced0]">
                    {t("nav.discover")}
                  </a>
                  <a href={`/${locale}/posts`} className="flex items-center justify-between py-2 text-4xl font-semibold leading-tight tracking-[-0.05em] transition-colors hover:text-[#f7ced0]">
                    {t("nav.posts")}
                  </a>
                  <a href={`/${locale}/services`} className="flex items-center justify-between py-2 text-4xl font-semibold leading-tight tracking-[-0.05em] transition-colors hover:text-[#f7ced0]">{t("nav.services")} <span aria-hidden="true" className="text-xl font-normal text-white/40">›</span></a>
                  <a href={`/${locale}/posts/reinforcement-learning-explained-from-q-learning-to-deep-q-networks`} className="flex items-center justify-between py-2 text-4xl font-semibold leading-tight tracking-[-0.05em] transition-colors hover:text-[#f7ced0]">{t("nav.featured")} <span aria-hidden="true" className="text-xl font-normal text-white/40">›</span></a>
                  <a href={`/${locale}/products`} className="flex items-center justify-between py-2 text-4xl font-semibold leading-tight tracking-[-0.05em] transition-colors hover:text-[#f7ced0]">{t("nav.products")} <span aria-hidden="true" className="text-xl font-normal text-white/40">›</span></a>
                  <a href={`/${locale}/platform`} className="flex items-center justify-between py-2 text-4xl font-semibold leading-tight tracking-[-0.05em] transition-colors hover:text-[#f7ced0]">{t("nav.platform")} <span aria-hidden="true" className="text-xl font-normal text-white/40">›</span></a>
                  <a href={`/${locale}/about`} className="flex items-center justify-between py-2 text-4xl font-semibold leading-tight tracking-[-0.05em] transition-colors hover:text-[#f7ced0]">
                    {t("nav.about")}
                  </a>
                  <a href="#contact" className="flex items-center justify-between py-2 text-4xl font-semibold leading-tight tracking-[-0.05em] transition-colors hover:text-[#f7ced0]">
                    {t("nav.contact")}
                  </a>
                </div>
                
              </div>
            </details>
            </div>
            
            {/* Desktop search and language controls */}
            <div className="hidden items-center justify-self-end gap-1 lg:flex">
              <a href={`/${locale}/request`} className="mr-1 inline-flex items-center gap-1 border-b border-white px-1 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:border-black hover:bg-black hover:text-white">{t("nav.request")} <span aria-hidden="true" className="text-sm leading-none">↗</span></a>
              <a href={`/${locale}/search`} aria-label={t("nav.searchStories")} className="grid size-12 place-items-center rounded-full text-white transition-colors hover:bg-white/10 hover:text-[#f7ced0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-6"><circle cx="11" cy="11" r="5.5" /><path d="m15.2 15.2 4.3 4.3" /></svg>
              </a>
            <details className="group relative">
              <summary aria-label={t("nav.chooseLanguage")} className="flex h-10 cursor-pointer list-none items-center gap-1.5 px-1.5 text-white transition-opacity hover:opacity-75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white [&::-webkit-details-marker]:hidden">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="size-[18px]"><circle cx="12" cy="12" r="8.5" /><path d="M3.8 12h16.4M12 3.5c2.15 2.35 3.1 5.15 3.1 8.5s-.95 6.15-3.1 8.5c-2.15-2.35-3.1-5.15-3.1-8.5S9.85 5.85 12 3.5Z" /></svg>
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="size-3 transition-transform duration-200 group-open:rotate-180"><path d="M7 9.5h10L12 15z" /></svg>
              </summary>
              <div className="absolute right-0 top-[calc(100%+0.75rem)] z-30 hidden w-44 border border-zinc-200 bg-[#f7f7f5] p-1.5 text-[#252525] shadow-[0_14px_32px_rgba(0,0,0,0.28)] group-open:block"><span aria-hidden="true" className="absolute -top-1.5 right-4 size-3 rotate-45 border-l border-t border-zinc-200 bg-[#f7f7f5]" />
                <Link href="/" locale="en" aria-current={locale === "en" ? "page" : undefined} className={`relative block px-3 py-2 text-sm transition-colors hover:bg-zinc-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#8c1515] ${locale === "en" ? "bg-zinc-200 font-semibold text-[#8c1515]" : ""}`}>English</Link>
                <Link href="/" locale="fr" aria-current={locale === "fr" ? "page" : undefined} className={`relative block px-3 py-2 text-sm transition-colors hover:bg-zinc-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#8c1515] ${locale === "fr" ? "bg-zinc-200 font-semibold text-[#8c1515]" : ""}`}>Français</Link>
                <Link href="/" locale="ar" aria-current={locale === "ar" ? "page" : undefined} className={`relative block px-3 py-2 text-sm transition-colors hover:bg-zinc-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#8c1515] ${locale === "ar" ? "bg-zinc-200 font-semibold text-[#8c1515]" : ""}`}>العربية</Link>
              </div>
            </details>
            </div>
          </nav>
        </header>

        <div className="relative mx-auto min-h-[295px] max-w-[1100px] px-4 pb-9 pt-11 sm:min-h-[365px] sm:px-8 sm:pb-12 sm:pt-16">
          <span aria-hidden="true" className="pointer-events-none absolute bottom-0 -left-20 size-40 rounded-full border-[18px] border-white/20 after:absolute after:-right-1 after:top-5 after:size-2 after:bg-white/25 motion-reduce:animate-none sm:-left-24 sm:size-48 sm:border-[22px] animate-[hero-circle-roll_9s_ease-in-out_infinite]" />
          <div className="absolute left-0 top-12 h-24 w-px bg-white/70" />
          <Image
            src="/hero-outline.png"
            alt=""
            aria-hidden="true"
            width={480}
            height={420}
            className="pointer-events-none absolute bottom-[-3.75rem] right-[-3rem] hidden w-[300px] invert opacity-75 lg:block xl:right-[-2rem] xl:w-[420px]"
          />
          <div className="relative z-10 max-w-[670px]">
            <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#f7ced0]">{t("eyebrow")}</p>
            <DynamicHomeHeading title={t("title")} locale={locale} />
            <p className="mt-4 max-w-[650px] text-sm leading-6 text-zinc-200 sm:text-base">{t("description")}</p>
            <div className="mt-6 flex flex-wrap gap-x-7 gap-y-3 text-sm font-semibold text-white">
              <a className="border-b border-white/80 pb-0.5 transition-opacity hover:opacity-70" href="#our-posts">{t("cta")} <span aria-hidden="true">&nearr;</span></a>
              <a className="border-b border-white/80 pb-0.5 transition-opacity hover:opacity-70" href="#discover">{t("secondaryCta")} <span aria-hidden="true">&nearr;</span></a>
            </div>
          </div>
        </div>
      </section>

      <section id="highlights" className="overflow-hidden bg-[#e9e7e2] py-10 text-[#171717] sm:py-14">
        <div className="w-full px-4 sm:px-8">
          <div className="mb-6 flex items-end justify-between gap-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8c1515]">{t("highlights.eyebrow")}</p>
              <h2 className="mt-2 text-3xl font-medium tracking-[-0.045em] sm:text-4xl">{t("highlights.title")}</h2>
            </div>
            <a href={`/${locale}/discover`} className="hidden text-sm text-zinc-600 underline decoration-[#8c1515]/40 underline-offset-4 transition-colors hover:text-[#8c1515] sm:block">{t("highlights.note")} <span aria-hidden="true">→</span></a>
          </div>

          <div className="-mr-4 flex gap-4 overflow-x-auto pb-2 pr-4 [scrollbar-width:thin] sm:-mr-8 sm:gap-5 sm:pr-8">
            {highlights.map((highlight, index) => (
              <a
                key={highlight.title}
                href={`/${locale}/discover`}
                aria-label={`Discover more: ${highlight.title}`}
                className={`group grid h-[220px] w-[min(88vw,440px)] shrink-0 grid-cols-[0.92fr_1.08fr] overflow-hidden rounded-xl shadow-[0_12px_28px_rgba(30,25,20,0.12)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(30,25,20,0.2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8c1515] sm:h-[240px] ${
                  index === 0 ? "bg-[#8c1515] text-white" : "bg-white text-[#292929]"
                }`}
              >
                <div className={`relative min-w-0 p-5 sm:p-6 ${index === 1 ? "order-2" : ""}`}>
                  <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${index === 0 ? "text-[#f7ced0]" : "text-[#8c1515]"}`}>0{index + 1}</p>
                  <h3 className="mt-7 text-lg font-semibold leading-snug tracking-[-0.025em] sm:text-xl">{highlight.title}</h3>
                  <p className={`mt-3 line-clamp-3 text-xs leading-5 sm:text-sm ${index === 0 ? "text-white/85" : "text-zinc-600"}`}>{highlight.description}</p>
                </div>
                <div className={`relative overflow-hidden ${index === 0 ? "bg-[#ded6cc]" : index === 1 ? "bg-[#252525]" : "bg-[#d9d7d1]"}`}>
                  <Image src="/hero-outline.png" alt="" fill className={`object-contain p-5 transition-transform duration-500 group-hover:scale-110 ${index === 1 ? "opacity-55 invert" : "opacity-75"}`} sizes="440px" />
                  <span className={`absolute bottom-4 right-4 grid size-10 place-items-center rounded-full text-sm font-semibold transition-transform duration-300 group-hover:rotate-45 ${index === 0 ? "bg-[#8c1515] text-white" : "bg-white text-[#8c1515]"}`}>+</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="discover" className="bg-[#f5f6f8] px-5 py-10 text-[#101113] sm:px-8 sm:py-14">
        <div className="mx-auto max-w-[1100px] bg-white px-5 py-10 shadow-[0_18px_50px_rgba(0,0,0,0.06)] sm:px-10 sm:py-12">
          <p className="mx-auto max-w-2xl text-center text-sm leading-6 text-[#2d3b43]">{t("intro")}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {collections.map((collection) => (
              <article key={collection.title} className="bg-[#f0f1f2] p-5 transition-colors hover:bg-[#e8f4f7]">
                <div className="flex items-center gap-3"><span aria-hidden="true" className="grid size-8 place-items-center rounded-l-full rounded-r-md bg-[#8c1515] text-sm font-semibold text-white">{collection.icon}</span><h2 className="text-2xl font-semibold leading-tight tracking-[-0.04em] text-[#8c1515]">{collection.title}</h2></div>
                <ul className="mt-4 space-y-2 text-sm leading-5 text-[#182229]">
                  {collection.links.map((link) => <li key={link}><a href="#our-posts" className="underline decoration-[#c99191] underline-offset-2 transition-colors hover:text-[#8c1515]">{link}</a></li>)}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="our-posts" className="bg-[#f5f6f8] px-5 pb-12 text-[#101113] sm:px-8 sm:pb-20">
        <div className="mx-auto max-w-[1100px] border-t border-[#cfd4d7] pt-10 sm:pt-14">
          <div className="flex items-end justify-between gap-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8c1515]">{t("posts.eyebrow")}</p>
              <h2 className="mt-2 text-4xl font-semibold tracking-[-0.05em] text-[#101113] sm:text-5xl">{t("posts.title")}</h2>
            </div>
            <a href={`/${locale}/posts`} className="hidden text-sm font-semibold text-[#8c1515] underline underline-offset-4 sm:block">{t("posts.viewAll")} &nearr;</a>
          </div>
          <div className="mt-8 grid border-t border-[#cfd4d7] sm:grid-cols-3">
            {posts.length > 0 ? posts.map((post, index) => (
              <article key={post.id} className="group border-b border-[#cfd4d7] py-6 sm:border-b-0 sm:px-6 sm:first:pl-0 sm:not(:last-child):border-r sm:last:pr-0">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#8c1515]">0{index + 1} - {post.category}</p>
                <h3 className="mt-4 text-xl font-semibold leading-snug tracking-[-0.035em]">{post.title}</h3>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-600">{post.excerpt}</p>
                <a href={`/${locale}/posts/${post.slug}`} className="mt-7 inline-block text-sm font-semibold text-[#8c1515] underline underline-offset-4 transition-colors hover:text-black">{t("posts.readMore")} &nearr;</a>
              </article>
            )) : ["first", "second", "third"].map((post, index) => (
              <article key={post} className="group border-b border-[#cfd4d7] py-6 sm:border-b-0 sm:px-6 sm:first:pl-0 sm:not(:last-child):border-r sm:last:pr-0">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#8c1515]">0{index + 1} - {t(`posts.${post}.category`)}</p>
                <h3 className="mt-4 text-xl font-semibold leading-snug tracking-[-0.035em]">{t(`posts.${post}.title`)}</h3>
                <a href="#contact" className="mt-7 inline-block text-sm font-semibold text-[#8c1515] underline underline-offset-4 transition-colors hover:text-black">{t("posts.readMore")} &nearr;</a>
              </article>
            ))}
          </div>
          <NewsletterForm locale={locale} />
        </div>
      </section>

      <footer id="contact" className="relative overflow-hidden border-t-4 border-[#8c1515] bg-[#8c1515] px-4 py-8 text-white sm:px-8 sm:py-10"><div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-30"><span className="absolute -bottom-24 -left-16 size-72 border-[28px] border-[#3e0608]"/><span className="absolute -right-12 -top-20 size-64 border-[22px] border-[#f7ced0]/50"/><span className="absolute bottom-5 right-[24%] size-28 border-[14px] border-[#3e0608]"/></div>
        <div className="relative mx-auto grid max-w-[1100px] gap-7 sm:grid-cols-[auto_1fr_auto] sm:items-start sm:gap-8">
          <Image src="/tumbli-logo.png" alt="Tumbli" width={108} height={29} className="h-auto w-[105px] brightness-0 invert" />
          <div><p className="text-lg font-semibold tracking-[-0.025em]">{t("footer.heading")}</p><p className="mt-2 max-w-md text-sm leading-6 text-white/80">{t("footer.description")}</p><nav aria-label={t("nav.label")} className="mt-5 grid grid-cols-2 gap-x-5 gap-y-3 text-xs font-medium sm:flex sm:flex-wrap sm:gap-x-6 sm:gap-y-2"><a href="#top" className="border-b border-white/50 pb-0.5 transition-colors hover:border-[#f7ced0] hover:text-[#f7ced0]">{t("nav.discover")}</a><a href="#our-posts" className="border-b border-white/50 pb-0.5 transition-colors hover:border-[#f7ced0] hover:text-[#f7ced0]">{t("nav.posts")}</a><a href="#discover" className="border-b border-white/50 pb-0.5 transition-colors hover:border-[#f7ced0] hover:text-[#f7ced0]">{t("nav.about")}</a><a href="#contact" className="border-b border-white/50 pb-0.5 transition-colors hover:border-[#f7ced0] hover:text-[#f7ced0]">{t("nav.contact")}</a></nav></div>
          <div className="flex items-center gap-4 border-t border-white/25 pt-4 sm:justify-end sm:border-t-0 sm:pt-0"><a href="https://www.linkedin.com" target="_blank" rel="noreferrer" aria-label={t("footer.linkedin")} className="grid size-10 place-items-center rounded-full border border-white/40 text-white transition-colors hover:border-[#f7ced0] hover:bg-white hover:text-[#8c1515]"><svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="size-[18px]"><path d="M5.3 3.5A1.8 1.8 0 1 1 5.3 7a1.8 1.8 0 0 1 0-3.5ZM3.8 8.5h3v11h-3v-11Zm5 0h2.9V10c.4-.8 1.4-1.8 3.3-1.8 3.5 0 4.1 2.3 4.1 5.3v6h-3v-5.3c0-1.3 0-2.9-1.8-2.9s-2.1 1.4-2.1 2.8v5.4h-3v-11Z" /></svg></a><p className="text-xs leading-5 text-white/80 sm:max-w-[150px] sm:text-right">{t("footer.copyright")}</p></div>
        </div>
      </footer>
    </main>
  );
}
