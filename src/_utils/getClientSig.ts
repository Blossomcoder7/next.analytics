import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import parseBody from "./parseBody";

export async function getClientSig(
  req: NextRequest
): Promise<{ sig: string; ip: string }> {
  const cookieStore = await cookies();
  let sig = cookieStore.get("visitor_id")?.value;
  const parsedBody = await parseBody(req);
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    parsedBody?.ip ||
    "0.0.0.0";
  console.log({
    sig,
    ip,
    cookieStore,
    allCookies: cookieStore.getAll(),
    parsedBody,
  });
  if (!sig) {
    sig = `${ip}_${randomUUID()}`;
    const res = NextResponse.next();
    res.cookies.set("visitor_id", sig, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365 * 10,
      sameSite: "strict",
    });
    return { sig, ip };
  }
  return { sig, ip };
}
