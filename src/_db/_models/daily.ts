import { model, models, Schema } from "mongoose";
import DailyCountModel from "./counters/dailyCount";

const dailySchema = new Schema(
  {
    firstVisit: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    sig: { type: String, default: "" },
    ip: { type: String, default: "" },
    lastPing: { type: Date, default: Date.now },
    visitingIndex: { type: String, default: undefined },
  },
  {
    timestamps: true,
  }
);

dailySchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 }); // 24 hours TTL
dailySchema.pre("save", async function (next) {
  if (!this.visitingIndex) {
    await new Promise((res) => setTimeout(res, Math.random() * 100 + 50));
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const dayStr = today.toISOString().split("T")[0];
    const actualDocCount = await models?.daily?.countDocuments({
      createdAt: { $gte: today },
    });
    const counterDoc = await DailyCountModel.findOne({ day: dayStr });
    const currentCount = counterDoc ? counterDoc.count : 0;
    if (actualDocCount > currentCount || !counterDoc) {
      const updatedCounter = await DailyCountModel.findOneAndUpdate(
        { day: dayStr },
        { $inc: { count: 1 }, $setOnInsert: { dated: today } },
        { new: true, upsert: true }
      );
      this.visitingIndex = `#${updatedCounter.count.toString()}`;
    } else {
      this.visitingIndex = `#${currentCount}`;
    }
  }
  next();
});

export const DailyModel =
  models.daily || model("daily", dailySchema, "dailies");

export default DailyModel;
