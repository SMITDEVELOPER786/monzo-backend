const AgencySchema = require("../Model/AgencySchema")

require("dotenv").config();
const secretkey = process.env.secret_key;

const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.createAgency = async (req, res) => {
    try {
        const { idCard, phone, email } = req.body
        console.log(idCard, phone, email)
        if (!idCard || !phone || !req.file || !email) {
            return res.status(400).json({
                message: "idCard, phone, agencyImg, email are required"
            })
        }
        const cloud = await cloudinary.uploader.upload(req.file.path, {
            folder: "agencyImg"
        })
        req.body.status = "requested"
        req.body.agencyImg = cloud.secure_url.split("upload/")[1]
        const agency = await AgencySchema(req.body).save();
        return res.status(200).json({
            data: agency,
            message: "agency created"
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.acceptAgencyReq = async (req, res) => {
    try {
        const { agencyId } = req.body;
        if (!agencyId) {
            return res.status(400).json({
                message: "agency Id is required"
            })
        }
        const data = await AgencySchema.findOneAndUpdate({ _id: agencyId }, { status: "accepted" })
        return res.status(200).json({
            message: "agency request accepted successfully"
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.rejectAgencyReq = async (req, res) => {
    try {
        const { agencyId } = req.body;
        if (!agencyId) {
            return res.status(400).json({
                message: "agency Id is required"
            })
        }
        const data = await AgencySchema.findOneAndUpdate({ _id: agencyId }, { status: "rejected" })
        return res.status(200).json({
            message: "agency request declined successfully"
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}