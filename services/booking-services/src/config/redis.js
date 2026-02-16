import { createClient } from 'redis';
import dotenv from 'dotenv';
import logger from '../../../../shared/utils/logger.js';

dotenv.config({ path: '.env.bookingservice' });

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

let redisClient = null;

export const initRedis = async () => {
    try {
        redisClient = createClient({ url: redisUrl });

        redisClient.on('error', (err) => logger.error('Redis Client Error', err));
        redisClient.on('connect', () => logger.info('✓ Redis connected'));
        redisClient.on('disconnect', () => logger.info('Redis disconnected'));

        await redisClient.connect();
        logger.info('Redis initialized successfully');
        return redisClient;
    } catch (error) {
        logger.error('Failed to initialize Redis:', error.message);
        logger.warn('⚠ Running without Redis caching');
        return null;
    }
};

export const getRedisClient = () => {
    return redisClient;
};

export const closeRedis = async () => {
    if (redisClient) {
        await redisClient.quit();
    }
};
