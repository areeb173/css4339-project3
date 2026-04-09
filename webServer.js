import crypto from "crypto";
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
const mongoUrl = process.env.MONGO_URL || "mongodb://127.0.0.1/project3";
const sessionSecret = process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex");

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
    sameSite: "lax",
    secure: false,
  },
}));

mongoose.connect(mongoUrl);

mongoose.connection.on("error", console.error.bind(console, "MongoDB connection error:"));

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
