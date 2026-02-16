import ServiceClient from "../utils/serviceClient.js";
import logger from "../utils/logger.js";

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://localhost:4002";
const authService = new ServiceClient(AUTH_SERVICE_URL);

export const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                error: { code: "UNAUTHENTICATED", message: "Missing or invalid Authorization header" }
            });
        }

        const response = await authService.get("/me", { headers: { Authorization: authHeader } });
        const userData = response?.data?.data || response?.data?.user || {};

        const userId = userData.id || userData.uid || userData.userId;
        const userEmail = userData.email || userData.userEmail;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: { code: "UNAUTHENTICATED", message: "Invalid token or user not found" }
            });
        }

        req.user = { id: userId, email: userEmail };

        req.headers["x-user-id"] = userId;
        req.headers["x-user-email"] = userEmail || "";
        req.headers["x-user-token"] = authHeader.replace("Bearer ", "");

        logger.info("Authenticated request", { userId, path: req.path });
        return next();
    } catch (error) {
        logger.error("Authentication failed", { error: error.message });
        return res.status(error.status || 401).json({
            success: false,
            error: { code: error.code || "UNAUTHENTICATED", message: error.message || "Authentication failed" }
        });
    }
};
