
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import HotelCard from "../components/HotelCard";
import api from "../lib/axios";
import toast from "react-hot-toast";

const HomePage = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [roomType, setRoomType] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const fetchHotels = async (filters = {}) => {
    try {
      setLoading(true);

      const res = await api.get("/hotels", {
        params: filters,
      });

      setHotels(res.data);
    } catch (error) {
      console.error("Error fetching hotels:", error);
      toast.error("Failed to load hotels");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const handleSearch = () => {
    if (
      (minPrice !== "" && Number(minPrice) < 0) ||
      (maxPrice !== "" && Number(maxPrice) < 0)
    ) {
      toast.error("Prices cannot be negative");
      return;
    }

    if (
      minPrice !== "" &&
      maxPrice !== "" &&
      Number(minPrice) > Number(maxPrice)
    ) {
      toast.error("Minimum price cannot exceed maximum price");
      return;
    }

    fetchHotels({
      search,
      location,
      roomType,
      minPrice,
      maxPrice,
    });
  };

  const handleReset = () => {
    setSearch("");
    setLocation("");
    setRoomType("");
    setMinPrice("");
    setMaxPrice("");
    fetchHotels();
  };

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />

      {/* Hero section with resort background image */}
      <section
        className="relative flex min-h-[420px] items-center justify-center overflow-hidden bg-cover bg-center px-4 py-16 text-white sm:min-h-[500px] lg:min-h-[560px]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0, 0, 0, 0.40), rgba(0, 0, 0, 0.40)), url('https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=2000&q=85')",
        }}
      >
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-rose-200 sm:tracking-[0.3em]">
            Smart Hospitality ; Endless Exploration
          </p>

          <h1 className="text-4xl font-extrabold leading-tight drop-shadow-lg sm:text-6xl lg:text-7xl">
            Find Your Perfect Stay
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white drop-shadow-md sm:text-xl">
            Discover amazing hotels, explore new destinations,
            and create unforgettable memories with Solstice Stay.
          </p>

          <button
            type="button"
            onClick={() =>
              document
                .getElementById("hotel-search")
                ?.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                })
            }
            className="btn mt-8 border-0 bg-rose-500 px-8 text-white shadow-lg hover:bg-rose-600"
          >
            Explore Hotels
          </button>
        </div>
      </section>

      <main className="mx-auto max-w-7xl p-4 sm:p-6">
        {/* Hotel search and filters */}
        <section
          id="hotel-search"
          className="relative z-10 -mt-8 mb-8 rounded-xl border border-base-300 bg-base-100 p-4 shadow-xl sm:p-6"
        >
          <h2 className="mb-4 text-xl font-bold">
            Find a hotel that suits you
          </h2>

          <div className="flex flex-wrap items-center gap-4">
            <input
              type="text"
              placeholder="Search by Hotel Name"
              className="input input-bordered w-full sm:flex-1"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <input
              type="text"
              placeholder="Filter by Location"
              className="input input-bordered w-full sm:flex-1"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />

            <select
              className="select select-bordered w-full sm:flex-1"
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
            >
              <option value="">All Room Types</option>
              <option value="Standard">Standard</option>
              <option value="Deluxe">Deluxe</option>
              <option value="Suite">Suite</option>
            </select>

            <input
              type="number"
              min="0"
              placeholder="Minimum Price (₹)"
              className="input input-bordered w-full sm:flex-1"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />

            <input
              type="number"
              min="0"
              placeholder="Maximum Price (₹)"
              className="input input-bordered w-full sm:flex-1"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSearch}
            >
              Search
            </button>

            <button
              type="button"
              className="btn btn-outline"
              onClick={handleReset}
            >
              Reset
            </button>
          </div>
        </section>

        {/* Number of matching hotels */}
        <div className="mb-6 rounded-lg bg-primary p-4 text-primary-content">
          <h2 className="text-lg font-bold">
            Hotels Found: {hotels.length}
          </h2>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="py-10 text-center text-primary">
            <span className="loading loading-spinner loading-lg"></span>
            <p className="mt-3">Finding hotels for you...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && hotels.length === 0 && (
          <div className="rounded-lg bg-base-100 p-10 text-center shadow">
            <h2 className="text-2xl font-bold">
              No Hotels Found
            </h2>
            <p className="mt-2 text-base-content/70">
              Try changing your search or filters.
            </p>
          </div>
        )}

        {/* Hotel cards */}
        {!loading && hotels.length > 0 && (
          <section>
            <h2 className="mb-5 text-2xl font-bold">
              Explore Our Hotels
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {hotels.map((hotel) => (
                <HotelCard
                  key={hotel._id}
                  hotel={hotel}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
