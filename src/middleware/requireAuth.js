const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

const verifyToken = (req, res, next) => {
  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.split(" ")[1];

  if (!token)
    return res
      .status(401)
      .json({ success: false, message: "Access token not found" });

  try {
    let account;
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, payload) {
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
    });
    // const decode = jwt.decode(token, process.env.ACCESS_TOKEN_SECRET);
    // req.accountId = decode.accountId;
    // next();
  } catch (error) {
    console.log(error);
    res.status(403).json({ success: false, message: "Invalid token" });
  }
};

module.exports = verifyToken;
