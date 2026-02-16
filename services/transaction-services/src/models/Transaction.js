import mongoose from 'mongoose';
const TransactionSchema = new mongoose.Schema(
    {
        transactionId: { type: String, unique: true, required: true },
        invoiceId: { type: String, unique: true, required: true },
        bookingId: { type: String, index: true },
        reservationId: { type: String, index: true },
        date: { type: Date, required: true },
        time: { type: String, required: true },
        guestName: { type: String, required: true },
        guestNumber: { type: String, required: true },
        guestEmail: { type: String, required: true },
        type: { type: String, required: true },
        category: { type: String, required: true },
        amount: { type: Number, required: true },
        paymentMethod: { type: String, enum: ["cash", "credit-card", "bank-transfer"], default: "cash", required: true },
        status: { type: String, enum: ["pending", "completed", "failed", "cancelled"], default: "pending" },
        description: { type: String }
    },
    { timestamps: true }
);

export const Transaction = mongoose.model('Transaction', TransactionSchema);