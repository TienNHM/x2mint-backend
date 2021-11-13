const express = require("express");
const router = express.Router();
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Account = require("../models/Account");
const verifyToken = require("../middleware/requireAuth");
const dotenv = require("dotenv");
const { ROLES } = require("../models/enum");
dotenv.config({ path: "./config.env" });

//@route GET v1/auth/register
//@desc Register User
//@access public
//@role any
router.post("/register", async (req, res) => {
  console.log(req.body);
  if (!req.body)
    return res
      .status(400)
      .json({ success: false, message: "Body request not found" });

  const { username, password, role, email, fullname, phone, address, school } =
    req.body;
  //simple validation
  if (!username || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Missing username and/or password" });
  }

  try {
    //Check for existing username
    const account = await Account.findOne({ username });

    if (account)
      return res
        .status(400)
        .json({ success: false, message: "Username already taken" });

    const hashedPassword = await argon2.hash(
      password,
      process.env.SECRET_HASH_KEY
    );

    let newAccount = new Account({
      username,
      password: hashedPassword,
      email,
      role: role ? role : ROLES.USER,
    });

    newAccount = await newAccount.save();
    let newUser = new User({
      fullname,
      phone,
      address,
      school,
      account: newAccount._id,
    });
    newUser = await newUser.save();
    //Return token
    const accessToken = jwt.sign(
      {
        verifyAccount: {
          id: newAccount._id,
          isHidden: newAccount.isHidden,
          username: newAccount.username,
          role: newAccount.role,
        },
      },
      process.env.ACCESS_TOKEN_SECRET
    );

    return res.json({
      success: true,
      message: "Account created successfully",
      accessToken: "Bearer " + accessToken,
      user: newUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// @route POST v1/auth/login
// @desc Login user by username and password
// @access Public
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  //simple validation
  if (!username || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Missing username and/or password" });
  }

  try {
    //check for existing username
    const account = await Account.findOne({ username });
    if (!account)
      return res
        .status(400)
        .json({ success: false, message: "Incorrect username or password" });

    // Username found
    const passwordValid = await argon2.verify(account.password, password);
    if (!passwordValid)
      return res
        .status(400)
        .json({ success: false, message: "Incorrect username or password" });
    console.log(passwordValid);
    //All good
    const userInfo = await User.findOne({ account: account._id });

    //return token
    const accessToken = jwt.sign(
      {
        verifyAccount: {
          id: account._id,
          isHidden: account.isHidden,
          username: account.username,
          role: account.role,
        },
      },
      process.env.ACCESS_TOKEN_SECRET
    );

    res.json({
      success: true,
      message: "User logged successfully",
      accessToken: accessToken,
      user: userInfo,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.get("/verify", verifyToken, async (req, res) => {
  try {
    return res.status(200).json({
      message: "Token is valid",
      success: true,
      user: req.body.verifyAccount,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      success: false,
      message: "Internal error server",
    });
  }
});

module.exports = router;
