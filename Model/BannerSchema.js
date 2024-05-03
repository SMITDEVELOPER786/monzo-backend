const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
    bannerImg: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ["home", "reseller", "event"]
    },
    bannerTitle: {
        type: String,
    },
    userID :{
        type: mongoose.Schema.Types.ObjectId, ref: "admins"
    }
})

module.exports = mongoose.model("banner", bannerSchema)