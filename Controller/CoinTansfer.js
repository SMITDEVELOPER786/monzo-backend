const CoinSchema = require("../Model/CoinSchema");
const CoinTransferSchema = require("../Model/CoinTransferSchema");
const UserProfileSchema = require("../Model/UserProfileSchema");
const userSchema = require("../Model/userSchema");

exports.sendCoins = async (req, res) => {
    try {
        const { recieverId, coins } = req.body;
        const senderId = req.user._id
        if (!senderId || !recieverId)
            return res.status(400).json({
                message: "sender or reciever ID's not found"
            })
        if (senderId == recieverId)
            return res.status(400).json({
                message: "sender or reciever ID's cannot be same"
            })

        const sender = await userSchema.findById(senderId);
        const reciever = await userSchema.findById(recieverId);
        const recieverProf = await UserProfileSchema.findOne({ authId: recieverId });
        const senderCoin = await CoinSchema.findOne({ userId: senderId });
        let recieverCoin = await CoinSchema.findOne({ userId: recieverId });

        if (!sender || !senderCoin)
            return res.status(400).json({
                message: "sender user coins not found"
            })
        if (!reciever || !recieverProf) {
            return res.status(400).json({
                message: "Rciever user not found"
            })
        }
        if (!recieverCoin) {
            recieverCoin = new CoinSchema({ userId: recieverId, coins: 0 });
            await recieverCoin.save();
        }
        if (!coins)
            return res.status(400).json({
                message: "Coins not found"
            })
        // console.log("senderCoin:", senderCoin.coins)
        // console.log("coins:", coins)
        if (senderCoin.coins < 0 || senderCoin.coins < coins)
            return res.status(400).json({
                message: "The amount of coins you are trying to send is greater than the amount available in your account."
            })
        // console.log(sender)
        req.body.senderId = senderCoin.userId
        senderCoin.coins -= coins
        recieverCoin.coins += coins
        recieverProf.diamonds += coins
        await senderCoin.save();
        await recieverCoin.save();
        await recieverProf.save();
        const coinTrans = await CoinTransferSchema(req.body).save();

        const updatedTrans = {
            ...coinTrans._doc,
            remainingCoins: senderCoin.coins
        };
        return res.status(200).json({
            message: "Coins transfered successfully",
            data: updatedTrans

        })


    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.getCoinsHistory = async (req, res) => {
    try {
        // if (!req.body.userId)
        //     return res.status(400).json({
        //         message: "senderId is required"
        //     })
        console.log(req.user)
        const data = await CoinTransferSchema.aggregate([
            { $match: req.user.role !== "admin" ? { senderId: req.user._id } : {} },
            {
                $lookup: {
                    let: { id: "$senderId" },
                    from: "users",
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$id"] }
                                    ]
                                }
                            }
                        },
                        {
                            $project: { email: 1, Id: 1, country: 1 }
                        }
                    ],
                    as: "sender"
                }
            },
            {
                $lookup: {
                    from: "userprofiles",
                    let: { id: "$senderId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$authId", "$$id"] }
                                    ]
                                }
                            }
                        },
                        {
                            $project: { username: 1, profileImage: 1 }
                        }
                    ],
                    as: "senderProfile"
                }
            },
            {
                $lookup: {
                    let: { id: "$recieverId" },
                    from: "users",
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$id"] }
                                    ]
                                }
                            }
                        },
                        {
                            $project: { email: 1, Id: 1, country: 1 }
                        }
                    ],
                    as: "reciever"
                }
            },
            {
                $lookup: {
                    from: "userprofiles",
                    let: { id: "$recieverId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$authId", "$$id"] }
                                    ]
                                }
                            }
                        },
                        {
                            $project: { username: 1, profileImage: 1 }
                        }
                    ],
                    as: "recieverProfile"
                }
            },
            { $unwind: "$sender" },
            { $unwind: "$senderProfile" },
            { $unwind: "$reciever" },
            { $unwind: "$recieverProfile" }
        ]);

        return res.status(200).json({
            data,
            length: data.length
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}