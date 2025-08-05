import connectDb from "@/_db/_utils/connection";
import DailyModel from "@/_db/_models/daily";
import { NextResponse } from "next/server";

async function expireInactiveUsers() {
  await connectDb();
  const INACTIVE_AFTER_MINUTES = 1;
  const cutoff = new Date(Date.now() - INACTIVE_AFTER_MINUTES * 60 * 1000);
  const result = await DailyModel.updateMany(
    {
      lastPing: { $lt: cutoff },
      isActive: true,
    },
    {
      $set: { isActive: false },
    }
  );
  console.log(`Marked ${result.modifiedCount} daily users as inactive.`);
}

export async function GET() {
  await expireInactiveUsers();
  return NextResponse.json(
    { success: true, message: "Updated" },
    { status: 200 }
  );
}
