// shared/middleware/extractUser.js
// Microservices use this to read user info passed by API Gateway
// No Firebase validation needed here - trust the gateway

import logger from "../utils/logger.js";

export const extractUserFromGateway = (req, res, next) => {
    const userId = req.headers["x-user-id"];
    const userEmail = req.headers["x-user-email"];
    const userToken = req.headers["x-user-token"];

    if (!userId) {
        logger.warn("Request missing user headers from gateway", {
            requestId: req.id,
            path: req.path
        });
        return res.status(401).json({
            success: false,
            error: {
                code: "UNAUTHENTICATED",
                message: "User not authenticated (gateway validation failed)"
            }
        });
    }

    // Attach user info to request object
    req.user = {
        uid: userId,
        email: userEmail,
        token: userToken
    };

    logger.info("User context extracted from gateway headers", {
        userId,
        userEmail,
        requestId: req.id
    });

    next();
};
