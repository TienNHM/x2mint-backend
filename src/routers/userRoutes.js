const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Account = require("../models/Account");
const verifyToken = require("../middleware/requireAuth");
const dotenv = require("dotenv");
const { ROLES } = require("../models/enum");
dotenv.config({ path: "./config.env" });

//@route GET v1/users
//@desc Get all users
//@access private
//@role admin

router.get("/", verifyToken, async (req, res) => {
  try {
    //Check permission
    console.log(req.body.verifyAccount);
    if (req.body.verifyAccount.role !== ROLES.ADMIN) {
      return res
        .status(401)
        .json({ success: false, message: "Permission denied" });
    }

    const users = await User.find().populate("account", "email role");
    if (users) {
      res.json({
        success: true,
        message: "Get all user successfully ",
        data: users,
      });
    } else {
      res.json({
        success: false,
        message: "Users do not exist",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

//@route GET v1/users/info/:userId
//@desc Get user's info
//@access private
//@role any
router.get("/info/:userId", verifyToken, async (req, res) => {
  try {
    //Check permission

    if (
      req.body.verifyAccount.role !== ROLES.ADMIN &&
      req.body.verifyAccount.role !== ROLES.CREATOR
    ) {
      return res
        .status(401)
        .json({ success: false, message: "Permission denied" });
    }

    const user = await User.findById(req.params.userId).populate(
      "account",
      "email role"
    );
    if (user) {
      res.json({
        success: true,
        message: "Get all user successfully ",
        data: user,
      });
    } else {
      res.json({
        success: false,
        message: "Users do not exist",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
