import DailyCountModel from "@/_db/_models/counters/dailyCount";
import lifeTimeCountModel from "@/_db/_models/counters/lifeTimeCount";
import DailyModel from "@/_db/_models/daily";
import VisitorModel from "@/_db/_models/visitor";

/**
 * Fetches custom statistics for a given user signature.
 *
 * This function retrieves various statistics related to daily and lifetime
 * visits, including the count of today's visitors, total visitors, and visit
 * indices for both daily and lifetime visits. It also counts the number of
 * currently active users.
 *
 * @param {string} sig - The signature of the user for whom statistics are
 * being fetched.
 *
 * @returns {Promise<Object>} An object containing full statistics and
 * summarized stats, including today's visitor count, total visitor count,
 * user's visit indices, and active user count.
 *
 * @throws {Error} Throws an error if the statistics fetching fails.
 */

export default async function getCustomStats(sig: string, ip?: string) {
  try {
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    const dayStr = todayStart.toISOString().split("T")[0];
    const queryOr = ip
      ? { $or: [{ sig }, { ip }] }
      : { sig }; 
    const [
      todaysCountDoc,
      lifetimeCountDoc,
      dailyInfo,
      lifetimeInfo,
      activeUserCount,
    ] = await Promise.all([
      DailyCountModel.findOne({ day: dayStr }),
      lifeTimeCountModel.findOne({ _id: "lifetime" }),
      DailyModel.findOne(queryOr),
      VisitorModel.findOne(queryOr),
      DailyModel.countDocuments({ isActive: true }),
    ]);

    const todaysCount = todaysCountDoc?.count ?? 0;
    const totalCount = lifetimeCountDoc?.count ?? 0;
    const dailyVisitIndex = dailyInfo?.visitingIndex ?? "";
    const lifetimeVisitIndex = lifetimeInfo?.lifeTimeVisitingIndex ?? "";

    return {
      fullStats: {
        todaysCountDoc,
        lifetimeCountDoc,
        dailyInfo,
        lifetimeInfo,
      },
      stats: {
        todaysVisitorsCount: todaysCount,
        totalVisitorsCount: totalCount,
        usersTodaysVisitIndex: dailyVisitIndex,
        userLifeTimeVisitIndex: lifetimeVisitIndex,
        activeUsers: activeUserCount,
      },
    };
  } catch (error) {
    console.error("getCustomStats error:", error);
    throw new Error("Failed to fetch custom stats");
  }
}

