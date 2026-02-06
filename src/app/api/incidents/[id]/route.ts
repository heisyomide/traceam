import { NextResponse, NextRequest } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Incident from "@/lib/models/incident";

// 1. Update the type definition: params is now a Promise
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    
    // 2. Await the params before using them
    const resolvedParams = await params;
    const targetId = decodeURIComponent(resolvedParams.id);

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