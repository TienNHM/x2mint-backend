const { OAuth2Client, auth } = require("google-auth-library");
const Account = require("../models/Account");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleAuth = async (token) => {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: [process.env.GOOGLE_CLIENT_ID],
  });

  return ticket.getPayload();
};

const verifyToken = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.split(" ")[1];

  if (!token)
    return res
      .status(401)
      .json({ success: false, message: "Access token not found" });

  try {
    //Try with token from google
    console.log("Hello");

    const user = await googleAuth(token);
    console.log("Hello");

    let userMap = await Account.findOne({ email: user.email });

    //Checked account is active
    if (!userMap.isHidden) {
      req.body.userAuth = userMap;
      req.headers.authorization = token;
      next();
    } else {
      res.status(403).json({
        message: "Your account is blocked",
        success: false,
      });
    }
  } catch (error) {
    //Login by enter email and password

    try {
      let account;
      jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        function (err, payload) {
          if (typeof payload != "undefined") {
            if (!payload.verifyAccount.isHidden) {
              account = payload.verifyAccount;
              req.body.verifyAccount = account;
              req.headers.authorization = token;
              next();
            } else {
              res.status(403).json({
                message: "Your account is blocked",
                success: false,
              });
            }
          } else {
            return res.status(401).json({
              message: "Authentication failed!",
              success: false,
            });
          }
        }
      );
      // const decode = jwt.decode(token, process.env.ACCESS_TOKEN_SECRET);
      // req.accountId = decode.accountId;
      // next();
    } catch (error) {
      console.log(error);
      res.status(403).json({ success: false, message: "Invalid token" });
    }
  }
};

module.exports = verifyToken;
