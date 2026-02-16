import mongoose from "mongoose";
const GuestSchema = new mongoose.Schema(
    {
        ownerID: { type: String, required: true, index: true },
        guestIdCard: { type: String, unique: true, required: true },
        guestName: { type: String, required: true },
        guestEmail: { type: String, required: true },
        guestNumber: { type: String, required: true },
        guestAddress: { type: String },
        guestCountry: { type: String },
        guestNotes: { type: String },
        guestBookingState: { type: String, enum: ["checkin", "checkout", "expected"], default: "checkin" },
        totalBookings: { type: Number, default: 0 },
    },
    { timestamps: true }
);
export const Guest = mongoose.model("Guest", GuestSchema);