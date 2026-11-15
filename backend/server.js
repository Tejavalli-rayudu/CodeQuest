const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const gameRoutes = require("./routes/gameRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Home route
app.get("/", (req, res) => {
  res.send("Welcome to CodeQuest Backend!");
});

// Database test
app.get("/api/test-db", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT DATABASE() AS database_name"
    );

    res.json({
      success: true,
      message: "MySQL connected successfully!",
      database: rows[0].database_name
    });
  } catch (error) {
    console.error("Database error:", error.message);

    res.status(500).json({
      success: false,
      message: "Database connection failed"
    });
  }
});

// Authentication routes
app.use("/api/auth", authRoutes);

// Game routes
app.use("/api/games", gameRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`CodeQuest server running on port ${PORT}`);
});