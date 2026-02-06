import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectToDatabase from "@/lib/mongodb";
import Incident from "@/lib/models/incident";

/**
 * POST: Terminate SOS Incident
 * Safely closes an active emergency and timestamps the resolution.
 */
export async function POST(req: Request) {
  try {
    await connectToDatabase();

    // 1. Authenticate the Request
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    const { incidentId } = await req.json();

    if (!incidentId) {
      return NextResponse.json({ error: "MISSING_INCIDENT_ID" }, { status: 400 });
    }

    // 2. Find and Validate Ownership
    // Only the user who owns the incident (or an admin) should be able to stop it
    const incident = await Incident.findById(incidentId);

    if (!incident) {
      return NextResponse.json({ error: "INCIDENT_NOT_FOUND" }, { status: 404 });
    }

    // Security check: Ensure the requester is the one who triggered it
    if (incident.userId.toString() !== decoded.id) {
       return NextResponse.json({ error: "FORBIDDEN_MODIFICATION" }, { status: 403 });
    }

    // 3. Atomic Update
    // Using findByIdAndUpdate is cleaner and prevents race conditions
    const updatedIncident = await Incident.findByIdAndUpdate(
      incidentId,
      { 
        $set: { 
          status: "RESOLVED",
          endedAt: new Date() 
        } 
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: "SOS_SIGNAL_TERMINATED",
      resolvedAt: updatedIncident?.endedAt
    });

  } catch (err: any) {
    console.error("STOP_SOS_FATAL_ERROR:", err.message);
    return NextResponse.json(
      { error: "STOP_PROTOCOL_FAILURE", details: err.message },
      { status: 500 }
    );
  }
}