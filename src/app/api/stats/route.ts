import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Incident from "@/lib/models/incident";

export async function GET() {
  try {
    await connectToDatabase();

    // Aggregate real data from your collection
    const totalIncidents = await Incident.countDocuments();
    
    // Calculate Threat Index based on severity (e.g., % of HIGH/MEDIUM incidents)
    const highRisk = await Incident.countDocuments({ severity: { $in: ["HIGH", "CRITICAL"] } });
    
    // Logic: Base risk + weighted high risk detections
    const baseRisk = 12; 
    const calculatedIndex = totalIncidents > 0 
      ? Math.min(Math.round((highRisk / totalIncidents) * 100) + baseRisk, 100)
      : baseRisk;

    return NextResponse.json({
      total: totalIncidents,
      threatIndex: calculatedIndex,
    }, { status: 200 });

  } catch (error) {
    console.error("Stats API Failure:", error);
    return NextResponse.json(
      { total: 0, threatIndex: 0, error: "UPLINK_OFFLINE" }, 
      { status: 500 }
    );
  }
}