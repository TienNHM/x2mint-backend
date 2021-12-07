const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Test = require("../models/Test");
const TakeTest = require("../models/TakeTest");

const verifyToken = require("../middleware/requireAuth");
const dotenv = require("dotenv");
const { ROLES } = require("../models/enum");

//@route GET v1/submit/:takeTestId
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

/**
 * Tính điểm mà user đạt được cho mỗi câu hỏi
 * @param {*} choose đối tương lưu answers mà user chọn tương ứng với question
 * @returns số điểm mà user đạt được cho câu hỏi tương ứng
 */
const calcPoints = (choose) => {
  const answers = choose.answers
  const correctAnswers = choose.question.correctAnswers

  // Nếu chọn nhiều hoặc ít hơn số đáp án đúng, thì chắc chắn không có điểm
  if (answers.length !== correctAnswers.length) {
    return 0
  }

  const maxPoints = choose.question.maxPoints
  const num = answers.filter(c => correctAnswers.includes(c)).length
  return num === correctAnswers.length ? maxPoints : 0
}

/**
 * Tính tổng điểm cho bài thi của user
 * @param {*} chooseAnswers danh sách các câu trả lời của user
 * @returns số điểm mà user đạt được cho bài thi
 */
const calcTestPoints = (chooseAnswers) => {
  let points = 0
  let isCorrect = []
  for (let i = 0; i < chooseAnswers.length; i++) {
    const p = calcPoints(chooseAnswers[i])
    points += p
    isCorrect.push(p > 0)
  }

  return {
    points: points, 
    isCorrect: isCorrect
  }
}

//@route Post v1/submit/new
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
      points: 0,
      status: req.body.status,
      questionsOrder: req.body.questionsOrder,
    });

    //Send to Database
    take_test = await take_test.save();

    // // populate để lấy dữ liệu các trường tương ứng
    let tmp = await TakeTest.findById(take_test._id)
      .populate({
        path: 'chooseAnswers',
        populate: {
          path: 'question',
          select: "-__v -createdAt -updatedAt"
        }
      })
      .exec();

    const {points, isCorrect} = calcTestPoints(tmp.chooseAnswers);

    // // lưu lại bài take test kềm theo điểm số
    await TakeTest.findByIdAndUpdate(take_test._id,
      {
        points: points,
        isCorrect: isCorrect
      }
    );

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

//@route GET v1/submit/user/:userId
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
