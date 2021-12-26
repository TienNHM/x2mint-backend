const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Test = require("../models/Test");
const TakeTest = require("../models/TakeTest");

const verifyToken = require("../middleware/requireAuth");
const dotenv = require("dotenv");
const { ROLES } = require("../models/enum");
const { STATUS } = require("../models/enum");
const { formatTimeUTC } = require("../utils/Timezone");
const TakeTestLogs = require("../models/TakeTestLogs");

//@route GET v1/takeTest/:takeTestId
//@desc get take test by id
//@access private
//@role admin/creator/user
router.get("/:takeTestId", verifyToken, async (req, res) => {
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

    const takeTest = await TakeTest.findById(req.params.takeTestId)
      .populate({
        path: 'test',
        select: "-__v -createdAt -updatedAt"
      })
      .populate({
        path: 'user',
        select: "-__v -createdAt -updatedAt -password"
      })
      .populate({
        path: 'chooseAnswers',
        populate: {
          path: 'question',
          select: "-__v -createdAt -updatedAt"
        }
      })
      .exec();

    if (takeTest) {
      res.json({
        success: true,
        message: "Get take test by id successfully ",
        data: takeTest,
      });
    } else {
      res.json({
        success: false,
        message: "Take test does not exist",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

//@route GET v1/takeTest/:takeTestId/logs
//@desc get take test logs by id
//@access private
//@role admin/creator/user
router.get("/:takeTestId/logs", verifyToken, async (req, res) => {
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

    const takeTestLogs = await TakeTestLogs.findOne({
      takeTest: req.params.takeTestId
    })
      .populate({
        path: 'test',
        select: "-__v -createdAt -updatedAt"
      })
      .populate({
        path: 'user',
        select: "-__v -createdAt -updatedAt -password"
      })
      .exec();

    if (takeTestLogs) {
      res.json({
        success: true,
        message: "Get take test logs by id successfully ",
        data: takeTestLogs,
      });
    } else {
      res.json({
        success: false,
        message: "Take test logs does not exist",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

/**
 * Tính điểm mà user đạt được cho mỗi câu hỏi
 * @param {*} choose đối tương lưu answers mà user chọn tương ứng với question
 * @returns số điểm mà user đạt được cho câu hỏi tương ứng
 */
const isCorrectAnswer = (choose) => {
  const answers = choose.answers
  const correctAnswers = choose.question.correctAnswers

  // Nếu chọn nhiều hoặc ít hơn số đáp án đúng, thì chắc chắn không có điểm
  if (answers.length !== correctAnswers.length) {
    return 0
  }

  const num = answers.filter(c => correctAnswers.includes(c)).length
  return num === correctAnswers.length ? 1 : 0
}

/**
 * Tính tổng điểm cho bài thi của user
 * @param {*} chooseAnswers danh sách các câu trả lời của user
 * @returns số điểm mà user đạt được cho bài thi
 */
const calcTestPoints = (chooseAnswers, maxPoints) => {
  let isCorrect = []
  for (let i = 0; i < chooseAnswers.length; i++) {
    const p = isCorrectAnswer(chooseAnswers[i])
    isCorrect.push(p > 0)
  }

  const numCorrectAnswers = isCorrect.filter(Boolean).length

  return {
    points: numCorrectAnswers*(maxPoints/chooseAnswers.length),
    isCorrect: isCorrect,
    isPassed: numCorrectAnswers >= chooseAnswers.length/2
  }
}

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

    //Create new
    let take_test = new TakeTest({
      test: req.body.test,
      user: req.body.user,
      chooseAnswers: req.body.chooseAnswers,
      points: 0,
      _status: req.body._status,
      questionsOrder: req.body.questionsOrder,
    });

    //Send to Database
    take_test = await take_test.save();

    //Populate để lấy dữ liệu các trường tương ứng
    let tmp = await TakeTest.findById(take_test._id)
      .populate({
        path: 'chooseAnswers',
        populate: {
          path: 'question',
          select: "-__v -createdAt -updatedAt"
        }
      })
      .exec();

    let take_test_logs = new TakeTestLogs({
      test: req.body.test,
      user: req.body.user,
      takeTest: take_test._id,
      logs: [
        {
          action: 'Tham gia làm bài'
        }
      ],
      status: 'Ok'
    })

    take_test_logs = await take_test_logs.save();
    // console.log(take_test_logs)

    res.json({
      success: true,
      message: "Take test created successfully",
      takeTestId: take_test._id,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

//@route PUT v1/takeTest/:takeTestId
//@desc Update takeTest
//@access private
//@role admin/creator/user
router.put("/:takeTestId", verifyToken, async (req, res) => {
  try {
    //Check permission
    if (!req.body)
      res.status(400).json({
        success: false,
        message: "Body request not found",
      });

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

    let takeTest = {
      test: req.body.test,
      questionsOrder: req.body.questionsOrder,
      chooseAnswers: req.body.chooseAnswers,
      updatedAt: formatTimeUTC(),
      _status: req.body._status
    };

    const updateTakeTest = await TakeTest.findByIdAndUpdate(
      req.params.takeTestId,
      takeTest,
      { new: true }
    );

    // Update: add logs
    let takeTestLogs = await TakeTestLogs.findOne({
      takeTest: req.params.takeTestId
    })
    if (takeTestLogs) {
      takeTestLogs.logs.push({
        action: req.body.action
      });
      takeTestLogs = await TakeTestLogs.findByIdAndUpdate(takeTestLogs.id, takeTestLogs, { new: true })
    }

    res.json({
      success: true,
      message: "Update takeTest successfully",
      takeTest: updateTakeTest,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

//@route PUT v1/takeTest/:takeTestId/submit
//@desc Submit takeTest
//@access private
//@role admin/creator/user
router.put("/:takeTestId/submit", verifyToken, async (req, res) => {
  try {
    //Check permission
    if (!req.body)
      res.status(400).json({
        success: false,
        message: "Body request not found",
      });

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

    const takeTest = await TakeTest.findById(req.params.takeTestId)
      .populate("test")
      .populate({
        path: "chooseAnswers",
        populate: {
          path: "question"
        }
      }).exec();

    const { points, isCorrect, isPassed } = calcTestPoints(
      takeTest.chooseAnswers,
      takeTest.test.maxPoints
    );

    let newTakeTest = {
      points: points,
      isCorrect: isCorrect,
      updatedAt: formatTimeUTC(),
      submitTime: req.body.endTime,
      _status: isPassed ? STATUS.PASSED : STATUS.FAILED
    };

    const updateTakeTest = await TakeTest.findByIdAndUpdate(
      req.params.takeTestId,
      newTakeTest,
      { new: true }
    )

    // Update: add logs
    let takeTestLogs = await TakeTestLogs.findOne({
      takeTest: req.params.takeTestId
    })
    if (takeTestLogs) {
      takeTestLogs.logs.push({
        action: 'Submit'
      });
      takeTestLogs = await TakeTestLogs.findByIdAndUpdate(takeTestLogs.id, takeTestLogs, { new: true })
    }

    res.json({
      success: true,
      message: "Update takeTest successfully",
      takeTest: updateTakeTest,
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
      .populate({
        path: 'test',
        select: "-__v -createdAt -updatedAt",
      })
      .populate({
        path: 'user',
        select: "-__v -createdAt -updatedAt",
      })
      .populate({
        path: 'chooseAnswers',
        populate: {
          path: 'question',
          select: "-__v -createdAt -updatedAt"
        }
      })
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
      .populate({
        path: 'test',
        select: "-__v -createdAt -updatedAt",
      })
      .populate({
        path: 'user',
        select: "-__v -createdAt -updatedAt",
      })
      .populate({
        path: 'chooseAnswers',
        populate: {
          path: 'question',
          select: "-__v -createdAt -updatedAt"
        }
      })
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
