// const CoinDistributorSchema = require("../Model/CoinDistributorSchema");
const userSchema = require("../Model/userSchema");
const CoinSchema = require("../Model/CoinSchema");
const AdminSchema = require("../Model/AdminSchema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const DistributorCoinSchema = require("../Model/DistributorCoinSchema");
require("dotenv").config();

const secretkey = process.env.secret_key;

exports.TransferCoins = async (req, res) => {
    try {
        const { coins, userId } = req.body;
        if (!coins) {
            return res.status(400).json({
                message: "Coin not found"
            })
        }
        if (!userId) {
            return res.status(400).json({
                message: "UserId not found"
            })
        }
        const user = await userSchema.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            })
        }
        const distributor = await DistributorCoinSchema.findOne({ distributorId: req.user.id })
        const checkHistory = await CoinSchema.findOne({ userId })
        distributor.coins -= parseInt(coins)
        await distributor.save();
        if (checkHistory) {
            checkHistory.coins += parseInt(coins)
            checkHistory.save();

            return res.status(200).json({
                message: `${coins} has been transfered to ${user.Id}`,
                status: true
            });
        }
        req.body.resellerId = user.Id;
        await CoinSchema(req.body).save();

        return res.status(200).json({
            message: `${coins} has been transfered to ${user.Id}`,
            status: true
        })

    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}


exports.loginCoinDistributor = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: "Email Password is required"
            })
        }
        const checkEmail = await AdminSchema.findOne({ email });
        if (!checkEmail) {
            return res.status(404).json({
                message: "User not found"
            })
        }
        if (checkEmail.role !== "coin-distributor") {
            return res.status(400).json({
                message: "Invalid credientials for Coin-Distributor, You are not Coin Distributor"
            })
        }
        const token = await jwt.sign({ userId: checkEmail._id }, secretkey, { expiresIn: "24h" })

        // console.log(token)
        return res.status(200).json({
            message: "login Successfully ",
            data: checkEmail,
            token: token,
        });


    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.getMyAmout = async (req, res) => {
    const coins = await DistributorCoinSchema.findOne({ distributorId: req.user.id })
    return res.status(200).json({
        data: coins.coins
    })
}

exports.getAllCoinDistributors = async (req, res) => {
    try {
        const data = await AdminSchema.find({ role: "coin-distributor" });
        return res.status(200).json({
            data: data
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.deleteCoinDistributor = async (req, res) => {
    try {
        const { distributorId } = req.body;
        if (!distributorId) {
            return res.status(400).json({
                message: "Distributor ID is required"
            })
        }
        const checkEmail = await AdminSchema.findByIdAndDelete(distributorId);
        if (!checkEmail) {
            return res.status(404).json({
                message: "Coin Distributor not found"
            })
        }
        return res.status(200).json({
            message: "Coin Distributor deleted succcessfully"
        })

    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}

