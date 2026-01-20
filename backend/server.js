const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors({
  origin: [
    "https://agritech-service-portal.vercel.app"
  ],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

// 🔥 IMPORTANT FIX
app.options("*", cors());

app.use(express.json());

const DATA_FILE = path.join(__dirname, "requests.json");

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

function readData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch {
    return [];
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

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
    createdAt: new Date().toISOString()
  });

  writeData(data);
  res.json({ message: "Request submitted successfully" });
});

app.get("/api/requests", (req, res) => {
  res.json(readData());
});

app.get("/", (req, res) => {
  res.send("AgriTech Backend Running ✅");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
