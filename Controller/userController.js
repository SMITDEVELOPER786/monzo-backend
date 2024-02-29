const exp = require("express");
const userValidate = require("../Validator/userValid.js");
const { ProfileValidator } = require("../Validator/userProfileValidate.js");
const UserScheema = require("../Model/userSchema.js");
const userprofileSchema = require("../Model/userprofileSchema.js");
const twilio = require('twilio');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { mail } = require("../Email/nodeMailer.js");
const userSchema = require("../Model/userSchema.js");
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
      const otp = Math.floor(Math.random() * 1000000 + 1);

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




// Send OTP
exports.sendOtp = async (req, res) => {
  try {
    const { mobileNumber } = req.body;
    console.log(mobileNumber);

    // Generate OTP
    const generateOTP = Math.floor(1000 + Math.random() * 9000);
    const otp = generateOTP;

    // Send OTP using Twilio verify service
    client.verify.services(verifySid)
      .verifications
      .create({ to: `+92${mobileNumber}`, channel: "sms" })
      .then((verification) => {
        console.log(verification.status); // Log status of OTP verification
        res.status(200).json({ otp: otp, message: 'OTP sent successfully' });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).json({ message: error.message });
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};





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




// Send OTP
exports.sendOtp = async (req, res) => {
  try {
    const { mobileNumber } = req.body;
    console.log(mobileNumber);

    // Generate OTP
    const generateOTP = Math.floor(1000 + Math.random() * 9000);
    const otp = generateOTP;

    // Send OTP using Twilio verify service
    client.verify.v2.services(verifySid)
      .verifications
      .create({ to: `+92${mobileNumber}`, channel: "sms" })
      .then((verification) => {
        console.log(verification.status); // Log status of OTP verification
        res.status(200).json({ otp: otp, message: 'OTP sent successfully' });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).json({ message: error.message });
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};






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
  const { email } = req.body;

  if (email) {
    let ckeckUser = await userSchema.findOne({ email });
    if (ckeckUser == null) {
      return res.status(401).json({ message: "Invalid Email Address" });
    }

    const otp = Math.floor(Math.random() * 1000000 + 1);

    mail("Your OTP is", otp, email);

    return res.status(200).json({ message: "OTP Send Your Mail", otp });
  } else {
    return res.status(401).json({ message: "Enter Email Address" });
  }
};


// PasswordOtpVerify
exports.PasswordOtpVerify = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (email && otp && newPassword) {
    try {
      const user = await userSchema.findOne({ email });

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
        const user = await userSchema.findById(req.userId);

        if (user && user.isCompleteProfile === false) {
          await ProfileValidator.validateAsync(body);

          if (req.file) {
            body.profileImage = req.file.path;
          } else {
            return res.status(400).json({
              message: "Profile image file not provided"
            });
          }

          let obj = {
            username: body.username,
            dateOfBirth: body.dateOfBirth,
            gender: body.gender,
            profileImage: body.profileImage,
            favBroadcaster: body.favBroadcaster,
            authId: body.authId,
          };

          let userProfile = new userprofileSchema(obj);
          await userProfile.save();

          await userSchema.findByIdAndUpdate(req.userId, {
            isCompleteProfile: true,
            profileId: userProfile._id, // assuming you want to link UserProfile to User
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
            }r
          }); 

    } else {
        // Handle case when no token is provided
        return res.status(401).json({ message: 'Unauthorized' });
    }
};


exports.getAllUser = async (req, res) => {

  try {
    const users = await userSchema.find();
    res.status(200).json(users);
} catch (error) {
    res.status(500).json({ message: error.message });
}


  // try {
  //       var user = await userprofileSchema.findById(req.authId)
   
  //       console.log(user);
  //       if (user) {

  //         var getUser = await userSchema.find({_id: { $ne: req.userId } }).populate("profileId")
  //           return res.status(200).json({
  //               message: 'user all users',
  //               data: getUser
  //           });
  //       }


  //   }
  //   catch (e) {
  //       console.error('Error:', e);
  //       return res.status(500).json({
  //           message: 'Internal server error',
  //           error: e,
  //       });
  //   }

}





//   try {
//       // Sabhi users ko retrieve karna
//       const users = await userSchema.find();

//       // Profile ke saath users ko populate karna
//       const usersWithProfile = await userSchema.find().populate('profileId');

//       // Response bhejna
//       res.status(200).json(usersWithProfile);
//   } catch (error) {
//       res.status(500).json({ message: error.message });
//   }
// };