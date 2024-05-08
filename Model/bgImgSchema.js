const mongoose = require("mongoose");

const bgImgSchema = new mongoose.Schema({
    bgImg: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model("backgroundImg", bgImgSchema);