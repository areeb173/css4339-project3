import express from "express";
import {
  addCommentToPhoto,
  createPhoto,
  getPhotosOfUser,
  togglePhotoLike,
} from "../controllers/photoController.js";
import asyncHandler from "../lib/asyncHandler.js";
import requireLogin from "../middleware/requireLogin.js";

const router = express.Router();

router.get("/photosOfUser/:id", requireLogin, asyncHandler(getPhotosOfUser));
router.post("/photos", requireLogin, asyncHandler(createPhoto));
router.post("/photos/:photoId/like", requireLogin, asyncHandler(togglePhotoLike));
router.post("/commentsOfPhoto/:photoId", requireLogin, asyncHandler(addCommentToPhoto));

export default router;
