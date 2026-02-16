import mongoose from "mongoose";

export const connectDB = async (uri) => {
    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
            dbName: process.env.MONGODB_DB || "room_service",
            retryWrites: true
        });
        console.log("--> MongoDB connected successfully");
        console.log("Database:", mongoose.connection.db.databaseName);
        console.log("Host:", mongoose.connection.host);
        return true;
    } catch (error) {
        console.error("--> MongoDB connection failed:", error.message);
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
        db: mongoose.connection.db?.databaseName || null,
        collections: Object.keys(mongoose.connection.collections || {}),
        timestamp: new Date().toISOString()
    };
};

/**
 * verify database connectivity with a simple query
 */
export const verifyDBConnection = async () => {
    try {
        // Run a simple ping command
        const result = await mongoose.connection.db.admin().ping();
        return { connected: true, ping: result };
    } catch (error) {
        return { connected: false, error: error.message };
    }
};
