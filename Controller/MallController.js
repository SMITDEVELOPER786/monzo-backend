const MallSchema = require("../Model/MallSchema");

require("dotenv").config();
const secretkey = process.env.secret_key;

const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.uploadMall = async (req, res) => {
    try {
        const { itemCategory, mallName, mallCoin } = req.body;
        if (!itemCategory || !mallName || !mallCoin) {
            return res.status(400).json({
                message: "mallCoin , mallName & itemCategory is required"
            })
        }
        if (!req.file) {
            return res.status(404).json({
                message: "image not found"
            })
        }
        console.log(req.file)
        const cloud = await cloudinary.uploader.upload(req.file.path, {
            folder: 'mallImg', // Set the folder where the image will be stored in Cloudinary
        });
        req.body.mallImg = cloud.secure_url.split("upload/")[1]
        const mall = await MallSchema(req.body).save();

        return res.status(200).json({
            data: mall,
            status: true
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }

}

exports.getMall = async (req, res) => {
    try {
        const data = await MallSchema.find();
        return res.status(200).json({
            data: data,
            status: true,
            size: data.length
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.updateMall = async (req, res) => {
    try {
        const mall = await MallSchema.findById(req.params.id);
        if (!mall) {
            return res.status(400).json({
                message: "Mall Not Found"
            });
        }
        
        if (req.file) {
            const cloud = await cloudinary.uploader.upload(req.file.path, {
                folder: 'mallImg', // Set the folder where the image will be stored in Cloudinary
            });
            req.body.mallImg = cloud.secure_url.split("upload/")[1];
        }

        // Update the mall with the new data from req.body
        Object.assign(mall, req.body);
        await mall.save();

        return res.status(200).json({
            message: "Mall updated successfully",
            data: mall
        });
    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};



exports.deleteMall = async (req, res) => {
    try {
        const mall = await MallSchema.findById(req.params.id);
        if (!mall) {
            return res.status(400).json({
                message: "Mall Not Found"
            })
        }
        await mall.deleteOne({ _id: req.body.params });
        return res.status(200).json({
            message: "Mall deleted successfully",
            data: mall
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}