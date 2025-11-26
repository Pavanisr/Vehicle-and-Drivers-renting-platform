"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function CustomerProfile() {
  const [profile, setProfile] = useState({ full_name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("No token found. Please log in.");
        }

        // Correctly send Authorization header
        const res = await axios.get("http://localhost:3000/api/customers/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProfile({
          full_name: res.data.full_name,
          email: res.data.email,
          phone: res.data.phone,
        });
      } catch (err: any) {
        console.error("Profile fetch error:", err.response?.data || err.message || err);

        if (err.response?.status === 401 || err.response?.status === 403) {
          // token invalid/expired
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          window.location.href = "/login"; // redirect to login
        }

        setErrorMessage(err.response?.data?.message || "Failed to fetch profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Loading UI
  if (loading) return <p className="text-center mt-5">Loading profile...</p>;

  // Error UI
  if (errorMessage)
    return (
      <div className="container mt-5">
        <div className="alert alert-danger text-center">{errorMessage}</div>
      </div>
    );

  // Profile form
  return (
    <div className="container py-4" style={{ backgroundColor: "#f0f6ff", minHeight: "100vh" }}>
      <h3 className="fw-bold text-primary mb-4">Account Settings</h3>
      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label text-secondary">Full Name</label>
              <input
                type="text"
                className="form-control"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label text-secondary">Email</label>
              <input type="email" className="form-control" value={profile.email} disabled />
            </div>

            <div className="col-md-6">
              <label className="form-label text-secondary">Phone Number</label>
              <input
                type="text"
                className="form-control"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="mt-4">
            <button
              className="btn btn-primary px-4"
              onClick={async () => {
                try {
                  const token = localStorage.getItem("token");
                  await axios.put(
                    "http://localhost:3000/api/customers/profile",
                    profile,
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                  alert("Profile updated successfully!");
                } catch (err: any) {
                  alert(err.response?.data?.message || "Failed to update profile.");
                }
              }}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
