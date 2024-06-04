const CoinSchema = require("../Model/CoinSchema");

exports.transferCoins = async (req, res) => {
    try {
        const { resellerId, userId } = req.body;
        var { coins } = req.body;
        if (!resellerId, !userId) return res.status(404).json({
            message: "resellerId & userID are required"
        })
        if (!coins) return res.status(404).json({
            message: "coins amount is required"
        })
        const findAlready = await CoinSchema.findOne({ userId });
        if (findAlready) {
            console.log("coins", coins + findAlready.coins)
            await CoinSchema.findOneAndUpdate({ userId }, { coins: coins + findAlready.coins });
            return res.status(200).json({
                message: `${coins} coins has been transfered to ${resellerId} successfully`
            })
        }
        await CoinSchema(req.body).save();
        return res.status(200).json({
            message: `${coins} coins has been transfered to ${resellerId} successfully`
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.coinHistoryChecker = async (req, res) => {
    try {

        const coinHistory = await CoinSchema.aggregate([
            { $match: {} },
            {
                $lookup: {
                    let: { id: "$userId" },
                    from: "userprofiles",
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: { $eq: ["$authId", "$$id"] }
                                }
                            },
                        },
                        { $project: { username: 1, } }
                    ],
                    as: "User",
                }
            },
            {
                $unwind: "$User"
            },
        ])
        return res.status(200).json({
            data: coinHistory
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}