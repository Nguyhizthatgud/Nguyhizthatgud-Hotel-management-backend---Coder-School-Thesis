import { auth } from "../config/database.js";

export function authenticateToken(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No token provided" });
    }
    const token = header.slice(7);

    auth
        .verifyIdToken(token)
        .then((decoded) => {
            req.user = {
                uid: decoded.uid,
                email: decoded.email,
                role:
                    decoded.role ||
                        decoded.claims?.role ||
                        decoded.customClaims?.role ||
                        decoded?.firebase?.sign_in_provider === "anonymous"
                        ? "guest"
                        : "guest",
            };
            next();
        })
        .catch((err) => {
            console.error("verifyIdToken error:", err);
            res.status(401).json({ error: "Invalid token" });
        });
}

export function requireRole(roles = []) {
    return (req, res, next) => {
        const role = req.user?.role;
        if (!role || !roles.includes(role)) {
            return res.status(403).json({ error: "Unauthorized" });
        }
        next();
    };
}