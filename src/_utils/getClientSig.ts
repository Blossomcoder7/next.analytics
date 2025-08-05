import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { NextRequest } from "next/server";

export async function getClientSig(
  req: NextRequest
): Promise<{ sig: string; setCookie: boolean }> {
  const cookieStore = await cookies();
  let sig = cookieStore.get("visitor_id")?.value;
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "0.0.0.0";
  console.log({
    sig,
    ip,
  });
  if (!sig) {
    sig = `${ip}_${randomUUID()}`;
    cookieStore.set("visitor_id", sig, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365 * 10 * 10 * 10,
      sameSite: "strict",
    });
    return { sig, setCookie: true };
  }

  return { sig, setCookie: false };
}
