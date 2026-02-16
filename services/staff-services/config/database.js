import mongoose from "mongoose";


const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {

        });
        console.log("MongoDB connected successfully");
        console.log("Database:", mongoose.connection.db.databaseName);
        console.log("Host:", mongoose.connection.host);
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    }
};

export { connectDB };