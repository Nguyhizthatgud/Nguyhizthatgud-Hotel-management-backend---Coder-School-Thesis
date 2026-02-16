// services/transaction-services/src/models/Counter.js
import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
    _id: { type: String, required: true }, // e.g., "transactionId"
    sequence_value: { type: Number, default: 0 }
});

export const Counter = mongoose.model('Counter', counterSchema);
