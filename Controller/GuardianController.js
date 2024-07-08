const { default: axios } = require("axios");
const GuardianSchema = require("../Model/GuardianSchema");
const userSchema = require("../Model/userSchema");
const { coinHistoryChecker } = require("./CoinController");
const CoinSchema = require("../Model/CoinSchema");
const GiveGuardianSchema = require("../Model/GiveGuardianSchema");
require("dotenv").config();
const secretkey = process.env.secret_key;

const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.createGuardian = async (req, res) => {
    try {
        const { guardianCoin, guardianType } = req.body;
        if (!guardianCoin || !guardianType) {
            return res.status(400).json({
                message: "coin & type are required..!"
            })
        }
        // console.log(req.file)
        if (!req.file) {
            return res.status(400).json({
                message: "guardian img is required..!"
            })
        }
        const checkGuard = await GuardianSchema.findOne({ guardianType });
        if (checkGuard.guardianType === guardianType) {
            return res.status(400).json({
                message: `${guardianType} is already added`
            })
        }
        const cloud = await cloudinary.uploader.upload(req.file.path, {
            folder: "guardianImg"
        })
        req.body.guardianImg = cloud.secure_url.split("upload/")[1];
        parseInt(guardianCoin)

        await GuardianSchema(req.body).save();
        return res.status(200).json({
            message: "Guardian added successfully..!"
        })
    }
    catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.getGuardian = async (req, res) => {
    try {
        const data = await GuardianSchema.find();
        return res.status(200).json({
            data
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.updateGuardian = async (req, res) => {
    try {
        const { guardianCoin, guardianId } = req.body;
        if (!guardianId) {
            return res.status(400).json({
                message: "guardianId is required..!"
            })
        }
        const checkGuard = await GuardianSchema.findById({ _id: guardianId })
        if (!checkGuard) {
            return res.status(404).json({
                message: "guardian not found"
            });
        }
        if (!guardianCoin) {
            return res.status(400).json({
                message: "guardianCoin are required..!"
            })
        }
        if (req.file) {
            const cloud = await cloudinary.uploader.upload(req.file.path, {
                folder: "guardianImg"
            })
            req.body.guardianImg = cloud.secure_url.split("upload/")[1];
        }
        console.log(req.body.guardianImg)
        await GuardianSchema.findOneAndUpdate({ _id: guardianId }, req.body);
        return res.status(200).json({
            message: "Guardian updated successfully..!"
        })

    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.deleteGuardian = async (req, res) => {
    try {
        const { guardianId } = req.body;
        if (!guardianId) {
            return res.status(400).json({
                message: "guardianId is required..!"
            })
        }
        const checkGuard = await GuardianSchema.findById({ _id: guardianId })
        if (!checkGuard) {
            return res.status(404).json({
                message: "guardian not found"
            });
        }
        await GuardianSchema.findOneAndDelete({ _id: guardianId })
        return res.status(404).json({
            message: "guardian deleted successfully..!"
        });
    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}

const getCoinHistory = async (token) => {

    try {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'https://hurt-alexandra-saim123-c534163d.koyeb.app/monzo/admin/coins',
            headers: {
                'Authorization': token
            }
        };

        const response = await axios.request(config);
        return response.data.data;
    } catch (error) {
        console.log("Error fetching coin history:", error);
        throw error;
    }

}

exports.giveGuardian = async (req, res) => {
    try {
        const { senderId, recieverId, guardianId, guardianType, guardianDuration } = req.body;
        // const { authorization } = req.headers;
        // console.log("req.headers.Authorization", authorization)

        if (!guardianId) {
            return res.status(400).json({
                message: "guardianId is required..!"
            });
        }

        const checkGuard = await GuardianSchema.findById(guardianId);
        if (!checkGuard) {
            return res.status(404).json({
                message: "guardian not found"
            });
        }

        if (!guardianDuration) {
            return res.status(400).json({
                message: "guardian duration is required"
            });
        }

        if (!senderId || !recieverId) {
            return res.status(400).json({
                message: "sender & receiver IDs are required.."
            });
        }

        if (senderId === recieverId) {
            return res.status(400).json({
                message: "sender & receiver IDs cannot be the same.."
            });
        }

        const senderUser = await userSchema.findById(senderId);
        const recieverUser = await userSchema.findById(recieverId);
        if (!senderUser || !recieverUser) {
            return res.status(404).json({
                message: "sender & receiver users not found"
            });
        }

        // Uncomment if necessary
        if (!senderUser.isReseller || !recieverUser.isReseller) {
            return res.status(404).json({
                message: "sender & receiver are not resellers"
            });
        }

        const coinHistory = await getCoinHistory(req.headers.authorization);
        let filterSenderCoin = coinHistory.filter((user) => user.userId == senderId)
        let filterRecieverCoin = coinHistory.filter((user) => user.userId == recieverId)
        console.log(filterRecieverCoin)
        console.log(filterRecieverCoin[0].coins)
        if (filterRecieverCoin[0].coins < checkGuard.guardianCoin)
            return res.status(400).json({
                message: "guardian amount is greater than coin is present in reciever"
            })
        // console.log(filterUser[0].coins -= checkGuard.guardianCoin);
        // console.log(((checkGuard.guardianCoin / 100) * 50) + filterUser[1].coins);
        await CoinSchema.findOneAndUpdate({ _id: filterSenderCoin[0]._id }, { coins: ((checkGuard.guardianCoin / 100) * 50) + filterSenderCoin[0].coins }) // update sender coins

        await CoinSchema.findOneAndUpdate({ _id: filterRecieverCoin[0]._id }, { coins: filterRecieverCoin[0].coins -= checkGuard.guardianCoin }) // update reciever coins

        req.body.guardianCoins = await checkGuard.guardianCoin
        await GiveGuardianSchema(req.body).save();

        return res.status(200).json({
            message: `Guardian is assigned to ${filterRecieverCoin[0].User.username}`
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};


