import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Hotel,
  CalendarCheck,
  Plus,
  Pencil,
  Trash2,
  LoaderCircle,
  ArrowLeft,
  Users,
  IndianRupee,
  RefreshCw,
  MapPin,
  Eye,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../lib/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const emptyHotelForm = {
  hotelName: "",
  location: "",
  pricePerNight: "",
  roomType: "",
  description: "",
  totalRooms: 20,
  facilities: "",
  imageUrl: "",
};

const emptySightseeingForm = {
  hotel: "",
  name: "",
  location: "",
  distance: "",
  description: "",
  imageUrl: "",
};

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Hotel state
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [form, setForm] = useState({ ...emptyHotelForm });
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const sightseeingFormRef = useRef(null);

  // Booking state
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  // Sightseeing state
  const [places, setPlaces] = useState([]);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [sightseeingForm, setSightseeingForm] =
    useState({ ...emptySightseeingForm });
  const [editingPlaceId, setEditingPlaceId] = useState(null);
  const [savingPlace, setSavingPlace] = useState(false);
  const [deletingPlaceId, setDeletingPlaceId] = useState(null);
  const [selectedHotelId, setSelectedHotelId] = useState("");

  // Fetch hotels
  const fetchHotels = async () => {
    try {
      const response = await api.get("/hotels");
      const data = response.data;

      const hotelList = Array.isArray(data)
        ? data
        : data.hotels || [];

      setHotels(hotelList);

      setSelectedHotelId((current) => {
        if (
          current &&
          hotelList.some((hotel) => hotel._id === current)
        ) {
          return current;
        }

        return hotelList[0]?._id || "";
      });
    } catch (error) {
      console.error("Failed to load hotels:", error);

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        toast.error("Admin access required");
        navigate("/");
      } else {
        toast.error("Unable to load hotels");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch all bookings
  const fetchBookings = async () => {
    try {
      setBookingsLoading(true);

      const response = await api.get("/bookings/admin/all");

      setBookings(
        Array.isArray(response.data.bookings)
          ? response.data.bookings
          : []
      );
    } catch (error) {
      console.error("Failed to load bookings:", error);

      toast.error(
        error.response?.data?.message ||
          "Unable to load customer bookings"
      );
    } finally {
      setBookingsLoading(false);
    }
  };

  // Fetch sightseeing places for a selected hotel
  const fetchSightseeing = async (hotelId = selectedHotelId) => {
    if (!hotelId) {
      setPlaces([]);
      return;
    }

    try {
      setPlacesLoading(true);

      const response = await api.get(
        `/api/sightseeing/hotel/${hotelId}`
      );

      setPlaces(
        Array.isArray(response.data.places)
          ? response.data.places
          : []
      );
    } catch (error) {
      console.error("Failed to load sightseeing places:", error);

      toast.error(
        error.response?.data?.message ||
          "Unable to load sightseeing places"
      );
    } finally {
      setPlacesLoading(false);
    }
  };

  // Check login and load dashboard data
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!localStorage.getItem("token")) {
      toast.error("Please log in first");
      navigate("/login");
      return;
    }

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);

        if (user.role !== "admin") {
          toast.error("Only admins can access this page");
          navigate("/");
          return;
        }
      } catch {
        toast.error("Please log in again");
        navigate("/login");
        return;
      }
    }

    fetchHotels();
    fetchBookings();
  }, [navigate]);

  // Load sightseeing places when selected hotel changes
  useEffect(() => {
    if (selectedHotelId) {
      fetchSightseeing(selectedHotelId);
    } else {
      setPlaces([]);
    }
  }, [selectedHotelId]);

  // Reset hotel form
  const resetForm = () => {
    setForm({ ...emptyHotelForm });
    setEditingId(null);
  };

  // Handle hotel form changes
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Add or update a hotel
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !form.hotelName.trim() ||
      !form.location.trim() ||
      form.pricePerNight === "" ||
      !form.roomType.trim() ||
      !form.description.trim()
    ) {
      toast.error("Please complete all required fields");
      return;
    }

    // Validate the optional image URL
    const imageUrl = form.imageUrl.trim();

    if (imageUrl) {
      try {
        const parsedUrl = new URL(imageUrl);

        if (
          parsedUrl.protocol !== "http:" &&
          parsedUrl.protocol !== "https:"
        ) {
          toast.error("Image URL must start with HTTP or HTTPS");
          return;
        }
      } catch {
        toast.error("Please enter a valid image URL");
        return;
      }
    }

    const price = Number(form.pricePerNight);
    const rooms = Number(form.totalRooms);

    if (!Number.isFinite(price) || price < 0) {
      toast.error("Enter a valid room price");
      return;
    }

    if (!Number.isInteger(rooms) || rooms < 1) {
      toast.error("Total rooms must be at least 1");
      return;
    }

    const payload = {
      hotelName: form.hotelName.trim(),
      location: form.location.trim(),
      pricePerNight: price,
      roomType: form.roomType.trim(),
      description: form.description.trim(),
      totalRooms: rooms,
      imageUrl,
      facilities: form.facilities
        .split(",")
        .map((facility) => facility.trim())
        .filter(Boolean),
    };

    setSaving(true);

    try {
      if (editingId) {
        await api.put(`/hotels/${editingId}`, payload);
        toast.success("Hotel updated successfully");
      } else {
        await api.post("/hotels", payload);
        toast.success("Hotel added successfully");
      }

      resetForm();
      await fetchHotels();
    } catch (error) {
      console.error("Save hotel error:", error);

      toast.error(
        error.response?.data?.message || "Failed to save hotel"
      );
    } finally {
      setSaving(false);
    }
  };

  // Load hotel details into the form
  const handleEdit = (hotel) => {
    setEditingId(hotel._id);

    setForm({
      hotelName: hotel.hotelName || "",
      location: hotel.location || "",
      pricePerNight: hotel.pricePerNight ?? "",
      roomType: hotel.roomType || "",
      description: hotel.description || "",
      totalRooms: hotel.totalRooms ?? 20,
      facilities: Array.isArray(hotel.facilities)
        ? hotel.facilities.join(", ")
        : "",
      imageUrl: hotel.imageUrl || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete a hotel
  const handleDelete = async (hotelId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this hotel?"
    );

    if (!confirmed) return;

    setDeletingId(hotelId);

    try {
      await api.delete(`/hotels/${hotelId}`);

      setHotels((previous) =>
        previous.filter((hotel) => hotel._id !== hotelId)
      );

      if (editingId === hotelId) {
        resetForm();
      }

      if (selectedHotelId === hotelId) {
        setSelectedHotelId("");
        setPlaces([]);
      }

      toast.success("Hotel deleted successfully");
      await fetchHotels();
    } catch (error) {
      console.error("Delete hotel error:", error);

      toast.error(
        error.response?.data?.message || "Failed to delete hotel"
      );
    } finally {
      setDeletingId(null);
    }
  };

  // Handle sightseeing form changes
  const handleSightseeingChange = (event) => {
    const { name, value } = event.target;

    setSightseeingForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Reset sightseeing form
  const resetSightseeingForm = () => {
    setSightseeingForm({
      ...emptySightseeingForm,
      hotel: selectedHotelId,
    });

    setEditingPlaceId(null);
  };

  // Add or update sightseeing place
  const handleSightseeingSubmit = async (event) => {
    event.preventDefault();

    const {
      hotel,
      name,
      location,
      distance,
      description,
      imageUrl,
    } = sightseeingForm;

    if (
      !hotel ||
      !name.trim() ||
      !location.trim() ||
      !distance.trim() ||
      !description.trim()
    ) {
      toast.error("Please complete all required sightseeing fields");
      return;
    }

    const payload = {
      hotel,
      name: name.trim(),
      location: location.trim(),
      distance: distance.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim(),
    };

    setSavingPlace(true);

    try {
      if (editingPlaceId) {
        await api.put(
          `/api/sightseeing/${editingPlaceId}`,
          payload
        );

        toast.success("Sightseeing place updated successfully");
      } else {
        await api.post("/api/sightseeing", payload);

        toast.success("Sightseeing place added successfully");
      }

      setSelectedHotelId(hotel);
      resetSightseeingForm();
      await fetchSightseeing(hotel);
    } catch (error) {
      console.error("Save sightseeing place error:", error);

      toast.error(
        error.response?.data?.message ||
          "Unable to save sightseeing place"
      );
    } finally {
      setSavingPlace(false);
    }
  };

  // Load sightseeing place into the edit form
  
const handleEditSightseeing = (place) => {
  const hotelId =
    typeof place.hotel === "object"
      ? place.hotel?._id
      : place.hotel;

  setSelectedHotelId(hotelId || "");

  setSightseeingForm({
    hotel: hotelId || "",
    name: place.name || "",
    location: place.location || "",
    distance: place.distance || "",
    description: place.description || "",
    imageUrl: place.imageUrl || "",
  });

  setEditingPlaceId(place._id);

  // Scroll to the sightseeing form instead of the page top.
  requestAnimationFrame(() => {
    sightseeingFormRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });
};


  // Delete sightseeing place
  const handleDeleteSightseeing = async (placeId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this sightseeing place?"
    );

    if (!confirmed) return;

    setDeletingPlaceId(placeId);

    try {
      await api.delete(`/api/sightseeing/${placeId}`);

      setPlaces((previous) =>
        previous.filter((place) => place._id !== placeId)
      );

      if (editingPlaceId === placeId) {
        resetSightseeingForm();
      }

      toast.success("Sightseeing place deleted successfully");
    } catch (error) {
      console.error("Delete sightseeing error:", error);

      toast.error(
        error.response?.data?.message ||
          "Unable to delete sightseeing place"
      );
    } finally {
      setDeletingPlaceId(null);
    }
  };

  // Format dates for bookings
  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "—";

    return parsedDate.toLocaleDateString("en-IN");
  };

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Link to="/" className="btn btn-ghost mb-5">
          <ArrowLeft className="size-5" />
          Back to Website
        </Link>

        {/* Dashboard heading and statistics */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <p className="text-sm text-primary font-semibold">
              SOLSTICE STAY
            </p>

            <h1 className="text-3xl font-bold mt-1">
              Admin Dashboard
            </h1>

            <p className="text-base-content/70 mt-2">
              Manage hotels, facilities, bookings, and sightseeing places.
            </p>
          </div>

          <div className="stats shadow">
            <div className="stat">
              <div className="stat-figure text-primary">
                <Hotel className="size-8" />
              </div>
              <div className="stat-title">Total Hotels</div>
              <div className="stat-value">{hotels.length}</div>
            </div>

            <div className="stat">
              <div className="stat-figure text-secondary">
                <CalendarCheck className="size-8" />
              </div>
              <div className="stat-title">Total Bookings</div>
              <div className="stat-value">{bookings.length}</div>
            </div>
          </div>
        </div>

        {/* Add or edit hotel */}
        <section className="card bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            <h2 className="card-title text-xl">
              {editingId ? (
                <Pencil className="size-5" />
              ) : (
                <Plus className="size-5" />
              )}
              {editingId ? "Edit Hotel" : "Add New Hotel"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="form-control">
                  <span className="label-text mb-2">Hotel Name *</span>
                  <input
                    className="input input-bordered"
                    name="hotelName"
                    value={form.hotelName}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label className="form-control">
                  <span className="label-text mb-2">Location *</span>
                  <input
                    className="input input-bordered"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label className="form-control">
                  <span className="label-text mb-2">
                    Price per Room / Night (₹) *
                  </span>
                  <input
                    className="input input-bordered"
                    name="pricePerNight"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.pricePerNight}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label className="form-control">
                  <span className="label-text mb-2">Room Type *</span>
                  <select
                    className="select select-bordered"
                    name="roomType"
                    value={form.roomType}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select room type</option>
                    <option value="Standard">Standard</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Suite">Suite</option>
                    <option value="Family">Family</option>
                  </select>
                </label>

                <label className="form-control">
                  <span className="label-text mb-2">Total Rooms *</span>
                  <input
                    className="input input-bordered"
                    name="totalRooms"
                    type="number"
                    min="1"
                    value={form.totalRooms}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label className="form-control">
                  <span className="label-text mb-2">
                    Facilities (comma-separated)
                  </span>
                  <input
                    className="input input-bordered"
                    name="facilities"
                    value={form.facilities}
                    onChange={handleChange}
                    placeholder="Free Wi-Fi, Parking, Restaurant"
                  />
                </label>
              </div>

              <label className="form-control">
                <span className="label-text mb-2">Description *</span>
                <textarea
                  className="textarea textarea-bordered min-h-28"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                />
              </label>

              {/* Hotel image URL */}
              <label className="form-control">
                <span className="label-text mb-2">
                  Hotel Image URL (optional)
                </span>
                <input
                  className="input input-bordered"
                  type="url"
                  name="imageUrl"
                  value={form.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/hotel-photo.jpg"
                />
                <span className="label-text-alt mt-1">
                  Paste a direct image link starting with https://
                </span>
              </label>

              {/* Hotel image preview */}
              {form.imageUrl.trim() && (
                <div className="mt-3">
                  <p className="font-medium mb-2">Image Preview</p>
                  <img
                    src={form.imageUrl.trim()}
                    alt="Hotel preview"
                    className="h-56 w-full max-w-lg rounded-xl object-cover border border-base-300"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                    onLoad={(event) => {
                      event.currentTarget.style.display = "block";
                    }}
                  />
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? (
                    <LoaderCircle className="size-5 animate-spin" />
                  ) : (
                    <Plus className="size-5" />
                  )}

                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Hotel"
                      : "Add Hotel"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={resetForm}
                  >
                    Cancel Editing
                  </button>
                )}
              </div>
            </form>
          </div>
        </section>

        {/* Manage hotels */}
        <section className="card bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            <h2 className="card-title text-xl mb-4">
              <LayoutDashboard className="size-5" />
              Manage Hotels
            </h2>

            {loading ? (
              <div className="flex justify-center py-10">
                <LoaderCircle className="size-8 animate-spin text-primary" />
              </div>
            ) : hotels.length === 0 ? (
              <p className="text-base-content/70">
                No hotels found. Add your first hotel above.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Photo</th>
                      <th>Hotel</th>
                      <th>Location</th>
                      <th>Price / Night</th>
                      <th>Facilities</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {hotels.map((hotel) => (
                      <tr key={hotel._id}>
                        <td>
                          {hotel.imageUrl ? (
                            <img
                              src={hotel.imageUrl}
                              alt={hotel.hotelName}
                              className="h-14 w-20 rounded-lg object-cover"
                              onError={(event) => {
                                event.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="flex h-14 w-20 items-center justify-center rounded-lg bg-base-200">
                              <Hotel className="size-6 text-base-content/50" />
                            </div>
                          )}
                        </td>

                        <td className="font-semibold">
                          {hotel.hotelName}
                        </td>

                        <td>{hotel.location}</td>

                        <td>
                          ₹
                          {Number(
                            hotel.pricePerNight
                          ).toLocaleString("en-IN")}
                        </td>

                        <td>
                          {Array.isArray(hotel.facilities)
                            ? hotel.facilities.length
                            : 0}
                        </td>

                        <td>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline"
                              onClick={() => handleEdit(hotel)}
                              aria-label={`Edit ${hotel.hotelName}`}
                            >
                              <Pencil className="size-4" />
                            </button>

                            <button
                              type="button"
                              className="btn btn-sm btn-error btn-outline"
                              onClick={() => handleDelete(hotel._id)}
                              disabled={deletingId === hotel._id}
                              aria-label={`Delete ${hotel.hotelName}`}
                            >
                              {deletingId === hotel._id ? (
                                <LoaderCircle className="size-4 animate-spin" />
                              ) : (
                                <Trash2 className="size-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Manage sightseeing places */}
        <section className="card bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            <h2 className="card-title text-xl">
              <MapPin className="size-5" />
              Nearby Sightseeing Places
            </h2>

            <p className="text-sm text-base-content/70">
              Add tourist attractions associated with a hotel.
            </p>

            {hotels.length === 0 && !loading ? (
              <p className="alert mt-4">
                Add a hotel before adding sightseeing places.
              </p>
            ) : (
              <>
                <form
                  ref={sightseeingFormRef}
                  onSubmit={handleSightseeingSubmit}
                  className="space-y-4 mt-4 scroll-mt-6"
                 >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="form-control">
                      <span className="label-text mb-2">
                        Select Hotel *
                      </span>
                      <select
                        className="select select-bordered"
                        name="hotel"
                        value={sightseeingForm.hotel}
                        onChange={handleSightseeingChange}
                        required
                      >
                        <option value="">Choose a hotel</option>
                        {hotels.map((hotel) => (
                          <option key={hotel._id} value={hotel._id}>
                            {hotel.hotelName} — {hotel.location}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="form-control">
                      <span className="label-text mb-2">
                        Sightseeing Place Name *
                      </span>
                      <input
                        className="input input-bordered"
                        name="name"
                        value={sightseeingForm.name}
                        onChange={handleSightseeingChange}
                        placeholder="e.g. Gateway of India"
                        required
                      />
                    </label>

                    <label className="form-control">
                      <span className="label-text mb-2">
                        Place Location *
                      </span>
                      <input
                        className="input input-bordered"
                        name="location"
                        value={sightseeingForm.location}
                        onChange={handleSightseeingChange}
                        placeholder="e.g. Mumbai, Maharashtra"
                        required
                      />
                    </label>

                    <label className="form-control">
                      <span className="label-text mb-2">
                        Distance from Hotel *
                      </span>
                      <input
                        className="input input-bordered"
                        name="distance"
                        value={sightseeingForm.distance}
                        onChange={handleSightseeingChange}
                        placeholder="e.g. 2 km"
                        required
                      />
                    </label>

                    <label className="form-control md:col-span-2">
                      <span className="label-text mb-2">
                        Image URL (optional)
                      </span>
                      <input
                        className="input input-bordered"
                        type="url"
                        name="imageUrl"
                        value={sightseeingForm.imageUrl}
                        onChange={handleSightseeingChange}
                        placeholder="https://example.com/image.jpg"
                      />
                    </label>
                  </div>

                  <label className="form-control">
                    <span className="label-text mb-2">
                      Description *
                    </span>
                    <textarea
                      className="textarea textarea-bordered min-h-24"
                      name="description"
                      value={sightseeingForm.description}
                      onChange={handleSightseeingChange}
                      placeholder="Describe the attraction and what visitors can see."
                      required
                    />
                  </label>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={savingPlace || !hotels.length}
                    >
                      {savingPlace ? (
                        <LoaderCircle className="size-5 animate-spin" />
                      ) : (
                        <Plus className="size-5" />
                      )}

                      {savingPlace
                        ? "Saving..."
                        : editingPlaceId
                          ? "Update Sightseeing Place"
                          : "Add Sightseeing Place"}
                    </button>

                    {editingPlaceId && (
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={resetSightseeingForm}
                      >
                        <X className="size-4" />
                        Cancel Editing
                      </button>
                    )}
                  </div>
                </form>

                <div className="divider" />

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h3 className="text-lg font-semibold">
                    Saved Sightseeing Places
                  </h3>

                  <label className="form-control w-full sm:max-w-sm">
                    <span className="label-text mb-2">
                      View places for hotel
                    </span>
                    <select
                      className="select select-bordered"
                      value={selectedHotelId}
                      onChange={(event) => {
                        setSelectedHotelId(event.target.value);

                        if (editingPlaceId) {
                          resetSightseeingForm();
                        }
                      }}
                    >
                      <option value="">Select a hotel</option>
                      {hotels.map((hotel) => (
                        <option key={hotel._id} value={hotel._id}>
                          {hotel.hotelName}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => fetchSightseeing(selectedHotelId)}
                    disabled={placesLoading || !selectedHotelId}
                  >
                    {placesLoading ? (
                      <LoaderCircle className="size-4 animate-spin" />
                    ) : (
                      <RefreshCw className="size-4" />
                    )}
                    Refresh Places
                  </button>
                </div>

                {placesLoading ? (
                  <div className="flex justify-center py-10">
                    <LoaderCircle className="size-8 animate-spin text-primary" />
                  </div>
                ) : !selectedHotelId ? (
                  <p className="text-base-content/70 py-4">
                    Select a hotel to view its sightseeing places.
                  </p>
                ) : places.length === 0 ? (
                  <p className="text-base-content/70 py-4">
                    No sightseeing places added for this hotel yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    {places.map((place) => (
                      <article
                        key={place._id}
                        className="card border border-base-300 bg-base-100"
                      >
                        {place.imageUrl && (
                          <figure className="h-44 bg-base-200">
                            <img
                              src={place.imageUrl}
                              alt={place.name}
                              className="w-full h-full object-cover"
                              onError={(event) => {
                                event.currentTarget.style.display = "none";
                              }}
                            />
                          </figure>
                        )}

                        <div className="card-body p-4">
                          <h4 className="card-title">
                            {place.name}
                          </h4>

                          <p className="text-sm text-base-content/70 flex items-center gap-2">
                            <MapPin className="size-4 shrink-0" />
                            {place.location}
                          </p>

                          <p className="text-sm">
                            <strong>Distance:</strong> {place.distance}
                          </p>

                          <p className="text-sm whitespace-pre-line">
                            {place.description}
                          </p>

                          <div className="card-actions justify-end mt-2">
                            {place.imageUrl && (
                              <a
                                className="btn btn-sm btn-ghost"
                                href={place.imageUrl}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <Eye className="size-4" />
                                View Image
                              </a>
                            )}

                            <button
                              type="button"
                              className="btn btn-sm btn-outline"
                              onClick={() => handleEditSightseeing(place)}
                            >
                              <Pencil className="size-4" />
                              Edit
                            </button>

                            <button
                              type="button"
                              className="btn btn-sm btn-error btn-outline"
                              onClick={() =>
                                handleDeleteSightseeing(place._id)
                              }
                              disabled={deletingPlaceId === place._id}
                            >
                              {deletingPlaceId === place._id ? (
                                <LoaderCircle className="size-4 animate-spin" />
                              ) : (
                                <Trash2 className="size-4" />
                              )}
                              Delete
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Customer bookings */}
        <section className="card bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="card-title text-xl">
                <CalendarCheck className="size-5" />
                Customer Bookings
              </h2>

              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={fetchBookings}
                disabled={bookingsLoading}
              >
                {bookingsLoading ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <RefreshCw className="size-4" />
                )}
                Refresh
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="rounded-xl bg-base-200 p-4">
                <div className="flex items-center gap-3">
                  <CalendarCheck className="size-7 text-primary" />
                  <div>
                    <p className="text-sm text-base-content/70">
                      Total Bookings
                    </p>
                    <p className="text-2xl font-bold">
                      {bookings.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-base-200 p-4">
                <div className="flex items-center gap-3">
                  <Users className="size-7 text-primary" />
                  <div>
                    <p className="text-sm text-base-content/70">
                      Confirmed Bookings
                    </p>
                    <p className="text-2xl font-bold">
                      {
                        bookings.filter(
                          (booking) => booking.status === "Confirmed"
                        ).length
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {bookingsLoading ? (
              <div className="flex justify-center py-10">
                <LoaderCircle className="size-8 animate-spin text-primary" />
              </div>
            ) : bookings.length === 0 ? (
              <p className="text-base-content/70 py-4">
                No customer bookings found yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Hotel</th>
                      <th>Check-in</th>
                      <th>Check-out</th>
                      <th>Guests</th>
                      <th>Rooms</th>
                      <th>Total Price</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking._id}>
                        <td>
                          <div className="font-semibold">
                            {booking.customerName ||
                              booking.user?.name ||
                              "Customer"}
                          </div>
                          <div className="text-xs text-base-content/60">
                            {booking.customerEmail ||
                              booking.user?.email ||
                              "No email"}
                          </div>
                        </td>

                        <td>
                          <div className="font-medium">
                            {booking.hotel?.hotelName ||
                              "Hotel unavailable"}
                          </div>
                          <div className="text-xs text-base-content/60">
                            {booking.hotel?.location || ""}
                          </div>
                        </td>

                        <td>{formatDate(booking.checkIn)}</td>
                        <td>{formatDate(booking.checkOut)}</td>

                        <td>
                          {booking.guests ??
                            Number(booking.adults || 0) +
                              Number(booking.children || 0)}
                        </td>

                        <td>{booking.numberOfRooms}</td>

                        <td>
                          <span className="inline-flex items-center">
                            <IndianRupee className="size-4" />
                            {Number(
                              booking.totalPrice || 0
                            ).toLocaleString("en-IN")}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`badge ${
                              booking.status === "Confirmed"
                                ? "badge-success"
                                : "badge-ghost"
                            }`}
                          >
                            {booking.status || "Unknown"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
