const VipSchema = require("../Model/VipSchema");
require("dotenv").config();
const secretkey = process.env.secret_key;

const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.createVip = async (req, res) => {
    try {
        const { vipImg, coinValue } = req.body;
        if (!req.file) {
            return res.status(404).json({
                message: "Image is not found"
            })
        }
        if (!coinValue) {
            return res.status(404).json({
                message: "Coin Value is not found"
            })
        }
        const cloud = await cloudinary.uploader.upload(req.file.path, {
            folder: 'vipImg', // Set the folder where the image will be stored in Cloudinary
        });
        req.body.vipImg = cloud.secure_url.split("upload/")[1];

        const vip = await VipSchema(req.body).save();
        return res.status(200).json({
            data: vip,
            message: "Vip added"
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }

}

exports.getVips = async (req, res) => {
    try {
        const data = await VipSchema.find();
        return res.status(200).json({
            data: data
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }

}

exports.updateVip = async (req, res) => {
    try {
        const data = await VipSchema.findOne({ _id: req.params.id });
        if (!data) {
            return res.status(404).json({
                message: "Vip not found"
            })
        }
        const { coinValue } = req.body;
        if (!req.file) {
            return res.status(404).json({
                message: "Image is not found"
            })
        }
        if (!coinValue) {
            return res.status(404).json({
                message: "Coin Value is not found"
            })
        }
        const cloud = await cloudinary.uploader.upload(req.file.path, {
            folder: 'vipImg', // Set the folder where the image will be stored in Cloudinary
        });
        req.body.vipImg = cloud.secure_url.split("upload/")[1];

        await VipSchema.findByIdAndUpdate({ _id: req.params.id }, req.body);
        return res.status(200).json({
            message: "Vip updated successfully"
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }

}


exports.deleteVip = async (req, res) => {
    try {
        await VipSchema.deleteOne({ _id: req.params.id })
        return res.status(200).json({
            message: "Vip deleted successfully...!"
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}