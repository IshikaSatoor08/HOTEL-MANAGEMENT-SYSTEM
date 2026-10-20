
import mongoose from "mongoose";
import Rating from "../models/ratingModel.js";
import Hotel from "../models/hotelModel.js";

// Create a hotel rating and review
export const createRating = async (req, res) => {
  try {
    const { hotelId, rating, comment } = req.body;

    if (!mongoose.isValidObjectId(hotelId)) {
      return res.status(400).json({ message: "Invalid hotel ID" });
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be a whole number from 1 to 5",
      });
    }

    if (
      typeof comment !== "string" ||
      comment.trim().length < 3 ||
      comment.trim().length > 1000
    ) {
      return res.status(400).json({
        message: "Review must be between 3 and 1000 characters",
      });
    }

    const hotelExists = await Hotel.exists({ _id: hotelId });

    if (!hotelExists) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    const userId = req.user._id;

    const existingRating = await Rating.findOne({
      hotel: hotelId,
      user: userId,
    });

    if (existingRating) {
      return res.status(409).json({
        message: "You have already reviewed this hotel",
      });
    }

    const newRating = await Rating.create({
      hotel: hotelId,
      user: userId,
      rating,
      comment: comment.trim(),
    });

    const populatedRating = await Rating.findById(newRating._id)
      .populate("user", "name");

    return res.status(201).json({
      message: "Hotel review submitted successfully",
      rating: populatedRating,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "You have already reviewed this hotel",
      });
    }

    console.error("Create rating error:", error);
    return res.status(500).json({ message: "Failed to submit review" });
  }
};

// Get all reviews for a hotel, including its average rating
export const getHotelRatings = async (req, res) => {
  try {
    const { hotelId } = req.params;

    if (!mongoose.isValidObjectId(hotelId)) {
      return res.status(400).json({ message: "Invalid hotel ID" });
    }

    const hotelExists = await Hotel.exists({ _id: hotelId });

    if (!hotelExists) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    const ratings = await Rating.find({ hotel: hotelId })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    const totalReviews = ratings.length;

    const averageRating =
      totalReviews === 0
        ? 0
        : ratings.reduce((sum, item) => sum + item.rating, 0) /
          totalReviews;

    return res.status(200).json({
      averageRating: Number(averageRating.toFixed(1)),
      totalReviews,
      ratings,
    });
  } catch (error) {
    console.error("Get hotel ratings error:", error);
    return res.status(500).json({ message: "Failed to fetch reviews" });
  }
};
