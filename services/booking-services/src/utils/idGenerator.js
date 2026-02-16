// services/booking-services/src/utils/idGenerator.js
import { Counter } from '../models/Counter.js';

export async function getNextSequenceValue(sequenceName) {
  const counter = await Counter.findByIdAndUpdate(
    sequenceName,
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true } // upsert creates the counter if it doesn't exist
  );
  return counter.sequence_value;
}

export function formatBookId(sequenceValue) {
  // Pads the number with leading zeros to ensure it's 4 digits long
  return `BK${String(sequenceValue).padStart(4, '0')}`;
}
