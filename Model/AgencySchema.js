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
    agencyImg: {
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
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    joinedUsers: [{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }],
    photoId: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model("agency", agencySchema)