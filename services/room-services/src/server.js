import dotenv from "dotenv";
import express from "express";
import cors from "cors";

import { connectDB } from "./config/database.js";
import { initRedis } from "./config/redis.js";
import roomRoutes from "./routes/roomRoutes.js";
import { extractUserFromGateway } from "../../../shared/middleware/extractUser.js";


dotenv.config({ path: ".env.roomservice" });



const app = express();
const PORT = process.env.PORT || 4004;
const MONGODB_URI = process.env.MONGODB_URI;



app.use(cors());
app.use(express.json());

// Health check endpoint (public, before auth middleware)
app.get("/health", (_req, res) => res.json({
    ok: true,
    status: "room-service is healthy",
    message: "room-service is up and running",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()

}));

// Auth middleware for protected routes
app.use(extractUserFromGateway);

// Protected routes
app.use("/api/rooms", roomRoutes);

// Start server after DB connection and Redis initialization
connectDB(MONGODB_URI).then(async () => {
    await initRedis();
    app.listen(PORT, () => {
        console.log(`-- Room Service running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    });
}).catch((err) => {
    console.error("-- Failed to start server due to DB connection error:", err.message);
    process.exit(1);
});

