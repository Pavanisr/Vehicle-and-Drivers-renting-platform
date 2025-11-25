"use client";

import React, { useEffect, useState } from "react";
import {
  FaUser,
  FaCar,
  FaBell,
  FaListAlt,
  FaSignOutAlt,
} from "react-icons/fa";
import { AiOutlineClose } from "react-icons/ai";

interface Booking {
  booking_id: number;
  vehicle_model: string;
  vehicle_type: string;
  driver_name: string;
  owner_name: string;
  pickup_time: string;
  drop_time: string;
  status: string;
}

interface DashboardData {
  total_bookings: number;
  completed_bookings: number;
  total_paid: number;
  upcoming_bookings: Booking[];
}

const CustomerDashboard: React.FC = () => {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) return;

    const fetchDashboard = async () => {
      try {
        const res = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL ||
            "http://localhost:3000/api/customers"
          }/dashboard`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        setDashboard(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchProfile = async () => {
      try {
        const res = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL ||
            "http://localhost:3000/api/customers"
          }/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchDashboard();
    fetchProfile();
  }, [token]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-blue-600 text-xl font-semibold">
        Loading Dashboard...
      </div>
    );

  return (
    <div className="flex min-h-screen bg-blue-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-blue-800 to-blue-600 text-white flex flex-col p-6 space-y-4 shadow-lg">
        <div className="flex items-center space-x-3 mb-6 border-b border-blue-400 pb-4">
          <FaUser className="text-3xl" />
          <div>
            <p className="font-semibold text-lg">
              {profile?.full_name || "Customer"}
            </p>
            <p className="text-xs opacity-80">{profile?.email}</p>
          </div>
        </div>

        <button
          onClick={() => setShowProfilePopup(true)}
          className="flex items-center gap-3 p-2 hover:bg-blue-500 rounded-lg transition"
        >
          <FaUser /> Profile
        </button>

        <button className="flex items-center gap-3 p-2 hover:bg-blue-500 rounded-lg transition">
          <FaCar /> Book Now
        </button>

        <button className="flex items-center gap-3 p-2 hover:bg-blue-500 rounded-lg transition">
          <FaBell /> Notifications
        </button>

        <button className="flex items-center gap-3 p-2 hover:bg-blue-500 rounded-lg transition">
          <FaListAlt /> Bookings
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 p-2 hover:bg-red-500 rounded-lg transition mt-auto"
        >
          <FaSignOutAlt /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-blue-800 mb-6">Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            {
              label: "Total Bookings",
              value: dashboard?.total_bookings || 0,
            },
            {
              label: "Completed Bookings",
              value: dashboard?.completed_bookings || 0,
            },
            {
              label: "Total Paid",
              value: `$${dashboard?.total_paid || 0}`,
            },
          ].map((card, idx) => (
            <div
              key={idx}
              className="bg-white shadow-md hover:shadow-xl transition rounded-xl p-6 text-center border-t-4 border-blue-600"
            >
              <h2 className="text-lg font-semibold text-blue-700">
                {card.label}
              </h2>
              <p className="text-3xl mt-3 font-bold text-blue-900">
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {/* Upcoming Bookings */}
        <div>
          <h2 className="text-xl font-semibold text-blue-800 mb-4">
            Upcoming Bookings
          </h2>

          {!dashboard?.upcoming_bookings ||
          dashboard.upcoming_bookings.length === 0 ? (
            <p className="text-gray-600 bg-white p-4 rounded shadow">
              No upcoming bookings.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {dashboard.upcoming_bookings.map((b) => (
                <div
                  key={b.booking_id}
                  className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition border-l-4 border-blue-600"
                >
                  <h3 className="font-bold text-blue-700 text-lg">
                    {b.vehicle_model} ({b.vehicle_type})
                  </h3>

                  <div className="text-sm mt-2 space-y-1 text-gray-700">
                    <p>
                      <strong>Driver:</strong> {b.driver_name}
                    </p>
                    <p>
                      <strong>Owner:</strong> {b.owner_name}
                    </p>
                    <p>
                      <strong>Pickup:</strong>{" "}
                      {new Date(b.pickup_time).toLocaleString()}
                    </p>
                    <p>
                      <strong>Drop:</strong>{" "}
                      {new Date(b.drop_time).toLocaleString()}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <span className="font-semibold text-blue-700">
                        {b.status}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Profile Popup */}
      {showProfilePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl p-6 w-96 relative animate-scaleIn">
            <button
              onClick={() => setShowProfilePopup(false)}
              className="absolute top-3 right-3 text-blue-800"
            >
              <AiOutlineClose size={24} />
            </button>

            <h2 className="text-2xl font-bold text-blue-800 mb-4">
              Profile Details
            </h2>

            <div className="space-y-2 text-gray-700">
              <p>
                <strong>Name:</strong> {profile?.full_name}
              </p>
              <p>
                <strong>Email:</strong> {profile?.email}
              </p>
              <p>
                <strong>Phone:</strong> {profile?.phone}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-blue-700 text-white flex justify-around p-3 md:hidden shadow-lg">
        <button
          onClick={() => setShowProfilePopup(true)}
          className="flex flex-col items-center"
        >
          <FaUser size={20} />
          <span className="text-xs">Profile</span>
        </button>

        <button className="flex flex-col items-center">
          <FaCar size={20} />
          <span className="text-xs">Book Now</span>
        </button>

        <button className="flex flex-col items-center">
          <FaBell size={20} />
          <span className="text-xs">Alerts</span>
        </button>

        <button className="flex flex-col items-center">
          <FaListAlt size={20} />
          <span className="text-xs">Bookings</span>
        </button>
      </nav>
    </div>
  );
};

export default CustomerDashboard;
