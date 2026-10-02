import mongoose from "mongoose";

import { env } from "../config/env.js";

export async function connectMongoDB(): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI);

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error(
      "MongoDB connection failed:",
      error,
    );

    throw error;
  }
}

export async function disconnectMongoDB(): Promise<void> {
  try {
    await mongoose.disconnect();

    console.log("MongoDB disconnected");
  } catch (error) {
    console.error(
      "MongoDB disconnection failed:",
      error,
    );

    throw error;
  }
}