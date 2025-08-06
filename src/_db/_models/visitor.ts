import { model, models, Schema } from "mongoose";
import lifeTimeCountModel from "./counters/lifeTimeCount";

const visitorSchema = new Schema(
  {
    firstVisit: { type: Date, default: undefined },
    sig: { type: String, default: "" },
    ip: { type: String, default: "" },
    lifeTimeVisitingIndex: { type: String, default: undefined },
  },
  {
    timestamps: true,
  }
);

visitorSchema.pre("save", async function (next) {
  if (!this.lifeTimeVisitingIndex) {
    await new Promise((res) => setTimeout(res, Math.random() * 100 + 50));
    const actualDocCount = await VisitorModel.countDocuments();
    const counterDoc = await models?.visitor?.findOne({});
    const currentCount = counterDoc ? counterDoc.count : 0;
    if (actualDocCount > currentCount) {
      const updatedCounter = await models?.visitor?.findOneAndUpdate(
        {},
        { $inc: { count: 1 } },
        { new: true, upsert: true }
      );
      this.lifeTimeVisitingIndex = `#${updatedCounter.count.toString()}`;
    } else {
      this.lifeTimeVisitingIndex = `#${currentCount}`;
    }
  }
  next();
});

const VisitorModel =
  models.visitor || model("visitor", visitorSchema, "visitors");
export default VisitorModel;
