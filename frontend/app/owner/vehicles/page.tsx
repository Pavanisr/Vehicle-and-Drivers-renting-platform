"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface Vehicle {
  vehicle_id: number;
  owner_id: number;
  driver_id: number | null;
  driver_name?: string;
  vehicle_type: string;
  model: string;
  capacity_passengers: number;
  capacity_luggage: number;
  fuel_type: string;
  license_plate: string;
  price_per_km: number;
  price_per_hour: number;
  status: string;
  image_url: string;
}

export default function OwnerVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [currentVehicle, setCurrentVehicle] = useState<Partial<Vehicle>>({});
  const [msg, setMsg] = useState("");

  // Fetch vehicles
  const fetchVehicles = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:3000/api/owners/vehicles", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVehicles(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch vehicles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // Delete vehicle
  const deleteVehicle = async (id: number) => {
    if (!confirm("Delete this vehicle?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3000/api/owners/vehicle/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVehicles(vehicles.filter(v => v.vehicle_id !== id));
    } catch (err) {
      alert("Failed to delete vehicle");
    }
  };

  // Add modal
  const openAddModal = () => {
    setModalMode("add");
    setCurrentVehicle({});
    setMsg("");
    setShowModal(true);
  };

  // Edit modal
  const openEditModal = (vehicle: Vehicle) => {
    setModalMode("edit");
    setCurrentVehicle(vehicle);
    setMsg("");
    setShowModal(true);
  };

  // Add / Edit form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      if (modalMode === "add") {
        const res = await axios.post(
          "http://localhost:3000/api/owners/vehicle",
          currentVehicle,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setVehicles([res.data.vehicle, ...vehicles]);
        setMsg("Vehicle added successfully!");
        setCurrentVehicle({});
      } else {
        const res = await axios.put(
          `http://localhost:3000/api/owners/vehicle/${currentVehicle.vehicle_id}`,
          currentVehicle,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setVehicles(
          vehicles.map(v =>
            v.vehicle_id === res.data.vehicle.vehicle_id ? res.data.vehicle : v
          )
        );
        setMsg("Vehicle updated successfully!");
      }
    } catch (err) {
      alert("Failed to save changes");
    }
  };

  return (
    <div className="container py-5" style={{ minHeight: "100vh", backgroundColor: "#eef5ff" }}>
      {/* Top Nav Buttons */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button
          className="btn btn-outline-primary"
          onClick={() => (window.location.href = "/owner")}
        >
          ← Back to Dashboard
        </button>
        <button className="btn btn-primary" onClick={openAddModal}>
          + Add Vehicle
        </button>
      </div>

      <h2 className="text-primary fw-bold mb-4">My Vehicles</h2>

      {loading && <p>Loading...</p>}

      {/* Vehicle Cards */}
      <div className="row g-4">
        {vehicles.map((vehicle) => (
          <div className="col-md-4" key={vehicle.vehicle_id}>
            <div className="card shadow-lg border-0 h-100">

              {/* Image */}
              {vehicle.image_url ? (
                <img
                  src={vehicle.image_url}
                  className="card-img-top"
                  style={{ height: "180px", objectFit: "cover" }}
                />
              ) : (
                <div
                  className="bg-primary text-white d-flex justify-content-center align-items-center"
                  style={{ height: "180px", fontSize: "36px" }}
                >
                  {vehicle.model?.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="card-body d-flex flex-column">
                <h5 className="card-title text-primary fw-bold">{vehicle.model}</h5>
                <p className="mb-1"><strong>Type:</strong> {vehicle.vehicle_type}</p>
                <p className="mb-1"><strong>Driver:</strong> {vehicle.driver_name || "Not Assigned"}</p>
                <p className="mb-1"><strong>Passengers:</strong> {vehicle.capacity_passengers}</p>
                <p className="mb-1"><strong>Luggage:</strong> {vehicle.capacity_luggage}</p>
                <p className="mb-1"><strong>Fuel:</strong> {vehicle.fuel_type}</p>
                <p className="mb-1"><strong>License:</strong> {vehicle.license_plate}</p>
                <p className="mb-1"><strong>Price/km:</strong> Rs {vehicle.price_per_km}</p>
                <p className="mb-3"><strong>Price/hour:</strong> Rs {vehicle.price_per_hour}</p>

                <p><strong>Status:</strong> <span className={vehicle.status === "available" ? "text-success" : "text-danger"}>{vehicle.status}</span></p>

                <div className="mt-auto d-flex gap-2">
                  <button className="btn btn-outline-primary flex-grow-1" onClick={() => openEditModal(vehicle)}>
                    Edit
                  </button>
                  <button className="btn btn-danger flex-grow-1" onClick={() => deleteVehicle(vehicle.vehicle_id)}>
                    Delete
                  </button>
                </div>

              </div>
            </div>
          </div>
        ))}

        {!loading && vehicles.length === 0 && (
          <p className="text-center text-secondary">No vehicles added yet.</p>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    {modalMode === "add" ? "Add Vehicle" : "Edit Vehicle"}
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>

                <div className="modal-body">
                  {msg && <div className="alert alert-success">{msg}</div>}

                  {/* Form Fields */}
                  <div className="row g-3">

                    <div className="col-md-6">
                      <label className="form-label">Model</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={currentVehicle.model || ""}
                        onChange={(e) => setCurrentVehicle({ ...currentVehicle, model: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Vehicle Type</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={currentVehicle.vehicle_type || ""}
                        onChange={(e) => setCurrentVehicle({ ...currentVehicle, vehicle_type: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Passenger Capacity</label>
                      <input
                        type="number"
                        className="form-control"
                        required
                        value={currentVehicle.capacity_passengers || ""}
                        onChange={(e) =>
                          setCurrentVehicle({ ...currentVehicle, capacity_passengers: Number(e.target.value) })
                        }
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Luggage Capacity</label>
                      <input
                        type="number"
                        className="form-control"
                        required
                        value={currentVehicle.capacity_luggage || ""}
                        onChange={(e) =>
                          setCurrentVehicle({ ...currentVehicle, capacity_luggage: Number(e.target.value) })
                        }
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Fuel Type</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={currentVehicle.fuel_type || ""}
                        onChange={(e) =>
                          setCurrentVehicle({ ...currentVehicle, fuel_type: e.target.value })
                        }
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">License Plate</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        value={currentVehicle.license_plate || ""}
                        onChange={(e) =>
                          setCurrentVehicle({ ...currentVehicle, license_plate: e.target.value })
                        }
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Price per km</label>
                      <input
                        type="number"
                        className="form-control"
                        required
                        value={currentVehicle.price_per_km || ""}
                        onChange={(e) =>
                          setCurrentVehicle({ ...currentVehicle, price_per_km: Number(e.target.value) })
                        }
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Price per hour</label>
                      <input
                        type="number"
                        className="form-control"
                        required
                        value={currentVehicle.price_per_hour || ""}
                        onChange={(e) =>
                          setCurrentVehicle({ ...currentVehicle, price_per_hour: Number(e.target.value) })
                        }
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label">Image URL</label>
                      <input
                        type="text"
                        className="form-control"
                        value={currentVehicle.image_url || ""}
                        onChange={(e) =>
                          setCurrentVehicle({ ...currentVehicle, image_url: e.target.value })
                        }
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label">Status</label>
                      <select
                        className="form-select"
                        value={currentVehicle.status || "available"}
                        onChange={(e) => setCurrentVehicle({ ...currentVehicle, status: e.target.value })}
                      >
                        <option value="available">Available</option>
                        <option value="unavailable">Unavailable</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="modal-footer">
                  <button type="submit" className="btn btn-primary">
                    {modalMode === "add" ? "Add Vehicle" : "Save Changes"}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
