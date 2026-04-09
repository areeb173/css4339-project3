// eslint-disable-next-line import/no-extraneous-dependencies
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import User from "../schema/user.js";
import { serializeSessionUser, serializeUserDetail, serializeUserSummary } from "../lib/serializers.js";

function trimValue(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function getUserList(req, res) {
  const users = await User.find({}, "_id first_name last_name").lean();
  return res.json(users.map(serializeUserSummary));
}

export async function getUserDetail(req, res) {
  const userId = req.params.id;

  if (!isValidObjectId(userId)) {
    return res.status(400).send("Invalid user id");
  }

  const user = await User.findById(
    userId,
    "_id first_name last_name location description occupation login_name",
  ).lean();

  if (!user) {
    return res.status(404).send("User not found");
  }

  return res.json(serializeUserDetail(user));
}

export async function registerUser(req, res) {
  const login_name = trimValue(req.body?.login_name);
  const password = req.body?.password || "";
  const first_name = trimValue(req.body?.first_name);
  const last_name = trimValue(req.body?.last_name);
  const location = trimValue(req.body?.location);
  const description = trimValue(req.body?.description);
  const occupation = trimValue(req.body?.occupation);

  if (!login_name) {
    return res.status(400).send("login_name is required");
  }

  if (!password) {
    return res.status(400).send("password is required");
  }

  if (!first_name) {
    return res.status(400).send("first_name is required");
  }

  if (!last_name) {
    return res.status(400).send("last_name is required");
  }

  const existingUser = await User.findOne({ login_name }).lean();

  if (existingUser) {
    return res.status(400).send("login_name already exists");
  }

  const password_digest = await bcrypt.hash(password, 10);

  const user = await User.create({
    login_name,
    password_digest,
    first_name,
    last_name,
    location,
    description,
    occupation,
  });

  return res.json(serializeSessionUser(user));
}
