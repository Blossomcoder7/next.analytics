import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { NextRequest } from "next/server";
import parseBody from "./parseBody";

export async function getClientSig(
  req: NextRequest
): Promise<{ sig: string; ip: string; isNew: boolean }> {
  const cookieStore = await cookies();
  const p = await parseBody(req);
  const parsedBody = p ? JSON.parse(p) : {};
  const cookieSig = cookieStore.get("visitor_id")?.value;
  const localSig = parsedBody?.sig;
  let sig = cookieSig || localSig;
  const isNew = !sig;
  const ip =
    parsedBody?.ip ||
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    "0.0.0.0";
  if (!sig) {
    sig = `${ip}_${randomUUID()}`;
  }
  return { sig, ip, isNew };
}
