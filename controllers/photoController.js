import mongoose from "mongoose";
import Photo from "../schema/photo.js";
import User from "../schema/user.js";
import { serializePhoto, serializeUserSummary } from "../lib/serializers.js";

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function getPhotosOfUser(req, res) {
  const userId = req.params.id;

  if (!isValidObjectId(userId)) {
    return res.status(400).send("Invalid user id");
  }

  const userExists = await User.findById(userId, "_id").lean();

  if (!userExists) {
    return res.status(404).send("User not found");
  }

  const [photos, users] = await Promise.all([
    Photo.find({ user_id: userId }).lean(),
    User.find({}, "_id first_name last_name").lean(),
  ]);

  const userLookup = new Map(
    users.map((user) => [String(user._id), serializeUserSummary(user)]),
  );

  return res.json(photos.map((photo) => serializePhoto(photo, userLookup)));
}

export async function addCommentToPhoto(req, res) {
  const photoId = req.params.photoId;
  const comment = typeof req.body?.comment === "string" ? req.body.comment.trim() : "";

  if (!req.session?.userId) {
    return res.status(401).send("Unauthorized");
  }

  if (!isValidObjectId(photoId)) {
    return res.status(400).send("Invalid photo id");
  }

  if (!comment) {
    return res.status(400).send("comment is required");
  }

  const photo = await Photo.findById(photoId);

  if (!photo) {
    return res.status(404).send("Photo not found");
  }

  photo.comments.push({
    comment,
    user_id: req.session.userId,
    date_time: new Date(),
  });

  await photo.save();

  return res.sendStatus(200);
}

export async function createPhoto(req, res) {
  const url = typeof req.body?.url === "string" ? req.body.url.trim() : "";

  if (!req.session?.userId) {
    return res.status(401).send("Unauthorized");
  }

  if (!url) {
    return res.status(400).send("url is required");
  }

  const photo = await Photo.create({
    file_name: url,
    user_id: req.session.userId,
    date_time: new Date(),
  });

  const user = await User.findById(req.session.userId, "_id first_name last_name").lean();
  const userLookup = new Map(
    user ? [[String(user._id), serializeUserSummary(user)]] : [],
  );

  return res.json(serializePhoto(photo.toObject(), userLookup));
}

export async function togglePhotoLike(req, res) {
  const { photoId } = req.params;
  const userId = req.session?.userId;

  if (!userId) {
    return res.status(401).send("Unauthorized");
  }

  if (!isValidObjectId(photoId)) {
    return res.status(404).send("Photo not found");
  }

  const hasLiked = await Photo.exists({ _id: photoId, likes: userId });
  const update = hasLiked ? { $pull: { likes: userId } } : { $addToSet: { likes: userId } };
  const updatedPhoto = await Photo.findByIdAndUpdate(photoId, update, { new: true }).lean();

  if (!updatedPhoto) {
    return res.status(404).send("Photo not found");
  }

  const users = await User.find({}, "_id first_name last_name").lean();
  const userLookup = new Map(
    users.map((user) => [String(user._id), serializeUserSummary(user)]),
  );

  return res.json(serializePhoto(updatedPhoto, userLookup));
}
