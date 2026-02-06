import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Incident from "@/lib/models/incident";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    // Decoding ensures special characters like '@' in emails work correctly
    const targetId = decodeURIComponent(params.id);

    // Search by identifier (Phone, Email, or ID)
    const reports = await Incident.find({ 
      identifier: targetId.trim() 
    }).sort({ timestamp: -1 });

    return NextResponse.json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json(
      { success: false, error: "DATABASE_CONNECTION_FAILED" }, 
      { status: 500 }
    );
  }
}