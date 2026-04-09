import express from "express";
import { addCommentToPhoto, getPhotosOfUser } from "../controllers/photoController.js";
import asyncHandler from "../lib/asyncHandler.js";
import requireLogin from "../middleware/requireLogin.js";

const router = express.Router();

router.get("/photosOfUser/:id", requireLogin, asyncHandler(getPhotosOfUser));
router.post("/commentsOfPhoto/:photoId", requireLogin, asyncHandler(addCommentToPhoto));

export default router;
