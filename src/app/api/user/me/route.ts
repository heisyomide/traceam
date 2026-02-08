import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/user";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const rawToken = cookieStore.get("auth-token")?.value;

    if (!rawToken) {
      return NextResponse.json({ error: "NO_TOKEN" }, { status: 401 });
    }

    const token = decodeURIComponent(rawToken).replace(/^"|"$/g, '');
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      return NextResponse.json({ error: "SERVER_CONFIG_ERROR" }, { status: 500 });
    }

    try {
      const decoded = jwt.verify(token, secret) as { id: string; email: string };
      await connectToDatabase();

      // Ensure we get the SOS status and Emergency Contacts
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return NextResponse.json({ error: "PERSONNEL_NOT_FOUND" }, { status: 404 });
      }

      // 🛰️ ADDED: Cache-Control: no-store
      // This forces the browser to get fresh data every time (Fixes account switching bugs)
      const response = NextResponse.json(user);
      response.headers.set('Cache-Control', 'no-store, max-age=0');
      
      return response;

    } catch (jwtErr: any) {
      return NextResponse.json({ 
        error: jwtErr.name === "TokenExpiredError" ? "AUTH_SESSION_EXPIRED" : "INVALID_TOKEN" 
      }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ error: "INTERNAL_SYSTEM_FAILURE" }, { status: 500 });
  }
}