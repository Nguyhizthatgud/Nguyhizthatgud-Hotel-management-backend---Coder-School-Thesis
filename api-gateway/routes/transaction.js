// api-gateway/routes/transaction.js
import express from "express";
import ServiceClient from "../../shared/utils/serviceClient.js";
import logger from "../../shared/utils/logger.js";
import services from "../config/services.js";

const router = express.Router();
const transactionService = new ServiceClient(services.transaction.url);

/**
 * GET /api/transactions
 * List transactions (admin/manager only)
 */
router.get("/", async (req, res, next) => {
    try {
        const response = await transactionService.get("/transactions", {
            params: req.query,
            headers: {
                Authorization: req.headers.authorization,
                "x-user-id": req.headers["x-user-id"],
                "x-user-email": req.headers["x-user-email"],
                "x-user-token": req.headers["x-user-token"]
            }
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
router.get("/:id", async (req, res, next) => {
    try {
        const response = await transactionService.get(`/transactions/${req.params.id}`, {
            headers: {
                Authorization: req.headers.authorization,
                "x-user-id": req.headers["x-user-id"],
                "x-user-email": req.headers["x-user-email"],
                "x-user-token": req.headers["x-user-token"]
            }
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
router.post("/", async (req, res, next) => {
    try {
        const response = await transactionService.post("/transactions", req.body, {
            headers: {
                Authorization: req.headers.authorization,
                "x-user-id": req.headers["x-user-id"],
                "x-user-email": req.headers["x-user-email"],
                "x-user-token": req.headers["x-user-token"]
            }
        });
        logger.info("Transaction created", { transactionId: response.data.data?.id, userId: req.user?.uid });
        res.status(response.status).json(response.data);
    } catch (error) {
        logger.error("Create transaction failed", { error: error.message });
        next(error);
    }
});

export default router;
