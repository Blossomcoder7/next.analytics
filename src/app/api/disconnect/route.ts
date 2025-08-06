// app/api/disconnect/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/_db/_utils/connection";
import { getClientSig } from "@/_utils/getClientSig";
import { handleCors } from "@/_middlewares/options";
import DailyModel from "@/_db/_models/daily";

export async function POST(req: NextRequest) {
  console.log(`User has been disconnected trying logout...`);
  const corsHeaders = await handleCors(req);
  if (corsHeaders instanceof NextResponse) return corsHeaders;
  try {
    await connectDb();
    const { sig, ip } = await getClientSig(req);
    const query = { $or: [{ ip }, { sig }] };
    const dis = await DailyModel.updateOne(query, {
      $set: { isActive: false },
    });
    console.log({ sig, dis });
    return NextResponse.json(
      { success: true },
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (err) {
    console.error("Disconnect error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to disconnect" },
      { status: 500, headers: corsHeaders }
    );
  }
}
export async function OPTIONS(req: NextRequest) {
  return (await handleCors(req)) as NextResponse;
}
