import getStats from "@/_functions/getStats";
import { handleCors } from "@/_middlewares/options";
import cron from "@/_services/cron";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const corsHeaders = await handleCors(req);
  if (corsHeaders instanceof NextResponse) return corsHeaders;
  try {
    cron();
    const incomingKey = req.headers.get("x-stats-access-key");
    const expectedKey = process.env.STATS_API_KEY!;

    console.log({
      incomingKey,
      expectedKey,
    });
    if (incomingKey !== expectedKey) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      );
    }
    const result = await getStats();
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch stats" },
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }
    // console.log({ result });
    const data = {
      totalVisitsTillDate: result?.data?.totalVisitsTillDate ?? 0,
      visitsLast24Hours: result?.data?.visitsLast24Hours ?? 0,
      visitsLast5Mins: result?.data?.visitsLast5Mins ?? 0,
      activeSessions: result?.data?.activeSessions ?? 0,
      lastFetched: result?.data?.lastFetched ?? 0,
      createdAt: result?.data?.createdAt ?? 0,
      updatedAt: result?.data?.updatedAt ?? 0,
    };
    // console.log({ data });
    return NextResponse.json(
      { success: true, stats: data },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("API error in /api/stats:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

export async function OPTIONS(req: NextRequest) {
  return (await handleCors(req)) as NextResponse;
}
