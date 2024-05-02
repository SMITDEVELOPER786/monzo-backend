const AdminSchema = require("../Model/AdminSchema");
const userValidate = require("../Validator/userValid.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { mail } = require("../Email/nodeMailer.js");
require("dotenv").config();
const secretkey = process.env.secret_key;

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
            if (checkemail.role !== "subAdmin") {
                return res.status(400).json({
                    message: "login as ",
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