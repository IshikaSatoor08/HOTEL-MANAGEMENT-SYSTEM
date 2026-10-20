
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/axios";
import toast from "react-hot-toast";
import {
  CalendarDays,
  MapPin,
  BedDouble,
  ClipboardList,
  Users,
  Baby,
  XCircle,
  Pencil,
  Save,
  X,
} from "lucide-react";

const getLocalDate = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toDateInput = (date) => {
  const parsed = new Date(date);
  return getLocalDate(
    new Date(
      parsed.getTime() - parsed.getTimezoneOffset() * 60 * 1000
    )
  );
};

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [savingId, setSavingId] = useState(null);

  const [editForm, setEditForm] = useState({
    checkIn: "",
    checkOut: "",
    adults: 1,
    children: 0,
    numberOfRooms: 1,
  });

  const navigate = useNavigate();
  const today = getLocalDate();

  const fetchBookings = async () => {
    try {
      const res = await api.get("/bookings/my-bookings");
      setBookings(res.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        toast.error("Your session has expired. Please log in again.");
        navigate("/login");
        return;
      }

      toast.error("Unable to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      toast.error("Please log in to view your bookings");
      navigate("/login");
      setLoading(false);
      return;
    }

    fetchBookings();
  }, [navigate]);

  const startEditing = (booking) => {
    setEditingId(booking._id);
    setEditForm({
      checkIn: toDateInput(booking.checkIn),
      checkOut: toDateInput(booking.checkOut),
      adults: booking.adults ?? 1,
      children: booking.children ?? 0,
      numberOfRooms: booking.numberOfRooms ?? 1,
    });
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setEditForm((previous) => ({
      ...previous,
      [name]:
        ["adults", "children", "numberOfRooms"].includes(name)
          ? Number(value)
          : value,
    }));
  };

  const handleModify = async (event, bookingId) => {
    event.preventDefault();

    if (
      !editForm.checkIn ||
      !editForm.checkOut ||
      editForm.checkIn < today ||
      editForm.checkOut <= editForm.checkIn ||
      !Number.isInteger(editForm.adults) ||
      editForm.adults < 1 ||
      !Number.isInteger(editForm.children) ||
      editForm.children < 0 ||
      !Number.isInteger(editForm.numberOfRooms) ||
      editForm.numberOfRooms < 1
    ) {
      toast.error("Please enter valid dates, guests, and room count");
      return;
    }

    setSavingId(bookingId);

    try {
      const res = await api.put(`/bookings/${bookingId}/modify`, editForm);

      setBookings((previous) =>
        previous.map((booking) =>
          booking._id === bookingId
            ? {
                ...booking,
                ...res.data.booking,
                hotel: booking.hotel,
              }
            : booking
        )
      );

      setEditingId(null);
      toast.success("Booking modified successfully!");
    } catch (error) {
      console.error("Modify booking error:", error);
      toast.error(
        error.response?.data?.message || "Unable to modify booking"
      );
    } finally {
      setSavingId(null);
    }
  };

  const handleCancel = async (bookingId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmed) return;

    setCancellingId(bookingId);

    try {
      const res = await api.patch(`/bookings/${bookingId}/cancel`);

      setBookings((previous) =>
        previous.map((booking) =>
          booking._id === bookingId
            ? { ...booking, status: res.data.booking.status }
            : booking
        )
      );

      if (editingId === bookingId) setEditingId(null);

      toast.success("Booking cancelled successfully");
    } catch (error) {
      console.error("Error cancelling booking:", error);

      if (error.response?.status === 401) {
        toast.error("Please log in again");
        navigate("/login");
      } else {
        toast.error(
          error.response?.data?.message || "Unable to cancel booking"
        );
      }
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-base-200 flex justify-center items-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-base-200">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <ClipboardList className="size-8 text-primary" />
              My Bookings
            </h1>
            <p className="text-base-content/70 mt-2">
              View and manage your hotel reservations.
            </p>
          </div>

          <Link to="/" className="btn btn-primary">
            Explore Hotels
          </Link>
        </div>

        {bookings.length === 0 && (
          <div className="card bg-base-100 shadow-md">
            <div className="card-body items-center text-center py-12">
              <CalendarDays className="size-14 text-primary" />
              <h2 className="text-2xl font-bold mt-3">No Bookings Yet</h2>
              <p className="text-base-content/70">
                Your reservations will appear here after you book a hotel.
              </p>
              <Link to="/" className="btn btn-primary mt-4">
                Find a Hotel
              </Link>
            </div>
          </div>
        )}

        {bookings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookings.map((booking) => {
              const isEditing = editingId === booking._id;
              const isConfirmed = booking.status === "Confirmed";

              const nights =
                editForm.checkIn && editForm.checkOut
                  ? Math.max(
                      0,
                      (new Date(`${editForm.checkOut}T00:00:00`) -
                        new Date(`${editForm.checkIn}T00:00:00`)) /
                        (24 * 60 * 60 * 1000)
                    )
                  : 0;

              const estimatedPrice =
                nights *
                editForm.numberOfRooms *
                (booking.hotel?.pricePerNight ?? 0);

              return (
                <div
                  key={booking._id}
                  className="card bg-base-100 shadow-md"
                >
                  <div className="card-body">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="card-title">
                        {booking.hotel?.hotelName || "Hotel Reservation"}
                      </h2>

                      <span
                        className={`badge ${
                          booking.status === "Cancelled"
                            ? "badge-error"
                            : "badge-success"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    <p className="flex items-center gap-2">
                      <MapPin className="size-4 text-primary" />
                      {booking.hotel?.location || "Location unavailable"}
                    </p>

                    <p className="flex items-center gap-2">
                      <BedDouble className="size-4 text-primary" />
                      {booking.hotel?.roomType || "Room type unavailable"}
                    </p>

                    <div className="divider my-1" />

                    {isEditing ? (
                      <form
                        className="space-y-4"
                        onSubmit={(event) => handleModify(event, booking._id)}
                      >
                        <h3 className="font-bold text-lg">
                          Modify Your Booking
                        </h3>

                        <div className="grid grid-cols-2 gap-3">
                          <label className="form-control">
                            <span className="label-text mb-1">Check-in</span>
                            <input
                              className="input input-bordered w-full"
                              type="date"
                              name="checkIn"
                              min={today}
                              value={editForm.checkIn}
                              onChange={handleEditChange}
                              required
                            />
                          </label>

                          <label className="form-control">
                            <span className="label-text mb-1">Check-out</span>
                            <input
                              className="input input-bordered w-full"
                              type="date"
                              name="checkOut"
                              min={editForm.checkIn || today}
                              value={editForm.checkOut}
                              onChange={handleEditChange}
                              required
                            />
                          </label>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <label className="form-control">
                            <span className="label-text mb-1">Adults</span>
                            <input
                              className="input input-bordered w-full"
                              type="number"
                              name="adults"
                              min="1"
                              max="20"
                              value={editForm.adults}
                              onChange={handleEditChange}
                              required
                            />
                          </label>

                          <label className="form-control">
                            <span className="label-text mb-1">Children</span>
                            <input
                              className="input input-bordered w-full"
                              type="number"
                              name="children"
                              min="0"
                              max="20"
                              value={editForm.children}
                              onChange={handleEditChange}
                              required
                            />
                          </label>

                          <label className="form-control">
                            <span className="label-text mb-1">Rooms</span>
                            <input
                              className="input input-bordered w-full"
                              type="number"
                              name="numberOfRooms"
                              min="1"
                              max="20"
                              value={editForm.numberOfRooms}
                              onChange={handleEditChange}
                              required
                            />
                          </label>
                        </div>

                        <div className="rounded-lg bg-base-200 p-4">
                          <p className="text-sm text-base-content/70">
                            Estimated total for {nights} night(s)
                          </p>
                          <p className="text-xl font-bold mt-1">
                            ₹{estimatedPrice.toLocaleString("en-IN")}
                          </p>
                          <p className="text-xs text-base-content/60 mt-1">
                            Final price and availability are checked when you
                            save.
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="btn btn-primary flex-1"
                            disabled={savingId === booking._id}
                          >
                            <Save className="size-4" />
                            {savingId === booking._id
                              ? "Saving..."
                              : "Save Changes"}
                          </button>

                          <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={() => setEditingId(null)}
                            disabled={savingId === booking._id}
                          >
                            <X className="size-4" />
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-base-content/60">
                              Check-in
                            </p>
                            <p className="font-medium flex items-center gap-2 mt-1">
                              <CalendarDays className="size-4 text-primary" />
                              {new Date(booking.checkIn).toLocaleDateString(
                                "en-IN"
                              )}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm text-base-content/60">
                              Check-out
                            </p>
                            <p className="font-medium flex items-center gap-2 mt-1">
                              <CalendarDays className="size-4 text-primary" />
                              {new Date(booking.checkOut).toLocaleDateString(
                                "en-IN"
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="bg-base-200 rounded-lg p-4 mt-3 space-y-3">
                          <h3 className="font-semibold">Booking Details</h3>

                          <p className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <Users className="size-4 text-primary" />
                              Adults
                            </span>
                            <span>{booking.adults ?? 1}</span>
                          </p>

                          <p className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <Baby className="size-4 text-primary" />
                              Children
                            </span>
                            <span>{booking.children ?? 0}</span>
                          </p>

                          <p className="flex items-center justify-between">
                            <span>Rooms</span>
                            <span>{booking.numberOfRooms ?? 1}</span>
                          </p>

                          <div className="border-t border-base-300 pt-3 flex justify-between font-semibold">
                            <span>Total guests</span>
                            <span>
                              {booking.guests ??
                                (booking.adults ?? 1) +
                                  (booking.children ?? 0)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <span className="text-base-content/70">
                            Total price
                          </span>
                          <span className="text-xl font-bold">
                            ₹
                            {booking.totalPrice?.toLocaleString("en-IN") ??
                              "—"}
                          </span>
                        </div>

                        {isConfirmed && (
                          <div className="flex flex-col sm:flex-row gap-2 mt-3">
                            <button
                              type="button"
                              className="btn btn-outline btn-primary flex-1"
                              onClick={() => startEditing(booking)}
                            >
                              <Pencil className="size-4" />
                              Modify Booking
                            </button>

                            <button
                              type="button"
                              className="btn btn-outline btn-error flex-1"
                              disabled={cancellingId === booking._id}
                              onClick={() => handleCancel(booking._id)}
                            >
                              <XCircle className="size-4" />
                              {cancellingId === booking._id
                                ? "Cancelling..."
                                : "Cancel Booking"}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
};

export default MyBookingsPage;
