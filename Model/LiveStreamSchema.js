const mongoose = require("mongoose");
const Schema = mongoose.Schema; // Import Schema from mongoose

const streamTypeEnum = ["live", "audio-live", "multi-live"];
const streamLevelEnum = ["public", "private", "level of subscription"];

const tagSchema = mongoose.Schema({
    tag: { type: String }
});

const StreamSchema = mongoose.Schema({
    hostId: { type: Schema.Types.ObjectId, ref: "users" },
    hostName: { type: String, required: true },
    title: { type: String, required: true },
    streamType: { type: String, required: true, enum: streamTypeEnum },
    streamLevel: { type: String, required: true, enum: streamLevelEnum },
    scheduleTime: { type: String },
    userId: [{ type: Schema.Types.ObjectId, ref: "users" }],
    tags: [{ type: String }],
    isdelete: { type: Boolean, default: false } // Adding default value false
});

module.exports = mongoose.model("livestreams", StreamSchema);
