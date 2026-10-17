
import Hotel from "../models/hotelModel.js";


export const createHotel = async (req, res) => {
  try {
    const hotel = await Hotel.create(req.body);
    res.status(201).json(hotel);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


export const getHotels = async (req, res) => {
  try {
    const { search, location, roomType } = req.query;

    let query = {};

    if (search) {
      query.hotelName = { $regex: search, $options: "i" };
    }

    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    if (roomType) {
      query.roomType = { $regex: roomType, $options: "i" };
    }

    const hotels = await Hotel.find(query);
    res.json(hotels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    res.json(hotel);
  } catch (error) {
    res.status(400).json({ message: "Invalid hotel ID" });
  }
};


export const updateHotel = async (req, res) => {
  try {
    const updated = await Hotel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


export const deleteHotel = async (req, res) => {
  try {
    const deleted = await Hotel.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    res.json({ message: "Hotel Deleted" });
  } catch (error) {
    res.status(400).json({ message: "Invalid hotel ID" });
  }
};
