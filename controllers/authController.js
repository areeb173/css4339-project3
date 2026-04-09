// eslint-disable-next-line import/no-extraneous-dependencies
import bcrypt from "bcrypt";
import User from "../schema/user.js";
import { serializeSessionUser } from "../lib/serializers.js";

function trimValue(value) {
  return typeof value === "string" ? value.trim() : "";
}

export async function getCurrentUser(req, res) {
  if (!req.session?.userId) {
    return res.json(null);
  }

  const user = await User.findById(req.session.userId).lean();

  if (!user) {
    req.session.destroy(() => {});
    return res.json(null);
  }

  return res.json(serializeSessionUser(user));
}

export async function login(req, res) {
  const login_name = trimValue(req.body?.login_name);
  const password = req.body?.password || "";

  if (!login_name || !password) {
    return res.status(400).send("login_name and password are required");
  }

  const user = await User.findOne({ login_name }).lean();

  if (!user) {
    return res.status(400).send("Invalid login credentials");
  }

  const passwordMatches = await bcrypt.compare(password, user.password_digest);

  if (!passwordMatches) {
    return res.status(400).send("Invalid login credentials");
  }

  req.session.userId = String(user._id);

  return res.json(serializeSessionUser(user));
}

export function logout(req, res) {
  if (!req.session?.userId) {
    return res.status(400).send("No user is currently logged in");
  }

  return req.session.destroy((error) => {
    if (error) {
      return res.status(500).send("Unable to log out");
    }

    res.clearCookie("connect.sid");
    return res.sendStatus(200);
  });
}
