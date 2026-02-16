import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import transactionRoutes from './routes/transactionRoutes.js';
import { connectDB } from './config/database.js';
import { initRedis } from './config/redis.js';
import logger from '../../../shared/utils/logger.js';
import { extractUserFromGateway } from '../../../shared/middleware/extractUser.js';


dotenv.config({ path: '.env.transactionservice' });  // Load environment variables

const app = express();  // Create Express app
const PORT = process.env.PORT || 4007; // Define port
const MONGODB_URI = process.env.MONGODB_URI; // MongoDB connection URI

app.use(cors()); // Enable CORS
app.use(express.json()); // parse JSON request bodies

app.get('/health', (_req, res) => res.json({ ok: true, service: 'transaction-service' })); // Health check endpoint

// extract user info from gateway headers (applied after health check)
app.use(extractUserFromGateway);

// Register transaction routes
app.use('/transactions', transactionRoutes);

connectDB(MONGODB_URI).then(async () => {
    await initRedis();
    app.listen(PORT, () => {
        logger.info(`transaction-service on :${PORT}`);
    });  // Start server    
}).catch((err) => {
    logger.error('Failed to start transaction-service:', err.message);
    process.exit(1);
});  // Handle errors