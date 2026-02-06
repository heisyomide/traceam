import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { passcode } = await req.json();
    const secret = process.env.ADMIN_TERMINAL_PASSCODE;

    if (passcode === secret) {
      const response = NextResponse.json({ success: true });
      
      // Set the secure admin session cookie from the server side
      response.cookies.set("admin-access", "authorized", {
        path: "/",
        maxAge: 3600, // 1 hour session
        sameSite: "strict",
        httpOnly: true, // Prevents JavaScript from reading the cookie
        secure: process.env.NODE_ENV === "production",
      });

      return response;
    }

    return NextResponse.json({ success: false }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: "VERIFICATION_ERROR" }, { status: 500 });
  }
}