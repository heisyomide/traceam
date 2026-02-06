import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Incident from "@/lib/models/incident";

/**
 * POST: Update SOS Location
 * Streams real-time coordinates to an active incident.
 */
export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const { incidentId, coordinates } = await req.json();

    // 1. Basic Validation
    if (!incidentId || !coordinates?.lat || !coordinates?.lng) {
      return NextResponse.json(
        { error: "INVALID_GPS_DATA_STREAM" },
        { status: 400 }
      );
    }

    // 2. Atomic Update & History Logging
    // We only update if the status is ACTIVE or MOVING to prevent 
    // updating a RESOLVED incident.
    const updatedIncident = await Incident.findOneAndUpdate(
      { 
        _id: incidentId, 
        status: { $in: ["ACTIVE", "MOVING"] } 
      },
      { 
        $set: { 
          coordinates: { 
            ...coordinates, 
            updatedAt: new Date() 
          },
          status: "MOVING" // Update status to reflect movement
        },
        $push: { 
          locationHistory: { 
            ...coordinates, 
            timestamp: new Date() 
          } 
        }
      },
      { new: true } // Returns the document after the update
    );

    if (!updatedIncident) {
      return NextResponse.json(
        { error: "INCIDENT_INACTIVE_OR_NOT_FOUND" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      status: "STREAMING_ACTIVE"
    });

  } catch (err: any) {
    console.error("SOS_HEARTBEAT_CRITICAL_ERROR:", err.message);
    return NextResponse.json(
      { error: "TELEMETRY_SYNC_FAILED" },
      { status: 500 }
    );
  }
}