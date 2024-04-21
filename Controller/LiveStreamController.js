const LiveStreamSchema = require("../Model/LiveStreamSchema");
const UserProfileSchema = require("../Model/UserProfileSchema");

exports.CreateLiveStreamController = async (req, res) => {
    try {
        const { streamType, title, scheduleTime, streamLevel, tags, streamPass } = req.body;

        // Input Validation
        if (!streamType) {
            return res.status(400).json({
                message: "Stream type is required",
            });
        }

        if (!title) {
            return res.status(400).json({
                message: "Title is required",
            });
        }

        // Validate scheduleTime format if required (implement based on your needs)
        // if (scheduleTime) {
        //     // Add your scheduleTime validation logic here (e.g., using a library or custom function)
        //     // Example (replace with actual validation):
        //     if (!isValidScheduleTime(scheduleTime)) {
        //         return res.status(400).json({
        //             message: "Invalid scheduleTime format. Please check the documentation.",
        //         });
        //     }
        // }

        if (!streamLevel) {
            return res.status(400).json({
                message: "Stream Level is required",
            });
        }

        // (Optional) Validate tags format or length if needed

        const user = await UserProfileSchema.findOne({ authId: req.user._id });

        if (!user) {
            return res.status(401).json({
                message: "Unauthorized access. Please check your credentials.",
            });
        }

        if (streamLevel.toLowerCase() === "private" && !streamPass) {
            return res.status(400).json({
                message: "Stream password is required for private streams.",
                status: false
            });
        }

        // Create Live Stream Data
        const liveStreamData = {
            hostName: user.username,
            hostId: req.user._id,
            streamType,
            title,
            scheduleTime,
            // ...(scheduleTime ? { scheduleTime }) : { }, // Include scheduleTime if provided
            streamLevel,
            tags, // Include tags if provided
        };

        // Include streamPass if streamLevel is private
        if (streamLevel.toLowerCase() === "private") {
            liveStreamData.streamPass = streamPass;
        }

        const newLiveStream = await LiveStreamSchema.create(liveStreamData);

        return res.status(200).json({
            data: newLiveStream,
            status: true,
        });
    } catch (err) {
        console.error(err); // Log the error for debugging
        return res.status(500).json({
            message: err.message,
        });
    }
};

exports.getAllLiveStreams = async (req, res) => {
    try {
        const data = await LiveStreamSchema.find({ isdelete: false });
        return res.status(200).json({
            data: data,
            status: true
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message,
            status: false
        })
    }
}

exports.joinLiveStream = async (req, res) => {
    try {
        const { streamId, streamPass } = req.body;
        if (!streamId) {
            return res.status(404).json({
                message: "streamId is required"
            })
        }
        if (!req.user._id) {
            return res.status(404).json({
                message: "userId is required"
            })
        }
        const findStream = await LiveStreamSchema.findOne({ _id: streamId, isdelete: false });

        if (!findStream) {
            return res.status(404).json({ message: "Stream not found." });
        }

        if (findStream.streamLevel === "private") {
            if (!streamPass) {
                return res.status(404).json({
                    message: "give password this is private stream"
                })
            }
            if (streamPass !== findStream.streamPass)
                return res.status(200).json({
                    data: "password are not same"
                })
        }

        if (findStream.userId.includes(req.user._id))
            return res.status(404).json({ message: "stream already joined" })
        findStream.userId.push(req.user._id);
        await findStream.save()
        return res.status(200).json({
            message: "stream joined Successfully...!",
            data: findStream
        })

    } catch (err) {
        return res.status(500).json({
            message: err.message,
            status: false
        })
    }
}


exports.EndLiveStream = async (req, res) => {
    try {
        const { streamId } = req.body;
        if (!streamId) {
            return res.status(400).json({
                message: "streamId is not provided"
            })
        }
        const foundStream = await LiveStreamSchema.findOne({ _id: streamId, isdelete: false });
        if (!foundStream) {
            return res.status(400).json({ message: "Stream already ended" });
        }

        foundStream.isdelete = true; // Set the isdelete flag to true
        await foundStream.save(); // Save the updated document

        return res.status(400).json({
            message: "Stream ended successfully"
        })

    } catch (err) {
        return res.status(500).json({
            message: err.message,
            status: false
        })
    }
}