import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/user";

export async function GET() {
  try {
    // 1. Await cookies for Next.js 15 compatibility
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "NO_TOKEN" }, { status: 401 });
    }

    // 2. Security Check: Ensure Secret exists
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("CRITICAL: JWT_SECRET is missing from environment variables.");
      return NextResponse.json({ error: "SERVER_CONFIG_ERROR" }, { status: 500 });
    }

    try {
      // 3. Verify and Decode
      // We cast the result to include 'id' because that's what we put in the payload
      const decoded = jwt.verify(token, secret) as { id: string; email: string };
      
      await connectToDatabase();

      // 4. Fetch the most recent user data (including KYC status)
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return NextResponse.json({ error: "PERSONNEL_NOT_FOUND" }, { status: 404 });
      }

      // Return the full user object (Front-end will use user.kycStatus)
      return NextResponse.json(user);

    } catch (jwtErr: any) {
      console.error("DEBUG: JWT Verification failed:", jwtErr.message);
      
      // Handle the "malformed" or "expired" cases gracefully
      const errorMessage = jwtErr.name === "TokenExpiredError" 
        ? "AUTH_SESSION_EXPIRED" 
        : "INVALID_SECURITY_TOKEN";

      return NextResponse.json({ error: errorMessage }, { status: 401 });
    }
  } catch (error) {
    console.error("SERVER_ERROR_IN_ME_ROUTE:", error);
    return NextResponse.json({ error: "INTERNAL_SYSTEM_FAILURE" }, { status: 500 });
  }
}