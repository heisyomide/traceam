import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/user";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer"; // 1. Import Nodemailer

// 2. Setup Nodemailer Transporter
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
    const { email, accessCode } = await req.json();

    // 1. Locate User
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "PERSONNEL_NOT_FOUND" }, 
        { status: 404 }
      );
    }

    // 2. Validate Access Code
    if (user.accessCode !== accessCode) {
      return NextResponse.json(
        { success: false, error: "INVALID_SEQUENCE" }, 
        { status: 401 }
      );
    }

    // 3. GENERATE REAL JWT
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("CRITICAL: JWT_SECRET is not defined.");
      return NextResponse.json(
        { success: false, error: "SERVER_CONFIGURATION_ERROR" },
        { status: 500 }
      );
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      secret,
      { expiresIn: "24h" }
    );

    // 🛰️ NEW: SEND LOGIN ALERT EMAIL
    const loginTime = new Date().toLocaleString("en-GB", { timeZone: "Africa/Lagos" });
    const userAgent = req.headers.get("user-agent") || "Unknown Device";

    try {
      await transporter.sendMail({
        from: `"TRACEAM SECURITY" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: "⚠️ NEW TERMINAL LOGIN DETECTED",
        html: `
          <div style="font-family: 'Courier New', monospace; background-color: #01030a; color: #ffffff; padding: 30px; border: 2px solid #06b6d4; border-radius: 10px;">
            <h2 style="color: #06b6d4; text-transform: uppercase; border-bottom: 1px solid #06b6d4; padding-bottom: 10px;">Security Notification</h2>
            <p style="font-size: 14px;">Successful login authorization detected for your Personnel ID.</p>
            <div style="background: rgba(6, 182, 212, 0.1); padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>TIMESTAMP:</strong> ${loginTime}</p>
              <p><strong>DEVICE_IDENT:</strong> ${userAgent}</p>
              <p><strong>STATUS:</strong> AUTHORIZED</p>
            </div>
            <p style="font-size: 12px; color: #64748b;">If this was not you, please trigger an emergency lockdown or contact system administration immediately.</p>
          </div>
        `,
      });
    } catch (mailError) {
      console.error("Failed to send login alert email:", mailError);
      // We don't block the login process if the email fails
    }

    // 4. PREPARE SECURE RESPONSE
    const response = NextResponse.json({ 
      success: true,
      user: {
        email: user.email,
        kycStatus: user.kycStatus || "NONE",
        name: user.name
      }
    }, { status: 200 });

    // 5. SET THE SECURE AUTH COOKIE (Hidden from JS) 🛡️
    response.cookies.set("auth-token", token, {
      httpOnly: true, 
      secure: true, 
      sameSite: "lax", 
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    // 6. SET THE PUBLIC LOGGED-IN COOKIE (Visible to Navbar) 🛰️
    response.cookies.set("is-logged-in", "true", {
      httpOnly: false, 
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    // 7. SET THE PUBLIC KYC STATUS COOKIE 📋
    response.cookies.set("user-kyc-status", user.kycStatus || "NONE", {
      httpOnly: false, 
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;

  } catch (error) {
    console.error("AUTH_UPLINK_CRITICAL_FAILURE:", error);
    return NextResponse.json(
      { success: false, error: "INTERNAL_SYSTEM_FAILURE" }, 
      { status: 500 }
    );
  }
}