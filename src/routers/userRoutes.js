const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Account = require("../models/Account");
const verifyToken = require("../middleware/requireAuth");
const argon2 = require("argon2");
const dotenv = require("dotenv");
const { ROLES } = require("../models/enum");
const { formatTimeUTC } = require("../utils/Timezone");
const mongoose = require("mongoose");
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

    const users = await User.find().populate("account", "email role isHidden");
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

//@route PUT v1/users/:userId
//@desc Update user's info
//@access private
//@role User/Creator/Admin
router.put("/info/:userId", verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.userId))
      return res
        .status(400)
        .json({ success: false, message: "Invalid userId" });

    let updatedUser = {
      fullname: req.body.fullname,
      phone: req.body.phone,
      address: req.body.address,
      school: req.body.school,
      avatar: req.body.avatar,
      dob: req.body.dob,
      updatedAt: formatTimeUTC(),
    };

    updatedUser = await User.findOneAndUpdate(
      { _id: req.params.userId },
      updatedUser,
      { new: true }
    );

    res.json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

//@route PUT v1/users/resetPassword
//@desc Update user's account
//@access private
//@role User/Creator/Admin

router.put("/resetPassword", verifyToken, async (req, res) => {
  try {
    const accountId = req.body.verifyAccount.id;
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Missing password" });
    }

    const account = await Account.findById(accountId);
    if (!account)
      return res
        .status(401)
        .json({ success: false, message: "Unauthorization" });

    // Verify current password to change
    const passwordValid = await argon2.verify(account.password, oldPassword);

    if (!passwordValid)
      return res
        .status(400)
        .json({ success: false, message: "Your old password is wrong" });

    //Hash new password to save
    const hashedPassword = await argon2.hash(
      newPassword,
      process.env.SECRET_HASH_KEY
    );
    let updatedAccount = {
      password: hashedPassword,
      updatedAt: formatTimeUTC(),
    };

    updatedAccount = await Account.findOneAndUpdate(
      { _id: accountId },
      updatedAccount,
      {
        new: true,
      }
    );

    res.json({
      success: true,
      message: "Reset password successfully",
      account: updatedAccount,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;