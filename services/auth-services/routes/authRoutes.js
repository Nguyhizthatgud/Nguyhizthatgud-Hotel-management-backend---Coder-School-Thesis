import express from "express";
import {
    register,
    verifyToken,
    resetPassword,
    getProfile,
    updateProfile,
    deleteAccount,
} from "../controller/authController.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/verify", verifyToken);
router.post("/reset-password", resetPassword);

// lookup username route
router.get("/username/:username", async (req, res) => {
    try {
        const { username } = req.params;

        // query Firestore for user with this username
        const snapshot = await db
            .collection("users")
            .where("username", "==", username)
            .limit(1)
            .get();

        if (snapshot.empty) {
            return res.status(404).json({ error: "User not found" });
        }

        const user = snapshot.docs[0].data();
        res.json({ email: user.email });
    } catch (error) {
        console.error("Lookup username error:", error);
        res.status(500).json({ error: "Failed to lookup user" });
    }
});
// protected routes
router.get("/profile", authenticateToken, getProfile);
router.put("/profile", authenticateToken, updateProfile);
router.delete("/account", authenticateToken, deleteAccount);

// Admin-only example
router.get("/admin/users", authenticateToken, requireRole(["admin"]), (_req, res) => {
    res.json({ message: "Admin access granted" });
});

export default router;