const Following = require("../Model/Following");
const Follower = require("../Model/Followers");
const User = require("../Model/userSchema");
const { query, body, validationResult } = require("express-validator");

const followValidationRules = () => {
  return [
    // Validate userId
    body("userId").exists().withMessage("FollowId is required"),

    // Validate type
    body("type")
      .exists()
      .isIn(["follow", "follower"])
      .withMessage('Invalid type. Must be either "follow" or "follower"'),
  ];
};

const follow = async (req, res) => {
  try {
    // Call followValidationRules to get validation rules
    const validationRules = followValidationRules();

    // Manually validate the request body
    for (const rule of validationRules) {
      await rule.run(req);
    }

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // If validation errors exist, return 400 with error messages
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const user = req.user;

    const { userId, type } = req.body;

    // Follower profile ko retrieve karna
    const FollowingUser = await User.findById(req.body.userId);

    if (!FollowingUser) {
      res.status(404).json({
        status: false,
        message: "user not found",
        // data: [FollowingUser],
      });
    }

    if (type === "follow") {
      const followingCheck = await Following.findOne({
        user: user._id,
        following: userId,
      });

      if (followingCheck) {
        res.status(400).json({
          status: false,
          message: "You are already following this user",
          data: [],
        });
      }

      const followingData = await new Following({
        user: user._id,
        following: userId,
      }).save();

      res.status(200).json({
        status: true,
        message: "You are now following this user",
        data: [],
      });
    } else if (type === "follower") {
      const followerCheck = await Follower.findOne({
        user: user._id,
        following: userId,
      });

      if (followerCheck) {
        res.status(400).json({
          status: false,
          message: "You are already follower this user",
          data: [],
        });
      }

      const followerData = await new Follower({
        user: user._id,
        follower: userId,
      }).save();

      res.status(200).json({
        status: true,
        message: "You are now follower this user",
        data: [],
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
      e:error.message
    });
  }
};

const unfollow = async (req, res) => {
  try {
    // Call followValidationRules to get validation rules
    const validationRules = followValidationRules();

    // Manually validate the request body
    for (const rule of validationRules) {
      await rule.run(req);
    }

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // If validation errors exist, return 400 with error messages
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const user = req.user;

    const { userId, type } = req.body;

    // Follower profile ko retrieve karna
    const FollowingUser = await User.findById(userId);

    if (!FollowingUser) {
      res.status(404).json({
        status: false,
        message: "user not found",
        data: [],
      });
    }

    if (type === "follow") {
      await Following.deleteOne({
        userId: user._id,
        following: userId,
      });

      return res.status(200).json({
        status: true,
        message: "You have unfollowed this user",
        data: [],
      });
    } else if (type === "follower") {
      await Follower.deleteOne({
        userId: user._id,
        follower: userId,
      });

      return res.status(200).json({
        status: true,
        message: "You have unfollowered this user",
        data: [],
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const getListFollowValidationRules = () => {
  return [
    // Validate type
    query("type")
      .exists()
      .isIn(["follow", "follower"])
      .withMessage('Invalid type. Must be either "follow" or "follower"'),
  ];
};

module.exports = {
  follow,
  unfollow,
  getListFollowValidationRules
};
