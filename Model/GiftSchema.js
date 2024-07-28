const mongoose = require("mongoose");

const GiftSchema = new mongoose.Schema({
    senderId: [{
        type: mongoose.Schema.Types.ObjectId, ref: "users",
    }],
    recieverId: [{
        type: mongoose.Schema.Types.ObjectId, ref: "users",
    }],
    giftImg: {
        type: String,
        required: false
    },
    giftCategory: {
        type: String,
        required: false
    },
    giftValue: {
        type: Number,
        required: false
    },
    giftName: {
        type: String,
        required: false
    }
})

module.exports = mongoose.model("gift", GiftSchema);