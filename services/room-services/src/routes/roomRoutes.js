import express from "express";
import {
    createRoom,
    listRooms,
    getRoom,
    updateStatus,
    deleteRoom,
    summary
} from "../controllers/roomController.js";
import { requireGatewayUser, scopeToOwner } from "../middleware/auth.js";

const router = express.Router();

// all routes require authentication and are scoped to owner
router.use(requireGatewayUser);
router.use(scopeToOwner);

// Owner can access all their own data
router.get("/summary", summary);
router.get("/", listRooms);
router.get("/:id", getRoom);
router.post("/", createRoom);
router.delete("/:id", deleteRoom);
router.patch("/:id/status", updateStatus);

export default router;