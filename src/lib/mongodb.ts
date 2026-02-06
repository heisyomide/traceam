import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('SYSTEM_ERROR: MONGODB_URI_MISSING_FROM_ENV');
}

// This "Global" check is the "Singleton" pattern. 
// It reuses the same connection instead of opening new ones every time.
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI!).then((mongoose) => {
      console.log("📡 TRESOM_DATABASE_UPLINK_STABLE");
      return mongoose;
    });
  }
  
  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectToDatabase;