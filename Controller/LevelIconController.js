const LevelIconSchema = require("../Model/LevelIconSchema");

require("dotenv").config();
const secretkey = process.env.secret_key;

const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


exports.uploadLevelIcon = async (req, res) => {
    try {
        // const { levelIcon } = req.body;
        if (!req.file) {
            return res.status(400).json({
                message: "Level Icon required"
            })
        }
        const cloud = await cloudinary.uploader.upload(req.file.path, {
            folder: "levelIcons"
        })
        req.body.levelIcon = cloud.secure_url.split("upload/")[1]
        // Count the documents and then set the serial number
        const count = await LevelIconSchema.countDocuments();
        req.body.serialNo = count || 0;
        await LevelIconSchema(req.body).save();
        return res.status(200).json({
            message: "level icon uploaded"
        })

    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.getLevelIcons = async (req, res) => {
    try {
        const getIcons = await LevelIconSchema.find();
        return res.status(200).json({
            data: getIcons
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.updateLevelIcon = async (req, res) => {
    try {
        const { iconId, serialNo } = req.body;
        if (!iconId || !serialNo) {
            return res.status(400).json({
                message: "iconId & serialNo is required"
            })
        }
        if (!req.file) {
            return res.status(400).json({
                message: "Level Icon required"
            })
        }

        const data = await LevelIconSchema.findById({ _id: iconId });
        if (!data) {
            return res.status(400).json({
                message: "Level Icon not found"
            })
        }
        const cloud = await cloudinary.uploader.upload(req.file.path, {
            folder: "levelIcons"
        })
        console.log(cloud.secure_url.split("upload/")[1])
        data.levelIcon = cloud.secure_url.split("upload/")[1]

        await data.save();
        return res.status(200).json({
            message: "Level Icon updated successfully"
        })

    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.deleteLevelIcon = async (req, res) => {
    try {
        const { iconId } = req.body;
        if (!iconId) {
            return res.status(400).json({
                message: "iconId is required"
            })
        }
        const data = await LevelIconSchema.findById({ _id: iconId });
        if (!data) {
            return res.status(400).json({
                message: "Level Icon not found"
            })
        }
        await LevelIconSchema.deleteOne({ _id: iconId });

        return res.status(200).json({
            message: "Level Icon deleted successfully"
        });
    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}