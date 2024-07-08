const userSchema = require("../Model/userSchema");
require("dotenv").config();
const secretkey = process.env.secret_key;

const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


exports.addUserTag = async (req, res) => {
    try {
        const { userId, tag } = req.body;
        if (!userId || !tag) {
            return res.status(400).json({
                message: "User id and tag are required"
            })
        }
        const user = await userSchema.findOneAndUpdate({ _id: userId }, { $set: { tag } });
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            })
        }
        return res.status(200).json({
            message: "Tag added successfully"
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.getAssignTags = async (req, res) => {
    try {
        const data = await userSchema.find({ tag: { $exists: true, $ne: null, $ne: "" } });

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


exports.deleteAssignTag = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({
                message: "User ID is required"
            })
        }
        const user = await userSchema.findOneAndUpdate({ _id: userId }, { $unset: { tag: "" } },
            { new: true });
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            })
        }
        return res.status(200).json({
            message: "Tag deleted successfully"
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}


exports.assignSpecialTag = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId || !req.file) {
            return res.status(400).json({
                message: "User id and specialTag image are required"
            })
        }
        const cloud = await cloudinary.uploader.upload(req.file.path, {
            folder: "specialIcon"
        })
        const user = await userSchema.findOneAndUpdate({ _id: userId }, { $set: { specialTag: cloud.secure_url.split("upload/")[1] } });
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            })
        }
        return res.status(200).json({
            message: "Special Tag Icon added successfully"
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.getAssignSpecialTags = async (req, res) => {
    try {
        const data = await userSchema.find({ specialTag: { $exists: true, $ne: null, $ne: "" } });

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


exports.deleteAssignSpecialTag = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({
                message: "User ID is required"
            })
        }
        const user = await userSchema.findOneAndUpdate({ _id: userId }, { $unset: { specialTag: "" } },
            { new: true });
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            })
        }
        return res.status(200).json({
            message: "Special Tag deleted successfully"
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}