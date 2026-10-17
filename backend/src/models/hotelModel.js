
import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema({
  hotelName: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  pricePerNight: {
    type: Number,
    required: true
  },
  roomType: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  }
}, { timestamps: true });

const Hotel = mongoose.model("Hotel", hotelSchema);

export default Hotel;
