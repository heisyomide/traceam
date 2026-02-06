import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/user";

export async function GET() {
  try {
    const cookieStore = await cookies();
    let token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "NO_TOKEN" }, { status: 401 });
    }

    // --- NEW IPHONE FIX START ---
    // Safari sometimes wraps cookies in %22 (quotes) or literal double quotes
    // We clean the string before passing it to the JWT verifier
    const cleanToken = decodeURIComponent(token).replace(/^"|"$/g, '');
    // --- NEW IPHONE FIX END ---

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("CRITICAL: JWT_SECRET missing");
      return NextResponse.json({ error: "SERVER_CONFIG_ERROR" }, { status: 500 });
    }

    try {
      // Use the cleanToken here instead of the raw token
      const decoded = jwt.verify(cleanToken, secret) as { id: string; email: string };
      
      await connectToDatabase();
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return NextResponse.json({ error: "PERSONNEL_NOT_FOUND" }, { status: 404 });
      }

      return NextResponse.json(user);

    } catch (jwtErr: any) {
      // If it still fails, this log will now tell us exactly what the iPhone sent
      console.error("DEBUG: JWT Verification failed:", jwtErr.message, "Cleaned Token Sample:", cleanToken.substring(0, 15));
      
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