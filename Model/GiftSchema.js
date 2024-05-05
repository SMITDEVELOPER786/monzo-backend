const mongoose = require("mongoose");

const GiftSchema = new mongoose.Schema({
    senderId: {
        type: Schema.Types.ObjectId, ref: "users",
        required: true
    },
    recieverId: {
        type: Schema.Types.ObjectId, ref: "users",
        required: true
    },
    giftImg: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model("gift", GiftSchema);