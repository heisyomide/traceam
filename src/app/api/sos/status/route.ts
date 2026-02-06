import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Incident from "@/lib/models/incident";

/**
 * GET: Incident Tracker
 * Used by the Dashboard to update the Radar position in real-time.
 */
export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const incidentId = searchParams.get("id");

    if (!incidentId) {
      return NextResponse.json(
        { error: "MISSING_INCIDENT_IDENTIFIER" },
        { status: 400 }
      );
    }

    // Fetch the incident and project only necessary tracking data
    const incident = await Incident.findById(incidentId).select(
      "status coordinates identifier updatedAt"
    );

    if (!incident) {
      return NextResponse.json(
        { error: "INCIDENT_NOT_FOUND" },
        { status: 404 }
      );
    }

    // Logic: If the incident is resolved, inform the UI to stop polling
    return NextResponse.json({
      success: true,
      data: {
        status: incident.status, // ACTIVE, RESOLVED, or CANCELLED
        coordinates: incident.coordinates, // { lat, lng }
        lastUpdate: incident.updatedAt,
        identifier: incident.identifier,
      },
    });

  } catch (error: any) {
    console.error("TRACKING_FETCH_FAILURE:", error.message);
    return NextResponse.json(
      { error: "INTERNAL_TRACKING_ERROR" },
      { status: 500 }
    );
  }
}