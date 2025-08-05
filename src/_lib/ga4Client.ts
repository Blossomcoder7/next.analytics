import { BetaAnalyticsDataClient } from "@google-analytics/data";

const credentials = process.env.GA_SERVICE_ACCOUNT_KEY_JSON!;
const ga4Client = new BetaAnalyticsDataClient({
  credentials: JSON.parse(credentials),
});

export default ga4Client;
