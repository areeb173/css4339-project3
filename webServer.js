import crypto from "crypto";
// eslint-disable-next-line import/no-unresolved
import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
// eslint-disable-next-line import/no-extraneous-dependencies
import session from "express-session";

import adminRoutes from "./routes/adminRoutes.js";
import photoRoutes from "./routes/photoRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();

const port = process.env.PORT || 3001;
const mongoUrl = process.env.MONGODB_URI || process.env.MONGO_URL || "mongodb://127.0.0.1/project4";
const sessionSecret = process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex");
const isProduction = process.env.NODE_ENV === "production";

if (isProduction) {
  app.set("trust proxy", 1);
}

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());
app.use(session({
  name: "connect.sid",
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
  },
}));

mongoose.set("strictQuery", false);
mongoose.connect(mongoUrl, {
  serverSelectionTimeoutMS: 10000,
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
  process.exit(1);
});

app.use("/admin", adminRoutes);
app.use("/user", userRoutes);
app.use("/", photoRoutes);

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err?.name === "ValidationError") {
    return res.status(400).send(err.message);
  }

  if (err?.code === 11000) {
    return res.status(400).send("login_name already exists");
  }

  console.error(err);
  return res.status(500).send("Internal server error");
});

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});
