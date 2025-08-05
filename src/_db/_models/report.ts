import { model, models, Schema } from "mongoose";

const ReportSchema = new Schema(
  {
    _id: { type: String, required: true },
    totalVisitsTillDate: { type: String, default: "" },
    visitsLast24Hours: { type: String, default: "" },
    visitsLast5Mins: { type: String, default: "" },
    activeSessions: { type: String, default: "" },
    lastFetched: { type: Date, default: undefined },
    misc: { type: String, default: "" },
  },
  {
    timestamps: true,
    _id: false,
  }
);

const ReportModel = models.report || model("report", ReportSchema, "reports");
export default ReportModel;
