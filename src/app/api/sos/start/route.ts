import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/user";
import Incident from "@/lib/models/incident";
import mongoose from "mongoose";

/* ================= SMS GATEWAY (TERMII) ================= */
async function sendEmergencySMS(contacts: string[], message: string) {
  const apiKey = process.env.TERMII_API_KEY;
  if (!apiKey) {
    console.error("SMS_GATEWAY_OFFLINE: Missing API Key");
    return null;
  }

  try {
    const res = await fetch("https://api.ng.termii.com/api/sms/send", {
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
    return await res.json();
  } catch (err) {
    return null;
  }
}

/* ================= SOS START (PROTECTED) ================= */
export async function POST(req: Request) {
  try {
    await connectToDatabase();
    
    // 1. EXTRACT USER ID FROM JWT (Security First)
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "UNAUTHORIZED_ACCESS" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    const { coordinates } = await req.json();

    // 2. FETCH USER & VALIDATE CLEARANCE
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });
    }

    // ✅ FIXED: Using kycStatus instead of nested reviewStatus
    if (user.kycStatus !== "APPROVED") {
      return NextResponse.json({ 
        error: "SIGNAL_BLOCKED", 
        message: "Personnel KYC status must be APPROVED to trigger SOS." 
      }, { status: 403 });
    }

    if (!coordinates?.lat || !coordinates?.lng) {
      return NextResponse.json({ error: "INVALID_GPS_SIGNAL" }, { status: 400 });
    }

    // 3. CONSTRUCT DISPATCH PAYLOAD
    const mapLink = `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`;
    const message = `🚨 TRACEAM SOS: ${user.name.toUpperCase()} is in danger.\n\nLive Track: ${mapLink}`;

    // 4. EXTRACT EMERGENCY CONTACTS
    // Adapting to your schema (Family, Friends, Partner)
    const registeredPhones: string[] = [];
    if (user.emergencyContacts?.family?.phone) registeredPhones.push(user.emergencyContacts.family.phone);
    if (user.emergencyContacts?.partner?.phone) registeredPhones.push(user.emergencyContacts.partner.phone);
    if (user.emergencyContacts?.friends) {
      user.emergencyContacts.friends.forEach((f: any) => registeredPhones.push(f.phone));
    }
    
    if (registeredPhones.length === 0) {
      return NextResponse.json({ error: "NO_EMERGENCY_CONTACTS_FOUND" }, { status: 400 });
    }

    // 5. CREATE SYSTEM INCIDENT
    const incident = await Incident.create({
      userId: user._id,
      identifier: user.name,
      status: "ACTIVE",
      coordinates: {
        ...coordinates,
        updatedAt: new Date(),
      },
      locationHistory: [{
        ...coordinates,
        timestamp: new Date(),
      }],
      description: `SOS Triggered by ${user.name}. Clearance Level: APPROVED.`,
    });

    // 6. DISPATCH SMS
    await sendEmergencySMS(registeredPhones, message);

    return NextResponse.json({
      success: true,
      incidentId: incident._id,
      contactsNotified: registeredPhones.length,
      trackingUrl: mapLink,
    });

  } catch (err: any) {
    console.error("SOS_FATAL_ERROR:", err.message);
    return NextResponse.json({ error: "INTERNAL_DISPATCH_FAILURE" }, { status: 500 });
  }
}