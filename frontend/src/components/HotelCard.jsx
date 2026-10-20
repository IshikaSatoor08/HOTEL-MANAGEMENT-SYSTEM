
import { Link, useLocation } from "react-router-dom";
import {
  MapPin,
  BedDouble,
  CalendarDays,
  Edit2,
  Trash2,
  IndianRupee,
} from "lucide-react";
import { formatDate } from "../lib/utils";
import api from "../lib/axios";
import toast from "react-hot-toast";
import { useState } from "react";

const HotelCard = ({ hotel, setHotels }) => {
  const [showModal, setShowModal] = useState(false);
  const location = useLocation();

  const isActive = location.pathname === `/hotels/${hotel._id}`;

  const handleDelete = async () => {
    try {
      await api.delete(`/hotels/${hotel._id}`);

      if (setHotels) {
        setHotels((prev) =>
          prev.filter((item) => item._id !== hotel._id)
        );
      }

      toast.success("Hotel deleted successfully");
    } catch (error) {
      console.error("Error deleting hotel:", error);
      toast.error("Failed to delete hotel");
    } finally {
      setShowModal(false);
    }
  };

  return (
    <>
      <div
        className={`relative rounded-xl bg-base-100 p-4 border transition-all duration-300
        ${
          isActive
            ? "border-primary shadow-lg"
            : "border-base-300"
        } hover:border-primary hover:shadow-xl hover:-translate-y-1`}
      >
        <Link to={`/hotels/${hotel._id}`} className="block">
          {/* HOTEL ID AND PRICE */}
          <div className="flex justify-between items-start gap-2">
            <p className="text-xs text-base-content/60 truncate">
              ID: {hotel._id}
            </p>

            <span className="badge badge-secondary gap-1">
              <IndianRupee className="size-3" />
              {hotel.pricePerNight}
              <span>/night</span>
            </span>
          </div>

          {/* HOTEL DETAILS */}
          <div className="mt-4 space-y-3">
            <h2 className="text-xl font-bold text-base-content line-clamp-1">
              {hotel.hotelName}
            </h2>

            <div className="flex items-center gap-2 text-base-content/70">
              <MapPin className="size-4 text-primary shrink-0" />
              <p className="text-sm line-clamp-1">
                {hotel.location}
              </p>
            </div>

            <div className="flex items-center gap-2 text-base-content/70">
              <BedDouble className="size-4 text-primary shrink-0" />
              <p className="text-sm">
                {hotel.roomType} Room
              </p>
            </div>

            <p className="text-sm text-base-content/70 line-clamp-3">
              {hotel.description}
            </p>
          </div>

          {/* CREATED DATE */}
          <div className="mt-6 flex items-center gap-2 text-xs text-base-content/60">
            <CalendarDays className="size-4" />
            <span>
              Added:{" "}
              {hotel.createdAt
                ? formatDate(new Date(hotel.createdAt))
                : "Date unavailable"}
            </span>
          </div>
        </Link>

        {/* ACTIONS */}
        <div className="mt-5 flex justify-end items-center gap-4 border-t border-base-300 pt-4">
          <Link
            to={`/hotels/${hotel._id}`}
            className="tooltip tooltip-warning text-warning hover:scale-110 transition"
            data-tip="Edit hotel"
            aria-label="Edit hotel"
          >
            <Edit2 className="size-4" />
          </Link>

          <button
            onClick={() => setShowModal(true)}
            className="tooltip tooltip-error text-error hover:scale-110 transition"
            data-tip="Delete hotel"
            aria-label="Delete hotel"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {showModal && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-error flex items-center gap-2">
              <Trash2 className="size-5" />
              Delete Hotel
            </h3>

            <p className="py-4 text-base-content/70">
              Are you sure you want to delete
              <span className="font-semibold text-base-content">
                {" "}
                "{hotel.hotelName}"
              </span>
              ? This action cannot be undone.
            </p>

            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>

              <button
                className="btn btn-error flex items-center gap-2"
                onClick={handleDelete}
              >
                <Trash2 className="size-4" />
                Delete
              </button>
            </div>
          </div>
        </dialog>
      )}
    </>
  );
};

export default HotelCard;
