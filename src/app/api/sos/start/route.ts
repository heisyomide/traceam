import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/user";
import Incident from "@/lib/models/incident";
import nodemailer from "nodemailer";

// --- Helper for Termii SMS ---
async function sendEmergencySMS(contacts: string[], message: string) {
  const apiKey = process.env.TERMII_API_KEY;
  if (!apiKey) {
    console.error("SMS_ERROR: TERMII_API_KEY is missing in .env");
    return null;
  }

  try {
    // Termii usually expects 'to' as a string or an array depending on the endpoint
    // We'll join them if sending as a single broadcast or loop them
    const res = await fetch("https://api.ng.termii.com/api/sms/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: contacts.join(","), // Standard Termii comma-separated format
        from: "TraceAM",
        sms: message,
        type: "plain",
        channel: "generic",
        api_key: apiKey,
      }),
    });
    return await res.json();
  } catch (err) {
    console.error("SMS_NETWORK_ERROR:", err);
  }
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

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

    // 1. EXTRACTION - PHONES ONLY 📱
    const contactPhones: string[] = [];
    const ec = user.emergencyContacts;

    if (ec) {
      if (ec.family?.phone) contactPhones.push(ec.family.phone);
      if (ec.partner?.phone) contactPhones.push(ec.partner.phone);
      if (Array.isArray(ec.friends)) {
        ec.friends.forEach((f: any) => { if (f.phone) contactPhones.push(f.phone); });
      }
    }

    // 2. DEFINE DATA (Fixed Map Link) 🕒
    const timestamp = new Date().toLocaleString("en-GB", { timeZone: "Africa/Lagos" });
    const mapLink = `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`;

    // 3. PERSIST STATE
    const incident = await Incident.create({
      userId: user._id,
      identifier: user.name,
      status: "ACTIVE",
      coordinates: { ...coordinates, updatedAt: new Date() },
    });

    user.sosActive = true;
    user.activeIncidentId = incident._id;
    await user.save();

    // 4. DISPATCH EMAIL TO VICTIM 📧
    try {
 await transporter.sendMail({
        from: `"TRACEAM TACTICAL" <${process.env.EMAIL_USER}>`,
        to:  user.email,
        subject: `⚠️ PRIORITY 1: SOS SIGNAL - ${user.name.toUpperCase()}`,
        html: `
          <div style="background-color: #050505; color: #ffffff; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 20px; border-radius: 12px; max-width: 600px; margin: auto; border: 1px solid #333;">
            <div style="border: 2px solid #ff3e3e; padding: 30px; border-radius: 8px; position: relative; overflow: hidden;">
              
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="display: inline-block; padding: 5px 15px; border: 1px solid #ff3e3e; color: #ff3e3e; font-size: 10px; letter-spacing: 3px; font-weight: bold; margin-bottom: 10px;">TRACEAM GLOBAL SECURITY</div>
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -1px;">DISTRESS SIGNAL DETECTED</h1>
              </div>

              <div style="background: rgba(255, 62, 62, 0.05); padding: 20px; border-radius: 4px; margin-bottom: 25px; border: 1px solid rgba(255, 62, 62, 0.2);">
                <table style="width: 100%; border-collapse: collapse; color: #eee; font-size: 14px;">
                  <tr>
                    <td style="padding: 8px 0; color: #888;">SUBJECT:</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: bold;">${user.name.toUpperCase()}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #888;">STATUS:</td>
                    <td style="padding: 8px 0; text-align: right; color: #ff3e3e; font-weight: bold;">CRITICAL / ACTIVE</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #888;">COORDINATES:</td>
                    <td style="padding: 8px 0; text-align: right; font-family: monospace;">${coordinates.lat.toFixed(5)}, ${coordinates.lng.toFixed(5)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #888;">TIME:</td>
                    <td style="padding: 8px 0; text-align: right;">${timestamp}</td>
                  </tr>
                </table>
              </div>

              <div style="text-align: center; margin-top: 35px; margin-bottom: 20px;">
                <a href="${mapLink}" style="background-color: #ff3e3e; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 5px; font-weight: 900; font-size: 14px; display: inline-block; text-transform: uppercase; letter-spacing: 1px;">
                  Intercept Live Stream
                </a>
              </div>

              <div style="text-align: center; border-top: 1px solid #222; padding-top: 20px; font-size: 10px; color: #555;">
                INCIDENT_HASH: ${incident._id} | SECURITY_PROTOCOL_TRACEAM_V4
              </div>
            </div>
          </div>
        `
      });
      console.log("SUCCESS: Tactical Email Dispatched");
    } catch (mailErr) {
      console.error("FAIL: Email Dispatch failed:", mailErr);
    }

    // 5. TRIGGER SMS DISPATCH 📱
    if (contactPhones.length > 0) {
      console.log(`INITIATING_SMS_PROTOCOL: Sending to ${contactPhones.length} numbers`);
      const smsMessage = `🚨 TRACEAM SOS: ${user.name.toUpperCase()} is in danger. Live Track: ${mapLink}`;
      
      try {
        await sendEmergencySMS(contactPhones, smsMessage);
        console.log("SMS_DISPATCH_SUCCESS");
      } catch (smsErr) {
        console.error("SMS_DISPATCH_CRITICAL_FAILURE:", smsErr);
      }
    }

    // 6. FINAL RESPONSE
    return NextResponse.json({ 
      success: true, 
      incidentId: incident._id,
      contactsNotified: contactPhones.length 
    });

  } catch (err: any) {
    console.error("CRITICAL_ROUTE_FAILURE:", err);
    return NextResponse.json({ error: "INTERNAL_FAILURE" }, { status: 500 });
  }
}