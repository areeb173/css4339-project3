import express from "express";
import { getUserDetail, getUserList, registerUser } from "../controllers/userController.js";
import asyncHandler from "../lib/asyncHandler.js";
import requireLogin from "../middleware/requireLogin.js";

const router = express.Router();

router.post("/", asyncHandler(registerUser));
router.get("/list", requireLogin, asyncHandler(getUserList));
router.get("/:id", requireLogin, asyncHandler(getUserDetail));

export default router;
