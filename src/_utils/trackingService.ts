import DailyModel from "@/_db/_models/daily";
import VisitorModel from "@/_db/_models/visitor";

interface PropsType {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: Record<string, any>;
  now: Date;
  sig: string;
  ip: string;
}
export async function dailyConnection({ query, now, sig, ip }: PropsType) {
  try {
    const dailyResult = await DailyModel.collection.findOneAndUpdate(
      query,
      {
        $set: {
          isActive: true,
          lastPing: now,
        },
        $setOnInsert: {
          sig,
          ip,
          firstVisit: now,
        },
      },
      { upsert: true, returnDocument: "after", includeResultMetadata: true }
    );
    console.log({
      "raw result for daily tracking ": JSON.stringify(dailyResult),
    });
    const wasInsertedNow = dailyResult?.lastErrorObject?.upserted;
    let daily = dailyResult?.value;
    if (wasInsertedNow && daily) {
      daily = await DailyModel.findOne(query);
      await daily?.save();
      daily = await DailyModel.findOne(query);
    }
    return daily;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function lifeTimeVisitTracking({
  query,
  now,
  sig,
  ip,
}: PropsType) {
  try {
    const lifetimeResult = await VisitorModel.collection.findOneAndUpdate(
      query,
      {
        $setOnInsert: {
          sig,
          ip,
          firstVisit: now,
        },
      },
      { upsert: true, returnDocument: "after", includeResultMetadata: true }
    );
    console.log({
      "raw result for lifetime visit tracking ": JSON.stringify(lifetimeResult),
    });
    const wasInserted = lifetimeResult?.lastErrorObject?.upserted;
    let lifetime = lifetimeResult?.value;
    if (wasInserted && lifetime) {
      lifetime = await VisitorModel.findOne(query);
      await lifetime?.save();
      lifetime = await VisitorModel.findOne(query);
    }
    return lifetime;
  } catch (error) {
    console.log(error);
    return null;
  }
}
