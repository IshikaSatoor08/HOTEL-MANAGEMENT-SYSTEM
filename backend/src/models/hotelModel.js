
import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema(
  {
    hotelName: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    pricePerNight: {
      type: Number,
      required: true,
      min: 0,
    },
    roomType: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    totalRooms: {
      type: Number,
      required: true,
      min: 1,
      default: 20,
    },

    // Hotel photo URL
    imageUrl: {
      type: String,
      trim: true,
      default: "",
    },

    // Hotel facilities and amenities
    facilities: {
      type: [String],
      default: [],
      validate: {
        validator: (items) =>
          items.every(
            (item) => typeof item === "string" && item.trim().length > 0
          ),
        message: "Facilities must contain non-empty text values",
      },
    },
  },
  { timestamps: true }
);

const Hotel = mongoose.model("Hotel", hotelSchema);

export default Hotel;
