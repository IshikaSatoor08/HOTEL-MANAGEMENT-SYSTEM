
import express from "express";
import {
  createHotel,
  getHotels,
  getHotelById,
  updateHotel,
  deleteHotel
} from "../controllers/hotelController.js";

const router = express.Router();

router.post("/", createHotel);
router.get("/", getHotels);
router.get("/:id", getHotelById);
router.put("/:id", updateHotel);
router.delete("/:id", deleteHotel);

export default router;
