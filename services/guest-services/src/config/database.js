import mongoose from "mongoose";
import logger from "../../../shared/utils/logger.js";

export const connectDB = async (uri) => {
    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
            dbName: process.env.MONGODB_DB || "guest_service",
            retryWrites: true
        });
        logger.info("Connected to MongoDB");
    } catch (error) {
        logger.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
};

/**
 * check if database is connected
 */
export const isDBConnected = () => {
    return mongoose.connection.readyState === 1;
};


export const disconnectDB = async () => {
    await mongoose.disconnect();
    logger.info("Disconnected from MongoDB");
};

