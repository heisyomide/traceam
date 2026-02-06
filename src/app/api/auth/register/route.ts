import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/user";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { email, accessCode } = await req.json();

    // 1. Check if personnel already exists in the grid
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "USER_ALREADY_EXISTS" }, 
        { status: 400 }
      );
    }

    // 2. Create new user 
    // Note: Since your schema requires name and phone, 
    // we provide defaults or temporary placeholders until KYC is done.
    const newUser = await User.create({
      email,
      accessCode, 
      name: email.split('@')[0], // Temporary name from email
      phone: "PENDING",          // Will be updated during KYC
      role: "USER",
      kycStatus: "NONE"          // Initial state
    });

    // 3. Generate a session token
    // In production, use: jwt.sign({ id: newUser._id }, process.env.JWT_SECRET)
    const token = "secure_uplink_token_" + newUser._id;

    // 4. Return the "Handshake" payload
    return NextResponse.json({ 
      success: true, 
      token,
      user: {
        email: newUser.email,
        kycStatus: newUser.kycStatus,
        role: newUser.role
      }
    }, { status: 201 });

  } catch (error) {
    console.error("REGISTRATION_CRITICAL_ERROR:", error);
    return NextResponse.json(
      { success: false, error: "REGISTRATION_FAILED" }, 
      { status: 500 }
    );
  }
}