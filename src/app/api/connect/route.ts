// app/api/connect/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/_db/_utils/connection";
import VisitorModel from "@/_db/_models/visitor";
import DailyModel from "@/_db/_models/daily";
import { getClientSig } from "@/_utils/getClientSig";
import { handleCors } from "@/_middlewares/options";
import DailyCountModel from "@/_db/_models/counters/dailyCount";
import lifeTimeCountModel from "@/_db/_models/counters/lifeTimeCount";

export async function POST(req: NextRequest) {
  const corsHeaders = await handleCors(req);
  if (corsHeaders instanceof NextResponse) return corsHeaders;
  try {
    await connectDb();
    const { sig, setCookie } = await getClientSig(req);
    const now = new Date();
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    let daily = await DailyModel.findOne({ sig });
    if (daily) {
      daily.isActive = true;
      daily.lastPing = now;
      await daily.save();
    } else {
      daily = new DailyModel({
        sig,
        firstVisit: now,
        isActive: true,
        lastPing: now,
      });
      await daily.save();
    }
    let lifetime = await VisitorModel.findOne({ sig });
    if (lifetime) {
      lifetime.isActive = true;
      await lifetime.save();
    } else {
      lifetime = new VisitorModel({
        sig,
        firstVisit: now,
        isActive: true,
      });
      await lifetime.save();
    }
    console.log({ lifetime, daily });
    const dayStr = todayStart.toISOString().split("T")[0];

    const todaysCount = await DailyCountModel.find({ day: dayStr });
    const totalCount = await lifeTimeCountModel.findOne({ _id: "lifetime" });

    const lifetimeCount = await VisitorModel.countDocuments({
      createdAt: { $lte: lifetime.createdAt },
    });
    const dailyCount = await DailyModel.countDocuments({
      createdAt: { $gte: todayStart, $lte: daily.createdAt },
    });
    console.log({
      lifetimeCount,
      dailyCount,
      sig,
      todaysCount,
      totalCount,
    });
    const res = NextResponse.json(
      {
        success: true,
        sig,
        lifetimeVisitNumber: lifetime?.lifeTimeVisitingIndex,
        todayVisitNumber: daily?.visitingIndex,
      },
      {
        status: 200,
        headers: corsHeaders,
      }
    );
    if (setCookie) {
      res.cookies.set("visitor_id", sig, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365 * 10 * 10 * 10,
        sameSite: "strict",
      });
    }
    return res;
  } catch (err) {
    console.error("Connect error:", err);
    return NextResponse.json(
      { success: false, error: "Internal error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
export async function OPTIONS(req: NextRequest) {
  return (await handleCors(req)) as NextResponse;
}
