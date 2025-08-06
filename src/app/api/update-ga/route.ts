import ReportModel from "@/_db/_models/report";
import connectDb from "@/_db/_utils/connection";
import { fetchAnalytics } from "@/_functions/fetch";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    if (
      req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json(
        { success: false, ok: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    await connectDb();
    const stats = await fetchAnalytics();
    await ReportModel.updateOne(
      { _id: "singleton" },
      {
        $set: {
          totalVisitsTillDate: stats.totalVisitsTillDate,
          visitsLast24Hours: stats.visitsLast24Hours,
          visitsLast5Mins: stats.visitsLast5Mins,
          activeSessions: stats.activeSessions,
          lastFetched: new Date(),
        },
      },
      { upsert: true }
    );
    console.log(`Updated The cache at ${new Date().toLocaleDateString()}`);
    return NextResponse.json(
      { success: true, ok: true, message: "Updated Successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("GA4 Cron Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to update GA4 stats" },
      { status: 500 }
    );
  }
}
