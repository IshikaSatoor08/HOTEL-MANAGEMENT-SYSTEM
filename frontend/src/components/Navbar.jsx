

import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { LogOut, Hotel, UserRound, LayoutDashboard } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isLoggedIn = Boolean(token && user);
  const isAdmin = isLoggedIn && user.role === "admin";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    toast.success("Logged out successfully!");
    navigate("/login");
  };

  return (
    <header className="bg-rose-400 border-b border-base-content/10">
      <div className="mx-auto max-w-6xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-3xl font-bold text-white"
          >
            <Hotel className="size-8" />
            Solstice Stay
          </Link>

          <nav className="flex flex-wrap items-center gap-2">
            <Link to="/" className="btn btn-ghost text-white">
              Home
            </Link>

            {isLoggedIn ? (
              <>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="btn btn-outline border-white text-white hover:bg-white hover:text-rose-500"
                  >
                    <LayoutDashboard className="size-4" />
                    Admin Dashboard
                  </Link>
                )}

                {!isAdmin && (
                  <Link
                    to="/my-bookings"
                    className="btn btn-ghost text-white"
                  >
                    My Bookings
                  </Link>
                )}

                <span className="hidden sm:flex items-center gap-2 text-white px-2">
                  <UserRound className="size-4" />
                  {user.name}
                </span>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn btn-outline border-white text-white hover:bg-white hover:text-rose-500"
                >
                  <LogOut className="size-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost text-white">
                  Login
                </Link>

                <Link to="/register" className="btn btn-primary">
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
