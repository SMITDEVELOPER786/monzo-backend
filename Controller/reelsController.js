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
        else if (!req.body.userId) {
            res.status(404).json({ message: "UserId is Required" });
        }
        else {
            if (!req.file) {
                return apiResponse.ErrorResponse(res, "Reel format not supported");
            } else {
                let check = await reelsSchema.find({ title: { '$regex': '^' + req.body.title + '$', "$options": "i" }, owner: req.body.userId }).lean().exec();
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
                    owner: req.body.userId,
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
                // const likeId = req.body.use/rId;
                console.log(req.body.userId)
                // Add the user's ID to the like array
                reel.like.push(req.body.userId);
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

exports.addComment = async (req, res) => {
    try {
        if (!req.body.reelId || !req.body.userId) {
            return res.status(400).json({
                status: false,
                message: "Both reelId and userId are required."
            });
        } else if (!req.body.comment) {
            return res.status(400).json({
                status: false,
                message: "Comment are required."
            });

        } else {
            if (!req.body.reelId) return res.status(404).json({
                status: false,
                message: "reel id can't be null"
            })
            else {

                const data = await reelsSchema.findById({ _id: req.body.reelId })
                if (data) {
                    console.log("data", data)
                    data.comment.push({ userId: req.body.userId, comment: req.body.comment, reelId: req.body.reelId });
                    await data.save(); // Save the updated reel document
                    return res.status(200).json({
                        data: data,
                        status: true
                    })
                }
            }
        }
    } catch (err) {
        return res.status(500).json({
            status: false,
            message: err.message
        })
    }
}

exports.updateComment = async (req, res) => {
    try {
        if (!req.body.reelId || !req.body.userId || !req.body.comment) {
            return res.status(400).json({
                status: false,
                message: "Both reelId and userId are required."
            });
        } else {
            if (!req.body.reelId) return res.status(404).json({
                status: false,
                message: "reel id can't be null"
            })
            else {

                const data = await reelsSchema.findById({ _id: req.body.reelId })
                if (data) {
                    console.log("data", data)
                    const commentIndex = data.comment?.findIndex((comment) => comment.userId?.toString() === req.body.userId.toString());

                    if (commentIndex === -1) {
                        return res.status(404).json({
                            status: false,
                            message: "Comment not found."
                        });
                    }
                    // Update the comment content
                    data.comment[commentIndex].comment = req.body.comment;
                    await data.save(); // Save the updated reel document
                    return res.status(200).json({
                        status: true,
                        message: "Comment updated successfully.",
                        data: data
                    });
                }
            }
        }
    } catch (err) {
        return res.status(500).json({
            status: false,
            message: err.message
        })
    }
}

exports.deleteComment = async (req, res) => {
    try {
        const { reelId, userId } = req.body;

        if (!reelId || !userId) {
            return res.status(400).json({
                status: false,
                message: "Both reelId and userId are required."
            });
        }

        const reel = await reelsSchema.findById(reelId);

        if (!reel) {
            return res.status(404).json({
                status: false,
                message: "Reel not found."
            });
        }
        console.log("userId", userId)
        const commentIndex = reel.comment?.findIndex((comment) => comment.userId?.toString() === userId.toString());

        // console.log("commentIndex", commentIndex)
        if (commentIndex === -1) {
            return res.status(404).json({
                status: false,
                message: "Comment not found."
            });
        }

        reel.comment.splice(commentIndex, 1); // Remove the comment
        await reel.save(); // Save the updated reel document

        return res.status(200).json({
            status: true,
            message: "Comment deleted successfully."
        });

    } catch (err) {
        return res.status(500).json({
            status: false,
            message: err.message
        })
    }
}

exports.shareReel = async (req, res) => {
    try {
        if (!req.body.reelId || !req.body.userId) {
            return res.status(400).json({
                status: false,
                message: "Both reelId and userId are required."
            });
        } else {
            if (!req.body.reelId) return res.status(404).json({
                status: false,
                message: "reel id can't be null"
            })
            else {

                const data = await reelsSchema.findById({ _id: req.body.reelId })
                if (data) {
                    console.log("req.body.userId", req.body.userId)
                    data.share.push(req.body.userId);
                    await data.save(); // Save the updated reel document
                    return res.status(200).json({
                        data: data,
                        status: true,
                        message: "reel shared successfully"
                    })
                }
            }
        }


    } catch (err) {
        return res.status(500).json({
            status: false,
            message: err.message
        })
    }
}

// -------------like/dislike Comment ---------------- 
exports.likeComment = async (req, res) => {
    try {
        const { reelId, commentId, userId } = req.body;

        // Check if all required parameters are provided
        if (!reelId || !commentId || !userId) {
            return res.status(400).json({
                status: false,
                message: "reelId, commentId, and userId are required."
            });
        }

        // Find the reel by ID
        const reel = await reelsSchema.findById(reelId);

        // Check if the reel exists
        if (!reel) {
            return res.status(404).json({
                status: false,
                message: "Reel not found."
            });
        }

        // Find the comment in the reel
        const comment = reel.comment.find(comment => comment._id.toString() === commentId);

        // Check if the comment exists
        if (!comment) {
            return res.status(404).json({
                status: false,
                message: "Comment not found."
            });
        }

        // Check if the user has already liked the comment
        const alreadyLikedIndex = comment.like.indexOf(userId);

        // If the user has already liked the comment, return a message
        if (alreadyLikedIndex !== -1) {
            return res.status(200).json({
                status: false,
                message: "You have already liked this comment."
            });
        }

        // Add the user's ID to the likes array of the comment
        comment.like.push(userId);

        // Save the updated reel
        await reel.save();

        return res.status(200).json({
            status: true,
            message: "Comment liked successfully.",
            data: reel
        });

    } catch (err) {
        return res.status(500).json({
            status: false,
            message: err.message
        });
    }
}

exports.dislikeComment = async (req, res) => {
    try {
        const { reelId, commentId, userId } = req.body
        if (!reelId || !commentId || !userId) {
            return res.status(400).json({
                status: false,
                message: "reelId, commentId, and userId are required."
            });
        }
        const reel = await reelsSchema.findById(reelId);
        if (!reel) {
            return res.status(404).json({
                status: false,
                message: "Reel not found."
            });
        }
        const comment = reel.comment.find(comment => comment._id.toString() === commentId);

        if (!comment) {
            return res.status(404).json({
                status: false,
                message: "Comment not found."
            });
        }

        const alreadyDislikedIndex = comment.like.indexOf(userId);

        // If the user has already disliked the comment, return a message
        if (alreadyDislikedIndex !== -1) {
            comment.like.splice(alreadyDislikedIndex, 1);
            // Save the updated reel
            await reel.save();
            return res.status(200).json({
                status: true,
                message: "Comment disliked successfully.",
                data: reel
            });
        }

    } catch (err) {
        return res.status(500).json({
            status: false,
            message: err.message
        });
    }
}
