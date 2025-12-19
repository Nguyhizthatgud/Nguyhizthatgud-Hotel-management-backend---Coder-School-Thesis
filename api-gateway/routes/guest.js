// api-gateway/routes/guest.js
const express = require("express");
const ServiceClient = require("../../shared/utils/serviceClient");
const logger = require("../../shared/utils/logger");
const { authMiddleware, requireRole } = require("../../shared/middleware/auth");
const services = require("../config/services");

const router = express.Router();
const guestService = new ServiceClient(services.guest.url);

/**
 * GET /api/guests
 * List all guests (admin/manager/receptionist only)
 */
router.get("/", authMiddleware, requireRole(["admin", "manager", "receptionist"]), async (req, res, next) => {
    try {
        const response = await guestService.get("/", {
            params: req.query,
            headers: { Authorization: req.headers.authorization }
        });
        res.status(response.status).json(response.data);
    } catch (error) {
        logger.error("Fetch guests failed", { error: error.message });
        next(error);
    }
});

/**
 * GET /api/guests/:id
 * Get guest details (protected)
 */
router.get("/:id", authMiddleware, async (req, res, next) => {
    try {
        const response = await guestService.get(`/${req.params.id}`, {
            headers: { Authorization: req.headers.authorization }
        });
        res.status(response.status).json(response.data);
    } catch (error) {
        logger.error("Fetch guest failed", { error: error.message, guestId: req.params.id });
        next(error);
    }
});

/**
 * POST /api/guests
 * Register new guest (protected)
 */
router.post("/", authMiddleware, async (req, res, next) => {
    try {
        const response = await guestService.post("/", req.body, {
            headers: { Authorization: req.headers.authorization }
        });
        logger.info("Guest registered", { guestId: response.data.data?.id });
        res.status(response.status).json(response.data);
    } catch (error) {
        logger.error("Register guest failed", { error: error.message });
        next(error);
    }
});

/**
 * PUT /api/guests/:id
 * Update guest info (protected)
 */
router.put("/:id", authMiddleware, async (req, res, next) => {
    try {
        const response = await guestService.put(`/${req.params.id}`, req.body, {
            headers: { Authorization: req.headers.authorization }
        });
        logger.info("Guest updated", { guestId: req.params.id });
        res.status(response.status).json(response.data);
    } catch (error) {
        logger.error("Update guest failed", { error: error.message, guestId: req.params.id });
        next(error);
    }
});

module.exports = router;
