const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, "requests.json");

/* Initialize file */
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

/* Helper functions */
function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE));
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

/* POST: create request */
app.post("/api/request", (req, res) => {
  const { farmerName, service, priority, location } = req.body;

  if (!farmerName || !service || !priority || !location) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const data = readData();

  data.unshift({
    id: Date.now(),
    farmerName,
    service,
    priority,
    location,
    status: "Pending",
    createdAt: new Date().toLocaleString()
  });

  writeData(data);
  res.json({ message: "Request submitted successfully" });
});

/* GET: all requests */
app.get("/api/requests", (req, res) => {
  res.json(readData());
});

/* Health check */
app.get("/", (req, res) => {
  res.send("AgriTech Backend Running ✅");
});

/* Start server */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
