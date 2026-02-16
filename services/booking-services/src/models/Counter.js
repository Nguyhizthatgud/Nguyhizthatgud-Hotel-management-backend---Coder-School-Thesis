// services/booking-services/src/models/Counter.js
import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // e.g., "bookId"
  sequence_value: { type: Number, default: 0 }
});

export const Counter = mongoose.model('Counter', counterSchema);
