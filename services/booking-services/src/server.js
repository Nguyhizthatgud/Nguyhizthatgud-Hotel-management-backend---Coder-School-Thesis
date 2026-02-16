import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import bookingRoutes from "./routes/bookingRoutes.js";
import { connectDB } from "./config/database.js";
import { initRedis } from "./config/redis.js";
import logger from "../../../shared/utils/logger.js";
import { extractUserFromGateway } from "../../../shared/middleware/extractUser.js";
dotenv.config({ path: ".env.bookingservice" });

const app = express();
const PORT = process.env.PORT || 4003;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());

// extract user info from gateway headers
app.use(extractUserFromGateway);

app.use("/api/bookings", bookingRoutes);

app.get("/health", (_req, res) => res.json({ ok: true, service: "booking-service" }));


// Start server after DB connection and Redis initialization
connectDB(MONGODB_URI).then(async () => {
    await initRedis();
    app.listen(PORT, () => {
        logger.info(`booking-service on :${PORT}`);
    });
}).catch((err) => {
    logger.error("Failed to start booking-service:", err.message);
    process.exit(1);
});

