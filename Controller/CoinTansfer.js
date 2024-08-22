const CoinSchema = require("../Model/CoinSchema");
const CoinTransferSchema = require("../Model/CoinTransferSchema");
const UserProfileSchema = require("../Model/UserProfileSchema");
const userSchema = require("../Model/userSchema");

const xpThresholdRange = (level) => {
    if (level < 12) return 500000;
    else if (level >= 12 && level < 23) return 1500000;
    else if (level >= 23 && level < 34) return 5000000;
    else if (level >= 34 && level < 45) return 10000000;
    else if (level >= 45 && level < 56) return 20000000;
    else if (level >= 56 && level < 67) return 50000000;
    else if (level >= 67 && level < 78) return 100000000;
    else if (level >= 78 && level < 89) return 150000000;
    else if (level >= 89 && level < 101) return 200000000;
    else if (level >= 101 && level < 122) return 300000000;
    else if (level >= 122 && level < 143) return 500000000;
    else if (level >= 143 && level < 164) return 1000000000;
    else if (level >= 164 && level < 185) return 1500000000;
    else if (level >= 185 && level < 200) return 2000000000;
    else if (level >= 200 && level < 222) return 3000000000;
}

const levelUpdate = async (level, currentXp, xp) => {
    const xpThreshold = await xpThresholdRange(level);
    const totalXp = currentXp + xp;

    if (isNaN(totalXp)) {
        console.error('XP calculation resulted in NaN:', { level, currentXp, xp });
        return { newLevel: level, newXp: 0, totalXp: currentXp }; // Ensure valid return values
    }

    if (totalXp >= xpThreshold) {    // checks range 
        const newLevel = level + 1;
        const newCurrentXp = totalXp - xpThreshold;
        // console.log(`newLevel: ${newLevel}, newCurrentXp: ${newCurrentXp}, totalXp: ${totalXp} `)
        return { newLevel, newXp: newCurrentXp, totalXp };
    }

    return { newLevel: level, newXp: totalXp, totalXp };
};



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
        recieverProf.diamonds += coins;
        // console.log(coins)
        const updatedSenderXps = await levelUpdate(sender.isLevel, sender.currentXp, coins);
        const updatedRecieverXps = await levelUpdate(reciever.isLevel, reciever.currentXp, (coins / 2));
        // console.log(sender.isLevel, sender.currentXp || 0, coins)
        console.log(reciever.isLevel, reciever.currentXp || 0, (coins / 2))
        if (updatedSenderXps) {
            sender.isLevel = updatedSenderXps.newLevel;
            sender.totalXp = updatedSenderXps.totalXp; // Ensure totalXp is updated correctly
            sender.currentXp = updatedSenderXps.newXp;
        }

        if (updatedRecieverXps) {
            reciever.isLevel = updatedRecieverXps.newLevel;
            reciever.totalXp = updatedRecieverXps.totalXp; // Ensure totalXp is updated correctly
            reciever.currentXp = updatedRecieverXps.newXp;
        }


        // console.log(reciever)
        await senderCoin.save();
        await sender.save();
        await reciever.save();
        await recieverCoin.save();
        await recieverProf.save();
        const coinTrans = await CoinTransferSchema(req.body).save();
        // console.log("Sender updated:", sender);
        // console.log("Receiver updated:", reciever);

        const updatedTransaction = {
            ...coinTrans._doc,
            remainingCoins: senderCoin.coins
        };
        return res.status(200).json({
            message: "Coins transfered successfully",
            data: updatedTransaction

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
            { $match: req.user.role !== "admin" && req.user.role !== "subAdmin" ? { senderId: req.user._id } : {} },
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