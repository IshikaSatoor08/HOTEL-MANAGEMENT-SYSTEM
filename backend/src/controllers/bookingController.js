
import Booking from "../models/bookingModel.js";
import Hotel from "../models/hotelModel.js";

// Validate check-in and check-out dates.
const validateBookingDates = (checkIn, checkOut) => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);

  if (
    !checkIn ||
    !checkOut ||
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    return "Valid check-in and check-out dates are required";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (start < today) {
    return "Check-in cannot be in the past";
  }

  if (end <= start) {
    return "Check-out must be after check-in";
  }

  return null;
};

// Validate guest and room counts.
const validateCounts = ({ adults, children, numberOfRooms }) => {
  if (
    !Number.isInteger(Number(adults)) ||
    Number(adults) < 1 ||
    !Number.isInteger(Number(children)) ||
    Number(children) < 0 ||
    !Number.isInteger(Number(numberOfRooms)) ||
    Number(numberOfRooms) < 1
  ) {
    return "Invalid number of guests or rooms";
  }

  if (Number(adults) + Number(children) > 16) {
    return "Maximum 16 guests are allowed per booking";
  }

  if (Number(numberOfRooms) > 20) {
    return "Maximum 20 rooms are allowed per booking";
  }

  return null;
};

// Calculate the number of nights between dates.
const getNumberOfNights = (checkIn, checkOut) => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);

  return Math.round(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
};

// Check room availability for a date range.
// excludeBookingId is used when modifying an existing booking.
const getRoomAvailability = async (
  hotelId,
  checkIn,
  checkOut,
  excludeBookingId = null
) => {
  const hotel = await Hotel.findById(hotelId);

  if (!hotel) {
    return { error: "Hotel not found" };
  }

  const query = {
    hotel: hotelId,
    status: "Confirmed",
    checkIn: { $lt: new Date(checkOut) },
    checkOut: { $gt: new Date(checkIn) },
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const overlappingBookings = await Booking.find(query);

  const bookedRooms = overlappingBookings.reduce(
    (total, booking) => total + booking.numberOfRooms,
    0
  );

  const totalRooms = hotel.totalRooms ?? 20;
  const availableRooms = Math.max(0, totalRooms - bookedRooms);

  return {
    hotel,
    totalRooms,
    bookedRooms,
    availableRooms,
  };
};

// Create a booking.
export const createBooking = async (req, res) => {
  try {
    const {
      hotel: hotelId,
      checkIn,
      checkOut,
      adults = 1,
      children = 0,
      numberOfRooms = 1,
    } = req.body;

    const dateError = validateBookingDates(checkIn, checkOut);

    if (dateError) {
      return res.status(400).json({ message: dateError });
    }

    const countError = validateCounts({
      adults,
      children,
      numberOfRooms,
    });

    if (countError) {
      return res.status(400).json({ message: countError });
    }

    const availability = await getRoomAvailability(
      hotelId,
      checkIn,
      checkOut
    );

    if (availability.error) {
      return res.status(404).json({
        message: availability.error,
      });
    }

    if (Number(numberOfRooms) > availability.availableRooms) {
      return res.status(400).json({
        message: `Only ${availability.availableRooms} room(s) are available`,
      });
    }

    const user = req.user;

    const numberOfNights = getNumberOfNights(checkIn, checkOut);
    const totalGuests = Number(adults) + Number(children);

    const totalPrice =
      numberOfNights *
      Number(numberOfRooms) *
      Number(availability.hotel.pricePerNight);

    const booking = await Booking.create({
      user: user._id,
      hotel: availability.hotel._id,
      customerName: user.name,
      customerEmail: user.email,
      checkIn,
      checkOut,
      adults: Number(adults),
      children: Number(children),
      guests: totalGuests,
      numberOfRooms: Number(numberOfRooms),
      totalPrice,
      status: "Confirmed",
    });

    return res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    console.error("Create booking error:", error);

    return res.status(500).json({
      message: "Failed to create booking",
    });
  }
};

// Get bookings belonging to the logged-in customer.
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("hotel", "hotelName location pricePerNight roomType")
      .sort({ createdAt: -1 });

    return res.status(200).json(bookings);
  } catch (error) {
    console.error("Get my bookings error:", error);

    return res.status(500).json({
      message: "Failed to fetch your bookings",
    });
  }
};

// Get all bookings for the admin dashboard.
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email")
      .populate("hotel", "hotelName location")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      totalBookings: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get all bookings error:", error);

    return res.status(500).json({
      message: "Unable to fetch bookings",
    });
  }
};

// Modify an existing booking.
export const modifyBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (booking.status !== "Confirmed") {
      return res.status(400).json({
        message: "Only confirmed bookings can be modified",
      });
    }

    const {
      checkIn,
      checkOut,
      adults = booking.adults,
      children = booking.children,
      numberOfRooms = booking.numberOfRooms,
    } = req.body;

    const newCheckIn = checkIn ?? booking.checkIn;
    const newCheckOut = checkOut ?? booking.checkOut;

    const dateError = validateBookingDates(
      newCheckIn,
      newCheckOut
    );

    if (dateError) {
      return res.status(400).json({ message: dateError });
    }

    const countError = validateCounts({
      adults,
      children,
      numberOfRooms,
    });

    if (countError) {
      return res.status(400).json({ message: countError });
    }

    const availability = await getRoomAvailability(
      booking.hotel,
      newCheckIn,
      newCheckOut,
      booking._id
    );

    if (availability.error) {
      return res.status(404).json({
        message: availability.error,
      });
    }

    if (Number(numberOfRooms) > availability.availableRooms) {
      return res.status(400).json({
        message: `Only ${availability.availableRooms} room(s) are available`,
      });
    }

    const nights = getNumberOfNights(newCheckIn, newCheckOut);

    booking.checkIn = newCheckIn;
    booking.checkOut = newCheckOut;
    booking.adults = Number(adults);
    booking.children = Number(children);
    booking.guests = Number(adults) + Number(children);
    booking.numberOfRooms = Number(numberOfRooms);
    booking.totalPrice =
      nights *
      Number(numberOfRooms) *
      Number(availability.hotel.pricePerNight);

    await booking.save();

    return res.status(200).json({
      message: "Booking modified successfully",
      booking,
    });
  } catch (error) {
    console.error("Modify booking error:", error);

    return res.status(500).json({
      message: "Failed to modify booking",
    });
  }
};

// Cancel a booking belonging to the logged-in customer.
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (booking.status === "Cancelled") {
      return res.status(400).json({
        message: "Booking is already cancelled",
      });
    }

    booking.status = "Cancelled";
    await booking.save();

    return res.status(200).json({
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    console.error("Cancel booking error:", error);

    return res.status(500).json({
      message: "Failed to cancel booking",
    });
  }
};

// Check room availability for selected dates.
export const checkRoomAvailability = async (req, res) => {
  try {
    const { hotelId, checkIn, checkOut } = req.query;

    if (!hotelId) {
      return res.status(400).json({
        message: "Hotel ID is required",
      });
    }

    const dateError = validateBookingDates(checkIn, checkOut);

    if (dateError) {
      return res.status(400).json({ message: dateError });
    }

    const availability = await getRoomAvailability(
      hotelId,
      checkIn,
      checkOut
    );

    if (availability.error) {
      return res.status(404).json({
        message: availability.error,
      });
    }

    return res.status(200).json({
      hotelId,
      checkIn,
      checkOut,
      totalRooms: availability.totalRooms,
      bookedRooms: availability.bookedRooms,
      availableRooms: availability.availableRooms,
    });
  } catch (error) {
    console.error("Check availability error:", error);

    return res.status(500).json({
      message: "Failed to check room availability",
    });
  }
};
