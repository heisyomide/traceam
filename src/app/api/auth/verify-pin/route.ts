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

    // 3. GENERATE REAL JWT 🛰️
    // Use the secret from your .env file
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET!,
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

// 5. SET THE COOKIE 🛡️
response.cookies.set("auth-token", token, {
  httpOnly: true, // Remains true to block client-side script access
  
  // Vercel handles HTTPS automatically. 
  // This ensures the cookie is ONLY sent over encrypted connections.
  secure: true, 
  
  // 'strict' is safer for banking/security apps, 
  // but 'lax' is better if you have external links pointing to the dashboard.
  sameSite: "strict", 
  
  maxAge: 60 * 60 * 24, // 24 hours
  path: "https://traceam.vercel.app",
  
  // If you have a custom domain (e.g., app.traceam.com), 
  // you can specify it here, but leaving it out works for .vercel.app
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