// services/transaction-services/src/utils/idGenerator.js
import { Counter } from '../models/Counter.js';

/**
 * Get next sequential value for transaction ID
 * Uses MongoDB counter pattern for guaranteed unique sequential IDs
 */
export async function getNextSequenceValue(sequenceName) {
    const counter = await Counter.findByIdAndUpdate(
        sequenceName,
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true } // upsert creates the counter if it doesn't exist
    );
    return counter.sequence_value;
}

/**
 * Format transaction ID with prefix and zero-padding
 * Example: TXN0001, TXN0002, etc.
 */
export function formatTransactionId(sequenceValue) {
    return `TXN${String(sequenceValue).padStart(4, '0')}`;
}

/**
 * Generate complete transaction ID
 * Combines sequence value retrieval and formatting
 */
export async function generateTransactionId() {
    const sequence = await getNextSequenceValue('transactionId');
    return formatTransactionId(sequence);
}
