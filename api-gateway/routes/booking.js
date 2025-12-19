// api-gateway/routes/booking.js
const express = require("express");
const ServiceClient = require("../../shared/utils/serviceClient");
const logger = require("../../shared/utils/logger");
const { authMiddleware, requireRole } = require("../../shared/middleware/auth");
const services = require("../config/services");

const router = express.Router();
const bookingService = new ServiceClient(services.booking.url);

/**
 * GET /api/bookings
 * List bookings (protected)
 */
router.get("/", authMiddleware, async (req, res, next) => {
    try {
        const response = await bookingService.get("/", {
            params: req.query,
            headers: { Authorization: req.headers.authorization }
        });
        res.status(response.status).json(response.data);
    } catch (error) {
        logger.error("Fetch bookings failed", { error: error.message });
        next(error);
    }
});

/**
 * GET /api/bookings/:id
 * Get booking details (protected)
 */
router.get("/:id", authMiddleware, async (req, res, next) => {
    try {
        const response = await bookingService.get(`/${req.params.id}`, {
            headers: { Authorization: req.headers.authorization }
        });
        res.status(response.status).json(response.data);
    } catch (error) {
        logger.error("Fetch booking failed", { error: error.message, bookingId: req.params.id });
        next(error);
    }
});

/**
 * POST /api/bookings
 * Create new booking (protected)
 */
router.post("/", authMiddleware, async (req, res, next) => {
    try {
        const response = await bookingService.post("/", req.body, {
            headers: { Authorization: req.headers.authorization }
        });
        logger.info("Booking created", { bookingId: response.data.data?.id, userId: req.user.id });
        res.status(response.status).json(response.data);
    } catch (error) {
        logger.error("Create booking failed", { error: error.message });
        next(error);
    }
});

/**
 * PUT /api/bookings/:id
 * Update booking (protected)
 */
router.put("/:id", authMiddleware, async (req, res, next) => {
    try {
        const response = await bookingService.put(`/${req.params.id}`, req.body, {
            headers: { Authorization: req.headers.authorization }
        });
        logger.info("Booking updated", { bookingId: req.params.id, updatedBy: req.user.id });
        res.status(response.status).json(response.data);
    } catch (error) {
        logger.error("Update booking failed", { error: error.message, bookingId: req.params.id });
        next(error);
    }
});

/**
 * POST /api/bookings/:id/cancel
 * Cancel booking (protected)
 */
router.post("/:id/cancel", authMiddleware, async (req, res, next) => {
    try {
        const response = await bookingService.post(`/${req.params.id}/cancel`, req.body, {
            headers: { Authorization: req.headers.authorization }
        });
        logger.info("Booking cancelled", { bookingId: req.params.id, cancelledBy: req.user.id });
        res.status(response.status).json(response.data);
    } catch (error) {
        logger.error("Cancel booking failed", { error: error.message, bookingId: req.params.id });
        next(error);
    }
});

module.exports = router;
