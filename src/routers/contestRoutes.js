const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/requireAuth");
const dotenv = require("dotenv");
const { ROLES, STATUS, COLLECTION } = require("../utils/enum");
dotenv.config({ path: "./.env" });
const Contest = require("../models/Contest")
const TakeTest = require("../models/TakeTest")
const { formatTimeUTC_, formatTimeUTC } = require("../utils/Timezone");
const TextUtils = require("../utils/TextUtils");

//@route GET v1/contests/
//@desc get all contests
//@access private
//@role admin/creator
router.get("/creator/:creatorId", verifyToken, async(req, res) => {
    // #swagger.tags = ['contests']
    // #swagger.security = [{ "bearerAuth": [] }] 
    // #swagger.summary = 'Get all contests by creatorId'

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

        const contests = await Contest.find({ creatorId: req.params.creatorId });
        if (contests) {
            res.json({
                success: true,
                message: "Get all contest successfully ",
                contests,
            });
        } else {
            res.json({
                success: false,
                message: "Contests do not exist",
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

//@route GET v1/contests/
//@desc USER get all contest
//@access private
//@role user
router.get("", verifyToken, async(req, res) => {
    // #swagger.tags = ['contests']
    // #swagger.security = [{ "bearerAuth": [] }] 
    // #swagger.summary = 'Get all contests for user'

    try {
        //Check permission
        if (!(
                req.body.verifyAccount.role === ROLES.ADMIN ||
                req.body.verifyAccount.role === ROLES.CREATOR ||
                req.body.verifyAccount.role === ROLES.USER
            )) {
            return res
                .status(401)
                .json({ success: false, message: "Permission denied" });
        }

        const contests = await Contest.find({ _status: STATUS.OK });
        if (contests) {
            res.json({
                success: true,
                message: "Get all contest successfully ",
                contests,
            });
        } else {
            res.json({
                success: false,
                message: "Contests do not exist",
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

//@route GET v1/contests/all
//@desc ADMIN get all contest
//@access private
//@role admin
router.get("/all", verifyToken, async(req, res) => {
    // #swagger.tags = ['contests']
    // #swagger.security = [{ "bearerAuth": [] }] 
    // #swagger.summary = 'Get all contests for admin'

    try {
        //Check permission
        if (!(
                req.body.verifyAccount.role === ROLES.ADMIN
            )) {
            return res
                .status(401)
                .json({ success: false, message: "Permission denied" });
        }

        const contests = await Contest.find();
        if (contests) {
            res.json({
                success: true,
                message: "Get all contest successfully ",
                contests,
            });
        } else {
            res.json({
                success: false,
                message: "Contests do not exist",
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

//@route GET v1/contests/:contestId
//@desc get answers by id
//@access private
//@role admin/creator/user
router.get("/:contestIdOrUrl", verifyToken, async(req, res) => {
    // #swagger.tags = ['contests']
    // #swagger.security = [{ "bearerAuth": [] }] 
    // #swagger.summary = 'Get contest by id or url'

    try {
        //Check permission
        if (!(req.body.verifyAccount.role === ROLES.ADMIN ||
                req.body.verifyAccount.role === ROLES.CREATOR ||
                req.body.verifyAccount.role === ROLES.USER)) {
            return res
                .status(401)
                .json({ success: false, message: "Permission denied" });
        }

        var contest = null;
        try {
            contest = await Contest.findById(req.params.contestIdOrUrl).populate("tests");
        } catch {
            const url = `/${COLLECTION.CONTEST}/${req.params.contestIdOrUrl}`
            contest = await Contest.findOne({ url }).populate("tests");
        }

        if (contest) {
            res.json({
                success: true,
                message: "Get contest by id successfully ",
                data: contest,
            });
        } else {
            res.json({
                success: false,
                message: "Contest does not exist",
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

//@route GET v1/contests/:contestId/tests
//@desc get all tests of the contest
//@access private
//@role admin/creator
router.get("/:contestId/tests", verifyToken, async(req, res) => {
    // #swagger.tags = ['contests']
    // #swagger.security = [{ "bearerAuth": [] }] 
    // #swagger.summary = 'Get all tests by contest id for admin/creator'

    try {
        const contest = await Contest.findById(req.params.contestId).populate(
            "tests"
        );
        if (contest) {
            res.json({
                success: true,
                message: "Get all tests by contest id successfully ",
                tests: contest.tests,
            });
        } else {
            res.json({
                success: false,
                message: "Tests does not exist",
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Get All TakeTests by ContestId for Creator/Admin
const getAllTakeTestsInContest = async(tests) => {
    // #swagger.tags = ['contests']
    // #swagger.security = [{ "bearerAuth": [] }] 
    // #swagger.summary = 'Get all takeTests by contest id for admin/creator'

    var takeTests = []

    for (let testId of tests) {
        const t = await TakeTest.find({ test: testId })
            .populate("test")
            .populate("user")
            .then(data => data)

        takeTests = takeTests.concat(t);
    }

    return takeTests
}

//@route GET v1/contests/:contestId/taketests
//@desc get all taketests of the contest
//@access private
//@role admin/creator
router.get("/:contestId/taketests", verifyToken, async(req, res) => {
    // #swagger.tags = ['contests']
    // #swagger.security = [{ "bearerAuth": [] }] 
    // #swagger.summary = 'Get all takeTests by contest id for admin/creator'

    try {
        if (!(
                req.body.verifyAccount.role === ROLES.CREATOR ||
                req.body.verifyAccount.role === ROLES.ADMIN
            )) {
            return res
                .status(401)
                .json({ success: false, message: "Permission denied" });
        }

        const contest = await Contest.findById(req.params.contestId);
        const takeTests = await getAllTakeTestsInContest(contest.tests)

        if (contest) {
            res.json({
                success: true,
                message: "Get all takeTests by contest id successfully ",
                takeTests: takeTests,
            });
        } else {
            res.json({
                success: false,
                message: "Tests does not exist",
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

//TODO: Get all tests of  a test by testId for isHidden = false OR true

//@route Test v1/contest
//@desc Create a contest
//@access private
//@role admin/creator
router.post("", verifyToken, async(req, res) => {
    // #swagger.tags = ['contests']
    // #swagger.security = [{ "bearerAuth": [] }] 
    // #swagger.summary = 'Create a contest by admin/creator'

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

        //Create new contest
        let contest = new Contest({
            name: req.body.name,
            creatorId: req.body.creatorId,
            description: req.body.description,
            tests: req.body.tests, // can null
            startTime: new Date(req.body.startTime), //formatTimeUTC_(req.body.startTime),
            endTime: new Date(req.body.endTime), //formatTimeUTC_(req.body.endTime),
            url: TextUtils.makeSlug(COLLECTION.CONTEST, req.body.name),
            embededMedia: req.body.embededMedia,
            isHidden: false
        });

        //Send to Database
        contest = await contest.save();


        res.json({
            success: true,
            message: "Contest created successfully",
            contest: contest,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

//@route Test v1/contests/:contestId/tests
//@desc update/create new tests for contest
//@access private
//@role admin/creator
router.put("/:contestId/tests", verifyToken, async(req, res) => {
    // #swagger.tags = ['contests']
    // #swagger.security = [{ "bearerAuth": [] }] 
    // #swagger.summary = 'Update/create new tests for contest by admin/creator'

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

        //update new contest
        let contest = await Contest.findByIdAndUpdate(req.params.contestId, {
                tests: req.body.tests,
                updatedAt: formatTimeUTC()
            }, { new: true })
            .populate("tests")
            .exec();

        res.json({
            success: true,
            message: "Contest updated successfully",
            contest: contest,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

//@route PUT v1/contests/:contestId
//@desc Update a contest by contest Id
//@access private
//@role admin/creator
router.put("/:contestId", verifyToken, async(req, res) => {
    // #swagger.tags = ['contests']
    // #swagger.security = [{ "bearerAuth": [] }] 
    // #swagger.summary = 'Update a contest by contest id for admin/creator'

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

        let contest = {
            name: req.body.name,
            creatorId: req.body.creatorId,
            description: req.body.description,
            tests: req.body.tests, // can null
            startTime: new Date(req.body.startTime), //formatTimeUTC_(req.body.startTime),
            endTime: new Date(req.body.endTime), //formatTimeUTC_(req.body.endTime),
            isHidden: false,
            embededMedia: req.body.embededMedia,
            updatedAt: new Date(), // formatTimeUTC(),
            _status: req.body._status
        };

        if (req.body.url) {
            contest.url = TextUtils.makeSlug(COLLECTION.CONTEST, req.body.url, false)
        } else {
            const { url: oldUrl } = await Contest.findById(req.params.contestId).select("url").exec();
            contest.url = oldUrl;
        }

        const updatedContest = await Contest.findByIdAndUpdate(
            req.params.contestId,
            contest, { new: true }
        ).populate("tests").exec();

        res.json({
            success: true,
            message: "Update contest successfully",
            contest: updatedContest,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

//@route PUT v1/contests/:contestId/archive
//@desc Archive a contest by contest Id
//@access private
//@role admin/creator
router.put("/:contestId/archive", verifyToken, async(req, res) => {
    // #swagger.tags = ['contests']
    // #swagger.security = [{ "bearerAuth": [] }] 
    // #swagger.summary = 'Archive a contest by contest id for admin/creator'

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

        const deletedContest = await Contest.findByIdAndUpdate(
                req.params.contestId, {
                    _status: STATUS.ARCHIVED,
                    updatedAt: new Date(), // formatTimeUTC()
                }, { new: true }
            )
            .populate("tests").exec();

        res.json({
            success: true,
            message: "Archive contest successfully",
            contest: deletedContest,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

module.exports = router;