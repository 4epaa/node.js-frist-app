const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");
const bookRoutes = require("./routes/book.routes");
const authorRoutes = require("./routes/author.routes");

const app = express();

app.use(morgan("common"));
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const DATABASE_URL = process.env.DATABASE_URL;
if (DATABASE_URL) {
  mongoose.connect(DATABASE_URL)
    .then(() => console.log("Database connected successfully"))
    .catch((err) => console.error("Database connection failed", err));
}

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/authors", authorRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use((err, req, res, next) => {
  const isProduction = process.env.NODE_ENV === "production";
  res.status(500).json({
    success: false,
    message: isProduction ? "Internal Server Error" : err.message
  });
});

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;