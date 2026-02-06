import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Incident from "@/lib/models/incident";

export async function GET() {
  try {
    await connectToDatabase();

    // Look for CRITICAL reports from the last 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    const urgentReport = await Incident.findOne({
      severity: "CRITICAL",
      timestamp: { $gte: tenMinutesAgo }
    }).sort({ timestamp: -1 });

    return NextResponse.json({ alert: urgentReport });
  } catch (error) {
    return NextResponse.json({ error: "ALERT_POLL_FAILED" }, { status: 500 });
  }
}