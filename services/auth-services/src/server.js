import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import authRoutes from "../routes/authRoutes.js";

dotenv.config({ path: ".env.authserver" });

const app = express();
const PORT = process.env.PORT || 4001;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/health", (_req, res) => res.json({ ok: true, service: "auth-service" }));

app.listen(PORT, () => {
    console.log(`auth-service listening on port ${PORT}`);
});