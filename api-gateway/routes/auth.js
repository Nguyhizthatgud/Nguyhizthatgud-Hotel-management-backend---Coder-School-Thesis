// api-gateway/routes/auth.js
const express = require("express");
const ServiceClient = require("../../shared/utils/serviceClient");
const logger = require("../../shared/utils/logger");
const { authMiddleware } = require("../../shared/middleware/auth");
const services = require("../config/services");

const router = express.Router();
const authService = new ServiceClient(services.auth.url);

/**
 * POST /api/auth/register
 * Register new user (public)
 */
router.post("/register", async (req, res, next) => {
    try {
        const response = await authService.post("/register", req.body);
        logger.info("User registered successfully", { userId: response.data.data?.id });
        res.status(response.status).json(response.data);
    } catch (error) {
        logger.error("Registration failed", { error: error.message });
        next(error);
    }
});

/**
 * POST /api/auth/login
 * User login (public)
 */
router.post("/login", async (req, res, next) => {
    try {
        const response = await authService.post("/login", req.body);
        logger.info("User logged in successfully", { userId: response.data.data?.userId });
        res.status(response.status).json(response.data);
    } catch (error) {
        logger.error("Login failed", { error: error.message });
        next(error);
    }
});

/**
 * POST /api/auth/logout
 * User logout (protected)
 */
router.post("/logout", authMiddleware, async (req, res, next) => {
    try {
        const response = await authService.post("/logout", { userId: req.user.id }, {
            headers: { Authorization: req.headers.authorization }
        });
        logger.info("User logged out", { userId: req.user.id });
        res.status(response.status).json(response.data);
    } catch (error) {
        logger.error("Logout failed", { error: error.message });
        next(error);
    }
});

/**
 * POST /api/auth/refresh
 * Refresh access token (public)
 */
router.post("/refresh", async (req, res, next) => {
    try {
        const response = await authService.post("/refresh", req.body);
        res.status(response.status).json(response.data);
    } catch (error) {
        logger.error("Token refresh failed", { error: error.message });
        next(error);
    }
});

/**
 * GET /api/auth/me
 * Get current user (protected)
 */
router.get("/me", authMiddleware, async (req, res, next) => {
    try {
        const response = await authService.get("/me", {
            headers: { Authorization: req.headers.authorization }
        });
        res.status(response.status).json(response.data);
    } catch (error) {
        logger.error("Get user failed", { error: error.message });
        next(error);
    }
});

module.exports = router;
