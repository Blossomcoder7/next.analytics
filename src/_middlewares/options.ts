// lib/cors.ts
import { NextRequest, NextResponse } from "next/server";

export async function handleCors(req: NextRequest) {
  const origin = req.headers.get("origin");
  const allowed = process.env.ALLOWED_ORIGINS?.split(",") || [];
  const isAllowed =
    allowed.includes("*") || (origin && allowed.includes(origin));

  const headers = {
    "Access-Control-Allow-Origin": isAllowed ? origin! : "null",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-stats-access-key",
    "Access-Control-Allow-Credentials": "true",
  };
  console.log({
    headers,
    origin,
    allowed,
    isAllowed,
  });
  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers,
    });
  }

  return headers;
}
