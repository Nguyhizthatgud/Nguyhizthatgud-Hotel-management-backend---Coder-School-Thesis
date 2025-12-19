// api-gateway/routes/staff.js
const express = require("express");
const ServiceClient = require("../../shared/utils/serviceClient");
const logger = require("../../shared/utils/logger");
const { authMiddleware, requireRole } = require("../../shared/middleware/auth");
const services = require("../config/services");

const router = express.Router();
const staffService = new ServiceClient(services.staff.url);

/**
 * GET /api/staff
 * List staff members (admin/manager only)
 */
router.get("/", authMiddleware, requireRole(["admin", "manager"]), async (req, res, next) => {
    try {
        const response = await staffService.get("/", {
            params: req.query,
            headers: { Authorization: req.headers.authorization }
        });
        res.status(response.status).json(response.data);
    } catch (error) {
        logger.error("Fetch staff failed", { error: error.message });
        next(error);
    }
});

/**
 * GET /api/staff/:id
 * Get staff details (admin/manager only)
 */
router.get("/:id", authMiddleware, requireRole(["admin", "manager"]), async (req, res, next) => {
    try {
        const response = await staffService.get(`/${req.params.id}`, {
            headers: { Authorization: req.headers.authorization }
        });
        res.status(response.status).json(response.data);
    } catch (error) {
        logger.error("Fetch staff failed", { error: error.message, staffId: req.params.id });
        next(error);
    }
});

/**
 * POST /api/staff
 * Add new staff (admin/manager only)
 */
router.post("/", authMiddleware, requireRole(["admin", "manager"]), async (req, res, next) => {
    try {
        const response = await staffService.post("/", req.body, {
            headers: { Authorization: req.headers.authorization }
        });
        logger.info("Staff added", { staffId: response.data.data?.id, addedBy: req.user.id });
        res.status(response.status).json(response.data);
    } catch (error) {
        logger.error("Add staff failed", { error: error.message });
        next(error);
    }
});

/**
 * PUT /api/staff/:id
 * Update staff (admin/manager only)
 */
router.put("/:id", authMiddleware, requireRole(["admin", "manager"]), async (req, res, next) => {
    try {
        const response = await staffService.put(`/${req.params.id}`, req.body, {
            headers: { Authorization: req.headers.authorization }
        });
        logger.info("Staff updated", { staffId: req.params.id, updatedBy: req.user.id });
        res.status(response.status).json(response.data);
    } catch (error) {
        logger.error("Update staff failed", { error: error.message, staffId: req.params.id });
        next(error);
    }
});

module.exports = router;
