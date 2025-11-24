// adminRouter.js
import express from "express";
import jwt from "jsonwebtoken";
import pool from "../utils/db.js";
import verifyToken from "../middleware/auth.js";

const router = express.Router();

/* ======================================================
   Admin Login
====================================================== */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query("SELECT * FROM admins WHERE email=$1", [email]);

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Admin not found" });

    const admin = result.rows[0];

    // Plain text password check
    if (password !== admin.password)
      return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign(
  { id: admin.admin_id, role: "admin" },
  process.env.JWT_SECRET, // <-- now it's loaded
  { expiresIn: "7d" }
);


    res.status(200).json({ message: "Login successful", token, admin });
  } catch (error) {
  console.error(error); // <-- logs full error in server terminal
  res.status(500).json({ message: "Server Error", error: error.message });
}

});

// ===== Admin Dashboard Stats + Analytics =====
router.get('/dashboard', verifyToken, async (req, res) => {
  try {
    const dashboardData = {};

    // Total counts
    const totalCustomers = await pool.query("SELECT COUNT(*) AS total_customers FROM customers");
    const totalDrivers = await pool.query("SELECT COUNT(*) AS total_drivers FROM drivers");
    const totalOwners = await pool.query("SELECT COUNT(*) AS total_owners FROM owners");
    const totalBookings = await pool.query("SELECT COUNT(*) AS total_bookings FROM bookings");
    const totalRevenue = await pool.query("SELECT SUM(amount) AS total_revenue FROM payments WHERE payment_status='completed'");

    dashboardData.total_customers = parseInt(totalCustomers.rows[0].total_customers);
    dashboardData.total_drivers = parseInt(totalDrivers.rows[0].total_drivers);
    dashboardData.total_owners = parseInt(totalOwners.rows[0].total_owners);
    dashboardData.total_bookings = parseInt(totalBookings.rows[0].total_bookings);
    dashboardData.total_revenue = parseFloat(totalRevenue.rows[0].total_revenue) || 0;

    // Bookings by day (last 7 days)
    const bookingsByDay = await pool.query(`
      SELECT DATE(pickup_time) AS day, COUNT(*) AS bookings
      FROM bookings
      WHERE pickup_time >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE(pickup_time)
      ORDER BY DATE(pickup_time) ASC
    `);
    dashboardData.bookings_by_day = bookingsByDay.rows;

    // Bookings by month (last 12 months)
    const bookingsByMonth = await pool.query(`
      SELECT DATE_TRUNC('month', pickup_time) AS month, COUNT(*) AS bookings, 
             SUM(actual_price) AS revenue
      FROM bookings
      WHERE pickup_time >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', pickup_time)
      ORDER BY DATE_TRUNC('month', pickup_time) ASC
    `);
    dashboardData.bookings_by_month = bookingsByMonth.rows;

    // Bookings by year
    const bookingsByYear = await pool.query(`
      SELECT DATE_TRUNC('year', pickup_time) AS year, COUNT(*) AS bookings, 
             SUM(actual_price) AS revenue
      FROM bookings
      GROUP BY DATE_TRUNC('year', pickup_time)
      ORDER BY DATE_TRUNC('year', pickup_time) ASC
    `);
    dashboardData.bookings_by_year = bookingsByYear.rows;

    // Bookings by vehicle type
    const bookingsByVehicleType = await pool.query(`
      SELECT v.vehicle_type, COUNT(b.booking_id) AS bookings, SUM(b.actual_price) AS revenue
      FROM bookings b
      JOIN vehicles v ON b.vehicle_id = v.vehicle_id
      GROUP BY v.vehicle_type
      ORDER BY bookings DESC
    `);
    dashboardData.bookings_by_vehicle_type = bookingsByVehicleType.rows;

    // Bookings by pickup location
    const bookingsByLocation = await pool.query(`
      SELECT pickup_location, COUNT(*) AS bookings, SUM(actual_price) AS revenue
      FROM bookings
      GROUP BY pickup_location
      ORDER BY bookings DESC
    `);
    dashboardData.bookings_by_location = bookingsByLocation.rows;

    // Top 5 drivers by completed bookings
    const topDrivers = await pool.query(`
      SELECT d.driver_id, d.full_name, COUNT(b.booking_id) AS total_bookings,
             AVG(r.rating) AS avg_rating
      FROM drivers d
      LEFT JOIN bookings b ON d.driver_id = b.driver_id AND b.status='completed'
      LEFT JOIN ratings r ON d.driver_id = r.driver_id
      GROUP BY d.driver_id
      ORDER BY total_bookings DESC
      LIMIT 5
    `);
    dashboardData.top_drivers = topDrivers.rows;

    // Top 5 vehicles by completed bookings
    const topVehicles = await pool.query(`
      SELECT v.vehicle_id, v.model, v.vehicle_type, COUNT(b.booking_id) AS total_bookings,
             AVG(r.rating) AS avg_rating
      FROM vehicles v
      LEFT JOIN bookings b ON v.vehicle_id = b.vehicle_id AND b.status='completed'
      LEFT JOIN ratings r ON v.vehicle_id = r.vehicle_id
      GROUP BY v.vehicle_id
      ORDER BY total_bookings DESC
      LIMIT 5
    `);
    dashboardData.top_vehicles = topVehicles.rows;

    return res.json({ Status: true, Dashboard: dashboardData });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ Status: false, Error: error.message });
  }
});

/* ======================================================
   Manage Customers
====================================================== */
router.get("/customers", verifyToken, async (req, res) => {
  const result = await pool.query("SELECT * FROM customers ORDER BY created_at DESC");
  res.json(result.rows);
});

router.delete("/customers/:id", verifyToken, async (req, res) => {
  try {
    await pool.query("DELETE FROM customers WHERE customer_id=$1", [req.params.id]);
    res.json({ message: "Customer deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting customer", error });
  }
});

/* ======================================================
   Manage Drivers
====================================================== */
router.get("/drivers", verifyToken, async (req, res) => {
  const result = await pool.query("SELECT * FROM drivers ORDER BY created_at DESC");
  res.json(result.rows);
});

router.delete("/drivers/:id", verifyToken, async (req, res) => {
  try {
    await pool.query("DELETE FROM drivers WHERE driver_id=$1", [req.params.id]);
    res.json({ message: "Driver deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting driver", error });
  }
});

/* ======================================================
   Manage Owners
====================================================== */
router.get("/owners", verifyToken, async (req, res) => {
  const result = await pool.query("SELECT * FROM owners ORDER BY created_at DESC");
  res.json(result.rows);
});

router.delete("/owners/:id", verifyToken, async (req, res) => {
  try {
    await pool.query("DELETE FROM owners WHERE owner_id=$1", [req.params.id]);
    res.json({ message: "Owner deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting owner", error });
  }
});

/* ======================================================
   Manage Vehicles
====================================================== */
router.get("/vehicles", verifyToken, async (req, res) => {
  const result = await pool.query(`
    SELECT v.*, o.full_name AS owner_name, d.full_name AS driver_name
    FROM vehicles v
    LEFT JOIN owners o ON v.owner_id = o.owner_id
    LEFT JOIN drivers d ON v.driver_id = d.driver_id
    ORDER BY v.created_at DESC
  `);
  res.json(result.rows);
});

router.delete("/vehicles/:id", verifyToken, async (req, res) => {
  try {
    await pool.query("DELETE FROM vehicles WHERE vehicle_id=$1", [req.params.id]);
    res.json({ message: "Vehicle deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting vehicle", error });
  }
});

/* ======================================================
   Payments Overview
====================================================== */
router.get("/payments", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, c.full_name AS customer_name, b.booking_id
      FROM payments p
      LEFT JOIN bookings b ON p.booking_id = b.booking_id
      LEFT JOIN customers c ON b.customer_id = c.customer_id
      ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching payments", error });
  }
});

/* ======================================================
   Ratings Overview
====================================================== */
router.get("/ratings", verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, c.full_name AS customer_name,
             d.full_name AS driver_name,
             o.full_name AS owner_name,
             v.model AS vehicle_model
      FROM ratings r
      LEFT JOIN customers c ON r.customer_id = c.customer_id
      LEFT JOIN drivers d ON r.driver_id = d.driver_id
      LEFT JOIN owners o ON r.owner_id = o.owner_id
      LEFT JOIN vehicles v ON r.vehicle_id = v.vehicle_id
      ORDER BY r.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching ratings", error });
  }
});

/* ======================================================
   Admin Logout
====================================================== */
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
