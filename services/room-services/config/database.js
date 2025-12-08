import mongoose from "mongoose";

export async function connectDB(uri) {
    if (!uri) throw new Error("MONGODB_URI is missing");
    mongoose.set("strictQuery", false);
    await mongoose.connect(uri);
    console.log("room-service: connected to MongoDB");
}