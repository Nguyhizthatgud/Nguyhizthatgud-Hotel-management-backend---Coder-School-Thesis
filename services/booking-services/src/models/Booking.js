import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
    {
        ownerID: { type: String, required: true, index: true },
        bookId: { type: String, unique: true, required: true },
        bookingSource: { type: String, enum: ["Agoda", "Expedia", "小红书", "Trivago", "Booking.com", "Traveloka", "mobile", "trực tiếp"], default: "mobile" },
        status: { type: String, enum: ["pending", "confirmed", "Check-In", "Check-Out", "cancelled"], default: "pending", index: true },
        guestName: { type: String, required: true },
        guestNumber: { type: String, required: true },
        guestEmail: { type: String, required: true },
        guestAdult: { type: Number, required: true, min: 1 },
        guestChildren: { type: Number, default: 0, min: 0 },
        guestsCount: { type: Number, default: 1, min: 1 },
        roomId: { type: String, required: true, index: true },
        roomName: { type: String, required: true },
        roomNumber: { type: String },
        roomPrice: { type: Number, default: 0 },
        checkInDate: { type: Date, required: true },
        checkOutDate: { type: Date, required: true },
        roomType: { type: String, enum: ["phòng đơn", "phòng đôi", "phòng tiêu chuẩn", "phòng đặc biệt", "phòng tổng thống"], required: true },
        totalPrice: { type: Number, default: 0 },
        paymentStatus: { type: String, enum: ["Đã thanh toán", "Chưa thanh toán", "Thanh toán một phần"] },
        description: { type: String },


        // temporary residence registration fields
        residenceRegistrationInfo: {
            idCardType: { type: String, enum: ["passport", "id_card", "driver_license"] },
            idCardNumber: { type: String },
            idBirthDate: { type: String },
            residenceFullName: { type: String },
            residenceAddress: { type: String },
            residenceCountry: { type: String, default: "Việt Nam" },
            idCardIssuedDate: { type: Date },
            idCardExpiryDate: { type: Date },
            registrationStatus: { type: String, enum: ["not_registered", "registered", "pending"], default: "pending" },
            registrationDate: { type: Date },
            registrationNotes: { type: String }
        },
    },
    { timestamps: true }
);

BookingSchema.index({ roomId: 1, checkInDate: 1, checkOutDate: 1 });

export const Booking = mongoose.model("Booking", BookingSchema);
