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
        req.body.userId = req.user._id
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

exports.getAgency = async (req, res) => {
    try {
        const data = await AgencySchema.find()
        return res.status(200).json({
            data
        })
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
        const data = await AgencySchema.findOneAndUpdate({ _id: agencyId }, { $set: { status: "accepted" } });
        if (!data) {
            return res.status(404).json({
                message: "agency not found"
            })
        }
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
        const data = await AgencySchema.findOneAndUpdate(
            { _id: agencyId }, // Filter to find the agency by its ID
            { $set: { status: "rejected" } },
            // { new: true } // Return the updated document
        );
        if (!data) {
            return res.status(404).json({
                message: "agency not found"
            })
        }

        return res.status(200).json({
            message: "agency request declined successfully"
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.adminGetAgency = async (req, res) => {
    try {
        const data = await AgencySchema.aggregate([
            { $match: {}, },
            {
                $lookup: {
                    from: "users",
                    let: { id: "$userId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$_id", "$$id"]
                                }
                            },
                        },
                        { $project: { Id: 1, email: 1, _id: 0 } }
                    ],
                    as: "User"

                },

            },
            { $unwind: "$User" }

        ])
        // const data = await AgencySchema.find();
        return res.status(200).json({
            data
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.agencyChngeInfo = async (req, res) => {
    try {
        const { phone, agencyId } = req.body;
        if (!phone || !req.file || !agencyId)
            return res.status(404).json({
                message: "Phone Number or agencyImg or agencyId not found"
            })
        const agency = await AgencySchema.findOne({ _id: agencyId })
        if (!agency)
            return res.status(404).json({
                message: "Agency not found"
            })
        const cloud = await cloudinary.uploader.upload(req.file.path, {
            folder: "agencyImg"
        })
        req.body.agencyImg = cloud.secure_url.split("upload/")[1]


        await AgencySchema.findOneAndUpdate({ _id: agencyId }, req.body)
        return res.status(200).json({
            message: "Agency Form updated...!"
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}