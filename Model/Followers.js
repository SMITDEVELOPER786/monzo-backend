const mongoose = require("mongoose");

const followerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    follower: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true,
});

const Followers = mongoose.model("followers", followerSchema);
module.exports = Followers;