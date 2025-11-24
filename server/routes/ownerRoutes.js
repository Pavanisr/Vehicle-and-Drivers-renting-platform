// ownerRoutes.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../utils/db.js";
import verifyToken from "../middleware/auth.js";

const router = express.Router();

/* ======================================================
   Owner Registration
====================================================== */
router.post("/register", async (req, res) => {
  try {
    const { full_name, email, password, phone } = req.body;

    const existing = await pool.query("SELECT * FROM owners WHERE email=$1", [email]);
    if (existing.rows.length > 0)
      return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO owners (full_name, email, password, phone, created_at) VALUES ($1,$2,$3,$4,NOW()) RETURNING *",
      [full_name, email, hashedPassword, phone]
    );

    res.status(201).json({ message: "Registration successful", owner: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/* ======================================================
   Owner Login
====================================================== */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query("SELECT * FROM owners WHERE email=$1", [email]);

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Owner not found" });

    const owner = result.rows[0];
    const isMatch = await bcrypt.compare(password, owner.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ id: owner.owner_id, role: "owner" }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({ message: "Login successful", token, owner });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/* ======================================================
   Owner Profile
====================================================== */
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const ownerId = req.user.id;
    const result = await pool.query(
      "SELECT owner_id, full_name, email, phone, created_at FROM owners WHERE owner_id=$1",
      [ownerId]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.put("/profile", verifyToken, async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { full_name, phone } = req.body;
    const result = await pool.query(
      "UPDATE owners SET full_name=$1, phone=$2, updated_at=NOW() WHERE owner_id=$3 RETURNING *",
      [full_name, phone, ownerId]
    );
    res.json({ message: "Profile updated", owner: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/* ======================================================
   Vehicle Management (CRUD)
====================================================== */
router.post("/vehicle", verifyToken, async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { driver_id, vehicle_type, model, capacity_passengers, capacity_luggage, fuel_type, license_plate, price_per_km, price_per_hour, image_url } = req.body;

    const result = await pool.query(
      `INSERT INTO vehicles
      (owner_id, driver_id, vehicle_type, model, capacity_passengers, capacity_luggage, fuel_type, license_plate, price_per_km, price_per_hour, image_url, status, created_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'available',NOW())
      RETURNING *`,
      [ownerId, driver_id, vehicle_type, model, capacity_passengers, capacity_luggage, fuel_type, license_plate, price_per_km, price_per_hour, image_url]
    );

    res.status(201).json({ message: "Vehicle added", vehicle: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Error adding vehicle", error: error.message });
  }
});

router.put("/vehicle/:id", verifyToken, async (req, res) => {
  try {
    const vehicleId = req.params.id;
    const ownerId = req.user.id;
    const { model, price_per_km, price_per_hour, status } = req.body;

    const result = await pool.query(
      `UPDATE vehicles
       SET model=$1, price_per_km=$2, price_per_hour=$3, status=$4, updated_at=NOW()
       WHERE vehicle_id=$5 AND owner_id=$6
       RETURNING *`,
      [model, price_per_km, price_per_hour, status, vehicleId, ownerId]
    );

    res.json({ message: "Vehicle updated", vehicle: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Error updating vehicle", error: error.message });
  }
});

router.delete("/vehicle/:id", verifyToken, async (req, res) => {
  try {
    const vehicleId = req.params.id;
    const ownerId = req.user.id;

    await pool.query("DELETE FROM vehicles WHERE vehicle_id=$1 AND owner_id=$2", [vehicleId, ownerId]);
    res.json({ message: "Vehicle deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting vehicle", error: error.message });
  }
});

/* ======================================================
   View Bookings for Owner Vehicles
====================================================== */
router.get("/bookings", verifyToken, async (req, res) => {
  try {
    const ownerId = req.user.id;
    const result = await pool.query(`
      SELECT b.*, c.full_name AS customer_name, v.model AS vehicle_model, d.full_name AS driver_name
      FROM bookings b
      LEFT JOIN customers c ON b.customer_id = c.customer_id
      LEFT JOIN vehicles v ON b.vehicle_id = v.vehicle_id
      LEFT JOIN drivers d ON b.driver_id = d.driver_id
      WHERE b.owner_id=$1
      ORDER BY b.created_at DESC
    `, [ownerId]);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching bookings", error: error.message });
  }
});

router.put("/booking/:id/status", verifyToken, async (req, res) => {
  try {
    const bookingId = req.params.id;
    const ownerId = req.user.id;
    const { status } = req.body; // approved, rejected, on_trip, completed

    const result = await pool.query(
      "UPDATE bookings SET status=$1, updated_at=NOW() WHERE booking_id=$2 AND owner_id=$3 RETURNING *",
      [status, bookingId, ownerId]
    );

    res.json({ message: `Booking ${status}`, booking: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Error updating booking status", error: error.message });
  }
});

/* ======================================================
   OWNER DASHBOARD – ADVANCED ANALYTICS
====================================================== */
router.get("/dashboard", verifyToken, async (req, res) => {
  try {
    const ownerId = req.user.id;
    const dashboard = {};

    /* ===========================
       BASIC METRICS
    ============================ */
    const totalTrips = await pool.query(
      "SELECT COUNT(*) AS total FROM bookings WHERE owner_id=$1 AND status='completed'",
      [ownerId]
    );
    dashboard.total_trips = Number(totalTrips.rows[0].total);

    const totalRevenue = await pool.query(
      `SELECT COALESCE(SUM(p.amount),0) AS revenue
       FROM payments p
       JOIN bookings b ON p.booking_id = b.booking_id
       WHERE b.owner_id=$1 AND p.payment_status='completed'`,
      [ownerId]
    );
    dashboard.total_revenue = Number(totalRevenue.rows[0].revenue);

    const avgRating = await pool.query(
      `SELECT COALESCE(AVG(rating),0) AS avg
       FROM ratings
       WHERE owner_id=$1`,
      [ownerId]
    );
    dashboard.avg_rating = Number(avgRating.rows[0].avg).toFixed(1);

    /* ===========================
       BOOKINGS vs DAYS (7-day Line Chart)
    ============================ */
    const bookingsByDay = await pool.query(`
      SELECT DATE(created_at) AS day, COUNT(*) AS count
      FROM bookings
      WHERE owner_id=$1 AND created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY day ASC
    `, [ownerId]);
    dashboard.bookings_vs_days = bookingsByDay.rows;

    /* ===========================
       BOOKINGS vs MONTHS (12-month Line Chart)
    ============================ */
    const bookingsByMonth = await pool.query(`
      SELECT DATE_TRUNC('month', created_at) AS month, COUNT(*) AS count
      FROM bookings
      WHERE owner_id=$1 AND created_at >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY month
      ORDER BY month ASC
    `, [ownerId]);
    dashboard.bookings_vs_month = bookingsByMonth.rows;

    /* ===========================
       BOOKINGS BY TIME (Hourly)
    ============================ */
    const bookingsByHour = await pool.query(`
      SELECT EXTRACT(HOUR FROM created_at) AS hour, COUNT(*) AS count
      FROM bookings
      WHERE owner_id=$1
      GROUP BY hour
      ORDER BY hour ASC
    `, [ownerId]);
    dashboard.bookings_by_time = bookingsByHour.rows;

    /* ===========================
       PIE CHART: BOOKINGS BY VEHICLE TYPE
    ============================ */
    const bookingsByVehicleType = await pool.query(`
      SELECT v.vehicle_type, COUNT(b.booking_id) AS total
      FROM bookings b
      JOIN vehicles v ON b.vehicle_id = v.vehicle_id
      WHERE b.owner_id=$1
      GROUP BY v.vehicle_type
    `, [ownerId]);
    dashboard.bookings_by_vehicle_type = bookingsByVehicleType.rows;

    /* ===========================
       BAR CHART: BOOKINGS PER VEHICLE
    ============================ */
    const bookingsPerVehicle = await pool.query(`
      SELECT v.vehicle_id, v.model, COUNT(b.booking_id) AS count
      FROM vehicles v
      LEFT JOIN bookings b ON v.vehicle_id = b.vehicle_id
      WHERE v.owner_id=$1
      GROUP BY v.vehicle_id
      ORDER BY count DESC
    `, [ownerId]);
    dashboard.bookings_per_vehicle = bookingsPerVehicle.rows;

    /* ===========================
       BAR CHART: REVENUE PER VEHICLE
    ============================ */
    const revenuePerVehicle = await pool.query(`
      SELECT v.vehicle_id, v.model,
        COALESCE(SUM(p.amount), 0) AS revenue
      FROM vehicles v
      LEFT JOIN bookings b ON v.vehicle_id = b.vehicle_id
      LEFT JOIN payments p ON b.booking_id = p.booking_id AND p.payment_status='completed'
      WHERE v.owner_id=$1
      GROUP BY v.vehicle_id
      ORDER BY revenue DESC
    `, [ownerId]);
    dashboard.revenue_per_vehicle = revenuePerVehicle.rows;

    /* ===========================
       DAILY / WEEKLY / MONTHLY / YEARLY BOOKINGS
    ============================ */
    const [daily, weekly, monthly, yearly] = await Promise.all([
      pool.query(
        `SELECT COUNT(*) AS count FROM bookings 
         WHERE owner_id=$1 AND created_at::date = CURRENT_DATE`,
        [ownerId]
      ),
      pool.query(
        `SELECT COUNT(*) AS count FROM bookings 
         WHERE owner_id=$1 AND DATE_PART('week', created_at) = DATE_PART('week', CURRENT_DATE)`,
        [ownerId]
      ),
      pool.query(
        `SELECT COUNT(*) AS count FROM bookings 
         WHERE owner_id=$1 AND DATE_PART('month', created_at) = DATE_PART('month', CURRENT_DATE)`,
        [ownerId]
      ),
      pool.query(
        `SELECT COUNT(*) AS count FROM bookings 
         WHERE owner_id=$1 AND DATE_PART('year', created_at) = DATE_PART('year', CURRENT_DATE)`,
        [ownerId]
      )
    ]);

    dashboard.bookings_today = Number(daily.rows[0].count);
    dashboard.bookings_this_week = Number(weekly.rows[0].count);
    dashboard.bookings_this_month = Number(monthly.rows[0].count);
    dashboard.bookings_this_year = Number(yearly.rows[0].count);

    /* ===========================
       SEND RESPONSE
    ============================ */
    res.json({ Status: true, Dashboard: dashboard });

  } catch (error) {
    res.status(500).json({ message: "Error fetching dashboard", error: error.message });
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
