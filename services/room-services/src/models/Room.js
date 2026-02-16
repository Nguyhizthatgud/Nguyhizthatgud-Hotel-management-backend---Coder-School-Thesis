import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
    {
        ownerId: { type: String, required: true, index: true },
        roomNumber: { type: String, required: true, index: true },
        roomName: { type: String, required: true, index: true },
        roomType: { type: String, enum: ["Phòng đơn", "Phòng đôi", "Phòng tiêu chuẩn", "Phòng đặc biệt", "Phòng tổng thống"], required: true },
        floor: Number,
        status: { type: String, enum: ["còn trống", "đã đặt trước", "đang sử dụng", "bảo trì", "đang dọn dẹp"], default: "còn trống", index: true },
        paymentMethod: { type: String, enum: ["Tiền mặt", "Thẻ tín dụng", "Chuyển khoản", "Ví điện tử"] },
        price: { type: Number, required: true },
        capacity: { type: Number },
        amenities: [{ type: String, enum: ["WiFi", "TV", "Điều hòa", "Tủ lạnh", "Ấm đun nước", "Dịch vụ phòng", "Dịch vụ giặt ủi", "Thuê xe"] }],
        description: String,
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
);

// Compound index for efficient owner-based queries
roomSchema.index({ ownerId: 1, status: 1 });
roomSchema.index({ ownerId: 1, roomName: 1 }, { unique: true });

export const Room = mongoose.model("Room", roomSchema);