const mongoose = require("mongoose");
const Schema = mongoose.Schema; // Import Schema from mongoose

const reelSchema = new Schema({
    like: [{ type: Schema.Types.ObjectId, ref: "users" }],
    comment: [{ type: Schema.Types.ObjectId, ref: "users" }],
    share: [{ type: Schema.Types.ObjectId, ref: "users" }],
    video: { type: String },
    title: { type: String },
    owner: { type: Schema.Types.ObjectId, ref: "users" } // Corrected 'onwer' to 'owner'
}, { timestamps: true });

module.exports = mongoose.model("reels", reelSchema);
