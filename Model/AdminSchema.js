const mongoose = require("mongoose");
// const Schema = mongoose.Schema; // Import Schema from mongoose

const adminSchema = new mongoose.Schema({
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
    role: {
        type: String
    }
})

module.exports = mongoose.model("admin", adminSchema);
