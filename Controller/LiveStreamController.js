const LiveStreamSchema = require("../Model/LiveStreamSchema");
const UserProfileSchema = require("../Model/UserProfileSchema");

exports.LiveStreamController = async (req, res) => {
    try {
        const { streamType, title, scheduleTime, streamLevel, tags } = req.body;

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