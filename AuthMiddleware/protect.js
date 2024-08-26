const userScheema = require("../Model/userSchema");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const AdminSchema = require("../Model/AdminSchema");
require("dotenv").config()


const protect = asyncHandler(async (req, res, next) => {
  try {
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
    if (!token) {
      res.status(402);
      throw new Error("Not Authorized, please login");
    }


    const verified = jwt.verify(token, process.env.secret_key);

    const user = await userScheema.findById(verified.userId).select("-password");
    if (!user) {
      res.status(404).json({
        message: "User not found"
      })
      throw new Error("User Not Found");
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error:", error);
    res.status(402).json({ message: "Not Authorized, please login" });
  }
});

const protectAdmin = asyncHandler(async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(404).json({ message: 'Not authorized, token not found' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, token missing' });
    }
    // console.log("process.env.secret_key", process.env.secret_key);
    // console.log("token", token)
    let decoded;
    try {
      decoded = await jwt.verify(token, process.env.secret_key);
    } catch (err) {
      // console.log("decoded", decoded)
      return res.status(401).json({ message: 'Sorry, token expired' });
    }

    // console.log("decoded.userId", decoded.userId)
    const user = await AdminSchema.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not an admin. Please log in as an admin.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

const protectSubAdmin = asyncHandler(async (req, res, next) => {
  try {
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
    if (!token) {
      res.status(402);
      throw new Error("Not Authorized, please login as sub admin");
    }

    const verify = jwt.verify(token, process.env.secret_key)

    const user = await AdminSchema.findById(verify.userId).select("-password");

    if (!user) {
      res.status(402);
      throw new Error("User Not Found");
    }

    req.user = user;
    next();

  }
  catch (err) {
    return res.status(500).json({
      message: err.message
    })
  }
})

const protectCoinDistributor = asyncHandler(async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(404).json({ message: 'Not authorized, no token' });
    }
    const token = authHeader.split(" ")[1]
    if (!token) {
      return res.status(401).json({ message: 'Not authorized, token missing' });
    }
    let decoded;
    try {
      decoded = await jwt.verify(token, process.env.secret_key);
    } catch (err) {
      // console.log("decoded", decoded)
      return res.status(401).json({ message: 'Sorry, token expired' });
    }
    const user = await AdminSchema.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Coin Distributor not found' });
    }
    if (user.role !== 'coin-distributor') {
      return res.status(403).json({ message: 'You are not an Coin Distributor. Please log in as an Coin Distributor.' });
    }

    req.user = user;
    next();

  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
})


module.exports = {
  protect,
  protectAdmin,
  protectSubAdmin,
  protectCoinDistributor
};