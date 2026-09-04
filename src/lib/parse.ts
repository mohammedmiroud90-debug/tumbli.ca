import { commentText, sanitizeCommentHtml } from "@/lib/comment-format";
import { ensureDynamicTranslation } from "@/lib/dynamic-translation";

export type ContentTranslations = Record<string, Record<string, unknown>>;

export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  publishedAt: string;
  imageUrl: string;
  tags: string[];
  readingTime: number;
  translations?: ContentTranslations;
};

export type Project = {
  id: string; title: string; slug: string; company: string; description: string; website: string; imageUrl: string; status: string;
  translations?: ContentTranslations;
};

export type Question = {
  id: string;
  slug: string;
  title: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  author: string;
  publishedAt: string;
  viewCount: number;
  voteScore: number;
  answerCount: number;
  translations?: ContentTranslations;
};

export type Answer = {
  id: string; content: string; author: string; createdAt: string; voteScore: number; isAccepted: boolean;
  translations?: ContentTranslations;
};

export type Comment = {
  id: string;
  content: string;
  author: string;
  createdAt: string;
  parentId: string | null;
  replies: Comment[];
  translations?: ContentTranslations;
  parseClassName?: string;
};

type ParseResult = { results?: Record<string, unknown>[]; count?: number };

// This is the same public Parse application used by Libertta.Blog. Environment
// variables still take precedence so deployments can point at another instance.
const serverUrl = (process.env.PARSE_SERVER_URL || "https://backendweb.eollinea.com/parse").replace(/\/$/, "");
const appId = process.env.PARSE_APP_ID || "f86207c4cf7bdc08ff889e9d8519bbf3";
const javascriptKey = process.env.PARSE_JAVASCRIPT_KEY || "5828916ef66b1aba0ab4efdb2724c00f27a6560ba126509ca1bbccff3a13e56c";

export const isBackendConfigured = Boolean(serverUrl && appId && javascriptKey);

function headers() {
  return {
    "X-Parse-Application-Id": appId ?? "",
    "X-Parse-Javascript-Key": javascriptKey ?? "",
    "Content-Type": "application/json",
  };
}

async function query(className: string, params: Record<string, string>): Promise<ParseResult | null> {
  if (!serverUrl || !appId || !javascriptKey) return null;

  const url = new URL(`${serverUrl}/classes/${className}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);

  try {
    const response = await fetch(url, {
      headers: headers(),
      // Stored translations are updated independently from the source record.
      // Keep the response cache short so a newly saved translation reaches all
      // locale pages quickly while preserving fast cached reads.
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return null;
    return (await response.json()) as ParseResult;
  } catch {
    return null;
  }
}

async function persistTranslations(className: string, objectId: string, translations: ContentTranslations) {
  if (!serverUrl || !objectId) return;
  try {
    await fetch(`${serverUrl}/classes/${encodeURIComponent(className)}/${encodeURIComponent(objectId)}`, {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify({ translations }),
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    // Rendering still uses the freshly translated fields when persistence is unavailable.
  }
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function date(value: unknown, fallback: string): string {
  if (typeof value === "string" && value) return value;
  if (value && typeof value === "object" && "iso" in value && typeof value.iso === "string") return value.iso;
  return fallback;
}

function fileUrl(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "url" in value && typeof value.url === "string") return value.url;
  return "";
}

function translationMap(value: unknown): ContentTranslations | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const languages = Object.entries(value as Record<string, unknown>).filter(([, fields]) => fields && typeof fields === "object" && !Array.isArray(fields));
  return languages.length ? Object.fromEntries(languages) as ContentTranslations : undefined;
}

function translatedValue(translations: ContentTranslations | undefined, locale: string, fields: string[], fallback: string): string {
  if (!translations || !locale || locale === "en") return fallback;
  const language = translations[locale];
  if (!language) return fallback;
  for (const field of fields) {
    const value = text(language[field]);
    if (value) return value;
  }
  return fallback;
}

function translatedTags(translations: ContentTranslations | undefined, locale: string, fallback: string[]): string[] {
  if (!translations || !locale || locale === "en") return fallback;
  const value = translations[locale]?.tags;
  if (Array.isArray(value)) return value.map(String).map((tag) => tag.trim()).filter(Boolean);
  const tags = text(value);
  if (!tags) return fallback;
  return tags.split(/\s*\|\|\s*|\s*,\s*/).map((tag) => tag.trim()).filter(Boolean);
}

function questionTitle(value: string): string {
  return value.split(/\s*\n\s*⟦ب⟧\s*\n\s*/)[0]?.trim() || value;
}

function questionDetails(value: string): string {
  const sections = value.split(/\s*\n\s*⟦ب⟧\s*\n\s*/);
  return sections.length > 1 ? sections.slice(1).join("\n\n").trim() : "";
}

export function plainText(value: string): string {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function excerpt(value: string): string {
  const result = plainText(value);
  return result.length > 180 ? `${result.slice(0, 177).trimEnd()}...` : result;
}

function author(record: Record<string, unknown>): string {
  const value = record.author ?? record.authorId ?? record.createdBy ?? record.user;
  if (typeof value === "string" && value.trim()) return value.trim();
  if (value && typeof value === "object") {
    const item = value as Record<string, unknown>;
    const name = [text(item.firstName), text(item.lastName)].filter(Boolean).join(" ");
    return name || text(item.displayName) || text(item.name) || text(item.username) || "Tumbli Journal";
  }
  return "Tumbli Journal";
}

function mapPost(record: Record<string, unknown>): Post {
  const content = text(record.content) || text(record.body) || text(record.details);
  const savedExcerpt = text(record.excerpt) || text(record.summary) || text(record.description);
  const tags = Array.isArray(record.tags) ? record.tags.map(String).filter(Boolean) : [];
  const readingTime = Number(record.readingTime) || Math.max(1, Math.ceil((plainText(content).split(/\s+/).filter(Boolean).length || 200) / 200));

  return {
    id: text(record.objectId),
    slug: text(record.slug) || text(record.objectId),
    title: text(record.title) || text(record.name) || text(record.headline) || "Untitled article",
    excerpt: savedExcerpt || excerpt(content),
    content,
    category: text(record.category) || text(record.type) || text(record.tag) || "General",
    author: author(record),
    publishedAt: date(record.publishedAt ?? record.originalCreatedAt ?? record.createdAt, new Date().toISOString()),
    imageUrl: fileUrl(record.coverImage) || fileUrl(record.image) || fileUrl(record.thumbnail) || fileUrl(record.imageUrl),
    tags,
    readingTime,
    translations: translationMap(record.translations),
  };
}

function mapQuestion(record: Record<string, unknown>): Question {
  return {
    id: text(record.objectId),
    slug: text(record.slug) || text(record.objectId),
    title: text(record.title) || text(record.question) || "Untitled question",
    // Libertta's established Question collection stores the body in `content`.
    question: text(record.question) || text(record.content) || text(record.title),
    answer: text(record.answer) || text(record.response) || text(record.content),
    category: text(record.category) || text(record.type) || "General",
    tags: Array.isArray(record.tags) ? record.tags.map(String).filter(Boolean) : [],
    author: author(record),
    publishedAt: date(record.publishedAt ?? record.createdAt, new Date().toISOString()),
    viewCount: Number(record.viewCount) || 0,
    voteScore: Number(record.voteScore) || 0,
    answerCount: Number(record.answerCount) || 0,
    translations: translationMap(record.translations),
  };
}

function mapProject(record: Record<string, unknown>): Project {
  return {
    id: text(record.objectId), title: text(record.title) || text(record.name) || "Untitled project", slug: text(record.slug) || text(record.objectId),
    company: text(record.company) || "Independent", description: text(record.description) || text(record.details), website: text(record.website),
    imageUrl: fileUrl(record.imageUrl) || fileUrl(record.image), status: text(record.status) || "published",
    translations: translationMap(record.translations),
  };
}

function mapAnswer(record: Record<string, unknown>): Answer {
  return {
    id: text(record.objectId), content: text(record.content) || text(record.answer) || "", author: author(record),
    createdAt: date(record.createdAt, new Date().toISOString()), voteScore: Number(record.voteScore) || 0,
    isAccepted: record.isAccepted === true,
    translations: translationMap(record.translations),
  };
}

/** Apply the translations stored on a Parse record without changing the source data. */
export function localizePost(post: Post, locale: string): Post {
  return {
    ...post,
    title: translatedValue(post.translations, locale, ["title", "headline", "name"], post.title),
    excerpt: translatedValue(post.translations, locale, ["excerpt", "summary", "description"], post.excerpt),
    content: translatedValue(post.translations, locale, ["content", "details", "body"], post.content),
    category: translatedValue(post.translations, locale, ["category", "type"], post.category),
    tags: translatedTags(post.translations, locale, post.tags),
  };
}

export function localizeQuestion(question: Question, locale: string): Question {
  const translatedQuestion = translatedValue(question.translations, locale, ["question"], "");
  return {
    ...question,
    title: translatedValue(question.translations, locale, ["title"], questionTitle(translatedQuestion) || question.title),
    question: translatedValue(question.translations, locale, ["details", "content", "summary"], questionDetails(translatedQuestion) || question.question),
    answer: translatedValue(question.translations, locale, ["topAnswer", "answer", "response"], question.answer),
    category: translatedValue(question.translations, locale, ["category", "type"], question.category),
    tags: translatedTags(question.translations, locale, question.tags),
  };
}

export function localizeProject(project: Project, locale: string): Project {
  return {
    ...project,
    title: translatedValue(project.translations, locale, ["title", "name"], project.title),
    description: translatedValue(project.translations, locale, ["description", "details", "summary"], project.description),
    company: translatedValue(project.translations, locale, ["company"], project.company),
  };
}

export function localizeAnswer(answer: Answer, locale: string): Answer {
  return { ...answer, content: translatedValue(answer.translations, locale, ["content", "answer", "details"], answer.content) };
}

async function ensurePostLocalized(post: Post, locale: string, includeContent = false): Promise<Post> {
  const translations = await ensureDynamicTranslation({
    className: "Article", objectId: post.id, locale, translations: post.translations,
    fields: { title: post.title, excerpt: post.excerpt, ...(includeContent ? { content: post.content } : {}), category: post.category, tags: post.tags.join(" || ") },
    persist: (value) => persistTranslations("Article", post.id, value),
  });
  return localizePost({ ...post, translations }, locale);
}

async function ensureQuestionLocalized(question: Question, locale: string, includeDetails = false): Promise<Question> {
  const translations = await ensureDynamicTranslation({
    className: "Question", objectId: question.id, locale, translations: question.translations,
    fields: { question: question.title, summary: excerpt(question.question), ...(includeDetails ? { details: question.question, topAnswer: question.answer } : {}), category: question.category, tags: question.tags.join(" || ") },
    persist: (value) => persistTranslations("Question", question.id, value),
  });
  return localizeQuestion({ ...question, translations }, locale);
}

async function ensureProjectLocalized(project: Project, locale: string): Promise<Project> {
  const translations = await ensureDynamicTranslation({
    className: "Project", objectId: project.id, locale, translations: project.translations,
    fields: { name: project.title, description: project.description, category: project.company },
    persist: (value) => persistTranslations("Project", project.id, value),
  });
  return localizeProject({ ...project, translations }, locale);
}

async function ensureAnswerLocalized(answer: Answer, locale: string): Promise<Answer> {
  const translations = await ensureDynamicTranslation({
    className: "Answer", objectId: answer.id, locale, translations: answer.translations,
    fields: { content: answer.content },
    persist: (value) => persistTranslations("Answer", answer.id, value),
  });
  return localizeAnswer({ ...answer, translations }, locale);
}

async function ensureCommentLocalized(comment: Comment, locale: string): Promise<Comment> {
  const className = comment.parseClassName || "Comment";
  const translations = await ensureDynamicTranslation({
    className, objectId: comment.id, locale, translations: comment.translations,
    fields: { content: comment.content },
    persist: (value) => persistTranslations(className, comment.id, value),
  });
  return { ...comment, translations, content: translatedValue(translations, locale, ["content", "comment", "body"], comment.content) };
}

async function firstResult<T>(classes: string[], params: Record<string, string>, mapper: (record: Record<string, unknown>) => T) {
  for (const className of classes) {
    const result = await query(className, params);
    const records = result?.results ?? [];
    if (records.length) return { items: records.map(mapper), total: result?.count ?? records.length };
  }
  return { items: [] as T[], total: 0 };
}

export async function getPosts(limit = 12, locale = "en") {
  const result = await firstResult(["Article", "BlogPost"], {
    where: JSON.stringify({ status: "published" }),
    order: "-publishedAt",
    limit: String(limit),
    count: "1",
  }, mapPost);
  return { ...result, items: await Promise.all(result.items.map((post) => ensurePostLocalized(post, locale))) };
}

export async function getProjects(locale = "en"): Promise<Project[]> {
  const result = await query("Project", { where: JSON.stringify({ status: "published" }), order: "-createdAt", limit: "500" });
  return Promise.all((result?.results ?? []).map(mapProject).map((project) => ensureProjectLocalized(project, locale)));
}

export async function getPost(slug: string, locale = "en") {
  const result = await firstResult(["Article", "BlogPost"], {
    where: JSON.stringify({ slug, status: "published" }),
    limit: "1",
  }, mapPost);
  return result.items[0] ? ensurePostLocalized(result.items[0], locale, true) : null;
}

export async function searchPosts(search: string, limit = 30, locale = "en") {
  const term = search.trim();
  if (!term) return { items: [] as Post[], total: 0 };
  const result = await firstResult(["Article", "BlogPost"], {
    where: JSON.stringify({ status: "published", $or: [
      { title: { $regex: term, $options: "i" } },
      { excerpt: { $regex: term, $options: "i" } },
      { category: { $regex: term, $options: "i" } },
    ] }),
    order: "-publishedAt",
    limit: String(limit),
    count: "1",
  }, mapPost);
  return { ...result, items: await Promise.all(result.items.map((post) => ensurePostLocalized(post, locale))) };
}

export async function getQuestions(limit = 20, locale = "en") {
  const result = await firstResult(["Question", "QA"], {
    // Questions use workflow statuses such as "open" and "answered", rather
    // than the blog's "published" status. Only hidden/inactive items are omitted.
    where: JSON.stringify({ isActive: { $ne: false } }),
    order: "-createdAt",
    limit: String(limit),
    count: "1",
  }, mapQuestion);
  return { ...result, items: await Promise.all(result.items.map((question) => ensureQuestionLocalized(question, locale))) };
}

export async function getQuestion(slug: string, locale = "en") {
  const result = await firstResult(["Question", "QA"], {
    where: JSON.stringify({ slug, isActive: { $ne: false } }),
    limit: "1",
  }, mapQuestion);
  return result.items[0] ? ensureQuestionLocalized(result.items[0], locale, true) : null;
}

export async function searchQuestions(search: string, limit = 30, locale = "en") {
  const term = search.trim();
  if (!term) return { items: [] as Question[], total: 0 };
  const result = await firstResult(["Question", "QA"], {
    where: JSON.stringify({ isActive: { $ne: false }, $or: [
      { title: { $regex: term, $options: "i" } },
      { question: { $regex: term, $options: "i" } },
      { content: { $regex: term, $options: "i" } },
      { answer: { $regex: term, $options: "i" } },
    ] }),
    order: "-createdAt",
    limit: String(limit),
    count: "1",
  }, mapQuestion);
  return { ...result, items: await Promise.all(result.items.map((question) => ensureQuestionLocalized(question, locale))) };
}

export async function getAnswers(questionId: string, locale = "en"): Promise<Answer[]> {
  const result = await query("Answer", {
    where: JSON.stringify({ isActive: { $ne: false }, question: { __type: "Pointer", className: "Question", objectId: questionId } }),
    order: "-voteScore,-createdAt",
    limit: "100",
    include: "author",
  });
  return Promise.all((result?.results ?? []).map(mapAnswer).map((answer) => ensureAnswerLocalized(answer, locale)));
}

function sanitizeComment(content: string) {
  const sanitized = sanitizeCommentHtml(content).replace(/\r\n/g, "\n");
  return commentText(sanitized).length > 6000 ? "" : sanitized;
}

function mapComment(record: Record<string, unknown>): Comment {
  const parent = record.parentComment;
  const parentId = parent && typeof parent === "object" && "objectId" in parent && typeof parent.objectId === "string"
    ? parent.objectId
    : text(record.parentId) || null;
  return {
    id: text(record.objectId),
    content: text(record.content) || text(record.comment) || text(record.body),
    author: typeof record.author === "object" && record.author ? text((record.author as Record<string, unknown>).username) || "Guest" : text(record.author) || "Guest",
    createdAt: date(record.createdAt, new Date().toISOString()),
    parentId,
    replies: [],
    translations: translationMap(record.translations),
  };
}

export async function getComments(postId: string, contentClass: "Article" | "BlogPost" | "Question" = "Article", locale = "en"): Promise<Comment[]> {
  const where = JSON.stringify({
    isActive: { $ne: false },
    $or: [
      { postId },
      { post: { __type: "Pointer", className: contentClass, objectId: postId } },
    ],
  });
  const flat: Comment[] = [];
  for (const className of ["Comment", "BlogComment"]) {
    const result = await query(className, { where, order: "-createdAt", limit: "200" });
    flat.push(...(result?.results ?? []).map(mapComment).map((comment) => ({ ...comment, parseClassName: className })));
  }
  const indexed = new Map(flat.map((comment) => [comment.id, comment]));
  const roots: Comment[] = [];
  for (const comment of flat) {
    const parent = comment.parentId ? indexed.get(comment.parentId) : undefined;
    if (parent) parent.replies.push(comment);
    else roots.push(comment);
  }
  const order = (a: Comment, b: Comment) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  roots.sort(order);
  roots.forEach((comment) => comment.replies.sort(order));
  return Promise.all(roots.map(async (comment) => {
    const localized = await ensureCommentLocalized(comment, locale);
    return { ...localized, replies: await Promise.all(comment.replies.map((reply) => ensureCommentLocalized(reply, locale))) };
  }));
}

export async function createComment(input: { postId: string; author: string; content: string; parentId?: string | null; contentClass?: "Article" | "BlogPost" | "Question" }) {
  if (!serverUrl || !appId || !javascriptKey) return false;
  const content = sanitizeComment(input.content);
  if (!content) return false;
  const payload: Record<string, unknown> = {
    postId: input.postId,
    author: input.author.trim() || "Guest",
    content,
    isActive: true,
    post: { __type: "Pointer", className: input.contentClass ?? "Article", objectId: input.postId },
  };
  if (input.parentId) {
    payload.parentId = input.parentId;
    payload.parentComment = { __type: "Pointer", className: "Comment", objectId: input.parentId };
  }
  for (const className of ["Comment", "BlogComment"]) {
    try {
      const response = await fetch(`${serverUrl}/classes/${className}`, { method: "POST", headers: headers(), body: JSON.stringify(payload), cache: "no-store" });
      if (response.ok) return true;
    } catch {
      // Try the compatible legacy/current collection.
    }
  }
  return false;
}
