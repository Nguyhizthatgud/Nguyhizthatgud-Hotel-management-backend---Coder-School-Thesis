// api-gateway/routes/room.js
const express = require("express");
const ServiceClient = require("../../shared/utils/serviceClient");
const logger = require("../../shared/utils/logger");
const { authMiddleware, requireRole } = require("../../shared/middleware/auth");
const services = require("../config/services");

const router = express.Router();
const roomService = new ServiceClient(services.room.url);

/**
 * GET /api/rooms
 * List all rooms (public)
 */
router.get("/", async (req, res, next) => {
    try {
        const response = await roomService.get("/", { params: req.query });
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
        const response = await roomService.get(`/${req.params.id}`);
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
router.post("/", authMiddleware, requireRole(["admin", "manager"]), async (req, res, next) => {
    try {
        const response = await roomService.post("/", req.body, {
            headers: { Authorization: req.headers.authorization }
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
router.put("/:id", authMiddleware, requireRole(["admin", "manager"]), async (req, res, next) => {
    try {
        const response = await roomService.put(`/${req.params.id}`, req.body, {
            headers: { Authorization: req.headers.authorization }
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
router.delete("/:id", authMiddleware, requireRole(["admin"]), async (req, res, next) => {
    try {
        const response = await roomService.delete(`/${req.params.id}`, {
            headers: { Authorization: req.headers.authorization }
        });
        logger.info("Room deleted", { roomId: req.params.id, deletedBy: req.user.id });
        res.status(response.status).json(response.data);
    } catch (error) {
        logger.error("Delete room failed", { error: error.message, roomId: req.params.id });
        next(error);
    }
});

module.exports = router;
