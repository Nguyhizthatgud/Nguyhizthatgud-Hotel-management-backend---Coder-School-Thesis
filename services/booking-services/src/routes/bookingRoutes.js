import { Router } from "express";
import { requireGatewayUser } from "../middleware/auth.js";
import {
    createBooking,
    confirmBooking,
    cancelBooking,
    getBookings,
    getBookingById,
    getRecentBookings,
    deleteBooking,
    updateBookingStatus
} from "../controllers/bookingController.js";

const router = Router();

router.use(requireGatewayUser);

router.get("/", getBookings);
router.get("/recent", getRecentBookings);
router.get("/:id", getBookingById);
router.post("/", createBooking);
router.patch("/:id/confirm", confirmBooking);
router.patch("/:id", updateBookingStatus);
router.patch("/:id/cancel", cancelBooking);
router.delete("/:id", deleteBooking);

export default router;
