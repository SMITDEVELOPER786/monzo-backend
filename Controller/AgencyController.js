const { default: mongoose } = require("mongoose");
const AgencySchema = require("../Model/AgencySchema");
const userSchema = require("../Model/userSchema");

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
        if (AgencySchema.findById(req.user._id)) {
            return res.status(400).json({
                message: "You already have an Agency"
            })
        }
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

exports.getUsersInAgency = async (req, res) => {
    try {
        const data = await AgencySchema.aggregate([
            { $match: {} },
            {
                $lookup: {
                    from: "users", // The collection to join with
                    localField: "joinedUsers", // The field from the agencySchema
                    foreignField: "_id", // The field from the userSchema
                    as: "users",
                }
            },
            {
                $unwind: "$users" // If you want to have one user per document (optional)
            },

        ])

        return res.status(200).json({
            data: data,
            length: data.length
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

exports.joinAgencyRequest = async (req, res) => {
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
        if (agency.status === "requested") {
            return res.status(404).json({
                message: "Agency is not accepted"
            })
        }
        if (agency.owner === req.user._id) {
            return res.status(404).json({
                message: "Owner can't join own agency"
            })
        }
        if (agency.joinedUsers.includes(req.user._id)) {
            return res.status(400).json({
                message: "User already joined agency"
            })
        }
        if (agency.joinedUsersRequest.some((user) => user.userId.toString() === req.user._id.toString())) {
            return res.status(400).json({
                message: "User already requested to join agency"
            })
        }
        agency.joinedUsersRequest.push({ userId: req.user._id })
        await agency.save();
        return res.status(200).json({
            message: "Agency join request sent to Agengy Owner"
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.getJoinAgencyRequest = async (req, res) => {
    try {
        // Find the agency and populate the joinedUsersRequest.userId with name and email from User collection
        const agency = await AgencySchema.aggregate([
            {
                $match: {
                    owner: new mongoose.Types.ObjectId("666098919f53278e47ece745")
                    // owner: new mongoose.Types.ObjectId(req.user._id) 
                }
            },
            // Lookup to join with User collection
            {
                $lookup: {
                    from: 'users', // The name of the User collection
                    localField: 'joinedUsersRequest.userId', // Field in Agency to match
                    foreignField: '_id', // Field in User collection to match
                    as: 'userDetails' // Alias for the joined data
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    email: 1,
                    phone: 1,
                    code: 1,
                    status: 1,
                    // userEmail: '$userDetails.email',
                    // userId: '$userDetails.Id',
                    joinedUsersRequest: {
                        $map: {
                            input: "$joinedUsersRequest",
                            as: "request",
                            in: {
                                _id: "$$request._id",
                                userId: "$$request.userId",
                                status: "$$request.status",
                                createdAt: "$$request.createdAt",
                                userDetails: {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: "$userDetails",
                                                as: "userDetail",
                                                cond: {
                                                    $eq: ["$$userDetail._id", "$$request.userId"]
                                                }

                                            }
                                        },
                                        0
                                    ]
                                }
                            }

                        }
                    },
                }
            }, {
                $project: {
                    _id: 1,
                    name: 1,
                    email: 1,
                    phone: 1,
                    code: 1,
                    status: 1,
                    joinedUsersRequest: {
                        $map: {
                            input: "$joinedUsersRequest",
                            as: "request",
                            in: {
                                _id: "$$request._id",
                                userId: "$$request.userId",
                                status: "$$request.status",
                                createdAt: "$$request.createdAt",
                                Id: "$$request.userDetails.Id",
                                userEmail: "$$request.userDetails.email"
                            }
                        }
                    }
                }
            }
        ])

        // console.log(agency.length)
        if (agency.length === 0) {
            return res.status(404).json({
                message: "Agency not found"
            });
        }

        return res.status(200).json({
            message: "Requests fetched successfully",
            data: agency // The agency document with populated user data
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

exports.RespondAgencyJoinRequest = async (req, res) => {
    try {
        const { agencyCode, status, userId } = req.body;
        if (!agencyCode || !status) {
            return res.status(400).json({
                message: "agencyCode or status not found"
            })
        }
        const agency = await AgencySchema.findOne({ code: agencyCode })
        if (!agency) {
            return res.status(404).json({
                message: "Agency not found"
            })
        }
        // if (agency.owner.toString() !== req.user._id.toString()) {
        //     return res.status(400).json({
        //         message: "You are not owner to agency"
        //     })
        // }

        const filterUserIndex = agency.joinedUsersRequest.findIndex((user) => user.userId.toString() === req.user._id.toString())
        console.log("filterUser", filterUserIndex)
        if (filterUserIndex === -1) {
            return res.status(400).json({
                message: "User request not found"
            })
        }
        if (agency.joinedUsersRequest[filterUserIndex].status !== "Pending") {
            return res.status(400).json({
                message: "User request already responded"
            })
        }

        req.body.status === "Approved" && (agency.joinedUsersRequest[filterUserIndex].status = req.body.status);

        console.log("filterUserIndex", filterUserIndex)
        req.body.status === "Rejected" && agency.joinedUsersRequest.splice(filterUserIndex, 1);

        req.body.status === "Approved" && agency.joinedUsers.push(req.user._id);
        console.log(agency)

        await agency.save();
        // console.log(updateAgency)
        return res.status(200).json({
            message: "User request responded successfully"
        })


    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.removeUserAgency = async (req, res) => {
    try {
        const { userId, agencyCode } = req.body;
        if (!userId || !agencyCode) {
            return res.status(400).json({
                message: "User Id or Agency Code not found"
            })
        }
        const checkAgency = await AgencySchema.findOne({ code: agencyCode });
        if (!checkAgency) {
            return res.status(404).json({
                message: "Agency not found"
            })
        }
        const user = await userSchema.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            })
        }
        if (!checkAgency.joinedUsers.includes(userId)) {
            return res.status(400).json({
                message: "User is not present in agency"
            })
        }
        console.log(userId)
        await AgencySchema.findOneAndUpdate({ _id: checkAgency._id },
            {
                $pull: {
                    joinedUsers: userId,
                    joinedUsersRequest: { userId }

                }
            });
        return res.status(200).json({
            message: "User removed successfully"
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
        const { agencyId, switchAgencyId } = req.body;
        if (!agencyId) {
            return res.status(400).json({
                message: "agency id not found"
            })
        }
        if (!switchAgencyId) {
            return res.status(400).json({
                message: "switch agency id not found"
            })
        }
        if (switchAgencyId === agencyId) {
            return res.status(400).json({
                message: "Switch agency ID OR agency ID cannot be the same"
            })
        }

        const checkAgency = await AgencySchema.findById(agencyId);
        const switchAgency = await AgencySchema.findById(switchAgencyId);
        if (!checkAgency)
            return res.status(404).json({
                message: "Agency not found"
            })
        if (!checkAgency.joinedUsers.includes(req.user._id))
            return res.status(404).json({
                message: "User not found in this agency"
            })
        if (!switchAgency)
            return res.status(404).json({
                message: "Agency to be switched is not found"
            })
        // Remove user from the current agency
        await AgencySchema.updateOne(
            { _id: agencyId },
            { $pull: { joinedUsers: req.user._id } }
        );

        // Add user to the new agency
        await AgencySchema.updateOne(
            { _id: switchAgencyId },
            { $push: { joinedUsers: req.user._id } }
        );
        // console.log(switchAgency)
        return res.status(200).json({
            message: `user switched to agnecy ${switchAgency.name}`
        })

    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}