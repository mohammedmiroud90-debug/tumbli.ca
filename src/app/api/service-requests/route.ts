import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { currentParseUser, hasParseMasterKey, parseFetch } from "@/lib/parse-service";

const cookieOptions = { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 };
const session = async () => (await cookies()).get("tumbli-session")?.value;
const clean = (value: FormDataEntryValue | null, limit: number) => typeof value === "string" ? value.trim().slice(0, limit) : "";
const trackingCode = () => `TMB-${randomBytes(9).toString("hex").toUpperCase()}`;

async function userForSubmission(form: FormData) {
  let token = await session(); let user = await currentParseUser(token);
  if (user && token) return { user, token };
  const email = clean(form.get("email"), 200).toLowerCase(); const password = clean(form.get("password"), 200);
  if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 8) throw new Error("Enter your email and a password of at least 8 characters to create your project account.");
  let response = await parseFetch("/users", { method: "POST", body: JSON.stringify({ username: email, email, password }) });
  let data = await response.json() as { sessionToken?: string; objectId?: string; username?: string; email?: string };
  if (!response.ok) { response = await parseFetch(`/login?username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`); data = await response.json() as typeof data; }
  if (!response.ok || !data.sessionToken) throw new Error("We could not create your account. If you already have one, check your password and try again.");
  token = data.sessionToken; user = { objectId: data.objectId ?? "", username: data.username ?? email, email: data.email ?? email };
  (await cookies()).set("tumbli-session", token, cookieOptions);
  return { user, token };
}

async function uploadMedia(file: File, token: string) {
  if (!file.size) return null;
  if (file.size > 10 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(file.type)) throw new Error("Media must be a JPG, PNG, WEBP, or PDF smaller than 10 MB.");
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-120) || "project-file";
  const response = await parseFetch(`/files/${encodeURIComponent(safeName)}`, { method: "POST", headers: { "Content-Type": file.type }, body: Buffer.from(await file.arrayBuffer()) }, token);
  if (!response.ok) throw new Error("We could not upload one of your files.");
  const data = await response.json() as { url?: string };
  return data.url ? { name: file.name, url: data.url, type: file.type } : null;
}

export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("tracking");
  if (code) { if (!hasParseMasterKey) return Response.json({ error: "Project tracking is being configured." }, { status: 503 }); const where = encodeURIComponent(JSON.stringify({ trackingCode: code.trim().toUpperCase() })); const response = await parseFetch(`/classes/ServiceRequest?where=${where}&limit=1`, {}, undefined, true); if (!response.ok) return Response.json({ error: "We could not find that tracking code." }, { status: 404 }); const data = await response.json() as { results?: Record<string, unknown>[] }; const item = data.results?.[0]; return item ? Response.json({ request: { trackingCode: item.trackingCode, businessName: item.businessName, package: item.package, status: item.status, createdAt: item.createdAt } }) : Response.json({ error: "We could not find that tracking code." }, { status: 404 }); }
  const token = await session(); const user = await currentParseUser(token);
  if (!user || !token) return Response.json({ error: "Please sign in to view your requests." }, { status: 401 });
  try { const where = encodeURIComponent(JSON.stringify({ owner: { __type: "Pointer", className: "_User", objectId: user.objectId } })); const response = await parseFetch(`/classes/ServiceRequest?where=${where}&order=-createdAt&limit=100`, {}, token); if (!response.ok) throw new Error(); const data = await response.json() as { results?: Record<string, unknown>[] }; return Response.json({ requests: (data.results ?? []).map((item) => ({ id: item.objectId, businessName: item.businessName, website: item.website, package: item.package, description: item.description, status: item.status, trackingCode: item.trackingCode, createdAt: item.createdAt })) }); } catch { return Response.json({ error: "We could not load your requests." }, { status: 502 }); }
}

export async function POST(request: Request) {
  try { const form = await request.formData(); const { user, token } = await userForSubmission(form); const businessName = clean(form.get("businessName"), 120); const website = clean(form.get("website"), 300); const packageName = clean(form.get("package"), 80); const description = clean(form.get("richDescription"), 4000) || clean(form.get("description"), 4000); if (!businessName || !packageName || !description) return Response.json({ error: "Please provide your business name, package and website requirements." }, { status: 400 }); const files = form.getAll("media").filter((value): value is File => value instanceof File).slice(0, 4); const media = (await Promise.all(files.map((file) => uploadMedia(file, token)))).filter(Boolean); const code = trackingCode(); const payload = { businessName, website, package: packageName, description, media, trackingCode: code, status: "submitted", owner: { __type: "Pointer", className: "_User", objectId: user.objectId }, ACL: { [user.objectId]: { read: true, write: false } } }; const response = await parseFetch("/classes/ServiceRequest", { method: "POST", body: JSON.stringify(payload) }, token); if (!response.ok) return Response.json({ error: "We could not save your request. Please try again." }, { status: 502 }); return Response.json({ ok: true, trackingCode: code }); } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "The request service is unavailable. Please try again." }, { status: 502 }); }
}
