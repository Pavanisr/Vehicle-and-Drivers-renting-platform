"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaUser, FaSignOutAlt, FaClipboardList } from "react-icons/fa";
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

interface Dashboard {
  total_trips: number;
  total_revenue: number;
  avg_rating: number;
  bookings_vs_days: { day: string; count: number }[];
  bookings_vs_month: { month: string; count: number }[];
  bookings_by_time: { hour: number; count: number }[];
  bookings_by_vehicle_type: { vehicle_type: string; total: number }[];
  bookings_per_vehicle: { vehicle_id: number; model: string; count: number }[];
  revenue_per_vehicle: { vehicle_id: number; model: string; revenue: number }[];
  bookings_today: number;
  bookings_this_week: number;
  bookings_this_month: number;
  bookings_this_year: number;
}

const OwnerDashboard: React.FC = () => {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  // Load token
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (!savedToken) router.push("/login");
    else setToken(savedToken);
  }, []);

  // Fetch dashboard + profile
  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const profileRes = await fetch("http://localhost:3000/api/owners/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const profileData = await profileRes.json();
        setProfile(profileData.Profile);

        const dashRes = await fetch("http://localhost:3000/api/owners/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const dashData = await dashRes.json();
        setDashboard(dashData.Dashboard);

      } catch (err) {
        console.error(err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <h4 className="text-primary">Loading Dashboard...</h4>
      </div>
    );

  /* --------------------- CHART DATA ------------------ */

  const bookingsVsDaysData = {
    labels: dashboard?.bookings_vs_days.map((b) => b.day) ?? [],
    datasets: [
      {
        label: "Bookings (7 Days)",
        data: dashboard?.bookings_vs_days.map((b) => b.count) ?? [],
        borderColor: "#4a8cff",
        backgroundColor: "rgba(74,140,255,0.2)",
        tension: 0.3,
      },
    ],
  };

  const bookingsVsMonthData = {
    labels: dashboard?.bookings_vs_month.map((b) =>
      new Date(b.month).toLocaleString("en-US", { month: "short" })
    ),
    datasets: [
      {
        label: "Bookings (12 Months)",
        data: dashboard?.bookings_vs_month.map((b) => b.count) ?? [],
        borderColor: "#0055ff",
        backgroundColor: "rgba(0,85,255,0.2)",
        tension: 0.3,
      },
    ],
  };

  const bookingsByVehicleTypeData = {
    labels: dashboard?.bookings_by_vehicle_type.map((b) => b.vehicle_type) ?? [],
    datasets: [
      {
        data: dashboard?.bookings_by_vehicle_type.map((b) => b.total) ?? [],
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

  const revenuePerVehicleData = {
    labels: dashboard?.revenue_per_vehicle.map((b) => b.model) ?? [],
    datasets: [
      {
        label: "Revenue (LKR)",
        data: dashboard?.revenue_per_vehicle.map((b) => b.revenue) ?? [],
        backgroundColor: "#2d6cdf",
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
            <button className="sidebar-btn" onClick={() => router.push("/owner/profile")}>
              <FaUser className="me-2" /> Profile
            </button>
          </li>

          <li>
            <button className="sidebar-btn" onClick={() => router.push("/owner/bookings")}>
              <FaClipboardList className="me-2" /> Bookings
            </button>
          </li>
          <li>
            <button className="sidebar-btn" onClick={() => router.push("/owner/vehicles")}>
              <FaClipboardList className="me-2" /> vehicles
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
        <h2 className="text-primary fw-bold mb-4">Owner Dashboard</h2>

        {/* METRIC CARDS */}
        <div className="row mb-4">
          {[
            { title: "Total Trips", value: dashboard?.total_trips },
            { title: "Total Revenue", value: `LKR ${dashboard?.total_revenue}` },
            { title: "Avg Rating", value: dashboard?.avg_rating },
            { title: "Today", value: dashboard?.bookings_today },
            { title: "This Month", value: dashboard?.bookings_this_month },
          ].map((item, idx) => (
            <div className="col-md-4 mb-3" key={idx}>
              <div className="card shadow-sm text-center p-3">
                <h5 className="text-primary">{item.title}</h5>
                <h2>{item.value}</h2>
              </div>
            </div>
          ))}
        </div>

        {/* CHARTS */}
        <div className="row mb-4">
          <div className="col-md-6 mb-3">
            <div className="card shadow-sm p-3">
              <h6>Bookings (Last 7 Days)</h6>
              <Line data={bookingsVsDaysData} />
            </div>
          </div>

          <div className="col-md-6 mb-3">
            <div className="card shadow-sm p-3">
              <h6>Bookings (Last 12 Months)</h6>
              <Line data={bookingsVsMonthData} />
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

          <div className="col-md-12 mb-3">
            <div className="card shadow-sm p-3">
              <h6>Revenue per Vehicle</h6>
              <Bar data={revenuePerVehicleData} />
            </div>
          </div>
        </div>
      </div>

      {/* STYLES */}
      <style jsx>{`
        .sidebar {
          width: 260px;
          background: #ffffff;
          min-height: 100vh;
          border-right: 1px solid #e6e6e6;
        }
        .profile-pic {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: #2d6cdf;
          color: #fff;
        }
        .sidebar-btn {
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          background: #f3f6ff;
          border: none;
          color: #2d3a66;
          text-align: left;
        }
        .sidebar-btn:hover {
          background: #e0e6ff;
        }
        .logout-btn {
          width: 100%;
          background: #ff4d4d;
          color: white;
          border: none;
          padding: 12px;
          border-radius: 10px;
        }
        .logout-btn:hover {
          background: #e60000;
        }
      `}</style>
    </div>
  );
};

export default OwnerDashboard;
