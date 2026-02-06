import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Incident from '@/lib/models/incident';
import mongoose from 'mongoose';

/**
 * Tactical Helper: Termii SMS Dispatch
 */
async function sendEmergencySMS(contacts: string[], message: string) {
  const apiKey = process.env.TERMII_API_KEY;
  if (!apiKey) return console.warn("⚠️ SMS_GATEWAY_OFFLINE: Missing API Key"), null;

  try {
    const response = await fetch("https://api.ng.termii.com/api/sms/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: contacts,
        from: "TraceAM",
        sms: message,
        type: "plain",
        channel: "generic",
        api_key: apiKey,
      }),
    });
    return response.json();
  } catch (err) {
    console.error("❌ SMS_GATEWAY_FETCH_ERROR:", err);
    return null;
  }
}

/**
 * Main SOS Dispatch Controller
 */
export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { action, incidentId, coordinates, userId, contacts, operatorName } = body;

    // --- ACTION: RESOLVE ---
    if (action === "RESOLVE") {
      const incident = await Incident.findById(incidentId);
      if (!incident) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

      incident.status = "RESOLVED";
      incident.endedAt = new Date();
      await incident.save();
      return NextResponse.json({ success: true, status: "RESOLVED" });
    }

    // --- ACTION: UPDATE (MOVING) ---
    if (action === "UPDATE" || incidentId) {
      const incident = await Incident.findById(incidentId);
      if (!incident || incident.status === "RESOLVED") {
        return NextResponse.json({ error: "INCIDENT_INACTIVE" }, { status: 400 });
      }

      incident.coordinates = { ...coordinates, updatedAt: new Date() };
      incident.locationHistory.push({ ...coordinates, timestamp: new Date() });
      incident.status = "MOVING";
      await incident.save();
      return NextResponse.json({ success: true, status: "MOVING" });
    }

    // --- ACTION: INITIATE (START SOS) ---
    if (!coordinates?.lat || !coordinates?.lng) {
      return NextResponse.json({ error: "INVALID_LOCATION" }, { status: 400 });
    }

    const mapsLink = `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`;
    const message = `🚨 TRACEAM SOS 🚨\nUser: ${operatorName || "Unknown"}\nLocation: ${mapsLink}\nImmediate help needed.`;

    const incident = await Incident.create({
      userId: userId || new mongoose.Types.ObjectId(),
      identifier: operatorName || "NODE_ALPHA",
      status: "ACTIVE",
      coordinates: { ...coordinates, updatedAt: new Date() },
      locationHistory: [{ ...coordinates, timestamp: new Date() }],
      description: message,
      notifiedContacts: contacts?.map((p: string) => ({ phone: p })) || []
    });

    if (contacts?.length) {
      await sendEmergencySMS(contacts, message);
    }

    return NextResponse.json({
      success: true,
      incidentId: incident._id,
      trackingUrl: mapsLink
    }, { status: 201 });

  } catch (error: any) {
    console.error("📡 SOS_ROUTE_ERROR:", error.message);
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR", details: error.message }, { status: 500 });
  }
}