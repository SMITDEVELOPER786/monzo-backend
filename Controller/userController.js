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
const Followers = require("../Model/Followers.js");
require("dotenv").config();
const otpStorage = {};

const secretkey = process.env.secret_key;

// const verifySid = "VA38f6ad426d933fd76c8567cb0d73071a";
const accountSid = "AC22b19e84befb3f08053353e2b1421279";
const authToken = "9ab34bcaf36b5664bb1f529a40e60e9c";
const client = new twilio(accountSid, authToken);

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
  const { email, password } = req.body;

  try {
    await userValidate.validateAsync(req.body);

    const checkemail = await userScheema.findOne({ email });
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

      const user = userScheema(req.body);

      // const otp = Math.random(Math.floor*900000)

      const token = jwt.sign({ userId: user._id }, secretkey, {
        expiresIn: "2h",
      });

      mail("Your OTP is", otp, email);

      await user.save();
      return res.status(201).json({
        message: "create user",
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
      } else {
        const token = jwt.sign({ userId: checkemail._id }, secretkey, {
          expiresIn: "4h",
        });

        console.log(token);
        return res.status(201).json({
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
    let ckeckUser = await userSchema.findOne({ email });
    if (ckeckUser == null) {
      return res.status(401).json({ message: "Invalid Email Address" });
    }

console.log(ckeckUser)




    const otp = Math.floor(Math.random() * 9000);

 ckeckUser.otp =otp

 await ckeckUser.save(); // Update karein



    mail("Your OTP is", otp, email);

    return res.status(200).json({ message: "OTP Send Your Mail", otp });
  } else {
    return res.status(401).json({ message: "Enter Email Address" });
  }
};

// PasswordOtpVerify
exports.PasswordOtpVerify = async (req, res) => {
  const {  newPassword } = req.body;

  const id = req.user._id;


  if (newPassword) {
    try {
      const user = await userSchema.findOne({id});

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
    return res.status(401).json({ message: "Enter all data" });
  }
};

// completeProfile
exports.completeProfile = async (req, res) => {
  const { body} = req;


  try {


        req.userId = req.user._id;
        console.log(req.userid);
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

          let obj = {
            username: body.username,
            dateOfBirth: body.dateOfBirth,
            gender: body.gender,
            profileImage: body.profileImage,
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
      
  ;
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

          return res.status(200).json({profileData,authData});
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
  
  var user = await userprofileSchema.find();


  
    if (user) {
      return res.status(200).json({
        message: "user all users",
        data: user
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
    const searchTerm = req.body.name; // Assuming query parameter name is used

    console.log(searchTerm);
    const data = await userprofileSchema.find({
      $or: [
        {
          username: {
            $regex: new RegExp(searchTerm, "i"), // Case-insensitive search
          },
        },
      ],
    });

    console.log(data);
    return res.status(200).json({
      data,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Edit Profile
exports.editprofile = async (req, res) => {
  const { body} = req;


  try {
 

    
        req.userId = req.user._id;
        console.log(req.userId);

        const user = await userSchema.findById(req.userId);

        if (user && user.isCompleteProfile === true) {
          // Check if user's profile is already complete
          if (req.file) {
            body.profileImage = req.file.path;
          }

          let updateFields = {
            username: body.username || user.username,
            dateOfBirth: body.dateOfBirth || user.dateOfBirth,
            gender: body.gender || user.gender,
            favBroadcaster: body.favBroadcaster || user.favBroadcaster,
            profileImage: body.profileImage || user.profileImage,
            bio: body.bio || user.bio,
          };

          if (req.file) {
            updateFields.profileImage = body.profileImage;
          }

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
      
    ;
  } catch (e) {
    return res.status(500).json({
      message: "Server error",
      error: e,
    });
  }
};

// Block User
exports.blockUsers = async (req, res) => {
  try {
    await userprofileSchema.findByIdAndUpdate(
      req.body.userId,
      {
        $set: {
          isBlocked: true,
        },
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "User Blocked Successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// UnBlock User
exports.unblockUsers = async (req, res) => {
  console.log(req.body.userId, "..............");
  try {
    await userprofileSchema.findByIdAndUpdate(
      req.body.userId,
      {
        $set: {
          isBlocked: false,
        },
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "User unBlocked Successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};





