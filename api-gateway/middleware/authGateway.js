// api-gateway/middleware/authGateway.js
// This middleware validates Firebase tokens and adds user info to request headers
// Microservices will read from these headers instead of validating themselves

import admin from "firebase-admin";
import logger from "../../shared/utils/logger.js";

export const validateAndInjectUser = async (req, res, next) => {
    // Skip auth for public routes
    const publicRoutes = ["/api/auth/login", "/api/auth/register", "/health"];
    if (publicRoutes.includes(req.path)) {
        return next();
    }

    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        logger.warn("Request blocked: No authentication token", { requestId: req.id, path: req.path });
        return res.status(401).json({
            success: false,
            error: {
                code: "UNAUTHENTICATED",
                message: "Authentication token is required"
            }
        });
    }

    try {
        // Verify Firebase token
        const decodedToken = await admin.auth().verifyIdToken(token);

        // Extract user info
        const userId = decodedToken.uid;
        const userEmail = decodedToken.email;

        // Add user info to request headers for microservices to read
        req.headers["x-user-id"] = userId;
        req.headers["x-user-email"] = userEmail;
        req.headers["x-user-token"] = token; // Pass token in case service needs to call another service

        // Store on req object for gateway use
        req.user = decodedToken;

        logger.info("User validated at gateway", {
            userId,
            userEmail,
            requestId: req.id,
            path: req.path
        });

        next();
    } catch (error) {
        logger.error("Firebase validation failed at gateway", {
            error: error.message,
            requestId: req.id
        });

        let message = "Invalid or expired token";
        if (error.code === "auth/id-token-expired") {
            message = "Token has expired";
        } else if (error.code === "auth/argument-error") {
            message = "Invalid token format";
        }

        return res.status(401).json({
            success: false,
            error: {
                code: "UNAUTHENTICATED",
                message
            }
        });
    }
};
