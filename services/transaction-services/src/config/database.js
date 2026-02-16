import mongoose from "mongoose";
import logger from "../../../../shared/utils/logger.js";

export const connectDB = async (uri) => {
    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
            dbName: process.env.MONGODB_DB || "transaction_service",
            retryWrites: true
        });
        logger.info("--> MongoDB connected successfully");
        logger.info("Database:", mongoose.connection.db.databaseName);
        logger.info("Host:", mongoose.connection.host);
        return true;
    } catch (error) {
        logger.error("--> MongoDB connection failed:", error.message);
        throw error;
    }
};


/**
 * check if database is connected
 */
export const isDBConnected = () => {
    return mongoose.connection.readyState === 1;
};


/**
 * get database connection details
 */
export const getDBStatus = () => {
    const states = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    };

    return {
        state: states[mongoose.connection.readyState] || 'unknown',
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host || null,
        db: mongoose.connection.db?.databaseName || "transaction_service",
        collections: Object.keys(mongoose.connection.collections || {}),
        timestamp: new Date().toISOString()
    };
};
