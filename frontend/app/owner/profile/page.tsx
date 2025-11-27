"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function OwnerProfile() {
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
    created_at: "",
  });

  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // ========================================
  // LOAD OWNER PROFILE
  // ========================================
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) throw new Error("No token found");

        const res = await axios.get("http://localhost:3000/api/owners/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProfile({
          full_name: res.data.full_name,
          email: res.data.email,
          phone: res.data.phone,
          created_at: res.data.created_at,
        });
      } catch (err) {
        window.location.href = "/login";
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // ========================================
  // LOADING SKELETON
  // ========================================
  if (loading) {
    return (
      <div
        className="container py-5"
        style={{ backgroundColor: "#eef5ff", minHeight: "100vh" }}
      >
        <div className="row justify-content-center fade-in">
          <div className="col-md-6">
            <div className="text-center mb-4">
              <div
                className="placeholder rounded-circle"
                style={{ width: "110px", height: "110px" }}
              ></div>
              <div className="placeholder col-6 mt-3 mx-auto"></div>
            </div>

            <div className="card p-4 shadow-sm">
              <div className="placeholder-glow">
                <p className="placeholder col-12 mb-3"></p>
                <p className="placeholder col-12 mb-3"></p>
                <p className="placeholder col-12 mb-3"></p>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .fade-in {
            animation: fadeIn 0.6s ease-in;
          }
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(15px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    );
  }

  // ========================================
  // READ MODE — SAME DESIGN AS DRIVER
  // ========================================
  if (!editMode) {
    return (
      <div
        className="container py-5 fade-in"
        style={{ backgroundColor: "#eef5ff", minHeight: "100vh" }}
      >
        <div className="mb-4 d-flex align-items-center">
          <button
            className="btn btn-outline-primary me-3"
            onClick={() => (window.location.href = "/owner")}
          >
            ← Back
          </button>

          <div className="text-center w-100">
            <h2 className="fw-bold text-primary">My Profile</h2>
            <p className="text-secondary">Manage your account information</p>
          </div>
        </div>

        <div className="row justify-content-center g-4">
          {/* LEFT COLUMN — Avatar */}
          <div className="col-md-4">
            <div className="card shadow-lg border-0 text-center p-4">
              <div
                className="rounded-circle d-flex justify-content-center align-items-center mx-auto"
                style={{
                  width: "130px",
                  height: "130px",
                  backgroundColor: "#2d6cdf",
                  color: "white",
                  fontSize: "50px",
                  fontWeight: "bold",
                }}
              >
                {profile.full_name.charAt(0).toUpperCase()}
              </div>

              <h4 className="mt-3 fw-bold">{profile.full_name}</h4>
              <p className="text-secondary">{profile.email}</p>
            </div>
          </div>

          {/* RIGHT COLUMN — DATA */}
          <div className="col-md-6">
            <div className="card p-4 shadow-lg border-0">
              <div className="mb-4">
                <h6 className="text-primary fw-bold">Full Name</h6>
                <p className="fw-semibold">{profile.full_name}</p>
              </div>

              <div className="mb-4">
                <h6 className="text-primary fw-bold">Email</h6>
                <p className="fw-semibold">{profile.email}</p>
              </div>

              <div className="mb-4">
                <h6 className="text-primary fw-bold">Phone</h6>
                <p className="fw-semibold">{profile.phone}</p>
              </div>

              <div className="mb-4">
                <h6 className="text-primary fw-bold">Joined</h6>
                <p className="fw-semibold">
                  {profile.created_at
                    ? new Date(profile.created_at).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>

              <button
                className="btn btn-primary btn-lg px-5"
                onClick={() => setEditMode(true)}
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        <style jsx>{`
          .fade-in {
            animation: fadeIn 0.6s ease-in;
          }
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(15px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    );
  }

  // ========================================
  // EDIT MODE — SAME UI AS DRIVER
  // ========================================
  return (
    <div
      className="container py-5 fade-in"
      style={{ backgroundColor: "#eef5ff", minHeight: "100vh" }}
    >
      <div className="mb-4 d-flex align-items-center">
        <button
          className="btn btn-outline-primary me-3"
          onClick={() => setEditMode(false)}
        >
          ← Back
        </button>

        <div className="text-center w-100">
          <h2 className="fw-bold text-primary">Edit Profile</h2>
          <p className="text-secondary">Update your personal information</p>
        </div>
      </div>

      <div className="row justify-content-center">
        <div className="col-md-7">
          <div className="card shadow-lg border-0 p-4">
            <div className="mb-3">
              <label className="form-label fw-semibold">Full Name</label>
              <input
                type="text"
                className="form-control form-control-lg"
                value={profile.full_name}
                onChange={(e) =>
                  setProfile({ ...profile, full_name: e.target.value })
                }
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Email</label>
              <input
                type="email"
                className="form-control form-control-lg"
                value={profile.email}
                disabled
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Phone</label>
              <input
                type="text"
                className="form-control form-control-lg"
                value={profile.phone}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
              />
            </div>

            <div className="d-flex gap-3 mt-3">
              <button
                className="btn btn-primary btn-lg px-4"
                onClick={async () => {
                  try {
                    const token = localStorage.getItem("token");

                    await axios.put(
                      "http://localhost:3000/api/owners/profile",
                      {
                        full_name: profile.full_name,
                        phone: profile.phone,
                      },
                      { headers: { Authorization: `Bearer ${token}` } }
                    );

                    setShowToast(true);
                    setEditMode(false);

                    setTimeout(() => setShowToast(false), 2500);
                  } catch {
                    alert("Failed to update profile");
                  }
                }}
              >
                Save Changes
              </button>

              <button
                className="btn btn-outline-secondary btn-lg px-4"
                onClick={() => setEditMode(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SUCCESS TOAST */}
      {showToast && (
        <div
          className="toast show position-fixed top-0 end-0 m-4 text-bg-success"
          role="alert"
        >
          <div className="toast-header bg-success text-white">
            <strong className="me-auto">Success</strong>
            <button type="button" className="btn-close btn-close-white"></button>
          </div>
          <div className="toast-body">Profile updated successfully!</div>
        </div>
      )}

      <style jsx>{`
        .fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
