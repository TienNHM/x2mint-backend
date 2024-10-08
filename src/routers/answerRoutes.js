const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/requireAuth");
const dotenv = require("dotenv");
const { ROLES, STATUS } = require("../utils/enum");
dotenv.config({ path: "./.env" });
const Answer = require("../models/Answer");
const Question = require("../models/Question");
const { formatTimeUTC } = require("../utils/Timezone")

//@route Post v1/answers  
//@desc Create a answer
//@access private
//@role admin/creator
router.post("", verifyToken, async(req, res) => {
    // #swagger.tags = ['answers']
    // #swagger.security = [{ "bearerAuth": [] }] 
    // #swagger.summary = 'Create a answer'

    try {
        //Check permission

        if (!(
                req.body.verifyAccount.role === ROLES.ADMIN ||
                req.body.verifyAccount.role === ROLES.CREATOR
            )) {
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
            content: req.body.content,
            _status: req.body._status
        });

        //Send to Database
        answer = await answer.save();

        // Update: add answer into question
        let question = await Question.findById(req.body.questionId);

        if (question) {
            question.answers.push(answer.id.toString());
            question = await Question.findByIdAndUpdate(question.id, question, { new: true })
                .populate("answers")
                .exec();
        }

        res.json({
            success: true,
            message: "Answer created successfully",
            answer: answer,
            question: question
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
router.get("", verifyToken, async(req, res) => {
    // #swagger.tags = ['answers']
    // #swagger.security = [{ "bearerAuth": [] }] 
    // #swagger.summary = 'Get all answers'

    try {
        //Check permission
        if (!(req.body.verifyAccount.role === ROLES.ADMIN ||
                req.body.verifyAccount.role === ROLES.CREATOR)) {
            return res
                .status(401)
                .json({ success: false, message: "Permission denied" });
        }

        const answers = await Answer.find();
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
router.get("/:answerId", verifyToken, async(req, res) => {
    // #swagger.tags = ['answers']
    // #swagger.security = [{ "bearerAuth": [] }] 
    // #swagger.summary = 'Get answer by id'

    try {
        //Check permission
        if (!(req.body.verifyAccount.role === ROLES.ADMIN ||
                req.body.verifyAccount.role === ROLES.CREATOR ||
                req.body.verifyAccount.role === ROLES.USER)) {
            return res
                .status(401)
                .json({ success: false, message: "Permission denied" });
        }

        const answer = await Answer.findById(req.params.answerId);
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

//@route PUT v1/answers/:answerId
//@desc Update a answers by answer Id
//@access private
//@role admin/creator
router.put("/:answerId", verifyToken, async(req, res) => {
    // #swagger.tags = ['answers']
    // #swagger.security = [{ "bearerAuth": [] }] 
    // #swagger.summary = 'Update a answer by id'

    try {
        //Check permission
        if (!(req.body.verifyAccount.role === ROLES.ADMIN ||
                req.body.verifyAccount.role === ROLES.CREATOR)) {
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
            _status: req.body._status,
            updatedAt: new Date() // formatTimeUTC(),
        };

        const updatedAnswer = await Answer.findByIdAndUpdate(
            req.params.answerId,
            answer, { new: true }
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
router.put("/:answerId/delete", verifyToken, async(req, res) => {
    // #swagger.tags = ['answers']
    // #swagger.security = [{ "bearerAuth": [] }] 
    // #swagger.summary = 'Delete a answer by id'

    try {
        //Check permission
        if (!(req.body.verifyAccount.role === ROLES.ADMIN ||
                req.body.verifyAccount.role === ROLES.CREATOR)) {
            return res
                .status(401)
                .json({ success: false, message: "Permission denied" });
        }

        if (!req.body)
            res.status(400).json({
                success: false,
                message: "Body request not found",
            });

        const updatedAnswer = await Answer.findOneAndUpdate({ _id: req.params.answerId }, { _status: STATUS.DELETED });
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