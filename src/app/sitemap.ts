import type { MetadataRoute } from "next";
import { getPosts, getQuestions } from "@/lib/parse";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tumbli.eu.cc";
const locales = ["en", "fr", "ar"] as const;

export const revalidate = 3600;

function alternates(path: string) {
  return { languages: Object.fromEntries(locales.map((locale) => [locale, `${siteUrl}/${locale}${path}`])) };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [postsResult, questionsResult] = await Promise.all([getPosts(500), getQuestions(500)]);
  const homePages = locales.map((locale) => ({
    url: `${siteUrl}/${locale}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 1,
    alternates: alternates(""),
  }));
  const postPages = postsResult.items.flatMap((post) => locales.map((locale) => ({
    url: `${siteUrl}/${locale}/posts/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.8,
    alternates: alternates(`/posts/${post.slug}`),
  })));
  const questionPages = questionsResult.items.flatMap((question) => locales.map((locale) => ({
    url: `${siteUrl}/${locale}/questions/${question.slug}`,
    lastModified: new Date(question.publishedAt),
    changeFrequency: "weekly" as const,
    priority: 0.7,
    alternates: alternates(`/questions/${question.slug}`),
  })));
  return [...homePages, ...postPages, ...questionPages];
}
