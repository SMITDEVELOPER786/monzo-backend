const mongoose = require("mongoose");

const vipImgSchema = mongoose.Schema({
    vipImg: {
        type: String,
        required: true
    },
    vipImgLabel: {
        type: String,
        required: true
    }
})

const VipSchema = new mongoose.Schema({
    vipImgs: [vipImgSchema],
    coinValue: {
        type: String,
        required: true
    },
    vipCategory: {
        type: String,
    }
})

module.exports = mongoose.model("Vip", VipSchema);