const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("requests.db");

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

app.post("/api/request", (req, res) => {
  const { farmerName, service, priority, location } = req.body;

  const status = "Pending";
  const createdAt = new Date().toLocaleString();

  db.run(
    `INSERT INTO requests 
    (farmerName, service, priority, location, status, createdAt) 
    VALUES (?, ?, ?, ?, ?, ?)`,
    [farmerName, service, priority, location, status, createdAt],
    () => res.json({ message: "Request submitted successfully" })
  );
});

app.get("/api/requests", (req, res) => {
  db.all("SELECT * FROM requests ORDER BY id DESC", (err, rows) => {
    res.json(rows);
  });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
