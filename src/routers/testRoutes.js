const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/requireAuth");
const dotenv = require("dotenv");
const Test = require("../models/Test");
const { ROLES, STATUS, COLLECTION } = require("../utils/enum");
const { formatTimeUTC_, formatTimeUTC } = require("../utils/Timezone");
const TextUtils = require("../utils/TextUtils");
dotenv.config({ path: "./.env" });

//@route GET v1/tests/creator/:creatorId
//@desc get all test
//@access private
//@role admin/creator
router.get("/creator/:creatorId", verifyToken, async (req, res) => {
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

        const tests = await Test.find({ creatorId: req.params.creatorId });
        if (tests) {
            res.json({
                success: true,
                message: "Get all test successfully ",
                tests,
            });
        } else {
            res.json({
                success: false,
                message: "Tests do not exist",
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

//@route GET v1/tests/
//@desc get all test
//@access private
//@role admin/creator
router.get("", verifyToken, async (req, res) => {
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

        const tests = await Test.find();
        if (tests) {
            res.json({
                success: true,
                message: "Get all test successfully ",
                tests,
            });
        } else {
            res.json({
                success: false,
                message: "Tests do not exist",
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

//@route GET v1/tests/:testId
//@desc get test by id
//@access private
//@role admin/creator/user
router.get("/:testId", verifyToken, async (req, res) => {
    try {
        //Check permission
        if (
            !(req.body.verifyAccount.role === ROLES.ADMIN ||
                req.body.verifyAccount.role === ROLES.CREATOR ||
                req.body.verifyAccount.role === ROLES.USER)
        ) {
            return res
                .status(401)
                .json({ success: false, message: "Permission denied" });
        }

        let test = null
        if (req.body.verifyAccount.role === ROLES.USER) {
            test = await Test.findById(req.params.testId)
                .populate({
                    path: 'questions',
                    select: "-__v -createdAt -updatedAt -correctAnswers",
                    populate: {
                        path: 'answers',
                        select: "-__v -createdAt -updatedAt"
                    }
                })
                .exec();
        }
        else {
            test = await Test.findById(req.params.testId)
                .populate({
                    path: 'questions',
                    select: "-__v -createdAt -updatedAt",
                    populate: {
                        path: 'answers',
                        select: "-__v -createdAt -updatedAt"
                    }
                })
                .exec();
        }

        if (test) {
            res.json({
                success: true,
                message: "Get test by id successfully ",
                data: test,
            });
        } else {
            res.json({
                success: false,
                message: "Test does not exist",
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

//TODO: Get all tests of  a test by testId for isHidden = false OR true

//@route Test v1/tests/new
//@desc Create a test
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
        let test = new Test({
            name: req.body.name,
            creatorId: req.body.creatorId,
            description: req.body.description,
            pin: req.body.pin,
            questions: req.body.questions, // can null
            questionsOrder: req.body.questionsOrder,
            startTime: new Date(req.body.startTime), // formatTimeUTC_(req.body.startTime),
            endTime: new Date(req.body.endTime), // formatTimeUTC_(req.body.endTime),
            url: TextUtils.makeSlug(COLLECTION.CONTEST, req.body.name),
            maxPoints: req.body.maxPoints,
            maxTimes: req.body.maxTimes,
            _status: req.body._status,
            questionsOrder: req.body.questionsOrder,
        });

        //Send to Database
        test = await test.save();

        res.json({
            success: true,
            message: "Test created successfully",
            test: test,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

//@route Test v1/tests/question
//@desc update/create new questions for test
//@access private
//@role admin/creator
router.put("/:testId/questions", verifyToken, async (req, res) => {
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

        //update new question
        let test = await Test.findByIdAndUpdate(req.params.testId,
            {
                questions: req.body.questions,
                questionsOrder: req.body.questionsOrder,
                updatedAt: new Date()// formatTimeUTC(),
            },
            { new: true }
        );

        res.json({
            success: true,
            message: "Test updated successfully",
            test: test,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

//@route PUT v1/tests/:testId
//@desc Update a test by test Id
//@access private
//@role admin/creator
router.put("/:testId", verifyToken, async (req, res) => {
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
        let test;
        test = {
            name: req.body.name,
            creatorId: req.body.creatorId,
            description: req.body.description,
            questions: req.body.questions,
            pin: req.body.pin,
            startTime: new Date(req.body.startTime), // formatTimeUTC_(req.body.startTime),
            endTime: new Date(req.body.endTime), //formatTimeUTC_(req.body.endTime),
            url: TextUtils.makeSlug(COLLECTION.CONTEST, req.body.name),
            maxPoints: req.body.maxPoints,
            maxTimes: req.body.maxTimes,
            _status: req.body._status,
            questionsOrder: req.body.questionsOrder,
            updatedAt: new Date(), //formatTimeUTC(),
        };

        const updatedTest = await Test.findOneAndUpdate(
            { _id: req.params.testId },
            test,
            { new: true }
        ).populate("questions")
            .populate({
                path: "questions",
                populate: {
                    path: "answers"
                }
            })
            .exec();

        res.json({
            success: true,
            message: "Update test successfully",
            test: updatedTest,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

//@route PUT v1/tests/:testId/delete
//@desc Delete a test by test Id
//@access private
//@role admin/creator
router.put("/:testId/delete", verifyToken, async (req, res) => {
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

        const deletedTest = await Test.findOneAndUpdate(
            req.params.testId,
            {
                _status: STATUS.DELETED,
                updatedAt: new Date(), // formatTimeUTC_(new Date())
            },
            { new: true }
        );
        res.json({
            success: true,
            message: "Delete test successfully",
            test: deletedTest,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

module.exports = router;
