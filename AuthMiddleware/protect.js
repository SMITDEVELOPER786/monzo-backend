const userScheema = require("../Model/userSchema");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const protect = asyncHandler(async (req, res, next) => {
  try {
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1]; // Check if authorization header exists
    if (!token) {
      res.status(402);
      throw new Error("Not Authorized, please login");
    }

    //verify token
    const verified = jwt.verify(token, process.env.secret_key);
console.log(verified);
    //get user id from token
    const user = await userScheema.findById(verified.userId).select("-password");
    if (!user) {
      res.status(402);
      throw new Error("User Not Found");
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error:", error); // Log the error for debugging
    res.status(402).json({ message: "Not Authorized, please login" }); // Send proper error response
  }
});

module.exports = protect;
