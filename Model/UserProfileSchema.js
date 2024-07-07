// models/item.js
const mongoose = require("mongoose");

const userprofileSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    required: true,
    enum: ["male", "female"],
  },
  profileImage: {
    type: String, // Assuming you will store a URL or file path for the image
    required: true,
  },
  favBroadcaster: {
    type: String,
    required: true,
  },
  bio: {
    type: String,
    required: false,
  },
  diamonds: {
    type: Number,
    required: true,
    default: 0,
  },
  authId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "userprofiles" }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "userprofiles" }],
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "userprofiles" }],
  visitors: [{ type: mongoose.Schema.Types.ObjectId, ref: "userprofiles" }],

  isBlocked: {
    type: Boolean,
    default: false
  },
  isBan: {
    type: Boolean,
    default: false
  },

  banDuration: {
    type: String,
    required: false,
    enum: ["7 days", "14 days", "1 month", "permanent"],
  },
  language: {
    type: String
  },
  descSelf: {
    type: String
  }





}, { timestamps: true });

module.exports = mongoose.model("userprofiles", userprofileSchema);
