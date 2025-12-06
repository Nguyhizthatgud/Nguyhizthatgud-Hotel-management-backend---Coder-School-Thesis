import { auth, db } from "../config/database.js";

export async function register(req, res) {
    try {
        const { email, password, username, role = "guest" } = req.body;
        if (!email || !password || !username) {
            return res.status(400).json({ error: "Email, password, and username are required" });
        }

        const userRecord = await auth.createUser({ email, password, displayName: username });
        await auth.setCustomUserClaims(userRecord.uid, { role });

        await db.collection("users").doc(userRecord.uid).set({
            uid: userRecord.uid,
            email,
            username,
            role,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        res.status(201).json({
            message: "User registered successfully",
            user: { uid: userRecord.uid, email: userRecord.email, username, role },
        });
    } catch (error) {
        console.error("Registration error:", error);
        if (error.code === "auth/email-already-exists") {
            return res.status(400).json({ error: "Email already in use" });
        }
        res.status(500).json({ error: "Registration failed" });
    }
}

export async function verifyToken(req, res) {
    try {
        const header = req.headers.authorization;
        if (!header?.startsWith("Bearer ")) {
            return res.status(401).json({ error: "No token provided" });
        }
        const token = header.slice(7);
        const decoded = await auth.verifyIdToken(token);
        const doc = await db.collection("users").doc(decoded.uid).get();

        if (!doc.exists) {
            return res.status(404).json({ error: "User profile not found" });
        }

        res.json({ message: "Token valid", user: doc.data() });
    } catch (error) {
        console.error("Verification error:", error);
        res.status(500).json({ error: "Verification failed" });
    }
}

export async function resetPassword(req, res) {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: "Email required" });
        }

        const link = await auth.generatePasswordResetLink(email);
        res.json({ message: "Password reset link generated", link });
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ error: "Failed to reset password" });
    }
}

export async function getProfile(req, res) {
    try {
        const doc = await db.collection("users").doc(req.user.uid).get();
        if (!doc.exists) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(doc.data());
    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({ error: "Failed to get profile" });
    }
}

export async function updateProfile(req, res) {
    try {
        const { username, phone, address } = req.body;
        const updates = { updatedAt: new Date().toISOString() };

        if (username) updates.username = username;
        if (phone) updates.phone = phone;
        if (address) updates.address = address;

        await db.collection("users").doc(req.user.uid).update(updates);

        if (username) {
            await auth.updateUser(req.user.uid, { displayName: username });
        }

        res.json({ message: "Profile updated successfully", updates });
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ error: "Failed to update profile" });
    }
}

export async function deleteAccount(req, res) {
    try {
        const uid = req.user.uid;

        // Delete from Firebase Auth
        await auth.deleteUser(uid);

        // Delete from Firestore
        await db.collection("users").doc(uid).delete();

        res.json({ message: "Account deleted successfully" });
    } catch (error) {
        console.error("Delete account error:", error);
        res.status(500).json({ error: "Failed to delete account" });
    }
}