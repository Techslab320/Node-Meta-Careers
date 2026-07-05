import mongoose from "mongoose";
import { mongoDatabaseName } from "@/config/database";
import { requireEnv } from "@/config/env";

declare global {
  var mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

const globalCache = global.mongooseCache ?? { conn: null, promise: null };
global.mongooseCache = globalCache;

export async function connectDB(): Promise<typeof mongoose> {
  if (globalCache.conn) {
    return globalCache.conn;
  }

  const { MONGODB_URI } = requireEnv(["MONGODB_URI"]);

  if (!globalCache.promise) {
    globalCache.promise = mongoose.connect(MONGODB_URI as string, {
      bufferCommands: false,
      dbName: mongoDatabaseName,
    });
  }

  globalCache.conn = await globalCache.promise;
  return globalCache.conn;
}
