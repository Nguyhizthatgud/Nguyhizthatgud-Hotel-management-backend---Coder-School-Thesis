import dotenv from "dotenv";
import express from "express";
import cors from "cors";

dotenv.config({ path: ".env.hotelservice" });

const app = express();
const PORT = process.env.PORT || 4006;

app.use(cors());
app.use(express.json());

// Basic routes scaffold
app.get("/health", (_req, res) => res.json({ ok: true, service: "hotel-service" }));

// Placeholder endpoints (replace with real controllers later)
app.get("/api/staff", (_req, res) => {
	res.json({ staff: [], message: "List staff (placeholder)" });
});

app.post("/api/staff", (_req, res) => {
	res.status(201).json({ message: "Create staff (placeholder)" });
});

app.put("/api/staff/:id", (req, res) => {
	res.json({ id: req.params.id, message: "Update staff (placeholder)" });
});

app.delete("/api/staff/:id", (req, res) => {
	res.json({ id: req.params.id, message: "Delete staff (placeholder)" });
});

app.listen(PORT, () => {
	console.log(`staff-service listening on port ${PORT}`);
});

