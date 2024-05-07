const GiftSchema = require("../Model/GiftSchema");
const userSchema = require("../Model/userSchema");
require("dotenv").config();
const secretkey = process.env.secret_key;

const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


exports.sendGift = async (req, res) => {
    try {
        const { senderId, recieverId } = req.body;
        if (!req.file) {
            return res.status(400).json({
                message: "Gift Image not found...!"
            })
        }
        if (!senderId || !recieverId) {
            return res.status(400).json({
                message: "Sender or Reciever ID not found...!"
            })
        }
        if (senderId === recieverId) {
            return res.status(400).json({
                message: "Sender or Reciever ID can't be same...!"
            })
        }
        // check that users are present
        const senderUser = await userSchema.findById({ _id: senderId });
        const recvUser = await userSchema.findById({ _id: recieverId });
        if (!senderUser || !recvUser) {
            return res.status(404).json({
                message: "sender or reciever user not found"
            })
        }

        const cloud = await cloudinary.uploader.upload(req.file.path, {
            folder: "giftImg"
        })
        senderUser.isLevel += 5;
        recvUser.isLevel += 3;
        await senderUser.save(), recvUser.save();
        req.body.giftImg = cloud.secure_url.split("upload/")[1],
            await GiftSchema(req.body).save();

        // console.log(senderUser);
        return res.status(200).json({
            message: "Gift sent succesfully"
        })
        // if()
        // console.log(checkUser)
    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.getGifts = async (req, res) => {
    try {
        const data = await GiftSchema.aggregate([
            { $match: {} },
            {
                $lookup: {
                    let: { id: "$senderId" },
                    from: "users",
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: { $eq: ["$_id", "$$id"] }
                                }
                            }
                        },
                        { $project: { _id: 1, email: 1, isLevel: 1 } }
                    ],
                    as: "Sender"
                },
            },
            {
                $lookup: {
                    let: { id: "$recieverId" },
                    from: "users",
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: { $eq: ["$_id", "$$id"] }
                            }
                        }
                    },
                    { $project: { _id: 1, email: 1, isLevel: 1 } }
                    ],
                    as: "Reciever"
                }
            }

        ]);
        return res.status(200).json({
            data
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}