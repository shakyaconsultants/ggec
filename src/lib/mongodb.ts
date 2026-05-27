import { MongoClient } from "mongodb";
import { env } from "@/lib/env";

const globalForMongo = globalThis as unknown as {
  mongoClient?: MongoClient;
};

export const mongoClient =
  globalForMongo.mongoClient ??
  new MongoClient(env.mongodbUri(), {
    retryWrites: true,
  });

if (process.env.NODE_ENV !== "production") {
  globalForMongo.mongoClient = mongoClient;
}

export async function getDb(dbName?: string) {
  const client = await mongoClient.connect();
  return client.db(dbName ?? env.mongodbDbName());
}
