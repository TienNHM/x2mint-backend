const express = require("express");
const router = express.Router();
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const Question = require("../models/Question");
const Account = require("../models/Account");

const verifyToken = require("../middleware/requireAuth");
const dotenv = require("dotenv");
const { ROLES } = require("../models/enum");
dotenv.config({ path: "./config.env" });

//@route GET v1/questions/
//@desc get all question
//@access private
//@role admin/creator
router.get("/", verifyToken, async (req, res) => {
  try {
    //Check permission
    if (
      !(
        req.body.verifyAccount.role === ROLES.ADMIN ||
        req.body.verifyAccount.role === ROLES.CREATOR
      )
    ) {
      return res
        .status(401)
        .json({ success: false, message: "Permission denied" });
    }

    const questions = await Question.find();
    if (questions) {
      res.json({
        success: true,
        message: "Get all question successfully ",
        questions,
      });
    } else {
      res.json({
        success: false,
        message: "Questions do not exist",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

//TODO: Get all questions of  a test by testId for isHidden = false OR true

//@route Post v1/questions/new/:testId
//@desc Create a question
//@access private
//@role admin/creator
router.post("/new/:testId", verifyToken, async (req, res) => {
  try {
    //Check permission

    if (
      !(
        req.body.verifyAccount.role === ROLES.ADMIN ||
        req.body.verifyAccount.role === ROLES.CREATOR
      )
    ) {
      return res
        .status(401)
        .json({ success: false, message: "Permission denied" });
    }

    if (!req.body)
      res.status(400).json({
        success: false,
        message: "Body request not found",
      });

    //Create new question
    let question = new Question({
      order: req.body.order,
      content: req.body.content,
      type: req.body.type,
      answers: req.body.answers,
      correctAnswer: req.body.correctAnswer,
      embededMedia: req.body.embededMedia,
    });

    //Send to Database
    question = await question.save();
    //TODO: Updating for Test Collection : Question list

    res.json({
      success: true,
      message: "Question created successfully",
      question: question,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

//@route PUT v1/questions/update/:questionId
//@desc Update a question by question Id
//@access private
//@role admin/creator
router.put("/update/:questionId", verifyToken, async (req, res) => {
  try {
    //Check permission
    if (
      !(
        req.body.verifyAccount.role === ROLES.ADMIN ||
        req.body.verifyAccount.role === ROLES.CREATOR
      )
    ) {
      return res
        .status(401)
        .json({ success: false, message: "Permission denied" });
    }

    if (!req.body)
      res.status(400).json({
        success: false,
        message: "Body request not found",
      });
    let question;
    if (req.body.isHidden != null) {
      question = {
        order: req.body.order,
        content: req.body.content,
        type: req.body.type,
        answers: req.body.answers,
        correctAnswer: req.body.correctAnswer,
        embededMedia: req.body.embededMedia,
        updatedAt: formatTimeUTC(),
        isHidden: req.body.isHidden,
      };
    } else {
      question = {
        order: req.body.order,
        content: req.body.content,
        type: req.body.type,
        answers: req.body.answers,
        correctAnswer: req.body.correctAnswer,
        embededMedia: req.body.embededMedia,
        updatedAt: formatTimeUTC(),
        isHidden: req.body.isHidden,
      };
    }

    const updatedQuestion = await Question.findOneAndUpdate(
      { _id: req.params.questionId },
      question,
      { new: true }
    );
    res.json({
      success: true,
      message: "Update question successfully",
      question: updatedQuestion,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
