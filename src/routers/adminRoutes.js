const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/requireAuth");
const dotenv = require("dotenv");
const { ROLES, STATUS } = require("../utils/enum");
dotenv.config({ path: "./.env" });
const Test = require("../models/Test");
const { formatTimeUTC_, formatTimeUTC } = require("../utils/Timezone");
const User = require("../models/User");
const Contest = require("../models/Contest");
const TakeTest = require("../models/TakeTest");
const Question = require("../models/Question");

//@route GET v1/statistics/
//@desc View statistic overview
//@access private
//@role admin
router.get("", verifyToken, async(req, res) => {
    // #swagger.tags = ['statistics']
    // #swagger.security = [{ "bearerAuth": [] }] 
    // #swagger.summary = 'Get all statistics'

    try {
        //Check permission
        if (!(
                req.body.verifyAccount.role === ROLES.ADMIN
            )) {
            return res
                .status(401)
                .json({ success: false, message: "Permission denied" });
        }

        const users = await User.find();
        const contests = await Contest.find()
            .populate("creatorId").exec();

        const tests = await Test.find();
        const takeTests = await TakeTest.find()
            .populate("test")
            .populate({
                path: 'user',
                select: "-__v -createdAt -updatedAt -password"
            }).exec();

        const questions = await Question.find();

        res.json({
            success: true,
            message: "Get all successfully",
            data: {
                users: users,
                contests: contests,
                tests: tests,
                takeTests: takeTests,
                questions: questions
            }
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

module.exports = router;