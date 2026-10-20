
import express from "express";
import {
  createBooking,
  getMyBookings,
  getAllBookings,
  modifyBooking,
  cancelBooking,
  checkRoomAvailability,
} from "../controllers/bookingController.js";
import {
  protect,
  adminOnly,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Public route: check room availability.
router.get("/availability", checkRoomAvailability);

// Admin-only route: view all customer bookings.
// Keep this before the dynamic /:id routes.
router.get("/admin/all", protect, adminOnly, getAllBookings);

// Customer routes.
router.post("/", protect, createBooking);
router.get("/my-bookings", protect, getMyBookings);
router.put("/:id/modify", protect, modifyBooking);
router.patch("/:id/cancel", protect, cancelBooking);

export default router;
