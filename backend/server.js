const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./requests.db", (err) => {
  if (err) {
    console.error("DB error:", err.message);
  } else {
    console.log("SQLite connected");
  }
});

db.run(`
  CREATE TABLE IF NOT EXISTS requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    farmerName TEXT,
    service TEXT,
    priority TEXT,
    location TEXT,
    status TEXT,
    createdAt TEXT
  )
`);

app.post("/api/requests", (req, res) => {
  const { farmerName, service, priority, location } = req.body;

  if (!farmerName || !service || !priority || !location) {
    return res.status(400).json({ error: "Missing fields" });
  }

  db.run(
    `INSERT INTO requests VALUES (NULL, ?, ?, ?, ?, ?, ?)`,
    [
      farmerName,
      service,
      priority,
      location,
      "Pending",
      new Date().toISOString()
    ],
    function (err) {
      if (err) return res.status(500).json(err);
      res.json({ success: true, id: this.lastID });
    }
  );
});

app.get("/api/requests", (req, res) => {
  db.all("SELECT * FROM requests ORDER BY id DESC", (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on", PORT));
