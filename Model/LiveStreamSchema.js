const mongoose = require("mongoose");
const Schema = mongoose.Schema; // Import Schema from mongoose

const typeEnum = ["stream", "audio-live", "multi-live", "filter", "stream level", "schedule time"];
// const typeEnum = ["Stream", "Audio-Live", "Multi-Live", "Filter", "Stream Level", "Schedule Time"];

const StreamSchema = mongoose.Schema({
    hostId: { type: Schema.Types.ObjectId, ref: "users" },
    hostName: { type: String, required: true },
    streamType: { type: String, required: true, enum: typeEnum },
});

module.exports = mongoose.model("livestreams", StreamSchema)