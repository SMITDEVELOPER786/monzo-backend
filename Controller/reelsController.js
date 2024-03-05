const reelsSchema = require('../Model/reelsSchema');

const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.uploadReel = async (req, res) => {
    try {
        // console.log(req.file)
        if (req.file == undefined) {
            res.status(404).json({ message: "Reel is Required" });
            // console.log(req.user._id)
        }
        else {
            if (!req.file) {
                return apiResponse.ErrorResponse(res, "Reel format not supported");
            } else {
                let check = await reelsSchema.find({ title: { '$regex': '^' + req.body.title + '$', "$options": "i" }, owner: req.body.id }).lean().exec();
                if (check && check.length > 0) {
                    return res.status(404).json({ status: false, message: "Reel Already Exists" });
                }
                const base64String = req.file.buffer.toString('base64');
                const contentType = req.file.mimetype;
                console.log("contentType", contentType)
                let cloud = await cloudinary.uploader.upload(`data:${contentType};base64,${base64String}`, { resource_type: 'video', folder: 'reels' });

                console.log(cloud.url.split("upload/")[1])
                const data = await new reelsSchema({
                    title: req.body.title,
                    video: cloud.url.split("upload/")[1],
                    owner: req.body.id,
                }).save();
                // const data1 = await CourseSchema.findOneAndUpdate({ _id: req.body.mealCourse }, {
                //      dishId: data._id
                // })
                return res.status(200).json({ status: true, message: "New Reel Added successfully", data });
            }
        }
    } catch (err) {
        return res.status(500).json({
            status: false,
            message: err.message
        })
    }
}


exports.getReels = async (req, res) => {
    try {
        const data = await reelsSchema.find()
        return res.status(200).json({
            data: data,
            status: true
        })
    } catch (err) {
        return res.status(500).json({
            status: false,
            message: err.message
        })
    }
}

exports.likeReel = async (req, res) => {
    try {
        if (req.body.reelId) {
            const reel = await reelsSchema.findById({ _id: req.body.reelId })
            if (reel) {
                // console.log("checkReel", reel)
                // Assuming req.user contains the ID of the user liking the reel
                const likeId = req.body.likeId;
                console.log(likeId)
                // Add the user's ID to the like array
                reel.like.push(likeId);
                await reel.save(); // Save the updated reel document

                return res.status(200).json({
                    status: true,
                    message: "Reel liked successfully",
                    data: reel
                });
            }
            else {
                return res.status(404).json({
                    message: "invalid id or reel may be deleted",
                })
            }
        }
        else {
            return res.status(404).json({
                message: "reel id not found",
            })
        }
    } catch (err) {
        return res.status(500).json({
            status: false,
            message: err.message
        })
    }
}

exports.dislikeReel = async (req, res) => {
    try {
        const { reelId, likeId } = req.body;
        if (!reelId || !likeId) {
            return res.status(400).json({
                message: "reelId and likeId are not found."
            });
        }
        const reel = await reelsSchema.findById({ _id: req.body.reelId })

        // Check if the user has already liked the reel
        const alreadyLikedIndex = reel.like.indexOf(likeId);
        if (alreadyLikedIndex !== -1) {
            // If the user has already liked the reel, remove their like
            reel.like.splice(alreadyLikedIndex, 1);
            await reel.save();
            return res.status(200).json({
                message: "Reel disliked.",
                status: true
            });
        }
    } catch (err) {
        return res.status(500).json({
            status: false,
            message: err.message
        })
    }
}