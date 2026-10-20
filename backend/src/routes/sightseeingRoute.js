
import express from "express";
import {
  createSightseeing,
  getSightseeingByHotel,
  updateSightseeing,
  deleteSightseeing,
} from "../controllers/sightseeingController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public: Get sightseeing places for a hotel
router.get("/hotel/:hotelId", getSightseeingByHotel);

// Admin only: Add a sightseeing place
router.post("/", protect, adminOnly, createSightseeing);

// Admin only: Update a sightseeing place
router.put("/:id", protect, adminOnly, updateSightseeing);

// Admin only: Delete a sightseeing place
router.delete("/:id", protect, adminOnly, deleteSightseeing);

export default router;
