const express = require("express");
const router = express.Router();
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const verifyToken = require("../middleware/requireAuth");
const { OAuth2Client, auth } = require("google-auth-library");
const dotenv = require("dotenv");
const { ROLES } = require("../models/enum");
dotenv.config({ path: "./config.env" });
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const sendMail = require('./sendMail');

const googleAuth = async (token) => {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: [process.env.GOOGLE_CLIENT_ID],
  });

  return ticket.getPayload();
};

//@route GET v1/auth/register
//@desc Register User
//@access public
//@role any
router.post("/register", async (req, res) => {
  const { username, email, password, full_name, phone, address, school } = req.body;
  //simple validation
  if (!username || !password || !email) {
    return res
      .status(400)
      .json({ success: false, message: "missing" });
  }
  try {
    //Check for existing username
    const user = await User.findOne({$or: [{ username}, { email }],});
    if (user) { // check already account
      if (user.username === username)
        return res
          .status(400)
          .json({ success: false, message: "username" });
      else if (user.email === email) {
        return res
          .status(400)
          .json({ success: false, message: "email" });
      }
    }
    const hashedPassword = await argon2.hash(
      password,
      process.env.SECRET_HASH_KEY
    );

    const newUser = new User({ //create account with username, email and password
      username,
      password: hashedPassword,
      email,
      full_name, 
      phone, 
      address, 
      school 
    });

    await newUser.save();
      //Return token
    const accessToken = jwt.sign(
      {
        id: newUser._id,
        username: newUser.username,
        role: newUser.role
      },
      process.env.ACCESS_TOKEN_SECRET
    );
      
    const url = `${CLIENT_URL}/user/activate/${activation_token}`
    sendMail(email, url, "Verify your email address")

    return res.json({
      success: true,
      message: "Account created successfully",
      accessToken
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Forgot Password
router.post("/forgotPassword", async (req, res) => {
  try {
      const {email} = req.body
      const user = await Users.findOne({email})
      if(!user) return res.status(400).json({msg: "This email does not exist."})

      const access_token = createAccessToken({id: user._id})
      const url = `${process.env.CLIENT_URL}/user/reset/${access_token}`

      sendMail(email, url, "Reset your password")
      res.json({msg: "Re-send the password, please check your email."})
  } catch (err) {
      return res.status(500).json({msg: err.message})
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
      .json({ success: false, message: "missing" });
  }
  try {
    //check for existing username
    const user = await User.findOne({ username });
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "incorrect" });

    // Username found
    const passwordValid = await argon2.verify(user.password, password);
    if (!passwordValid)
      return res
        .status(400)
        .json({ success: false, message: "password" });
  
    //All good
    //return token
    const accessToken = jwt.sign (
      {
        verifyAccount: {
          id: user._id,
          username: user.username,
          role: user.role,
        },
      }, process.env.ACCESS_TOKEN_SECRET
    );

    res.json({
      accessToken: accessToken,
      user : user,
      success:true,
      message: "User logged successfully"
    })
    console.log(accessToken)
    

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

//Login with  google api
router.post("/login/google", verifyToken, async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      return res.status(401).json({
        message: "Access token not found",
      });
    }
    const token = authorization;

    const user = await googleAuth(token);

    const snapshot = await Account.findOne({
      email: user.email,
    });

    console.log(user);

    if (!snapshot) {
      //New account
      let newAccount = new Account({
        email: user.email,
      });

      newAccount = await newAccount.save();
      let newUser = new User({
        fullName: user.name,
        image: user.picture,
        account: newAccount._id,
      });

      newUser = await newUser.save();

      if (!newUser) {
        return res.status(500).json({
          message: "Cannot create user",
          success: false,
        });
      } else {
        return res.status(200).json({
          message: "Create user successfully",
          success: true,
          user: newUser,
          accessToken: token,
        });
      }
    } else {
      if (!snapshot.isHidden) {
        if (snapshot.username === null && snapshot.password === null)
          return res.status(200).json({
            message: "User login",
            success: true,
            user: snapshot,
            accessToken: req.headers.authorization,
          });
        else {
          return res.status(400).json({
            message: "This account have used with username and password",
            success: false,
          });
        }
      } else {
        res.status(403).json({
          message: "Your account is blocked",
          success: false,
        });
      }
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
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

router.get("/", verifyToken, async (req, res) => {
  try{
    const user = await User.findById(req.userId).select('-password')
    if (!user)
      return res.status(400).json({success:false, message:'User not found'})
    res.json({success:true, user})
    }catch (error) {
      console.log(error)
      res.status(500).json({success:false, message:'Internal server error'})
    }
});

module.exports = router;
