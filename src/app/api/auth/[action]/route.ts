import { cookies } from "next/headers";
import { currentParseUser, parseFetch } from "@/lib/parse-service";

const cookieName = "tumbli-session";
const cookieOptions = { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 };

function message(status: number) { return status === 101 ? "Incorrect email or password." : "We could not complete that request."; }

export async function GET(_request: Request, { params }: { params: Promise<{ action: string }> }) {
  const { action } = await params;
  if (action !== "me") return Response.json({ error: "Not found" }, { status: 404 });
  const user = await currentParseUser((await cookies()).get(cookieName)?.value);
  return Response.json({ user: user ? { id: user.objectId, username: user.username, email: user.email } : null });
}

export async function POST(request: Request, { params }: { params: Promise<{ action: string }> }) {
  const { action } = await params;
  const store = await cookies();
  if (action === "logout") { store.delete(cookieName); return Response.json({ ok: true }); }
  const body = await request.json().catch(() => ({})) as { email?: string; password?: string };
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!email || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8) return Response.json({ error: "Enter a valid email and a password of at least 8 characters." }, { status: 400 });
  try {
    const response = action === "register"
      ? await parseFetch("/users", { method: "POST", body: JSON.stringify({ username: email, email, password }) })
      : action === "login"
        ? await parseFetch(`/login?username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`)
        : null;
    if (!response) return Response.json({ error: "Not found" }, { status: 404 });
    const data = await response.json() as { objectId?: string; username?: string; email?: string; sessionToken?: string; code?: number };
    if (!response.ok || !data.sessionToken) return Response.json({ error: message(data.code ?? response.status) }, { status: response.status >= 500 ? 502 : 400 });
    store.set(cookieName, data.sessionToken, cookieOptions);
    return Response.json({ user: { id: data.objectId, username: data.username, email: data.email ?? email } });
  } catch { return Response.json({ error: "The authentication service is unavailable. Please try again." }, { status: 502 }); }
}
