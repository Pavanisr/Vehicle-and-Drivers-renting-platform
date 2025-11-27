"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaCar, FaUser, FaSignOutAlt } from "react-icons/fa";
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

const CustomerDashboard: React.FC = () => {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  // Filters & booking state
  const [filters, setFilters] = useState({
    vehicle_type: "",
    vehicle_model: "",
    with_driver: "true",
    pickup_location: "",
    drop_location: "",
    trip_type: "",
    passengers: "",
    luggage: "",
    fuel_type: "",
  });

  const [pickupTime, setPickupTime] = useState("");
  const [dropTime, setDropTime] = useState("");
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [priceEstimate, setPriceEstimate] = useState<number | null>(null);

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
        const profileRes = await fetch("http://localhost:3000/api/customers/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!profileRes.ok) throw new Error("Failed to authenticate token");
        const profileData = await profileRes.json();
        setProfile(profileData);

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

  // Handle Book Now modal
  const [showBookModal, setShowBookModal] = useState(false);
  const openBookModal = () => setShowBookModal(true);
  const closeBookModal = () => {
    setShowBookModal(false);
    setVehicles([]);
    setSelectedVehicle(null);
    setPriceEstimate(null);
  };

  // SEARCH VEHICLES
  const handleSearch = async () => {
    if (!token) return alert("Token missing, please login again.");
    try {
      const query = new URLSearchParams(filters as any).toString();
      const res = await fetch(`http://localhost:3000/api/customers/search?${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) setVehicles(data);
      else setVehicles([]);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      alert("Error fetching vehicles. Check console.");
    }
  };

  // Confirm booking
  const handleBook = async () => {
    if (!selectedVehicle || !pickupTime || !dropTime) return alert("Please fill all fields");

    try {
      const res = await fetch("http://localhost:3000/api/customers/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          vehicle_id: selectedVehicle.vehicle_id,
          driver_id: selectedVehicle.driver_id,
          owner_id: selectedVehicle.owner_id,
          pickup_location: filters.pickup_location,
          drop_location: filters.drop_location,
          pickup_time: pickupTime,
          drop_time: dropTime,
          trip_type: filters.trip_type,
          price_estimate: selectedVehicle.price_per_km,
        }),
      });
      await res.json();
      alert("Booking requested successfully!");
      closeBookModal();
    } catch (error) {
      console.error("Error booking vehicle:", error);
      alert("Failed to book vehicle");
    }
  };

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

  return (
    <div className={`d-flex ${showBookModal ? "blurred" : ""}`}>
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
            <button className="sidebar-btn" onClick={() => router.push("/customerProf")}>
              <FaUser className="me-2" /> Profile
            </button>
          </li>
          <li>
            <button className="sidebar-btn" onClick={openBookModal}>
              <FaCar className="me-2" /> Book Now
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
          {[{ title: "Total Bookings", value: dashboard?.total_bookings ?? 0 }, { title: "Completed", value: dashboard?.completed_bookings ?? 0 }].map(
            (item, i) => (
              <div className="col-md-6 mb-3" key={i}>
                <div className="card shadow-sm">
                  <div className="card-body text-center">
                    <h5 className="text-primary">{item.title}</h5>
                    <h2>{item.value}</h2>
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {/* BOOKING LIST */}
        <h4 className="text-primary mb-3">My Bookings</h4>
        <div className="row">
          {dashboard?.upcoming_bookings.map((b) => (
            <div className="col-md-6 mb-3" key={b.booking_id}>
              <div className="card shadow-sm border-primary">
                <div className="card-body">
                  <h5>
                    {b.vehicle_model} ({b.vehicle_type})
                  </h5>
                  <p>
                    <strong>Driver:</strong> {b.driver_name ?? "No Driver Assigned"}
                  </p>
                  <p>
                    <strong>Owner:</strong> {b.owner_name}
                  </p>
                  <p>
                    <strong>Pickup:</strong> {new Date(b.pickup_time).toLocaleString()}
                  </p>
                  <p>
                    <strong>Status:</strong> <span className="text-primary fw-bold">{b.status}</span>
                  </p>
                  <div className="d-flex gap-2 mt-2">
                    <button className="btn btn-outline-primary btn-sm">Rating</button>
                    <button className="btn btn-outline-secondary btn-sm">Review</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BOOK NOW MODAL */}
      {showBookModal && (
        <div className="modal show d-block modal-backdrop-custom">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Book a Vehicle</h5>
                <button className="btn-close btn-close-white" onClick={closeBookModal}></button>
              </div>
              <div className="modal-body">
                {/* FILTERS */}
                <div className="row g-2">
                  <div className="col-md-6">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Vehicle Type"
                      value={filters.vehicle_type}
                      onChange={(e) => setFilters({ ...filters, vehicle_type: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Vehicle Model"
                      value={filters.vehicle_model}
                      onChange={(e) => setFilters({ ...filters, vehicle_model: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6">
                    <select
                      className="form-control"
                      value={filters.with_driver}
                      onChange={(e) => setFilters({ ...filters, with_driver: e.target.value })}
                    >
                      <option value="true">With Driver</option>
                      <option value="false">Without Driver</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Pickup Location"
                      value={filters.pickup_location}
                      onChange={(e) => setFilters({ ...filters, pickup_location: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Drop Location"
                      value={filters.drop_location}
                      onChange={(e) => setFilters({ ...filters, drop_location: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Trip Type"
                      value={filters.trip_type}
                      onChange={(e) => setFilters({ ...filters, trip_type: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Passengers"
                      value={filters.passengers}
                      onChange={(e) => setFilters({ ...filters, passengers: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Luggage Capacity"
                      value={filters.luggage}
                      onChange={(e) => setFilters({ ...filters, luggage: e.target.value })}
                    />
                  </div>
                  <div className="col-md-6">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Fuel Type"
                      value={filters.fuel_type}
                      onChange={(e) => setFilters({ ...filters, fuel_type: e.target.value })}
                    />
                  </div>
                </div>

                <div className="mt-3 text-center">
                  <button className="btn btn-primary" onClick={handleSearch}>
                    Search Vehicles
                  </button>
                </div>

                {/* VEHICLE LIST */}
                {vehicles.length > 0 && (
                  <div className="mt-3">
                    <h6>Select Vehicle:</h6>
                    {vehicles.map((v) => (
                      <div
                        key={v.vehicle_id}
                        className={`card mb-2 p-2 ${selectedVehicle?.vehicle_id === v.vehicle_id ? "border border-success" : ""}`}
                        onClick={() => {
                          setSelectedVehicle(v);
                          setPriceEstimate(v.price_per_km);
                        }}
                      >
                        <p>
                          {v.model} ({v.vehicle_type}) - Owner: {v.owner_name} - Driver: {v.driver_name ?? "No Driver"}
                        </p>
                        <p>Price per KM: {v.price_per_km}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* PICKUP/DROP TIME & PRICE */}
                {selectedVehicle && (
                  <div className="mt-3">
                    <label>Pickup Time</label>
                    <input type="datetime-local" className="form-control mb-2" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} />
                    <label>Drop Time</label>
                    <input type="datetime-local" className="form-control mb-2" value={dropTime} onChange={(e) => setDropTime(e.target.value)} />
                    <p>Price Estimate: {priceEstimate}</p>
                    <button className="btn btn-success" onClick={handleBook}>
                      Submit Booking
                    </button>
                  </div>
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
        .blurred {
          filter: blur(3px);
        }
        .modal-backdrop-custom {
          background: rgba(0, 0, 0, 0.5);
        }
      `}</style>
    </div>
  );
};

export default CustomerDashboard;
