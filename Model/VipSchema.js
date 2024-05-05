const mongoose = require("mongoose");

const VipSchema = new mongoose.Schema({
    vipImg: {
        type:String,
        required: true
    },
    coinValue: {
        type: Number,
        required: true
    }
})

module.exports = mongoose.model("Vip", VipSchema);