const mongoose = require("mongoose");

const subAdminActivity = new mongoose.Schema({
    subAdminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "admins",
        required: true
    },
    performedAction: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
}, { timestamps: true });

module.exports = mongoose.model("subadminAcitvity", subAdminActivity);