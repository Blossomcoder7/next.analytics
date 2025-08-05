import CUSTOM_STATS from "@/_types/CUSTOM_STATS";
import GA4_STATS from "@/_types/GA4_STATS";
import React from "react";

const getGA4Data = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/ga4-stats`, {
    cache: "no-store",
    headers: {
      "x-stats-access-key": process.env.STATS_API_KEY!,
    },
  });
  // console.log({ res });
  const { stats } = await res.json();
  return stats;
};
const getCustomStatsData = async () => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/custom-stats`,
    {
      cache: "no-store",
      headers: {
        "x-stats-access-key": process.env.STATS_API_KEY!,
      },
    }
  );
  const { data } = await res.json();
  console.log({ data });
  return data;
};

const Page = async () => {
  const ga4Stats: GA4_STATS = await getGA4Data();
  const data: CUSTOM_STATS = await getCustomStatsData();
  console.log({ ga4Stats, data });

  return (
    <>
      <div className="w-full min-h-screen bg-[#1e1e1e] text-white py-12 px-4 md:px-16">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
            Welcome
          </h1>
          <p className="text-white/60 text-lg">Powered by NEXT.JS</p>
          <p className="text-white/20 text-xs mt-1">© 2025 Next.Analytics</p>
          <p className="text-white/20 text-[0.6rem] mt-1">All rights reserved.</p>
        </div>

        {/* ga4Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-sm md:text-base text-white space-y-2 shadow-xl">
            <h3 className="text-lg font-bold text-white/90 mb-2">
              GA4 Analytics
            </h3>
            <div className="grid grid-cols-1 gap-1 text-white/70">
              <span>Total Visits: {ga4Stats?.totalVisitsTillDate}</span>
              <span>Visits (24h): {ga4Stats?.visitsLast24Hours}</span>
              <span>Active Sessions: {ga4Stats?.activeSessions}</span>
              <span>
                Last Fetched:{" "}
                {new Date(ga4Stats?.lastFetched)?.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-sm md:text-base text-white space-y-2 shadow-xl">
            <h3 className="text-lg font-bold text-white/90 mb-2">
              Custom Analytics
            </h3>
            <div className="grid grid-cols-1 gap-1 text-white/70">
              <span>Total Visits : {data?.stats?.totalVisitorsCount}</span>
              <span>Visits Today : {data?.stats?.todaysVisitorsCount}</span>
              <span>Active now : {data?.stats?.activeUsers}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
