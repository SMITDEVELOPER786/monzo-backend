const exp = require("express");
const userValidate = require("../Validator/userValid.js");
const { ProfileValidator } = require("../Validator/userProfileValidate.js");
const userScheema = require("../Model/userSchema.js");
const userprofileSchema = require("../Model/UserProfileSchema.js");
const twilio = require("twilio");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { mail } = require("../Email/nodeMailer.js");
const userSchema = require("../Model/userSchema.js");
const reelsSchema = require('../Model/reelsSchema');

const Followers = require("../Model/Followers.js");
const CustomIdSchema = require("../Model/CustomIdSchema.js");
const AdminSchema = require("../Model/AdminSchema.js");
const SubAdminActivitySchema = require("../Model/SubAdminActivitySchema.js");
// const UserProfileSchema = require("../Model/UserProfileSchema.js");
require("dotenv").config();
const otpStorage = {};

const secretkey = process.env.secret_key;

// const verifySid = "VA38f6ad426d933fd76c8567cb0d73071a";
const accountSid = "AC22b19e84befb3f08053353e2b1421279";
const authToken = "9ab34bcaf36b5664bb1f529a40e60e9c";
const client = new twilio(accountSid, authToken);


const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
// youtube ka sendOtp

exports.sendOtp = async (req, res) => {
  const { mobileNumber } = req.body;

  try {
    //  Generate OTP
    const generateOTP = Math.floor(1000 + Math.random() * 9000);
    const otp = generateOTP;

    // await UserScheema.findOneAndUpdate(
    //   {mobileNumber},
    //   {otp},
    //   {upsert:true,new:true,setDefaultsOnInsert:true}
    // )

    await client.messages.create({
      body: `your otp is ${otp}`,
      to: mobileNumber,
      from: "+12512437208",
    });

    return res.status(200).json({
      otp: otp,
      msg: "otp sent",
    });
  } catch (error) {
    return res.status(400).json({
      e: error.message,
    });
  }
};

// Signup
exports.signup = async (req, res) => {

  const { email, password, country } = req.body;
  try {

    if (!email || !password || !country) {
      return res.status(400).json({
        message: "email , password & country are required"
      })
    }
    console.log(country)
    await userValidate.validateAsync({ email, password });
    if (email === "admin123@yopmail.com") {
      return res.status(400).json({
        message: "sorry this email is reserved"
      })
    }
    const checkemail = await userSchema.findOne({ email });
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
      let count = await userScheema.countDocuments().exec();
      console.log(count);
      const paddedCount = String(count + 1).padStart(6, '0'); // Pad with zeros to ensure 6 digits
      console.log(paddedCount)
      const findId = await CustomIdSchema.findOne({ customId: paddedCount }) // is kam ko check krna hai db reset kr k (saim)
      if (findId) req.body.Id = paddedCount + 1;
      else req.body.Id = paddedCount;

      // const userObj = 
      const user = userScheema(req.body);

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

// // Send OTP
// exports.sendOtp = async (req, res) => {
//   try {
//       const { mobileNumber } = req.body;
// console.log(mobileNumber)
//       // Generate OTP
//       const generateOTP = Math.floor(1000 + Math.random() * 9000);
//       const otp = generateOTP;

//       // Send OTP using Twilio
//       await client.messages.create({
//           body: `Your OTP is: ${otp}`,
//           from:"+19896629967", // Twilio phone number
//           to: "+92"+ mobileNumber
//       });

//       res.status(200).json({ otp: otp, message: 'OTP sent successfully' });
//   } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: error.message });
//   }
// };

// Send OTP
// exports.sendOtp = async (req, res) => {
//   try {
//     const { mobileNumber } = req.body;
//     console.log(mobileNumber);

//     // Generate OTP
//     const generateOTP = Math.floor(1000 + Math.random() * 9000);
//     const otp = generateOTP;

//     // Send OTP using Twilio verify service
//     client.verify.services(verifySid)
//       .verifications
//       .create({ to: `+92${mobileNumber}`, channel: "sms" })
//       .then((verification) => {
//         console.log(verification.status); // Log status of OTP verification
//         res.status(200).json({ otp: otp, message: 'OTP sent successfully' });
//       })
//       .catch((error) => {
//         console.error(error);
//         res.status(500).json({ message: error.message });
//       });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: error.message });
//   }
// };

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
          message: "otp not provide",
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
              message: "unauthorization",
              data: err.message,
            });
          }
          console.log(decode);
          req.userid = decode.userId;
          var userFind = await userScheema.findById(req.userid);
          console.log(userFind);
          if (userFind.otp == otp) {
            await userScheema.findByIdAndUpdate(req.userid, {
              isVerify: true,
              // isVerify:
            });

            return res.status(200).json({
              message: "verify otp ",
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

// Send OTP
// exports.sendOtp = async (req, res) => {
//   try {
//     const { mobileNumber } = req.body;
//     console.log(mobileNumber);

//     // Generate OTP
//     const generateOTP = Math.floor(1000 + Math.random() * 9000);
//     const otp = generateOTP;

//     // Send OTP using Twilio verify service
//     client.verify.v2.services(verifySid)
//       .verifications
//       .create({ to: `+92${mobileNumber}`, channel: "sms" })
//       .then((verification) => {
//         console.log(verification.status); // Log status of OTP verification
//         res.status(200).json({ otp: otp, message: 'OTP sent successfully' });
//       })
//       .catch((error) => {
//         console.error(error);
//         res.status(500).json({ message: error.message });
//       });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: error.message });
//   }
// };

// verifyOtp
// exports.verifyOtp = async (req, res) => {
//   try {
//     const { body, headers } = req;
//     const { authorization } = headers;
//     const { otp } = body;
//     const token = authorization && authorization.split(" ")[1];

//     if (!token) {
//       return res.status(401).json({
//         message: "token not provide",
//       });
//     } else {
//       if (otp == undefined) {
//         return res.status(401).json({
//           message: "otp not provide",
//         });
//       } else if (otp.length != 6) {
//         return res.status(401).json({
//           message: "Otp must be 6 letter",
//         });
//       } else {
//         console.log(token);
//         jwt.verify(token, secretkey, async (err, decode) => {
//           console.log(decode);

//           if (err) {
//             return res.status(401).json({
//               message: "unauthorization",
//               data: err.message,
//             });
//           }
//           // console.log(decode);
//           req.userid = decode.userId;
//           var userFind = await UserScheema.findById(req.userId);
//           console.log(userFind);
//           // if (userFind.otp == otp) {
//           //   await UserScheema.findByIdAndUpdate(req.userid, {
//           //     isVerify: true,
//           //     // isVerify:
//           //   });

//           //   return res.status(200).json({
//           //     message: "verify otp ",
//           //   });
//           // } else {
//           //   return res.status(401).json({
//           //     message: "invalid otp",
//           //   });
//           // }
//         });
//       }
//     }
//   } catch (error) {
//     return res.status(401).json({
//       message: "Internal Server",
//       data: error.message,
//     });
//   }
// };

// login

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const checkemail = await userScheema.findOne({ email });

    if (checkemail) {
      let checkpassword = await bcrypt.compare(password, checkemail.password);

      if (!checkpassword) {
        return res.status(400).json({
          message: "password incroect",
        });
      }
      if (!checkemail.isVerify) {
        return res.status(400).json({
          message: "Account is not verified. Please verify your account.",
        });

      }
      if (!checkemail.isCompleteProfile) {
        return res.status(400).json({
          message: "Please Complete Your Profile First.",
        });

      }
      else {
        const token = jwt.sign({ userId: checkemail._id }, secretkey, {
          expiresIn: "4h",
        });

        console.log(token);
        return res.status(200).json({
          message: "login Successfully ",
          data: checkemail,
          token: token,
        });
      }
    } else {
      return res.status(400).json({
        message: "user not fount",
      });
    }
  } catch (e) {
    return res.status(400).json({
      message: "Server error",
      error: e.message,
    });
  }
};

// forgotPassword
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (email) {
    try {

      let ckeckUser = await userSchema.findOne({ email });
      if (ckeckUser == null) {
        return res.status(401).json({ message: "Email Not found" });
      }

      const otp = Math.floor(Math.random() * 9000);

      ckeckUser.otp = otp

      const data = await ckeckUser.save(); // Update the user's OTP
      console.log("data", data)
      mail("Your OTP is", otp, email);

      return res.status(200).json({ message: "OTP Send Your Mail", otp });
    }
    catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to update password" });
    }
  } else {
    return res.status(401).json({ message: "Enter Email Address" });
  }
};
exports.VerifyForgetOTP = async (req, res) => {
  try {
    const { otp } = req.body;

    if (otp == undefined) {
      return res.status(401).json({
        message: "otp not provide",
      });
    } else if (otp.length != 4) {
      return res.status(401).json({
        message: "Otp must be 4 letter",
      });
    } else {

      var userFind = await userScheema.findOne({ otp: otp });
      // console.log(userFind);
      if (userFind.otp == otp) {
        // await userScheema.findByIdAndUpdate(req.userid, {
        //   isVerify: true,
        //   // isVerify:
        // });
        const token = jwt.sign({ userId: userFind._id }, secretkey, {
          expiresIn: "4h",
        });
        return res.status(200).json({
          message: "OTP verified",
          status: true,
          token
        });
      } else {
        return res.status(401).json({
          message: "invalid otp",
        });
      }

    }

  } catch (error) {
    return res.status(401).json({
      message: "Internal Server",
      data: error.message,
    });
  }
}
// PasswordOtpVerify
exports.PasswordOtpVerify = async (req, res) => {
  const { newPassword } = req.body;

  const id = req.user._id


  if (newPassword) {



    try {
      const user = await userSchema.findOne({ _id: id.toString() });

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      // hash password
      const hashpassword = await bcrypt.hash(newPassword, 12);

      // Update password field directly
      user.password = hashpassword;
      await user.save();

      return res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to update password" });
    }
  } else {
    return res.status(401).json({ message: "Please Enter New Password" });
  }
};

// completeProfile
exports.completeProfile = async (req, res) => {
  const { body } = req;

  try {


    req.userId = req.user._id;

    const user = await userSchema.findById(req.userId);

    if (user && user.isCompleteProfile === false) {
      await ProfileValidator.validateAsync(body);

      if (req.file) {
        body.profileImage = req.file.path;
      } else {
        return res.status(400).json({
          message: "Profile image file not provided",
        });
      }

      const cloud = await cloudinary.uploader.upload(req.file.path, {
        folder: 'profileImage', // Set the folder where the image will be stored in Cloudinary
      });

      // Now you can use result.secure_url to access the uploaded image URL
      // console.log("Cloudinary response:", cloud);
      // console.log(cloud.secure_url.split("upload/")[1]);
      let obj = {
        username: body.username,
        dateOfBirth: body.dateOfBirth,
        gender: body.gender,
        profileImage: cloud.secure_url.split("upload/")[1],
        favBroadcaster: body.favBroadcaster,
        authId: req.userId,
      };

      let userProfile = new userprofileSchema(obj);
      await userProfile.save();

      await userSchema.findByIdAndUpdate(req.userId, {
        isCompleteProfile: true,
        profileId: userProfile._id, // assuming you want to link UserProfile to User
      });

      return res.status(200).json({
        message: "Profile updated",
        data: userProfile, // if you want to send updated profile data back
      });
    } else {
      return res.status(200).json({
        message: "Profile already completed",
      });
    }


  } catch (e) {
    return res.status(500).json({
      message: "Server error",
      error: e,
    });
  }
};

// POST request to logout
exports.Logout = async (req, res) => {
  const { body, headers } = req;
  const { authorization } = headers;
  const token = authorization && authorization.split(" ")[1];

  // Check if token exists
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  res.json({ message: "Logged out successfully" });
};

exports.Myprofile = async (req, res) => {

  req.authId = req.user._id; // Assuming this is the correct key
  var data = req.authId;
  try {
    var profileData = await userprofileSchema.findOne({ authId: req.authId });
    var authData = await userScheema.findOne({ _id: req.authId });

    return res.status(200).json({ profileData, authData });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({
        message: "Failed to fetch user profile",
        err: error.message,
      });
  }

};

exports.getAllUser = async (req, res) => {

  try {

    // const user = await userSchema.aggregate([
    //   {
    //     $match: {} // Match all documents in the userSchema collection
    //   },
    //   {
    //     $lookup: {
    //       from: "userprofiles",
    //       let: { id: "$_id" },
    //       pipeline: [
    //         {
    //           $match: {
    //             $expr: { $eq: ["$authId", "$$id"] }
    //           }
    //         }
    //       ],
    //       as: "UserProf"
    //     }
    //   },
    //   {
    //     $addFields: {
    //       hasProfile: { $gt: [{ $size: "$UserProf" }, 0] }
    //     }
    //   },
    //   {
    //     $match: {
    //       hasProfile: true // Only include documents where hasProfile is true
    //     }
    //   },
    //   {
      //   $lookup: {
      //     from: "users",
      //     let: { id: "$_id" },
      //     pipeline: [
      //       {
      //         $match: {
      //           $expr: { $eq: ["$_id", "$$id"] }
      //         }
      //       }
      //     ],
      //     as: "User"
      //   }
      // },
    //   {
    //     $addFields: {
    //       User: {
    //         $cond: {
    //           if: "$hasProfile",
    //           then: "$User",
    //           else: []
    //         }
    //       }
    //     }
    //   },
    //   {
    // $project: {
    //   isBan: { $arrayElemAt: ["$UserProf.isBan", 0] },
    //   banDuration: { $arrayElemAt: ["$UserProf.banDuration", 0] },
    //   isLevel: { $arrayElemAt: ["$User.isLevel", 0] },
    //   isReseller: { $arrayElemAt: ["$User.isReseller", 0] },
    //   username: { $arrayElemAt: ["$UserProf.username", 0] },
    //   dateOfBirth: { $arrayElemAt: ["$UserProf.dateOfBirth", 0] },
    //   profileImage: { $arrayElemAt: ["$UserProf.profileImage", 0] },
    //   gender: { $arrayElemAt: ["$UserProf.gender", 0] },
    //   isBlocked: { $arrayElemAt: ["$UserProf.isBlocked", 0] },
    //   Id: { $arrayElemAt: ["$User.Id", 0] }
    // }
    //   }
    // ]);

    const user = await userSchema.aggregate([
      { $match: {} },
      {
        $lookup: {
          let: { id: "$_id" },
          from: "userprofiles",
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: { $eq: ["$authId", "$$id"] }
                }
              },
            }
          ],
          as: "UserProf"
        }
      },
      {
        $addFields: {
          hasProfile: { $gt: [{ $size: "$UserProf" }, 0] } // userProf is not empty or "0"
        }
      },
      {
        $match: { hasProfile: true }
      },
      {
        $lookup: {
          let: { id: "$_id" },
          from: "users",
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: { $eq: ["$_id", "$$id"] }
                }
              }
            }
          ],
          as: "User"
        }
      },
      {
        $addFields: {
          User: {
            $cond: {
              if: "$hasProfile",
              then: "$User",
              else: []
            }
          }
        }
      },
      {
        $project: {
          isBan: { $arrayElemAt: ["$UserProf.isBan", 0] },
          banDuration: { $arrayElemAt: ["$UserProf.banDuration", 0] },
          isLevel: { $arrayElemAt: ["$User.isLevel", 0] },
          isReseller: { $arrayElemAt: ["$User.isReseller", 0] },
          username: { $arrayElemAt: ["$UserProf.username", 0] },
          dateOfBirth: { $arrayElemAt: ["$UserProf.dateOfBirth", 0] },
          profileImage: { $arrayElemAt: ["$UserProf.profileImage", 0] },
          gender: { $arrayElemAt: ["$UserProf.gender", 0] },
          isBlocked: { $arrayElemAt: ["$UserProf.isBlocked", 0] },
          Id: { $arrayElemAt: ["$User.Id", 0] }
        }
      }
    ])


    if (user) {
      return res.status(200).json({
        message: "user all users",
        data: user,
        length: user.length
      });
    }
  } catch (e) {
    console.error("Error:", e);
    return res.status(500).json({
      message: "Internal server error",
      error: e.message,
    });
  }



};











// exports.Follow = async (req, res) => {
//   try {
//     const { body } = req;




//     // Token valid hai, decoded mein user ki information hogi
//     const { followerId } = body;
//     const userId = req.user._id

//     // User profile ko retrieve karna
//     const user = await userSchema.findById(userId).populate("ProfileId");

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Follower profile ko retrieve karna
//     const follower = await userprofileSchema.findById(followerId);
//     if (!follower) {
//       return res.status(404).json({ message: "Follower not found" });
//     }

//     // Check karein ki user pehle se follow kar raha hai ya nahi
//     if (follower.followers.includes(userId)) {
//       return res
//         .status(400)
//         .json({ message: "You are already following this user" });
//     }

//     // User profile aur follower profile ko update karna
//     const followerUpdate = await userprofileSchema.findByIdAndUpdate(
//       followerId,
//       { $push: { followers: userId } },
//       { new: true }
//     );

//     const userUpdate = await userprofileSchema.findByIdAndUpdate(
//       user.ProfileId._id,
//       { $push: { following: followerId } },
//       { new: true }
//     );

//     res
//       .status(200)
//       .json({
//         message: "You are now following this user",
//         followerUpdate,
//         userUpdate,
//       });
//   } catch (error) {
//     return res.status(500).json({ message: "Internal Server Error" ,e:error.message});
//   }
// };

// exports.unFollow = async (req, res) => {
//   try {
//     const { body} = req;



//     // Token ko verify karna


//     // Token valid hai, decoded mein user ki information hogi
//     const { followerId } = body;
//     const userId = req.user._id;

//     // User profile ko retrieve karna
//     const user = await userSchema.findById(userId).populate("ProfileId");

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Follower profile ko retrieve karna
//     const follower = await userprofileSchema.findById(followerId);
//     if (!follower) {
//       return res.status(404).json({ message: "Follower not found" });
//     }

//     if (follower.followers.includes(userId)) {
//       return res
//         .status(400)
//         .json({ message: "You are already following this user" });
//     }

//     // Check karein ki user pehle se follow kar raha hai ya nahi
//     // if (follower.followers.includes(userId)) {
//     //   return res.status(400).json({ message: "You are already following this user" });
//     // }

//     // User profile aur follower profile ko update karna
//     const followerUpdate = await userprofileSchema.findByIdAndUpdate(
//       followerId,
//       { $pull: { followers: userId } },
//       { new: true }
//     );

//     const userUpdate = await userprofileSchema.findByIdAndUpdate(
//       user.ProfileId._id,
//       { $pull: { following: followerId } },
//       { new: true }
//     );

//     res
//       .status(200)
//       .json({
//         message: "You are now unfollowing this user",
//         followerUpdate,
//         userUpdate,
//       });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// };








//SearchUser
exports.SearchUser = async (req, res) => {
  try {
    const { name } = req.body; // Assuming query parameter name is used

    console.log(name);
    // const data = await userprofileSchema.find({
    //   $or: [
    //     {
    //       username: {
    //         $regex: new RegExp(name, "i"), // Case-insensitive search
    //       },
    //     },
    //   ],
    // });


    var data = await userprofileSchema.aggregate([
      {
        $match: {
          $or: [
            {
              username: {
                $regex: new RegExp(name, "i"), // Case-insensitive search
              },
            },
            // You can add more conditions here for the aggregation pipeline
          ],
        }
      },
      {
        $lookup: {
          from: "users",
          let: { id: "$authId" },
          pipeline: [{
            $match: {
              $expr: {
                $and: { $eq: ["$_id", "$$id"] }
              }
            }
          },
          ],
          as: "User"
        }
      },
      {
        $lookup: {
          from: "userprofiles",
          let: { id: "$_id" },
          pipeline: [{
            $match: {
              $expr: {
                $and: { $eq: ["$_id", "$$id"] }
              }
            }
          },
          ],
          as: "UserProf"
        }
      },
      {
        $project: {
          isBan: { $arrayElemAt: ["$UserProf.isBan", 0] },
          banDuration: { $arrayElemAt: ["$UserProf.banDuration", 0] },
          isLevel: { $arrayElemAt: ["$User.isLevel", 0] },
          username: { $arrayElemAt: ["$UserProf.username", 0] },
          dateOfBirth: { $arrayElemAt: ["$UserProf.dateOfBirth", 0] },
          profileImage: { $arrayElemAt: ["$UserProf.profileImage", 0] },
          gender: { $arrayElemAt: ["$UserProf.gender", 0] },
          isBlocked: { $arrayElemAt: ["$UserProf.isBlocked", 0] },
          Id: { $arrayElemAt: ["$User.Id", 0] },
          // username: { $arrayElemAt: ["$UserProf.username", 0] },
        }
      }
    ]);


    // console.log(data);
    return res.status(200).json({
      data,
      length: data.length
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// search user by ID
exports.searchByID = async (req, res) => {
  try {
    const { id } = req.body
    var data = await userSchema.aggregate([
      {

        $match: {
          $or: [
            {
              Id: {
                $regex: new RegExp(id, "i"), // Case-insensitive search
              },
            },
            // You can add more conditions here for the aggregation pipeline
          ],
        }

      },
      {
        $lookup: {
          from: "users",
          let: { id: "$_id" },
          pipeline: [{
            $match: {
              $expr: {
                $and: { $eq: ["$_id", "$$id"] }
              }
            }
          },
          ],
          as: "User"
        }
      },
      {
        $lookup: {
          from: "userprofiles",
          let: { id: "$_id" },
          pipeline: [{
            $match: {
              $expr: {
                $and: { $eq: ["$authId", "$$id"] }
              }
            }
          },
          ],
          as: "UserProf"
        }
      },
      {
        $project: {
          isBan: { $arrayElemAt: ["$UserProf.isBan", 0] },
          banDuration: { $arrayElemAt: ["$UserProf.banDuration", 0] },
          isLevel: { $arrayElemAt: ["$User.isLevel", 0] },
          username: { $arrayElemAt: ["$UserProf.username", 0] },
          dateOfBirth: { $arrayElemAt: ["$UserProf.dateOfBirth", 0] },
          profileImage: { $arrayElemAt: ["$UserProf.profileImage", 0] },
          gender: { $arrayElemAt: ["$UserProf.gender", 0] },
          isBlocked: { $arrayElemAt: ["$UserProf.isBlocked", 0] },
          Id: { $arrayElemAt: ["$User.Id", 0] },
          // username: { $arrayElemAt: ["$UserProf.username", 0] },
        }
      }
    ]);

    return res.status(200).json({
      data
    })

  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
}

// Edit Profile
exports.editprofile = async (req, res) => {
  try {
    const { body } = req;

    req.userId = req.user._id;
    // console.log(req.userId);

    const user = await userSchema.findById(req.userId);
    // console.log(user)
    if (user && user.isCompleteProfile === true) {
      // Check if user's profile is already complete
      if (req.file) {
        body.profileImage = req.file.path;
      }
      const cloud = await cloudinary.uploader.upload(req.file.path, {
        folder: 'profileImage', // Set the folder where the image will be stored in Cloudinary
      });
      // console.log(cloud)
      let updateFields = {
        username: body.username || user.username,
        dateOfBirth: body.dateOfBirth || user.dateOfBirth,
        gender: body.gender || user.gender,
        favBroadcaster: body.favBroadcaster || user.favBroadcaster,
        profileImage: cloud.secure_url.split("upload/")[1],
        bio: body.bio || user.bio,
      };

      // if (req.file) {
      //   updateFields.profileImage = body.profileImage;
      // }

      await userprofileSchema.findOneAndUpdate(
        { authId: req.userId },
        updateFields
      );

      return res.status(200).json({
        message: "Profile updated",
        data: updateFields,
      });
    } else {
      return res.status(400).json({
        message: "Profile is not completed yet",
      });
    }


  } catch (e) {
    return res.status(500).json({
      message: "Server error",
      error: e.message,
    });
  }
};

// Block User
exports.banUser = async (req, res) => {
  try {
    const { userId, banDuration } = req.body
    if (!userId) {
      return res.status(400).json({
        message: "userId is required"
      })
    }
    if (!banDuration) {
      return res.status(400).json({
        message: "ban duration is required"
      })
    }

    const user = await userprofileSchema.findOne({ authId: userId });
    // const user = await userSchema.findById({ _id: userId });
    if (!user) {
      return res.status(400).json({
        message: "user not found"
      })
    }
    // const findSubAdmin = await AdminSchema.findById(req.user._id);

    if (user.isBan === false) {

      user.isBan = true;
      user.banDuration = banDuration;
      await user.save();
      // ------ add for sub-admin activity ---------

      await SubAdminActivitySchema({
        subAdminId: req.user._id,
        performedAction: "ban User",
        userId: userId,
      }).save();

      return res.status(200).json({
        success: true,
        message: "User Blocked Successfully",
      });

    }

    user.banDuration = banDuration;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User Block duration updated to ${banDuration}`,
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// unBanUser User
exports.unBanUser = async (req, res) => {
  try {
    const { userId } = req.body
    if (!userId) {
      return res.status(400).json({
        message: "userId is required"
      })
    }
    const user = await userprofileSchema.findOne({ authId: userId });
    // const user = await userSchema.findById({ _id: userId });
    if (!user) {
      return res.status(400).json({
        message: "user not found"
      })
    }

    if (user.isBan === true) {

      user.isBan = false;
      user.banDuration = null;
      // user.banDuration = null;
      await user.save();

      return res.status(200).json({
        success: true,
        message: "User Unblocked Successfully",
      });
    }

    return res.status(400).json({
      message: "user already Unblocked"
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// changeBan User
// exports.changeBanUser = async (req, res) => {
//   try {
//     const { banDuration, userId } = req.body;
//     if (!userId) {
//       return res.status(400).json({
//         message: "userId is required"
//       })
//     }
//     if (!banDuration) {
//       return res.status(400).json({
//         message: "ban duration is required"
//       })
//     }

//     const user = await userprofileSchema.findOne({ authId: userId });
//     // const user = await userSchema.findById({ _id: userId });
//     if (!user) {
//       return res.status(400).json({
//         message: "user not found"
//       })
//     }
//     if (user.isBan === false) {
//       return res.status(200).json({
//         success: true,
//         message: "User is Unblocked..! block it first ",
//       });
//     }
//     user.banDuration = banDuration;
//     await user.save();

//     return res.status(200).json({
//       success: true,
//       message: `User Block duration updated to ${banDuration}`,
//     });


//   } catch (err) {
//     return res.status(500).json({
//       message: err.message,
//       status: false
//     })
//   }
// }

exports.getFollowersUsers = async (req, res) => {
  try {

    const data = await userSchema.aggregate([
      {
        $lookup: {
          // from: "followings",
          from: "followers",
          localField: "_id",
          // foreignField: "following",
          foreignField: "follower",
          as: "followers"
        }
      },
      {
        $addFields: {
          followerCount: { $size: "$followers" }
        }
      }
    ]);

    return res.status(200).json({
      data: data,
      status: true,

    })
  } catch (err) {
    return res.status(500).json({
      message: err.message,
      status: false
    })
  }
}

exports.getAllBroadCasters = async (req, res) => {
  try {
    // console.log("boradcaster")
    // const Users = await userScheema.find();
    // const data = await Promise.all(Users.map(async (user) => {
    //   // console.log("user", user);
    //   const follower = await Followers.find({ follower: user._id });
    //   return { user, follower: follower?.length };
    // }));

    // // Sort the data array based on followerCount in descending order
    // data.sort((a, b) => b.followerCount - a.followerCount);

    // // Get the top 9 users
    // const topUsers = data.slice(0, 9);
    // console.log("topUsers", topUsers)

    // const data = await userSchema.aggregate([
    //   {
    //     $lookup: {
    //       from: "followers",
    //       localField: "_id",
    //       foreignField: "follower",
    //       as: "followers"
    //     }
    //   },
    //   {
    //     $lookup: {
    //       from: "userprofiles",
    //       localField: "_id",
    //       foreignField: "authId",
    //       as: "User"
    //     }
    //   },
    //   {
    //     $addFields: {
    //       followers: { $size: "$followers" },
    //       // username: "$User.username"
    //     }
    //   },
    //   {
    //     $project: {
    //       email: 1,
    //       followers: 1,
    //       name: { $arrayElemAt: ["$User.username", 0] }, // Extract name from the array
    //       // userId: { $arrayElemAt: ["$User.authId", 0] }, // Extract userId from the array
    //       profileImage: { $arrayElemAt: ["$User.profileImage", 0] }, // Extract profileImage from the array

    //       _id: 1 // Exclude the _id field if you don't need it,
    //     }
    //   },
    //   {
    //     $sort: { followers: -1 }
    //   },
    //   {
    //     $limit: 9
    //   }
    // ]);

    let data = await userSchema.aggregate([
      { $match: {} },
      {
        $lookup: {
          from: "followers",
          let: { id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$follower", "$$id"]
                }
              }
            }
          ],
          as: "followers"
        }
      },
      {
        $lookup: {
          from: "userprofiles",
          let: { id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$authId", "$$id"]
                }
              }
            },
            { $project: { username: 1, profileImage: 1, _id: 0 } }
          ],
          as: "User"
        }
      },
      {
        $addFields: {
          followers: { $size: "$followers" }
        }
      },
      {
        $project: {
          email: 1,
          followers: 1,
          name: { $arrayElemAt: ["$User.username", 0] },
          profileImage: { $arrayElemAt: ["$User.profileImage", 0] },
          _id: 1
        }
      },
      { $sort: { followers: -1 } },
      { $limit: 9 }
    ])



    return res.status(200).json({
      data: data,
      status: true
    })
  } catch (err) {
    return res.status(500).json({
      message: err.message,
      status: false
    })
  }
}

exports.levelUpUser = async (req, res) => {
  try {

    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({
        message: "User Id required"
      })
    }
    const user = await userScheema.findById({ _id: userId })

    if (!user) {
      return res.status(400).json({
        message: "User not found"
      })
    }
    user.isLevel += 1;
    await user.save()
    return res.status(200).json({
      message: `user leveled up to ${user.isLevel}`
    })

  } catch (err) {
    return res.status(500).json({
      message: err.message,
      status: false
    })
  }
}

exports.levelDownUser = async (req, res) => {
  try {

    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({
        message: "User Id required"
      })
    }
    const user = await userScheema.findById({ _id: userId })

    if (!user) {
      return res.status(400).json({
        message: "User not found"
      })
    }
    console.log(user.isLevel)
    if (user.isLevel < 1) {
      return res.status(400).json({
        message: `User already at ${user.isLevel}`,
      })
    }
    user.isLevel -= 1;
    await user.save()
    return res.status(200).json({
      message: `user level down to ${user.isLevel}`
    })

  } catch (err) {
    return res.status(500).json({
      message: err.message,
      status: false
    })
  }
}

exports.makeUserReseller = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await userSchema.findById({ _id: userId });
    if (!user)
      return res.status(404).json({
        message: "user not found"
      });
    user.isReseller = true;
    await user.save();
    return res.status(200).json({
      message: "User updated to reseller successfully"
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
      status: false
    })
  }
}