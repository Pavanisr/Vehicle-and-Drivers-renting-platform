// driverRoutes.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../utils/db.js";
import verifyToken from "../middleware/auth.js";

const router = express.Router();

/* ======================================================
   DRIVER REGISTRATION
====================================================== */
router.post("/register", async (req, res) => {
  try {
    const { full_name, email, password, phone } = req.body;

    const existing = await pool.query("SELECT * FROM drivers WHERE email=$1", [email]);
    if (existing.rows.length > 0)
      return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO drivers (full_name, email, password, phone, created_at)
       VALUES ($1,$2,$3,$4,NOW()) RETURNING *`,
      [full_name, email, hashedPassword, phone]
    );

    res.status(201).json({ message: "Driver registered", driver: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

/* ======================================================
   LOGIN
====================================================== */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query("SELECT * FROM drivers WHERE email=$1", [email]);
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Driver not found" });

    const driver = result.rows[0];
    const isMatch = await bcrypt.compare(password, driver.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: driver.driver_id, role: "driver" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ message: "Login successful", token, driver });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

/* ======================================================
   PROFILE
====================================================== */
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const driverId = req.user.id;

    const result = await pool.query(
      `SELECT driver_id, full_name, email, phone, rating, created_at
       FROM drivers WHERE driver_id=$1`,
      [driverId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

/* ======================================================
   UPDATE PROFILE
====================================================== */
router.put("/profile", verifyToken, async (req, res) => {
  try {
    const driverId = req.user.id;
    const { full_name, phone } = req.body;

    const result = await pool.query(
      `UPDATE drivers 
       SET full_name=$1, phone=$2, updated_at=NOW()
       WHERE driver_id=$3 RETURNING *`,
      [full_name, phone, driverId]
    );

    res.json({ message: "Profile updated", driver: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

/* ======================================================
   ADD VEHICLE
====================================================== */
router.post("/vehicle", verifyToken, async (req, res) => {
  try {
    const driverId = req.user.id;
    const {
      owner_id,
      vehicle_type,
      model,
      capacity_passengers,
      capacity_luggage,
      fuel_type,
      license_plate,
      price_per_km,
      price_per_hour,
      image_url
    } = req.body;

    const result = await pool.query(
      `INSERT INTO vehicles
      (driver_id, owner_id, vehicle_type, model, capacity_passengers,
       capacity_luggage, fuel_type, license_plate,
       price_per_km, price_per_hour, image_url, status, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'available',NOW())
       RETURNING *`,
      [
        driverId,
        owner_id,
        vehicle_type,
        model,
        capacity_passengers,
        capacity_luggage,
        fuel_type,
        license_plate,
        price_per_km,
        price_per_hour,
        image_url
      ]
    );

    res.status(201).json({ message: "Vehicle added", vehicle: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Error adding vehicle", error: error.message });
  }
});

/* ======================================================
   UPDATE VEHICLE
====================================================== */
router.put("/vehicle/:id", verifyToken, async (req, res) => {
  try {
    const vehicleId = req.params.id;
    const driverId = req.user.id;
    const { model, price_per_km, price_per_hour, status } = req.body;

    const result = await pool.query(
      `UPDATE vehicles SET model=$1, price_per_km=$2, price_per_hour=$3,
       status=$4, updated_at=NOW()
       WHERE vehicle_id=$5 AND driver_id=$6 RETURNING *`,
      [model, price_per_km, price_per_hour, status, vehicleId, driverId]
    );

    res.json({ message: "Vehicle updated", vehicle: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Error updating vehicle", error: error.message });
  }
});

/* ======================================================
   DELETE VEHICLE
====================================================== */
router.delete("/vehicle/:id", verifyToken, async (req, res) => {
  try {
    const vehicleId = req.params.id;
    const driverId = req.user.id;

    await pool.query(
      "DELETE FROM vehicles WHERE vehicle_id=$1 AND driver_id=$2",
      [vehicleId, driverId]
    );

    res.json({ message: "Vehicle deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting vehicle", error: error.message });
  }
});
/* ======================================================
   GET ALL VEHICLES FOR DRIVER
====================================================== */
router.get("/vehicles", verifyToken, async (req, res) => {
  try {
    const driverId = req.user.id;

    const result = await pool.query(
      `SELECT vehicle_id, owner_id, vehicle_type, model, 
              capacity_passengers, capacity_luggage, fuel_type, 
              license_plate, price_per_km, price_per_hour, 
              status, image_url, created_at, updated_at
       FROM vehicles
       WHERE driver_id=$1
       ORDER BY created_at DESC`,
      [driverId]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching vehicles", error: error.message });
  }
});

/* ======================================================
   DRIVER – ALL BOOKING REQUESTS
====================================================== */
router.get("/requests", verifyToken, async (req, res) => {
  try {
    const driverId = req.user.id;

    const result = await pool.query(
      `SELECT b.*, 
              c.full_name AS customer_name,
              v.model AS vehicle_model,
              COALESCE(r.rating, 0) AS customer_rating,
              COALESCE(r.review, '') AS customer_review
       FROM bookings b
       LEFT JOIN customers c ON b.customer_id = c.customer_id
       LEFT JOIN vehicles v ON b.vehicle_id = v.vehicle_id
       LEFT JOIN ratings r ON r.booking_id = b.booking_id
       WHERE b.driver_id=$1
       ORDER BY b.created_at DESC`,
      [driverId]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching requests", error: error.message });
  }
});

/* ======================================================
   FILTER: PENDING REQUESTS
====================================================== */
router.get("/requests/pending", verifyToken, async (req, res) => {
  const driverId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT * FROM bookings WHERE driver_id=$1 AND status='requested'`,
      [driverId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Error", error: error.message });
  }
});

/* ======================================================
   APPROVE / REJECT REQUEST
====================================================== */
router.put("/requests/:id/status", verifyToken, async (req, res) => {
  try {
    const driverId = req.user.id;
    const bookingId = req.params.id;
    const { status } = req.body; // approved/rejected/on_trip/completed

    const result = await pool.query(
      `UPDATE bookings 
       SET status=$1, updated_at=NOW()
       WHERE booking_id=$2 AND driver_id=$3
       RETURNING *`,
      [status, bookingId, driverId]
    );

    res.json({ message: `Booking ${status}`, booking: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Error updating status", error: error.message });
  }
});

/* ======================================================
   DRIVER DASHBOARD (ADVANCED ANALYTICS)
====================================================== */
router.get("/dashboard", verifyToken, async (req, res) => {
  try {
    const driverId = req.user.id;

    const dashboard = {};

    /* ================================
       BASIC METRICS
    ================================= */
    const totalBookings = await pool.query(
      "SELECT COUNT(*) AS count FROM bookings WHERE driver_id=$1",
      [driverId]
    );
    dashboard.total_bookings = Number(totalBookings.rows[0].count);

    const totalVehicles = await pool.query(
      "SELECT COUNT(*) AS count FROM vehicles WHERE driver_id=$1",
      [driverId]
    );
    dashboard.total_vehicles = Number(totalVehicles.rows[0].count);

    const totalReviews = await pool.query(
      "SELECT COUNT(*) AS count FROM ratings WHERE driver_id=$1",
      [driverId]
    );
    dashboard.total_reviews = Number(totalReviews.rows[0].count);

    const avgRating = await pool.query(
      "SELECT COALESCE(AVG(rating),0) AS avg FROM ratings WHERE driver_id=$1",
      [driverId]
    );
    dashboard.avg_rating = Number(avgRating.rows[0].avg).toFixed(1);

    const earnings = await pool.query(
      `SELECT COALESCE(SUM(p.amount),0) AS total
       FROM payments p
       JOIN bookings b ON p.booking_id = b.booking_id
       WHERE b.driver_id=$1 AND p.payment_status='completed'`,
      [driverId]
    );
    dashboard.total_earnings = Number(earnings.rows[0].total);

    /* ================================
       BOOKINGS VS DAYS (Line Chart)
    ================================= */
    const bookingsVsDays = await pool.query(
      `SELECT DATE(created_at) AS day, COUNT(*) AS count
       FROM bookings 
       WHERE driver_id=$1
       GROUP BY day
       ORDER BY day ASC`,
      [driverId]
    );
    dashboard.bookings_vs_days = bookingsVsDays.rows;

    /* ================================
       BOOKINGS VS TIME (Hourly)
    ================================= */
    const bookingsVsTime = await pool.query(
      `SELECT EXTRACT(HOUR FROM created_at) AS hour, COUNT(*) AS count
       FROM bookings
       WHERE driver_id=$1
       GROUP BY hour
       ORDER BY hour ASC`,
      [driverId]
    );
    dashboard.bookings_vs_time = bookingsVsTime.rows;

    /* ================================
       BOOKINGS BY DAY / WEEK / MONTH / YEAR
    ================================= */
    const [daily, weekly, monthly, yearly] = await Promise.all([
      pool.query(
        `SELECT COUNT(*) AS count
         FROM bookings
         WHERE driver_id=$1 AND created_at::date = CURRENT_DATE`,
        [driverId]
      ),
      pool.query(
        `SELECT COUNT(*) AS count
         FROM bookings
         WHERE driver_id=$1 AND DATE_PART('week', created_at) = DATE_PART('week', CURRENT_DATE)`,
        [driverId]
      ),
      pool.query(
        `SELECT COUNT(*) AS count
         FROM bookings
         WHERE driver_id=$1 AND DATE_PART('month', created_at) = DATE_PART('month', CURRENT_DATE)`,
        [driverId]
      ),
      pool.query(
        `SELECT COUNT(*) AS count
         FROM bookings
         WHERE driver_id=$1 AND DATE_PART('year', created_at) = DATE_PART('year', CURRENT_DATE)`,
        [driverId]
      )
    ]);

    dashboard.bookings_today = Number(daily.rows[0].count);
    dashboard.bookings_this_week = Number(weekly.rows[0].count);
    dashboard.bookings_this_month = Number(monthly.rows[0].count);
    dashboard.bookings_this_year = Number(yearly.rows[0].count);

    /* ================================
       BOOKINGS BY VEHICLE TYPE (Pie Chart)
    ================================= */
    const bookingsByVehicleType = await pool.query(
      `SELECT v.vehicle_type, COUNT(b.booking_id) AS count
       FROM bookings b
       JOIN vehicles v ON b.vehicle_id = v.vehicle_id
       WHERE b.driver_id=$1
       GROUP BY v.vehicle_type`,
      [driverId]
    );
    dashboard.bookings_by_vehicle_type = bookingsByVehicleType.rows;

    /* ================================
       BOOKINGS PER VEHICLE (Bar Chart)
    ================================= */
    const bookingsPerVehicle = await pool.query(
      `SELECT v.model, v.vehicle_id, COUNT(b.booking_id) AS count
       FROM vehicles v
       LEFT JOIN bookings b ON v.vehicle_id = b.vehicle_id
       WHERE v.driver_id=$1
       GROUP BY v.vehicle_id
       ORDER BY count DESC`,
      [driverId]
    );
    dashboard.bookings_per_vehicle = bookingsPerVehicle.rows;

    /* ================================
       RETURN RESPONSE
    ================================= */
    res.json(dashboard);

  } catch (error) {
    res.status(500).json({
      message: "Error fetching dashboard",
      error: error.message
    });
  }
});

router.post("/logout", verifyToken, (req, res) => {
  try {
    // Since JWT cannot be destroyed server-side,
    // the frontend must delete it from localStorage/cookies.
    res.json({
      Status: true,
      message: "Logout successful. Token invalidated on client side."
    });
  } catch (error) {
    res.status(500).json({ Status: false, error: error.message });
  }
});

export default router;
