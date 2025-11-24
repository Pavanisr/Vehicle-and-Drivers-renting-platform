// customerRoutes.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../utils/db.js";
import verifyToken from "../middleware/auth.js";

const router = express.Router();

/* ======================================================
   Customer Registration
====================================================== */
router.post("/register", async (req, res) => {
  try {
    const { full_name, email, password, phone } = req.body;

    // Check if email exists
    const existing = await pool.query("SELECT * FROM customers WHERE email=$1", [email]);
    if (existing.rows.length > 0)
      return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO customers (full_name, email, password, phone, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *",
      [full_name, email, hashedPassword, phone]
    );

    res.status(201).json({ message: "Registration successful", customer: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/* ======================================================
   Customer Login
====================================================== */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query("SELECT * FROM customers WHERE email=$1", [email]);

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Customer not found" });

    const customer = result.rows[0];
    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: customer.customer_id, role: "customer" },
      "your_jwt_secret_key", // Replace with your secret or env variable
      { expiresIn: "7d" }
    );

    res.status(200).json({ message: "Login successful", token, customer });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/* ======================================================
   Get Customer Profile
====================================================== */
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const customerId = req.user.id;
    const result = await pool.query(
      "SELECT customer_id, full_name, email, phone, created_at FROM customers WHERE customer_id=$1",
      [customerId]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/* ======================================================
   Update Customer Profile
====================================================== */
router.put("/profile", verifyToken, async (req, res) => {
  try {
    const customerId = req.user.id;
    const { full_name, phone } = req.body;
    const result = await pool.query(
      "UPDATE customers SET full_name=$1, phone=$2, updated_at=NOW() WHERE customer_id=$3 RETURNING *",
      [full_name, phone, customerId]
    );
    res.json({ message: "Profile updated", customer: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/* ======================================================
   Search Vehicles & Drivers (Advanced Filters + Ratings)
====================================================== */
router.get("/search", verifyToken, async (req, res) => {
  try {
    const {
      vehicle_type,
      with_driver,
      pickup_location,
      drop_location,
      trip_type,
      vehicle_model,
      passengers,
      luggage,
      price_min,
      price_max,
      fuel_type
    } = req.query;

    let query = `
      SELECT 
        v.*,
        o.full_name AS owner_name,
        d.full_name AS driver_name,

        /* ========= DRIVER RATINGS ========= */
        AVG(dr.rating) AS driver_rating_avg,
        COUNT(dr.rating) AS driver_rating_count,

        /* ========= VEHICLE RATINGS ========= */
        AVG(vr.rating) AS vehicle_rating_avg,
        COUNT(vr.rating) AS vehicle_rating_count,

        /* ========= OWNER RATINGS ========= */
        AVG(orate.rating) AS owner_rating_avg,
        COUNT(orate.rating) AS owner_rating_count

      FROM vehicles v
      LEFT JOIN owners o ON v.owner_id = o.owner_id
      LEFT JOIN drivers d ON v.driver_id = d.driver_id

      /* join rating table 3 times for driver/vehicle/owner */
      LEFT JOIN ratings dr ON dr.driver_id = d.driver_id
      LEFT JOIN ratings vr ON vr.vehicle_id = v.vehicle_id
      LEFT JOIN ratings orate ON orate.owner_id = o.owner_id
      
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    if (vehicle_type) {
      query += ` AND v.vehicle_type=$${idx++}`;
      params.push(vehicle_type);
    }
    if (vehicle_model) {
      query += ` AND v.model=$${idx++}`;
      params.push(vehicle_model);
    }
    if (with_driver !== undefined) {
      query += with_driver === "true" ? " AND v.driver_id IS NOT NULL" : " AND v.driver_id IS NULL";
    }
    if (passengers) {
      query += ` AND v.passenger_capacity >= $${idx++}`;
      params.push(passengers);
    }
    if (luggage) {
      query += ` AND v.luggage_capacity >= $${idx++}`;
      params.push(luggage);
    }
    if (fuel_type) {
      query += ` AND v.fuel_type=$${idx++}`;
      params.push(fuel_type);
    }
    if (price_min) {
      query += ` AND v.price_per_km >= $${idx++}`;
      params.push(price_min);
    }
    if (price_max) {
      query += ` AND v.price_per_km <= $${idx++}`;
      params.push(price_max);
    }

    // Optional: pickup/drop location & trip type filter
    if (pickup_location) {
      query += ` AND v.vehicle_id IN (
        SELECT vehicle_id FROM bookings WHERE pickup_location=$${idx++} AND status='requested'
      )`;
      params.push(pickup_location);
    }
    if (drop_location) {
      query += ` AND v.vehicle_id IN (
        SELECT vehicle_id FROM bookings WHERE drop_location=$${idx++} AND status='requested'
      )`;
      params.push(drop_location);
    }
    if (trip_type) {
      query += ` AND v.vehicle_id IN (
        SELECT vehicle_id FROM bookings WHERE trip_type=$${idx++} AND status='requested'
      )`;
      params.push(trip_type);
    }

    query += `
      GROUP BY 
        v.vehicle_id, 
        o.owner_id, 
        d.driver_id
      ORDER BY v.created_at DESC
    `;

    const result = await pool.query(query, params);
    res.json(result.rows);

  } catch (error) {
    res.status(500).json({ message: "Error searching vehicles", error: error.message });
  }
});


/* ======================================================
   Book a Vehicle
====================================================== */
router.post("/book", verifyToken, async (req, res) => {
  try {
    const customerId = req.user.id;
    const {
      vehicle_id,
      driver_id,
      owner_id,
      pickup_location,
      drop_location,
      pickup_time,
      drop_time,
      trip_type,
      price_estimate
    } = req.body;

    const result = await pool.query(
      `INSERT INTO bookings
      (customer_id, vehicle_id, driver_id, owner_id, pickup_location, drop_location, pickup_time, drop_time, trip_type, price_estimate, status, created_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'requested',NOW())
      RETURNING *`,
      [customerId, vehicle_id, driver_id, owner_id, pickup_location, drop_location, pickup_time, drop_time, trip_type, price_estimate]
    );

    res.status(201).json({ message: "Booking requested", booking: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Error creating booking", error: error.message });
  }
});

/* ======================================================
   View Customer Bookings
====================================================== */
router.get("/bookings", verifyToken, async (req, res) => {
  try {
    const customerId = req.user.id;
    const result = await pool.query(`
      SELECT b.*, v.model AS vehicle_model, v.vehicle_type, d.full_name AS driver_name, o.full_name AS owner_name
      FROM bookings b
      LEFT JOIN vehicles v ON b.vehicle_id = v.vehicle_id
      LEFT JOIN drivers d ON b.driver_id = d.driver_id
      LEFT JOIN owners o ON b.owner_id = o.owner_id
      WHERE b.customer_id=$1
      ORDER BY b.created_at DESC
    `, [customerId]);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching bookings", error: error.message });
  }
});

/* ======================================================
   Add Rating/Review
====================================================== */
router.post("/rating", verifyToken, async (req, res) => {
  try {
    const customerId = req.user.id;
    const { booking_id, driver_id, owner_id, vehicle_id, rating, review } = req.body;

    const result = await pool.query(
      `INSERT INTO ratings
      (booking_id, customer_id, driver_id, owner_id, vehicle_id, rating, review, created_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())
      RETURNING *`,
      [booking_id, customerId, driver_id, owner_id, vehicle_id, rating, review]
    );

    res.status(201).json({ message: "Rating submitted", rating: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Error submitting rating", error: error.message });
  }
});

/* ======================================================
   Make Payment
====================================================== */
router.post("/payment", verifyToken, async (req, res) => {
  try {
    const { booking_id, amount, payment_method, transaction_id } = req.body;

    const result = await pool.query(
      `INSERT INTO payments
      (booking_id, amount, payment_method, payment_status, transaction_id, created_at)
      VALUES ($1,$2,$3,'completed',$4,NOW())
      RETURNING *`,
      [booking_id, amount, payment_method, transaction_id]
    );

    res.status(201).json({ message: "Payment successful", payment: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: "Error processing payment", error: error.message });
  }
});

/* ======================================================
   Customer Dashboard
====================================================== */
router.get("/dashboard", verifyToken, async (req, res) => {
  try {
    const customerId = req.user.id;

    // Total bookings
    const totalBookingsRes = await pool.query(
      "SELECT COUNT(*) AS total_bookings FROM bookings WHERE customer_id=$1",
      [customerId]
    );

    // Completed bookings
    const completedBookingsRes = await pool.query(
      "SELECT COUNT(*) AS completed_bookings FROM bookings WHERE customer_id=$1 AND status='completed'",
      [customerId]
    );

    // Total amount paid
    const totalPaidRes = await pool.query(
      `SELECT COALESCE(SUM(amount),0) AS total_paid
       FROM payments p
       JOIN bookings b ON p.booking_id = b.booking_id
       WHERE b.customer_id=$1 AND p.payment_status='completed'`,
      [customerId]
    );

    // Upcoming bookings
    const upcomingRes = await pool.query(
      `SELECT b.*, v.model AS vehicle_model, v.vehicle_type, d.full_name AS driver_name, o.full_name AS owner_name
       FROM bookings b
       LEFT JOIN vehicles v ON b.vehicle_id = v.vehicle_id
       LEFT JOIN drivers d ON b.driver_id = d.driver_id
       LEFT JOIN owners o ON b.owner_id = o.owner_id
       WHERE b.customer_id=$1 AND b.status IN ('requested','approved','on_trip')
       ORDER BY b.pickup_time ASC`,
      [customerId]
    );

    res.json({
      total_bookings: totalBookingsRes.rows[0].total_bookings,
      completed_bookings: completedBookingsRes.rows[0].completed_bookings,
      total_paid: totalPaidRes.rows[0].total_paid,
      upcoming_bookings: upcomingRes.rows
    });
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
