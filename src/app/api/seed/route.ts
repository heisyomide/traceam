import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Intel from '@/lib/models/intel';

export async function GET() {
  try {
    await connectToDatabase();
    await Intel.create({
      name: "John Doe",
      phone: "08012345678",
      uid: "TR-99-X",
      riskLevel: "CRITICAL",
      status: "ACTIVE"
    });
    return NextResponse.json({ message: "Seed data created!" });
  } catch (e) { return NextResponse.json({ error: "Seed failed" }); }
}