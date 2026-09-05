const serverUrl = (process.env.PARSE_SERVER_URL || "https://backendweb.eollinea.com/parse").replace(/\/$/, "");
const appId = process.env.PARSE_APP_ID || "f86207c4cf7bdc08ff889e9d8519bbf3";
const javascriptKey = process.env.PARSE_JAVASCRIPT_KEY || "5828916ef66b1aba0ab4efdb2724c00f27a6560ba126509ca1bbccff3a13e56c";

export type ParseUser = { objectId: string; username: string; email?: string; sessionToken?: string };

export function parseHeaders(sessionToken?: string, useMasterKey = false) {
  return {
    "X-Parse-Application-Id": appId,
    "X-Parse-Javascript-Key": javascriptKey,
    ...(sessionToken ? { "X-Parse-Session-Token": sessionToken } : {}),
    ...(useMasterKey && process.env.PARSE_MASTER_KEY ? { "X-Parse-Master-Key": process.env.PARSE_MASTER_KEY } : {}),
    "Content-Type": "application/json",
  };
}

export async function parseFetch(path: string, init: RequestInit = {}, sessionToken?: string, useMasterKey = false) {
  return fetch(`${serverUrl}${path}`, { ...init, headers: { ...parseHeaders(sessionToken, useMasterKey), ...init.headers }, cache: "no-store", signal: AbortSignal.timeout(10000) });
}

export async function currentParseUser(sessionToken?: string): Promise<ParseUser | null> {
  if (!sessionToken) return null;
  try {
    const response = await parseFetch("/users/me", {}, sessionToken);
    if (!response.ok) return null;
    return await response.json() as ParseUser;
  } catch { return null; }
}

export function isServiceAdmin(user: ParseUser | null) {
  const adminEmail = process.env.SERVICE_ADMIN_EMAIL?.trim().toLowerCase();
  return Boolean(adminEmail && user?.email?.toLowerCase() === adminEmail);
}

export const hasParseMasterKey = Boolean(process.env.PARSE_MASTER_KEY);
