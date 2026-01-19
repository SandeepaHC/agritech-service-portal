const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database (SQLite)
const db = new sqlite3.Database("./requests.db", (err) => {
  if (err) {
    console.error("Database connection error:", err.message);
  } else {
    console.log("Connected to SQLite database");
  }
});

// Create table if not exists
db.run(`
  CREATE TABLE IF NOT EXISTS requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    farmerName TEXT NOT NULL,
    service TEXT NOT NULL,
    priority TEXT NOT NULL,
    location TEXT NOT NULL,
    status TEXT NOT NULL,
    createdAt TEXT NOT NULL
  )
`);

// ---------------- API ROUTES ----------------

// Create a service request
app.post("/api/requests", (req, res) => {
  const { farmerName, service, priority, location } = req.body;

  if (!farmerName || !service || !priority || !location) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const status = "Pending";
  const createdAt = new Date().toISOString();

  db.run(
    `INSERT INTO requests 
     (farmerName, service, priority, location, status, createdAt) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [farmerName, service, priority, location, status, createdAt],
    function (err) {
      if (err) {
        console.error("Insert error:", err.message);
        return res.status(500).json({ error: "Database error" });
      }
      res.json({
        message: "Request submitted successfully",
        id: this.lastID
      });
    }
  );
});

// Get all requests
app.get("/api/requests", (req, res) => {
  db.all("SELECT * FROM requests ORDER BY id DESC", (err, rows) => {
    if (err) {
      console.error("Fetch error:", err.message);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(rows);
  });
});

// ---------------- SERVER ----------------

// REQUIRED for Railway
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
