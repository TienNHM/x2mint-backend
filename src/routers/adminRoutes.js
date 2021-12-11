const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/requireAuth");
const dotenv = require("dotenv");
const { ROLES, STATUS } = require("../models/enum");
dotenv.config({ path: "./.env" });
const Test = require("../models/Test");
const { formatTimeUTC_, formatTimeUTC } = require("../utils/Timezone");
const User = require("../models/User");
const Contest = require("../models/Contest");
const TakeTest = require("../models/TakeTest");

//@route GET v1/statistics/
//@desc View statistic overview
//@access private
//@role admin
router.get("", verifyToken, async (req, res) => {
  try {
    //Check permission
    if (
      !(
        req.body.verifyAccount.role === ROLES.ADMIN
      )
    ) {
      return res
        .status(401)
        .json({ success: false, message: "Permission denied" });
    }

    const users = await User.find();
    const contests = await Contest.find();
    const tests = await Test.find();
    const takeTests = await TakeTest.find();

    res.json({
        success: true,
        message: "Get all successfully",
        data: {
            users: users,
            contests: contests,
            tests: tests,
            takeTests: takeTests
        }
      });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
