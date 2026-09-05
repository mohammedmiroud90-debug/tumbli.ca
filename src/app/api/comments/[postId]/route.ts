import { createComment, getComments, isBackendConfigured } from "@/lib/parse";

type Context = { params: Promise<{ postId: string }> };

function contentClass(request: Request): "Article" | "Question" { return new URL(request.url).searchParams.get("type") === "question" ? "Question" : "Article"; }

export async function GET(request: Request, { params }: Context) {
  const { postId } = await params;
  if (!postId) return Response.json({ error: "Missing post id" }, { status: 400 });
  if (!isBackendConfigured) return Response.json({ error: "Backend is not configured" }, { status: 503 });

  const locale = new URL(request.url).searchParams.get("locale") || "en";
  const comments = await getComments(postId, contentClass(request), locale);
  const count = comments.reduce((total, comment) => total + 1 + comment.replies.length, 0);
  return Response.json({ comments, count });
}

export async function POST(request: Request, { params }: Context) {
  const { postId } = await params;
  if (!postId) return Response.json({ error: "Missing post id" }, { status: 400 });
  if (!isBackendConfigured) return Response.json({ error: "Backend is not configured" }, { status: 503 });

  try {
    const body = await request.json() as { author?: unknown; email?: unknown; content?: unknown; parentId?: unknown; parentClass?: unknown };
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!/^\S+@\S+\.\S+$/.test(email)) return Response.json({ error: "Enter a valid email address to publish your comment." }, { status: 400 });
    const result = await createComment({
      postId,
      author: typeof body.author === "string" ? body.author : "Guest",
      email,
      content: typeof body.content === "string" ? body.content : "",
      parentId: typeof body.parentId === "string" ? body.parentId : null,
      parentClass: body.parentClass === "BlogComment" ? "BlogComment" : body.parentClass === "Comment" ? "Comment" : undefined,
      contentClass: contentClass(request),
    });
    if (!result.created) return Response.json({ error: result.error || "Your comment could not be posted." }, { status: 400 });
    return Response.json({ created: true }, { status: 201 });
  } catch {
    return Response.json({ error: "Invalid comment request" }, { status: 400 });
  }
}
