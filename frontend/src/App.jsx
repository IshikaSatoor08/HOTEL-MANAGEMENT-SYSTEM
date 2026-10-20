
import { Routes, Route } from "react-router-dom";
import AdminDashboard from "./pages/AdminDashboard";
import HomePage from "./pages/HomePage";
import HotelDetailsPage from "./pages/HotelDetailsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/hotels/:id" element={<HotelDetailsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/admin" element={<AdminDashboard />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/my-bookings" element={<MyBookingsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
