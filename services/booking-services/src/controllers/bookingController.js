import axios from "axios";
import { isValidObjectId } from "mongoose";
import { Booking } from "../models/Booking.js";
import { getNextSequenceValue, formatBookId } from "../utils/idGenerator.js";
import { getRedisClient } from "../config/redis.js";
import logger from "../../../../shared/utils/logger.js";

const ROOM_SERVICE_URL = process.env.ROOM_SERVICE_URL || "http://localhost:4004";

// Helper to generate cache key
const getCacheKey = (type, filter = {}) => {
    const filterStr = JSON.stringify(filter).replace(/[^a-zA-Z0-9]/g, "");
    return `bookings:${type}:${filterStr || "all"}`;
};

// Helper to invalidate cache
const invalidateBookingsCache = async () => {
    const redis = getRedisClient();
    if (!redis) return;

    try {
        const keys = await redis.keys("bookings:*");
        if (keys.length > 0) {
            await redis.del(keys);
        }
    } catch (err) {
        logger.error("Cache invalidation error:", err.message);
    }
};

function nightsBetween(start, end) {
    const ms = new Date(end).setHours(0, 0, 0, 0) - new Date(start).setHours(0, 0, 0, 0);
    return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

async function getRoom(roomId, headers = {}) {
    const res = await axios.get(`${ROOM_SERVICE_URL}/api/rooms/${roomId}`, {
        headers: headers ? headers : {}
    });
    return res.data;
}

async function setRoomStatus(roomId, status, headers = {}) {
    await axios.patch(`${ROOM_SERVICE_URL}/api/rooms/${roomId}/status`, { status }, {
        headers: headers ? headers : {}
    });
}

export async function checkAvailability(roomId, checkInDate, checkOutDate) {
    const overlapping = await Booking.find({
        roomId,
        status: { $in: ["pending", "confirmed", "completed"] },
        $or: [
            { checkInDate: { $lt: checkOutDate }, checkOutDate: { $gt: checkInDate } }
        ]
    }).countDocuments();
    return overlapping === 0;
}

export const createBooking = async (req, res) => {
    try {
        const {
            roomId,
            checkInDate,
            checkOutDate,
            guestsCount = 1,
            notes,
            guestName,
            guestNumber,
            guestEmail,
            guestAdult,
            guestChildren,
            bookingSource,
            paymentMethods,
            description,

        } = req.body;

        const bookingSequence = await getNextSequenceValue("bookId");
        const bookId = formatBookId(bookingSequence);
        if (!roomId || !checkInDate || !checkOutDate) {
            return res.status(400).json({ error: "roomId, checkInDate, checkOutDate are required" });
        }
        if (!guestName || !guestNumber || !guestEmail || !guestAdult) {
            return res.status(400).json({ error: "guestName, guestNumber, guestEmail, guestAdult are required" });
        }
        const start = new Date(checkInDate);
        const end = new Date(checkOutDate);
        if (!(start < end)) return res.status(400).json({ error: "Invalid date range" });

        const available = await checkAvailability(roomId, start, end);
        if (!available) return res.status(409).json({ error: "Room not available for selected dates" });

        const authHeaders = {
            "x-user-id": req.headers["x-user-id"],
            "x-user-email": req.headers["x-user-email"],
            "x-user-token": req.headers["x-user-token"]
        };
        const room = await getRoom(roomId, authHeaders);
        if (!room) {
            return res.status(404).json({ error: "Room not found" });
        }
        const nights = nightsBetween(start, end);
        const roomPrice = room.price || 0;
        const totalPrice = nights * roomPrice;

        const booking = await Booking.create({
            bookId,
            ownerID: req.user?.uid || "anonymous",
            roomId,
            roomName: room.roomName,
            roomNumber: room.roomNumber,
            checkInDate: start,
            checkOutDate: end,
            guestsCount,
            guestName,
            guestNumber,
            guestEmail,
            guestAdult,
            guestChildren,
            roomPrice,
            totalPrice,
            roomType: room.roomType.toLowerCase(),
            paymentStatus: "Chưa thanh toán",
            notes,
            bookingSource,
            paymentMethods,
            description
        });

        // update room status to reserved (will be occupied on check-in)
        await setRoomStatus(roomId, "đã đặt trước", authHeaders);

        // Invalidate cache after creating booking
        await invalidateBookingsCache();

        return res.status(201).json(booking);
    } catch (err) {
        logger.error("createBooking error:", { message: err.message, stack: err.stack });
        return res.status(500).json({ error: err.message });
    }
};

export const confirmBooking = async (req, res) => {
    try {
        const { id } = req.params;
        let booking = await Booking.findOne({ bookId: id });
        if (!booking && isValidObjectId(id)) {
            booking = await Booking.findById(id);
        }
        if (!booking) return res.status(404).json({ error: "Booking not found" });

        const authHeaders = {
            "x-user-id": req.headers["x-user-id"],
            "x-user-email": req.headers["x-user-email"],
            "x-user-token": req.headers["x-user-token"]
        };

        // Reserve the room so it cannot be picked by another booking
        await setRoomStatus(booking.roomId, "đã đặt trước", authHeaders);

        // Remove other overlapping bookings for the same room
        const overlapFilter = {
            _id: { $ne: booking._id },
            roomId: booking.roomId,
            checkInDate: { $lt: booking.checkOutDate },
            checkOutDate: { $gt: booking.checkInDate }
        };
        const { deletedCount } = await Booking.deleteMany(overlapFilter);

        booking.status = "confirmed";
        await booking.save();

        // Invalidate cache after confirming booking
        await invalidateBookingsCache();

        logger.info({ message: "Booking confirmed", bookingId: booking.bookId, removed: deletedCount });
        return res.json({ booking, removed: deletedCount });
    } catch (err) {
        logger.error("confirmBooking error:", { bookingId: req.params.id, message: err.message, stack: err.stack });
        return res.status(500).json({ error: err.message });
    }
};


export const updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        // perefer resolving by bookId first, then fallback to _id when valid
        let booking = await Booking.findOne({ bookId: id });
        if (!booking && isValidObjectId(id)) {
            booking = await Booking.findById(id);
        }
        if (!booking) return res.status(404).json({ error: "Booking not found" });

        // allow alias mapping for status
        const normalizedBody = { ...req.body };
        if (normalizedBody.bookingStatus && !normalizedBody.status) {
            normalizedBody.status = normalizedBody.bookingStatus;
        }

        // whitelistd updatable fields
        const allowedBookingList = [
            "status",
            "paymentStatus",
            "bookingSource",
            "guestName",
            "guestEmail",
            "guestNumber",
            "guestAdult",
            "guestChildren",
            "description",

            // temporary residence registration fields
            "residenceRegistrationInfo"
        ];

        const updateData = {};
        for (const key of allowedBookingList) {
            if (key in normalizedBody) {
                updateData[key] = normalizedBody[key];
            }
        }
        // apply update
        Object.assign(booking, updateData);
        // handle room status change based on booking status
        const authHeaders = {
            "x-user-id": req.headers["x-user-id"],
            "x-user-email": req.headers["x-user-email"],
            "x-user-token": req.headers["x-user-token"]
        };
        if (updateData.status) {
            switch (updateData.status) {
                case "confirmed":
                    await setRoomStatus(booking.roomId, "đã đặt trước", authHeaders);
                    break;
                case "Check-In":
                    await setRoomStatus(booking.roomId, "đang sử dụng", authHeaders);
                    break;
                case "Check-Out":
                    await setRoomStatus(booking.roomId, "còn trống", authHeaders);
                    break;
                case "completed":
                    await setRoomStatus(booking.roomId, "còn trống", authHeaders);
                    break;
                case "cancelled":
                    await setRoomStatus(booking.roomId, "còn ", authHeaders);
                    break;
                default:
                    break;
            }
        };
        await booking.save();

        // invalidate cache after updating booking
        await invalidateBookingsCache();

        logger.info({ message: "Booking updated successfully", bookingId: booking.bookId });
        return res.json(booking);
    } catch (err) {
        logger.error("updateBookingStatus error:", { bookingId: req.params.id, message: err.message, stack: err.stack });
        return res.status(500).json({ error: err.message });
    }
}

export const cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id);
        if (!booking) return res.status(404).json({ error: "Booking not found" });

        booking.status = "cancelled";
        await booking.save();

        const authHeaders = {
            "x-user-id": req.headers["x-user-id"],
            "x-user-email": req.headers["x-user-email"],
            "x-user-token": req.headers["x-user-token"]
        };
        await setRoomStatus(booking.roomId, "available", authHeaders);

        // Invalidate cache after cancelling booking
        await invalidateBookingsCache();

        res.json({ message: "Booking cancelled", booking });
    } catch (err) {
        logger.error("cancelBooking error:", { bookingId: req.params.id, message: err.message, stack: err.stack });
        res.status(500).json({ error: err.message });
    }
};

export const getBookings = async (_req, res) => {
    try {
        const redis = getRedisClient();
        const cacheKey = getCacheKey("list");

        // Try to get from cache
        if (redis) {
            try {
                const cached = await redis.get(cacheKey);
                if (cached) {
                    logger.info(`✓ Cache HIT: ${cacheKey}`);
                    return res.json(JSON.parse(cached));
                }
            } catch (cacheErr) {
                logger.warn("Cache read error:", cacheErr.message);
            }
        }

        // Query database if not in cache
        logger.info(`✗ Cache MISS: ${cacheKey}`);
        const list = await Booking.find().sort({ createdAt: -1 }).lean();

        // Store in cache for 5 minutes
        if (redis) {
            try {
                await redis.setEx(cacheKey, 300, JSON.stringify(list));
            } catch (cacheErr) {
                logger.warn("Cache write error:", cacheErr.message);
            }
        }

        res.json(list);
    } catch (err) {
        logger.error("getBookings error:", { message: err.message, stack: err.stack });
        res.status(500).json({ error: err.message });
    }
};

export const getBookingById = async (req, res) => {
    try {
        const item = await Booking.findById(req.params.id);
        if (!item) return res.status(404).json({ error: "Not found" });
        res.json(item);
    } catch (err) {
        logger.error("getBookingById error:", { bookingId: req.params.id, message: err.message, stack: err.stack });
        res.status(500).json({ error: err.message });
    }
};

export const getRecentBookings = async (req, res) => {
    try {
        const limit = Number(req.query.limit || 5);
        const list = await Booking.find().sort({ createdAt: -1 }).limit(limit);
        res.json(list);
    } catch (err) {
        logger.error("getRecentBookings error:", { message: err.message, stack: err.stack });
        res.status(500).json({ error: err.message });
    }
};

export const deleteBooking = async (req, res) => {
    try {
        const { id } = req.params;
        // Try to find by bookId first, then by _id
        let booking = await Booking.findOne({ bookId: id });
        if (!booking) {
            booking = await Booking.findById(id);
        }
        if (!booking) return res.status(404).json({ error: "Booking not found" });

        const authHeaders = {
            "x-user-id": req.headers["x-user-id"],
            "x-user-email": req.headers["x-user-email"],
            "x-user-token": req.headers["x-user-token"]
        };
        // Set room back to available
        await setRoomStatus(booking.roomId, "còn trống", authHeaders);

        await Booking.deleteOne({ _id: booking._id });

        // Invalidate cache after deletion
        await invalidateBookingsCache();

        res.json({ message: "Booking deleted successfully", bookingId: booking.bookId });
    } catch (err) {
        logger.error("deleteBooking error:", { bookingId: req.params.id, message: err.message, stack: err.stack });
        res.status(500).json({ error: err.message });
    }
};
