
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  BedDouble,
  Users,
  IndianRupee,
  LoaderCircle,
  Minus,
  Plus,
  Baby,
  CheckCircle,
  AlertCircle,
  Wifi,
  Waves,
  CarFront,
  Utensils,
  Snowflake,
  Dumbbell,
  ConciergeBell,
  Shirt,
  Tv,
  Coffee,
  Sparkles,
  ShieldCheck,
  Star,
  Compass,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../lib/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const getLocalDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Map common hotel facilities to icons.
const facilityIconMap = {
  wifi: Wifi,
  "free wifi": Wifi,
  "wi-fi": Wifi,
  "swimming pool": Waves,
  pool: Waves,
  parking: CarFront,
  "free parking": CarFront,
  restaurant: Utensils,
  "air conditioning": Snowflake,
  ac: Snowflake,
  gym: Dumbbell,
  fitness: Dumbbell,
  "room service": ConciergeBell,
  laundry: Shirt,
  television: Tv,
  tv: Tv,
  "tea and coffee": Coffee,
  housekeeping: Sparkles,
  security: ShieldCheck,
};

const getFacilityIcon = (facility) => {
  const normalized = facility.trim().toLowerCase();
  return facilityIconMap[normalized] || ShieldCheck;
};

const HotelDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const today = getLocalDate();

  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availability, setAvailability] = useState(null);

  // Rating and review state.
  const [ratingsData, setRatingsData] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratings: [],
  });
  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [ratingsLoading, setRatingsLoading] = useState(true);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Nearby sightseeing places state.
  const [sightseeingPlaces, setSightseeingPlaces] = useState([]);
  const [sightseeingLoading, setSightseeingLoading] = useState(true);

  const [booking, setBooking] = useState({
    customerName: "",
    customerEmail: "",
    checkIn: "",
    checkOut: "",
    adults: 1,
    children: 0,
    numberOfRooms: 1,
  });

  // Fetch hotel details.
  useEffect(() => {
    let active = true;

    const fetchHotel = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/hotels/${id}`);

        if (active) {
          setHotel(response.data);
        }
      } catch (error) {
        console.error("Error fetching hotel:", error);

        if (active) {
          toast.error("Failed to load hotel details");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchHotel();

    return () => {
      active = false;
    };
  }, [id]);

  // Fetch nearby sightseeing places for this hotel.
  // The backend sightseeing route uses the /api/sightseeing prefix.
  useEffect(() => {
    let active = true;

    const fetchSightseeingPlaces = async () => {
      setSightseeingLoading(true);

      try {
        const response = await api.get(
          `/api/sightseeing/hotel/${id}`
        );

        if (active) {
          setSightseeingPlaces(
            Array.isArray(response.data.places)
              ? response.data.places
              : []
          );
        }
      } catch (error) {
        console.error("Error fetching sightseeing places:", error);

        if (active) {
          setSightseeingPlaces([]);
        }
      } finally {
        if (active) {
          setSightseeingLoading(false);
        }
      }
    };

    if (id) {
      fetchSightseeingPlaces();
    } else {
      setSightseeingPlaces([]);
      setSightseeingLoading(false);
    }

    return () => {
      active = false;
    };
  }, [id]);

  // Fetch hotel ratings and reviews.
  useEffect(() => {
    let active = true;

    const fetchRatings = async () => {
      setRatingsLoading(true);

      try {
        const response = await api.get(`/ratings/${id}`);

        if (active) {
          setRatingsData(response.data);
        }
      } catch (error) {
        console.error("Error fetching hotel ratings:", error);
      } finally {
        if (active) {
          setRatingsLoading(false);
        }
      }
    };

    fetchRatings();

    return () => {
      active = false;
    };
  }, [id]);

  // Submit a hotel review.
  const handleRatingSubmit = async (event) => {
    event.preventDefault();

    if (!localStorage.getItem("token")) {
      toast.error("Please log in to submit a review");
      navigate("/login");
      return;
    }

    if (selectedRating < 1 || selectedRating > 5) {
      toast.error("Please select a star rating");
      return;
    }

    if (
      reviewComment.trim().length < 3 ||
      reviewComment.trim().length > 1000
    ) {
      toast.error("Your review must be 3–1000 characters");
      return;
    }

    setReviewSubmitting(true);

    try {
      await api.post("/ratings", {
        hotelId: id,
        rating: selectedRating,
        comment: reviewComment.trim(),
      });

      toast.success("Your review was submitted!");
      setSelectedRating(0);
      setReviewComment("");

      const response = await api.get(`/ratings/${id}`);
      setRatingsData(response.data);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to submit your review"
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Check availability whenever valid dates are selected.
  useEffect(() => {
    let active = true;

    setAvailability(null);

    if (
      !id ||
      !booking.checkIn ||
      !booking.checkOut ||
      booking.checkIn < today ||
      booking.checkOut <= booking.checkIn
    ) {
      setAvailabilityLoading(false);
      return;
    }

    const checkAvailability = async () => {
      setAvailabilityLoading(true);

      try {
        const response = await api.get("/bookings/availability", {
          params: {
            hotelId: id,
            checkIn: booking.checkIn,
            checkOut: booking.checkOut,
          },
        });

        if (active) {
          setAvailability(response.data);
        }
      } catch (error) {
        console.error("Availability check failed:", error);

        if (active) {
          setAvailability({
            error:
              error.response?.data?.message ||
              "Unable to check room availability.",
          });
        }
      } finally {
        if (active) {
          setAvailabilityLoading(false);
        }
      }
    };

    checkAvailability();

    return () => {
      active = false;
    };
  }, [id, booking.checkIn, booking.checkOut, today]);

  const numberOfNights = useMemo(() => {
    if (!booking.checkIn || !booking.checkOut) return 0;

    const start = new Date(`${booking.checkIn}T00:00:00`);
    const end = new Date(`${booking.checkOut}T00:00:00`);

    return Math.max(
      0,
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
  }, [booking.checkIn, booking.checkOut]);

  const totalGuests = booking.adults + booking.children;

  const totalPrice = hotel
    ? numberOfNights *
      booking.numberOfRooms *
      Number(hotel.pricePerNight)
    : 0;

  const availableRooms = availability?.availableRooms ?? 0;

  const updateBooking = (field, value) => {
    setBooking((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const changeCount = (field, amount, minimum, maximum) => {
    setBooking((previous) => ({
      ...previous,
      [field]: Math.min(
        maximum,
        Math.max(minimum, previous[field] + amount)
      ),
    }));
  };

  // Create a booking.
  const handleBooking = async (event) => {
    event.preventDefault();

    if (!localStorage.getItem("token")) {
      toast.error("Please log in before booking");
      navigate("/login");
      return;
    }

    if (
      !booking.customerName.trim() ||
      !booking.customerEmail.trim() ||
      !booking.checkIn ||
      !booking.checkOut
    ) {
      toast.error("Please complete all booking fields");
      return;
    }

    if (booking.checkIn < today) {
      toast.error("Check-in cannot be in the past");
      return;
    }

    if (booking.checkOut <= booking.checkIn) {
      toast.error("Check-out must be after check-in");
      return;
    }

    if (
      totalGuests < 1 ||
      numberOfNights < 1 ||
      booking.numberOfRooms < 1 ||
      !Number.isFinite(totalPrice) ||
      totalPrice <= 0
    ) {
      toast.error("Please select valid booking details");
      return;
    }

    if (availabilityLoading) {
      toast.error("Please wait while we check availability");
      return;
    }

    if (availability?.error || !availability) {
      toast.error("Please check room availability before booking");
      return;
    }

    if (booking.numberOfRooms > availableRooms) {
      toast.error(`Only ${availableRooms} room(s) are available`);
      return;
    }

    setSubmitting(true);

    try {
      await api.post("/bookings", {
        hotel: hotel._id,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        adults: booking.adults,
        children: booking.children,
        numberOfRooms: booking.numberOfRooms,
      });

      toast.success("Booking confirmed successfully!");
      navigate("/my-bookings");
    } catch (error) {
      console.error("Error creating booking:", error);

      if (error.response?.status === 401) {
        toast.error("Your session expired. Please log in again.");
        navigate("/login");
      } else {
        toast.error(
          error.response?.data?.message ||
            "Failed to create booking. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <LoaderCircle className="size-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen bg-base-200 flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Hotel Not Found</h1>

        <Link to="/" className="btn btn-primary">
          <ArrowLeft className="size-5" />
          Back to Hotels
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <Link to="/" className="btn btn-ghost mb-6">
          <ArrowLeft className="size-5" />
          Back to Hotels
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Hotel information */}
          <section className="lg:col-span-3">
            <div className="card bg-base-100 shadow-xl">
              {/* Hotel photo */}
              {hotel.imageUrl && (
                <figure className="h-64 w-full overflow-hidden bg-base-200 sm:h-80 lg:h-96">
                  <img
                    src={hotel.imageUrl}
                    alt={`${hotel.hotelName} hotel`}
                    className="h-full w-full object-cover"
                    loading="eager"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                </figure>
              )}

              <div className="card-body">
                <div className="badge badge-secondary">
                  {hotel.roomType} Room
                </div>

                <h1 className="text-3xl font-bold mt-3">
                  {hotel.hotelName}
                </h1>

                <p className="flex items-center gap-2 text-base-content/70">
                  <MapPin className="size-5 text-primary" />
                  {hotel.location}
                </p>

                <div className="flex items-center gap-2 text-primary font-semibold text-xl mt-3">
                  <IndianRupee className="size-5" />
                  {Number(hotel.pricePerNight).toLocaleString("en-IN")}

                  <span className="text-sm text-base-content/60 font-normal">
                    / room / night
                  </span>
                </div>

                <div className="divider" />

                <h2 className="text-xl font-bold">About this hotel</h2>

                <p className="leading-7 text-base-content/80">
                  {hotel.description}
                </p>

                <div className="mt-5 flex items-center gap-3">
                  <BedDouble className="size-5 text-primary" />
                  <span>{hotel.roomType} accommodation</span>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <BedDouble className="size-5 text-primary" />
                  <span>{hotel.totalRooms ?? 20} rooms in total</span>
                </div>

                {/* Hotel facilities */}
                <div className="divider" />

                <section className="mt-2">
                  <h2 className="text-xl font-bold mb-4">
                    Hotel Facilities & Amenities
                  </h2>

                  {Array.isArray(hotel.facilities) &&
                  hotel.facilities.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {hotel.facilities.map((facility, index) => {
                        const FacilityIcon = getFacilityIcon(facility);

                        return (
                          <div
                            key={`${facility}-${index}`}
                            className="flex items-center gap-2 rounded-lg bg-base-200 p-3"
                          >
                            <FacilityIcon className="size-5 shrink-0 text-primary" />

                            <span className="text-sm font-medium">
                              {facility}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-base-content/60">
                      Facilities will be updated soon.
                    </p>
                  )}
                </section>

                {/* Nearby Sightseeing Places */}
                <div className="divider" />

                <section className="mt-2">
                  <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                    <Compass className="size-6 text-primary" />
                    Nearby Sightseeing Places
                  </h2>

                  <p className="text-sm text-base-content/70 mb-5">
                    Explore attractions near {hotel.hotelName}.
                  </p>

                  {sightseeingLoading ? (
                    <div className="flex items-center gap-2 py-5">
                      <LoaderCircle className="size-5 animate-spin text-primary" />
                      <span className="text-sm">
                        Loading sightseeing places...
                      </span>
                    </div>
                  ) : sightseeingPlaces.length === 0 ? (
                    <div className="rounded-xl bg-base-200 p-4">
                      <p className="text-sm text-base-content/70">
                        No nearby sightseeing places have been added for this
                        hotel yet.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {sightseeingPlaces.map((place) => (
                        <article
                          key={place._id}
                          className="card bg-base-100 border border-base-300 overflow-hidden"
                        >
                          {place.imageUrl && (
                            <figure className="h-44 bg-base-200">
                              <img
                                src={place.imageUrl}
                                alt={place.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                onError={(event) => {
                                  event.currentTarget.style.display = "none";
                                }}
                              />
                            </figure>
                          )}

                          <div className="card-body p-4 gap-2">
                            <h3 className="card-title text-base">
                              {place.name}
                            </h3>

                            <p className="flex items-start gap-2 text-sm text-base-content/70">
                              <MapPin className="size-4 shrink-0 mt-0.5 text-primary" />
                              <span>{place.location}</span>
                            </p>

                            <p className="text-sm">
                              <span className="font-semibold">Distance:</span>{" "}
                              {place.distance}
                            </p>

                            <p className="text-sm leading-6 text-base-content/80">
                              {place.description}
                            </p>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </section>

                {/* Hotel Ratings and Reviews */}
                <div className="divider" />

                <section className="mt-2">
                  <h2 className="text-xl font-bold mb-4">
                    Ratings & Reviews
                  </h2>

                  {ratingsLoading ? (
                    <p className="text-sm text-base-content/70">
                      Loading reviews...
                    </p>
                  ) : (
                    <div className="mb-5 rounded-xl bg-base-200 p-4">
                      <div className="flex items-center gap-3">
                        <Star className="size-8 fill-yellow-400 text-yellow-400" />

                        <div>
                          <p className="text-2xl font-bold">
                            {Number(
                              ratingsData.averageRating || 0
                            ).toFixed(1)}{" "}
                            / 5
                          </p>

                          <p className="text-sm text-base-content/70">
                            {ratingsData.totalReviews}{" "}
                            {ratingsData.totalReviews === 1
                              ? "review"
                              : "reviews"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <form
                    onSubmit={handleRatingSubmit}
                    className="space-y-4"
                  >
                    <div>
                      <p className="font-semibold mb-2">
                        Rate this hotel
                      </p>

                      <div
                        className="flex gap-2"
                        role="group"
                        aria-label="Hotel rating"
                      >
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setSelectedRating(star)}
                            aria-label={`${star} star${
                              star > 1 ? "s" : ""
                            }`}
                            aria-pressed={selectedRating === star}
                            className="rounded p-1 focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <Star
                              className={`size-8 ${
                                star <= selectedRating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-base-content/40"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <label className="form-control">
                      <span className="label-text mb-2">
                        Write your review
                      </span>

                      <textarea
                        className="textarea textarea-bordered w-full"
                        placeholder="Share your experience at this hotel..."
                        value={reviewComment}
                        onChange={(event) =>
                          setReviewComment(event.target.value)
                        }
                        minLength={3}
                        maxLength={1000}
                        rows={4}
                        required
                      />
                    </label>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={
                        reviewSubmitting ||
                        selectedRating === 0 ||
                        reviewComment.trim().length < 3 ||
                        reviewComment.trim().length > 1000
                      }
                    >
                      {reviewSubmitting
                        ? "Submitting..."
                        : "Submit Review"}
                    </button>
                  </form>

                  <div className="mt-6 space-y-4">
                    <h3 className="font-bold text-lg">
                      Customer Reviews
                    </h3>

                    {ratingsData.ratings.length === 0 ? (
                      <p className="text-sm text-base-content/70">
                        No reviews yet. Be the first to review this hotel!
                      </p>
                    ) : (
                      ratingsData.ratings.map((item) => (
                        <article
                          key={item._id}
                          className="rounded-xl border border-base-300 p-4"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-semibold">
                              {item.user?.name || "Customer"}
                            </p>

                            <div className="flex items-center gap-1">
                              <Star className="size-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-semibold">
                                {item.rating}/5
                              </span>
                            </div>
                          </div>

                          <p className="mt-2 whitespace-pre-wrap text-sm">
                            {item.comment}
                          </p>

                          <p className="mt-2 text-xs text-base-content/60">
                            {new Date(
                              item.createdAt
                            ).toLocaleDateString("en-IN")}
                          </p>
                        </article>
                      ))
                    )}
                  </div>
                </section>
              </div>
            </div>
          </section>

          {/* Booking form */}
          <section className="lg:col-span-2">
            <form
              onSubmit={handleBooking}
              className="card bg-base-100 shadow-xl"
            >
              <div className="card-body">
                <h2 className="card-title text-2xl">Book Your Stay</h2>

                <p className="text-sm text-base-content/70">
                  Select your dates, guests, and number of rooms.
                </p>

                <label className="form-control mt-3">
                  <span className="label-text mb-2">Full Name</span>

                  <input
                    className="input input-bordered w-full"
                    value={booking.customerName}
                    onChange={(event) =>
                      updateBooking("customerName", event.target.value)
                    }
                    placeholder="Enter your full name"
                    autoComplete="name"
                    required
                  />
                </label>

                <label className="form-control mt-3">
                  <span className="label-text mb-2">Email Address</span>

                  <input
                    type="email"
                    className="input input-bordered w-full"
                    value={booking.customerEmail}
                    onChange={(event) =>
                      updateBooking("customerEmail", event.target.value)
                    }
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <label className="form-control">
                    <span className="label-text mb-2 flex gap-1 items-center">
                      <CalendarDays className="size-4" />
                      Check-in
                    </span>

                    <input
                      type="date"
                      className="input input-bordered w-full"
                      min={today}
                      value={booking.checkIn}
                      onChange={(event) =>
                        updateBooking("checkIn", event.target.value)
                      }
                      required
                    />
                  </label>

                  <label className="form-control">
                    <span className="label-text mb-2 flex gap-1 items-center">
                      <CalendarDays className="size-4" />
                      Check-out
                    </span>

                    <input
                      type="date"
                      className="input input-bordered w-full"
                      min={booking.checkIn || today}
                      value={booking.checkOut}
                      onChange={(event) =>
                        updateBooking("checkOut", event.target.value)
                      }
                      required
                    />
                  </label>
                </div>

                {/* Availability information */}
                <div className="mt-4 rounded-lg bg-base-200 p-3">
                  {!booking.checkIn || !booking.checkOut ? (
                    <p className="text-sm text-base-content/70">
                      Choose check-in and check-out dates to see room
                      availability.
                    </p>
                  ) : availabilityLoading ? (
                    <p className="flex items-center gap-2 text-sm">
                      <LoaderCircle className="size-4 animate-spin" />
                      Checking room availability...
                    </p>
                  ) : availability?.error ? (
                    <p className="flex items-center gap-2 text-sm text-error">
                      <AlertCircle className="size-4" />
                      {availability.error}
                    </p>
                  ) : availability ? (
                    <div className="space-y-1">
                      <p className="flex items-center gap-2 font-semibold">
                        <CheckCircle className="size-5 text-success" />

                        {availableRooms > 0
                          ? `${availableRooms} room(s) available`
                          : "No rooms available for these dates"}
                      </p>

                      <p className="text-xs text-base-content/70">
                        {availability.bookedRooms} of{" "}
                        {availability.totalRooms} rooms are booked for these
                        dates.
                      </p>
                    </div>
                  ) : null}
                </div>

                <div className="divider" />

                {/* Room count */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <BedDouble className="size-5 text-primary" />

                    <div>
                      <p className="font-semibold">Rooms</p>
                      <p className="text-xs text-base-content/60">
                        Select number of rooms
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="btn btn-circle btn-sm btn-outline"
                      onClick={() =>
                        changeCount("numberOfRooms", -1, 1, 20)
                      }
                      disabled={booking.numberOfRooms <= 1}
                      aria-label="Remove one room"
                    >
                      <Minus className="size-4" />
                    </button>

                    <span className="w-5 text-center font-semibold">
                      {booking.numberOfRooms}
                    </span>

                    <button
                      type="button"
                      className="btn btn-circle btn-sm btn-outline"
                      onClick={() =>
                        changeCount(
                          "numberOfRooms",
                          1,
                          1,
                          Math.min(20, availableRooms || 20)
                        )
                      }
                      disabled={
                        !availability ||
                        availabilityLoading ||
                        booking.numberOfRooms >= availableRooms ||
                        availableRooms === 0
                      }
                      aria-label="Add one room"
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                </div>

                <div className="divider" />

                {/* Guest count */}
                <div className="space-y-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Users className="size-5 text-primary" />

                      <div>
                        <p className="font-semibold">Adults</p>
                        <p className="text-xs text-base-content/60">
                          Ages 13 or above
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        className="btn btn-circle btn-sm btn-outline"
                        onClick={() => changeCount("adults", -1, 1, 10)}
                        disabled={booking.adults <= 1}
                        aria-label="Remove one adult"
                      >
                        <Minus className="size-4" />
                      </button>

                      <span className="w-5 text-center font-semibold">
                        {booking.adults}
                      </span>

                      <button
                        type="button"
                        className="btn btn-circle btn-sm btn-outline"
                        onClick={() => changeCount("adults", 1, 1, 10)}
                        disabled={totalGuests >= 16}
                        aria-label="Add one adult"
                      >
                        <Plus className="size-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Baby className="size-5 text-primary" />

                      <div>
                        <p className="font-semibold">Children</p>
                        <p className="text-xs text-base-content/60">
                          No age details required
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        className="btn btn-circle btn-sm btn-outline"
                        onClick={() => changeCount("children", -1, 0, 6)}
                        disabled={booking.children <= 0}
                        aria-label="Remove one child"
                      >
                        <Minus className="size-4" />
                      </button>

                      <span className="w-5 text-center font-semibold">
                        {booking.children}
                      </span>

                      <button
                        type="button"
                        className="btn btn-circle btn-sm btn-outline"
                        onClick={() => changeCount("children", 1, 0, 6)}
                        disabled={totalGuests >= 16}
                        aria-label="Add one child"
                      >
                        <Plus className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-base-200 p-3 mt-2 flex items-center justify-between">
                  <span className="text-base-content/70">Total guests</span>

                  <span className="font-bold">
                    {totalGuests} {totalGuests === 1 ? "guest" : "guests"}
                  </span>
                </div>

                <div className="divider" />

                {/* Price breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between gap-3">
                    <span className="text-base-content/70">
                      Price per room / night
                    </span>

                    <span>
                      ₹{Number(hotel.pricePerNight).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span className="text-base-content/70">Rooms</span>
                    <span>{booking.numberOfRooms}</span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span className="text-base-content/70">Nights</span>
                    <span>{numberOfNights}</span>
                  </div>

                  <div className="flex justify-between gap-3 font-bold text-lg">
                    <span>Total</span>
                    <span>₹{totalPrice.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-full mt-4"
                  disabled={
                    submitting ||
                    availabilityLoading ||
                    !availability ||
                    Boolean(availability?.error) ||
                    availableRooms < booking.numberOfRooms
                  }
                >
                  {submitting ? (
                    <>
                      <LoaderCircle className="size-5 animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    "Confirm Booking"
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HotelDetailsPage;
