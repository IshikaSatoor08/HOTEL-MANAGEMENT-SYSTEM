
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
    const { search, location, roomType, minPrice, maxPrice } = req.query;

    const query = {};

    if (search) {
      query.hotelName = { $regex: search, $options: "i" };
    }

    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    if (roomType) {
      query.roomType = { $regex: roomType, $options: "i" };
    }

    if (minPrice !== undefined && minPrice !== "") {
      const min = Number(minPrice);

      if (!Number.isFinite(min) || min < 0) {
        return res.status(400).json({
          message: "Invalid minimum price",
        });
      }

      query.pricePerNight = {
        ...query.pricePerNight,
        $gte: min,
      };
    }

    if (maxPrice !== undefined && maxPrice !== "") {
      const max = Number(maxPrice);

      if (!Number.isFinite(max) || max < 0) {
        return res.status(400).json({
          message: "Invalid maximum price",
        });
      }

      query.pricePerNight = {
        ...query.pricePerNight,
        $lte: max,
      };
    }

    if (
      minPrice !== undefined &&
      minPrice !== "" &&
      maxPrice !== undefined &&
      maxPrice !== "" &&
      Number(minPrice) > Number(maxPrice)
    ) {
      return res.status(400).json({
        message: "Minimum price cannot exceed maximum price",
      });
    }

    const hotels = await Hotel.find(query);
    res.status(200).json(hotels);
  } catch (error) {
    console.error("Error fetching hotels:", error);
    res.status(500).json({
      message: "Failed to fetch hotels",
    });
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
