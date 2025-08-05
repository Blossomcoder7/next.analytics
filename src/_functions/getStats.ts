import ReportModel from "@/_db/_models/report";
import connectDb from "@/_db/_utils/connection";
import { fetchAnalytics } from "./fetch";

const CACHE_DURATION = Number(process.env.GA4_CACHE_SECONDS || 60) * 1000;

export default async function getStats() {
  try {
    await connectDb();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    // Fetch cached or fresh GA4 stats
    const existing = await ReportModel.findOne({ _id: "singleton" });
    const now = Date.now();
    const lastFetched = new Date(existing?.lastFetched || 0).getTime();
    const isStale = now - lastFetched > CACHE_DURATION;

    if (!existing || isStale) {
      const fresh = await fetchAnalytics();
      const updated = await ReportModel.findOneAndUpdate(
        { _id: "singleton" },
        {
          $set: {
            totalVisitsTillDate: fresh.totalVisitsTillDate,
            visitsLast24Hours: fresh.visitsLast24Hours,
            visitsLast5Mins: fresh.visitsLast5Mins,
            activeSessions: fresh.activeSessions,
            lastFetched: new Date(),
            misc: JSON.stringify(fresh?.response || {}),
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      return {
        success: true,
        data: {
          ...updated.toObject(),
        },
      };
    }
    return {
      success: true,
      data: {
        ...existing.toObject(),
      },
    };
  } catch (error) {
    console.log("getStats error:", error);
    return { success: false, data: null };
  }
}
