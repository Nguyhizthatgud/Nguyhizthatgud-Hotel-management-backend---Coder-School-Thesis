
// normalize req.user for downstream handlers.
export const requireGatewayUser = (req, res, next) => {
    const uid = req.headers["x-user-id"] || req.user?.uid;
    const email = req.headers["x-user-email"] || req.user?.email || null;

    if (!uid) {
        return res.status(401).json({ error: "Unauthenticated: missing x-user-id from gateway" });
    }

    req.user = req.user || {};
    req.user.uid = uid;
    req.user.email = email;
    next();
};