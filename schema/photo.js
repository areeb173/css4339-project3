// eslint-disable-next-line import/no-extraneous-dependencies
import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  comment: {
    type: String,
    required: true,
    trim: true,
  },
  date_time: {
    type: Date,
    default: Date.now,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
});

const photoSchema = new mongoose.Schema({
  file_name: {
    type: String,
    required: true,
  },
  date_time: {
    type: Date,
    default: Date.now,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  comments: {
    type: [commentSchema],
    default: [],
  },
});

const Photo = mongoose.models.Photo || mongoose.model("Photo", photoSchema);

export default Photo;
