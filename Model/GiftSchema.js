const mongoose = require("mongoose");

const GiftSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId, ref: "users",
        required: true
    },
    recieverId: {
        type: mongoose.Schema.Types.ObjectId, ref: "users",
        required: true
    },
    giftImg: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model("gift", GiftSchema);