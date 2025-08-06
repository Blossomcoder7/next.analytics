// app/api/connect/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/_db/_utils/connection";
import VisitorModel from "@/_db/_models/visitor";
import DailyModel from "@/_db/_models/daily";
import { getClientSig } from "@/_utils/getClientSig";
import { handleCors } from "@/_middlewares/options";

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
    todayStart.setUTCHours(0, 0, 0, 0);
    const query = {
      $and: [{ sig }, { ip }],
    };
    const daily = await DailyModel.findOneAndUpdate(
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
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    if (!daily.visitingIndex) {
      await daily.save();
    }
    const lifetime = await VisitorModel.findOneAndUpdate(
      query,
      {
        $set: {
          isActive: true,
        },
        $setOnInsert: {
          sig,
          ip,
          firstVisit: now,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    if (!lifetime.lifeTimeVisitingIndex) {
      await lifetime.save();
    } else {
      isNew = false;
    }
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
        sameSite: "none",
        secure: true,
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
