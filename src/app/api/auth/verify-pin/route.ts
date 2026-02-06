import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/user";
import jwt from "jsonwebtoken";

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
      // REMOVED domain property for better Vercel compatibility
    });

    // 6. SET THE PUBLIC LOGGED-IN COOKIE (Visible to Navbar) 🛰️
    // This allows the Navbar to see that a session is active
    response.cookies.set("is-logged-in", "true", {
      httpOnly: false, // CRITICAL: Must be false for Navbar to read
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    // 7. SET THE PUBLIC KYC STATUS COOKIE 📋
    response.cookies.set("user-kyc-status", user.kycStatus || "NONE", {
      httpOnly: false, // CRITICAL: Must be false for Navbar/Middleware
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