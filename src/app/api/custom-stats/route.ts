import getCustomStats from "@/_functions/getCustomStats";
import { handleCors } from "@/_middlewares/options";
import { getClientSig } from "@/_utils/getClientSig";
import { NextRequest, NextResponse } from "next/server";

/**
 * Handles a GET request to fetch custom statistics.
 *
 * This function checks for CORS headers and validates the incoming API key
 * from the request headers. If the key is valid, it fetches the client
 * signature and retrieves custom statistics associated with the signature.
 * The response includes the custom statistics data or an error message
 * if the operation fails.
 *
 * @param {NextRequest} req - The incoming request object.
 * @returns {Promise<NextResponse>} The response containing the custom
 * statistics or an error message.
 */

export async function GET(req: NextRequest) {
  const corsHeaders = await handleCors(req);
  if (corsHeaders instanceof NextResponse) return corsHeaders;

  try {
    const incomingKey = req.headers.get("x-stats-access-key");
    const expectedKey = process.env.STATS_API_KEY!;
    if (incomingKey !== expectedKey) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      );
    }
    const { sig, ip } = await getClientSig(req);
    const resObj = await getCustomStats(sig, ip);
    if (resObj) {
      return NextResponse.json(
        {
          success: true,
          message: "Fetched Custom stats successfully",
          data: resObj,
        },
        {
          status: 200,
          headers: corsHeaders,
        }
      );
    }

    return NextResponse.json(
      { success: false, error: "No data found" },
      { status: 404, headers: corsHeaders }
    );
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
