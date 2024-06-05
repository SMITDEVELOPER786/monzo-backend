const mongoose = require("mongoose");
// const Schema = mongoose.Schema; // Import Schema from mongoose
const countries = [
  "pakistan",
  "bangladesh",
  "india",
  "vietnam",
  "united kingdom",
  "united states of america",
  "united arab emirates",
  "saudi arabia",
  "philippines",
  "oman",
  "brazil",
  "portugal",
  "france",
  "kuwait",
  "qatar"
];


const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  otp: {
    type: Number,
    required: true,
  },

  isVerify: {
    type: Boolean,
    default: false,
  },
  isBan: {
    type: Boolean,
    default: false,
  },
  isLevel: {
    type: Number,
    default: 0,
  },
  isCompleteProfile: {
    type: Boolean,
    default: false,
  },
  ProfileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "userprofiles",
  },
  Id: {
    type: String,
  },
  country: {
    type: String,
    enum: countries
  },
  tag: {
    type: String
  },
  isReseller: {
    type: Boolean, default: false,
  }
  
})

module.exports = mongoose.model("users", userSchema);
