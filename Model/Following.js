const mongoose = require("mongoose");

const followingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    following: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

}, {
  timestamps: true,
});

const Followings = mongoose.model("followings", followingSchema);
module.exports = Followings;