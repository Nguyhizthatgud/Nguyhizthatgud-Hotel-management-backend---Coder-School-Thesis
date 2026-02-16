// api-gateway/src/server.js
import dotenv from "dotenv";
dotenv.config({ path: ".env.gateway" });

import express from "express";

import cors from "cors";

import helmet from "helmet";

import rateLimit from "express-rate-limit";

import morgan from "morgan";

import { v4 as uuidv4 } from "uuid";
import admin from "firebase-admin";
import serviceAccount from "../../firebase-service-account.json" with { type: "json" };

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});





import logger from "../../shared/utils/logger.js";

import errorHandler from "../../shared/middleware/errorHandler.js";

import { validateAndInjectUser } from "../middleware/authGateway.js";



// Import routes

import authRoutes from "../routes/auth.js";

import roomRoutes from "../routes/room.js";

import bookingRoutes from "../routes/booking.js";

import guestRoutes from "../routes/guest.js";

import staffRoutes from "../routes/staff.js";

import transactionRoutes from "../routes/transaction.js";



const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request ID middleware
app.use((req, res, next) => {
    req.id = uuidv4();
    res.setHeader("X-Request-ID", req.id);
    next();
});

// Logging
app.use(morgan("combined"));
app.use((req, res, next) => {
    logger.info("Incoming request", {
        requestId: req.id,
        method: req.method,
        path: req.path
    });
    next();
});

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS),
    message: "Too many requests, please try again later.",
    standardHeaders: true,
    legacyHeaders: false
});
app.use(limiter);

// Gateway Auth Middleware - validates Firebase tokens and injects user headers
app.use(validateAndInjectUser);

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/guests", guestRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/transactions", transactionRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: {
            code: "NOT_FOUND",
            message: `Route ${req.method} ${req.path} not found`
        },
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
    logger.info(`API Gateway running on port ${PORT}`, {
        environment: process.env.NODE_ENV,
        port: PORT
    });
});

// Graceful shutdown
process.on("SIGTERM", () => {
    logger.info("SIGTERM signal received: closing HTTP server");
    server.close(() => {
        logger.info("HTTP server closed");
        process.exit(0);
    });
});

export default app;
