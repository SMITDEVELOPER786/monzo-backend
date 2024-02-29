const exp = require("express");
const userValidate = require("../Validator/userValid");
const { ProfileValidator } = require("../Validator/userProfileValidate");
const UserScheema = require("../Model/userSchema");
const userprofileSchema = require("../Model/userprofileSchema");
const twilio = require('twilio');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { mail } = require("../Email/nodeMailer");
const userSchema = require("../Model/userSchema");
require("dotenv").config();
const otpStorage = {};

const secretkey = process.env.secret_key;



const verifySid = "VA38f6ad426d933fd76c8567cb0d73071a";
const accountSid = 'AC33c3e07866de234b343c795f1deb21c2';
const authToken = 'be190548ecdaef53113393abd5d2f471';
const client = twilio("AC22b19e84befb3f08053353e2b1421279", "5c0dd1b071a275f8ef6b98bbf130a6e7");








// Signup
exports.signup = async (req, res) => {
  const { email, password } = req.body;

  try {
    await userValidate.validateAsync(req.body);

    const checkemail = await UserScheema.findOne({ email });
    if (checkemail) {
      return res.status(401).json({
        message: "User AlReady Register",
      });
    } else {
      const otp = Math.floor(Math.random() * 10000);

      console.log(otp);
      const hashpassword = await bcrypt.hash(password, 12);

      req.body.password = hashpassword;

      req.body.otp = otp;

      const user = UserScheema(req.body);

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
      message: "Sahi Sy km kr user",
      error: e,
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




// // Send OTP
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
// exports.verifyOtp = async (req, res) => {

//     const { body, headers } = req;
//         const { authorization } = headers;
        
//         const token = authorization && authorization.split(" ")[1];
    


//     try {
//         const { mobileNumber, otp } = req.body;

//         if (otp === otps[mobileNumber]) {
//             res.status(200).json({ message: 'OTP verified successfully' });
//         } 
//         else if (!token){
//             return res.status(401).json({
//             message: "token not provide",
//             });
//         }
//         else if (otp == undefined){
//             return res.status(401).json({
//              message: "otp not provide",
//             });
//         }
        
//         else if (otp != 4 ){
//             return res.status(401).json({
//             message: "Otp must be 4 letter",
//             });
//         }
        
        
        
        
        
        
        
        
//         else {
//             res.status(400).json({ message: 'Invalid OTP' });
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }


// //   try {
// //     const { body, headers } = req;
// //     const { authorization } = headers;
// //     const { otp } = body;
// //     const token = authorization && authorization.split(" ")[1];

// //     if (!token) {
// //       return res.status(401).json({
// //         message: "token not provide",
// //       });
// //     } else {
// //       if (otp == undefined) {
// //         return res.status(401).json({
// //           message: "otp not provide",
// //         });
// //       } else if (otp.length != 6) {
// //         return res.status(401).json({
// //           message: "Otp must be 6 letter",
// //         });
// //       } else {
// //         console.log(token);
// //         jwt.verify(token, secretkey, async (err, decode) => {
// //           console.log(decode);

// //           if (err) {
// //             return res.status(401).json({
// //               message: "unauthorization",
// //               data: err.message,
// //             });
// //           }
// //           console.log(decode);
// //           req.userid = decode.user_id;
// //           var userFind = await UserScheema.findById(req.userid);
// //           console.log(userFind);
// //           if (userFind.otp == otp) {
// //             await UserScheema.findByIdAndUpdate(req.userid, {
// //               isVerify: true,
// //               // isVerify:
// //             });

// //             return res.status(200).json({
// //               message: "verify otp ",
// //             });
// //           } else {
// //             return res.status(401).json({
// //               message: "invalid otp",
// //             });
// //           }
// //         });
// //       }
// //     }
// //   } catch (error) {
// //     return res.status(401).json({
// //       message: "Internal Server",
// //       data: error.message,
// //     });
// //   }
// };




// // Send OTP
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
          var userFind = await UserScheema.findById(req.userid);
          console.log(userFind);
          if (userFind.otp == otp) {
            await UserScheema.findByIdAndUpdate(req.userid, {
              isVerify: true,
             
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



// login

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const checkemail = await UserScheema.findOne({ email });

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
      message: "Sahi Sy km kr user",
      error: e.message,
    });
  }
};


// forgotPassword
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (email) {
      let checkUser = await userSchema.findOne({ email });

      if (!checkUser) {
        return res.status(401).json({ message: "Invalid Email Address" });
      }

      const otp = Math.floor(Math.random() * 10000);

      checkUser.otp = otp;
      await checkUser.save();

      mail("Your OTP is", otp, email);

      return res.status(200).json({ message: "OTP Sent Your Mail", otp });
    } else {
      return res.status(401).json({ message: "Enter Email Address" });
    }
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


// PasswordOtpVerify
exports.PasswordOtpVerify = async (req, res) => {
  try {
    const { body, headers } = req;
    const { authorization } = headers;
    const { newPassword } = body;
    const token = authorization && authorization.split(" ")[1];

    if (!newPassword) {
      return res.status(401).json({ message: "Enter new password" });
    }

    // Token verify karna
    jwt.verify(token, secretkey, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Unauthorized: Invalid Token" });
      }
      req.userid = decoded.userId;

      if (req.userid) {
      
        var user = await UserScheema.findById(req.userid);

     user.password = newPassword

        // Hash password
        const hashPassword = await bcrypt.hash(newPassword, 12);

        // Update password field
        user.password = hashPassword;
        await user.save();

        return res.json({ message: "Password updated successfully" });
      } else {
        return res.status(401).json({ message: "Unauthorized: Missing Email in Token" });
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};




// completeProfile
exports.completeProfile = async (req, res) => {
  const { body, headers } = req;
  const { authorization } = headers;

  try {
    const token = authorization && authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        message: "Token not provided",
      });
    }

    jwt.verify(token, secretkey, async (err, decode) => {
      if (err) {
        return res.status(401).json({
          message: "Unauthorized",
        });
      } else {
        req.userId = decode.userId;

var userid = req.userId
console.log(userid);    
const user = await userSchema.findById(userid);

        if (user && user.isCompleteProfile === false) {
          await ProfileValidator.validateAsync(body);

          if (req.file) {
            body.profileImage = req.file.path;
          } else {
            return res.status(400).json({
              message: "Profile image file not provided"
            });
          }

          console.log(req.userId);
          let obj = {
            username:body.username,
            dateOfBirth:body.dateOfBirth,
            gender:body.gender,
            profileImage:body.profileImage,
            favBroadcaster:body.favBroadcaster,
            authId:userid,
          };

          let userProfile = new userprofileSchema(obj);
          await userProfile.save();

          await userSchema.findByIdAndUpdate(req.userId, {
            isCompleteProfile: true,
            ProfileId:userProfile._id, // assuming you want to link UserProfile to User
          });

          return res.status(200).json({
            message: "Profile updated",
            data: userProfile // if you want to send updated profile data back
          });
        } else {
          return res.status(200).json({
            message: "Profile already completed"
          });
        }
      }
    });
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

  // Add token to blacklist or mark it as invalid on the server-side
  // You might want to store the token in a blacklist in the database
  // Alternatively, you can simply ignore the token as it's stateless

  // Clear token from client-side (e.g., clear from local storage)
  // Assuming you're using a browser-based client with local storage
  // localStorage.removeItem('token');

  res.json({ message: "Logged out successfully" });
};





exports.Myprofile = async (req, res) => {
    const { body, headers } = req;
    const { authorization } = headers;
    const token = authorization && authorization.split(" ")[1];
  
    if(token){

        jwt.verify(token, secretkey, async (err, decode) => {
            if (err) {
              return res.status(401).json({
                message: "unauthorization",
              });
            } else {
                console.log(decode);
              req.authId = decode.userId; // Assuming this is the correct key
              var data = req.authId
              console.log(req.authId);
              try {
                  var user = await UserprofileScheema.findOne({ authId: req.authId });

                  return res.status(200).json(user);
              } catch (error) {
                  console.error(error);
                  return res.status(500).json({ message: 'Failed to fetch user profile', err:error.message });
              }
            }
          }); 

    } else {
        // Handle case when no token is provided
        return res.status(401).json({ message: 'Unauthorized' });
    }
};


exports.getAllUser = async (req, res) => {

      try {
           // Sabhi users ko retrieve karna
            const users = await userSchema.find();
        
        //       // Profile ke saath users ko populate karna
              const usersWithProfile = await userSchema.find().populate('ProfileId');
        
        //       // Response bhejna
             res.status(200).json(usersWithProfile);
         } catch (error) {
              res.status(500).json({ message: error.message });
          }
  
  
  
  
  
       };
  



// Follow API

// exports.Follow = async (req, res) => {
//   try {
//     const { body, headers } = req;
//     const { authorization } = headers;
//     const token = authorization && authorization.split(" ")[1];
//     // Token ki validation
//     if (!token) {
//       return res.status(401).json({ message: "Unauthorized: Missing Token" });
//     }
//     // Token ko verify karna
//     jwt.verify(token, secretkey, async (err, decode) => {
//       if (err) {
//         return res.status(401).json({ message: "Unauthorized: Invalid Token" });
//       }
//       // Token valid hai, decoded mein user ki information hogi
//       const {followerId} = body

//       const userId = decode.userId;
//       console.log(userId);
//       const follower = await userSchema.findById(followerId).populate('ProfileId')  ;
//       const user = await userSchema.findById(userId).populate('ProfileId');
// console.log(user)
// console.log(follower.ProfileId.following) 
//       if (!follower || !user) {
//         return res.status(404).json({ message: "User not found" });
//       }
//       // Check if already following
//       if (follower.ProfileId.following.includes(userId)) {
//         return res.status(400).json({ message: "You are already following this user" });
//       }
//       // Update follower's following count
//       follower.ProfileId.following.push(userId);
//       follower.followingCount++;
//       await follower.save();
//       // Update user's followers count
//       user.ProfileId.followers.push(followerId);
//       user.ProfileId.followersCount++;
//       await user.save();
//       return res.status(200).json({ message: "You are now following this user" });
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// };


exports.Follow = async (req, res) => {
  try {
    const { body, headers } = req;
    const { authorization } = headers;
    const token = authorization && authorization.split(" ")[1];

    // Token ki validation
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: Missing Token" });
    }

    // Token ko verify karna
    const decode = jwt.verify(token, secretkey);

    // Token valid hai, decoded mein user ki information hogi
    const { followerId } = body;
    const userId = decode.userId;

    // User profile ko retrieve karna
    const user = await userSchema.findById(userId).populate('ProfileId');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Follower profile ko retrieve karna
    const follower = await userprofileSchema.findById(followerId);
    if (!follower) {
      return res.status(404).json({ message: "Follower not found" });
    }

    // Check karein ki user pehle se follow kar raha hai ya nahi
    if (follower.followers.includes(userId)) {
      return res.status(400).json({ message: "You are already following this user" });
    }

    // User profile aur follower profile ko update karna
    const followerUpdate = await userprofileSchema.findByIdAndUpdate(
      followerId,
      { $push: { followers: userId } },
      { new: true }
    );

    const userUpdate = await userprofileSchema.findByIdAndUpdate(
      user.ProfileId._id,
      { $push: { following: followerId } },
      { new: true }
    );

    res.status(200).json({ message: "You are now following this user", followerUpdate, userUpdate });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.unFollow = async (req, res) => {
  try {
    const { body, headers } = req;
    const { authorization } = headers;
    const token = authorization && authorization.split(" ")[1];

    // Token ki validation
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: Missing Token" });
    }

    // Token ko verify karna
    const decode = jwt.verify(token, secretkey);

    // Token valid hai, decoded mein user ki information hogi
    const { followerId } = body;
    const userId = decode.userId;

    // User profile ko retrieve karna
    const user = await userSchema.findById(userId).populate('ProfileId');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Follower profile ko retrieve karna
    const follower = await userprofileSchema.findById(followerId);
    if (!follower) {
      return res.status(404).json({ message: "Follower not found" });
    }

    // Check karein ki user pehle se follow kar raha hai ya nahi
    // if (follower.followers.includes(userId)) {
    //   return res.status(400).json({ message: "You are already following this user" });
    // }

    // User profile aur follower profile ko update karna
    const followerUpdate = await userprofileSchema.findByIdAndUpdate(
      followerId,
      { $pull: { followers: userId } },
      { new: true }
    );

    const userUpdate = await userprofileSchema.findByIdAndUpdate(
      user.ProfileId._id,
      { $pull: { following: followerId } },
      { new: true }
    );

    res.status(200).json({ message: "You are now following this user", followerUpdate, userUpdate });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};










//SearchUser
exports.SearchUser = async (req, res) => {
  try {
    const searchTerm = req.body.name; // Assuming query parameter name is used

console.log(searchTerm);
    const data = await userprofileSchema.find({
      "$or": [{
        "username": {
          "$regex": new RegExp(searchTerm, "i") // Case-insensitive search
        }
      }]
    })

    console.log(data)
    return res.status(200).json({
      data
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
}