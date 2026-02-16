// api-gateway/routes/booking.js
import express from "express";
import ServiceClient from "../../shared/utils/serviceClient.js";
import logger from "../../shared/utils/logger.js";
import services from "../config/services.js";

const router = express.Router();
const bookingService = new ServiceClient(services.booking.url);

/**
 * GET /api/bookings
 * List bookings (protected)
 */
router.get("/", async (req, res, next) => {
    try {
        const response = await bookingService.get("/api/bookings", {
            params: req.query,
            headers: {
                "x-user-id": req.headers["x-user-id"],
                "x-user-email": req.headers["x-user-email"],
                "x-user-token": req.headers["x-user-token"]
            }
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
router.get("/:id", async (req, res, next) => {
    try {
        const response = await bookingService.get(`/api/bookings/${req.params.id}`, {
            headers: {
                "x-user-id": req.headers["x-user-id"],
                "x-user-email": req.headers["x-user-email"],
                "x-user-token": req.headers["x-user-token"]
            }
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
router.post("/", async (req, res, next) => {
    try {
        const response = await bookingService.post("/api/bookings", req.body, {
            headers: {
                "x-user-id": req.headers["x-user-id"],
                "x-user-email": req.headers["x-user-email"],
                "x-user-token": req.headers["x-user-token"]
            }
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
router.put("/:id", async (req, res, next) => {
    try {
        const response = await bookingService.put(`/api/bookings/${req.params.id}`, req.body, {
            headers: {
                "x-user-id": req.headers["x-user-id"],
                "x-user-email": req.headers["x-user-email"],
                "x-user-token": req.headers["x-user-token"]
            }
        });
        logger.info("Booking updated", { bookingId: req.params.id, updatedBy: req.user.id });
        res.status(response.status).json(response.data);
    } catch (error) {
        logger.error("Update booking failed", { error: error.message, bookingId: req.params.id });
        next(error);
    }
});

/**
 * PATCH /api/bookings/:id
 * Partial update booking (protected)
 */
router.patch("/:id", async (req, res, next) => {
    try {
        const response = await bookingService.patch(`/api/bookings/${req.params.id}`, req.body, {
            headers: {
                "x-user-id": req.headers["x-user-id"],
                "x-user-email": req.headers["x-user-email"],
                "x-user-token": req.headers["x-user-token"]
            }
        });
        logger.info("Booking updated", { bookingId: req.params.id, updatedBy: req.user?.id });
        res.status(response.status).json(response.data);
    } catch (error) {
        logger.error("Update booking failed", { error: error.message, bookingId: req.params.id });
        next(error);
    }
});

/**
 * PATCH /api/bookings/:id/confirm
 * Confirm booking (protected)
 */
router.patch("/:id/confirm", async (req, res, next) => {
    try {
        const response = await bookingService.patch(`/api/bookings/${req.params.id}/confirm`, req.body, {
            headers: {
                "x-user-id": req.headers["x-user-id"],
                "x-user-email": req.headers["x-user-email"],
                "x-user-token": req.headers["x-user-token"]
            }
        });
        logger.info("Booking confirmed", { bookingId: req.params.id, confirmedBy: req.user?.id });
        res.status(response.status).json(response.data);
    } catch (error) {
        logger.error("Confirm booking failed", { error: error.message, bookingId: req.params.id });
        next(error);
    }
});

//POST /api/bookings/:id/cancel - Cancel booking (protected)
router.post("/:id/cancel", async (req, res, next) => {
    try {
        const response = await bookingService.post(`/api/bookings/${req.params.id}/cancel`, req.body, {
            headers: {
                "x-user-id": req.headers["x-user-id"],
                "x-user-email": req.headers["x-user-email"],
                "x-user-token": req.headers["x-user-token"]
            }
        });
        logger.info("Booking cancelled", { bookingId: req.params.id, cancelledBy: req.user.id });
        res.status(response.status).json(response.data);
    } catch (error) {
        logger.error("Cancel booking failed", { error: error.message, bookingId: req.params.id });
        next(error);
    }
});

/**
 * DELETE /api/bookings/:id
 * Delete booking (protected)
 */
router.delete("/:id", async (req, res, next) => {
    try {
        logger.info("Delete booking request", {
            bookingId: req.params.id,
            headers: {
                "x-user-id": req.headers["x-user-id"],
                "x-user-email": req.headers["x-user-email"]
            }
        });

        const response = await bookingService.delete(`/api/bookings/${req.params.id}`, {
            headers: {
                "x-user-id": req.headers["x-user-id"],
                "x-user-email": req.headers["x-user-email"],
                "x-user-token": req.headers["x-user-token"]
            }
        });
        logger.info("Booking deleted", { bookingId: req.params.id, deletedBy: req.user?.id });
        res.status(response.status).json(response.data);
    } catch (error) {
        logger.error("Delete booking failed", { error: error.message, bookingId: req.params.id });
        next(error);
    }
});

export default router;
