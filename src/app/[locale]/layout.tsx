import type { Metadata } from "next";
import { Geist, Geist_Mono, Open_Sans } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { CookieBanner } from "@/components/cookie-banner";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tumbli.eu.cc";

const pageMetadata = {
  en: {
    title: "Tumbli Journal | Good ideas, every day",
    description:
      "Explore thoughtful stories, recommendations and fresh perspectives on culture, wellbeing, ideas and travel.",
    openGraphLocale: "en_CA",
  },
  fr: {
    title: "Journal Tumbli | De belles idées, chaque jour",
    description:
      "Découvrez des histoires, recommandations et perspectives inspirantes sur la culture, le bien-être, les idées et le voyage.",
    openGraphLocale: "fr_CA",
  },
  ar: {
    title: "مجلة تمبلي | أفكار جيدة كل يوم",
    description: "استكشف قصصًا وتوصيات ووجهات نظر جديدة عن الثقافة والعافية والأفكار والسفر.",
    openGraphLocale: "ar_AR",
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const selectedLocale = hasLocale(routing.locales, locale)
    ? locale
    : routing.defaultLocale;
  const details = pageMetadata[selectedLocale];
  const localePath = `/${selectedLocale}`;

  return {
    metadataBase: new URL(siteUrl),
    title: details.title,
    description: details.description,
    applicationName: "Tumbli",
    manifest: "/site.webmanifest",
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      ],
      apple: "/apple-touch-icon.png",
    },
    alternates: {
      canonical: localePath,
      languages: {en: "/en", fr: "/fr", ar: "/ar", "x-default": "/en"},
    },
    openGraph: {
      type: "website",
      url: localePath,
      siteName: "Tumbli",
      title: details.title,
      description: details.description,
      locale: details.openGraphLocale,
      alternateLocale: selectedLocale === "en" ? ["fr_CA", "ar_AR"] : "en_CA",
    },
    twitter: {
      card: "summary",
      title: details.title,
      description: details.description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const details = pageMetadata[locale as keyof typeof pageMetadata];
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "Tumbli",
        url: siteUrl,
      },
      {
        "@type": "WebSite",
        name: "Tumbli Journal",
        url: siteUrl,
        inLanguage: locale,
        description: details.description,
      },
    ],
  };

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} className={`${geistSans.variable} ${geistMono.variable} ${openSans.variable} h-full`}>
      <body className="min-h-full bg-zinc-50 font-sans text-zinc-900 antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
        <CookieBanner locale={locale} />
      </body>
    </html>
  );
}
