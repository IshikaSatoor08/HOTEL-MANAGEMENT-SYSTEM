
import express from "express";
import {
  createRating,
  getHotelRatings,
} from "../controllers/ratingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// View ratings for a particular hotel
router.get("/:hotelId", getHotelRatings);

// Submit a review (login required)
router.post("/", protect, createRating);

export default router;
