// shared/middleware/errorHandler.js
import logger from "../utils/logger.js";

const errorHandler = (err, req, res, next) => {
    logger.error("An error occurred", {
        error: err.message,
        stack: err.stack,
        requestId: req.id,
        path: req.path
    });

    const status = err.status || 500;
    const code = err.code || "INTERNAL_SERVER_ERROR";
    const message = err.message || "An unexpected error occurred";

    res.status(status).json({
        success: false,
        error: {
            code,
            message
        },
        timestamp: new Date().toISOString()
    });
};

export default errorHandler;
