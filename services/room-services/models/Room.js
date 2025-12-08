import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
    {
        roomNumber: { type: String, required: true, unique: true, index: true },
        type: { type: String, enum: ["Phòng đơn", "Phòng đôi", "Phòng Vip", "Phòng đặc biệt", "Phòng tổng thống"], required: true },
        floor: Number,
        status: { type: String, enum: ["available", "occupied", "maintenance", "cleaning"], default: "available", index: true },
        price: { type: Number, required: true },
        capacity: { type: Number, default: 2 },
        amenities: [String],
        images: [String],
        description: String,
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
);

export const Room = mongoose.model("Room", roomSchema);