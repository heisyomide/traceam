import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/user";

export async function GET() {
  try {
    // FIX: cookies() must be awaited in Next.js 15
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin-access");

    if (!adminSession || adminSession.value !== "authorized") {
      return NextResponse.json({ error: "UNAUTHORIZED_UPLINK" }, { status: 401 });
    }

    await connectToDatabase();

    const users = await User.find({})
      .select("-password") 
      .sort({ "kyc.submittedAt": -1 });

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error("ADMIN_GET_ERROR:", error);
    return NextResponse.json({ error: "FAILED_TO_FETCH_PERSONNEL" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    // FIX: cookies() must be awaited here as well
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin-access");

    if (!adminSession || adminSession.value !== "authorized") {
      return NextResponse.json({ error: "UNAUTHORIZED_MODIFICATION" }, { status: 401 });
    }

    await connectToDatabase();
    const { email, newStatus } = await req.json();

    const validStatuses = ["PENDING", "APPROVED", "REJECTED", "NONE"];
    if (!validStatuses.includes(newStatus)) {
      return NextResponse.json({ error: "INVALID_STATUS_PROTOCOL" }, { status: 400 });
    }

    const updatedUser = await User.findOneAndUpdate(
      { email },
      { $set: { kycStatus: newStatus } },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return NextResponse.json({ error: "NODE_NOT_FOUND" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("ADMIN_PATCH_ERROR:", error);
    return NextResponse.json({ error: "UPDATE_FAILURE" }, { status: 500 });
  }
}