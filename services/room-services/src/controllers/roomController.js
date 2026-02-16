import { Room } from "../models/Room.js";
import { getRedisClient } from "../config/redis.js";

// Helper to generate cache key
const getCacheKey = (ownerId, filters = {}) => {
    const filterStr = JSON.stringify(filters).replace(/[^a-zA-Z0-9]/g, "");
    return `rooms:${ownerId}:${filterStr || "all"}`;
};

// Helper to invalidate cache for a user
const invalidateUserCache = async (ownerId) => {
    const redis = getRedisClient();
    if (!redis) return;

    try {
        const keys = await redis.keys(`rooms:${ownerId}:*`);
        if (keys.length > 0) {
            await redis.del(keys);
        }
    } catch (err) {
        console.error("Cache invalidation error:", err.message);
    }
};

export const createRoom = async (req, res) => {
    try {
        // always set ownerId from authenticated user
        const roomData = {
            ...req.body,
            ownerId: req.user.uid
        };
        const room = await Room.create(roomData);

        // Invalidate cache after creating room
        await invalidateUserCache(req.user.uid);

        res.status(201).json(room);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const listRooms = async (req, res) => {
    try {
        const redis = getRedisClient();

        // Start with owner filter
        const filter = { ...req.ownerFilter };

        // Add additional filters
        if (req.query.status) filter.status = req.query.status;
        if (req.query.floor) filter.floor = parseInt(req.query.floor);

        const cacheKey = getCacheKey(req.user.uid, { status: req.query.status, floor: req.query.floor });

        // Try to get from cache first
        if (redis) {
            try {
                const cachedRooms = await redis.get(cacheKey);
                if (cachedRooms) {
                    console.log(`✓ Cache HIT: ${cacheKey}`);
                    return res.json(JSON.parse(cachedRooms));
                }
            } catch (cacheErr) {
                console.warn("Cache read error:", cacheErr.message);
            }
        }

        // Query database if not in cache
        console.log(`✗ Cache MISS: ${cacheKey}`);
        const rooms = await Room.find(filter)
            .sort({ roomNumber: 1 })
            .lean()
            .exec();

        // Store in cache for 5 minutes (300 seconds)
        if (redis) {
            try {
                await redis.setEx(cacheKey, 300, JSON.stringify(rooms));
            } catch (cacheErr) {
                console.warn("Cache write error:", cacheErr.message);
            }
        }

        res.json(rooms);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getRoom = async (req, res) => {
    try {
        // Only find room if it belongs to the authenticated owner
        const room = await Room.findOne({
            _id: req.params.id,
            ...req.ownerFilter
        });

        if (!room) {
            return res.status(404).json({ error: "Room not found or access denied" });
        }

        res.json(room);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateStatus = async (req, res) => {
    try {
        // Update all provided fields from request body
        const updateData = req.body;

        // Only update if room belongs to owner
        const room = await Room.findOneAndUpdate(
            { _id: req.params.id, ...req.ownerFilter },
            updateData,
            { new: true }
        );

        if (!room) {
            return res.status(404).json({ error: "Room not found or access denied" });
        }

        // Invalidate cache after updating room
        await invalidateUserCache(req.user.uid);

        res.json(room);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const deleteRoom = async (req, res) => {
    try {
        // Only delete if room belongs to owner
        const room = await Room.findOneAndDelete({
            _id: req.params.id,
            ...req.ownerFilter
        });
        if (!room) {
            return res.status(404).json({ error: "Room not found or access denied" });
        }

        // Invalidate cache after deleting room
        await invalidateUserCache(req.user.uid);

        res.json({ message: "Room deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
export const summary = async (req, res) => {
    try {

        const filter = req.ownerFilter;

        const result = await Room.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: null,
                    totalRooms: { $sum: 1 },
                    occupiedRooms: {
                        $sum: { $cond: [{ $eq: ["$status", "đang sử dụng"] }, 1, 0] }
                    },
                    maintenanceRooms: {
                        $sum: { $cond: [{ $eq: ["$status", "bảo trì"] }, 1, 0] }
                    },
                    cleaningRooms: {
                        $sum: { $cond: [{ $eq: ["$status", "đang dọn dẹp"] }, 1, 0] }
                    },
                    availableRooms: {
                        $sum: { $cond: [{ $eq: ["$status", "còn trống"] }, 1, 0] }
                    },
                    totalPredictedPrice: { $sum: "$price" }
                }
            }
        ]);

        const summary = result[0] || {
            totalRooms: 0,
            occupiedRooms: 0,
            maintenanceRooms: 0,
            cleaningRooms: 0,
            availableRooms: 0,
            totalPredictedPrice: 0
        };

        res.json(summary);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};