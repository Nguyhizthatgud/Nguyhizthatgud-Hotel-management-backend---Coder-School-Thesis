// api-gateway/routes/staff.js
import express from "express";
import ServiceClient from "../../shared/utils/serviceClient.js";
import logger from "../../shared/utils/logger.js";
import services from "../config/services.js";

const router = express.Router();
const staffService = new ServiceClient(services.staff.url);

/**
 * GET /api/staff
 * List staff members (admin/manager only)
 */
router.get("/", async (req, res, next) => {
    try {
        const response = await staffService.get("/staff", {
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
router.get("/:id", async (req, res, next) => {
    try {
        const response = await staffService.get(`/staff/${req.params.id}`, {
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
router.post("/", async (req, res, next) => {
    try {
        const response = await staffService.post("/staff", req.body, {
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
router.put("/:id", async (req, res, next) => {
    try {
        const response = await staffService.put(`/staff/${req.params.id}`, req.body, {
            headers: { Authorization: req.headers.authorization }
        });
        logger.info("Staff updated", { staffId: req.params.id, updatedBy: req.user.id });
        res.status(response.status).json(response.data);
    } catch (error) {
        logger.error("Update staff failed", { error: error.message, staffId: req.params.id });
        next(error);
    }
});

export default router;
