import { model, models, Schema } from "mongoose";
import lifeTimeCountModel from "./counters/lifeTimeCount";

const visitorSchema = new Schema(
  {
    firstVisit: { type: Date, default: undefined },
    sig: { type: String, default: "" },
    lifeTimeVisitingIndex: { type: String, default: undefined },
  },
  {
    timestamps: true,
  }
);

visitorSchema.pre("save", async function (next) {
  if (!this.lifeTimeVisitingIndex) {
    const counterDoc = await lifeTimeCountModel.findOneAndUpdate(
      {},
      { $inc: { count: 1 } },
      { new: true, upsert: true }
    );
    this.lifeTimeVisitingIndex = `#${counterDoc.count.toString()}`;
  }
  next();
});

const VisitorModel =
  models.visitor || model("visitor", visitorSchema, "visitors");
export default VisitorModel;
