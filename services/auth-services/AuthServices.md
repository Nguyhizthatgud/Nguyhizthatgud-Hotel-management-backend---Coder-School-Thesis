**STEP1: SETUP**

- npm init -y
- npm install express cors dotenv firebase-admin
- npm install -D nodemon

**STEP2: CREATE FILES - Add your Firebase Admin service account**

- In Firebase Console → Project Settings → Service accounts → Generate new private key.
- Save JSON to services/auth-service/credentials/firebase-service-account.json.
- Keep this file secret.

**Step 3: Service files**

- package.json

```
{
  "name": "auth-service",
  "version": "1.0.0",
  "type": "commonjs",
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^17.2.3",
    "express": "^5.1.0",
    "firebase-admin": "^12.6.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.0"
  }
}
```

- .env.authserver

```
PORT=4001
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com
FIREBASE_SERVICE_ACCOUNT_PATH=./credentials/firebase-service-account.json
```

- config/database.js

```
const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "./credentials/firebase-service-account.json";
const serviceAccount = JSON.parse(fs.readFileSync(path.resolve(serviceAccountPath), "utf8"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
}

const auth = admin.auth();
const db = admin.firestore();

module.exports = { admin, auth, db };
```

- routes/authRoutes.js

```
const { auth } = require("../firebase");

// Verify Firebase ID token from Authorization: Bearer <idToken>
async function authenticateToken(req, res, next) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
  const idToken = header.split(" ")[1];
  try {
    const decoded = await auth.verifyIdToken(idToken);
    req.userId = decoded.uid;
    req.userEmail = decoded.email;
    req.userRole = decoded.role || "guest"; // optional custom claims
    next();
  } catch (e) {
    return res.status(403).json({ error: "Invalid token" });
  }
}

module.exports = { authenticateToken };
```

- controllers/authController.js

```
const express = require("express");
const router = express.Router();
const { auth, db } = require("../firebase");
const { authenticateToken } = require("../middleware/auth");

// Register via Admin SDK (email/password)
router.post("/register", async (req, res) => {
  try {
    const { email, password, username, role = "guest" } = req.body;
    if (!email || !password || !username) return res.status(400).json({ error: "Missing fields" });

    const userRecord = await auth.createUser({ email, password, displayName: username });
    // Optional: set custom claims (role)
    await auth.setCustomUserClaims(userRecord.uid, { role });

    // Store extra profile in Firestore
    await db.collection("users").doc(userRecord.uid).set({
      username,
      email,
      role,
      createdAt: new Date().toISOString()
    });

    return res.status(201).json({ uid: userRecord.uid });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// Login is usually done from frontend using Firebase Web SDK to obtain ID token.
// As a backend, you can only verify tokens. For convenience, expose /verify.
router.post("/verify", async (req, res) => {
  try {
    // token must be in Authorization header
    const header = req.headers.authorization || "";
    if (!header.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
    const idToken = header.split(" ")[1];

    const decoded = await auth.verifyIdToken(idToken);
    return res.json({
      valid: true,
      user: { userId: decoded.uid, email: decoded.email, role: decoded.role || "guest" }
    });
  } catch (e) {
    return res.status(403).json({ error: "Invalid token" });
  }
});

// Get profile from Firestore (protected)
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const doc = await db.collection("users").doc(req.userId).get();
    if (!doc.exists) return res.status(404).json({ error: "Profile not found" });
    return res.json({ uid: req.userId, ...doc.data() });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

module.exports = router;
```

- src/server.js

```
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 4001;

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);

app.get("/health", (_req, res) => res.json({ ok: true, service: "auth-service" }));

app.listen(PORT, () => console.log(`auth-service listening on ${PORT}`));
```

**Step 4: Update hotel-service to use Firebase token verification via auth-service**

```
const axios = require("axios");
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://localhost:4001";

exports.authenticateToken = async (req, res, next) => {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });

  try {
    const { data } = await axios.post(`${AUTH_SERVICE_URL}/auth/verify`, {}, { headers: { Authorization: header } });
    if (!data.valid) return res.status(403).json({ error: "Invalid token" });
    req.userId = data.user.userId;
    req.userEmail = data.user.email;
    req.userRole = data.user.role;
    next();
  } catch {
    return res.status(403).json({ error: "Invalid token" });
  }
};
```

**Step 5: Docker Compose (auth-service only; add hotel-service as before)**

```
version: "3.9"
services:
  auth-service:
    build: ./services/auth-service
    environment:
      - PORT=4001
      - FIREBASE_DATABASE_URL=${FIREBASE_DATABASE_URL}
      - FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID}
      - FIREBASE_SERVICE_ACCOUNT_PATH=/app/credentials/firebase-service-account.json
    volumes:
      - ./services/auth-service/credentials/firebase-service-account.json:/app/credentials/firebase-service-account.json:ro
    ports:
      - "4001:4001"

  hotel-service:
    build: ./services/hotel-service
    environment:
      - PORT=4002
      - AUTH_SERVICE_URL=http://auth-service:4001
      - MONGO_URI_HOTEL=mongodb://mongo-hotel:27017/hotel
    depends_on:
      - auth-service
      - mongo-hotel
    ports:
      - "4002:4002"

  mongo-hotel:
    image: mongo:7
    ports:
      - "27018:27017"
```

**Step 6: Frontend login flow (Firebase Web SDK)**

- On Next.js, use Firebase client SDK to sign in and get ID token.
- Send Authorization: Bearer <idToken> to hotel-service endpoints.

example for client for snipet:

```
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const app = initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID"
});
const auth = getAuth(app);

export async function login(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const idToken = await cred.user.getIdToken();
  // Use idToken in Authorization header for API calls
  return idToken;
}
```

Notes

- Register: You can register users through auth-service (Admin SDK) or directly on the frontend with Firebase Auth. Pick one and stay consistent.
- Roles: Set custom claims via Admin SDK (auth.setCustomUserClaims) and read them in verifyIdToken for authorization in hotel-service.
- Firestore structure: users/{uid} docs store profile fields; avoid storing passwords (Firebase Auth manages that).
- Security: Never expose the service account JSON publicly; mount it as a read-only volume in Docker and use env for paths.

**Questions?** Reach out!

- You still need backend-side auth handling because Firebase Auth only issues and validates ID tokens; it does not enforce your microservice’s business rules automatically.
  Why a backend auth layer with Firebase:

  1. Token verification: Each microservice must verify incoming Firebase ID tokens server-side (never trust client).

  2. Role / permissions: Add and interpret custom claims (e.g. admin, owner) before executing protected operations.

  3. Central gateway: Other services (hotel-service, booking-service) call /auth/verify instead of embedding Firebase logic everywhere.

  4. Secure server-only actions: Admin SDK operations (e.g. creating users with roles, generating reset links) must stay off the client.

  5. Auditing & policy: Log access, throttle,
     rate-limit, enforce IP rules—Firebase alone doesn’t do that.

  6. Aggregation: Combine Firebase identity with your own databases (Mongo, Redis) in controlled server code.
     Future portability: Abstracting auth lets you swap providers later without rewriting all services.\*
