const VipSchema = require("../Model/VipSchema");
const UserSchema = require("../Model/userSchema");
const VipAssignSchema = require("../Model/VipAssignSchema");
require("dotenv").config();
const secretkey = process.env.secret_key;

const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
const labels = ['Vip Badge', 'Frame', 'Entrance Effects', 'Car', 'Colorful Message', 'Personal Profile'];

exports.createVip = async (req, res) => {
    try {
        const { coinValue, vipCategory } = req.body;

        console.log(req.files); // Log files to debug

        if (!req.files || req.files.length === 0) {
            return res.status(404).json({
                message: "Image is not found"
            });
        }
        if (!coinValue) {
            return res.status(404).json({
                message: "Coin Value is not found"
            });
        }
        // console.log(coinValue)
        let vipImgsArr = [];
        let index = 0;
        for (const file of req.files) {
            const cloud = await cloudinary.uploader.upload(file.path, { folder: "vipImgs" })
            // console.log(cloud.secure_url.split("upload/")[1])
            // console.log(labels[index])
            vipImgsArr.push({ vipImgLabel: labels[index], vipImg: cloud.secure_url.split("upload/")[1] })
            ++index;
        }
        // console.log(vipImgsArr)
        req.body.vipImgs = vipImgsArr


        const vip = await VipSchema(req.body).save();
        return res.status(200).json({
            data: vip,
            message: "Vip added"
        });
    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
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


exports.giveVIP = async (req, res) => {
    try {
        const { userId, duration, vipId, vipLevel } = req.body;
        if (!userId || !duration || !vipId) {
            return res.status(404).json({
                message: "userId, duration, vipId not found"
            })
        }
        const findVip = await VipSchema.findById(vipId);
        const findUser = await UserSchema.findById(userId);
        if (!findVip || !findUser) {
            return res.status(404).json({
                message: "Vip or User not found"
            })
        }
        // req.body.vipLevel = findVip.vipCategory;
        await VipAssignSchema(req.body).save();
        return res.status(200).json({
            message: `Vip Assigned to User ${findUser.Id}`
        })


    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}