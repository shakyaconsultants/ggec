import { MongoClient } from "mongodb";

const DEFAULT_DB_NAME = process.env.MONGODB_DB_NAME ?? "ggec";

const globalForMongo = globalThis as unknown as {
  mongoClient?: MongoClient;
};

export const mongoClient =
  globalForMongo.mongoClient ??
  new MongoClient(process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/ggec", {
    retryWrites: true,
  });

if (process.env.NODE_ENV !== "production") {
  globalForMongo.mongoClient = mongoClient;
}

export async function getDb(dbName?: string) {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not set. Add it to your .env.local file.");
  }
  const client = await mongoClient.connect();
  return client.db(dbName ?? DEFAULT_DB_NAME);
}
