import express from "express";
import cors from "cors";
import dotenv from "dotenv";



import bookingRoutes from "./routes/bookingRoutes.js";
import { connectDB } from "./config/database.js";
import { extractUserFromGateway } from "../../../shared/middleware/extractUser.js";
import logger from "../../../shared/utils/logger.js";
dotenv.config({ path: ".env.guestservice" });

const app = express();
const PORT = process.env.PORT || 4005;
const MONGODB_URI = process.env.MONGODB_URI;


app.use(cors());
app.use(express.json());

// extract user info from gateway headers
app.use(extractUserFromGateway);

app.use("/api/guest", guestRoutes);


app.get("/health", (_req, res) => res.json({ ok: true, service: "guest-service" }));


connectDB(MONGODB_URI).then(() => {
    app.listen(PORT, () => {
        logger.info(`guest-service on :${PORT}`);
    });
}).catch((err) => {
    logger.error("Failed to start guest-service:", err.message);
    process.exit(1);
});

export default app;