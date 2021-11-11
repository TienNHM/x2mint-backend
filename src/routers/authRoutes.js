const express = require("express");
const router = express.Router();
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Account = require("../models/Account");
const verifyToken = require("../middleware/requireAuth");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

//@route GET v1/auth/register
//@desc Register Usẻ
//@access public
//@role any
router.post("/register", async (req, res) => {
  console.log(req.body);
  if (!req.body)
    return res
      .status(400)
      .json({ success: false, message: "Body request not found" });

  const { username, password, email, fullname, phone, address, school } =
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
    });

    newAccount = await newAccount.save();
    let newUser = new User({
      fullname,
      phone,
      address,
      school,
    });
    newUser = await newUser.save();
    //Return token
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

    return res.json({
      success: true,
      message: "Account created successfully",
      accessToken: "Bearer " + accessToken,
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

    console.log(account);
    // Username found
    const passwordValid = await argon2.verify(account.password, password);
    if (!passwordValid)
      return res
        .status(400)
        .json({ success: false, message: "Incorrect username or password" });
    console.log(passwordValid);
    //All good
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
      accessToken: "Bearer " + accessToken,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
