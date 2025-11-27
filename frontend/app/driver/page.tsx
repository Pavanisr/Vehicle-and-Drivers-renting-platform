"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaUser, FaCar, FaSignOutAlt, FaClipboardList } from "react-icons/fa";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from "chart.js";
import { Line, Pie, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

interface DashboardData {
  total_bookings: number;
  total_vehicles: number;
  total_reviews: number;
  avg_rating: string;
  total_earnings: number;
  bookings_vs_days: { day: string; count: number }[];
  bookings_vs_time: { hour: number; count: number }[];
  bookings_today: number;
  bookings_this_week: number;
  bookings_this_month: number;
  bookings_this_year: number;
  bookings_by_vehicle_type: { vehicle_type: string; count: number }[];
  bookings_per_vehicle: { model: string; vehicle_id: number; count: number }[];
}

const DriverDashboard: React.FC = () => {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  // Load token from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedToken = localStorage.getItem("token");
      if (!savedToken) router.push("/login");
      else setToken(savedToken);
    }
  }, [router]);

  // Fetch dashboard and profile
  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const profileRes = await fetch("http://localhost:3000/api/drivers/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!profileRes.ok) throw new Error("Failed to authenticate token");
        const profileData = await profileRes.json();
        setProfile(profileData);

        const dashRes = await fetch("http://localhost:3000/api/drivers/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!dashRes.ok) throw new Error("Failed to fetch dashboard");
        const dashData = await dashRes.json();
        setDashboard(dashData);
      } catch (err) {
        console.error("Error fetching dashboard/profile:", err);
        localStorage.removeItem("token");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, router]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/login");
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <h4 className="text-primary">Loading Dashboard...</h4>
      </div>
    );

  // Prepare Chart Data
  const bookingsVsDaysData = {
    labels: dashboard?.bookings_vs_days.map((b) => b.day) ?? [],
    datasets: [
      {
        label: "Bookings",
        data: dashboard?.bookings_vs_days.map((b) => b.count) ?? [],
        borderColor: "#4a8cff",
        backgroundColor: "rgba(74,140,255,0.2)",
        tension: 0.3,
      },
    ],
  };

  const bookingsVsTimeData = {
    labels: dashboard?.bookings_vs_time.map((b) => `${b.hour}:00`) ?? [],
    datasets: [
      {
        label: "Bookings",
        data: dashboard?.bookings_vs_time.map((b) => b.count) ?? [],
        borderColor: "#2d6cdf",
        backgroundColor: "rgba(45,108,223,0.2)",
        tension: 0.3,
      },
    ],
  };

  const bookingsByVehicleTypeData = {
    labels: dashboard?.bookings_by_vehicle_type.map((b) => b.vehicle_type) ?? [],
    datasets: [
      {
        data: dashboard?.bookings_by_vehicle_type.map((b) => b.count) ?? [],
        backgroundColor: ["#4a8cff", "#2d6cdf", "#90c8ff", "#cce0ff"],
      },
    ],
  };

  const bookingsPerVehicleData = {
    labels: dashboard?.bookings_per_vehicle.map((b) => b.model) ?? [],
    datasets: [
      {
        label: "Bookings",
        data: dashboard?.bookings_per_vehicle.map((b) => b.count) ?? [],
        backgroundColor: "#4a8cff",
      },
    ],
  };

  return (
    <div className="d-flex">
      {/* SIDEBAR */}
      <div className="sidebar d-flex flex-column p-3">
        <div className="text-center mb-4">
          <div className="profile-pic d-flex justify-content-center align-items-center">
            <FaUser size={35} />
          </div>
          <h6 className="mt-2 fw-bold">{profile?.full_name}</h6>
          <p className="small text-muted">{profile?.email}</p>
        </div>

        <ul className="nav nav-pills flex-column gap-2">
          <li>
            <button className="sidebar-btn" onClick={() => router.push("/driver/profile")}>
              <FaUser className="me-2" /> Profile
            </button>
          </li>
          <li>
            <button className="sidebar-btn" onClick={() => router.push("/driver/bookings")}>
              <FaClipboardList className="me-2" /> Booking Requests
            </button>
          </li>
          <li>
            <button className="sidebar-btn" onClick={() => router.push("/driver/vehicles")}>
              <FaCar className="me-2" /> Vehicles
            </button>
          </li>
          <li className="mt-auto">
            <button className="logout-btn" onClick={logout}>
              <FaSignOutAlt className="me-2" /> Logout
            </button>
          </li>
        </ul>
      </div>

      {/* MAIN CONTENT */}
      <div className="p-4 w-100">
        <h2 className="text-primary fw-bold mb-4">Driver Dashboard</h2>

        {/* METRICS CARDS */}
        <div className="row mb-4">
          {[
            { title: "Total Bookings", value: dashboard?.total_bookings },
            { title: "Total Vehicles", value: dashboard?.total_vehicles },
            { title: "Total Reviews", value: dashboard?.total_reviews },
            { title: "Avg. Rating", value: dashboard?.avg_rating },
            { title: "Total Earnings", value: `$${dashboard?.total_earnings}` },
          ].map((item, idx) => (
            <div className="col-md-4 mb-3" key={idx}>
              <div className="card shadow-sm">
                <div className="card-body text-center">
                  <h5 className="text-primary">{item.title}</h5>
                  <h2>{item.value}</h2>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* BOOKINGS INFO */}
        <h4 className="text-primary mb-3">Bookings Summary</h4>
        <div className="row mb-4">
          {[
            { label: "Today", value: dashboard?.bookings_today },
            { label: "This Week", value: dashboard?.bookings_this_week },
            { label: "This Month", value: dashboard?.bookings_this_month },
            { label: "This Year", value: dashboard?.bookings_this_year },
          ].map((item, idx) => (
            <div className="col-md-3 mb-3" key={idx}>
              <div className="card shadow-sm border-primary">
                <div className="card-body text-center">
                  <h5>{item.label}</h5>
                  <h3>{item.value}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CHARTS */}
        <div className="row mb-4">
          <div className="col-md-6 mb-3">
            <div className="card shadow-sm p-3">
              <h6>Bookings vs Days</h6>
              <Line data={bookingsVsDaysData} />
            </div>
          </div>
          <div className="col-md-6 mb-3">
            <div className="card shadow-sm p-3">
              <h6>Bookings vs Time (Hourly)</h6>
              <Line data={bookingsVsTimeData} />
            </div>
          </div>
          <div className="col-md-6 mb-3">
            <div className="card shadow-sm p-3">
              <h6>Bookings by Vehicle Type</h6>
              <Pie data={bookingsByVehicleTypeData} />
            </div>
          </div>
          <div className="col-md-6 mb-3">
            <div className="card shadow-sm p-3">
              <h6>Bookings per Vehicle</h6>
              <Bar data={bookingsPerVehicleData} />
            </div>
          </div>
        </div>
      </div>

      {/* STYLES */}
      <style jsx>{`
        .sidebar {
          width: 260px;
          min-height: 100vh;
          background: #ffffff;
          border-right: 1px solid #e6e6e6;
        }
        .profile-pic {
          width: 70px;
          height: 70px;
          margin: 0 auto;
          border-radius: 50%;
          background: #2d6cdf;
          color: white;
        }
        .sidebar-btn {
          width: 100%;
          background: #f6f8ff;
          border: none;
          padding: 12px 16px;
          border-radius: 10px;
          font-weight: 500;
          color: #2b3a67;
          text-align: left;
          transition: 0.2s;
        }
        .sidebar-btn:hover {
          background: #e3e9ff;
          color: #1a2d6d;
        }
        .logout-btn {
          width: 100%;
          background: #ff4d4d;
          border: none;
          padding: 12px 16px;
          border-radius: 10px;
          color: white;
          font-weight: 500;
        }
        .logout-btn:hover {
          background: #e63d3d;
        }
      `}</style>
    </div>
  );
};

export default DriverDashboard;
