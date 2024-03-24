const LiveStreamSchema = require("../Model/LiveStreamSchema");
const UserProfileSchema = require("../Model/UserProfileSchema");

exports.LiveStreamController = async (req, res) => {
    try {
        const { streamType } = req.body;

        // if (!req.headers.authorization) { // Corrected the header name to 'authorization'
        //     return res.status(400).json({
        //         token: "Token not provided"
        //     });
        // }
        if (!streamType) { // Corrected the condition for streamType
            return res.status(400).json({
                message: "hostName or streamType can't be null",
            });
        }
        const user = await UserProfileSchema.findOne({ authId: req.user._id })
        // console.log(user)
        if (user) {

            const data = await LiveStreamSchema.create({
                hostName: user.username,
                hostId: req.user._id,
                streamType: streamType
            });
            return res.status(200).json({
                data,
                status: true
            });
        }
    } catch (err) {
        return res.status(500).json({
            message: err.message,
            status: false,
        });
    }
};
