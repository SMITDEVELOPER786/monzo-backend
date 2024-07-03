const { default: axios } = require("axios");
const GuardianSchema = require("../Model/GuardianSchema");
const userSchema = require("../Model/userSchema");
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


exports.giveGuardian = async (req, res) => {
    try {
        const { senderId, recieverId, guardianId, guardianType, guardianDuration } = req.body;
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
        if (!guardianDuration) {
            return res.status(400).json({
                message: "guardian duration is required"
            });
        }
        if (!senderId || !recieverId) {
            return res.status(400).json({
                message: "sender & reciever ID's are requried.."
            })
        }
        if (senderId == recieverId) {
            return res.status(400).json({
                message: "sender & reciever ID's are not same.."
            })
        }
        const senderUser = await userSchema.findById({ _id: senderId })
        const recieverUser = await userSchema.findById({ _id: recieverId })
        if (!senderUser || !recieverUser) {
            return res.status(404).json({
                message: "sender & reciever users not found"
            })
        }
        if (!senderUser.isReseller || !recieverUser.isReseller) {
            return res.status(404).json({
                message: "sender & reciever are not reseller"
            })
        }




    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}