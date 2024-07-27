const { default: mongoose, Schema } = require("mongoose");

const agencySchema = new mongoose.Schema({
    idCard: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    logo: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    passport: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
})

module.exports = mongoose.model("agency", agencySchema)