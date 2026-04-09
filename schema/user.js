// eslint-disable-next-line import/no-extraneous-dependencies
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
    trim: true,
  },
  last_name: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    type: String,
    default: "",
    trim: true,
  },
  description: {
    type: String,
    default: "",
    trim: true,
  },
  occupation: {
    type: String,
    default: "",
    trim: true,
  },
  login_name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password_digest: {
    type: String,
    required: true,
  },
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
