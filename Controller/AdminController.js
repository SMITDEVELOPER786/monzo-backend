const AdminSchema = require("../Model/AdminSchema");
const userValidate = require("../Validator/userValid.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { mail } = require("../Email/nodeMailer.js");
const userSchema = require("../Model/userSchema.js");
const UserProfileSchema = require("../Model/UserProfileSchema.js");
const bgImgSchema = require("../Model/bgImgSchema.js");
require("dotenv").config();
const secretkey = process.env.secret_key;

const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});




exports.loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const checkemail = await AdminSchema.findOne({ email });

        if (checkemail) {
            let checkpassword = await bcrypt.compare(password, checkemail.password);

            if (!checkpassword) {
                return res.status(400).json({
                    message: "password incorrect",
                });
            }
            // if (!checkemail.isVerify) {
            //     return res.status(400).json({
            //         message: "Account is not verified. Please verify your account.",
            //     });

            // }
            // if (!checkemail.isCompleteProfile) {
            //     return res.status(400).json({
            //         message: "Please Complete Your Profile First.",
            //     });

            // }
            // else {
            const token = jwt.sign({ userId: checkemail._id }, secretkey, {
                expiresIn: "24h",
            });

            console.log(token);
            return res.status(200).json({
                message: "login Successfully ",
                data: checkemail,
                token: token,
            });
            // }
        } else {
            return res.status(400).json({
                message: "user not found",
            });
        }
    } catch (e) {
        return res.status(400).json({
            message: "Server error",
            error: e.message,
        });
    }
};

exports.loginSubAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const checkemail = await AdminSchema.findOne({ email, role: "subAdmin" });

        if (checkemail) {
            let checkpassword = await bcrypt.compare(password, checkemail.password);

            if (!checkpassword) {
                return res.status(400).json({
                    message: "password incorrect",
                });
            }
            if (checkemail.role !== "subAdmin") {
                return res.status(400).json({
                    message: "login as subAdmin",
                });
            }
            // if (!checkemail.isVerify) {
            //     return res.status(400).json({
            //         message: "Account is not verified. Please verify your account.",
            //     });

            // }
            // if (!checkemail.isCompleteProfile) {
            //     return res.status(400).json({
            //         message: "Please Complete Your Profile First.",
            //     });

            // }
            // else {
            const token = jwt.sign({ userId: checkemail._id }, secretkey, {
                expiresIn: "4h",
            });

            console.log(token);
            return res.status(200).json({
                message: "login Successfully ",
                data: checkemail,
                token: token,
            });
            // }
        } else {
            return res.status(400).json({
                message: "user not found",
            });
        }
    } catch (e) {
        return res.status(400).json({
            message: "Server error",
            error: e.message,
        });
    }
};
// Signup only for SubAdmin
exports.signup = async (req, res) => {
    const { email, password, } = req.body;

    try {
        await userValidate.validateAsync(req.body);

        const checkemail = await AdminSchema.findOne({ email });
        if (checkemail) {
            return res.status(401).json({
                message: "User AlReady Register",
            });
        } else {
            const otp = Math.floor(Math.random() * 9000);

            console.log(otp);
            const hashpassword = await bcrypt.hash(password, 12);

            req.body.password = hashpassword;

            req.body.otp = otp;
            req.body.role = "subAdmin"

            // const userObj = 
            const user = AdminSchema(req.body);

            // const otp = Math.random(Math.floor*900000)

            const token = jwt.sign({ userId: user._id }, secretkey, {
                expiresIn: "2h",
            });

            mail("Your OTP is", otp, email);

            await user.save();
            return res.status(201).json({
                message: "User Created",
                data: user,
                token,
                otp,
            });
        }
    } catch (e) {
        return res.status(400).json({
            message: "Internal Server error",
            error: e.message,
        });
    }
};


// verifyOtp
exports.verifyOtp = async (req, res) => {
    try {
        const { body, headers } = req;
        const { authorization } = headers;
        const { otp } = body;
        const token = authorization && authorization.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "token not provide",
            });
        } else {
            if (otp == undefined) {
                return res.status(401).json({
                    message: "otp not provided",
                });
            } else if (otp.length != 4) {
                return res.status(401).json({
                    message: "Otp must be 4 letter",
                });
            } else {
                console.log(token);
                jwt.verify(token, secretkey, async (err, decode) => {
                    console.log(decode);

                    if (err) {
                        return res.status(401).json({
                            message: "Unauthorized , Invalid Token",
                            data: err.message,
                        });
                    }
                    console.log(decode);
                    req.userid = decode.userId;
                    var userFind = await AdminSchema.findById(req.userid);
                    console.log(userFind);
                    if (userFind.otp == otp) {
                        await AdminSchema.findByIdAndUpdate(req.userid, {
                            isVerify: true,
                            // isVerify:
                        });

                        return res.status(200).json({
                            message: "Otp verified",
                        });
                    } else {
                        return res.status(401).json({
                            message: "invalid otp",
                        });
                    }
                });
            }
        }
    } catch (error) {
        return res.status(401).json({
            message: "Internal Server",
            data: error.message,
        });
    }
};


exports.getAllSubAdmin = async (req, res) => {
    try {
        const data = await AdminSchema.find({ role: "subAdmin" })
        return res.status(200).json({
            data: data,
            status: true,
            length: data.length
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}

// delete sub admin
exports.deleteSubAdmin = async (req, res) => {
    try {
        const subAdminId = req.params.id;
        if (!subAdminId) {
            return res.status(400).json({
                message: "sub admin ID not found"
            })
        }
        const subAdmin = await AdminSchema.findById(subAdminId);

        if (!subAdmin) {
            return res.status(404).json({
                error: "Sub-admin not found"
            });
        }

        if (subAdmin.role !== "subAdmin") {
            return res.status(422).json({
                error: "Invalid sub-admin ID provided"
            });
        }

        await subAdmin.deleteOne({});
        return res.status(200).json({
            message: "Sub admin deleted successfully"
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}

// search by ID 
exports.searchById = async (req, res) => {
    try {
        const { searchId } = req.body;
        if (!searchId) {
            return res.status(200).json({
                message: "enter Id to search User",
            });
        }
        const searchedUser = await userSchema.findOne({ Id: searchId })
        if (!searchedUser) {
            return res.status(200).json({
                message: "User not found",
            });
        }

        return res.status(200).json({
            message: "Searched User",
            data: searchedUser
        })
    } catch (e) {
        return res.status(400).json({
            message: "Internal Server error",
            error: e.message,
        });
    }
};


// edit user Info
exports.editUserInfo = async (req, res) => {

    try {
        const userId = req.params.id;
        console.log(req.params.id);
        // console.log(req.body);

        // if (!userId) {
        //     return res.status(400).json({
        //         message: "Enter Id to edit"
        //     })
        // }
        // "email": "bilal@gmail.com",

        let user = await userSchema.findOne({ _id: userId });
        let userProf = await UserProfileSchema.findOne({ authId: userId });

        // console.log(req?.file)
        const cloud = await cloudinary.uploader.upload(req?.file?.path, {
            folder: 'profileImage', // Set the folder where the image will be stored in Cloudinary
        });

        if (!user || !userProf) {
            return res.status(400).json({
                message: "User Not found"
            })
        }

        user.set(req.body);
        userProf.set({ ...req.body, profileImage: cloud.secure_url.split("upload/")[1], });

        await user.save();
        await userProf.save();
        return res.status(200).json({
            message: "User updated successfully"
        });

    } catch (e) {
        return res.status(400).json({
            message: "Internal Server error",
            error: e.message,
        });
    }
}


exports.logoutAdmin = async (req, res) => {
    try {
        const { headers } = req;
        const { Authorization } = headers;
        const token = Authorization && Authorization.split(" ")[1];

        // Check if token exists
        if (!token) {
            return res.status(401).json({ message: "token not provided" });
        }

        res.status(200).json({ message: "Logged out successfully" });
    } catch (e) {
        return res.status(400).json({
            message: "Internal Server error",
            error: e.message,
        });
    }
}


// upload background
exports.uploadBackground = async (req, res) => {
    try {

        if (!req.file) {
            return res.status(400).json({
                message: "image not found"
            })
        }
        const cloud = await cloudinary.uploader.upload(req.file.path, {
            folder: "bgImg"
        })
        const bgImg = cloud.secure_url.split("upload/")[1];
        // console.log(bgImg)
        const checkBgImg = await bgImgSchema.find({});
        console.log(checkBgImg._id)
        if (checkBgImg.length > 0) {
            // checkBgImg.bgImg = bgImg;
            await bgImgSchema.findByIdAndUpdate({ _id: checkBgImg[0]._id }, { bgImg });
            return res.status(200).json({
                checkBgImg,
                message: "background Image uploaded"
            })
        }
        const data = await bgImgSchema({ bgImg }).save();
        return res.status(200).json({
            data,
            message: "background Image uploaded"
        })
    } catch (e) {
        return res.status(400).json({
            message: "Internal Server error",
            error: e.message,
        });
    }
}

// edit background 
exports.updateBackground = async (req, res) => {
    try {
        const imgId = req.params.id;
        if (!req.file) {
            return res.status(400).json({
                message: "image not found"
            })
        }
        const checkImg = await bgImgSchema.findById({ _id: imgId });
        if (!checkImg) {
            return res.status(400).json({
                message: "background image not found"
            })
        }
        const cloud = await cloudinary.uploader.upload(req.file.path, {
            folder: "bgImg"
        })
        const bgImg = cloud.secure_url.split("upload/")[1];
        console.log(bgImg)
        // Update the document with the new background image URL
        const updatedImg = await bgImgSchema.findByIdAndUpdate(imgId, { bgImg });

        return res.status(200).json({
            updatedImg,
            message: "background Image uploaded"
        })
    } catch (e) {
        return res.status(400).json({
            message: "Internal Server error",
            error: e.message,
        });
    }
}

// admin change info form
exports.changeInfoForm = async (req, res) => {
    try {
        const { username, email, userId } = req.body;
        if (!userId) {
            return res.status(400).json({
                message: "User id is required"
            })
        }
        if (!username) {
            return res.status(400).json({
                message: "User name is required"
            })
        }

        const user = await userSchema.findOneAndUpdate({ Id: userId }, req.body);
        const userProf = await UserProfileSchema.findOneAndUpdate({ authId: user?._id }, req.body);
        // console.log(user, userProf)
        if (!user || !userProf) {
            return res.status(404).json({
                message: "User not found"
            })
        }

        if (req.file) {
            const cloud = await cloudinary.uploader.upload(req.file.path, {
                folder: "profileImage"
            });
            req.body.profileImage = await cloud.secure_url.split("/upload")[1]
        }

        await user.set(req.body);
        await userProf.set(req.body);
        return res.status(200).json({
            message: "User info updated successfully"
        })

    } catch (e) {
        return res.status(400).json({
            message: "Internal Server error",
            error: e.message,
        });
    }
}