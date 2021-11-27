const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Test = require("../models/Test");
const TakeTest = require("../models/TakeTest");

const verifyToken = require("../middleware/requireAuth");
const dotenv = require("dotenv");
const { ROLES } = require("../models/enum");

//@route Post v1/takeTest/new
//@desc Create a take test
//@access public
//@role user
router.post("/", verifyToken, async (req, res) => {
  try {
    if (!req.body)
      res.status(400).json({
        success: false,
        message: "Body request not found",
      });

    const accountId = req.body.verifyAccount.id;
    let user = await User.findOne({ acount: accountId });

    //Create new
    let take_test = new TakeTest({
      test: req.body.test,
      user: user.id,
      submitTime: req.body.endTime,
      chooseAnswers: req.body.chooseAnswers,
      points: req.body.points,
      status: req.body.status,
      questionsOrder: req.body.questionsOrder,
    });

    //Send to Database
    take_test = await take_test.save();
    await TakeTest.populate(take_test, [
      "test",
      "user",
      "chooseAnswers.questionId",
    ]);
    res.json({
      success: true,
      message: "Take test created successfully",
      takeTest: take_test,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

//@route GET v1/takeTest/user/:userId
//@desc Get all take test of a user
//@access public
//@role any
router.get("/user/:userId", verifyToken, async (req, res) => {
  try {
    //Check permission

    let take_tests = [];
    take_tests = await TakeTest.find({ user: req.params.userId })
      .populate("test", "-__v -createdAt -updatedAt")
      .populate("user", "-__v -createdAt -updatedAt")
      .populate("chooseAnswers.questionId", "-__v -createdAt -updatedAt")
      .exec();

    res.json({
      success: true,
      message: "Get take_tests successfully",
      takeTests: take_tests,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

//@route GET v1/takeTest/user/:userId
//@desc Create a take test
//@access public
//@role any
router.get("/test/:testId", verifyToken, async (req, res) => {
  try {
    //Check permission

    let take_tests = [];
    take_tests = await TakeTest.find({ test: req.params.testId })
      .populate("test", "-__v -createdAt -updatedAt")
      .populate("user", "-__v -createdAt -updatedAt")
      .populate("chooseAnswers.questionId", "-__v -createdAt -updatedAt")
      .exec();

    res.json({
      success: true,
      message: "Get take_tests successfully",
      takeTests: take_tests,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
