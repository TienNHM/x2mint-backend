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
        message: "Get take testby id successfully ",
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
  const maxPoints = choose.question.maxPoints

  const num = answers.filter(c => correctAnswers.includes(c)).length

  // Cách tính 1
  // const correct = num / correctAnswers.length
  // const fail = (choose.length - num) / correctAnswers.length
  // return maxPoints * (correct - fail)

  // Cách tính 2: Chỉ tính nếu các đáp án đã chọn trùng khớp hoàn toàn với đáp án đúng
  return num * 2 === (correctAnswers.length + answers.length) ? maxPoints : 0
}

/**
 * Tính tổng điểm cho bài thi của user
 * @param {*} chooseAnswers danh sách các câu trả lời của user
 * @returns số điểm mà user đạt được cho bài thi
 */
const calcTestPoints = (chooseAnswers) => {
  let points = 0
  for (let i = 0; i < chooseAnswers.length; i++) {
    points += calcPoints(chooseAnswers[i])
  }

  return points
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

    // populate để lấy dữ liệu các trường tương ứng
    let tmp = {...take_test}
    await TakeTest.populate(take_test, [
      "test",
      "user",
      "chooseAnswers.question",
    ]);

    // tính điểm đạt được
    const points = calcTestPoints(tmp.chooseAnswers)
    take_test = {
      ...take_test,
      points: points
    }

    // lưu lại bài take test kềm theo điểm số
    await TakeTest.findOneAndUpdate(
      { _id: take_test._id },
      take_test,
      { new: true }
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
