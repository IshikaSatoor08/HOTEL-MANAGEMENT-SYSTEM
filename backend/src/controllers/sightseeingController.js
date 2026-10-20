
import Sightseeing from "../models/sightseeingModel.js";
import Hotel from "../models/hotelModel.js";

// @desc    Add a sightseeing place
// @route   POST /api/sightseeing
// @access  Admin
export const createSightseeing = async (req, res) => {
  try {
    const { hotel, name, location, distance, description, imageUrl } = req.body;

    if (!hotel || !name?.trim() || !location?.trim() ||
        !distance?.trim() || !description?.trim()) {
      return res.status(400).json({
        message: "Please provide all required sightseeing details.",
      });
    }

    const hotelExists = await Hotel.findById(hotel);

    if (!hotelExists) {
      return res.status(404).json({ message: "Hotel not found." });
    }

    const sightseeing = await Sightseeing.create({
      hotel,
      name: name.trim(),
      location: location.trim(),
      distance: distance.trim(),
      description: description.trim(),
      imageUrl: imageUrl?.trim() || "",
    });

    return res.status(201).json({
      message: "Sightseeing place added successfully.",
      sightseeing,
    });
  } catch (error) {
    console.error("Create sightseeing error:", error);
    return res.status(500).json({
      message: "Unable to add sightseeing place.",
    });
  }
};

// @desc    Get sightseeing places for a hotel
// @route   GET /api/sightseeing/hotel/:hotelId
// @access  Public
export const getSightseeingByHotel = async (req, res) => {
  try {
    const { hotelId } = req.params;

    if (!/^[0-9a-fA-F]{24}$/.test(hotelId)) {
      return res.status(400).json({ message: "Invalid hotel ID." });
    }

    const hotelExists = await Hotel.findById(hotelId);

    if (!hotelExists) {
      return res.status(404).json({ message: "Hotel not found." });
    }

    const places = await Sightseeing.find({ hotel: hotelId })
      .populate("hotel", "hotelName location")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      totalPlaces: places.length,
      places,
    });
  } catch (error) {
    console.error("Get sightseeing error:", error);
    return res.status(500).json({
      message: "Unable to fetch sightseeing places.",
    });
  }
};

// @desc    Update a sightseeing place
// @route   PUT /api/sightseeing/:id
// @access  Admin
export const updateSightseeing = async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({ message: "Invalid sightseeing ID." });
    }

    const place = await Sightseeing.findById(id);

    if (!place) {
      return res.status(404).json({ message: "Sightseeing place not found." });
    }

    const allowedFields = [
      "hotel",
      "name",
      "location",
      "distance",
      "description",
      "imageUrl",
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        place[field] =
          typeof req.body[field] === "string"
            ? req.body[field].trim()
            : req.body[field];
      }
    }

    if (
      !place.name ||
      !place.location ||
      !place.distance ||
      !place.description
    ) {
      return res.status(400).json({
        message: "Name, location, distance, and description are required.",
      });
    }

    if (req.body.hotel !== undefined) {
      const hotelExists = await Hotel.findById(place.hotel);
      if (!hotelExists) {
        return res.status(404).json({ message: "Hotel not found." });
      }
    }

    await place.save();

    return res.status(200).json({
      message: "Sightseeing place updated successfully.",
      sightseeing: place,
    });
  } catch (error) {
    console.error("Update sightseeing error:", error);
    return res.status(500).json({
      message: "Unable to update sightseeing place.",
    });
  }
};

// @desc    Delete a sightseeing place
// @route   DELETE /api/sightseeing/:id
// @access  Admin
export const deleteSightseeing = async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({ message: "Invalid sightseeing ID." });
    }

    const place = await Sightseeing.findById(id);

    if (!place) {
      return res.status(404).json({ message: "Sightseeing place not found." });
    }

    await place.deleteOne();

    return res.status(200).json({
      message: "Sightseeing place deleted successfully.",
    });
  } catch (error) {
    console.error("Delete sightseeing error:", error);
    return res.status(500).json({
      message: "Unable to delete sightseeing place.",
    });
  }
};
