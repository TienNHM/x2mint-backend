const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/requireAuth");
const dotenv = require("dotenv");
const { ROLES } = require("../models/enum");
dotenv.config({ path: "./config.env" });
const Answer = require("../models/Answer");
const Question = require("../models/Question");

//@route Post v1/questions/new  
//@desc Create a question
//@access private
//@role admin/creator
router.post("", verifyToken, async (req, res) => {
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
    let answer = new Answer({
      name: req.body.name,
      content: req.body.content
    });

    //Send to Database
    answer = await answer.save();
    //TODO: Updating for Test Collection : Question list

    res.json({
      success: true,
      message: "Answer created successfully",
      answer: answer,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});



//@route GET v1/answers
//@desc get all answers
//@access private
//@role admin/creator
router.get("", verifyToken, async (req, res) => {
    try {
      //Check permission
      if (
        req.body.verifyAccount.role === ROLES.ADMIN ||
        req.body.verifyAccount.role === ROLES.CREATOR
      ) {
        return res
          .status(401)
          .json({ success: false, message: "Permission denied" });
      }
  
      const answers  = await Answer.find();
      if (answers) {
        res.json({
          success: true,
          message: "Get all answer successfully ",
          data: answers,
        });
      } else {
        res.json({
          success: false,
          message: "Answers does not exist",
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  //@route GET v1/answers/:answerId
//@desc get answers by id
//@access private
//@role admin/creator/user
router.get("/:answerId", verifyToken, async (req, res) => {
  try {
    //Check permission
    if (
      req.body.verifyAccount.role === ROLES.ADMIN ||
      req.body.verifyAccount.role === ROLES.CREATOR || 
      req.body.verifyAccount.role === ROLES.USER
    ) {
      return res
        .status(401)
        .json({ success: false, message: "Permission denied" });
    }

    const answer  = await Answer.findById(req.params.answerId);
    if (answer) {
      res.json({
        success: true,
        message: "Get answer by id successfully ",
        data: answer,
      });
    } else {
      res.json({
        success: false,
        message: "Answer does not exist",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});


//@route PUT v1/answers/update/:answerId
//@desc Update a answers by answer Id
//@access private
//@role admin/creator
router.put("/:answerId", verifyToken, async (req, res) => {
  try {
    //Check permission
    if (
      req.body.verifyAccount.role === ROLES.ADMIN ||
      req.body.verifyAccount.role === ROLES.CREATOR
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

    let answer = {
      name: req.body.name,
      content: req.body.content,
      updatedAt: formatTimeUTC(),
    };

    const updatedAnswer = await Answer.findOneAndUpdate(
      { _id: req.params.answerId },
      answer,
      { new: true }
    );
    res.json({
      success: true,
      message: "Update answer successfully",
      answer: updatedAnswer,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});


//@route PUT v1/answers/:answerId/delete
//@desc Delete a answers by answer Id
//@access private
//@role admin/creator
router.put("/:answerId/delete", verifyToken, async (req, res) => {
    try {
      //Check permission
      if (
        req.body.verifyAccount.role === ROLES.ADMIN ||
        req.body.verifyAccount.role === ROLES.CREATOR
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
  
      let answer = {
        isHidden: true,
        updatedAt: formatTimeUTC(),
      };
  
      const updatedAnswer = await Answer.findOneAndUpdate(
        { _id: req.params.answerId },
        {isHidden: true}
      );
      res.json({
        success: true,
        message: "Delete answer successfully",
        answer: updatedAnswer,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  
module.exports = router;

  