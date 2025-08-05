import mongoose from "mongoose";

const MONGOS_CONNECTION_STR =
  process.env.MONGOS_CONNECTION_STR || `mongodb://localhost:27017/`;

if (!MONGOS_CONNECTION_STR) {
  throw new Error("Please define the MONGO_URI environment variable");
}

interface MongooseGlobal {
  mongoose?: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

const globalWithMongoose = global as typeof global & MongooseGlobal;
const cached = globalWithMongoose.mongoose || { conn: null, promise: null };

/**
 * Connects to the MongoDB database using the connection string in the
 * MONGOS_CONNECTION_STR environment variable. If the connection is already
 * established, it returns the cached connection. If not, it creates a new
 * connection and caches it.
 * @returns A Promise that resolves to the connected mongoose instance.
 */
export default async function connectDb() {
  if (cached.conn) {
    console.log(
      `Data base connection as successful at ${new Date().toLocaleTimeString()} ${cached} `
    );
    return cached.conn;
  }
  if (!cached.promise) {
    const opts = { bufferCommands: false };
    cached.promise = mongoose
      .connect(MONGOS_CONNECTION_STR, opts)
      .then((mongoose) => mongoose);
  }
  cached.conn = await cached.promise;
  console.log(`Data base connection as successful at ${cached} `);
  return cached.conn;
}
