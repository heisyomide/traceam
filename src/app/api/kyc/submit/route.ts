import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/user";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    
    const body = await req.json();
    const { email, fullName, address, idType, idImageUrl, contacts } = body;

    // 1. Locate and Update in one atomic operation
    const updatedUser = await User.findOneAndUpdate(
      { email },
      {
        $set: {
          name: fullName, 
          kycStatus: "PENDING", 
          "kyc.idType": idType,
          "kyc.idImageUrl": idImageUrl,
          "kyc.address": address,
          "kyc.submittedAt": new Date(),
          "emergencyContacts.family": contacts.family,
          "emergencyContacts.friends": contacts.friends,
          "emergencyContacts.partner": contacts.partner,
        }
      },
      { new: true, runValidators: true } // Ensures schema enums are respected
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: "OPERATOR_NOT_FOUND" }, 
        { status: 404 }
      );
    }

    // 2. Build Response
    const response = NextResponse.json({ 
      success: true, 
      message: "UPLINK_COMPLETE_AWAITING_REVIEW",
      status: "PENDING" 
    });

// ✅ Corrected Cookie setup
response.cookies.set('user-kyc-status', 'PENDING', {
  path: '/',
  maxAge: 86400,
  sameSite: 'strict', // Changed from SameSite: 'Strict'
  secure: process.env.NODE_ENV === 'production'
});

    return response;

  } catch (error: any) {
    console.error("KYC_SUBMISSION_CRITICAL_FAILURE:", error);
    return NextResponse.json(
      { success: false, error: "DATA_SYNC_FAILED", details: error.message }, 
      { status: 500 }
    );
  }
}