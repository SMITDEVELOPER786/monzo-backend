const mongoose = require("mongoose");

const VipSchema = new mongoose.Schema({
    vipImgs: [{
        type: String,
        required: true
    }],
    coinValue: {
        type: String,
        required: true
    },
    vipCategory: {
        type: String,
    }
})

module.exports = mongoose.model("Vip", VipSchema);