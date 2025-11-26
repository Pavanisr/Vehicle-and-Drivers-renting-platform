// server.js
import express from "express";
import http from "http";
import { Server } from "socket.io";
import pool from "./utils/db.js"; 
import adminRoutes from "./routes/adminRouter.js";
import customerRoutes from "./routes/customerRoutes.js";
import driverRoutes from "./routes/driverRoutes.js";
import ownerRoutes from "./routes/ownerRoutes.js";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const server = http.createServer(app);

// -----------------------------------
// ✅ FIXED CORS (for API + WebSocket)
// -----------------------------------
const allowedOrigins = ["http://localhost:3001"];

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Authorization", "Content-Type"],
  credentials: true,
}));

// -----------------------------------
// ✅ SOCKET.IO FIXED CONFIGURATION
// -----------------------------------
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("🔥 WebSocket Connected:", socket.id);

  // Join private room for customer
  socket.on("joinRoom", (customerId) => {
    console.log(`📌 Customer joined room: ${customerId}`);
    socket.join(customerId);
  });

  socket.on("disconnect", () => {
    console.log("❌ WebSocket disconnected:", socket.id);
  });
});

// Allow other files to emit events
export { io };

// -----------------------------------
// Middleware
// -----------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -----------------------------------
// Routes
// -----------------------------------
app.use("/api/admin", adminRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/owners", ownerRoutes);

// -----------------------------------
// Test Route
// -----------------------------------
app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.send(`Server running. DB time: ${result.rows[0].now}`);
  } catch (error) {
    res.status(500).send("Database connection failed: " + error.message);
  }
});

// -----------------------------------
// Start Server
// -----------------------------------
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
