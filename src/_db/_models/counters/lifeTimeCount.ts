import { model, models, Schema } from "mongoose";

const lifeTimeCountSchema = new Schema(
  {
    _id: { type: String, default: "lifetime" },
    count: { type: Number, default: 0 },
  },
  { timestamps: true, _id: false }
);

const lifeTimeCountModel =
  models.lifeTimeCount ||
  model("lifeTimeCount", lifeTimeCountSchema, "lifeTimeCounts");

export default lifeTimeCountModel;
