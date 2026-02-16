// Gateway already validated Firebase. We just trust headers and shape req.user.
export function requireGatewayUser(req, res, next) {
    const uid = req.headers["x-user-id"] || req.user?.uid;
    const email = req.headers["x-user-email"] || req.user?.email || null;

    if (!uid) {
        return res.status(401).json({ error: "Unauthenticated: missing x-user-id from gateway" });
    }

    req.user = req.user || {};
    req.user.uid = uid;
    req.user.email = email;
    req.user.role = req.user.role || "owner";
    next();
}

// Scope queries to the authenticated owner
export function scopeToOwner(req, res, next) {
    if (!req.user?.uid) {
        return res.status(401).json({ error: "Authentication required" });
    }

    req.ownerFilter = { ownerId: req.user.uid };
    next();
}
