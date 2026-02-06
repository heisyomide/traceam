import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Incident from "@/lib/models/incident";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // 1. Define params as a Promise
) {
  try {
    await connectToDatabase();
    
    // 2. Await the params to unwrap them
    const resolvedParams = await params;
    const rawId = resolvedParams.id || "";

    // 3. Smart Normalization: 
    // If it looks like a phone number, strip non-digits.
    // If it looks like an email/username, lowercase it and trim it.
    let cleanId = "";
    if (rawId.includes("@") || /[a-zA-Z]/.test(rawId)) {
      cleanId = rawId.toLowerCase().trim(); // It's an email or alias
    } else {
      cleanId = rawId.replace(/\D/g, ""); // It's a phone number
    }

    if (!cleanId) {
      return NextResponse.json({ success: false, error: "INVALID_QUERY" }, { status: 400 });
    }

    // 4. Search the Grid
    const reports = await Incident.find({ 
      identifier: cleanId 
    }).sort({ timestamp: -1 });

    return NextResponse.json({
      success: true,
      count: reports.length,
      normalizedQuery: cleanId,
      data: reports,
    });

  } catch (error: any) {
    console.error("QUERY_CRASH:", error);
    return NextResponse.json({ success: false, error: "SYSTEM_FAILURE" }, { status: 500 });
  }
}