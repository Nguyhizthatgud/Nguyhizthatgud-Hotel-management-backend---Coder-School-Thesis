import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/database.js";
import roomRoutes from "./routes/roomRoutes.js";

dotenv.config({ path: ".env.roomservice" }); // adjust if you use .env

const app = express();
const PORT = process.env.PORT || 4004;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true, service: "room-service" }));
app.use("/api/rooms", roomRoutes);

async function start() {
    try {
        await connectDB(process.env.MONGODB_URI);
        app.listen(PORT, () => console.log(`room-service listening on port ${PORT}`));
    } catch (err) {
        console.error("room-service failed to start:", err.message);
        process.exit(1);
    }
}
