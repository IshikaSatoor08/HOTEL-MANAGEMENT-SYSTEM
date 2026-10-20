
import express from "express";
import {
  createHotel,
  getHotels,
  getHotelById,
  updateHotel,
  deleteHotel,
} from "../controllers/hotelController.js";
import {
  protect,
  adminOnly,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes: customers can browse hotels.
router.get("/", getHotels);
router.get("/:id", getHotelById);

// Admin-only routes: manage hotels.
router.post("/", protect, adminOnly, createHotel);
router.put("/:id", protect, adminOnly, updateHotel);
router.delete("/:id", protect, adminOnly, deleteHotel);

export default router;
