import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Incident from "@/lib/models/incident";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    
    // DATA NORMALIZATION: Strip spaces, dashes, and special characters
    // Example: "080-123 4567" becomes "0801234567"
    const rawIdentifier = body.identifier || "";
    const cleanIdentifier = rawIdentifier.replace(/\D/g, "");

    if (!cleanIdentifier || !body.description) {
      return NextResponse.json({ error: "VALIDATION_FAILED: MISSING_ID_OR_DESC" }, { status: 400 });
    }

    const newIncident = await Incident.create({
      type: body.type,
      identifier: cleanIdentifier, // Save the cleaned version
      description: body.description,
      severity: body.severity || "LOW",
      locationName: body.locationName || "UNKNOWN_SECTOR",
      timestamp: new Date(),
    });

    return NextResponse.json({ 
      success: true, 
      reportId: newIncident._id,
      normalizedId: cleanIdentifier 
    }, { status: 201 });

  } catch (error: any) {
    console.error("UPLINK_CRASH:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}