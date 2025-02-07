const CoinSchema = require("../Model/CoinSchema");
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


exports.uploadGift = async (req, res) => {
    try {
        const { giftCategory, giftValue, giftName } = req.body;
        if (!giftCategory || !req.file || !giftValue || !giftName) {
            return res.status(404).json({
                message: "giftCategory , gift image , giftName & giftValue is required"
            })
        }
        const cloud = await cloudinary.uploader.upload(req.file.path, {
            folder: "giftImg"
        })
        req.body.giftImg = cloud.secure_url.split("upload/")[1],
            await GiftSchema(req.body).save();
        return res.status(200).json({
            message: "Gift added succesfully"
        })

    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.deleteGift = async (req, res) => {
    try {
        const { giftId } = req.body;
        if (!giftId)
            return res.status(404).json({
                message: "Gift ID not found"
            })
        const gift = await GiftSchema.findById(giftId);
        if (!gift) {
            return res.status(404).json({
                message: "Gift not found"
            })
        }
        await GiftSchema.deleteOne({ _id: giftId })
        return res.status(200).json({
            message: "Gift deleted successfully"
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.sendGift = async (req, res) => {
    try {

        const { recieverId, giftId } = req.body;
        if (!recieverId) {
            return res.status(400).json({
                message: "Reciever ID not found...!"
            })
        }
        if (!giftId) {
            return res.status(400).json({
                message: "Gift Id not found...!"
            })
        }
        // console.log(req.user._id.toString())
        // console.log(recieverId)
        if (req.user._id.toString() === recieverId) {
            return res.status(400).json({
                message: "Sender or Reciever ID can't be same...!"
            })
        }
        // check that users are present
        const senderUser = await userSchema.findById(req.user._id);
        const senderCoins = await CoinSchema.findOne({ userId: req.user._id });
        const recvUser = await userSchema.findById({ _id: recieverId });
        if (!senderUser || !recvUser) {
            return res.status(404).json({
                message: "sender or reciever user not found"
            })
        }
        const gift = await GiftSchema.findById({ _id: giftId })
        if (!gift) {
            return res.status(400).json({
                message: "gift not found"
            })
        }
        if (senderCoins.coins < gift.giftValue) {
            return res.status(400).json({
                message: "Insufficient Sender Coins"
            })
        }
        // console.log("senderCoins", senderCoins)


        senderCoins.coins -= parseInt(gift.giftValue);
        senderUser.isLevel += 5;
        recvUser.isLevel += 3;
        await senderUser.save(), recvUser.save(), senderCoins.save();
        gift.senderId.push(req.user._id);
        gift.recieverId.push(recieverId);

        // console.log(gift)
        // req.body.giftImg = cloud.secure_url.split("upload/")[1],
        await gift.save();

        return res.status(200).json({
            message: "Gift sent succesfully",
            data: { giftImg: gift.giftImg }
        })

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