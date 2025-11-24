// server.js
import express from "express";
import pool from "./utils/db.js"; // PostgreSQL connection
import adminRoutes from "./routes/adminRouter.js";
import customerRoutes from "./routes/customerRoutes.js";
import driverRoutes from "./routes/driverRoutes.js";
import ownerRoutes from "./routes/ownerRoutes.js";
import dotenv from "dotenv";
import cors from "cors"; // <-- import cors

dotenv.config();

const app = express();

// ===== Middleware =====
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== CORS setup =====
app.use(cors({
  origin: "http://localhost:3001", // your frontend URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

// ===== Routes =====
app.use("/api/admin", adminRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/owners", ownerRoutes);

// ===== Root route =====
app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.send(`Hello Node.js! Server is running and DB connected at ${result.rows[0].now}`);
  } catch (error) {
    res.status(500).send("Server running but DB connection failed: " + error.message);
  }
});

// ===== Start server =====
const PORT = 3000; // backend port
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
