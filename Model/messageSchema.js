const mongoose = require("mongoose");
const Schema = mongoose.Schema; // Add this line to import Schema

const messageSchema = new mongoose.Schema({
    name: { type: String },
    message: { type: String },
    userId: { type: Schema.ObjectId },
    // catererId: { type: Schema.ObjectId, ref: "caterers" },
    // adminId: { type: Schema.ObjectId, ref: "admins" },
    type: { type: String },
    roomId: { type: Schema.ObjectId },
    fromAdmin: { type: Boolean }
})

module.exports = mongoose.model("message", messageSchema)