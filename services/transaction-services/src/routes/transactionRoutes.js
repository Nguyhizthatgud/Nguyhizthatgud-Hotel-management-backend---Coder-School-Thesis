import { Router } from 'express';
import { requireGatewayUser } from '../middleware/auth.js';
import {
    createTransaction,
    getTransactions,
    getTransactionById,
    getGuestFolio,
    updateTransactionStatus,
    processBookingPayment
} from '../controllers/transactionController.js';

const router = Router();

// All routes require authentication
router.use(requireGatewayUser);

// Transaction CRUD
router.post('/', createTransaction);
router.get('/', getTransactions);
router.get('/:id', getTransactionById);
router.patch('/:id/status', updateTransactionStatus);

// Folio/Bill operations
router.get('/folio/:reservationId', getGuestFolio);
router.post('/folio/:reservationId/pay', processBookingPayment);

export default router;
