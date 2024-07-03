const mongoose = require("mongoose");

const giveGuardian = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    recieverId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    guardianId: { type: mongoose.Schema.Types.ObjectId, ref: "guardians" },
    guardianType: { type: String },
    guardianDuration: { type: String },
}, { timestamps: true })

module.exports = mongoose.model("giveguardian", giveGuardian);