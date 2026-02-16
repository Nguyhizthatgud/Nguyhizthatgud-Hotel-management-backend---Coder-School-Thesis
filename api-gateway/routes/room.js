// api-gateway/routes/room.js
import express from "express";
import ServiceClient from "../../shared/utils/serviceClient.js";
import logger from "../../shared/utils/logger.js";
import services from "../config/services.js";

const router = express.Router();
const roomService = new ServiceClient(services.room.url);

/**
 * GET /api/rooms
 * List all rooms (public)
 */
router.get("/", async (req, res, next) => {
    try {
        const response = await roomService.get("/api/rooms", {
            params: req.query,
            headers: {
                "x-user-id": req.headers["x-user-id"],
                "x-user-email": req.headers["x-user-email"],
                "x-user-token": req.headers["x-user-token"]
            }
        });
        res.status(response.status).json(response.data);
    } catch (error) {
        logger.error("Fetch rooms failed", { error: error.message });
        next(error);
    }
});

/**
 * GET /api/rooms/:id
 * Get room details (public)
 */
router.get("/:id", async (req, res, next) => {
    try {
        const response = await roomService.get(`/api/rooms/${req.params.id}`, {
            headers: {
                "x-user-id": req.headers["x-user-id"],
                "x-user-email": req.headers["x-user-email"],
                "x-user-token": req.headers["x-user-token"]
            }
        });
        res.status(response.status).json(response.data);
    } catch (error) {
        logger.error("Fetch room failed", { error: error.message, roomId: req.params.id });
        next(error);
    }
});

/**
 * POST /api/rooms
 * Create new room (admin/manager only)
 */
router.post("/", async (req, res, next) => {
    try {
        const response = await roomService.post("/api/rooms", req.body, {
            headers: {
                "x-user-id": req.headers["x-user-id"],
                "x-user-email": req.headers["x-user-email"],
                "x-user-token": req.headers["x-user-token"]
            }
        });
        logger.info("Room created", { createdBy: req.user.id });
        res.status(response.status).json(response.data);
    } catch (error) {
        logger.error("Create room failed", { error: error.message });
        next(error);
    }
});

/**
 * PUT /api/rooms/:id
 * Update room (admin/manager only)
 */
router.put("/:id", async (req, res, next) => {
    try {
        const response = await roomService.put(`/api/rooms/${req.params.id}`, req.body, {
            headers: {
                "x-user-id": req.headers["x-user-id"],
                "x-user-email": req.headers["x-user-email"],
                "x-user-token": req.headers["x-user-token"]
            }
        });
        logger.info("Room updated", { roomId: req.params.id, updatedBy: req.user.id });
        res.status(response.status).json(response.data);
    } catch (error) {
        logger.error("Update room failed", { error: error.message, roomId: req.params.id });
        next(error);
    }
});

/**
 * DELETE /api/rooms/:id
 * Delete room (admin only)
 */
router.delete("/:id", async (req, res, next) => {
    try {
        const response = await roomService.delete(`/api/rooms/${req.params.id}`, {
            headers: {
                "x-user-id": req.headers["x-user-id"],
                "x-user-email": req.headers["x-user-email"],
                "x-user-token": req.headers["x-user-token"]
            }
        });
        logger.info("Room deleted", { roomId: req.params.id, deletedBy: req.user.id });
        res.status(response.status).json(response.data);
    } catch (error) {
        logger.error("Delete room failed", { error: error.message, roomId: req.params.id });
        next(error);
    }
});

export default router;
