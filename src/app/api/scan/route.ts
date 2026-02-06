import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Intel from '@/lib/models/intel'; // Ensure this model exists!

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    
    const { query } = await request.json();
    console.log(`🔎 SCAN_INITIATED: Searching for ${query}`);

    // We use a case-insensitive regex search for better "hacker" UX
    const result = await Intel.findOne({
      $or: [
        { phone: query },
        { uid: query },
        { name: { $regex: query, $options: 'i' } }
      ]
    });

    if (!result) {
      console.log(`❌ SCAN_FAILED: No match for ${query}`);
      return NextResponse.json({ 
        message: "TARGET_NOT_IN_DATABASE",
        status: "NOT_FOUND" 
      }, { status: 404 });
    }

    console.log(`✅ SCAN_SUCCESS: Match found for ${query}`);
    return NextResponse.json(result, { status: 200 });

  } catch (error: any) {
    console.error("📡 SCAN_UPLINK_CRITICAL_FAILURE:", error.message);
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}