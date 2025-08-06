// app/api/connect/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/_db/_utils/connection";
import VisitorModel from "@/_db/_models/visitor";
import DailyModel from "@/_db/_models/daily";
import { getClientSig } from "@/_utils/getClientSig";
import { handleCors } from "@/_middlewares/options";
import DailyCountModel from "@/_db/_models/counters/dailyCount";
import lifeTimeCountModel from "@/_db/_models/counters/lifeTimeCount";

/**
 * Handles a POST request to connect the user.
 *
 * This function checks for CORS headers, validates the incoming API key
 * from the request headers, and fetches the client signature from the
 * request headers or cookies. If the key is valid, it creates or updates
 * the user's daily and lifetime visits records in the DB. It then returns
 * the user's visit numbers and signature in the response.
 *
 * @param {NextRequest} req - The incoming request object.
 *
 * @returns {Promise<NextResponse>} The response containing the user's visit
 * numbers and signature, or an error message if the operation fails.
 */
export async function POST(req: NextRequest) {
  const corsHeaders = await handleCors(req);
  if (corsHeaders instanceof NextResponse) return corsHeaders;
  try {
    await connectDb();
    const { sig, ip } = await getClientSig(req);
    let isNew = true;
    const now = new Date();
    const todayStart = new Date();
    const query = {
      $or: [{ sig }, ...(ip !== "0.0.0.0" ? [{ ip }] : [])],
    };
    todayStart.setUTCHours(0, 0, 0, 0);
    let daily = await DailyModel.findOne(query);
    if (daily) {
      daily.isActive = true;
      daily.lastPing = now;
      await daily.save();
    } else {
      daily = new DailyModel({
        sig,
        ip,
        firstVisit: now,
        isActive: true,
        lastPing: now,
      });
      await daily.save();
    }
    let lifetime = await VisitorModel.findOne(query);
    if (lifetime) {
      lifetime.isActive = true;
      isNew = false;
      await lifetime.save();
    } else {
      lifetime = new VisitorModel({
        sig,
        ip,
        firstVisit: now,
        isActive: true,
      });
      isNew=true
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
    if (isNew) {
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
