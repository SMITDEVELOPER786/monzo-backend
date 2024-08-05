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
        const { idCard, phone, email, name } = req.body
        console.log("passport", req.files.passport)
        console.log("agencyImg", req.files.agencyImg)
        console.log("req.file", req.files)
        console.log("req.file", req.file)
        if (!idCard || !phone || !req.files || !email || !name) {
            return res.status(400).json({
                message: "idCard, phone, agencyImg, email, name are required"
            })
        }
        if (!req.files.agencyImg || !req.files.passport || !req.files.photoId)
            return res.status(400).json({
                message: "Agency, passport, or photo ID image not found."
            })
        const agencyImg = await cloudinary.uploader.upload(req?.files?.agencyImg[0].path, {
            folder: "agencyImg"
        });

        const passport = await cloudinary.uploader.upload(req?.files?.passport[0].path, {
            folder: "passport"
        });

        const photoId = await cloudinary.uploader.upload(req?.files?.photoId[0].path, {
            folder: "photoId"
        });

        console.log(req.user.Id)
        req.body.status = "requested"
        req.body.owner = req.user._id
        req.body.code = req.user.Id
        req.body.agencyImg = agencyImg.secure_url.split("upload/")[1]
        req.body.passport = passport.secure_url.split("upload/")[1]
        req.body.photoId = photoId.secure_url.split("upload/")[1]
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
                    let: { id: "$owner" },
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
        // const data1 = await AgencySchema.find();
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
        const { name, agencyId } = req.body;
        if (!name || !agencyId)
            return res.status(404).json({
                message: "Agency Name or agencyId not found"
            })
        const agency = await AgencySchema.findOne({ _id: agencyId })
        if (!agency)
            return res.status(404).json({
                message: "Agency not found"
            })
        if (req?.files[0]?.agencyImg) {
            const cloud = await cloudinary.uploader.upload(req.file.path, {
                folder: "agencyImg"
            })
            req.body.agencyImg = cloud.secure_url.split("upload/")[1]
        }
        if (req?.files[0]?.passport) {
            const cloud = await cloudinary.uploader.upload(req.file.path, {
                folder: "passport"
            })
            req.body.passport = cloud.secure_url.split("upload/")[1]
        }
        if (req?.files[0]?.photoId) {
            const cloud = await cloudinary.uploader.upload(req.file.path, {
                folder: "agencyImg"
            })
            req.body.photoId = cloud.secure_url.split("upload/")[1]
        }


        const updated = await AgencySchema.findOneAndUpdate({ _id: agencyId }, req.body, { new: true })
        return res.status(200).json({
            message: "Agency Form updated...!",
            data: updated
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.joinAgency = async (req, res) => {
    try {
        const { agencyCode } = req.body;
        if (!agencyCode) {
            return res.status(400).json({
                message: "agencyCode not found"
            })
        }
        const agency = await AgencySchema.findOne({ code: agencyCode })
        if (!agency) {
            return res.status(404).json({
                message: "Agency not found"
            })
        }
        if (agency.joinedUsers.includes(req.user._id)) {
            return res.status(400).json({
                message: "User already joined agency"
            })
        }
        agency.joinedUsers.push(req.user._id)
        await agency.save();
        return res.status(200).json({
            message: "agency joined successfully"
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.deleteAgency = async (req, res) => {
    try {
        const { agencyId } = req.body;
        console.log(agencyId)
        if (!agencyId) {
            return res.status(400).json({
                message: "agency id not found"
            })
        }
        const checkAgency = await AgencySchema.findByIdAndDelete(agencyId)
        if (!checkAgency) {
            return res.status(404).json({
                message: "agency not found"
            })
        }
        return res.status(200).json({
            message: "Agency deleted successfully"
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.switchAgency = async (req, res) => {
    try {
        const { agencyId, userId, switchAgencyId } = req.body;
        const checkAgency = await AgencySchema.findById(agencyId);
        const switchAgency = await AgencySchema.findById(switchAgencyId);
        if (!checkAgency)
            return res.status(404).json({
                message: "Agency not found"
            })
        if (!switchAgency)
            return res.status(404).json({
                message: "Agency to be switched is not found"
            })
        if (!checkAgency.joinedUsers.includes(userId))
            return res.status(404).json({
                message: "User not found in this agency"
            })
        await checkAgency.joinedUsers.includes(userId).save();
        await switchAgency.joinedUsers.push(userId).save()
        console.log(switchAgency)
        return res.status(200).json({
            message: "user switch to agnecy"
        })

    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}