import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/user";
import Incident from "@/lib/models/incident";
import nodemailer from "nodemailer";

/* ================= NODEMAILER CONFIG ================= */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* ================= SMS GATEWAY (TERMII) ================= */
async function sendEmergencySMS(contacts: string[], message: string) {
  const apiKey = process.env.TERMII_API_KEY;
  if (!apiKey) return null;

  try {
    await fetch("https://api.ng.termii.com/api/sms/send", {
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
  } catch (err) {
    console.error("SMS_FAILED:", err);
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    const { coordinates } = await req.json();

    const user = await User.findById(decoded.id);
    if (!user) return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });

    // 1. CLEARANCE CHECK
    if (user.kycStatus !== "APPROVED") {
      return NextResponse.json({ error: "SIGNAL_BLOCKED", message: "KYC Not Approved" }, { status: 403 });
    }

    // 2. CONSTRUCT ASSETS
    const mapLink = `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`;
    const smsMessage = `🚨 TRACEAM SOS: ${user.name.toUpperCase()} is in danger. Live Track: ${mapLink}`;

    // 3. EXTRACT EMAILS & PHONES
    const registeredPhones: string[] = [];
    const registeredEmails: string[] = [user.email]; // Always include victim's Gmail

    if (user.emergencyContacts?.family) {
        if (user.emergencyContacts.family.phone) registeredPhones.push(user.emergencyContacts.family.phone);
        if (user.emergencyContacts.family.email) registeredEmails.push(user.emergencyContacts.family.email);
    }
    if (user.emergencyContacts?.partner) {
        if (user.emergencyContacts.partner.phone) registeredPhones.push(user.emergencyContacts.partner.phone);
        if (user.emergencyContacts.partner.email) registeredEmails.push(user.emergencyContacts.partner.email);
    }
    if (user.emergencyContacts?.friends) {
      user.emergencyContacts.friends.forEach((f: any) => {
          if (f.phone) registeredPhones.push(f.phone);
          if (f.email) registeredEmails.push(f.email);
      });
    }

    // 4. PERSIST SOS STATE (Solves Refresh Problem)
    user.sosActive = true;
    user.lastKnownLocation = { ...coordinates, timestamp: new Date() };
    await user.save();

    // 5. CREATE INCIDENT LOG
    const incident = await Incident.create({
      userId: user._id,
      identifier: user.name,
      status: "ACTIVE",
      coordinates: { ...coordinates, updatedAt: new Date() },
      locationHistory: [{ ...coordinates, timestamp: new Date() }],
    });

    // 6. DISPATCH ALERTS (SMS & EMAIL)
    // SMS Dispatch
    if (registeredPhones.length > 0) {
      await sendEmergencySMS(registeredPhones, smsMessage);
    }

    // Email Dispatch (Nodemailer)
    if (registeredEmails.length > 0) {
      await transporter.sendMail({
        from: `"TRACEAM EMERGENCY" <${process.env.EMAIL_USER}>`,
        to: registeredEmails.join(", "),
        subject: `🚨 EMERGENCY ALERT: ${user.name.toUpperCase()}`,
        html: `
          <div style="font-family: sans-serif; border: 10px solid red; padding: 20px;">
            <h1 style="color: red;">SOS SIGNAL DETECTED</h1>
            <p><strong>Personnel:</strong> ${user.name}</p>
            <p><strong>Status:</strong> DANGER / ACTIVE</p>
            <div style="background: #eee; padding: 15px; text-align: center;">
                <a href="${mapLink}" style="background: red; color: white; padding: 10px 20px; text-decoration: none; font-weight: bold;">VIEW LIVE LOCATION</a>
            </div>
            <p>Coordinates: ${coordinates.lat}, ${coordinates.lng}</p>
          </div>
        `
      });
    }

    return NextResponse.json({ success: true, incidentId: incident._id });

  } catch (err: any) {
    console.error("SOS_FATAL_ERROR:", err.message);
    return NextResponse.json({ error: "INTERNAL_DISPATCH_FAILURE" }, { status: 500 });
  }
}