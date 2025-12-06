import admin from "firebase-admin";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const jsonPath = path.join(__dirname, "serviceAccountKey.json");

let credentials;
if (fs.existsSync(jsonPath)) {
    credentials = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
}

admin.initializeApp({
    credential: credentials
        ? admin.credential.cert(credentials)
        : admin.credential.applicationDefault(),
});

export const auth = admin.auth();
export const db = admin.firestore();
export default admin;