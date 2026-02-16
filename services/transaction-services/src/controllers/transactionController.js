import axios from "axios";
import { Transaction } from "../models/Transaction.js";
import logger from "../../../../shared/utils/logger.js";
import { isDBConnected } from "../config/database.js";
import { generateTransactionId } from "../utils/idGenerator.js";

const ROOM_SERVICE_URL = process.env.ROOM_SERVICE_URL || "http://localhost:4004";
const BOOKING_SERVICE_URL = process.env.BOOKING_SERVICE_URL || "http://localhost:4003";

/**
 * CREATE TRANSACTION
 * Creates a new transaction for hotel services
 * 
 * Transaction Types:
 * 1. room - Room charges (nightly rate, early checkin, late checkout)
 * 2. car-rental - Car rental service
 * 3. laundry - Laundry service
 * 4. restaurant - Restaurant/room service
 * 5. spa - Spa/massage services
 * 6. minibar - Minibar charges
 * 7. parking - Parking fees
 * 8. other - Other miscellaneous charges
 * 
 * Business Rules:
 * - All transactions must be linked to a booking (reservationId)
 * - Room charges are auto-calculated based on booking dates
 * - Service charges are manually created when guest uses service
 * - Transactions start as "pending" and become "completed" when paid
 */
export const createTransaction = async (req, res) => {
    try {
        const {
            transactionId,  // From frontend (optional, will be generated if not provided)
            invoiceId,      // From frontend (optional, will use transactionId if not provided)
            bookingId,      // From frontend - link to booking ID
            reservationId,  // Optional: Link to booking
            type,           // Required: charge, refund, payment
            category,       // Required: room_charge, service_charge, deposit, other
            amount,         // Required: Charge amount
            paymentMethod,  // Optional: cash, credit-card, bank-transfer
            description,    // Optional: Additional notes (JSON stringified data from POS)
            guestName,      // Required
            guestNumber,    // Required
            guestEmail,     // Required
            date,           // Optional: Date object
            time,           // Optional: Time string
            status          // Optional: pending, completed, failed, cancelled
        } = req.body;

        // Validation - make reservationId optional for POS transactions
        if (!type || !category || !amount || !guestName || !guestNumber || !guestEmail) {
            return res.status(400).json({
                error: "Missing required fields: type, category, amount, guestName, guestNumber, guestEmail"
            });
        }

        // Generate transaction ID if not provided
        const finalTransactionId = transactionId || await generateTransactionId();
        const finalInvoiceId = invoiceId || finalTransactionId;

        // Get current date/time if not provided
        const now = date ? new Date(date) : new Date();
        const finalTime = time || now.toTimeString().split(' ')[0];

        // Create transaction with bookingId
        const transaction = await Transaction.create({
            transactionId: finalTransactionId,
            invoiceId: finalInvoiceId,
            bookingId: bookingId || reservationId,  // Use bookingId if provided, otherwise use reservationId
            reservationId,
            date: now,
            time: finalTime,
            guestName,
            guestNumber,
            guestEmail,
            type,
            category,
            amount,
            paymentMethod: paymentMethod || "cash",
            status: status || "pending",
            description
        });

        logger.info("Transaction created:", finalTransactionId);
        return res.status(201).json(transaction);

    } catch (err) {
        logger.error("createTransaction error:", { message: err.message, stack: err.stack });
        return res.status(500).json({ error: err.message });
    }
};

/**
 * GET ALL TRANSACTIONS
 * Optional filters: reservationId, status, type
 */
export const getTransactions = async (req, res) => {
    try {
        const { reservationId, status, type } = req.query;

        const filter = {};
        if (reservationId) filter.reservationId = reservationId;
        if (status) filter.status = status;
        if (type) filter.type = type;

        const transactions = await Transaction.find(filter).sort({ createdAt: -1 });
        res.json(transactions);
    } catch (err) {
        logger.error("getTransactions error:", { message: err.message, stack: err.stack });
        res.status(500).json({ error: err.message });
    }
};

/**
 * GET TRANSACTION BY ID
 */
export const getTransactionById = async (req, res) => {
    try {
        const { id } = req.params;

        // Try to find by transactionId first, then by _id
        let transaction = await Transaction.findOne({ transactionId: id });
        if (!transaction) {
            transaction = await Transaction.findById(id);
        }

        if (!transaction) {
            return res.status(404).json({ error: "Transaction not found" });
        }

        res.json(transaction);
    } catch (err) {
        logger.error("getTransactionById error:", { message: err.message, stack: err.stack });
        res.status(500).json({ error: err.message });
    }
};

/**
 * GET GUEST FOLIO (Bill Summary)
 * Returns all transactions for a specific booking/reservation
 * Groups charges by type and calculates totals
 */
export const getGuestFolio = async (req, res) => {
    try {
        const { reservationId } = req.params;

        const transactions = await Transaction.find({ reservationId }).sort({ date: 1 });

        if (transactions.length === 0) {
            return res.status(404).json({ error: "No transactions found for this reservation" });
        }

        // Calculate totals
        const summary = {
            reservationId,
            guestName: transactions[0]?.guestName,
            guestEmail: transactions[0]?.guestEmail,
            transactions,
            summary: {
                totalCharges: 0,
                totalPaid: 0,
                balance: 0,
                byType: {}
            }
        };

        transactions.forEach(txn => {
            summary.summary.totalCharges += txn.amount;

            if (txn.status === "completed") {
                summary.summary.totalPaid += txn.amount;
            }

            // Group by type
            if (!summary.summary.byType[txn.type]) {
                summary.summary.byType[txn.type] = 0;
            }
            summary.summary.byType[txn.type] += txn.amount;
        });

        summary.summary.balance = summary.summary.totalCharges - summary.summary.totalPaid;

        res.json(summary);
    } catch (err) {
        logger.error("getGuestFolio error:", { message: err.message, stack: err.stack });
        res.status(500).json({ error: err.message });
    }
};

/**
 * UPDATE TRANSACTION STATUS
 * Mark transaction as completed (paid) or failed
 */
export const updateTransactionStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, paymentMethod } = req.body;

        if (!["pending", "completed", "failed"].includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }

        let transaction = await Transaction.findOne({ transactionId: id });
        if (!transaction) {
            transaction = await Transaction.findById(id);
        }

        if (!transaction) {
            return res.status(404).json({ error: "Transaction not found" });
        }

        transaction.status = status;
        if (paymentMethod) {
            transaction.paymentMethod = paymentMethod;
        }

        await transaction.save();

        logger.info("Transaction updated:", { transactionId: transaction.transactionId, status });
        res.json(transaction);
    } catch (err) {
        logger.error("updateTransactionStatus error:", { message: err.message, stack: err.stack });
        res.status(500).json({ error: err.message });
    }
};

/**
 * PROCESS PAYMENT FOR BOOKING
 * Marks all pending transactions for a booking as completed
 */
export const processBookingPayment = async (req, res) => {
    try {
        const { reservationId } = req.params;
        const { paymentMethod } = req.body;

        if (!paymentMethod) {
            return res.status(400).json({ error: "Payment method is required" });
        }

        const result = await Transaction.updateMany(
            { reservationId, status: "pending" },
            { status: "completed", paymentMethod }
        );

        logger.info("Booking payment processed:", { reservationId, count: result.modifiedCount });
        res.json({
            message: "Payment processed successfully",
            transactionsUpdated: result.modifiedCount
        });
    } catch (err) {
        logger.error("processBookingPayment error:", { message: err.message, stack: err.stack });
        res.status(500).json({ error: err.message });
    }
};
