export default interface Report_Type {
  totalVisitsTillDate: string;
  visitsLast24Hours: string;
  visitsLast5Mins: string;
  activeSession: string;
  lastFetched: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}
