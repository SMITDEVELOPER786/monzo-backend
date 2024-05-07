const BannerSchema = require("../Model/BannerSchema");

require("dotenv").config();
const secretkey = process.env.secret_key;

const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});



exports.uploadBanner = async (req, res) => {
    try {
        const { category } = req.body;
        if (!req.file) {
            return res.status(400).json({
                message: "banner image is required "
            })
        }
        if (!category) {
            return res.status(400).json({
                message: "banner category is required "
            })
        }


        const cloud = await cloudinary.uploader.upload(req.file.path, {
            folder: 'bannerImg', // Set the folder where the image will be stored in Cloudinary
        });
        // req.body.bannerImg =
        // req.body.userId = cloud.secure_url.split("upload/")[1]
        const banner = BannerSchema({
            bannerImg: cloud.secure_url.split("upload/")[1],
            userID: req.user._id,
            category
        });
        await banner.save()
        return res.status(200).json({
            data: banner,
            status: true
        })


    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}


exports.getBanners = async (req, res) => {
    try {
        const banners = await BannerSchema.find();
        return res.status(200).json({
            data: banners,
            status: true
        });
    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
}


exports.deleteBanner = async (req, res) => {
    try {
     
        const banner = await BannerSchema.findById(req.params.id);
        if (!banner) {
            return res.status(404).json({
                message: "Banner not found"
            });
        }
        await banner.deleteOne({ _id: req.body.params })
        return res.status(200).json({
            message: "Banner deleted successfully",
            status: true
        });
    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
}

exports.updateBanner = async (req, res) => {
    try {
        const { category, title , bannerImg} = req.body;
        // console.log(req.user)
        const banner = await BannerSchema.findById(req.params.id);
        if (!banner) {
            return res.status(404).json({
                message: "Banner not found"
            });
        }

        const cloud =await cloudinary.uploader.upload(req.file.path, {
            folder: "bannerImg"
        })
        console.log(cloud.secure_url)
        banner.category = category;
        banner.bannerTitle = title;
        banner.bannerImg = cloud.secure_url.split("upload/")[1];
        await banner.save();
        
        return res.status(200).json({
            data: banner,
            status: true,
            message: "banner updated"
        });
    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
}