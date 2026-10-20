
import { Link } from "react-router-dom";
import { Hotel, MapPin, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-base-300 text-base-content mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* BRAND */}
          <div>
            <Link to="/" className="flex items-center gap-2">
              <Hotel className="size-7 text-primary" />
              <span className="text-2xl font-bold">
                StayEase
              </span>
            </Link>

            <p className="mt-3 text-sm opacity-70">
              Find your perfect stay and make every journey memorable.
            </p>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h3 className="font-bold text-lg mb-3">
              Quick Links
            </h3>

            <ul className="space-y-2">
              <li>
                <Link to="/" className="link link-hover">
                  Home
                </Link>
              </li>

              <li>
                <Link to="/login" className="link link-hover">
                  Login
                </Link>
              </li>

              <li>
                <Link to="/register" className="link link-hover">
                  Register
                </Link>
              </li>

              <li>
                <Link to="/my-bookings" className="link link-hover">
                  My Bookings
                </Link>
              </li>
            </ul>
          </div>

          {/* CONTACT / ABOUT */}
          <div>
            <h3 className="font-bold text-lg mb-3">
              Your Next Journey
            </h3>

            <p className="text-sm opacity-70 flex items-start gap-2">
              <MapPin className="size-5 shrink-0 text-primary" />
              Discover comfortable stays at destinations you love.
            </p>
          </div>
        </div>

        <div className="border-t border-base-content/20 mt-8 pt-5">
          <p className="text-sm text-center opacity-70 flex flex-wrap items-center justify-center gap-1">
            © {new Date().getFullYear()} StayEase. Made with
            <Heart className="size-4 text-error fill-current" />
            for travellers.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
