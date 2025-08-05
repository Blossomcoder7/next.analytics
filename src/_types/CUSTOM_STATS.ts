export default interface CUSTOM_STATS {
  fullStats: {
    todaysCountDoc: {
      day: string;
      dated: string;
      count: string;
      createdAt: string;
      updatedAt: string;
    };
    lifetimeCountDoc: {
      _id: string;
      count: string;
      createdAt: string;
      updatedAt: string;
    };
    dailyInfo: {
      firstVisit: string;
      isActive: string;
      sig: string;
      lastPing: string;
      visitingIndex: string;
      createdAt: string;
      updatedAt: string;
    };
    lifetimeInfo: {
      firstVisit: string;
      sig: string;
      lifeTimeVisitingIndex: string;
      createdAt: string;
      updatedAt: string;
    };
  };
  stats: {
    todaysVisitorsCount: string;
    totalVisitorsCount: string;
    usersTodaysVisitIndex: string;
    userLifeTimeVisitIndex: string;
    activeUsers: string;
  };
}
