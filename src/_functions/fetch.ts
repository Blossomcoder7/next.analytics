import ga4Client from "@/_lib/ga4Client";
const propertyId = process.env.GA_PROPERTY_ID!;

/**
 * Fetches various analytics from Google Analytics 4.
 *
 * @returns An object with the following properties:
 * - totalVisitsTillDate: The total number of users since the time of installation.
 * - visitsLast24Hours: The total number of users in the last 24 hours.
 * - visitsLast5Mins: The total number of users in the last 5 minutes.
 * - activeSessions: The number of active sessions.
 */

export async function fetchAnalytics() {
  // total users till date from the time of installation
  const [totalUsersReport] = await ga4Client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: "2020-01-01", endDate: "today" }],
    metrics: [{ name: "activeUsers" }],
  });
  const totalVisitsTillDate =
    totalUsersReport?.rows?.[0]?.metricValues?.[0]?.value || "0";
  // total users in last 24hours
  const [last24HoursReport] = await ga4Client.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: "1daysAgo", endDate: "today" }],
    metrics: [{ name: "activeUsers" }],
  });
  const visitsLast24Hours =
    last24HoursReport?.rows?.[0]?.metricValues?.[0]?.value || "0";
  // total active users in lsat 5 minutes
  const [last5MinutesReport] = await ga4Client.runRealtimeReport({
    property: `properties/${propertyId}`,
    dimensions: [{ name: "minutesAgo" }],
    metrics: [{ name: "activeUsers" }],
  });
  const visitsLast5Mins =
    last5MinutesReport.rows?.[0]?.metricValues?.[0]?.value || "0";
  // live active users
  const [realtimeReport] = await ga4Client.runRealtimeReport({
    property: `properties/${propertyId}`,
    dimensions: [{ name: "country" }, { name: "deviceCategory" }],
    metrics: [{ name: "activeUsers" }],
  });
  const activeSessions =
    realtimeReport?.rows?.[0]?.metricValues?.[0]?.value || "0";
  return {
    totalVisitsTillDate,
    visitsLast24Hours,
    visitsLast5Mins,
    activeSessions,
    response: {
      totalUsersReport,
      last24HoursReport,
      last5MinutesReport,
      realtimeReport,
    },
  };
}
