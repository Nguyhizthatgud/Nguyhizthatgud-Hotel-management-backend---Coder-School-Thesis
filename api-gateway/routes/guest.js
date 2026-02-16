// api-gateway/routes/guest.js
import express from "express";
import ServiceClient from "../../shared/utils/serviceClient.js";
import logger from "../../shared/utils/logger.js";
import services from "../config/services.js";

const router = express.Router();
const guestService = new ServiceClient(services.guest.url);

/**
 * GET /api/guests
 * List all guests (admin/manager/receptionist only)
 */
router.get("/", async (req, res, next) => {
    try {
        const response = await guestService.get("/guests", {
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
router.get("/:id", async (req, res, next) => {
    try {
        const response = await guestService.get(`/guests/${req.params.id}`, {
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
router.post("/", async (req, res, next) => {
    try {
        const response = await guestService.post("/guests", req.body, {
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
router.put("/:id", async (req, res, next) => {
    try {
        const response = await guestService.put(`/guests/${req.params.id}`, req.body, {
            headers: { Authorization: req.headers.authorization }
        });
        logger.info("Guest updated", { guestId: req.params.id });
        res.status(response.status).json(response.data);
    } catch (error) {
        logger.error("Update guest failed", { error: error.message, guestId: req.params.id });
        next(error);
    }
});

export default router;
