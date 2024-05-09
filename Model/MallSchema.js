const { default: mongoose } = require("mongoose");

const MallSchema = new mongoose.Schema({
    itemCategory: {
        type: String,
        required: true
    },
    mallName: {
        type: String,
        required: true
    },
    mallCoin: {
        type: Number,
        required: true
    },
    // mallImg: {
    //     type: String,
    //     required: true
    // },



})

module.exports = mongoose.model("malls", MallSchema)