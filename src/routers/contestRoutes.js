const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/requireAuth");
const dotenv = require("dotenv");
const { ROLES, STATUS } = require("../models/enum");
dotenv.config({ path: "./.env" });
const Contest = require("../models/Contest")
const { formatTimeUTC_, formatTimeUTC } = require("../utils/Timezone");


//@route GET v1/contests/
//@desc get all contests
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
//@desc get all contest
//@access private
//@role admin/creator
router.get("", verifyToken, async (req, res) => {
  try {
    //Check permission
    if (
      !(
        req.body.verifyAccount.role === ROLES.ADMIN ||
        req.body.verifyAccount.role === ROLES.CREATOR ||
        req.body.verifyAccount.role === ROLES.USER
      )
    ) {
      return res
        .status(401)
        .json({ success: false, message: "Permission denied" });
    }

    const contests = await Contest.find({_status: STATUS.OK});
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
router.get("/:contestId", verifyToken, async (req, res) => {
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

    const contest = await Contest.findById(req.params.contestId).populate("tests");
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
router.get("/:contestId/tests", verifyToken, async (req, res) => {
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

//TODO: Get all tests of  a test by testId for isHidden = false OR true

//@route Test v1/contest
//@desc Create a contest
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

    //Create new contest
    let contest = new Contest({

      name: req.body.name,
      creatorId: req.body.creatorId,
      description: req.body.description,
      tests: req.body.tests, // can null
      startTime: formatTimeUTC_(req.body.startTime),
      endTime: formatTimeUTC_(req.body.endTime),
      url: req.body.url,
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
router.put("/:contestId/tests", verifyToken, async (req, res) => {
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

    //update new contest
    let contest = await Contest.findByIdAndUpdate(req.params.contestId,
      {
        tests: req.body.tests, updatedAt: formatTimeUTC()
      },
      { new: true })
      .populate("tests")
      .exec();

    res.json({
      success: true,
      message: "Test updated successfully",
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
router.put("/:contestId", verifyToken, async (req, res) => {
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
    let contest;
    contest = {
      name: req.body.name,
      creatorId: req.body.creatorId,
      description: req.body.description,
      tests: req.body.tests, // can null
      startTime: formatTimeUTC_(req.body.startTime),
      endTime: formatTimeUTC_(req.body.endTime),
      url: req.body.url,
      isHidden: false,
      embededMedia: req.body.embededMedia,
      updatedAt: formatTimeUTC()
    };

    const updatedContest = await Contest.findByIdAndUpdate(
      req.params.contestId,
      contest,
      { new: true }
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


//@route PUT v1/contests/:contestId/delete
//@desc Delete a contest by contest Id
//@access private
//@role admin/creator
router.put("/:contestId/delete", verifyToken, async (req, res) => {
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

    const deletedContest = await Contest.findByIdAndUpdate(
      req.params.contestId,
      {
        _status: STATUS.ARCHIVED,
        updatedAt: formatTimeUTC()
      },
      { new: true }
    );
    res.json({
      success: true,
      message: "Delete contest successfully",
      contest: deletedContest,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});


module.exports = router;
