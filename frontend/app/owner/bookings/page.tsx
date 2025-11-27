"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface Booking {
  booking_id: number;
  customer_name: string;
  vehicle_model: string;
  driver_name: string | null;
  status: string;
  created_at: string;
}

export default function OwnerBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  const statusOptions = ["requested", "approved", "on_trip", "completed", "rejected"];

  // Badge colors
  const statusBadge = (status: string) => {
    switch (status) {
      case "requested":
        return "bg-warning text-dark";
      case "approved":
        return "bg-primary text-white";
      case "on_trip":
        return "bg-info text-dark";
      case "completed":
        return "bg-success text-white";
      case "rejected":
        return "bg-danger text-white";
      default:
        return "bg-secondary text-white";
    }
  };

  // Fetch bookings on load
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Token missing");

        const res = await axios.get(
          "http://localhost:3000/api/owners/bookings",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setBookings(res.data);
      } catch (err) {
        console.error(err);
        alert("Failed to load bookings. Please login again.");
        window.location.href = "/login";
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Update status
  const updateStatus = async (id: number, status: string) => {
    try {
      const token = localStorage.getItem("token");
      setUpdating(id);

      await axios.put(
        `http://localhost:3000/api/owners/booking/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBookings((prev) =>
        prev.map((b) =>
          b.booking_id === id ? { ...b, status } : b
        )
      );
    } catch (err) {
      console.error(err);
      alert("Status update failed.");
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: "100vh" }}>
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ minHeight: "100vh", backgroundColor: "#eef5ff" }}>
      
      {/* Header */}
      <div className="mb-4 d-flex align-items-center">
        <button
          className="btn btn-outline-primary me-3"
          onClick={() => window.location.href = "/owner"}
        >
          ← Back
        </button>

        <div className="text-center w-100">
          <h2 className="fw-bold text-primary">Booking Requests</h2>
          <p className="text-secondary">Manage all bookings for your vehicles</p>
        </div>
      </div>

      {/* Table */}
      <div className="card shadow-lg border-0 fade-in">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-primary">
              <tr>
                <th>#</th>
                <th>Customer</th>
                <th>Vehicle</th>
                <th>Driver</th>
                <th>Status</th>
                <th>Requested On</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {bookings.map((b, index) => (
                <tr key={b.booking_id}>
                  <td>{index + 1}</td>
                  <td>{b.customer_name}</td>
                  <td>{b.vehicle_model}</td>
                  <td>{b.driver_name || "N/A"}</td>

                  {/* Status Badge */}
                  <td>
                    <span className={`badge ${statusBadge(b.status)} text-capitalize`}>
                      {b.status.replace("_", " ")}
                    </span>
                  </td>

                  {/* Created at */}
                  <td>{new Date(b.created_at).toLocaleString()}</td>

                  {/* Select status */}
                  <td>
                    <select
                      className="form-select form-select-sm"
                      value={b.status}
                      disabled={updating === b.booking_id}
                      onChange={(e) => updateStatus(b.booking_id, e.target.value)}
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>
                          {s.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}

              {bookings.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-secondary">
                    No booking requests available.
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        .fade-in {
          animation: fadeIn 0.4s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

    </div>
  );
}
