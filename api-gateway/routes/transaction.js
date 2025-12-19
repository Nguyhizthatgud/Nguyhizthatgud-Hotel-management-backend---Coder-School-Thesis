// api-gateway/routes/transaction.js
const express = require("express");
const ServiceClient = require("../../shared/utils/serviceClient");
const logger = require("../../shared/utils/logger");
const { authMiddleware, requireRole } = require("../../shared/middleware/auth");
const services = require("../config/services");

const router = express.Router();
const transactionService = new ServiceClient(services.transaction.url);

/**
 * GET /api/transactions
 * List transactions (admin/manager only)
 */
router.get("/", authMiddleware, requireRole(["admin", "manager"]), async (req, res, next) => {
    try {
        const response = await transactionService.get("/", {
            params: req.query,
            headers: { Authorization: req.headers.authorization }
        });
        res.status(response.status).json(response.data);
    } catch (error) {
        logger.error("Fetch transactions failed", { error: error.message });
        next(error);
    }
});

/**
 * GET /api/transactions/:id
 * Get transaction details (protected)
 */
router.get("/:id", authMiddleware, async (req, res, next) => {
    try {
        const response = await transactionService.get(`/${req.params.id}`, {
            headers: { Authorization: req.headers.authorization }
        });
        res.status(response.status).json(response.data);
    } catch (error) {
        logger.error("Fetch transaction failed", { error: error.message, transactionId: req.params.id });
        next(error);
    }
});

/**
 * POST /api/transactions
 * Create new transaction (protected)
 */
router.post("/", authMiddleware, async (req, res, next) => {
    try {
        const response = await transactionService.post("/", req.body, {
            headers: { Authorization: req.headers.authorization }
        });
        logger.info("Transaction created", { transactionId: response.data.data?.id, userId: req.user.id });
        res.status(response.status).json(response.data);
    } catch (error) {
        logger.error("Create transaction failed", { error: error.message });
        next(error);
    }
});

module.exports = router;
