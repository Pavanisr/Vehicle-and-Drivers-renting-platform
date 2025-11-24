// middleware/auth.js
import jwt from "jsonwebtoken";

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  try {
    // Get token from headers (Authorization: Bearer <token>)
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1]; // Bearer <token>
    if (!token) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    // Verify token
    jwt.verify(token, process.env.JWT_SECRET || "secretkey", (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Failed to authenticate token" });
      }

      // Save decoded info to request for use in routes
      req.user = {
        id: decoded.id,
        role: decoded.role,
      };
      next();
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error in token verification", error: error.message });
  }
};

export default verifyToken;
