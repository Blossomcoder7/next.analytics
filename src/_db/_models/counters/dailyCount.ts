import { model, models, Schema } from "mongoose";

const DailyCountSchema = new Schema(
  {
    day: { type: String, default: "" },
    dated: { type: Date, default: new Date() },
    count: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const DailyCountModel =
  models.dailyCount || model("dailyCount", DailyCountSchema, "dailyCounts");

export default DailyCountModel;
