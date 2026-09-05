import { cookies } from "next/headers";
import { currentParseUser, hasParseMasterKey, isServiceAdmin, parseFetch } from "@/lib/parse-service";

async function admin() { const token = (await cookies()).get("tumbli-session")?.value; return currentParseUser(token); }

export async function GET() {
  const user = await admin();
  if (!isServiceAdmin(user)) return Response.json({ error: "Administrator access is required." }, { status: 403 });
  if (!hasParseMasterKey) return Response.json({ error: "Set PARSE_MASTER_KEY to enable request review." }, { status: 503 });
  const response = await parseFetch("/classes/ServiceRequest?order=-createdAt&limit=200&include=owner", {}, undefined, true);
  if (!response.ok) return Response.json({ error: "We could not load requests." }, { status: 502 });
  const data = await response.json() as { results?: Record<string, unknown>[] };
  return Response.json({ requests: data.results ?? [] });
}

export async function PATCH(request: Request) {
  const user = await admin();
  if (!isServiceAdmin(user) || !hasParseMasterKey) return Response.json({ error: "Administrator access is required." }, { status: 403 });
  const body = await request.json().catch(() => ({})) as { id?: string; status?: string };
  if (!body.id || !["submitted", "in-review", "validated", "declined"].includes(body.status ?? "")) return Response.json({ error: "Invalid request update." }, { status: 400 });
  const response = await parseFetch(`/classes/ServiceRequest/${encodeURIComponent(body.id)}`, { method: "PUT", body: JSON.stringify({ status: body.status }) }, undefined, true);
  return response.ok ? Response.json({ ok: true }) : Response.json({ error: "We could not update this request." }, { status: 502 });
}
