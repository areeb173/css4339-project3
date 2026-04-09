import express from "express";
import { getCurrentUser, login, logout } from "../controllers/authController.js";
import asyncHandler from "../lib/asyncHandler.js";

const router = express.Router();

router.get("/me", asyncHandler(getCurrentUser));
router.post("/login", asyncHandler(login));
router.post("/logout", logout);

export default router;
