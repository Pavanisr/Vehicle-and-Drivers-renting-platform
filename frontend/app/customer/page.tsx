"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaBell, FaListAlt, FaCar, FaUser, FaSignOutAlt } from "react-icons/fa";
import io from "socket.io-client";
import "bootstrap/dist/css/bootstrap.min.css";

interface Booking {
  booking_id: number;
  vehicle_model: string;
  vehicle_type: string;
  driver_name: string | null;
  owner_name: string;
  pickup_time: string;
  status: string;
}

interface DashboardData {
  total_bookings: number;
  completed_bookings: number;
  upcoming_bookings: Booking[];
}

const socket = io("http://localhost:3000", { transports: ["websocket"] });

const CustomerDashboard: React.FC = () => {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Load token from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedToken = localStorage.getItem("token");
      if (!savedToken) router.push("/login");
      else setToken(savedToken);
    }
  }, [router]);

  // Fetch profile and dashboard
  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        // Fetch Profile
        const profileRes = await fetch("http://localhost:3000/api/customers/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!profileRes.ok) throw new Error("Failed to authenticate token");
        const profileData = await profileRes.json();
        setProfile(profileData);

        // Fetch Dashboard
        const dashRes = await fetch("http://localhost:3000/api/customers/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!dashRes.ok) throw new Error("Failed to fetch dashboard");
        const dashData = await dashRes.json();

        setDashboard({
          total_bookings: Number(dashData.total_bookings ?? 0),
          completed_bookings: Number(dashData.completed_bookings ?? 0),
          upcoming_bookings: Array.isArray(dashData.upcoming_bookings)
            ? dashData.upcoming_bookings.map((b: any) => ({
                booking_id: b.booking_id,
                vehicle_model: b.vehicle_model,
                vehicle_type: b.vehicle_type,
                driver_name: b.driver_name,
                owner_name: b.owner_name,
                pickup_time: b.pickup_time,
                status: b.status,
              }))
            : [],
        });
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

  // Socket notifications
  useEffect(() => {
    if (!profile?.customer_id) return;

    socket.emit("joinRoom", profile.customer_id);

    const handleBookingUpdate = (msg: any) => {
      setNotifications((prev) => [msg, ...prev]);
      console.log("🔔 New booking notification:", msg);
    };

    socket.on("bookingUpdate", handleBookingUpdate);

    return () => {
      socket.off("bookingUpdate", handleBookingUpdate);
    };
  }, [profile]);

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
            <button className="sidebar-btn">
              <FaUser className="me-2" /> Profile
            </button>
          </li>
          <li>
            <button className="sidebar-btn">
              <FaCar className="me-2" /> Book Now
            </button>
          </li>
          <li>
            <button
              className="sidebar-btn position-relative"
              onClick={() => setShowNotificationModal(true)}
            >
              <FaBell className="me-2" /> Notifications
              {notifications.length > 0 && (
                <span className="notif-badge">{notifications.length}</span>
              )}
            </button>
          </li>
          <li>
            <button className="sidebar-btn">
              <FaListAlt className="me-2" /> Bookings
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
        <h2 className="text-primary fw-bold mb-4">Dashboard</h2>

        {/* CARDS */}
        <div className="row mb-4">
          {[
            { title: "Total Bookings", value: dashboard?.total_bookings ?? 0 },
            { title: "Completed", value: dashboard?.completed_bookings ?? 0 },
          ].map((item, i) => (
            <div className="col-md-6 mb-3" key={i}>
              <div className="card shadow-sm">
                <div className="card-body text-center">
                  <h5 className="text-primary">{item.title}</h5>
                  <h2>{item.value}</h2>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* BOOKING LIST */}
        <h4 className="text-primary mb-3">My Bookings</h4>
        <div className="row">
          {dashboard?.upcoming_bookings.map((b) => (
            <div className="col-md-6 mb-3" key={b.booking_id}>
              <div className="card shadow-sm border-primary">
                <div className="card-body">
                  <h5>{b.vehicle_model} ({b.vehicle_type})</h5>
                  <p><strong>Driver:</strong> {b.driver_name ?? "No Driver Assigned"}</p>
                  <p><strong>Owner:</strong> {b.owner_name}</p>
                  <p><strong>Pickup:</strong> {new Date(b.pickup_time).toLocaleString()}</p>
                  <p><strong>Status:</strong> <span className="text-primary fw-bold">{b.status}</span></p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* NOTIFICATION MODAL */}
      {showNotificationModal && (
        <div className="modal show fade d-block modal-backdrop-custom">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Notifications</h5>
                <button
                  className="btn-close btn-close-white"
                  onClick={() => setShowNotificationModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {notifications.length === 0 ? (
                  <p>No new notifications.</p>
                ) : (
                  notifications.map((n, i) => (
                    <div key={i} className="alert alert-info">{n.message}</div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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
        .notif-badge {
          background: #ff3b3b;
          color: white;
          font-size: 11px;
          padding: 3px 8px;
          border-radius: 50px;
          position: absolute;
          right: 10px;
          top: 8px;
        }
        .modal-backdrop-custom {
          background: rgba(0, 0, 0, 0.5);
        }
      `}</style>
    </div>
  );
};

export default CustomerDashboard;
